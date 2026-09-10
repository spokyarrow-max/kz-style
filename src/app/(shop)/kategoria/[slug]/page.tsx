import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFilteredProducts, getFilterFacets, getProductsByCategorySlug } from "@/lib/products";
import { parseUserFilters } from "@/lib/search-params";
import { CatalogGrid } from "@/components/catalog-grid";

export async function generateMetadata(
  props: PageProps<"/kategoria/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const { categoryName } = await getProductsByCategorySlug(slug);
  if (!categoryName) return {};

  const description = `${categoryName} — zobacz kolekcję KZ Style, polskiego premium streetwearu.`;
  return {
    title: categoryName,
    description,
    openGraph: { title: categoryName, description },
  };
}

export default async function CategoryPage(props: PageProps<"/kategoria/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const userFilters = parseUserFilters(searchParams);

  const { categoryName } = await getProductsByCategorySlug(slug);
  if (!categoryName) {
    notFound();
  }

  const [products, facets] = await Promise.all([
    getFilteredProducts({ ...userFilters, categorySlug: slug }),
    getFilterFacets({ categorySlug: slug }),
  ]);

  return <CatalogGrid title={categoryName} products={products} facets={facets} />;
}
