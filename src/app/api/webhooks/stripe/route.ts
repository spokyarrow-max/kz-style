import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// To jedyne miejsce, które NAPRAWDĘ potwierdza płatność — nigdy klient
// (przeglądarka). Stripe podpisuje każde zdarzenie swoim sekretem
// (STRIPE_WEBHOOK_SECRET); jeśli podpis się nie zgadza, odrzucamy
// żądanie — inaczej ktokolwiek mógłby wysłać nam fałszywe "zapłacono".
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Brak podpisu." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy podpis webhooka." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Stripe czasem wysyła to samo zdarzenie więcej niż raz — unikalny
  // indeks na stripe_event_id sprawia, że drugi zapis się nie uda,
  // i wtedy po prostu nic więcej nie robimy (już to obsłużyliśmy).
  const { error: dedupeError } = await admin.from("payment_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (dedupeError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.canceled") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", intent.id)
      .maybeSingle();

    if (order) {
      if (event.type === "payment_intent.succeeded") {
        await admin.rpc("mark_order_paid", { p_order_id: order.id });
      } else {
        await admin.rpc("release_order_reservation", { p_order_id: order.id });
      }
    }
  }

  return NextResponse.json({ received: true });
}
