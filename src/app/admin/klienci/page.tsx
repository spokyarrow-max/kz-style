import { getAdminCustomers } from "@/lib/admin/customers";
import { getCurrentUser } from "@/lib/auth";
import { AdminRoleToggle } from "@/components/admin-role-toggle";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminCustomersPage() {
  const [customers, currentUser] = await Promise.all([getAdminCustomers(), getCurrentUser()]);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Klienci ({customers.length})
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-800 font-mono text-xs uppercase tracking-widest text-stone-500">
              <th className="py-2 pr-4">Klient</th>
              <th className="py-2 pr-4">E-mail</th>
              <th className="py-2 pr-4">Zamówienia</th>
              <th className="py-2 pr-4">Dołączył/a</th>
              <th className="py-2 pr-4">Rola</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-stone-900 text-sm text-stone-200">
                <td className="py-3 pr-4">
                  {[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="py-3 pr-4 text-stone-400">{c.email ?? "—"}</td>
                <td className="py-3 pr-4 font-mono">{c.order_count}</td>
                <td className="py-3 pr-4 font-mono text-xs text-stone-400">
                  {formatDate(c.created_at)}
                </td>
                <td className="py-3 pr-4 font-mono text-xs uppercase text-stone-300">{c.role}</td>
                <td className="py-3 text-right">
                  <AdminRoleToggle
                    userId={c.id}
                    isAdmin={c.role === "admin"}
                    isSelf={c.id === currentUser?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
