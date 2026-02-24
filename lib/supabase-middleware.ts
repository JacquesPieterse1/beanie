/**
 * This helper is no longer used.
 *
 * The Supabase middleware client is now created inline in middleware.ts to
 * avoid the stale `response` reference bug: when createMiddlewareClient()
 * returned `{ supabase, response }`, the caller destructured `response` once.
 * Later, when getUser() triggered setAll() and reassigned the internal `let
 * response` variable, the caller's copy became stale — refreshed session
 * cookies were never forwarded to the browser.
 *
 * See middleware.ts for the correct inline implementation.
 */
export {};
