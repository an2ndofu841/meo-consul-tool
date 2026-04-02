import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { locationId, gbpAccountId, gbpLocationName, gbpPlaceId } = body;

    if (!locationId || !gbpAccountId || !gbpLocationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sc = createServiceClient();
    const { error } = await sc
      .from("locations")
      .update({
        gbp_account_id: gbpAccountId,
        gbp_location_name: gbpLocationName,
        gbp_place_id: gbpPlaceId || null,
      })
      .eq("id", locationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
