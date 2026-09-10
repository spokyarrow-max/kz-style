"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 3v10.8a3.3 3.3 0 1 1-2.6-3.23V7.9a5.9 5.9 0 1 0 5.1 5.85V9.8a6.6 6.6 0 0 0 3.6 1.06V8.2a4 4 0 0 1-3.6-3.9V3h-2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SHOP_LINKS = [
  { href: "/nowosci", label: "Nowości" },
  { href: "/bestsellery", label: "Bestsellery" },
  { href: "/limited-drop", label: "Limited Drop" },
  { href: "/sale", label: "Sale" },
];

const HELP_LINKS = [
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/dostawa", label: "Dostawa" },
  { href: "/zwroty", label: "Zwroty i reklamacje" },
  { href: "/faq", label: "FAQ" },
];

const LEGAL_LINKS = [
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "/polityka-cookies", label: "Polityka cookies" },
];

function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  // Na razie tylko UI — podłączenie pod prawdziwy serwis mailingowy
  // (i tabelę w bazie) zaplanowane w dalszych etapach.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <p className="font-mono text-sm text-signal">
        Dzięki. Odezwiemy się przy następnym dropie.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <input
        type="email"
        required
        placeholder="twoj@email.pl"
        aria-label="Adres e-mail"
        className="w-full border border-stone-700 bg-stone-900 px-4 py-3 font-mono text-sm text-stone-100 placeholder:text-stone-400 focus:border-signal focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 bg-signal px-5 py-3 font-display text-sm font-bold uppercase text-signal-ink transition-colors hover:bg-stone-100"
      >
        Zapisz
      </button>
    </form>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-stone-200 hover:text-signal">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950">
      <div className="grid grid-cols-1 gap-12 px-6 py-16 sm:px-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="font-display text-2xl font-black uppercase text-stone-100">
            KZ<span className="text-signal">.</span>Style
          </p>
          <p className="mt-3 max-w-xs text-sm text-stone-400">
            Premium streetwear zaprojektowany i szyty w Polsce. Zapisz się,
            żeby dowiedzieć się o kolejnym dropie pierwszy.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
          <div className="mt-6 flex gap-4 text-stone-400">
            <a href="#" aria-label="KZ Style na Instagramie" className="hover:text-signal">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="KZ Style na TikToku" className="hover:text-signal">
              <TikTokIcon />
            </a>
          </div>
        </div>

        <FooterLinkColumn title="Sklep" links={SHOP_LINKS} />
        <FooterLinkColumn title="Obsługa" links={HELP_LINKS} />
        <FooterLinkColumn title="Prawne" links={LEGAL_LINKS} />
      </div>

      <div className="border-t border-stone-800 px-6 py-6 sm:px-10">
        <p className="font-mono text-xs text-stone-500">
          © {new Date().getFullYear()} KZ Style. Projekt demonstracyjny —
          fikcyjna marka stworzona do celów edukacyjnych i portfolio.
        </p>
      </div>
    </footer>
  );
}
