import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dostawa",
  description: "Metody i koszty dostawy w KZ Style — kurier standardowy i ekspresowy.",
};

const METHODS = [
  {
    name: "Kurier standardowy",
    time: "2–3 dni robocze",
    price: "14,99 zł",
    note: "Gratis od 300 zł zamówienia",
  },
  {
    name: "Kurier ekspresowy",
    time: "Następny dzień roboczy",
    price: "24,99 zł",
    note: "Zamówienie złożone do 14:00 wysyłamy tego samego dnia",
  },
];

export default function ShippingPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Dostawa</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Wysyłka w 24h
      </h1>

      <p className="mt-6 max-w-prose text-stone-300">
        Wysyłamy wyłącznie na terenie Polski. Każde zamówienie pakujemy tego samego lub
        następnego dnia roboczego od zaksięgowania płatności.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {METHODS.map((method) => (
          <div key={method.name} className="flex items-start justify-between gap-6 border border-stone-800 p-5">
            <div>
              <p className="font-display text-lg font-bold uppercase text-stone-100">
                {method.name}
              </p>
              <p className="mt-1 text-sm text-stone-400">{method.time}</p>
              <p className="mt-2 text-xs text-stone-500">{method.note}</p>
            </div>
            <p className="whitespace-nowrap font-mono text-lg text-signal">{method.price}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-bold uppercase text-stone-100">
        Śledzenie przesyłki
      </h2>
      <p className="mt-3 max-w-prose text-stone-300">
        Numer śledzenia wysyłamy e-mailem, gdy tylko paczka trafi do kuriera. Status
        zamówienia sprawdzisz też w każdej chwili w{" "}
        <span className="text-signal">Moje konto → Zamówienia</span>.
      </p>
    </article>
  );
}
