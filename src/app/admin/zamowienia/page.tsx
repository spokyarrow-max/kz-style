import Link from "next/link";
import { getAdminOrders } from "@/lib/admin/orders";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
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

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Zamówienia ({orders.length})
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-800 font-mono text-xs uppercase tracking-widest text-stone-500">
              <th className="py-2 pr-4">Numer</th>
              <th className="py-2 pr-4">Klient</th>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Suma</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-900 text-sm text-stone-200">
                <td className="py-3 pr-4 font-mono">{o.order_number}</td>
                <td className="py-3 pr-4">{o.customer_label}</td>
                <td className="py-3 pr-4 font-mono text-xs text-stone-400">
                  {formatDate(o.created_at)}
                </td>
                <td className="py-3 pr-4 font-mono text-xs uppercase text-stone-300">
                  {STATUS_LABELS[o.status] ?? o.status}
                </td>
                <td className="py-3 pr-4 font-mono">{formatPrice(o.total)}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/zamowienia/${o.order_number}`}
                    className="font-mono text-xs uppercase text-signal hover:text-stone-100"
                  >
                    Szczegóły
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-6 text-stone-400">Nie ma jeszcze żadnych zamówień.</p>
        )}
      </div>
    </div>
  );
}
