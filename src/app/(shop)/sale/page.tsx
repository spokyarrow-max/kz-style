import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Sale",
  description: "Produkty KZ Style w obniżonych cenach.",
};

export default async function SalePage(props: PageProps<"/sale">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, collection: "sale" }),
    getFilterFacets({ collection: "sale" }),
  ]);

  return <CatalogGrid title="Sale" products={products} facets={facets} />;
}
