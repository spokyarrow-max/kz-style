import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DiscountType } from "@/types/database.types";

export interface AdminDiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  is_active: boolean;
  valid_until: string | null;
  min_order_value: number | null;
  max_uses: number | null;
  used_count: number;
}

export async function getAdminDiscountCodes(): Promise<AdminDiscountCode[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("discount_codes")
    .select("id, code, type, value, is_active, valid_until, min_order_value, max_uses, used_count")
    .order("code");
  return data ?? [];
}
