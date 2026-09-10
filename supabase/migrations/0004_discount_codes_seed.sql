-- KZ Style — przykładowe kody rabatowe (Etap 6)

insert into public.discount_codes (code, type, value, is_active, min_order_value)
values
  ('FIRST10', 'percentage', 10, true, null),
  ('KZ20', 'fixed', 20, true, 100)
on conflict (code) do nothing;
