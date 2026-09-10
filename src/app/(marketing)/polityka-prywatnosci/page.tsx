import type { Metadata } from "next";
import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Jak KZ Style przetwarza dane osobowe klientów.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Polityka prywatności
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Ochrona danych osobowych
      </h1>

      <div className="mt-8">
        <DemoNotice />
      </div>

      <div className="flex flex-col gap-6 text-stone-300">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Administrator danych
          </h2>
          <p className="mt-3">
            Administratorem danych osobowych zbieranych w sklepie KZ Style jest KZ Style
            Sp. z o.o. z siedzibą w Warszawie.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Jakie dane przetwarzamy
          </h2>
          <p className="mt-3">
            Podczas zakupów przetwarzamy: adres e-mail, imię i nazwisko, adres dostawy oraz
            numer telefonu — w zakresie niezbędnym do realizacji zamówienia. Dane logujących
            się klientów (konto, hasło w formie zaszyfrowanej) przechowywane są przez
            Supabase, naszego dostawcę infrastruktury bazodanowej.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Płatności
          </h2>
          <p className="mt-3">
            Płatności obsługuje Stripe — dane karty płatniczej trafiają bezpośrednio do
            Stripe i nigdy nie przechodzą przez nasze serwery.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Twoje prawa
          </h2>
          <p className="mt-3">
            Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia oraz
            przenoszenia. W tym celu skontaktuj się z nami na adres kontakt@kzstyle.pl.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase text-stone-100">
            Okres przechowywania
          </h2>
          <p className="mt-3">
            Dane związane z zamówieniami przechowujemy przez okres wymagany przepisami
            podatkowymi. Dane konta usuwamy na żądanie klienta, o ile nie kolidowałoby to z
            obowiązkami prawnymi (np. dokumentacją sprzedaży).
          </p>
        </section>
      </div>
    </article>
  );
}
