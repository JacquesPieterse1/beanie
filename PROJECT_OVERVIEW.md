# Beanie — Coffee Shop Management System

A full-stack cafe ordering and management platform built with Next.js 14 and Supabase. Customers can browse the menu, customize orders, and track their pickup code. Staff manage a real-time order queue. Admins control the full menu catalog.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Authentication](#authentication)
4. [Database Schema](#database-schema)
5. [Routes & Pages](#routes--pages)
6. [Components](#components)
7. [Server Actions & API Routes](#server-actions--api-routes)
8. [State Management](#state-management)
9. [Business Logic](#business-logic)
10. [Patterns & Conventions](#patterns--conventions)
11. [Environment Setup](#environment-setup)
12. [Seed Data](#seed-data)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router, Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| UI Primitives | Radix UI (Dialog, Dropdown, Tabs, Label, Slot) |
| Component Styling | Class Variance Authority + Tailwind Merge + clsx |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Notifications | Sonner 2 (toast) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (OAuth + Email/Password) |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| SSR Auth | @supabase/ssr |
| Fonts | Inter (body), Playfair Display (headings) |

---

## Project Structure

```
/
├── app/
│   ├── (auth)/                  # Login, Register pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (customer)/              # Customer-facing layout & routes
│   │   ├── layout.tsx           # Wraps with CartProvider + CustomerHeader
│   │   ├── menu/page.tsx        # Product browse page
│   │   ├── checkout/page.tsx    # Cart review + order placement
│   │   ├── order/[id]/page.tsx  # Order status tracker
│   │   ├── orders/page.tsx      # Order history
│   │   └── account/page.tsx     # User profile
│   ├── admin/                   # Admin panel
│   │   ├── layout.tsx           # AdminSidebar layout
│   │   ├── menu/page.tsx        # Product CRUD
│   │   ├── orders/page.tsx      # Order history
│   │   └── queue/page.tsx       # Order queue
│   ├── staff/                   # Staff dashboard
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx   # Real-time order queue
│   ├── auth/
│   │   └── callback/route.ts    # OAuth callback handler
│   ├── layout.tsx               # Root layout (fonts, Toaster)
│   └── page.tsx                 # Root redirect (role-based)
│
├── components/
│   ├── ui/                      # Base UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── label.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── CustomerHeader.tsx       # Sticky nav with cart button + user menu
│   ├── AdminSidebar.tsx         # Admin nav sidebar
│   ├── MenuGrid.tsx             # Products grouped by category
│   ├── ProductCard.tsx          # Single product card with hover
│   ├── ProductDetailPanel.tsx   # Modal: modifiers, quantity, add to cart
│   ├── CartDrawer.tsx           # Slide-out cart
│   ├── MobileCartBar.tsx        # Fixed bottom cart bar (mobile)
│   ├── CategoryPills.tsx        # Category filter pills
│   ├── OrderQueue.tsx           # Staff order queue with status updates
│   ├── OrderTracker.tsx         # Customer order status view
│   ├── GoogleAuthButton.tsx     # OAuth button with divider
│   └── MotionComponents.tsx     # Framer Motion wrappers
│
├── hooks/
│   ├── use-user.ts              # Auth state: user, profile, role, signOut
│   └── use-toast.ts             # In-memory toast state reducer
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client (cookie-based)
│   ├── actions/
│   │   ├── place-order.ts       # Server action: create order + items
│   │   └── admin-products.ts    # Server actions: CRUD for products
│   ├── cart-context.tsx         # CartProvider + useCart hook
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
│
├── types/
│   └── database.ts              # TypeScript types for all DB tables
│
├── supabase/
│   ├── migrations/              # SQL migration files
│   └── seed.sql                 # Seed data for categories, products, modifiers
│
└── middleware.ts                # Auth validation + role-based redirects
```

---

## Authentication

### Methods
- **Google OAuth** — primary social login via `signInWithOAuth()`
- **Email/Password** — traditional credentials via `signInWithPassword()`

### Flow
1. Unauthenticated users land on `/login`
2. OAuth callback at `/auth/callback` exchanges the authorization code for a session
3. A Supabase trigger auto-creates a row in `profiles` for every new user
4. `middleware.ts` runs on every request: validates the JWT with `getUser()` (never `getSession()`)
5. After auth, users are redirected based on their role:
   - `admin` → `/admin`
   - `staff` → `/staff/dashboard`
   - `customer` → `/menu`

### Security
- All auth validation is server-side (middleware prevents JWT spoofing)
- Tokens are refreshed automatically on every request
- RLS (Row Level Security) enforces data access at the DB layer

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | References `auth.users` |
| full_name | text | |
| role | app_role | `customer` \| `staff` \| `admin` |
| created_at | timestamptz | |

#### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| name | text | e.g., "Coffee", "Tea" |
| display_order | integer | Sort order in menu |

#### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| name | text | |
| description | text | |
| price | numeric | Base price (ZAR) |
| image_url | text | Unsplash CDN URL |
| category_id | UUID | FK → categories |
| is_available | boolean | Toggle availability |
| created_at | timestamptz | |

#### `modifiers`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| name | text | e.g., "Size", "Milk" |
| type | modifier_type | `radio` \| `checkbox` |
| is_required | boolean | Forces selection before checkout |

#### `modifier_options`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| modifier_id | UUID | FK → modifiers |
| label | text | e.g., "Large", "Oat Milk" |
| price_adjustment | numeric | Added to base price |

#### `product_modifiers`
| Column | Type | Notes |
|--------|------|-------|
| product_id | UUID | FK → products |
| modifier_id | UUID | FK → modifiers |

#### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| customer_id | UUID | FK → profiles |
| status | order_status | `pending` \| `in_progress` \| `complete` \| `cancelled` |
| total | numeric | Calculated total |
| pickup_code | text | 4-digit customer pickup code |
| created_at | timestamptz | |

#### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| order_id | UUID | FK → orders |
| product_id | UUID | FK → products |
| quantity | integer | |
| unit_price | numeric | Price at time of order |
| selected_modifiers | JSONB | Array of selected option IDs + labels + prices |

### Enums
- `app_role`: `customer`, `staff`, `admin`
- `order_status`: `pending`, `in_progress`, `complete`, `cancelled`
- `modifier_type`: `radio`, `checkbox`

---

## Routes & Pages

### Customer Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/menu` | `MenuGrid` + `ProductDetailPanel` | Browse & filter products by category |
| `/checkout` | Checkout page | Review cart, confirm order |
| `/order/[id]` | `OrderTracker` | Track a specific order by ID |
| `/orders` | Orders list | Order history for logged-in customer |
| `/account` | Account page | User profile details |

### Staff Routes
| Route | Description |
|-------|-------------|
| `/staff/dashboard` | Real-time order queue with status management |
| `/staff` | Redirects to `/staff/dashboard` |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin/menu` | Create, edit, delete products and manage modifiers |
| `/admin/orders` | View all order history |
| `/admin/queue` | Order queue view (same as staff) |
| `/admin` | Redirects to `/admin/menu` |

### Auth Routes
| Route | Description |
|-------|-------------|
| `/login` | Email/password + Google OAuth login |
| `/register` | Account creation |
| `/auth/callback` | OAuth code exchange handler |
| `/` | Role-based redirect |

---

## Components

### Layout
| Component | Description |
|-----------|-------------|
| `CustomerHeader` | Sticky top nav with cart count badge, user dropdown (sign in/out) |
| `AdminSidebar` | Dark sidebar with links: Menu, Orders, Queue |
| `CartProvider` | React Context provider for cart state (wraps customer layout) |

### Customer-Facing
| Component | Description |
|-----------|-------------|
| `MenuGrid` | Groups products by category, renders `ProductCard` grid |
| `ProductCard` | Image, name, price, hover animation, opens detail panel |
| `ProductDetailPanel` | Dialog with modifier selection, quantity stepper, add-to-cart |
| `CartDrawer` | Right-side slide-out showing cart items, totals, checkout button |
| `MobileCartBar` | Fixed bottom bar on mobile showing cart count + total |
| `CategoryPills` | Horizontal scrollable category filter buttons |
| `OrderTracker` | Shows order status progress (pending → in_progress → complete) |

### Staff/Admin
| Component | Description |
|-----------|-------------|
| `OrderQueue` | Real-time order cards with status update buttons |

### Utility
| Component | Description |
|-----------|-------------|
| `MotionComponents` | `PageTransition`, `StaggerContainer`, `AnimatedButton` wrappers |
| `GoogleAuthButton` | OAuth button with "or continue with" divider |
| `Skeleton` | Loading placeholder shapes |

---

## Server Actions & API Routes

### API Routes
- **`GET /auth/callback`** — Handles OAuth redirect. Exchanges authorization code for a session, ensures profile row exists, then redirects to role-appropriate page.

### Server Actions (`"use server"`)

#### `placeOrder(items: CartItem[])` — `/lib/actions/place-order.ts`
1. Validates authenticated session
2. Calculates total (base price + modifier adjustments × quantity)
3. Generates 4-digit pickup code
4. Inserts row into `orders`
5. Inserts rows into `order_items` (stores `selected_modifiers` as JSONB)
6. Returns `{ orderId }` or `{ error }`

#### Admin product actions — `/lib/actions/admin-products.ts`
- **`createProduct(input)`** — Creates product + links modifiers via `product_modifiers`, revalidates `/admin/menu`
- **`updateProduct(id, input)`** — Updates product fields + replaces modifier links
- **`deleteProduct(id)`** — Deletes product (cascade handles order_items)

#### `updateOrderStatus(orderId, status)` — inline / staff dashboard
- Authenticated staff/admin server call
- Updates `orders.status` to the next value in the workflow

---

## State Management

### Cart (Client-Side Context)
**File:** `lib/cart-context.tsx`

```
CartProvider
  └── state: { items[], total, itemCount }
  └── methods: addItem(), removeItem(), updateQuantity(), clearCart()
  └── persistence: localStorage ("beanie-cart")
  └── smart merge: same product + same modifiers → increments quantity
```

### Auth State
**File:** `hooks/use-user.ts`

```
useUser()
  └── returns: { user, profile, role, loading, signOut }
  └── syncs from: Supabase onAuthStateChange()
  └── fetches: profile row from DB on mount
```

### Toast Notifications
**File:** `hooks/use-toast.ts`

In-memory reducer pattern. Max 1 toast visible at a time. Used for order success, errors, and admin actions.

---

## Business Logic

### Order Flow

```
Customer browses /menu (server-rendered products)
  → clicks product → ProductDetailPanel opens
  → selects modifiers (radio required, checkbox optional)
  → sets quantity → adds to cart (localStorage)
  → opens CartDrawer → proceeds to /checkout
  → confirms order → placeOrder() server action
  → receives 4-digit pickup code
  → tracks status on /order/[id]
```

### Modifier System
- **Radio** (`type: 'radio'`): Single selection, e.g., Size (Small / Medium / Large)
- **Checkbox** (`type: 'checkbox'`): Multi-selection, e.g., Extras (Extra Shot, Vanilla Syrup)
- **Required** modifiers block checkout until selected
- Each option can carry a `price_adjustment` added to the base price

### Real-Time Staff Dashboard
- Subscribes to Supabase Realtime channel on `orders` + `order_items`
- `INSERT` event: new order card appears instantly in queue
- `UPDATE` event: status badge updates without page refresh
- Staff clicks status button to advance: `pending → in_progress → complete`

### Role-Based Middleware
Every request hits `middleware.ts`:
1. Validates JWT via `supabase.auth.getUser()`
2. Fetches `profiles.role` from DB (single query, cached in cookie)
3. Enforces redirects:
   - Unauthenticated → `/login` (for protected routes)
   - Admin on `/menu` → `/admin`
   - Staff on `/menu` → `/staff/dashboard`
   - Customer on `/admin` or `/staff/*` → `/menu`

---

## Patterns & Conventions

### Server Components by Default
Pages are async server components that fetch data directly from Supabase. Only interactive sub-components (cart, modals, forms) are marked `"use client"`.

### Error Handling
- Server actions return `{ error: string }` on failure, `{ success: true, data }` on success
- UI wraps calls in try/catch and shows Sonner toasts
- Forms show inline field-level error messages

### Animations
- `PageTransition` wraps all page content (fade + slide via Framer Motion)
- Product cards animate on hover (scale + shadow)
- CartDrawer slides in from right

### Responsive Design
- Mobile-first Tailwind classes
- Products grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Admin sidebar hidden on mobile with a toggle button
- `MobileCartBar` replaces `CartDrawer` button on small screens

### Type Safety
- `/types/database.ts` exports interfaces for all tables: `Product`, `Category`, `Order`, `OrderItem`, `Profile`, `Modifier`, `ModifierOption`
- Server actions are typed with input interfaces
- No `any` types in component props

### Styling Conventions
- All colors via CSS custom properties (supports dark mode swap)
- `cn()` utility (`clsx` + `tailwind-merge`) for conditional classnames
- `cva()` (Class Variance Authority) for component variants (e.g., Button sizes)

---

## Environment Setup

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then install and run:

```bash
npm install
npm run dev
```

### Supabase Setup
1. Create a Supabase project
2. Run all migrations in `/supabase/migrations/` in order
3. Run `/supabase/seed.sql` to populate categories, products, and modifiers
4. Enable Realtime on the `orders` and `order_items` tables
5. Enable Google OAuth provider in Supabase Auth settings

---

## Seed Data

The seed script (`/supabase/seed.sql`) populates:

| Entity | Count | Examples |
|--------|-------|---------|
| Categories | 5 | Coffee, Tea, Cold Drinks, Pastries, Breakfast |
| Products | 22 | Espresso, Cappuccino, Green Tea, Croissant, Toast & Preserves |
| Modifiers | 4 | Size (radio, required), Milk (radio, required), Extras (checkbox, optional), Warming (radio, optional) |
| Modifier Options | ~15 | Small/Medium/Large, Whole/Oat/Almond/Soy, Extra Shot/Vanilla Syrup |
| Product-Modifier links | varies | e.g., Cappuccino → Size, Milk, Extras |

All products include Unsplash image URLs.
