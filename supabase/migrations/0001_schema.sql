-- KZ Style — schemat bazy danych (Etap 1)
-- Ten plik tworzy wszystkie "arkusze" (tabele), których potrzebuje sklep.

create extension if not exists "pgcrypto";

-- ============ PROFIL UŻYTKOWNIKA ============
-- Rozszerza wbudowaną tabelę logowania (auth.users) o dane, których
-- potrzebujemy sami: imię, nazwisko, rola (klient / admin).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ============ ADRESY DOSTAWY ============
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  recipient_name text not null,
  street text not null,
  city text not null,
  postal_code text not null,
  country text not null default 'PL',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_id_idx on public.addresses (user_id);

-- ============ KATEGORIE ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order integer not null default 0
);

-- ============ KOLEKCJE (kampanie marketingowe, np. "Wiosna 2026") ============
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text
);

-- ============ PRODUKTY ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  gender text not null check (gender in ('men', 'women', 'unisex')),
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= price),
  material_info text,
  fit_info text,
  care_info text,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_limited_drop boolean not null default false,
  is_active boolean not null default true,
  drop_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on public.products (category_id);
create index products_gender_idx on public.products (gender);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  primary key (product_id, collection_id)
);

-- ============ ZDJĘCIA PRODUKTÓW ============
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0
);
create index product_images_product_id_idx on public.product_images (product_id);

-- ============ WARIANTY (kolor + rozmiar + stan magazynowy) ============
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  color_name text not null,
  color_hex text,
  size text check (size is null or size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  sku text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  price_override numeric(10, 2),
  is_active boolean not null default true,
  constraint reserved_not_over_stock check (reserved_quantity <= stock_quantity)
);
create index product_variants_product_id_idx on public.product_variants (product_id);

-- ============ ULUBIONE ============
create table public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============ KOSZYK ============
-- user_id wypełniony = koszyk zalogowanego klienta.
-- guest_token wypełniony = koszyk gościa (identyfikowany bezpiecznym ciasteczkiem).
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  guest_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_has_owner check (user_id is not null or guest_token is not null)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_variant_id)
);

-- ============ KODY RABATOWE ============
create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10, 2) not null check (value > 0),
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  min_order_value numeric(10, 2),
  max_uses integer,
  used_count integer not null default 0
);

-- ============ ZAMÓWIENIA ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  guest_email text,
  status text not null default 'pending_payment' check (
    status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
  ),
  subtotal numeric(10, 2) not null,
  discount_amount numeric(10, 2) not null default 0,
  discount_code_id uuid references public.discount_codes (id) on delete set null,
  shipping_cost numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  shipping_method text,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_has_owner check (user_id is not null or guest_email is not null)
);
create index orders_user_id_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_variant_id uuid references public.product_variants (id) on delete set null,
  product_name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  sku_snapshot text not null
);
create index order_items_order_id_idx on public.order_items (order_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references public.profiles (id) on delete set null
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  stripe_event_id text not null unique,
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);
