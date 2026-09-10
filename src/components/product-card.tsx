import Link from "next/link";
import type { ProductListItem } from "@/lib/products";
import { WishlistButton } from "@/components/wishlist-button";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export function ProductCard({
  product,
  isWishlisted = false,
  isLoggedIn = false,
}: {
  product: ProductListItem;
  isWishlisted?: boolean;
  isLoggedIn?: boolean;
}) {
  const onSale = product.compare_at_price !== null && product.compare_at_price > product.price;

  return (
    <div className="group">
      <Link href={`/produkt/${product.slug}`} className="block">
        {/* Placeholder zdjęcia — do podmiany na prawdziwe fotografie w Storage. */}
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-stone-800 bg-stone-900">
          <span className="font-display text-3xl font-black uppercase tracking-tight text-stone-700 transition-colors group-hover:text-stone-600">
            KZ
          </span>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.is_limited_drop && (
              <span className="bg-signal px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-signal-ink">
                Limited
              </span>
            )}
            {product.is_new && !product.is_limited_drop && (
              <span className="bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-stone-950">
                Nowość
              </span>
            )}
            {onSale && (
              <span className="border border-signal px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-signal">
                Sale
              </span>
            )}
          </div>

          <div className="absolute right-2 top-2">
            <WishlistButton
              productId={product.id}
              initialWishlisted={isWishlisted}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

        <div className="mt-3">
          <p className="font-display text-lg font-bold uppercase leading-tight text-stone-100">
            {product.name}
          </p>
          <p className="mt-1 font-mono text-sm">
            {onSale ? (
              <>
                <span className="text-signal">{formatPrice(product.price)}</span>{" "}
                <span className="text-stone-500 line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              </>
            ) : (
              <span className="text-stone-300">{formatPrice(product.price)}</span>
            )}
          </p>
        </div>
      </Link>
    </div>
  );
}
