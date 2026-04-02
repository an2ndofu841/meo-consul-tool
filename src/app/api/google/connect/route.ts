import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meo-consul-tool.vercel.app";

  // Check Google credentials first
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=${encodeURIComponent("google_not_configured")}`
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
      console.error("Failed to query user:", queryError);
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=${encodeURIComponent("user_lookup_failed")}`
      );
    }

    if (!["agency_admin", "operator"].includes(appUser.role)) {
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=${encodeURIComponent("permission_denied")}`
      );
    }

    const state = JSON.stringify({ orgId: appUser.org_id, userId: user.id });
    const encodedState = Buffer.from(state).toString("base64url");
    const authUrl = getAuthUrl(encodedState);

    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("Google connect error:", err);
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=${encodeURIComponent("connect_failed")}`
    );
  }
}
