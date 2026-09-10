import { getCart } from "@/lib/cart";
import { CartView } from "@/components/cart-view";

export default async function CartPage() {
  const items = await getCart();

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <h1 className="font-display text-5xl font-black uppercase text-stone-100">Koszyk</h1>
      <CartView items={items} />
    </main>
  );
}
