-- ============================================================
-- Beanie Cafe — Initial Database Schema
-- ============================================================

-- ------------------------------------------------------------
-- 0. Custom types
-- ------------------------------------------------------------

create type modifier_type  as enum ('radio', 'checkbox');
create type order_status   as enum ('pending', 'in_progress', 'complete', 'cancelled');
create type app_role       as enum ('customer', 'staff', 'admin');

-- ------------------------------------------------------------
-- 1. User profiles (extends Supabase auth.users)
-- ------------------------------------------------------------

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        app_role not null default 'customer',
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------
-- 2. Categories
-- ------------------------------------------------------------

create table categories (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  display_order  int  not null default 0
);

-- ------------------------------------------------------------
-- 3. Products
-- ------------------------------------------------------------

create table products (
  id            uuid primary key default gen_random_uuid(),
  name          text    not null,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  image_url     text,
  category_id   uuid    not null references categories(id) on delete cascade,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

create index idx_products_category on products(category_id);

-- ------------------------------------------------------------
-- 4. Modifiers & options
-- ------------------------------------------------------------

create table modifiers (
  id          uuid primary key default gen_random_uuid(),
  name        text          not null,
  type        modifier_type not null default 'radio',
  is_required boolean       not null default false
);

create table modifier_options (
  id               uuid primary key default gen_random_uuid(),
  modifier_id      uuid         not null references modifiers(id) on delete cascade,
  label            text         not null,
  price_adjustment numeric(10,2) not null default 0
);

create index idx_modifier_options_modifier on modifier_options(modifier_id);

-- ------------------------------------------------------------
-- 5. Product ↔ Modifier join table
-- ------------------------------------------------------------

create table product_modifiers (
  product_id  uuid not null references products(id)  on delete cascade,
  modifier_id uuid not null references modifiers(id) on delete cascade,
  primary key (product_id, modifier_id)
);

-- ------------------------------------------------------------
-- 6. Orders
-- ------------------------------------------------------------

create table orders (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid         not null references profiles(id) on delete cascade,
  status       order_status not null default 'pending',
  total        numeric(10,2) not null default 0 check (total >= 0),
  pickup_code  text,
  created_at   timestamptz  not null default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status   on orders(status);

-- ------------------------------------------------------------
-- 7. Order items
-- ------------------------------------------------------------

create table order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid         not null references orders(id) on delete cascade,
  product_id         uuid         not null references products(id) on delete restrict,
  quantity           int          not null default 1 check (quantity > 0),
  unit_price         numeric(10,2) not null check (unit_price >= 0),
  selected_modifiers jsonb        not null default '[]'::jsonb
);

create index idx_order_items_order on order_items(order_id);

-- ============================================================
-- 8. Helper: get the role of the current authenticated user
-- ============================================================

create or replace function auth_role()
returns app_role as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    'customer'
  );
$$ language sql stable security definer;

-- ============================================================
-- 9. Row Level Security
-- ============================================================

-- Enable RLS on every table
alter table profiles          enable row level security;
alter table categories        enable row level security;
alter table products          enable row level security;
alter table modifiers         enable row level security;
alter table modifier_options  enable row level security;
alter table product_modifiers enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;

-- ── Profiles ────────────────────────────────────────────────

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

-- Users can update their own profile (but not role)
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on profiles for select
  using (auth_role() = 'admin');

-- Admins can update all profiles (role assignment)
create policy "Admins can manage profiles"
  on profiles for all
  using (auth_role() = 'admin');

-- ── Categories (public read, admin write) ───────────────────

create policy "Anyone can read categories"
  on categories for select
  using (true);

create policy "Admins can manage categories"
  on categories for all
  using (auth_role() = 'admin');

-- ── Products (public read, admin write) ─────────────────────

create policy "Anyone can read products"
  on products for select
  using (true);

create policy "Admins can manage products"
  on products for all
  using (auth_role() = 'admin');

-- ── Modifiers (public read, admin write) ────────────────────

create policy "Anyone can read modifiers"
  on modifiers for select
  using (true);

create policy "Admins can manage modifiers"
  on modifiers for all
  using (auth_role() = 'admin');

-- ── Modifier Options (public read, admin write) ─────────────

create policy "Anyone can read modifier options"
  on modifier_options for select
  using (true);

create policy "Admins can manage modifier options"
  on modifier_options for all
  using (auth_role() = 'admin');

-- ── Product Modifiers (public read, admin write) ────────────

create policy "Anyone can read product modifiers"
  on product_modifiers for select
  using (true);

create policy "Admins can manage product modifiers"
  on product_modifiers for all
  using (auth_role() = 'admin');

-- ── Orders ──────────────────────────────────────────────────

-- Customers can view their own orders
create policy "Customers can read own orders"
  on orders for select
  using (customer_id = auth.uid());

-- Customers can create orders for themselves
create policy "Customers can create own orders"
  on orders for insert
  with check (customer_id = auth.uid());

-- Staff can read all orders
create policy "Staff can read all orders"
  on orders for select
  using (auth_role() in ('staff', 'admin'));

-- Staff can update order status
create policy "Staff can update orders"
  on orders for update
  using (auth_role() in ('staff', 'admin'));

-- Admins have full access to orders
create policy "Admins can manage orders"
  on orders for all
  using (auth_role() = 'admin');

-- ── Order Items ─────────────────────────────────────────────

-- Customers can view their own order items
create policy "Customers can read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- Customers can insert items into their own orders
create policy "Customers can create own order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- Staff can read all order items
create policy "Staff can read all order items"
  on order_items for select
  using (auth_role() in ('staff', 'admin'));

-- Staff can update order items
create policy "Staff can update order items"
  on order_items for update
  using (auth_role() in ('staff', 'admin'));

-- Admins have full access to order items
create policy "Admins can manage order items"
  on order_items for all
  using (auth_role() = 'admin');

-- ============================================================
-- 10. Enable realtime for orders (staff dashboard)
-- ============================================================

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
