import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getOAuth2Client } from "@/lib/google/oauth";
import { getGoogleEmail } from "@/lib/google/gbp-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=missing_code`
    );
  }

  try {
    // Decode state
    const state = JSON.parse(
      Buffer.from(stateParam, "base64url").toString()
    );
    const { orgId } = state;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=no_refresh_token`
      );
    }

    // Get Google email
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const googleEmail = await getGoogleEmail(oauth2Client);

    // Store tokens in database
    const supabase = await createClient();

    const tokenData = {
      org_id: orgId,
      google_email: googleEmail,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: new Date(tokens.expiry_date || Date.now() + 3600000).toISOString(),
      scopes: tokens.scope?.split(" ") || [],
    };

    // Upsert (replace existing token for this org)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("google_tokens")
      .upsert(tokenData, { onConflict: "org_id" });

    if (dbError) {
      console.error("Failed to save tokens:", dbError);
      return NextResponse.redirect(
        `${appUrl}/admin/gbp?error=db_error`
      );
    }

    return NextResponse.redirect(`${appUrl}/admin/gbp?success=connected`);
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/admin/gbp?error=callback_failed`
    );
  }
}
