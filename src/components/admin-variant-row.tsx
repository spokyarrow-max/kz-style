"use client";

import { useActionState } from "react";
import { updateVariantAction, type AdminActionState } from "@/app/actions/admin";
import type { AdminProductVariant } from "@/lib/admin/products";

const initialState: AdminActionState = {};

export function AdminVariantRow({ variant, slug }: { variant: AdminProductVariant; slug: string }) {
  const [state, formAction, isPending] = useActionState(updateVariantAction, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-stone-900 py-3 text-sm"
    >
      <input type="hidden" name="variantId" value={variant.id} />
      <input type="hidden" name="slug" value={slug} />

      <div>
        <p className="text-stone-100">
          {variant.color_name}
          {variant.size ? ` / ${variant.size}` : ""}
        </p>
        <p className="font-mono text-xs text-stone-500">{variant.sku}</p>
        {variant.reserved_quantity > 0 && (
          <p className="font-mono text-xs text-stone-500">
            (w tym {variant.reserved_quantity} zarezerwowane)
          </p>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase text-stone-500">Stan</span>
        <input
          name="stockQuantity"
          type="number"
          min={variant.reserved_quantity}
          defaultValue={variant.stock_quantity}
          className="w-20 border border-stone-700 bg-stone-900 px-2 py-1.5 text-stone-100 focus:border-signal focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 font-mono text-xs uppercase text-stone-300">
        <input type="checkbox" name="isActive" defaultChecked={variant.is_active} className="accent-signal" />
        Aktywny
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="border border-stone-700 px-3 py-1.5 font-mono text-xs uppercase text-stone-200 hover:border-signal hover:text-signal disabled:opacity-60"
      >
        {isPending ? "…" : "Zapisz"}
      </button>

      {state.error && (
        <p className="col-span-4 font-mono text-xs text-signal">{state.error}</p>
      )}
    </form>
  );
}
