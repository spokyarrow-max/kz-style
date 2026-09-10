import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function OrderDetailPage(props: PageProps<"/konto/zamowienia/[numer]">) {
  const { numer } = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal, discount_amount, shipping_cost, total, created_at")
    .eq("order_number", numer)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity")
    .eq("order_id", order.id);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Zamówienie {order.order_number}
      </p>

      <div className="mt-6 flex flex-col divide-y divide-stone-800 border-y border-stone-800">
        {(items ?? []).map((item, i) => (
          <div key={i} className="flex justify-between py-4">
            <div>
              <p className="text-stone-100">{item.product_name_snapshot}</p>
              <p className="font-mono text-xs text-stone-500">
                {item.variant_label_snapshot} × {item.quantity}
              </p>
            </div>
            <p className="font-mono text-sm">
              {formatPrice(item.unit_price_snapshot * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-1 font-mono text-sm text-stone-300">
        <div className="flex justify-between">
          <span>Suma częściowa</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Dostawa</span>
          <span>{formatPrice(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between text-lg text-stone-100">
          <span>Razem</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
