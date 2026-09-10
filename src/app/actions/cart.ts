"use server";

import { revalidatePath } from "next/cache";
import { addToCart, removeCartItem, updateCartItemQuantity } from "@/lib/cart";

export async function addToCartAction(variantId: string, quantity: number) {
  const result = await addToCart(variantId, quantity);
  revalidatePath("/", "layout");
  return result;
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const result = await updateCartItemQuantity(itemId, quantity);
  revalidatePath("/", "layout");
  return result;
}

export async function removeCartItemAction(itemId: string) {
  await removeCartItem(itemId);
  revalidatePath("/", "layout");
}
