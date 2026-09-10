"use client";

import { useActionState } from "react";
import { addAddressAction, type ActionState } from "@/app/actions/account";

const initialState: ActionState = {};

export function AddressForm() {
  const [state, formAction, isPending] = useActionState(addAddressAction, initialState);

  return (
    <form action={formAction} className="mt-8 flex max-w-md flex-col gap-4 border-t border-stone-800 pt-6">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Nowy adres</p>

      <input
        name="label"
        placeholder="Etykieta (np. Dom, Praca) — opcjonalnie"
        className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
      />
      <input
        name="recipientName"
        placeholder="Imię i nazwisko odbiorcy"
        required
        className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
      />
      <input
        name="street"
        placeholder="Ulica i numer"
        required
        className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          name="postalCode"
          placeholder="Kod pocztowy"
          required
          className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
        />
        <input
          name="city"
          placeholder="Miasto"
          required
          className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
        />
      </div>
      <input
        name="phone"
        placeholder="Telefon — opcjonalnie"
        className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
      />

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Dodaj adres"}
      </button>
    </form>
  );
}
