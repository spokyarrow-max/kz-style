import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function CheckoutConfirmationPage(
  props: PageProps<"/checkout/potwierdzenie/[numer]">
) {
  const { numer } = await props.params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, user_id, status, subtotal, discount_amount, shipping_cost, total, guest_email")
    .eq("order_number", numer)
    .maybeSingle();

  if (!order) notFound();

  // Zamówienie złożone przez zalogowanego — tylko ten użytkownik (albo
  // nikt inny) może je zobaczyć. Zamówienie gościa — wymagamy ciasteczka
  // ustawionego chwilę wcześniej przy tworzeniu tego konkretnego
  // zamówienia, żeby numer zamówienia w adresie URL (łatwy do zgadnięcia,
  // bo kolejny numer w sekwencji) nie ujawniał cudzych danych.
  if (order.user_id) {
    const user = await getCurrentUser();
    if (!user || user.id !== order.user_id) notFound();
  } else {
    const cookieStore = await cookies();
    if (cookieStore.get("kz_last_order_number")?.value !== order.order_number) notFound();
  }

  const { data: items } = await admin
    .from("order_items")
    .select("product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity")
    .eq("order_id", order.id);

  const isPaid = order.status === "paid";

  return (
    <main className="mx-auto flex-1 max-w-2xl px-6 py-16 sm:px-10">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Zamówienie {order.order_number}
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        {isPaid ? "Dziękujemy za zamówienie!" : "Przetwarzamy Twoją płatność…"}
      </h1>
      <p className="mt-4 text-stone-400">
        {isPaid
          ? "Płatność testowa zakończyła się sukcesem. Potwierdzenie wysłalibyśmy na e-mail w prawdziwym sklepie."
          : "Jeśli ta strona nie zmieni się za chwilę, odśwież ją — czekamy na potwierdzenie od Stripe."}
      </p>

      <div className="mt-10 flex flex-col divide-y divide-stone-800 border-y border-stone-800">
        {(items ?? []).map((item, i) => (
          <div key={i} className="flex justify-between py-4">
            <div>
              <p className="text-stone-100">{item.product_name_snapshot}</p>
              <p className="font-mono text-xs text-stone-500">
                {item.variant_label_snapshot} × {item.quantity}
              </p>
            </div>
            <p className="font-mono text-sm text-stone-200">
              {formatPrice(item.unit_price_snapshot * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-1 font-mono text-sm text-stone-300">
        <div className="flex justify-between">
          <span>Suma częściowa</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-signal">
            <span>Rabat</span>
            <span>−{formatPrice(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Dostawa</span>
          <span>{order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between border-t border-stone-800 pt-2 text-lg text-stone-100">
          <span>Razem</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link
        href="/nowosci"
        className="mt-10 inline-block bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
      >
        Wróć do zakupów
      </Link>
    </main>
  );
}
