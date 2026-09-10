"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { saveCustomerInfoAction, type CheckoutActionState } from "@/app/actions/checkout";

const initialState: CheckoutActionState = {};

export function CustomerInfoForm({
  defaultEmail,
  isLoggedIn,
}: {
  defaultEmail: string;
  isLoggedIn: boolean;
}) {
  const [state, formAction, isPending] = useActionState(saveCustomerInfoAction, initialState);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt((n) => n + 1);
  }, [state]);

  return (
    <div>
      <form key={attempt} action={formAction} className="mt-8 flex max-w-md flex-col gap-4">
        <div>
          <label htmlFor="email" className="font-mono text-xs uppercase text-stone-400">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            readOnly={isLoggedIn}
            defaultValue={defaultEmail}
            className={`mt-1 w-full border border-stone-700 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none ${
              isLoggedIn ? "bg-stone-950 text-stone-400" : "bg-stone-900"
            }`}
          />
          {isLoggedIn && (
            <p className="mt-1 font-mono text-[11px] text-stone-500">
              Zalogowany jako {defaultEmail}
            </p>
          )}
        </div>

        {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-fit bg-signal px-8 py-3.5 font-display text-lg font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
        >
          {isPending ? "Zapisywanie…" : "Dalej: dostawa"}
        </button>
      </form>

      {!isLoggedIn && (
        <p className="mt-6 font-mono text-sm text-stone-400">
          Masz konto?{" "}
          <Link href="/logowanie?next=/checkout/dane" className="text-signal hover:text-stone-100">
            Zaloguj się
          </Link>{" "}
          dla szybszego checkoutu.
        </p>
      )}
    </div>
  );
}
