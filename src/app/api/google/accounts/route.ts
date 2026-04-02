import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import { listAccounts, listLocations } from "@/lib/google/gbp-client";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const accountName = searchParams.get("account");

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
      const locations = await listLocations(auth, accountName);
      return NextResponse.json({ locations });
    }

    // Default: list accounts
    const accounts = await listAccounts(auth);
    return NextResponse.json({ accounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GBP accounts error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
