"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Najnowsze" },
  { value: "bestseller", label: "Najpopularniejsze" },
  { value: "price_asc", label: "Cena rosnąco" },
  { value: "price_desc", label: "Cena malejąco" },
  { value: "promo", label: "Promocje" },
];

export function ProductFiltersBar({
  sizes,
  colors,
}: {
  sizes: string[];
  colors: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function currentParams() {
    return new URLSearchParams(searchParams.toString());
  }

  function push(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`);
  }

  function setParam(key: string, value: string) {
    const params = currentParams();
    if (value) params.set(key, value);
    else params.delete(key);
    push(params);
  }

  function toggleListParam(key: string, item: string) {
    const params = currentParams();
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    if (next.length > 0) params.set(key, next.join(","));
    else params.delete(key);
    push(params);
  }

  function toggleAvailability() {
    const params = currentParams();
    if (params.get("dostepne") === "1") params.delete("dostepne");
    else params.set("dostepne", "1");
    push(params);
  }

  function clearAll() {
    router.push(pathname);
  }

  const activeSizes = searchParams.get("rozmiar")?.split(",").filter(Boolean) ?? [];
  const activeColors = searchParams.get("kolor")?.split(",").filter(Boolean) ?? [];
  const currentSort = searchParams.get("sort") ?? "newest";
  const inStockOnly = searchParams.get("dostepne") === "1";
  const cenaOd = searchParams.get("cenaOd") ?? "";
  const cenaDo = searchParams.get("cenaDo") ?? "";
  const hasActiveFilters =
    activeSizes.length > 0 || activeColors.length > 0 || inStockOnly || cenaOd || cenaDo;

  return (
    <div className="border-b border-stone-800 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 border border-stone-700 px-4 py-2 font-mono text-xs uppercase text-stone-200 hover:border-signal"
        >
          Filtry {hasActiveFilters && <span className="text-signal">●</span>}
        </button>

        <label className="flex items-center gap-2 font-mono text-xs uppercase text-stone-400">
          Sortuj:
          <select
            value={currentSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="border border-stone-700 bg-stone-950 px-3 py-2 text-stone-100 focus:border-signal focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div className="mt-6 grid grid-cols-1 gap-8 border-t border-stone-800 pt-6 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Cena (zł)</p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="od"
                defaultValue={cenaOd}
                onBlur={(e) => setParam("cenaOd", e.target.value)}
                className="w-20 border border-stone-700 bg-stone-950 px-2 py-1.5 font-mono text-sm text-stone-100 focus:border-signal focus:outline-none"
              />
              <span className="text-stone-600">—</span>
              <input
                type="number"
                min={0}
                placeholder="do"
                defaultValue={cenaDo}
                onBlur={(e) => setParam("cenaDo", e.target.value)}
                className="w-20 border border-stone-700 bg-stone-950 px-2 py-1.5 font-mono text-sm text-stone-100 focus:border-signal focus:outline-none"
              />
            </div>

            <label className="mt-5 flex items-center gap-2 font-mono text-xs uppercase text-stone-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={toggleAvailability}
                className="h-4 w-4 accent-signal"
              />
              Tylko dostępne
            </label>
          </div>

          {sizes.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Rozmiar</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleListParam("rozmiar", size)}
                    className={`min-w-[2.5rem] border px-3 py-1.5 font-mono text-xs uppercase ${
                      activeSizes.includes(size)
                        ? "border-signal bg-signal text-signal-ink"
                        : "border-stone-700 text-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Kolor</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleListParam("kolor", color)}
                    className={`border px-3 py-1.5 font-mono text-xs uppercase ${
                      activeColors.includes(color)
                        ? "border-signal text-signal"
                        : "border-stone-700 text-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-xs uppercase text-stone-500 underline hover:text-signal sm:col-span-3"
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
