import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login", "/signup", "/auth/callback", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  // Refresh session & check auth
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // Not authenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Fetch app user role
  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("auth_uid", user.id)
    .single<{ role: string }>();

  // If no app user record yet, default to admin dashboard
  // (the trigger should have created a record, but handle edge case)
  if (!appUser) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const role = appUser.role;
  const isAdmin = role === "agency_admin" || role === "operator";
  const isClient = role === "client_viewer" || role === "client_operator";

  // Root redirect based on role
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin/dashboard" : "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Admin routes: only admin roles
  if (pathname.startsWith("/admin") && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Client routes: only client roles
  if (pathname.startsWith("/client") && !isClient) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Settings page: admin only
  if (pathname.startsWith("/admin/settings") && role !== "agency_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
