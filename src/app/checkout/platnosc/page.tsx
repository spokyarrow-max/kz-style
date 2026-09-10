import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCheckoutDraft } from "@/lib/checkout";
import { getCheckoutSummary } from "@/lib/checkout-summary";
import { CheckoutSteps } from "@/components/checkout-steps";
import { StripePaymentForm } from "@/components/stripe-payment-form";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function CheckoutPaymentPage() {
  const items = await getCart();
  if (items.length === 0) redirect("/koszyk");

  const draft = await getCheckoutDraft();
  if (!draft.email) redirect("/checkout/dane");
  if (!draft.address || !draft.shippingMethod) redirect("/checkout/dostawa");

  const summary = await getCheckoutSummary();

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl font-black uppercase text-stone-100">Checkout</h1>
      <CheckoutSteps current="/checkout/platnosc" />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Płatność</p>
          <p className="mt-2 max-w-md text-sm text-stone-400">
            Jesteśmy w trybie testowym Stripe — żadne prawdziwe pieniądze się nie ruszają. Użyj
            karty testowej <span className="text-stone-200">4242 4242 4242 4242</span>, dowolnej
            przyszłej daty ważności i dowolnego CVC.
          </p>
          <StripePaymentForm />
        </div>

        <div className="h-fit border border-stone-800 p-6">
          <p className="font-display text-xl font-bold uppercase text-stone-100">Podsumowanie</p>
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
        </div>
      </div>
    </main>
  );
}
