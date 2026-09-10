import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const ADMIN_LINKS = [
  { href: "/admin", label: "Przegląd" },
  { href: "/admin/produkty", label: "Produkty" },
  { href: "/admin/zamowienia", label: "Zamówienia" },
  { href: "/admin/rabaty", label: "Kody rabatowe" },
  { href: "/admin/klienci", label: "Klienci" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Druga warstwa (obok proxy.ts) — tania i szybka do sprawdzenia,
  // więc nic nie kosztuje mieć ją tu na wszelki wypadek.
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Panel administratora
      </p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Zarządzanie sklepem
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap border-b-2 border-transparent px-1 py-2 font-mono text-sm uppercase text-stone-300 hover:border-signal hover:text-signal md:border-b-0 md:border-l-2 md:px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
