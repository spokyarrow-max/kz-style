import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getCheckoutDraft } from "@/lib/checkout";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckoutSteps } from "@/components/checkout-steps";
import { ShippingForm } from "@/components/shipping-form";

export default async function CheckoutShippingPage() {
  const items = await getCart();
  if (items.length === 0) redirect("/koszyk");

  const [draft, user] = await Promise.all([getCheckoutDraft(), getCurrentUser()]);
  if (!draft.email) redirect("/checkout/dane");

  let addresses: any[] = [];
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("addresses")
      .select("id, label, recipient_name, street, city, postal_code, phone, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    addresses = data ?? [];
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-4xl font-black uppercase text-stone-100">Checkout</h1>
      <CheckoutSteps current="/checkout/dostawa" />

      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-stone-400">
        Krok 2 — Adres i dostawa
      </p>
      <ShippingForm
        addresses={addresses}
        subtotal={subtotal}
        defaultMethod={draft.shippingMethod ?? "standard"}
        defaultAddress={draft.address}
      />
    </main>
  );
}
