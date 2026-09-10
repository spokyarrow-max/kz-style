"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth";

const TICKER_TEXT =
  "NOWY DROP: RIOT COLLECTION — DOSTĘPNY TERAZ  ·  DARMOWA DOSTAWA OD 300 ZŁ  ·  WYSYŁKA W 24H  ";

const NAV_LINKS = [
  { href: "/mezczyzni", label: "Mężczyźni" },
  { href: "/kobiety", label: "Kobiety" },
  { href: "/bizuteria", label: "Biżuteria" },
  { href: "/limited-drop", label: "Limited Drop" },
];

export function SiteHeader({
  cartCount = 0,
  user = null,
}: {
  cartCount?: number;
  user?: CurrentUser | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 bg-stone-950">
      <div className="h-1.5 hazard-stripe" aria-hidden="true" />

      <div className="overflow-hidden border-b border-stone-800 bg-stone-900 py-2 text-signal">
        <div className="animate-marquee whitespace-nowrap font-mono text-xs tracking-wider">
          <span className="mx-4">{TICKER_TEXT}</span>
          <span className="mx-4">{TICKER_TEXT}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4 sm:px-10">
        <Link href="/" className="font-display text-3xl font-black uppercase tracking-tight text-stone-100">
          KZ<span className="text-signal">.</span>Style
        </Link>

        <nav className="hidden items-center gap-8 font-display text-sm font-bold uppercase tracking-wide text-stone-200 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={isActive(link.href) ? "text-signal" : "hover:text-signal"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 font-mono text-xs uppercase text-stone-200">
          <Link href="/szukaj" className="hidden hover:text-signal lg:inline">Szukaj</Link>
          {user ? (
            <span className="hidden items-center gap-2 lg:flex">
              {user.role === "admin" && (
                <Link href="/admin" className="text-signal hover:text-stone-100">
                  Admin
                </Link>
              )}
              <Link href="/konto" className="hover:text-signal">
                {user.firstName ?? "Konto"}
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="text-stone-500 hover:text-signal">
                  Wyloguj
                </button>
              </form>
            </span>
          ) : (
            <Link href="/logowanie" className="hidden hover:text-signal lg:inline">
              Zaloguj
            </Link>
          )}
          <Link href="/koszyk" className="hover:text-signal">Koszyk ({cartCount})</Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span
              className={`block h-0.5 w-6 bg-stone-100 transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-6 bg-stone-100 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-6 bg-stone-100 transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="flex flex-col border-b border-stone-800 bg-stone-950 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`border-b border-stone-800 px-6 py-4 font-display text-lg font-bold uppercase tracking-wide ${
                isActive(link.href) ? "text-signal" : "text-stone-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/szukaj"
            onClick={() => setMenuOpen(false)}
            className="border-b border-stone-800 px-6 py-4 font-mono text-sm uppercase text-stone-300"
          >
            Szukaj
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="border-b border-stone-800 px-6 py-4 font-mono text-sm uppercase text-signal"
            >
              Panel administratora
            </Link>
          )}
          <Link
            href={user ? "/konto" : "/logowanie"}
            onClick={() => setMenuOpen(false)}
            className="border-b border-stone-800 px-6 py-4 font-mono text-sm uppercase text-stone-300"
          >
            {user ? (user.firstName ?? "Moje konto") : "Zaloguj się"}
          </Link>
          {user && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full px-6 py-4 text-left font-mono text-sm uppercase text-stone-500"
              >
                Wyloguj
              </button>
            </form>
          )}
        </nav>
      ) : null}
    </header>
  );
}
