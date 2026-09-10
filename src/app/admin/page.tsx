import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [{ count: productCount }, { count: customerCount }, { data: orders }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("orders").select("status, total"),
  ]);

  const paidOrders = (orders ?? []).filter((o) => o.status !== "pending_payment" && o.status !== "cancelled");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = (orders ?? []).filter((o) => o.status === "paid").length;

  const tiles = [
    { label: "Przychód (opłacone)", value: formatPrice(revenue) },
    { label: "Zamówienia do wysłania", value: String(pendingCount) },
    { label: "Produkty w katalogu", value: String(productCount ?? 0) },
    { label: "Klienci", value: String(customerCount ?? 0) },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border border-stone-800 p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
              {tile.label}
            </p>
            <p className="mt-3 font-display text-3xl font-black text-stone-100">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 font-mono text-sm uppercase">
        <Link href="/admin/zamowienia" className="text-signal hover:text-stone-100">
          Zobacz zamówienia →
        </Link>
        <Link href="/admin/produkty" className="text-signal hover:text-stone-100">
          Zarządzaj produktami →
        </Link>
      </div>
    </div>
  );
}
