import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DiscountResult {
  valid: boolean;
  code: string;
  type?: "percentage" | "fixed";
  amount: number;
  error?: string;
}

/**
 * Sprawdza kod rabatowy i liczy realną kwotę rabatu — WYŁĄCZNIE po
 * stronie serwera. Tabela discount_codes nie ma publicznego odczytu
 * (RLS), więc klient nigdy nie zobaczy listy kodów — tylko wynik
 * dla TEGO jednego, konkretnego kodu, który sam wpisał.
 */
export async function validateDiscountCode(
  rawCode: string,
  subtotal: number
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, code, amount: 0, error: "Wpisz kod rabatowy." };
  }

  const supabase = createAdminClient();
  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!discount || !discount.is_active) {
    return { valid: false, code, amount: 0, error: "Nieprawidłowy kod rabatowy." };
  }

  const now = new Date();
  if (new Date(discount.valid_from) > now) {
    return { valid: false, code, amount: 0, error: "Ten kod nie jest jeszcze aktywny." };
  }
  if (discount.valid_until && new Date(discount.valid_until) < now) {
    return { valid: false, code, amount: 0, error: "Ten kod rabatowy wygasł." };
  }
  if (discount.max_uses !== null && discount.used_count >= discount.max_uses) {
    return { valid: false, code, amount: 0, error: "Limit użyć tego kodu został wyczerpany." };
  }
  if (discount.min_order_value !== null && subtotal < discount.min_order_value) {
    return {
      valid: false,
      code,
      amount: 0,
      error: `Ten kod wymaga zamówienia od ${discount.min_order_value.toFixed(2)} zł.`,
    };
  }

  const amount =
    discount.type === "percentage"
      ? Math.round(((subtotal * discount.value) / 100) * 100) / 100
      : Math.min(discount.value, subtotal);

  return { valid: true, code, type: discount.type, amount };
}
