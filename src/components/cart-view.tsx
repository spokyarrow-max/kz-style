"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { CartItemView } from "@/lib/cart";
import { removeCartItemAction, updateCartItemAction } from "@/app/actions/cart";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

function CartRow({ item }: { item: CartItemView }) {
  const [isPending, startTransition] = useTransition();

  function changeQuantity(delta: number) {
    const next = item.quantity + delta;
    startTransition(async () => {
      await updateCartItemAction(item.id, next);
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItemAction(item.id);
    });
  }

  return (
    <div
      className={`flex gap-4 border-b border-stone-800 py-6 transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="flex h-24 w-20 shrink-0 items-center justify-center border border-stone-800 bg-stone-900">
        <span className="font-display text-lg font-black text-stone-700">KZ</span>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/produkt/${item.product.slug}`}
              className="font-display text-lg font-bold uppercase text-stone-100 hover:text-signal"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 font-mono text-xs text-stone-400">
              {item.variant.color_name}
              {item.variant.size ? ` · ${item.variant.size}` : ""}
            </p>
          </div>
          <p className="font-mono text-sm text-stone-200">
            {formatPrice(item.product.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-stone-700">
            <button
              type="button"
              onClick={() => changeQuantity(-1)}
              disabled={isPending}
              className="px-3 py-1.5 font-mono text-stone-200 hover:text-signal disabled:opacity-40"
              aria-label="Zmniejsz ilość"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center font-mono text-sm text-stone-100">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity(1)}
              disabled={isPending || item.quantity >= item.variant.availableStock}
              className="px-3 py-1.5 font-mono text-stone-200 hover:text-signal disabled:opacity-40"
              aria-label="Zwiększ ilość"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="font-mono text-xs uppercase text-stone-500 underline hover:text-signal"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartView({ items }: { items: CartItemView[] }) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mt-12">
        <p className="text-stone-400">Twój koszyk jest pusty.</p>
        <Link
          href="/nowosci"
          className="mt-6 inline-block bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
        >
          Zobacz kolekcję
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
      <div>
        {items.map((item) => (
          <CartRow key={item.id} item={item} />
        ))}
      </div>

      <div className="h-fit border border-stone-800 p-6">
        <p className="font-display text-xl font-bold uppercase text-stone-100">Podsumowanie</p>
        <div className="mt-4 flex justify-between font-mono text-sm text-stone-300">
          <span>Suma częściowa</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="mt-2 font-mono text-xs text-stone-500">
          Dostawa i kody rabatowe policzysz w kolejnym kroku.
        </p>
        <Link
          href="/checkout/dane"
          className="mt-6 block w-full bg-signal px-6 py-4 text-center font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
        >
          Przejdź do kasy
        </Link>
      </div>
    </div>
  );
}
