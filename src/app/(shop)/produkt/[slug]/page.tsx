import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { ProductVariantSelector } from "@/components/product-variant-selector";
import { WishlistButton } from "@/components/wishlist-button";
import { getWishlistedProductIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export async function generateMetadata(
  props: PageProps<"/produkt/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description =
    product.description ?? `${product.name} — polski premium streetwear od KZ Style.`;

  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description },
    twitter: { title: product.name, description },
  };
}

export default async function ProductPage(props: PageProps<"/produkt/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [wishlistedIds, user] = await Promise.all([getWishlistedProductIds(), getCurrentUser()]);
  const onSale = product.compare_at_price !== null && product.compare_at_price > product.price;

  const totalAvailable = product.variants.reduce(
    (sum, v) => sum + (v.stock_quantity - v.reserved_quantity),
    0
  );
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "KZ Style" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: product.price,
      availability:
        totalAvailable > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="flex-1 px-6 py-12 sm:px-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <nav className="font-mono text-xs uppercase text-stone-400">
        <Link href="/" className="hover:text-signal">
          Home
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/kategoria/${product.category.slug}`} className="hover:text-signal">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-stone-200">{product.name}</span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="border border-stone-800 bg-stone-900">
          <img
            src={`/images/products/${product.slug}.png`}
            alt={product.name}
            className="block w-full h-auto"
          />
        </div>

        <div>
          {(product.is_new || product.is_bestseller || product.is_limited_drop) && (
            <div className="mb-4 flex gap-2">
              {product.is_limited_drop && (
                <span className="bg-signal px-2 py-1 font-mono text-[10px] font-bold uppercase text-signal-ink">
                  Limited
                </span>
              )}
              {product.is_new && (
                <span className="bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-stone-950">
                  Nowość
                </span>
              )}
              {product.is_bestseller && (
                <span className="border border-stone-600 px-2 py-1 font-mono text-[10px] font-bold uppercase text-stone-200">
                  Bestseller
                </span>
              )}
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl font-black uppercase leading-none text-stone-100 sm:text-5xl">
              {product.name}
            </h1>
            <WishlistButton
              productId={product.id}
              initialWishlisted={wishlistedIds.has(product.id)}
              isLoggedIn={!!user}
              size="lg"
            />
          </div>

          <p className="mt-4 font-mono text-xl">
            {onSale ? (
              <>
                <span className="text-signal">{formatPrice(product.price)}</span>{" "}
                <span className="text-stone-500 line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              </>
            ) : (
              <span className="text-stone-200">{formatPrice(product.price)}</span>
            )}
          </p>

          {product.description && (
            <p className="mt-6 max-w-prose text-stone-300">{product.description}</p>
          )}

          <ProductVariantSelector variants={product.variants} />

          <dl className="mt-10 space-y-2 border-t border-stone-800 pt-6 font-mono text-xs text-stone-400">
            {product.material_info && (
              <div className="flex gap-2">
                <dt className="uppercase text-stone-500">Materiał:</dt>
                <dd>{product.material_info}</dd>
              </div>
            )}
            {product.fit_info && (
              <div className="flex gap-2">
                <dt className="uppercase text-stone-500">Krój:</dt>
                <dd>{product.fit_info}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="uppercase text-stone-500">Dostawa:</dt>
              <dd>Wysyłka w 24h, darmowa od 300 zł</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
