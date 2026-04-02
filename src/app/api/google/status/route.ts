import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ connected: false, error: "service_key_missing" });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false, error: "not_authenticated" });
    }

    const serviceClient = createServiceClient();
    const { data: appUser } = await serviceClient
      .from("users")
      .select("org_id")
      .eq("auth_uid", user.id)
      .single();

    if (!appUser) {
      return NextResponse.json({ connected: false, error: "no_user" });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tokenInfo } = await (serviceClient as any)
      .from("google_tokens")
      .select("google_email, created_at, updated_at")
      .eq("org_id", appUser.org_id)
      .single();

    if (!tokenInfo) {
      return NextResponse.json({ connected: false, org_id: appUser.org_id });
    }

    return NextResponse.json({
      connected: true,
      org_id: appUser.org_id,
      google_email: tokenInfo.google_email,
      created_at: tokenInfo.created_at,
    });
  } catch (err) {
    console.error("Status check error:", err);
    return NextResponse.json({ connected: false, error: "internal_error" });
  }
}
