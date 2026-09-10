"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveCheckoutDraft } from "@/lib/checkout";
import type { ShippingMethod } from "@/lib/shipping";
import { validateDiscountCode } from "@/lib/discounts";
import { getCart } from "@/lib/cart";
import { emailSchema, shippingAddressSchema, firstIssueMessage } from "@/lib/validation";

export interface CheckoutActionState {
  error?: string;
  success?: boolean;
  discountLabel?: string;
}

export async function saveCustomerInfoAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  await saveCheckoutDraft({ email: parsed.data });
  redirect("/checkout/dostawa");
}

export async function saveShippingAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const shippingMethod = String(formData.get("shippingMethod") ?? "standard") as ShippingMethod;
  const savedAddressId = String(formData.get("savedAddressId") ?? "");

  if (savedAddressId) {
    const supabase = await createClient();
    const { data: address } = await supabase
      .from("addresses")
      .select("recipient_name, street, city, postal_code, phone")
      .eq("id", savedAddressId)
      .maybeSingle();

    if (!address) return { error: "Wybrany adres nie istnieje." };

    await saveCheckoutDraft({
      shippingMethod,
      address: {
        recipientName: address.recipient_name,
        street: address.street,
        city: address.city,
        postalCode: address.postal_code,
        phone: address.phone ?? "",
      },
    });
    redirect("/checkout");
  }

  const parsed = shippingAddressSchema.safeParse({
    recipientName: formData.get("recipientName"),
    street: formData.get("street"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  await saveCheckoutDraft({ shippingMethod, address: parsed.data });
  redirect("/checkout");
}

export async function applyDiscountAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const code = String(formData.get("code") ?? "").trim();
  const items = await getCart();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const result = await validateDiscountCode(code, subtotal);
  if (!result.valid) {
    return { error: result.error ?? "Nieprawidłowy kod." };
  }

  await saveCheckoutDraft({ discountCode: result.code });
  revalidatePath("/checkout");
  return {
    success: true,
    discountLabel:
      result.type === "percentage" ? `${result.code} zastosowany` : `${result.code} zastosowany`,
  };
}

export async function removeDiscountAction() {
  await saveCheckoutDraft({ discountCode: undefined });
  revalidatePath("/checkout");
}
