import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meo-consul-tool.vercel.app";

  const missing: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");

  if (missing.length > 0) {
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=${encodeURIComponent("env_missing:" + missing.join(","))}`
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    const serviceClient = createServiceClient();
    const { data: appUser, error: queryError } = await serviceClient
      .from("users")
      .select("org_id, role")
      .eq("auth_uid", user.id)
      .single();

    if (queryError || !appUser) {
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=${encodeURIComponent("user_lookup_failed:" + (queryError?.message || "no user found"))}`
      );
    }

    if (!["agency_admin", "operator"].includes(appUser.role)) {
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=${encodeURIComponent("permission_denied:role=" + appUser.role)}`
      );
    }

    const state = JSON.stringify({ orgId: appUser.org_id, userId: user.id });
    const encodedState = Buffer.from(state).toString("base64url");
    const authUrl = getAuthUrl(encodedState);

    return NextResponse.redirect(authUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Google connect error:", message);
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=${encodeURIComponent("connect_failed:" + message)}`
    );
  }
}
