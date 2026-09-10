import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export const metadata: Metadata = {
  title: "Biżuteria",
  description: "Łańcuchy, naszyjniki i pierścionki KZ Style ze stali chirurgicznej.",
};

export default async function JewelryPage(props: PageProps<"/bizuteria">) {
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, jewelryOnly: true }),
    getFilterFacets({ jewelryOnly: true }),
  ]);

  return <CatalogGrid title="Biżuteria" products={products} facets={facets} />;
}
