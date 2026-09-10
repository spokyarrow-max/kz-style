import { notFound } from "next/navigation";
import { getAdminOrderByNumber } from "@/lib/admin/orders";
import { AdminOrderStatusForm } from "@/components/admin-order-status-form";

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

export default async function AdminOrderDetailPage(props: PageProps<"/admin/zamowienia/[numer]">) {
  const { numer } = await props.params;
  const order = await getAdminOrderByNumber(numer);
  if (!order) notFound();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Zamówienie {order.order_number}
      </p>
      <p className="mt-2 font-display text-2xl font-bold uppercase text-stone-100">
        {STATUS_LABELS[order.status] ?? order.status}
      </p>

      <div className="mt-6">
        <AdminOrderStatusForm orderNumber={order.order_number} currentStatus={order.status} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Klient i dostawa
          </p>
          <p className="mt-3 text-stone-200">{order.customer_label}</p>
          {order.guest_email && <p className="text-sm text-stone-400">{order.guest_email}</p>}
          <p className="mt-3 text-sm text-stone-300">
            {order.shipping_address.recipientName}
            <br />
            {order.shipping_address.street}, {order.shipping_address.postalCode}{" "}
            {order.shipping_address.city}
            <br />
            {order.shipping_address.phone}
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Produkty</p>
          <div className="mt-3 flex flex-col divide-y divide-stone-900">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-3">
                <div>
                  <p className="text-sm text-stone-100">{item.product_name_snapshot}</p>
                  <p className="font-mono text-xs text-stone-500">
                    {item.variant_label_snapshot} × {item.quantity}
                  </p>
                </div>
                <p className="font-mono text-sm text-stone-200">
                  {formatPrice(item.unit_price_snapshot * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1 border-t border-stone-800 pt-4 font-mono text-sm text-stone-300">
            <div className="flex justify-between">
              <span>Suma częściowa</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-signal">
                <span>Rabat</span>
                <span>−{formatPrice(order.discount_amount)}</span>
              </div>
            )}
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
      </div>
    </div>
  );
}
