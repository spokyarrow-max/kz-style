import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCart, findCartId } from "@/lib/cart";
import { getCheckoutDraft, saveCheckoutDraft } from "@/lib/checkout";
import { getCheckoutSummary } from "@/lib/checkout-summary";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe/server";

export interface PaymentIntentResult {
  error?: string;
  clientSecret?: string;
  orderNumber?: string;
  amount?: number;
}

/**
 * Zwraca dane potrzebne do wyświetlenia formularza płatności Stripe.
 * Jeśli klient już wcześniej odświeżył tę stronę, ponownie używa tego
 * samego zamówienia/PaymentIntent zamiast rezerwować stan drugi raz.
 */
export async function getOrCreatePaymentIntent(): Promise<PaymentIntentResult> {
  const items = await getCart();
  if (items.length === 0) return { error: "Koszyk jest pusty." };

  const draft = await getCheckoutDraft();
  if (!draft.email || !draft.address || !draft.shippingMethod) {
    return { error: "Uzupełnij wcześniejsze kroki checkoutu." };
  }

  const summary = await getCheckoutSummary();
  const admin = createAdminClient();
  const user = await getCurrentUser();

  if (draft.pendingOrderId) {
    const { data: existingOrder } = await admin
      .from("orders")
      .select("id, order_number, status, total, stripe_payment_intent_id")
      .eq("id", draft.pendingOrderId)
      .maybeSingle();

    if (existingOrder && existingOrder.status === "pending_payment" && existingOrder.stripe_payment_intent_id) {
      const sameTotal = Math.abs(existingOrder.total - summary.total) < 0.01;
      if (sameTotal) {
        const intent = await stripe.paymentIntents.retrieve(existingOrder.stripe_payment_intent_id);
        if (intent.status !== "succeeded" && intent.status !== "canceled") {
          return {
            clientSecret: intent.client_secret!,
            orderNumber: existingOrder.order_number,
            amount: summary.total,
          };
        }
      } else {
        // Koszyk/rabat zmienił się od czasu tamtej rezerwacji — zwolnij ją.
        await admin.rpc("release_order_reservation", { p_order_id: existingOrder.id });
      }
    }
  }

  const cartId = await findCartId();

  const orderItems = items.map((item) => ({
    variant_id: item.variant.id,
    quantity: item.quantity,
    product_name: item.product.name,
    variant_label: item.variant.size
      ? `${item.variant.color_name} / ${item.variant.size}`
      : item.variant.color_name,
    unit_price: item.product.price,
    sku: item.variant.sku,
  }));

  const { data: created, error: createError } = await admin.rpc("create_pending_order", {
    p_user_id: user?.id ?? null,
    p_guest_email: user ? null : draft.email,
    p_cart_id: cartId,
    p_shipping_address: draft.address as unknown as Record<string, unknown>,
    p_shipping_method: draft.shippingMethod,
    p_subtotal: summary.subtotal,
    p_discount_amount: summary.discountAmount,
    p_discount_code: summary.discountCode,
    p_shipping_cost: summary.shippingCost,
    p_total: summary.total,
    p_items: orderItems,
  });

  if (createError || !created || created.length === 0) {
    if (createError?.message.includes("insufficient_stock")) {
      return { error: "Niestety, część produktów w koszyku właśnie się wyprzedała." };
    }
    return { error: "Nie udało się przygotować zamówienia. Spróbuj ponownie." };
  }

  const { order_id: orderId, order_number: orderNumber } = created[0];

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(summary.total * 100),
    currency: "pln",
    automatic_payment_methods: { enabled: true },
    metadata: { order_id: orderId, order_number: orderNumber },
  });

  await admin.from("orders").update({ stripe_payment_intent_id: intent.id }).eq("id", orderId);
  await saveCheckoutDraft({ pendingOrderId: orderId });

  return { clientSecret: intent.client_secret!, orderNumber, amount: summary.total };
}
