import { createClient } from "@/lib/supabase/server";
import type { ProductGender, ProductSize } from "@/types/database.types";

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  is_new: boolean;
  is_bestseller: boolean;
  is_limited_drop: boolean;
}

export interface ProductVariant {
  id: string;
  color_name: string;
  color_hex: string | null;
  size: ProductSize | null;
  sku: string;
  stock_quantity: number;
  reserved_quantity: number;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  material_info: string | null;
  fit_info: string | null;
  care_info: string | null;
  gender: ProductGender;
  category: { slug: string; name: string } | null;
  variants: ProductVariant[];
}

const LIST_COLUMNS =
  "id, slug, name, price, compare_at_price, is_new, is_bestseller, is_limited_drop";

export const JEWELRY_CATEGORY_SLUGS = ["lancuchy", "naszyjniki", "pierscionki"];
export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
export type SortOption = "newest" | "price_asc" | "price_desc" | "bestseller" | "promo";
export type CollectionFilter = "new" | "bestseller" | "limited" | "sale";

/** Filtry, które definiują "kontekst" strony (kategoria/płeć/kolekcja) — te
 * są stałe dla danej strony, użytkownik ich nie zmienia w panelu filtrów. */
export interface ScopeFilters {
  categorySlug?: string;
  gender?: "men" | "women";
  jewelryOnly?: boolean;
  collection?: CollectionFilter;
}

export interface ProductFilters extends ScopeFilters {
  search?: string;
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
  inStockOnly?: boolean;
  sort?: SortOption;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Buduje zapytanie o produkty ograniczone do "kontekstu" strony — bez
 * filtrów wybieranych ręcznie przez użytkownika. Współdzielone przez
 * getFilteredProducts (lista produktów) i getFilterFacets (dostępne
 * rozmiary/kolory), żeby oba zawsze były ze sobą spójne. */
function applyScope(
  supabase: SupabaseServerClient,
  query: ReturnType<SupabaseServerClient["from"]>,
  scope: ScopeFilters
) {
  if (scope.gender) query = query.in("gender", [scope.gender, "unisex"]);
  if (scope.collection === "new") query = query.eq("is_new", true);
  if (scope.collection === "bestseller") query = query.eq("is_bestseller", true);
  if (scope.collection === "limited") query = query.eq("is_limited_drop", true);
  if (scope.collection === "sale") query = query.not("compare_at_price", "is", null);
  return query;
}

async function getScopedProductIds(
  supabase: SupabaseServerClient,
  scope: ScopeFilters
): Promise<string[] | null> {
  let query = supabase.from("products").select("id").eq("is_active", true);
  query = applyScope(supabase, query, scope);

  if (scope.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", scope.categorySlug)
      .maybeSingle();
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  if (scope.jewelryOnly) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .in("slug", JEWELRY_CATEGORY_SLUGS);
    const ids = (categories ?? []).map((c) => c.id);
    if (ids.length === 0) return [];
    query = query.in("category_id", ids);
  }

  const { data } = await query;
  return (data ?? []).map((p) => p.id);
}

/**
 * Jedno, uniwersalne zapytanie o produkty, wykorzystywane przez stronę
 * główną, wszystkie strony kategorii, wyszukiwarkę i kolekcje
 * (Nowości/Bestsellery/Limited/Sale). Filtry rozmiaru/koloru/dostępności
 * dotyczą wariantów, więc są liczone w dwóch krokach: najpierw znajdujemy
 * pasujące product_id po stronie wariantów, potem filtrujemy produkty.
 */
export async function getFilteredProducts(
  filters: ProductFilters = {}
): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(LIST_COLUMNS).eq("is_active", true);
  query = applyScope(supabase, query, filters);

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.categorySlug || filters.jewelryOnly) {
    const scopedIds = await getScopedProductIds(supabase, {
      categorySlug: filters.categorySlug,
      jewelryOnly: filters.jewelryOnly,
    });
    if (!scopedIds || scopedIds.length === 0) return [];
    query = query.in("id", scopedIds);
  }

  if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte("price", filters.priceMax);

  if (filters.sizes?.length || filters.colors?.length || filters.inStockOnly) {
    let variantQuery = supabase
      .from("product_variants")
      .select("product_id, stock_quantity, reserved_quantity, size, color_name");
    if (filters.sizes?.length)
      variantQuery = variantQuery.in("size", filters.sizes as ProductSize[]);
    if (filters.colors?.length) variantQuery = variantQuery.in("color_name", filters.colors);

    const { data: variants } = await variantQuery;
    let matching = variants ?? [];
    if (filters.inStockOnly) {
      matching = matching.filter((v) => v.stock_quantity - v.reserved_quantity > 0);
    }
    const matchingIds = Array.from(new Set(matching.map((v) => v.product_id)));
    if (matchingIds.length === 0) return [];
    query = query.in("id", matchingIds);
  }

  if (filters.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price_desc") query = query.order("price", { ascending: false });
  else if (filters.sort === "bestseller")
    query = query.order("is_bestseller", { ascending: false }).order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Nie udało się pobrać produktów:", error.message);
    return [];
  }

  if (filters.sort === "promo") {
    return [...data].sort((a, b) => {
      const discountA = a.compare_at_price ? (a.compare_at_price - a.price) / a.compare_at_price : 0;
      const discountB = b.compare_at_price ? (b.compare_at_price - b.price) / b.compare_at_price : 0;
      return discountB - discountA;
    });
  }

  return data;
}

export async function getNewProducts(limit = 8): Promise<ProductListItem[]> {
  const products = await getFilteredProducts({ sort: "newest" });
  return products.slice(0, limit);
}

export interface FilterFacets {
  sizes: string[];
  colors: string[];
}

/** Dostępne rozmiary/kolory OGRANICZONE do kontekstu strony (np. na
 * "Mężczyźni" nie pokażemy koloru, który istnieje tylko w damskiej bluzie). */
export async function getFilterFacets(scope: ScopeFilters = {}): Promise<FilterFacets> {
  const supabase = await createClient();
  const productIds = await getScopedProductIds(supabase, scope);

  if (productIds && productIds.length === 0) {
    return { sizes: [], colors: [] };
  }

  let variantQuery = supabase.from("product_variants").select("size, color_name");
  if (productIds) variantQuery = variantQuery.in("product_id", productIds);
  const { data } = await variantQuery;

  const sizes = Array.from(new Set((data ?? []).map((v) => v.size).filter(Boolean))) as string[];
  sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  const colors = Array.from(new Set((data ?? []).map((v) => v.color_name))).sort();

  return { sizes, colors };
}

export async function getProductsByCategorySlug(
  categorySlug: string
): Promise<{ categoryName: string | null }> {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", categorySlug)
    .maybeSingle();

  return { categoryName: category?.name ?? null };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `${LIST_COLUMNS}, description, material_info, fit_info, care_info, gender,
       category:categories(slug, name),
       variants:product_variants(id, color_name, color_hex, size, sku, stock_quantity, reserved_quantity)`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Nie udało się pobrać produktu:", error.message);
    return null;
  }

  return data as unknown as ProductDetail;
}
