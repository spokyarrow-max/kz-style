import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminCustomer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: "customer" | "admin";
  email: string | null;
  created_at: string;
  order_count: number;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false });

  if (!profiles || profiles.length === 0) return [];

  // Adresy e-mail żyją w auth.users, nie w naszej tabeli profiles —
  // trzeba je dociągnąć osobno przez Admin API Supabase (klucz service_role).
  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(usersPage?.users.map((u) => [u.id, u.email ?? null]) ?? []);

  const { data: orders } = await admin.from("orders").select("user_id").not("user_id", "is", null);
  const orderCountById = new Map<string, number>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    orderCountById.set(o.user_id, (orderCountById.get(o.user_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? null,
    order_count: orderCountById.get(p.id) ?? 0,
  }));
}
