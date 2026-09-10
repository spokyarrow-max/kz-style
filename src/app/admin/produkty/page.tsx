import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/products";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Produkty ({products.length})
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-800 font-mono text-xs uppercase tracking-widest text-stone-500">
              <th className="py-2 pr-4">Produkt</th>
              <th className="py-2 pr-4">Kategoria</th>
              <th className="py-2 pr-4">Cena</th>
              <th className="py-2 pr-4">Stan (suma)</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-900 text-sm text-stone-200">
                <td className="py-3 pr-4">{p.name}</td>
                <td className="py-3 pr-4 text-stone-400">{p.category_name ?? "—"}</td>
                <td className="py-3 pr-4 font-mono">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4 font-mono">
                  {p.total_stock} szt. ({p.variant_count} wariantów)
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`font-mono text-xs uppercase ${p.is_active ? "text-signal" : "text-stone-500"}`}
                  >
                    {p.is_active ? "Aktywny" : "Ukryty"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/produkty/${p.slug}`}
                    className="font-mono text-xs uppercase text-signal hover:text-stone-100"
                  >
                    Edytuj
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
