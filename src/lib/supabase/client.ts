import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Klient do użycia w komponentach działających w przeglądarce ("use client").
// Respektuje reguły dostępu (RLS) — widzi tylko to, na co pozwala zalogowanej osobie.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
