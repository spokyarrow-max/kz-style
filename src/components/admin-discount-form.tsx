"use client";

import { useActionState, useEffect, useState } from "react";
import { createDiscountCodeAction, type AdminActionState } from "@/app/actions/admin";

const initialState: AdminActionState = {};

export function AdminDiscountForm() {
  const [state, formAction, isPending] = useActionState(createDiscountCodeAction, initialState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (state.success) setAttempt((n) => n + 1);
  }, [state]);

  return (
    <form key={attempt} action={formAction} className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Kod</span>
        <input
          name="code"
          placeholder="np. LATO25"
          required
          className="w-40 border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Typ</span>
        <select
          name="type"
          className="border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
        >
          <option value="percentage">Procentowy (%)</option>
          <option value="fixed">Kwotowy (zł)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Wartość</span>
        <input
          name="value"
          type="number"
          step="0.01"
          min="0"
          required
          className="w-24 border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Min. zamówienie</span>
        <input
          name="minOrderValue"
          type="number"
          step="0.01"
          min="0"
          className="w-28 border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Limit użyć</span>
        <input
          name="maxUses"
          type="number"
          min="1"
          className="w-24 border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="bg-signal px-5 py-2.5 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Dodawanie…" : "Dodaj kod"}
      </button>

      {state.error && <p className="w-full font-mono text-sm text-signal">{state.error}</p>}
    </form>
  );
}
