"use client";

import { useActionState } from "react";
import { updateOrderStatusAction, type AdminActionState } from "@/app/actions/admin";
import type { OrderStatus } from "@/types/database.types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Oczekuje na płatność",
  paid: "Opłacone",
  processing: "W przygotowaniu",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
  returned: "Zwrócone",
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const initialState: AdminActionState = {};

export function AdminOrderStatusForm({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: OrderStatus;
}) {
  const [state, formAction, isPending] = useActionState(updateOrderStatusAction, initialState);
  const options = TRANSITIONS[currentStatus];

  if (options.length === 0) {
    return (
      <p className="font-mono text-xs text-stone-500">
        Status &bdquo;{STATUS_LABELS[currentStatus]}&rdquo; jest końcowy — nic tu nie da się zmienić.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <select
        name="status"
        defaultValue={options[0]}
        className="border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-sm text-stone-100 focus:border-signal focus:outline-none"
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="bg-signal px-5 py-2 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Zmień status"}
      </button>
      {state.error && <p className="font-mono text-xs text-signal">{state.error}</p>}
      {state.success && <p className="font-mono text-xs text-stone-400">Zapisano.</p>}
    </form>
  );
}
