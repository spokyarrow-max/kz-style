"use client";

import { useTransition } from "react";
import { toggleDiscountActiveAction } from "@/app/actions/admin";

export function AdminDiscountToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleDiscountActiveAction(id, !isActive))}
      className={`font-mono text-xs uppercase disabled:opacity-50 ${
        isActive ? "text-signal hover:text-stone-100" : "text-stone-500 hover:text-stone-200"
      }`}
    >
      {isActive ? "Aktywny — wyłącz" : "Wyłączony — włącz"}
    </button>
  );
}
