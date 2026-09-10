import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/** Zbiór ID produktów, które zalogowany użytkownik ma w ulubionych.
 * Puste, jeśli nikt nie jest zalogowany — bezpieczne do wywołania zawsze. */
export async function getWishlistedProductIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);

  return new Set((data ?? []).map((row) => row.product_id));
}
