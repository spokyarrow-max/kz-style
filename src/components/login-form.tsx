"use client";

import { useActionState, useEffect, useState } from "react";
import { signInAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  // React czyści niekontrolowane pola po każdym wywołaniu akcji — licznik
  // prób wymusza ponowne "zamontowanie" formularza z przywróconym e-mailem.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt((n) => n + 1);
  }, [state]);

  return (
    <form key={attempt} action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="font-mono text-xs uppercase text-stone-400">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state.values?.email}
          className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="font-mono text-xs uppercase text-stone-400">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </div>

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 bg-signal px-6 py-3.5 font-display text-lg font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Logowanie…" : "Zaloguj się"}
      </button>
    </form>
  );
}
