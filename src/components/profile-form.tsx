"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/app/actions/account";

const initialState: ActionState = {};

export function ProfileForm({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
      <div>
        <label className="font-mono text-xs uppercase text-stone-400">E-mail</label>
        <input
          value={email}
          disabled
          className="mt-1 w-full border border-stone-800 bg-stone-950 px-3 py-2.5 text-stone-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="font-mono text-xs uppercase text-stone-400">
            Imię
          </label>
          <input
            id="firstName"
            name="firstName"
            defaultValue={firstName}
            required
            className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="font-mono text-xs uppercase text-stone-400">
            Nazwisko
          </label>
          <input
            id="lastName"
            name="lastName"
            defaultValue={lastName}
            required
            className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
          />
        </div>
      </div>

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}
      {state.success && <p className="font-mono text-sm text-stone-300">Zapisano.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Zapisz zmiany"}
      </button>
    </form>
  );
}
