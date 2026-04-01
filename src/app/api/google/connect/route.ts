import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get org_id for state parameter
  const { data: appUser } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("auth_uid", user.id)
    .single<{ org_id: string; role: string }>();

  if (!appUser || !["agency_admin", "operator"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const state = JSON.stringify({ orgId: appUser.org_id, userId: user.id });
  const encodedState = Buffer.from(state).toString("base64url");
  const authUrl = getAuthUrl(encodedState);

  return NextResponse.redirect(authUrl);
}
