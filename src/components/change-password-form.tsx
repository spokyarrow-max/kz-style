"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/app/actions/account";

const initialState: ActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
      <div>
        <label htmlFor="password" className="font-mono text-xs uppercase text-stone-400">
          Nowe hasło (min. 8 znaków)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="font-mono text-xs uppercase text-stone-400">
          Powtórz nowe hasło
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </div>

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}
      {state.success && <p className="font-mono text-sm text-stone-300">Hasło zmienione.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Zmień hasło"}
      </button>
    </form>
  );
}
