import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// Klient do użycia na serwerze (Server Components, Server Actions, Route Handlers).
// Też respektuje RLS — wie, kto jest zalogowany, dzięki ciasteczkom sesji.
// Next.js 16: cookies() jest asynchroniczne, dlatego ta funkcja też jest "async".
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Wywołane z Server Component, który nie może zapisywać ciasteczek —
            // bezpieczne do zignorowania, bo proxy.ts odświeża sesję niezależnie.
          }
        },
      },
    }
  );
}
