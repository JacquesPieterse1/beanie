import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase-middleware";
import type { AppRole } from "@/types/database";

const PROTECTED_ROUTES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/staff", roles: ["staff", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh the session — this keeps the auth cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Let the OAuth callback route pass through without interference
  if (path.startsWith("/auth/callback")) {
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (user && (path.startsWith("/login") || path.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check protected routes
  const matched = PROTECTED_ROUTES.find((route) =>
    path.startsWith(route.prefix)
  );

  if (matched) {
    // Not logged in → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Fetch the user's role from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile?.role as AppRole) ?? "customer";

    if (!matched.roles.includes(role)) {
      // Insufficient permissions → redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
