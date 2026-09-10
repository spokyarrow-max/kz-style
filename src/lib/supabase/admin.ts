import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Klient "super-uprawniony" — pomija wszystkie reguły dostępu (RLS).
// UŻYWAĆ WYŁĄCZNIE w kodzie serwerowym, którego przeglądarka nigdy nie zobaczy
// (np. finalizacja zamówienia po płatności, webhook Stripe, akcje panelu admina
// po sprawdzeniu roli). Import "server-only" na górze pilnuje, żeby ten plik
// nie trafił przypadkiem do kodu wysyłanego do przeglądarki.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
