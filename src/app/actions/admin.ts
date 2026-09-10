"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database.types";
import {
  productUpdateSchema,
  variantStockSchema,
  discountCodeInputSchema,
  firstIssueMessage,
} from "@/lib/validation";

export interface AdminActionState {
  error?: string;
  success?: boolean;
}

// ---------- Produkty ----------

export async function updateProductAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const compareAtRaw = String(formData.get("compareAtPrice") ?? "").trim();

  const parsed = productUpdateSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    compareAtPrice: compareAtRaw || null,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({
      name: parsed.data.name,
      price: parsed.data.price,
      compare_at_price: parsed.data.compareAtPrice,
      description: parsed.data.description,
      is_active: formData.get("isActive") === "on",
      is_new: formData.get("isNew") === "on",
      is_bestseller: formData.get("isBestseller") === "on",
      is_limited_drop: formData.get("isLimitedDrop") === "on",
    })
    .eq("id", productId);

  if (error) return { error: "Nie udało się zapisać zmian." };

  revalidatePath("/admin/produkty");
  revalidatePath(`/admin/produkty/${slug}`);
  return { success: true };
}

export async function updateVariantAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const parsed = variantStockSchema.safeParse({ stockQuantity: formData.get("stockQuantity") });
  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }
  const { stockQuantity } = parsed.data;

  const admin = createAdminClient();

  const { data: variant } = await admin
    .from("product_variants")
    .select("reserved_quantity")
    .eq("id", variantId)
    .maybeSingle();

  if (!variant) return { error: "Wariant nie istnieje." };
  if (stockQuantity < variant.reserved_quantity) {
    return {
      error: `Nie można ustawić stanu niższego niż aktualnie zarezerwowane ${variant.reserved_quantity} szt. (klienci mają to w trakcie płatności).`,
    };
  }

  const { error } = await admin
    .from("product_variants")
    .update({ stock_quantity: stockQuantity, is_active: formData.get("isActive") === "on" })
    .eq("id", variantId);

  if (error) return { error: "Nie udało się zapisać zmian." };

  revalidatePath(`/admin/produkty/${slug}`);
  revalidatePath("/admin/produkty");
  return { success: true };
}

// ---------- Zamówienia ----------

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export async function updateOrderStatusAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin_user = await requireAdmin();

  const orderNumber = String(formData.get("orderNumber") ?? "");
  const newStatus = String(formData.get("status") ?? "") as OrderStatus;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { error: "Zamówienie nie istnieje." };

  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `Nie można zmienić statusu z "${order.status}" na "${newStatus}".` };
  }

  const { error } = await admin.from("orders").update({ status: newStatus }).eq("id", order.id);
  if (error) return { error: "Nie udało się zmienić statusu." };

  await admin
    .from("order_status_history")
    .insert({ order_id: order.id, status: newStatus, changed_by: admin_user.id });

  revalidatePath(`/admin/zamowienia/${orderNumber}`);
  revalidatePath("/admin/zamowienia");
  return { success: true };
}

// ---------- Kody rabatowe ----------

export async function createDiscountCodeAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const minOrderRaw = String(formData.get("minOrderValue") ?? "").trim();
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();

  const parsed = discountCodeInputSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrderValue: minOrderRaw || null,
    maxUses: maxUsesRaw || null,
  });

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("discount_codes").insert({
    code: parsed.data.code,
    type: parsed.data.type,
    value: parsed.data.value,
    min_order_value: parsed.data.minOrderValue,
    max_uses: parsed.data.maxUses,
  });

  if (error) {
    if (error.code === "23505") return { error: "Taki kod już istnieje." };
    return { error: "Nie udało się utworzyć kodu." };
  }

  revalidatePath("/admin/rabaty");
  return { success: true };
}

export async function toggleDiscountActiveAction(discountId: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("discount_codes").update({ is_active: isActive }).eq("id", discountId);
  revalidatePath("/admin/rabaty");
}

// ---------- Klienci ----------

export async function toggleAdminRoleAction(userId: string, makeAdmin: boolean) {
  const currentAdmin = await requireAdmin();
  if (userId === currentAdmin.id) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ role: makeAdmin ? "admin" : "customer" })
    .eq("id", userId);

  revalidatePath("/admin/klienci");
}
