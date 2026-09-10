import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlists")
    .select(
      "product:products(id, slug, name, price, compare_at_price, is_new, is_bestseller, is_limited_drop)"
    )
    .eq("user_id", user.id);

  const products = (data ?? [])
    .map((row: any) => row.product)
    .filter((p: any) => p !== null);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Ulubione</p>

      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} isWishlisted isLoggedIn />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-stone-400">Nie masz jeszcze ulubionych produktów.</p>
          <Link
            href="/nowosci"
            className="mt-4 inline-block bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
          >
            Zobacz kolekcję
          </Link>
        </div>
      )}
    </div>
  );
}
