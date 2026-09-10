"use client";

import { useActionState, useEffect, useState } from "react";
import { applyDiscountAction, removeDiscountAction, type CheckoutActionState } from "@/app/actions/checkout";

const initialState: CheckoutActionState = {};

export function DiscountForm({ appliedCode }: { appliedCode: string | null }) {
  const [state, formAction, isPending] = useActionState(applyDiscountAction, initialState);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt((n) => n + 1);
  }, [state]);

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between border border-signal px-3 py-2.5">
        <span className="font-mono text-sm text-signal">{appliedCode}</span>
        <form action={removeDiscountAction}>
          <button type="submit" className="font-mono text-xs uppercase text-stone-400 underline hover:text-signal">
            Usuń
          </button>
        </form>
      </div>
    );
  }

  return (
    <form key={attempt} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="code"
          placeholder="Kod rabatowy"
          className="w-full border border-stone-700 bg-stone-900 px-3 py-2.5 font-mono text-sm uppercase text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 border border-stone-700 px-4 py-2.5 font-mono text-xs uppercase text-stone-200 hover:border-signal hover:text-signal disabled:opacity-60"
        >
          {isPending ? "…" : "Zastosuj"}
        </button>
      </div>
      {state.error && <p className="font-mono text-xs text-signal">{state.error}</p>}
    </form>
  );
}
