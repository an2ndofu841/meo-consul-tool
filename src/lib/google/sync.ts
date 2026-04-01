"use server";

import { createClient } from "@/lib/supabase/server";
import { createAuthenticatedClient } from "@/lib/google/oauth";
import {
  listAccounts,
  listLocations,
  listReviews,
  getPerformanceMetrics,
  starRatingToNumber,
  type GbpLocation,
  type GbpAccount,
} from "@/lib/google/gbp-client";

// ---- Helpers ----

async function getAuthClientForOrg(orgId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: tokenRow, error } = await sb
    .from("google_tokens")
    .select("*")
    .eq("org_id", orgId)
    .single();

  if (error || !tokenRow) {
    throw new Error("Google account not connected");
  }

  const auth = createAuthenticatedClient(
    tokenRow.access_token,
    tokenRow.refresh_token
  );

  auth.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await sb
        .from("google_tokens")
        .update({
          access_token: tokens.access_token,
          token_expiry: new Date(
            tokens.expiry_date || Date.now() + 3600000
          ).toISOString(),
        })
        .eq("org_id", orgId);
    }
  });

  return auth;
}

// ---- Fetch GBP Accounts & Locations ----

export async function fetchGbpAccounts(orgId: string): Promise<GbpAccount[]> {
  const auth = await getAuthClientForOrg(orgId);
  return listAccounts(auth);
}

export async function fetchGbpLocations(
  orgId: string,
  accountName: string
): Promise<GbpLocation[]> {
  const auth = await getAuthClientForOrg(orgId);
  return listLocations(auth, accountName);
}

// ---- Link GBP Location to app Location ----

export async function linkGbpLocation(
  locationId: string,
  gbpAccountId: string,
  gbpLocationName: string,
  gbpPlaceId: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("locations")
    .update({
      gbp_account_id: gbpAccountId,
      gbp_location_name: gbpLocationName,
      gbp_place_id: gbpPlaceId,
    })
    .eq("id", locationId);

  if (error) throw new Error(`Failed to link location: ${error.message}`);
}

// ---- Sync Reviews ----

export async function syncReviews(orgId: string, locationId: string) {
  const supabase = await createClient();

  // Get the location's GBP info
  const { data: location } = await supabase
    .from("locations")
    .select("gbp_account_id, gbp_location_name")
    .eq("id", locationId)
    .single();

  if (!location?.gbp_account_id || !location?.gbp_location_name) {
    throw new Error("Location not linked to GBP");
  }

  const auth = await getAuthClientForOrg(orgId);
  const fullName = `${location.gbp_account_id}/${location.gbp_location_name}`;

  let pageToken: string | undefined;
  let syncedCount = 0;

  do {
    const result = await listReviews(auth, fullName, 50, pageToken);

    for (const review of result.reviews) {
      const rating = starRatingToNumber(review.starRating);

      await supabase.from("reviews").upsert(
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

  return { syncedCount };
}

// ---- Sync Performance Metrics ----

export async function syncPerformance(
  orgId: string,
  locationId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();

  const { data: location } = await supabase
    .from("locations")
    .select("gbp_location_name")
    .eq("id", locationId)
    .single();

  if (!location?.gbp_location_name) {
    throw new Error("Location not linked to GBP");
  }

  const auth = await getAuthClientForOrg(orgId);
  const metrics = await getPerformanceMetrics(
    auth,
    location.gbp_location_name,
    startDate,
    endDate
  );

  return metrics;
}

// ---- Check connection status ----

export async function getConnectionStatus(orgId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("google_tokens")
    .select("google_email, created_at, updated_at")
    .eq("org_id", orgId)
    .single();

  return data as { google_email: string; created_at: string; updated_at: string } | null;
}
