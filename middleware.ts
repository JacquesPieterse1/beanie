import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { AppRole } from "@/types/database";

const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  staff: "/staff/dashboard",
  customer: "/menu",
};

const PROTECTED_ROUTES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/staff", roles: ["staff", "admin"] },
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  
  // OAuth callback: session is being established — pass through immediately.
  if (path.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  /**
   * Inline the Supabase client so we own the `supabaseResponse` reference.
   *
   * The helper pattern (createMiddlewareClient) destructures `response` once at
   * call time. When `setAll` later reassigns the internal `let response` variable
   * (during token refresh), the caller's reference becomes stale and the
   * refreshed cookies are never forwarded to the browser.
   */
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate request so downstream server reads see the new cookies.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild our response reference so the new cookies are forwarded.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * Always call getUser() — never getSession().
   *
   * getSession() trusts the client-supplied payload and can be spoofed.
   * getUser() validates the JWT against Supabase Auth servers and also
   * triggers a token refresh when the access token is close to expiry,
   * which is why it must run on every request and why the cookies must
   * be forwarded on every response (including redirects).
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (path === "/menu") {
    if (!user) return NextResponse.next();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (role === "staff") {
      return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    }
  }
  /**
   * Forward all refreshed session cookies into any redirect we create.
   *
   * This is the most common middleware bug: `NextResponse.redirect()` creates
   * a brand-new response with no cookies. Without copying the cookies from
   * `supabaseResponse`, the browser never receives the refreshed tokens and
   * the next request will fail auth — causing a redirect loop or a silent
   * fallback to the "unauthenticated" code path.
   */
  console.log("MIDDLEWARE PATH:", path);
  console.log("MIDDLEWARE USER:", user?.id);
  console.log("MIDDLEWARE ROLE:", user?.app_metadata?.role);
  const makeRedirect = (destination: string): NextResponse => {
    const url = new URL(destination, request.url);
    // Guard against same-path redirect loops.
    if (request.nextUrl.pathname === url.pathname) {
      return supabaseResponse;
    }
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach(({ name, value }) => res.cookies.set(name, value));
    return res;
  };

  /**
   * Resolve the user's role with a single lookup per request.
   *
   * Prefer JWT app_metadata (set by a Supabase trigger/function) because it
   * requires no extra network round-trip. Fall back to a single DB query only
   * when app_metadata.role is absent (e.g. the trigger hasn't run yet).
   *
   * To store role in JWT permanently, run this in your Supabase SQL editor:
   *
   *   create or replace function public.set_role_claim()
   *   returns trigger language plpgsql security definer as $$
   *   begin
   *     update auth.users
   *       set raw_app_meta_data =
   *         raw_app_meta_data || jsonb_build_object('role', new.role)
   *       where id = new.id;
   *     return new;
   *   end;
   *   $$;
   *
   *   create trigger on_profile_role_change
   *     after insert or update of role on public.profiles
   *     for each row execute procedure public.set_role_claim();
   */
  const resolveRole = async (): Promise<AppRole> => {
    if (!user) return "customer";

    // Fast path: role already embedded in the JWT.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile?.role as AppRole) ?? "customer";
    //if (metaRole && metaRole in ROLE_HOME) return metaRole;

    // Slow path: single DB query, always with a safe default.
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return (data?.role as AppRole) ?? "customer";
  };

  // ── Root path ────────────────────────────────────────────────────────────
  if (path === "/") {
    if (!user) return makeRedirect("/menu");
    const role = await resolveRole();
    return makeRedirect(ROLE_HOME[role]);
  }

  // ── Auth pages: bounce already-authenticated users ────────────────────
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (!user) return supabaseResponse;
    const role = await resolveRole();
    return makeRedirect(ROLE_HOME[role]);
  }

  // ── Protected routes ─────────────────────────────────────────────────
  const matched = PROTECTED_ROUTES.find((r) => path.startsWith(r.prefix));
  if (matched) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      const res = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies
        .getAll()
        .forEach(({ name, value }) => res.cookies.set(name, value));
      return res;
    }

    const role = await resolveRole();
    if (!matched.roles.includes(role)) {
      // Insufficient permissions — send to the user's own home.
      return makeRedirect(ROLE_HOME[role]);
    }
  }

  // Default: pass through with the (potentially refreshed) session cookies.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /**
     * Run on every path except Next.js internals and static assets.
     *
     * A narrow matcher (listing specific paths) causes sessions to go stale
     * on unlisted routes because the token refresh triggered by getUser()
     * never propagates back to the browser. This broad pattern is the
     * Supabase-recommended approach for App Router.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
