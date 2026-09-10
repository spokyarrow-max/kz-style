-- KZ Style — Etap 7: funkcje obsługujące rezerwację stanów magazynowych
-- i finalizację zamówienia po płatności Stripe.
--
-- Dlaczego to są funkcje SQL, a nie zwykłe zapytania z Next.js?
-- Bo cała operacja (sprawdzenie stanu + zarezerwowanie + utworzenie
-- zamówienia) musi wykonać się jako JEDNA, niepodzielna transakcja
-- z blokadą wiersza (FOR UPDATE) — inaczej dwóch klientów kupujących
-- ostatnią sztukę w tej samej sekundzie mogłoby oboje "wygrać".

alter table public.orders
  add column cart_id uuid references public.carts (id) on delete set null;

-- ============ REZERWACJA STANU + UTWORZENIE ZAMÓWIENIA ============
create or replace function public.create_pending_order(
  p_user_id uuid,
  p_guest_email text,
  p_cart_id uuid,
  p_shipping_address jsonb,
  p_shipping_method text,
  p_subtotal numeric,
  p_discount_amount numeric,
  p_discount_code text,
  p_shipping_cost numeric,
  p_total numeric,
  p_items jsonb
)
returns table (order_id uuid, order_number text)
language plpgsql
as $$
declare
  v_item jsonb;
  v_variant_id uuid;
  v_quantity int;
  v_available int;
  v_order_id uuid;
  v_order_number text;
  v_discount_code_id uuid;
begin
  if p_discount_code is not null then
    select id into v_discount_code_id from public.discount_codes where code = p_discount_code;
  end if;

  -- Krok 1: dla każdej pozycji zablokuj wiersz wariantu i sprawdź, czy
  -- naprawdę jest dostępny — dopiero potem rezerwuj. Jeśli czegoś
  -- zabraknie, cała funkcja przerywa się z błędem i baza sama cofa
  -- wszystkie dotychczasowe zmiany (to jedna transakcja).
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item ->> 'variant_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::int;

    select stock_quantity - reserved_quantity into v_available
    from public.product_variants
    where id = v_variant_id
    for update;

    if v_available is null then
      raise exception 'variant_not_found:%', v_variant_id;
    end if;

    if v_available < v_quantity then
      raise exception 'insufficient_stock:%', (v_item ->> 'sku');
    end if;

    update public.product_variants
    set reserved_quantity = reserved_quantity + v_quantity
    where id = v_variant_id;
  end loop;

  insert into public.orders (
    user_id, guest_email, cart_id, status, subtotal, discount_amount,
    discount_code_id, shipping_cost, total, shipping_address, shipping_method
  ) values (
    p_user_id, p_guest_email, p_cart_id, 'pending_payment', p_subtotal, p_discount_amount,
    v_discount_code_id, p_shipping_cost, p_total, p_shipping_address, p_shipping_method
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  insert into public.order_items (
    order_id, product_variant_id, product_name_snapshot, variant_label_snapshot,
    unit_price_snapshot, quantity, sku_snapshot
  )
  select
    v_order_id,
    (item ->> 'variant_id')::uuid,
    item ->> 'product_name',
    item ->> 'variant_label',
    (item ->> 'unit_price')::numeric,
    (item ->> 'quantity')::int,
    item ->> 'sku'
  from jsonb_array_elements(p_items) as item;

  insert into public.order_status_history (order_id, status) values (v_order_id, 'pending_payment');

  return query select v_order_id, v_order_number;
end;
$$;

-- ============ POTWIERDZENIE PŁATNOŚCI (WYŁĄCZNIE PO WEBHOOKU STRIPE) ============
-- Bezpieczna do wywołania wiele razy z tym samym zamówieniem (dedupe
-- webhooków Stripe) — jeśli zamówienie nie jest już "pending_payment",
-- funkcja nic nie robi i zwraca false.
create or replace function public.mark_order_paid(p_order_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_updated int;
  v_item record;
  v_discount_code_id uuid;
  v_cart_id uuid;
begin
  update public.orders
  set status = 'paid'
  where id = p_order_id and status = 'pending_payment';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  for v_item in
    select product_variant_id, quantity from public.order_items where order_id = p_order_id
  loop
    if v_item.product_variant_id is not null then
      update public.product_variants
      set stock_quantity = stock_quantity - v_item.quantity,
          reserved_quantity = reserved_quantity - v_item.quantity
      where id = v_item.product_variant_id;
    end if;
  end loop;

  select discount_code_id, cart_id into v_discount_code_id, v_cart_id
  from public.orders where id = p_order_id;

  if v_discount_code_id is not null then
    update public.discount_codes set used_count = used_count + 1 where id = v_discount_code_id;
  end if;

  if v_cart_id is not null then
    delete from public.cart_items where cart_id = v_cart_id;
  end if;

  insert into public.order_status_history (order_id, status) values (p_order_id, 'paid');

  return true;
end;
$$;

-- ============ ZWOLNIENIE REZERWACJI (PŁATNOŚĆ ANULOWANA/NIEUDANA NA STAŁE) ============
create or replace function public.release_order_reservation(p_order_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_updated int;
  v_item record;
begin
  update public.orders
  set status = 'cancelled'
  where id = p_order_id and status = 'pending_payment';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  for v_item in
    select product_variant_id, quantity from public.order_items where order_id = p_order_id
  loop
    if v_item.product_variant_id is not null then
      update public.product_variants
      set reserved_quantity = reserved_quantity - v_item.quantity
      where id = v_item.product_variant_id;
    end if;
  end loop;

  insert into public.order_status_history (order_id, status) values (p_order_id, 'cancelled');

  return true;
end;
$$;

-- Te trzy funkcje mutują stany magazynowe i zamówienia — nie mogą być
-- wywoływane bezpośrednio z przeglądarki (kluczem publicznym). Wyłącznie
-- nasz serwer (klucz service_role) ma do nich dostęp.
revoke execute on function public.create_pending_order from public;
revoke execute on function public.mark_order_paid from public;
revoke execute on function public.release_order_reservation from public;

grant execute on function public.create_pending_order to service_role;
grant execute on function public.mark_order_paid to service_role;
grant execute on function public.release_order_reservation to service_role;
