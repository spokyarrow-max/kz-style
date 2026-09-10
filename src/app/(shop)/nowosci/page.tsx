import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Nowości",
  description: "Najnowsze produkty w katalogu KZ Style.",
};

export default async function NewArrivalsPage(props: PageProps<"/nowosci">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, collection: "new" }),
    getFilterFacets({ collection: "new" }),
  ]);

  return <CatalogGrid title="Nowości" products={products} facets={facets} />;
}
