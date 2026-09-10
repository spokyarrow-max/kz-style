"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProductVariant } from "@/lib/products";
import { addToCartAction } from "@/app/actions/cart";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductVariantSelector({ variants }: { variants: ProductVariant[] }) {
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color_name))),
    [variants]
  );
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const sizesForColor = useMemo(() => {
    return variants
      .filter((v) => v.color_name === selectedColor)
      .sort((a, b) => {
        if (!a.size || !b.size) return 0;
        return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
      });
  }, [variants, selectedColor]);

  const hasSizes = sizesForColor.some((v) => v.size !== null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasSizes ? null : sizesForColor[0]?.id ?? null
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const available = selectedVariant
    ? selectedVariant.stock_quantity - selectedVariant.reserved_quantity
    : 0;

  function handleAddToCart() {
    if (!selectedVariant) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCartAction(selectedVariant.id, 1);
      if (result.error) {
        setFeedback({ type: "error", text: result.error });
      } else {
        setFeedback({ type: "success", text: "Dodano do koszyka." });
      }
    });
  }

  return (
    <div className="mt-8">
      {colors.length > 1 && (
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Kolor: <span className="text-stone-100">{selectedColor}</span>
          </p>
          <div className="mt-3 flex gap-3">
            {colors.map((color) => {
              const swatch = variants.find((v) => v.color_name === color)?.color_hex;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedVariantId(null);
                    setFeedback(null);
                  }}
                  aria-label={color}
                  aria-pressed={color === selectedColor}
                  className={`h-9 w-9 rounded-full border-2 transition-colors ${
                    color === selectedColor ? "border-signal" : "border-stone-700"
                  }`}
                  style={{ backgroundColor: swatch ?? "#333" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="mt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Rozmiar</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizesForColor.map((variant) => {
              const inStock = variant.stock_quantity - variant.reserved_quantity > 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!inStock}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setFeedback(null);
                  }}
                  aria-pressed={variant.id === selectedVariantId}
                  className={`min-w-[3rem] border px-4 py-2 font-mono text-sm uppercase transition-colors ${
                    variant.id === selectedVariantId
                      ? "border-signal bg-signal text-signal-ink"
                      : inStock
                        ? "border-stone-700 text-stone-100 hover:border-stone-400"
                        : "cursor-not-allowed border-stone-800 text-stone-700 line-through"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        {selectedVariant && (
          <p className="mb-3 font-mono text-xs text-stone-400">
            {available > 0
              ? available <= 3
                ? `Zostało tylko ${available} szt.`
                : "Dostępny"
              : "Brak na stanie w tym wariancie"}
          </p>
        )}
        <button
          type="button"
          disabled={!selectedVariant || available <= 0 || isPending}
          onClick={handleAddToCart}
          className="w-full bg-signal px-8 py-4 font-display text-lg font-bold uppercase tracking-wide text-signal-ink transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:bg-stone-800 disabled:text-stone-500"
        >
          {isPending ? "Dodawanie…" : selectedVariant ? "Dodaj do koszyka" : "Wybierz wariant"}
        </button>
        {feedback && (
          <p
            className={`mt-3 text-center font-mono text-xs ${
              feedback.type === "error" ? "text-signal" : "text-stone-300"
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
