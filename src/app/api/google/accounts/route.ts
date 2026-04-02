import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import { listAccounts, listLocations, type GbpLocation } from "@/lib/google/gbp-client";

async function getAuthForOrg(orgId: string) {
  const sc = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tokenRow, error } = await (sc as any)
    .from("google_tokens")
    .select("access_token, refresh_token")
    .eq("org_id", orgId)
    .single();

  if (error || !tokenRow) throw new Error("Google account not connected");
  return createAuthenticatedClient(tokenRow.access_token, tokenRow.refresh_token);
}

function formatAddress(loc: GbpLocation): string {
  const addr = loc.storefrontAddress;
  if (!addr) return "";
  return [
    ...(addr.addressLines || []),
    addr.locality,
    addr.administrativeArea,
    addr.postalCode,
  ].filter(Boolean).join(" ");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const accountName = searchParams.get("account");
    const autoImport = searchParams.get("import") === "true";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sc = createServiceClient();
    const { data: appUser } = await sc
      .from("users")
      .select("org_id")
      .eq("auth_uid", user.id)
      .single();

    if (!appUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const auth = await getAuthForOrg(appUser.org_id);

    if (action === "locations" && accountName) {
      const gbpLocations = await listLocations(auth, accountName);

      // Auto-import: create client + locations in DB and link to GBP
      if (autoImport && gbpLocations.length > 0) {
        // Ensure a default client exists
        const { data: existingClients } = await sc
          .from("clients")
          .select("id")
          .eq("org_id", appUser.org_id)
          .limit(1);

        let clientId: string;
        if (existingClients && existingClients.length > 0) {
          clientId = existingClients[0].id;
        } else {
          const { data: newClient } = await sc
            .from("clients")
            .insert({ org_id: appUser.org_id, company_name: "GBPインポート" })
            .select("id")
            .single();
          clientId = newClient!.id;
        }

        const imported: string[] = [];
        for (const loc of gbpLocations) {
          // Check if already linked
          const { data: existing } = await sc
            .from("locations")
            .select("id")
            .eq("gbp_location_name", loc.name)
            .limit(1);

          if (existing && existing.length > 0) continue;

          const address = formatAddress(loc);
          const { error: insertErr } = await sc.from("locations").insert({
            client_id: clientId,
            name: loc.title,
            address: address || "住所未設定",
            category: loc.categories?.primaryCategory?.displayName || null,
            phone: loc.phoneNumbers?.primaryPhone || null,
            gbp_account_id: accountName,
            gbp_location_name: loc.name,
            gbp_place_id: loc.metadata?.placeId || null,
          });

          if (!insertErr) imported.push(loc.title);
        }

        return NextResponse.json({
          locations: gbpLocations,
          imported,
          message: imported.length > 0
            ? `${imported.length} 件のロケーションをインポートしました`
            : "新しいロケーションはありませんでした",
        });
      }

      return NextResponse.json({ locations: gbpLocations });
    }

    const accounts = await listAccounts(auth);
    return NextResponse.json({ accounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GBP accounts error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
