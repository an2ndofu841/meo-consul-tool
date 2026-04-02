import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import { google } from "googleapis";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tokenRow } = await (sc as any)
      .from("google_tokens")
      .select("access_token, refresh_token, google_email, scopes")
      .eq("org_id", appUser.org_id)
      .single();

    if (!tokenRow) return NextResponse.json({ error: "Google not connected" }, { status: 400 });

    results.google_email = tokenRow.google_email;
    results.scopes = tokenRow.scopes;
    results.has_access_token = !!tokenRow.access_token;
    results.has_refresh_token = !!tokenRow.refresh_token;

    const auth = createAuthenticatedClient(tokenRow.access_token, tokenRow.refresh_token);

    // Test 1: accounts.list via client library
    try {
      const mybusiness = google.mybusinessaccountmanagement({ version: "v1", auth });
      const res = await mybusiness.accounts.list();
      results.accounts_api = { success: true, count: res.data.accounts?.length || 0, data: res.data };
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string; errors?: unknown; response?: { status?: number; statusText?: string; data?: unknown } };
      results.accounts_api = {
        success: false,
        code: e.code,
        message: e.message,
        errors: e.errors,
        responseStatus: e.response?.status,
        responseData: e.response?.data,
      };
    }

    // Test 2: Direct REST call to accounts.list
    try {
      const token = (await auth.getAccessToken()).token;
      const res = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json();
      results.accounts_rest = {
        status: res.status,
        statusText: res.statusText,
        body,
      };
    } catch (err: unknown) {
      results.accounts_rest = { error: err instanceof Error ? err.message : String(err) };
    }

    // Test 3: Try Business Profile API (locations via different endpoint)
    try {
      const token = (await auth.getAccessToken()).token;
      const res = await fetch(
        "https://mybusiness.googleapis.com/v4/accounts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json();
      results.v4_accounts = {
        status: res.status,
        statusText: res.statusText,
        body,
      };
    } catch (err: unknown) {
      results.v4_accounts = { error: err instanceof Error ? err.message : String(err) };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      results,
    }, { status: 500 });
  }
}
