import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Oczekuje na płatność",
  paid: "Opłacone",
  processing: "W przygotowaniu",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
  returned: "Zwrócone",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Zamówienia</p>

      {orders && orders.length > 0 ? (
        <div className="mt-6 flex flex-col divide-y divide-stone-800 border-y border-stone-800">
          {orders.map((order) => (
            <Link
              key={order.order_number}
              href={`/konto/zamowienia/${order.order_number}`}
              className="flex items-center justify-between py-4 hover:text-signal"
            >
              <div>
                <p className="font-mono text-sm">{order.order_number}</p>
                <p className="mt-1 font-mono text-xs text-stone-500">
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
              <p className="font-mono text-sm">{formatPrice(order.total)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-stone-400">Nie masz jeszcze żadnych zamówień.</p>
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
