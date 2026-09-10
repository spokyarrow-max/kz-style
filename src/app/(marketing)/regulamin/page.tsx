import type { Metadata } from "next";
import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin sklepu internetowego KZ Style.",
};

export default function TermsPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Regulamin</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Regulamin sklepu
      </h1>

      <div className="mt-8">
        <DemoNotice />
      </div>

      <div className="flex flex-col gap-6 text-stone-300">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §1. Postanowienia ogólne
          </h2>
          <p className="mt-3">
            Sklep internetowy KZ Style, działający pod adresem kzstyle.pl, prowadzony jest
            przez KZ Style Sp. z o.o. z siedzibą w Warszawie. Niniejszy regulamin określa
            zasady korzystania ze sklepu, składania zamówień oraz odstąpienia od umowy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §2. Zamówienia
          </h2>
          <p className="mt-3">
            Zamówienia można składać jako gość lub po założeniu konta. Umowa sprzedaży
            zostaje zawarta w momencie potwierdzenia płatności. Ceny podane w sklepie są
            cenami brutto, wyrażonymi w złotych polskich (PLN).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §3. Płatności
          </h2>
          <p className="mt-3">
            Płatności obsługiwane są przez zewnętrznego operatora (Stripe). Sklep nie
            przechowuje danych kart płatniczych klientów. Zamówienie jest realizowane
            dopiero po zaksięgowaniu płatności.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §4. Dostawa
          </h2>
          <p className="mt-3">
            Zamówienia dostarczane są wyłącznie na terenie Polski, za pośrednictwem firm
            kurierskich. Szczegółowe koszty i terminy dostawy opisane są w zakładce Dostawa.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §5. Odstąpienie od umowy
          </h2>
          <p className="mt-3">
            Klient będący konsumentem ma prawo odstąpić od umowy w terminie 14 dni bez
            podania przyczyny. Szczegóły procedury opisane są w zakładce Zwroty i
            reklamacje.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §6. Reklamacje
          </h2>
          <p className="mt-3">
            Sklep odpowiada wobec konsumenta za niezgodność towaru z umową na zasadach
            rękojmi określonych w Kodeksie cywilnym.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            §7. Postanowienia końcowe
          </h2>
          <p className="mt-3">
            W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy
            prawa polskiego, w tym Kodeksu cywilnego oraz ustawy o prawach konsumenta.
          </p>
        </section>
      </div>
    </article>
  );
}
