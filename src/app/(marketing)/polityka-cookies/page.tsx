import type { Metadata } from "next";
import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = {
  title: "Polityka cookies",
  description: "Jakich plików cookies używa sklep KZ Style i do czego służą.",
};

const COOKIES = [
  {
    name: "sb-access-token / sb-refresh-token",
    purpose: "Utrzymanie sesji zalogowanego klienta (Supabase Auth).",
    required: true,
  },
  {
    name: "kz_guest_cart",
    purpose: "Identyfikuje koszyk gościa, który nie jest zalogowany, żeby przetrwał odświeżenie strony.",
    required: true,
  },
  {
    name: "kz_checkout_draft",
    purpose: "Tymczasowo przechowuje dane wpisywane w trakcie checkoutu (adres, wybrana dostawa).",
    required: true,
  },
  {
    name: "kz_last_order_number",
    purpose: "Pozwala pokazać stronę potwierdzenia zamówienia właściwej osobie tuż po płatności.",
    required: true,
  },
];

export default function CookiePolicyPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Polityka cookies
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Pliki cookies
      </h1>

      <div className="mt-8">
        <DemoNotice />
      </div>

      <p className="text-stone-300">
        Używamy wyłącznie plików cookies niezbędnych do działania sklepu — logowania,
        koszyka i procesu checkoutu. Wszystkie są ustawiane jako{" "}
        <span className="text-stone-100">httpOnly</span> (niedostępne dla skryptów w
        przeglądarce) i nie są odczytywane przez żadną firmę zewnętrzną. Sklep nie
        korzysta obecnie z cookies analitycznych ani reklamowych (np. Google Analytics,
        Meta Pixel).
      </p>

      <div className="mt-10 flex flex-col divide-y divide-stone-800 border-y border-stone-800">
        {COOKIES.map((cookie) => (
          <div key={cookie.name} className="py-4">
            <p className="font-mono text-sm text-stone-100">{cookie.name}</p>
            <p className="mt-1 text-sm text-stone-400">{cookie.purpose}</p>
            <p className="mt-1 font-mono text-xs uppercase text-signal">Niezbędny</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-stone-300">
        Ponieważ te cookies są niezbędne do podstawowego działania sklepu (logowanie,
        koszyk), nie wymagają zgody w bannerze cookies — w przeciwieństwie do cookies
        analitycznych/reklamowych, których na razie nie używamy.
      </p>
    </article>
  );
}
