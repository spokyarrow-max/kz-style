"use server";

import { getOrCreatePaymentIntent, type PaymentIntentResult } from "@/lib/orders";

export async function createPaymentIntentAction(): Promise<PaymentIntentResult> {
  return getOrCreatePaymentIntent();
}
