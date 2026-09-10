import Link from "next/link";

const ACCOUNT_LINKS = [
  { href: "/konto", label: "Moje dane" },
  { href: "/konto/adresy", label: "Adresy dostawy" },
  { href: "/konto/zamowienia", label: "Zamówienia" },
  { href: "/konto/ulubione", label: "Ulubione" },
  { href: "/konto/haslo", label: "Zmiana hasła" },
];

export default function AccountLayout({ children }: LayoutProps<"/konto">) {
  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-5xl font-black uppercase text-stone-100">Moje konto</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap border-b-2 border-transparent px-1 py-2 font-mono text-sm uppercase text-stone-300 hover:border-signal hover:text-signal md:border-b-0 md:border-l-2 md:px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div>{children}</div>
      </div>
    </main>
  );
}
