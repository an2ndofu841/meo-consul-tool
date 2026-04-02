import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAuthUrl } from "@/lib/google/oauth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const { data: appUser, error: queryError } = await serviceClient
    .from("users")
    .select("org_id, role")
    .eq("auth_uid", user.id)
    .single();

  if (queryError) {
    console.error("Failed to query user:", queryError);
    return NextResponse.json(
      { error: "User lookup failed", detail: queryError.message },
      { status: 500 }
    );
  }

  if (!appUser || !["agency_admin", "operator"].includes(appUser.role)) {
    return NextResponse.json(
      { error: "Forbidden", role: appUser?.role ?? "not found" },
      { status: 403 }
    );
  }

  const state = JSON.stringify({ orgId: appUser.org_id, userId: user.id });
  const encodedState = Buffer.from(state).toString("base64url");
  const authUrl = getAuthUrl(encodedState);

  return NextResponse.redirect(authUrl);
}
