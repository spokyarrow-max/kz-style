import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/mezczyzni",
  "/kobiety",
  "/bizuteria",
  "/nowosci",
  "/bestsellery",
  "/limited-drop",
  "/sale",
  "/o-nas",
  "/kontakt",
  "/dostawa",
  "/zwroty",
  "/faq",
  "/regulamin",
  "/polityka-prywatnosci",
  "/polityka-cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Tylko odczyt publicznego katalogu — bezpieczny klucz publishable
  // wystarczy, bo produkty/kategorie i tak są jawne dla każdego (RLS).
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${siteUrl}/produkt/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${siteUrl}/kategoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
