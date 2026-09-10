import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database.types";

export interface AdminOrderListItem {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  customer_label: string;
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, status, total, created_at, guest_email, user_id")
    .order("created_at", { ascending: false });

  if (!orders) return [];

  const userIds = orders.map((o) => o.user_id).filter((id): id is string => !!id);
  const profilesById = new Map<string, { first_name: string | null; last_name: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profilesById.set(p.id, p);
    }
  }

  return orders.map((o) => {
    const profile = o.user_id ? profilesById.get(o.user_id) : null;
    const customer_label = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Zalogowany klient"
      : (o.guest_email ?? "Gość");

    return {
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total: o.total,
      created_at: o.created_at,
      customer_label,
    };
  });
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  shipping_address: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  shipping_method: string | null;
  guest_email: string | null;
  created_at: string;
  customer_label: string;
  items: {
    product_name_snapshot: string;
    variant_label_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
  }[];
}

export async function getAdminOrderByNumber(orderNumber: string): Promise<AdminOrderDetail | null> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, order_number, status, subtotal, discount_amount, shipping_cost, total, shipping_address, shipping_method, guest_email, user_id, created_at"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity")
    .eq("order_id", order.id);

  let customer_label = order.guest_email ?? "Gość";
  if (order.user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", order.user_id)
      .maybeSingle();
    customer_label = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Zalogowany klient"
      : "Zalogowany klient";
  }

  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    shipping_cost: order.shipping_cost,
    total: order.total,
    shipping_address: order.shipping_address as unknown as AdminOrderDetail["shipping_address"],
    shipping_method: order.shipping_method,
    guest_email: order.guest_email,
    created_at: order.created_at,
    customer_label,
    items: items ?? [],
  };
}
