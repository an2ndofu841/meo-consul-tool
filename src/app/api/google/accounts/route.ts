import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import { listAccounts, listLocations, type GbpLocation } from "@/lib/google/gbp-client";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

async function getCachedData(sc: ReturnType<typeof createServiceClient>, orgId: string, cacheType: string, cacheKey: string) {
  const { data } = await sc
    .from("gbp_cache")
    .select("data, fetched_at")
    .eq("org_id", orgId)
    .eq("cache_type", cacheType)
    .eq("cache_key", cacheKey)
    .single();

  if (!data) return null;

  const age = Date.now() - new Date(data.fetched_at).getTime();
  if (age > CACHE_TTL_MS) return null;

  return data.data;
}

async function setCachedData(sc: ReturnType<typeof createServiceClient>, orgId: string, cacheType: string, cacheKey: string, data: unknown) {
  await sc.from("gbp_cache").upsert(
    {
      org_id: orgId,
      cache_type: cacheType,
      cache_key: cacheKey,
      data: data as never,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "org_id,cache_type,cache_key" }
  );
}

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes("Quota exceeded") || msg.includes("rateLimitExceeded");
      if (!isQuota || attempt === maxRetries) throw err;
      const waitMs = (attempt + 1) * 15000; // 15s, 30s, 45s
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const accountName = searchParams.get("account");
    const autoImport = searchParams.get("import") === "true";
    const forceRefresh = searchParams.get("refresh") === "true";

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

    // --- Locations ---
    if (action === "locations" && accountName) {
      if (!forceRefresh) {
        const cached = await getCachedData(sc, appUser.org_id, "locations", accountName);
        if (cached) {
          return NextResponse.json({
            locations: cached,
            fromCache: true,
            message: "キャッシュからロケーションを取得しました（更新する場合は「再取得」を押してください）",
          });
        }
      }

      const auth = await getAuthForOrg(appUser.org_id);
      const gbpLocations = await callWithRetry(() => listLocations(auth, accountName));

      await setCachedData(sc, appUser.org_id, "locations", accountName, gbpLocations);

      if (autoImport && gbpLocations.length > 0) {
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

    // --- Accounts ---
    if (!forceRefresh) {
      const cached = await getCachedData(sc, appUser.org_id, "accounts", "");
      if (cached) {
        return NextResponse.json({
          accounts: cached,
          fromCache: true,
          message: "キャッシュからアカウントを取得しました",
        });
      }
    }

    const auth = await getAuthForOrg(appUser.org_id);
    const accounts = await callWithRetry(() => listAccounts(auth));

    await setCachedData(sc, appUser.org_id, "accounts", "", accounts);

    return NextResponse.json({ accounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GBP accounts error:", message);

    if (message.includes("Quota exceeded") || message.includes("rateLimitExceeded")) {
      return NextResponse.json({
        error: "Google APIのレート制限に達しました（自動リトライ3回失敗）。数分後に再度お試しください。",
        quotaError: true,
        rawError: message,
        retryable: true,
      }, { status: 429 });
    }

    return NextResponse.json({ error: message, rawError: message }, { status: 500 });
  }
}
