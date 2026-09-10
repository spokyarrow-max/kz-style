import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Kobiety",
  description: "Bluzy, kurtki, spodnie cargo i koszulki KZ Style dla kobiet.",
};

export default async function WomenPage(props: PageProps<"/kobiety">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, gender: "women" }),
    getFilterFacets({ gender: "women" }),
  ]);

  return <CatalogGrid title="Kobiety" products={products} facets={facets} />;
}
