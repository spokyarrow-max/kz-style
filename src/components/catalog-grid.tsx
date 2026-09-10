import { ProductCard } from "@/components/product-card";
import { ProductFiltersBar } from "@/components/product-filters-bar";
import type { ProductListItem } from "@/lib/products";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

export async function CatalogGrid({
  title,
  subtitle,
  products,
  facets,
}: {
  title: string;
  subtitle?: string;
  products: ProductListItem[];
  facets: { sizes: string[]; colors: string[] };
}) {
  const [wishlistedIds, user] = await Promise.all([getWishlistedProductIds(), getCurrentUser()]);

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-5xl font-black uppercase text-stone-100">{title}</h1>
      <p className="mt-2 font-mono text-sm text-stone-400">
        {subtitle ?? `${products.length} produktów`}
      </p>

      <div className="mt-8">
        <ProductFiltersBar sizes={facets.sizes} colors={facets.colors} />
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.id)}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-stone-400">
          Brak produktów spełniających wybrane kryteria. Spróbuj zmienić filtry.
        </p>
      )}
    </main>
  );
}
