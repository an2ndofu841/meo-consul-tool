import { NextResponse } from "next/server";

export async function GET() {
  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(未設定 → デフォルト使用)",
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  };

  const allSet = vars.NEXT_PUBLIC_SUPABASE_URL
    && vars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    && vars.SUPABASE_SERVICE_ROLE_KEY
    && vars.GOOGLE_CLIENT_ID
    && vars.GOOGLE_CLIENT_SECRET;

  return NextResponse.json({
    status: allSet ? "OK" : "MISSING_ENV_VARS",
    env: vars,
    note: "true = 設定済み, false = 未設定",
  });
}
