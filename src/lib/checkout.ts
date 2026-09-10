import "server-only";
import { cookies } from "next/headers";
import type { ShippingAddress, ShippingMethod } from "@/lib/shipping";

const DRAFT_COOKIE = "kz_checkout_draft";
const DRAFT_COOKIE_MAX_AGE = 60 * 60 * 24; // 1 dzień — dane robocze, nie trzymamy ich długo

export interface CheckoutDraft {
  email?: string;
  address?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  discountCode?: string;
  /** Ustawiane po utworzeniu zamówienia "pending_payment" — pozwala
   * ponownie użyć tego samego PaymentIntent, jeśli klient odświeży
   * stronę płatności zamiast tworzyć drugą rezerwację stanu. */
  pendingOrderId?: string;
}

/** Bezpieczne wszędzie — tylko odczyt. */
export async function getCheckoutDraft(): Promise<CheckoutDraft> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DRAFT_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return {};
  }
}

/** Zapisuje/scala dane robocze checkoutu. Wywoływać WYŁĄCZNIE z Server Actions. */
export async function saveCheckoutDraft(patch: Partial<CheckoutDraft>): Promise<void> {
  const cookieStore = await cookies();
  const current = await getCheckoutDraft();
  const next = { ...current, ...patch };

  cookieStore.set(DRAFT_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DRAFT_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearCheckoutDraft(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DRAFT_COOKIE);
}
