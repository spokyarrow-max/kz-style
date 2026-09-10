import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Limited Drop",
  description: "Limitowane kolekcje KZ Style — dostępne przez ograniczony czas.",
};

export default async function LimitedDropPage(props: PageProps<"/limited-drop">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, collection: "limited" }),
    getFilterFacets({ collection: "limited" }),
  ]);

  return <CatalogGrid title="Limited Drop" products={products} facets={facets} />;
}
