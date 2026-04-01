import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

// ---- Types ----

export interface GbpAccount {
  name: string; // accounts/{accountId}
  accountName: string;
  type: string;
  role: string;
}

export interface GbpLocation {
  name: string; // locations/{locationId}
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
  };
  phoneNumbers?: { primaryPhone?: string };
  categories?: { primaryCategory?: { displayName?: string } };
  websiteUri?: string;
  metadata?: { placeId?: string };
}

export interface GbpReview {
  name: string;
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

export interface GbpPerformanceMetrics {
  locationName: string;
  timePeriod: { startTime: string; endTime: string };
  searchViews?: number;
  mapViews?: number;
  websiteClicks?: number;
  phoneCallClicks?: number;
  directionRequests?: number;
}

const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starRatingToNumber(rating: string): number {
  return STAR_RATING_MAP[rating] || 0;
}

// ---- Account & Location listing ----

export async function listAccounts(auth: OAuth2Client): Promise<GbpAccount[]> {
  const mybusiness = google.mybusinessaccountmanagement({ version: "v1", auth });
  const res = await mybusiness.accounts.list();
  return (res.data.accounts || []) as GbpAccount[];
}

export async function listLocations(
  auth: OAuth2Client,
  accountName: string
): Promise<GbpLocation[]> {
  const mybusinessInfo = google.mybusinessbusinessinformation({
    version: "v1",
    auth,
  });

  const res = await mybusinessInfo.accounts.locations.list({
    parent: accountName,
    readMask: "name,title,storefrontAddress,phoneNumbers,categories,websiteUri,metadata",
    pageSize: 100,
  });

  return (res.data.locations || []) as GbpLocation[];
}

// ---- Reviews ----

export async function listReviews(
  auth: OAuth2Client,
  locationFullName: string,
  pageSize = 50,
  pageToken?: string
): Promise<{ reviews: GbpReview[]; nextPageToken?: string; totalReviewCount?: number; averageRating?: number }> {
  // locationFullName format: accounts/{accountId}/locations/{locationId}
  const url = `https://mybusiness.googleapis.com/v4/${locationFullName}/reviews?pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ""}`;

  const accessToken = (await auth.getAccessToken()).token;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list reviews: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    reviews: data.reviews || [],
    nextPageToken: data.nextPageToken,
    totalReviewCount: data.totalReviewCount,
    averageRating: data.averageRating,
  };
}

// ---- Performance Metrics ----

export async function getPerformanceMetrics(
  auth: OAuth2Client,
  locationName: string,
  startDate: string,
  endDate: string
): Promise<GbpPerformanceMetrics> {
  const mybusinessPerformance = google.businessprofileperformance({
    version: "v1",
    auth,
  });

  // Fetch daily metrics
  const metrics = [
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "WEBSITE_CLICKS",
    "CALL_CLICKS",
    "BUSINESS_DIRECTION_REQUESTS",
  ];

  let searchViews = 0;
  let mapViews = 0;
  let websiteClicks = 0;
  let phoneCallClicks = 0;
  let directionRequests = 0;

  for (const metric of metrics) {
    try {
      const res = await mybusinessPerformance.locations.getDailyMetricsTimeSeries({
        name: locationName,
        dailyMetric: metric,
        "dailyRange.startDate.year": parseInt(startDate.split("-")[0]),
        "dailyRange.startDate.month": parseInt(startDate.split("-")[1]),
        "dailyRange.startDate.day": parseInt(startDate.split("-")[2]),
        "dailyRange.endDate.year": parseInt(endDate.split("-")[0]),
        "dailyRange.endDate.month": parseInt(endDate.split("-")[1]),
        "dailyRange.endDate.day": parseInt(endDate.split("-")[2]),
      });

      const timeSeries = res.data.timeSeries;
      if (timeSeries?.datedValues) {
        const total = timeSeries.datedValues.reduce(
          (sum, dv) => sum + (parseInt(dv.value || "0")),
          0
        );

        switch (metric) {
          case "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH":
          case "BUSINESS_IMPRESSIONS_MOBILE_SEARCH":
            searchViews += total;
            break;
          case "BUSINESS_IMPRESSIONS_DESKTOP_MAPS":
          case "BUSINESS_IMPRESSIONS_MOBILE_MAPS":
            mapViews += total;
            break;
          case "WEBSITE_CLICKS":
            websiteClicks = total;
            break;
          case "CALL_CLICKS":
            phoneCallClicks = total;
            break;
          case "BUSINESS_DIRECTION_REQUESTS":
            directionRequests = total;
            break;
        }
      }
    } catch {
      // Some metrics may not be available for all locations
    }
  }

  return {
    locationName,
    timePeriod: { startTime: startDate, endTime: endDate },
    searchViews,
    mapViews,
    websiteClicks,
    phoneCallClicks,
    directionRequests,
  };
}

// ---- Get connected Google email ----

export async function getGoogleEmail(auth: OAuth2Client): Promise<string> {
  const oauth2 = google.oauth2({ version: "v2", auth });
  const res = await oauth2.userinfo.get();
  return res.data.email || "";
}
