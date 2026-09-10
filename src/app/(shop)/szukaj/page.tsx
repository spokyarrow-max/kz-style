import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { ProductCard } from "@/components/product-card";
import { ProductFiltersBar } from "@/components/product-filters-bar";
import { SearchBox } from "@/components/search-box";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

export default async function SearchPage(props: PageProps<"/szukaj">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);
  const query = userFilters.search;

  const [products, facets, wishlistedIds, user] = await Promise.all([
    query ? getFilteredProducts(userFilters) : Promise.resolve([]),
    getFilterFacets(),
    getWishlistedProductIds(),
    getCurrentUser(),
  ]);

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-5xl font-black uppercase text-stone-100">Szukaj</h1>

      <div className="mt-8">
        <SearchBox />
      </div>

      {query && (
        <>
          <div className="mt-8">
            <p className="font-mono text-sm text-stone-400">
              {products.length} wyników dla „{query}"
            </p>
            <div className="mt-4">
              <ProductFiltersBar sizes={facets.sizes} colors={facets.colors} />
            </div>
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
              Nic nie znaleźliśmy dla tej frazy. Spróbuj innego słowa kluczowego.
            </p>
          )}
        </>
      )}
    </main>
  );
}
