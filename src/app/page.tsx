import Link from "next/link";
import { getNewProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const [newProducts, wishlistedIds, user] = await Promise.all([
    getNewProducts(),
    getWishlistedProductIds(),
    getCurrentUser(),
  ]);

  return (
    <>
      <main className="flex-1">
        <HeroSection />

        <CategoryTiles />

        <section className="grid grid-cols-2 divide-x divide-stone-800 border-b border-stone-800 sm:grid-cols-4">
          {[
            ["40+", "Projektów w kolekcji"],
            ["100%", "Własne wzory i grafiki"],
            ["24H", "Wysyłka na terenie PL"],
            ["PL", "Zaprojektowane w Polsce"],
          ].map(([stat, label]) => (
            <div key={label} className="px-6 py-8 text-center">
              <p className="font-display text-4xl font-black text-signal">{stat}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-stone-400">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-10 border-b border-stone-800 px-6 py-24 sm:px-10 md:grid-cols-[1fr_1.4fr]">
          <p className="font-mono text-xs uppercase tracking-widest text-signal">
            Manifest
          </p>
          <div className="max-w-2xl">
            <p className="font-display text-3xl font-bold uppercase leading-tight text-stone-100 sm:text-4xl">
              Nie szyjemy dla witryn sklepowych. Szyjemy dla ludzi, którzy
              stoją pod blokiem o 2 w nocy i wiedzą, że jutro znowu wychodzą
              na miasto.
            </p>
            <p className="mt-6 text-stone-400">
              KZ Style powstało z przekonania, że polski streetwear może być
              równie mocny jak to, co dzieje się na ulicach Warszawy, Łodzi
              czy Trójmiasta — bez kopiowania zachodnich wzorców. Ciężkie
              dzianiny, własne grafiki, limitowane nakłady. Jak coś się
              kończy — nie wraca.
            </p>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-10">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl font-bold uppercase text-stone-100">
              Najnowsze
            </p>
            <Link href="/nowosci" className="font-mono text-xs uppercase text-signal hover:text-stone-100">
              Zobacz wszystkie →
            </Link>
          </div>

          {newProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistedIds.has(product.id)}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-prose text-stone-400">
              Katalog jest jeszcze pusty — dodaj przykładowe produkty przez
              migrację <code className="font-mono text-signal">0003_seed.sql</code>.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

function HeroCopy() {
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400">
        KZ Style — Warszawa / Drop 001
      </p>

      <h1 className="mt-6 max-w-4xl font-display text-[clamp(3rem,11vw,8rem)] font-black uppercase leading-[0.85] tracking-tight text-stone-100">
        Szyte na
        <br />
        <span className="text-signal">betonie.</span>
      </h1>

      <p className="mt-8 max-w-md text-lg text-stone-200">
        Premium streetwear prosto z polskiej ulicy — mocne grafiki, ciężkie
        dzianiny, zero kompromisów.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/nowosci"
          className="bg-signal px-8 py-4 font-display text-lg font-bold uppercase tracking-wide text-signal-ink transition-colors hover:bg-stone-100"
        >
          Zobacz kolekcję
        </Link>
        <Link
          href="/limited-drop"
          className="border border-stone-700 px-8 py-4 font-display text-lg font-bold uppercase tracking-wide text-stone-100 transition-colors hover:border-signal hover:text-signal"
        >
          Limited Drop
        </Link>
      </div>
    </>
  );
}

// Dwa oddzielne układy (nie jeden "sprytny"), bo dwa zdjęcia mają inny
// charakter: desktopowe ma z lewej celowo puste, ciemne miejsce pod nagłówek
// (nakładka tekstu na obraz), a mobilne to pełnokadrowe zdjęcie modeli bez
// takiego miejsca — więc tekst idzie normalnie pod spodem, nie na nim.
// Obrazy zawsze w naturalnych proporcjach (width:100%, height:auto) —
// zero przycinania czy zgadywania kadru.
function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-stone-800">
      <div className="sm:hidden">
        <img
          src="/images/hero-mobile.png"
          alt="Modele w bluzach KZ Style na warszawskiej klatce schodowej"
          className="block h-auto w-full"
        />
        <div className="px-6 py-12">
          <HeroCopy />
        </div>
      </div>

      <div className="relative hidden sm:block">
        <img
          src="/images/hero-desktop.png"
          alt="Modele w bluzach KZ Style na betonowym dziedzińcu"
          className="block h-auto w-full"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-10 lg:px-16">
          <HeroCopy />
        </div>
      </div>
    </section>
  );
}

const CATEGORY_TILES = [
  { href: "/mezczyzni", label: "Mężczyźni", image: "/images/mezczyzni.png" },
  { href: "/kobiety", label: "Kobiety", image: "/images/kobiety.png" },
  { href: "/bizuteria", label: "Biżuteria", image: "/images/bizuteria.png" },
];

// Każdy kafel w naturalnej proporcji swojego zdjęcia (mężczyźni/kobiety 3:4,
// biżuteria 1:1) — kolumny siatki mają tę samą szerokość, ale wysokość
// kafli różni się zależnie od zdjęcia. Świadomie, żeby nic nie przycinać.
function CategoryTiles() {
  return (
    <section className="border-b border-stone-800 px-6 py-16 sm:px-10">
      <p className="font-display text-2xl font-bold uppercase text-stone-100">
        Zakupy wg kategorii
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CATEGORY_TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group block">
            <div className="overflow-hidden border border-stone-800 bg-stone-900">
              <img
                src={tile.image}
                alt={tile.label}
                className="block h-auto w-full"
              />
            </div>
            <p className="mt-3 font-display text-lg font-bold uppercase text-stone-100 transition-colors group-hover:text-signal">
              {tile.label} →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
