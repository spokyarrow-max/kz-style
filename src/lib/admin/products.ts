import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_active: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_limited_drop: boolean;
  category_name: string | null;
  variant_count: number;
  total_stock: number;
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select(
      "id, slug, name, price, is_active, is_new, is_bestseller, is_limited_drop, category:categories(name)"
    )
    .order("created_at", { ascending: false });

  if (!products) return [];

  const { data: variants } = await admin
    .from("product_variants")
    .select("product_id, stock_quantity");

  const stockByProduct = new Map<string, { count: number; stock: number }>();
  for (const v of variants ?? []) {
    const entry = stockByProduct.get(v.product_id) ?? { count: 0, stock: 0 };
    entry.count += 1;
    entry.stock += v.stock_quantity;
    stockByProduct.set(v.product_id, entry);
  }

  return products.map((p) => {
    const category = p.category as unknown as { name: string } | null;
    const stats = stockByProduct.get(p.id) ?? { count: 0, stock: 0 };
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      is_active: p.is_active,
      is_new: p.is_new,
      is_bestseller: p.is_bestseller,
      is_limited_drop: p.is_limited_drop,
      category_name: category?.name ?? null,
      variant_count: stats.count,
      total_stock: stats.stock,
    };
  });
}

export interface AdminProductVariant {
  id: string;
  color_name: string;
  size: string | null;
  sku: string;
  stock_quantity: number;
  reserved_quantity: number;
  is_active: boolean;
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_limited_drop: boolean;
  variants: AdminProductVariant[];
}

export async function getAdminProductBySlug(slug: string): Promise<AdminProductDetail | null> {
  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select(
      "id, slug, name, description, price, compare_at_price, is_active, is_new, is_bestseller, is_limited_drop"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return null;

  const { data: variants } = await admin
    .from("product_variants")
    .select("id, color_name, size, sku, stock_quantity, reserved_quantity, is_active")
    .eq("product_id", product.id)
    .order("color_name");

  return { ...product, variants: variants ?? [] };
}
