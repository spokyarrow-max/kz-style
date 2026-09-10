-- KZ Style — automatyzacje i zabezpieczenia dostępu (Etap 1)

-- ============================================================
-- CZĘŚĆ 1: AUTOMATYZACJE
-- ============================================================

-- Gdy ktoś się zarejestruje (auth.users), automatycznie tworzymy
-- dla niego wiersz w naszej tabeli "profiles" z rolą "customer".
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Automatyczne uzupełnianie "updated_at" przy każdej zmianie wiersza.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- Numeracja zamówień w formacie KZ-2026-00001.
create sequence public.order_number_seq;

create or replace function public.generate_order_number()
returns text as $$
  select 'KZ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$ language sql;

alter table public.orders
  alter column order_number set default public.generate_order_number();

-- Pomocnicza funkcja: czy zalogowany użytkownik jest adminem?
-- "security definer" pozwala jej bezpiecznie zajrzeć do profiles
-- bez wpadania w nieskończoną pętlę z regułami dostępu poniżej.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- CZĘŚĆ 2: WŁĄCZENIE ROW LEVEL SECURITY (RLS)
-- ============================================================
-- RLS = zamek na każdej tabeli. Bez włączenia poniższych reguł
-- NIKT (poza kluczem serwisowym) nie ma dostępu do danych.

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.wishlists enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_events enable row level security;

-- ============================================================
-- CZĘŚĆ 3: REGUŁY DOSTĘPU
-- ============================================================

-- --- profiles: każdy widzi i edytuje tylko siebie; admin widzi wszystkich ---
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- --- addresses: tylko właściciel; admin widzi wszystko ---
create policy "addresses_all_own_or_admin" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- --- katalog produktowy: publiczny odczyt, zapis tylko admin ---
create policy "categories_public_read" on public.categories
  for select using (true);
create policy "categories_admin_write" on public.categories
  for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories
  for update using (public.is_admin());
create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

create policy "collections_public_read" on public.collections
  for select using (true);
create policy "collections_admin_write" on public.collections
  for insert with check (public.is_admin());
create policy "collections_admin_update" on public.collections
  for update using (public.is_admin());
create policy "collections_admin_delete" on public.collections
  for delete using (public.is_admin());

create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

create policy "product_collections_public_read" on public.product_collections
  for select using (true);
create policy "product_collections_admin_write" on public.product_collections
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on public.product_images
  for select using (true);
create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "product_variants_public_read" on public.product_variants
  for select using (is_active = true or public.is_admin());
create policy "product_variants_admin_write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- --- wishlists: tylko właściciel ---
create policy "wishlists_all_own" on public.wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- carts / cart_items: tylko zalogowany właściciel koszyka.
-- Koszyki gości (guest_token) są obsługiwane wyłącznie po stronie
-- serwera (kluczem serwisowym), więc nie potrzebują tu reguły. ---
create policy "carts_all_own" on public.carts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cart_items_all_own" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

-- --- discount_codes: brak publicznego odczytu.
-- Sprawdzanie kodu idzie przez serwerowy endpoint (klucz serwisowy). ---
create policy "discount_codes_admin_all" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- --- orders / order_items / order_status_history: tylko odczyt własnych;
-- wszystkie zapisy idą przez serwer (klucz serwisowy) po potwierdzeniu
-- płatności — dlatego brak reguł insert/update dla zwykłych klientów. ---
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_status_history_select_own_or_admin" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- --- payment_events: nikt poza adminem (i serwerem, który używa klucza
-- serwisowego i tak omija RLS) nie musi tego widzieć. ---
create policy "payment_events_admin_only" on public.payment_events
  for select using (public.is_admin());
