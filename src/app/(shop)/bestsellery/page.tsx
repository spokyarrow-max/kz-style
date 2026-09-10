import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Bestsellery",
  description: "Najchętniej kupowane produkty KZ Style.",
};

export default async function BestsellersPage(props: PageProps<"/bestsellery">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, collection: "bestseller" }),
    getFilterFacets({ collection: "bestseller" }),
  ]);

  return <CatalogGrid title="Bestsellery" products={products} facets={facets} />;
}
