import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCheckoutDraft } from "@/lib/checkout";
import { getCheckoutSummary } from "@/lib/checkout-summary";
import { CheckoutSteps } from "@/components/checkout-steps";
import { DiscountForm } from "@/components/discount-form";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function CheckoutSummaryPage() {
  const items = await getCart();
  if (items.length === 0) redirect("/koszyk");

  const draft = await getCheckoutDraft();
  if (!draft.email) redirect("/checkout/dane");
  if (!draft.address || !draft.shippingMethod) redirect("/checkout/dostawa");

  const summary = await getCheckoutSummary();

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl font-black uppercase text-stone-100">Checkout</h1>
      <CheckoutSteps current="/checkout" />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
              Dane kontaktowe
            </p>
            <Link href="/checkout/dane" className="font-mono text-xs text-signal hover:text-stone-100">
              Zmień
            </Link>
          </div>
          <p className="mt-2 text-stone-200">{draft.email}</p>

          <div className="mt-8 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
              Adres i dostawa
            </p>
            <Link
              href="/checkout/dostawa"
              className="font-mono text-xs text-signal hover:text-stone-100"
            >
              Zmień
            </Link>
          </div>
          <p className="mt-2 text-stone-200">
            {draft.address.recipientName}
            <br />
            {draft.address.street}, {draft.address.postalCode} {draft.address.city}
          </p>
          <p className="mt-2 font-mono text-sm text-stone-400">{summary.shippingMethodLabel}</p>

          <div className="mt-10 border-t border-stone-800 pt-6">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
              Produkty ({items.length})
            </p>
            <div className="mt-4 flex flex-col divide-y divide-stone-800">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-3">
                  <div>
                    <p className="text-stone-100">{item.product.name}</p>
                    <p className="font-mono text-xs text-stone-500">
                      {item.variant.color_name}
                      {item.variant.size ? ` · ${item.variant.size}` : ""} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-stone-200">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit border border-stone-800 p-6">
          <p className="font-display text-xl font-bold uppercase text-stone-100">Podsumowanie</p>

          <div className="mt-4">
            <DiscountForm appliedCode={summary.discountCode} />
          </div>

          <div className="mt-6 flex flex-col gap-2 font-mono text-sm text-stone-300">
            <div className="flex justify-between">
              <span>Suma częściowa</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </div>
            {summary.discountAmount > 0 && (
              <div className="flex justify-between text-signal">
                <span>Rabat</span>
                <span>−{formatPrice(summary.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Dostawa</span>
              <span>{summary.shippingCost === 0 ? "Gratis" : formatPrice(summary.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-800 pt-2 text-lg text-stone-100">
              <span>Razem</span>
              <span>{formatPrice(summary.total)}</span>
            </div>
          </div>

          <Link
            href="/checkout/platnosc"
            className="mt-6 block w-full bg-signal px-6 py-4 text-center font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
          >
            Przejdź do płatności
          </Link>
        </div>
      </div>
    </main>
  );
}
