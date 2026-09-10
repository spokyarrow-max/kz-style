import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Strony bez sensu do zaindeksowania: prywatne (koszyk/konto/checkout)
      // albo wymagające zalogowania (admin) — Google i tak nic tam nie zobaczy
      // bez sesji, ale lepiej nawet nie zachęcać robotów do wchodzenia.
      disallow: ["/admin", "/konto", "/checkout", "/koszyk", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
