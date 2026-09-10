import type { Metadata } from "next";
import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje",
  description: "Zasady zwrotów i reklamacji w KZ Style — 14 dni na zwrot bez podania przyczyny.",
};

export default function ReturnsPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Zwroty i reklamacje
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        14 dni na zwrot
      </h1>

      <div className="mt-8">
        <DemoNotice />
      </div>

      <div className="flex flex-col gap-6 text-stone-300">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Zwrot bez podania przyczyny
          </h2>
          <p className="mt-3">
            Zgodnie z prawem konsumenckim masz 14 dni od otrzymania przesyłki na odstąpienie
            od umowy bez podania przyczyny. Produkt musi być nieużywany, z metkami i w
            oryginalnym opakowaniu.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Jak zwrócić produkt
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Napisz do nas na kontakt@kzstyle.pl z numerem zamówienia.</li>
            <li>Odeślij paczkę na adres podany w wiadomości zwrotnej.</li>
            <li>Zwrot pieniędzy wysyłamy w ciągu 14 dni od otrzymania przesyłki zwrotnej.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Reklamacje
          </h2>
          <p className="mt-3">
            Jeśli produkt ma wadę fabryczną, masz prawo do reklamacji w ramach rękojmi (2 lata
            od zakupu). Opisz problem i dołącz zdjęcia — rozpatrujemy reklamacje w ciągu 14
            dni roboczych.
          </p>
        </section>
      </div>
    </article>
  );
}
