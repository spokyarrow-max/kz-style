import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Cel, do którego Stripe.js kieruje przeglądarkę po próbie płatności.
// Nigdy nie ufamy samemu faktowi przekierowania — status płatności
// sprawdzamy tu jeszcze raz bezpośrednio w Stripe (serwer-serwer),
// zanim cokolwiek zmienimy w bazie. To działa równolegle z webhookiem
// (src/app/api/webhooks/stripe/route.ts), który jest głównym źródłem
// prawdy — obie ścieżki wołają tę samą, bezpieczną w powtórzeniach
// funkcję bazodanową.
export async function GET(request: NextRequest) {
  const paymentIntentId = request.nextUrl.searchParams.get("payment_intent");
  const origin = request.nextUrl.origin;

  if (!paymentIntentId) {
    return NextResponse.redirect(new URL("/checkout", origin));
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(new URL("/checkout", origin));
  }

  if (intent.status === "succeeded") {
    await admin.rpc("mark_order_paid", { p_order_id: order.id });
  } else if (intent.status === "canceled") {
    await admin.rpc("release_order_reservation", { p_order_id: order.id });
  }

  const response = NextResponse.redirect(
    new URL(`/checkout/potwierdzenie/${order.order_number}`, origin)
  );
  response.cookies.delete("kz_checkout_draft");
  response.cookies.set("kz_last_order_number", order.order_number, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });
  return response;
}
