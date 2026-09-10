import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSessionClient } from "@/lib/supabase/server";

const GUEST_COOKIE = "kz_guest_cart";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dni

export interface CartItemView {
  id: string;
  quantity: number;
  variant: {
    id: string;
    color_name: string;
    size: string | null;
    sku: string;
    availableStock: number;
  };
  product: {
    slug: string;
    name: string;
    price: number;
  };
}

/** Tylko odczyt — bezpieczne do wywołania z Komponentu Serwerowego. */
async function getGuestToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE)?.value ?? null;
}

/** Odczyt + w razie potrzeby zapis ciasteczka. Next.js pozwala modyfikować
 * ciasteczka tylko w Server Action / Route Handlerze — dlatego tej wersji
 * używamy wyłącznie wewnątrz akcji, nigdy przy samym renderowaniu strony. */
async function getOrCreateGuestToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  cookieStore.set(GUEST_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: "/",
  });
  return token;
}

/** Kto teraz "posiada" koszyk: zalogowany użytkownik (po user_id) ma
 * pierwszeństwo przed gościem (po ciasteczku). */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Tylko odczyt — id koszyka bieżącego gościa/użytkownika, albo null. */
export async function findCartId(): Promise<string | null> {
  const admin = createAdminClient();
  const userId = await getCurrentUserId();

  if (userId) {
    const { data } = await admin.from("carts").select("id").eq("user_id", userId).maybeSingle();
    return data?.id ?? null;
  }

  const token = await getGuestToken();
  if (!token) return null;
  const { data } = await admin.from("carts").select("id").eq("guest_token", token).maybeSingle();
  return data?.id ?? null;
}

/** Znajdź koszyk (usera albo gościa) lub go utwórz. Tworzy ciasteczko
 * gościa w razie potrzeby — wywoływać WYŁĄCZNIE z Server Actions. */
async function getOrCreateCartId(): Promise<string> {
  const admin = createAdminClient();
  const userId = await getCurrentUserId();

  if (userId) {
    const { data: existing } = await admin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created, error } = await admin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error || !created) throw new Error("Nie udało się utworzyć koszyka.");
    return created.id;
  }

  const token = await getOrCreateGuestToken();
  const { data: existing } = await admin
    .from("carts")
    .select("id")
    .eq("guest_token", token)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await admin
    .from("carts")
    .insert({ guest_token: token })
    .select("id")
    .single();
  if (error || !created) throw new Error("Nie udało się utworzyć koszyka.");
  return created.id;
}

/** Wywoływać zaraz po zalogowaniu/rejestracji: jeśli gość miał coś w
 * koszyku, przenosi to do koszyka konta (i usuwa koszyk gościa). */
export async function mergeGuestCartIntoUser(userId: string): Promise<void> {
  const token = await getGuestToken();
  if (!token) return;

  const admin = createAdminClient();
  const { data: guestCart } = await admin
    .from("carts")
    .select("id")
    .eq("guest_token", token)
    .maybeSingle();
  if (!guestCart) return;

  const { data: userCart } = await admin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!userCart) {
    // Konto nie ma jeszcze koszyka — najprościej "przepisać" koszyk gościa na konto.
    await admin.from("carts").update({ user_id: userId, guest_token: null }).eq("id", guestCart.id);
    return;
  }

  const { data: guestItems } = await admin
    .from("cart_items")
    .select("product_variant_id, quantity")
    .eq("cart_id", guestCart.id);

  for (const item of guestItems ?? []) {
    const { data: existingItem } = await admin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", userCart.id)
      .eq("product_variant_id", item.product_variant_id)
      .maybeSingle();

    if (existingItem) {
      await admin
        .from("cart_items")
        .update({ quantity: existingItem.quantity + item.quantity })
        .eq("id", existingItem.id);
    } else {
      await admin.from("cart_items").insert({
        cart_id: userCart.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
      });
    }
  }

  // Kasuje koszyk gościa razem z jego pozycjami (ON DELETE CASCADE).
  await admin.from("carts").delete().eq("id", guestCart.id);
}

function mapRow(row: any): CartItemView | null {
  const variant = row.variant;
  const product = variant?.product;
  if (!variant || !product) return null;

  return {
    id: row.id,
    quantity: row.quantity,
    variant: {
      id: variant.id,
      color_name: variant.color_name,
      size: variant.size,
      sku: variant.sku,
      availableStock: variant.stock_quantity - variant.reserved_quantity,
    },
    product: {
      slug: product.slug,
      name: product.name,
      price: product.price,
    },
  };
}

/** Bezpieczne do wywołania wszędzie (Server Components i Server Actions) —
 * tylko odczyt, nie zakłada, że koszyk już istnieje. */
export async function getCart(): Promise<CartItemView[]> {
  const cartId = await findCartId();
  if (!cartId) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `id, quantity,
       variant:product_variants(id, color_name, size, sku, stock_quantity, reserved_quantity,
         product:products(slug, name, price))`
    )
    .eq("cart_id", cartId);

  if (error || !data) return [];
  return data.map(mapRow).filter((item): item is CartItemView => item !== null);
}

export async function getCartItemCount(): Promise<number> {
  const items = await getCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function getCartTotal(): Promise<number> {
  const items = await getCart();
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/** Poniższe funkcje ZAPISUJĄ dane i mogą tworzyć ciasteczko — wywoływać
 * WYŁĄCZNIE z Server Actions w src/app/actions/cart.ts. */

export async function addToCart(
  variantId: string,
  quantity: number
): Promise<{ error?: string }> {
  if (quantity <= 0) return { error: "Nieprawidłowa ilość." };

  const supabase = createAdminClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("id, stock_quantity, reserved_quantity, is_active")
    .eq("id", variantId)
    .maybeSingle();

  if (!variant || !variant.is_active) return { error: "Ten wariant jest niedostępny." };

  const available = variant.stock_quantity - variant.reserved_quantity;
  const cartId = await getOrCreateCartId();

  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_variant_id", variantId)
    .maybeSingle();

  const requestedTotal = (existingItem?.quantity ?? 0) + quantity;
  if (requestedTotal > available) {
    return { error: `Dostępnych jest tylko ${available} szt. tego wariantu.` };
  }

  if (existingItem) {
    await supabase.from("cart_items").update({ quantity: requestedTotal }).eq("id", existingItem.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_variant_id: variantId, quantity });
  }

  return {};
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    return {};
  }

  const { data: item } = await supabase
    .from("cart_items")
    .select("variant:product_variants(stock_quantity, reserved_quantity)")
    .eq("id", itemId)
    .maybeSingle();

  const variant = (item as any)?.variant;
  if (!variant) return { error: "Pozycja koszyka nie istnieje." };

  const available = variant.stock_quantity - variant.reserved_quantity;
  if (quantity > available) {
    return { error: `Dostępnych jest tylko ${available} szt.` };
  }

  await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  return {};
}

export async function removeCartItem(itemId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("cart_items").delete().eq("id", itemId);
}
