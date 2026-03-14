# Beanie Cafe — Improvement TODO

## Critical / High Priority

### Bugs & Security
- [x] **Clear cart on logout** — `signOut()` doesn't clear `localStorage`, so the next user on the same device inherits the previous cart.
- [x] **Pickup code collisions** — 4-digit numeric codes (10,000 values) will collide in a busy cafe. Use alphanumeric codes or a longer format.
- [x] **Cart ID generation** — Replace `Math.random().toString(36)` with `crypto.randomUUID()` for reliable uniqueness.
- [x] **Remove debug logs** — `console.log` calls in `middleware.ts` and `use-user.ts` log user data on every request in production.
- [x] **Fix double DB query in middleware** — Profiles table is queried twice on every request for role resolution. Cache the result or use a single query.

### Missing Validation
- [x] **Add input validation with Zod** — Server actions (`placeOrder`, `createProduct`, etc.) accept raw input with no schema validation. Add Zod to all server actions.
- [x] **Validate modifier constraints on checkout** — `placeOrder` doesn't verify that selected modifiers actually belong to the ordered products.

---

## Medium Priority

### Code Quality
- [x] **Remove commented-out code in `use-user.ts`** — ~65 lines of old auth logic sitting in comments. Delete it or move to a branch.
- [x] **Add global error boundary** — No top-level React error boundary; unhandled server action failures show a blank screen.
- [ ] **Add environment variable validation** — Validate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at startup (e.g., using `zod` or `t3-env`). Add a `.env.example` file.

### Performance
- [ ] **Add pagination** — Order history and product lists load all rows. Paginate with `range()` in Supabase.
- [ ] **Cache static data** — Product/category lists rarely change. Use `revalidate: 3600` instead of `revalidate: 0` everywhere.

### Features
- [ ] **Add order cancellation for customers** — Customers can't cancel a pending order; only staff can.
- [ ] **Add menu search/filtering** — Currently only browseable by category. A search bar would improve UX significantly.
- [ ] **Add rate limiting** — Auth endpoints (login/signup) and order placement are unprotected from abuse.

---

## Nice to Have

- [ ] **Add tests** — Zero test coverage. Start with unit tests for server actions (`placeOrder`, `updateOrderStatus`) and integration tests for auth flow.
- [ ] **Add payment integration** — Orders have totals but no payment processing. Stripe would be the natural choice.
- [ ] **Email notifications** — Notify customers when their order is ready (Supabase has email hooks / you can use Resend).
- [ ] **Add structured logging** — Replace `console.log` with a proper logger (e.g., `pino`) with log levels for production observability.
- [ ] **Dark mode** — `next-themes` is already installed but not wired up.
- [ ] **Add image upload for products** — Admin currently pastes external Unsplash URLs. Add Supabase Storage upload for product images.
- [ ] **Blur placeholders on product images** — `next/image` supports `blurDataURL` for a better loading experience.
- [ ] **Accessibility audit** — Radix UI handles basics, but aria-labels, focus traps, and keyboard navigation need a full pass.
