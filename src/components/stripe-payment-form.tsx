"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createPaymentIntentAction } from "@/app/actions/payment";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

function PayButton({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!stripe || !elements || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Sprawdź poprawność danych płatności.");
      setIsSubmitting(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/api/checkout/finalize`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Płatność nie powiodła się. Spróbuj ponownie.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent) {
      window.location.href = `/api/checkout/finalize?payment_intent=${paymentIntent.id}`;
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <>
      {error && <p className="mt-4 font-mono text-sm text-signal">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isSubmitting}
        className="mt-6 w-full bg-signal px-6 py-4 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isSubmitting ? "Przetwarzanie…" : `Zapłać ${formatPrice(amount)}`}
      </button>
    </>
  );
}

export function StripePaymentForm() {
  const startedRef = useRef(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    createPaymentIntentAction().then((result) => {
      if (result.error || !result.clientSecret) {
        setError(result.error ?? "Nie udało się przygotować płatności.");
      } else {
        setClientSecret(result.clientSecret);
        setAmount(result.amount ?? 0);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="mt-8 font-mono text-sm text-stone-400">Przygotowywanie płatności…</p>;
  }

  if (error || !clientSecret) {
    return <p className="mt-8 font-mono text-sm text-signal">{error ?? "Coś poszło nie tak."}</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
      <PaymentElement />
      <PayButton amount={amount} />
    </Elements>
  );
}
