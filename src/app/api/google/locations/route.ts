import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ locations: [] });
    }

    const serviceClient = createServiceClient();
    const { data: appUser } = await serviceClient
      .from("users")
      .select("org_id")
      .eq("auth_uid", user.id)
      .single();

    if (!appUser) {
      return NextResponse.json({ locations: [] });
    }

    const { data: locations } = await serviceClient
      .from("locations")
      .select("id, name, address, gbp_account_id, gbp_location_name, gbp_place_id, client_id")
      .order("name");

    return NextResponse.json({
      org_id: appUser.org_id,
      locations: locations || [],
    });
  } catch (err) {
    console.error("Locations fetch error:", err);
    return NextResponse.json({ locations: [], error: "internal_error" });
  }
}
