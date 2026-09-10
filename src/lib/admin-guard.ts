import "server-only";
import { getCurrentUser } from "@/lib/auth";

/**
 * Druga, niezależna warstwa ochrony panelu admina — obok proxy.ts
 * (które blokuje samo wejście na /admin), każda Akcja Serwerowa
 * wywoływana z panelu admina sama sprawdza rolę, zanim cokolwiek
 * zmieni w bazie. Admin client (service role) pomija RLS, więc bez
 * tej kontroli zwykły zalogowany klient mógłby wywołać taką akcję
 * bezpośrednio i np. zmienić cenę produktu.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Brak uprawnień administratora.");
  }
  return user;
}
