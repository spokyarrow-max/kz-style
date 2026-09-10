import type { Metadata } from "next";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Najczęściej zadawane pytania o zamówienia, płatności i dostawę w KZ Style.",
};

const FAQ_ITEMS = [
  {
    q: "Jakimi metodami mogę zapłacić?",
    a: "Kartą płatniczą oraz BLIK-iem, obsługiwanymi przez Stripe. Płatność jest w pełni zabezpieczona — nie widzimy ani nie przechowujemy numeru Twojej karty.",
  },
  {
    q: "Ile trwa dostawa?",
    a: "Kurier standardowy: 2–3 dni robocze (14,99 zł, gratis od 300 zł). Kurier ekspresowy: następny dzień roboczy (24,99 zł).",
  },
  {
    q: "Czy mogę zwrócić produkt?",
    a: "Tak, masz 14 dni od otrzymania przesyłki na zwrot bez podania przyczyny. Szczegóły w zakładce Zwroty i reklamacje.",
  },
  {
    q: "Jak dobrać rozmiar?",
    a: "Przy każdym produkcie znajdziesz informację o kroju (regular/oversize) i materiale — dobieraj rozmiar tak, jak zwykle nosisz daną kategorię ubrań.",
  },
  {
    q: "Mam kod rabatowy — gdzie go wpisać?",
    a: "W koszyku, w kroku podsumowania zamówienia (krok 3 checkoutu), tuż przed przejściem do płatności.",
  },
  {
    q: "Czy mogę zamówić bez zakładania konta?",
    a: "Tak — cały proces zakupowy działa również dla gości. Konto przydaje się głównie do śledzenia historii zamówień i listy ulubionych.",
  },
];

export default function FaqPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">FAQ</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Najczęstsze pytania
      </h1>

      <FaqAccordion items={FAQ_ITEMS} />
    </article>
  );
}
