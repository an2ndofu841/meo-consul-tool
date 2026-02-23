import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login", "/signup", "/auth/callback"];

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

  // If no app user record found, redirect to login
  // (user exists in auth but not in app users table yet)
  if (!appUser) {
    // For root path, allow through (will be handled by page)
    if (pathname === "/") {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
