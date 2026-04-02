import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import {
  listReviews,
  getPerformanceMetrics,
  starRatingToNumber,
} from "@/lib/google/gbp-client";

async function getAuthForOrg(orgId: string) {
  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tokenRow, error } = await (serviceClient as any)
    .from("google_tokens")
    .select("*")
    .eq("org_id", orgId)
    .single();

  if (error || !tokenRow) {
    throw new Error("Google account not connected");
  }

  return createAuthenticatedClient(tokenRow.access_token, tokenRow.refresh_token);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: appUser } = await serviceClient
      .from("users")
      .select("org_id")
      .eq("auth_uid", user.id)
      .single();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, locationId } = body;

    // Get location info
    const { data: location } = await serviceClient
      .from("locations")
      .select("id, gbp_account_id, gbp_location_name")
      .eq("id", locationId)
      .single();

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    if (!location.gbp_account_id || !location.gbp_location_name) {
      return NextResponse.json({ error: "Location not linked to GBP" }, { status: 400 });
    }

    const auth = await getAuthForOrg(appUser.org_id);

    if (action === "sync_reviews") {
      const fullName = `${location.gbp_account_id}/${location.gbp_location_name}`;
      let pageToken: string | undefined;
      let syncedCount = 0;

      do {
        const result = await listReviews(auth, fullName, 50, pageToken);

        for (const review of result.reviews) {
          const rating = starRatingToNumber(review.starRating);
          await serviceClient.from("reviews").upsert(
            {
              location_id: locationId,
              google_review_id: review.reviewId || review.name,
              author: review.reviewer?.displayName || "Anonymous",
              rating,
              body: review.comment || null,
              reply_status: review.reviewReply ? "published" : "pending",
              reviewed_at: review.createTime,
            },
            { onConflict: "google_review_id", ignoreDuplicates: false }
          );
          syncedCount++;
        }

        pageToken = result.nextPageToken;
      } while (pageToken);

      return NextResponse.json({ success: true, syncedCount });
    }

    if (action === "sync_performance") {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      const metrics = await getPerformanceMetrics(
        auth,
        location.gbp_location_name,
        startDate,
        endDate
      );

      return NextResponse.json({ success: true, metrics });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Sync error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
