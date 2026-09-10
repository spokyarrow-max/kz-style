"use client";

import { useActionState } from "react";
import { updateProductAction, type AdminActionState } from "@/app/actions/admin";
import type { AdminProductDetail } from "@/lib/admin/products";

const initialState: AdminActionState = {};

export function AdminProductForm({ product }: { product: AdminProductDetail }) {
  const [state, formAction, isPending] = useActionState(updateProductAction, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="slug" value={product.slug} />

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Nazwa</span>
        <input
          name="name"
          defaultValue={product.name}
          required
          className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase text-stone-400">Opis</span>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={3}
          className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase text-stone-400">Cena (zł)</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.price}
            required
            className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase text-stone-400">
            Cena przed promocją (opcjonalnie)
          </span>
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.compare_at_price ?? ""}
            className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6 font-mono text-xs uppercase text-stone-300">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={product.is_active} className="accent-signal" />
          Widoczny w sklepie
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isNew" defaultChecked={product.is_new} className="accent-signal" />
          Nowość
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isBestseller"
            defaultChecked={product.is_bestseller}
            className="accent-signal"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isLimitedDrop"
            defaultChecked={product.is_limited_drop}
            className="accent-signal"
          />
          Limited Drop
        </label>
      </div>

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}
      {state.success && <p className="font-mono text-sm text-stone-400">Zapisano.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Zapisz zmiany"}
      </button>
    </form>
  );
}
