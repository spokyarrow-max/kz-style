import "server-only";
import { getCart, type CartItemView } from "@/lib/cart";
import { getCheckoutDraft } from "@/lib/checkout";
import { getShippingCost, SHIPPING_METHODS } from "@/lib/shipping";
import { validateDiscountCode } from "@/lib/discounts";

export interface CheckoutSummary {
  items: CartItemView[];
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shippingMethodLabel: string | null;
  shippingCost: number;
  total: number;
}

export async function getCheckoutSummary(): Promise<CheckoutSummary> {
  const [items, draft] = await Promise.all([getCart(), getCheckoutDraft()]);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  let discountCode: string | null = null;
  if (draft.discountCode) {
    const result = await validateDiscountCode(draft.discountCode, subtotal);
    if (result.valid) {
      discountAmount = result.amount;
      discountCode = result.code;
    }
  }

  const shippingMethod = draft.shippingMethod ?? null;
  const shippingCost = shippingMethod
    ? getShippingCost(shippingMethod, subtotal - discountAmount)
    : 0;

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return {
    items,
    subtotal,
    discountCode,
    discountAmount,
    shippingMethodLabel: shippingMethod ? SHIPPING_METHODS[shippingMethod].label : null,
    shippingCost,
    total,
  };
}
