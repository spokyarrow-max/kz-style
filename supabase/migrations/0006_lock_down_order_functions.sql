-- KZ Style — Etap 10: poprawka bezpieczeństwa znaleziona podczas audytu.
--
-- Co było nie tak: migracja 0005 robiła tylko
-- "revoke execute ... from public", ale Supabase domyślnie dodaje
-- OSOBNE uprawnienie "execute" dla ról "anon" i "authenticated" przy
-- tworzeniu KAŻDEJ nowej funkcji (niezależnie od uprawnień roli
-- "public"). Efekt: mimo odebrania dostępu "public", każdy odwiedzający
-- stronę (nawet niezalogowany) mógł bezpośrednio wywołać
-- create_pending_order / mark_order_paid / release_order_reservation
-- z przeglądarki (np. przez konsolę deweloperską).
--
-- Realnej szkody to NIE powodowało — te funkcje same w sobie nie mają
-- podniesionych uprawnień (nie są "security definer"), więc i tak
-- działały z uprawnieniami wywołującego, a reguły RLS na tabelach
-- orders/product_variants i tak blokowały każdy faktyczny zapis dla
-- ról innych niż admin/service_role. Mimo to funkcje w ogóle nie
-- powinny być wywoływalne z przeglądarki — to properly domykamy.

revoke execute on function public.create_pending_order from anon, authenticated;
revoke execute on function public.mark_order_paid from anon, authenticated;
revoke execute on function public.release_order_reservation from anon, authenticated;
