import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Skontaktuj się z KZ Style — dane kontaktowe i godziny obsługi klienta.",
};

export default function ContactPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Kontakt</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Napisz do nas
      </h1>

      <p className="mt-6 max-w-prose text-stone-300">
        Pytanie o zamówienie, rozmiar albo współpracę? Odzywamy się w dni robocze,
        zwykle w ciągu 24 godzin.
      </p>

      <dl className="mt-10 flex flex-col gap-6">
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-stone-500">
            E-mail obsługi klienta
          </dt>
          <dd className="mt-1">
            <a href="mailto:kontakt@kzstyle.pl" className="text-lg text-signal hover:text-stone-100">
              kontakt@kzstyle.pl
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-stone-500">
            Godziny obsługi
          </dt>
          <dd className="mt-1 text-stone-200">Poniedziałek–piątek, 9:00–17:00</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-widest text-stone-500">
            Adres siedziby
          </dt>
          <dd className="mt-1 text-stone-200">
            KZ Style Sp. z o.o.
            <br />
            ul. Betonowa 12, 00-001 Warszawa
          </dd>
        </div>
      </dl>

      <div className="mt-10 border border-stone-800 bg-stone-900/40 p-5 font-mono text-xs text-stone-400">
        To dane demonstracyjne — KZ Style to fikcyjna marka, żadna wiadomość wysłana na
        powyższy adres nie zostanie odebrana.
      </div>
    </article>
  );
}
