"use client";

import { useState } from "react";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-10 flex flex-col divide-y divide-stone-800 border-y border-stone-800">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-4 text-left font-display text-lg font-bold ${
                isOpen ? "text-signal" : "text-stone-100"
              }`}
            >
              {item.q}
              <span className="font-mono text-xl leading-none text-stone-500">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && <p className="mt-3 text-stone-300">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
