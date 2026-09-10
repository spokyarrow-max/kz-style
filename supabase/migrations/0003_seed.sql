-- KZ Style — dane demonstracyjne (Etap 3)

insert into public.categories (slug, name, sort_order) values
  ('t-shirty', 'T-shirty', 1),
  ('bluzy', 'Bluzy', 2),
  ('kurtki', 'Kurtki', 3),
  ('spodnie-cargo', 'Spodnie cargo', 4),
  ('czapki', 'Czapki i nakrycia głowy', 5),
  ('lancuchy', 'Łańcuchy', 6),
  ('naszyjniki', 'Naszyjniki', 7),
  ('pierscionki', 'Pierścionki', 8)
on conflict (slug) do nothing;

insert into public.products
  (slug, name, description, category_id, gender, price, compare_at_price, material_info, fit_info, is_new, is_bestseller, is_limited_drop)
values
  ('riot-hoodie-black', 'KZ Riot Hoodie', 'Ciężka bluza z kapturem, 420 g/m², z nadrukiem "RIOT" na plecach.', (select id from public.categories where slug = 'bluzy'), 'unisex', 329.00, null, '80% bawełna, 20% poliester, 420 g/m²', 'Oversize', true, true, false),
  ('beton-tee-white', 'KZ Beton Tee', 'T-shirt z ciężkiej bawełny czesanej, nadruk "BETON" na przodzie.', (select id from public.categories where slug = 't-shirty'), 'unisex', 159.00, 189.00, '100% bawełna czesana, 220 g/m²', 'Regular', false, true, false),
  ('nightshift-tee-black', 'KZ Nightshift Tee', 'Czarny t-shirt z drobnym haftem logo na piersi.', (select id from public.categories where slug = 't-shirty'), 'men', 149.00, null, '100% bawełna, 200 g/m²', 'Regular', false, false, false),
  ('warszawa-cargo-khaki', 'KZ Warszawa Cargo', 'Spodnie cargo z wieloma kieszeniami, ripstop.', (select id from public.categories where slug = 'spodnie-cargo'), 'men', 379.00, null, '100% nylon ripstop', 'Relaxed', true, false, false),
  ('blok-jacket-grey', 'KZ Blok Jacket', 'Kurtka typu bomber inspirowana architekturą blokowisk.', (select id from public.categories where slug = 'kurtki'), 'unisex', 649.00, null, 'Zewnętrze: nylon, Podszewka: poliester', 'Regular', false, true, true),
  ('signal-hoodie-orange', 'KZ Signal Hoodie', 'Limitowana bluza w sygnałowym pomarańczu, edycja Drop 001.', (select id from public.categories where slug = 'bluzy'), 'unisex', 359.00, null, '100% bawełna organiczna, 400 g/m²', 'Oversize', true, false, true),
  ('miejska-tee-women-black', 'KZ Miejska Tee', 'Damski t-shirt o dopasowanym kroju, krótszy fason.', (select id from public.categories where slug = 't-shirty'), 'women', 149.00, null, '95% bawełna, 5% elastan', 'Fitted', false, true, false),
  ('kwiat-betonu-hoodie-women', 'KZ Kwiat Betonu Hoodie', 'Damska bluza z haftowaną grafiką, dopasowany krój.', (select id from public.categories where slug = 'bluzy'), 'women', 339.00, 379.00, '80% bawełna, 20% poliester', 'Cropped', false, false, false),
  ('nizinna-cap-black', 'KZ Nizinna Cap', 'Czapka z daszkiem, haftowane logo, regulowany pasek.', (select id from public.categories where slug = 'czapki'), 'unisex', 119.00, null, '100% bawełna', null, false, false, false),
  ('riot-chain-silver', 'KZ Riot Chain', 'Gruby łańcuch ze stali chirurgicznej, nie ciemnieje.', (select id from public.categories where slug = 'lancuchy'), 'men', 219.00, null, 'Stal chirurgiczna 316L', null, true, false, false),
  ('betonowa-zawieszka-necklace', 'KZ Betonowa Zawieszka', 'Naszyjnik z minimalistyczną zawieszką w kształcie płyty.', (select id from public.categories where slug = 'naszyjniki'), 'women', 149.00, null, 'Stal chirurgiczna 316L, pozłacana', null, false, false, false),
  ('sygnal-ring-orange', 'KZ Sygnał Ring', 'Pierścionek z emaliowanym pomarańczowym akcentem.', (select id from public.categories where slug = 'pierscionki'), 'women', 99.00, null, 'Stal chirurgiczna 316L, emalia', null, true, false, false)
on conflict (slug) do nothing;

-- Warianty (kolor + rozmiar + stan magazynowy) dla każdego produktu.
insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, v.color_name, v.color_hex, v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (
  values
    ('Czarny', '#111111', 'S', 6),
    ('Czarny', '#111111', 'M', 10),
    ('Czarny', '#111111', 'L', 8),
    ('Czarny', '#111111', 'XL', 3)
) as v(color_name, color_hex, size, stock)
where p.slug in ('riot-hoodie-black', 'nightshift-tee-black', 'nizinna-cap-black')
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Biały', '#f2f0ea', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('S', 5), ('M', 9), ('L', 7), ('XL', 2)) as v(size, stock)
where p.slug = 'beton-tee-white'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Khaki', '#6b6650', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('S', 4), ('M', 8), ('L', 6), ('XL', 0)) as v(size, stock)
where p.slug = 'warszawa-cargo-khaki'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Szary', '#8f887c', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('S', 3), ('M', 6), ('L', 5), ('XL', 2)) as v(size, stock)
where p.slug = 'blok-jacket-grey'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Pomarańczowy', '#ff5a1f', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('S', 2), ('M', 4), ('L', 4), ('XL', 1)) as v(size, stock)
where p.slug = 'signal-hoodie-orange'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Czarny', '#111111', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('XS', 4), ('S', 7), ('M', 6), ('L', 3)) as v(size, stock)
where p.slug in ('miejska-tee-women-black')
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select p.id, 'Écru', '#d8d2c6', v.size, p.slug || '-' || lower(v.size), v.stock
from public.products p
cross join (values ('XS', 3), ('S', 5), ('M', 4), ('L', 2)) as v(size, stock)
where p.slug = 'kwiat-betonu-hoodie-women'
on conflict (sku) do nothing;

-- Biżuteria — bez rozmiarów, jeden wariant "uniwersalny".
insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select id, 'Srebrny', '#c7c7c7', null, slug || '-uniw', 12 from public.products where slug = 'riot-chain-silver'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select id, 'Złoty', '#c9a24a', null, slug || '-uniw', 9 from public.products where slug = 'betonowa-zawieszka-necklace'
on conflict (sku) do nothing;

insert into public.product_variants (product_id, color_name, color_hex, size, sku, stock_quantity)
select id, 'Pomarańczowy', '#ff5a1f', null, slug || '-uniw', 15 from public.products where slug = 'sygnal-ring-orange'
on conflict (sku) do nothing;
