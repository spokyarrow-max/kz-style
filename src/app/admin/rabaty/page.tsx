import { getAdminDiscountCodes } from "@/lib/admin/discounts";
import { AdminDiscountForm } from "@/components/admin-discount-form";
import { AdminDiscountToggle } from "@/components/admin-discount-toggle";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminDiscountsPage() {
  const codes = await getAdminDiscountCodes();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Nowy kod</p>
      <div className="mt-4">
        <AdminDiscountForm />
      </div>

      <p className="mt-12 font-mono text-xs uppercase tracking-widest text-stone-400">
        Istniejące kody ({codes.length})
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-800 font-mono text-xs uppercase tracking-widest text-stone-500">
              <th className="py-2 pr-4">Kod</th>
              <th className="py-2 pr-4">Rabat</th>
              <th className="py-2 pr-4">Min. zamówienie</th>
              <th className="py-2 pr-4">Użycia</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-stone-900 text-sm text-stone-200">
                <td className="py-3 pr-4 font-mono">{c.code}</td>
                <td className="py-3 pr-4">
                  {c.type === "percentage" ? `${c.value}%` : formatPrice(c.value)}
                </td>
                <td className="py-3 pr-4 text-stone-400">
                  {c.min_order_value ? formatPrice(c.min_order_value) : "—"}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-stone-400">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="py-3 text-right">
                  <AdminDiscountToggle id={c.id} isActive={c.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && <p className="py-6 text-stone-400">Brak kodów rabatowych.</p>}
      </div>
    </div>
  );
}
