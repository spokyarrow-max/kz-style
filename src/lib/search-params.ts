import type { ProductFilters, SortOption } from "@/lib/products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] | undefined {
  const v = first(value);
  return v ? v.split(",").filter(Boolean) : undefined;
}

/**
 * Zamienia parametry z adresu URL (np. ?sort=price_asc&rozmiar=M,L) na
 * obiekt filtrów zrozumiały dla getFilteredProducts. Filtry "stałe" dla
 * danej strony (kategoria, płeć, kolekcja) ustawia sama strona — to tylko
 * część, którą wybiera użytkownik.
 */
export function parseUserFilters(searchParams: RawSearchParams): Partial<ProductFilters> {
  const priceMinRaw = first(searchParams.cenaOd);
  const priceMaxRaw = first(searchParams.cenaDo);

  return {
    search: first(searchParams.q),
    sort: (first(searchParams.sort) as SortOption | undefined) ?? "newest",
    priceMin: priceMinRaw ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw ? Number(priceMaxRaw) : undefined,
    sizes: list(searchParams.rozmiar),
    colors: list(searchParams.kolor),
    inStockOnly: first(searchParams.dostepne) === "1",
  };
}
