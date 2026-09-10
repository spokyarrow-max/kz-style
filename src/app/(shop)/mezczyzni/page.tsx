import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Mężczyźni",
  description: "Bluzy, kurtki, spodnie cargo i koszulki KZ Style dla mężczyzn.",
};

export default async function MenPage(props: PageProps<"/mezczyzni">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, gender: "men" }),
    getFilterFacets({ gender: "men" }),
  ]);

  return <CatalogGrid title="Mężczyźni" products={products} facets={facets} />;
}
