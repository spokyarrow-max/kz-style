import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCheckoutDraft } from "@/lib/checkout";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutSteps } from "@/components/checkout-steps";
import { CustomerInfoForm } from "@/components/customer-info-form";

export default async function CheckoutCustomerPage() {
  const items = await getCart();
  if (items.length === 0) redirect("/koszyk");

  const [draft, user] = await Promise.all([getCheckoutDraft(), getCurrentUser()]);
  const defaultEmail = user?.email ?? draft.email ?? "";

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl font-black uppercase text-stone-100">Checkout</h1>
      <CheckoutSteps current="/checkout/dane" />

      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-stone-400">
        Krok 1 — Dane kontaktowe
      </p>
      <CustomerInfoForm defaultEmail={defaultEmail} isLoggedIn={!!user} />
    </main>
  );
}
