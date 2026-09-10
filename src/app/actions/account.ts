"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error?: string;
  success?: boolean;
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany.");
  return user.id;
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "Uzupełnij imię i nazwisko." };

  const supabase = await createClient();
  const userId = await requireUserId();

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", userId);

  if (error) return { error: "Nie udało się zapisać zmian." };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { error: "Hasło musi mieć co najmniej 8 znaków." };
  if (password !== confirmPassword) return { error: "Hasła nie są identyczne." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Nie udało się zmienić hasła." };

  return { success: true };
}

export async function addAddressAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await requireUserId();
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim() || null;
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!recipientName || !street || !city || !postalCode) {
    return { error: "Uzupełnij wymagane pola adresu." };
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    label,
    recipient_name: recipientName,
    street,
    city,
    postal_code: postalCode,
    phone,
  });

  if (error) return { error: "Nie udało się zapisać adresu." };

  revalidatePath("/konto/adresy");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId);
  revalidatePath("/konto/adresy");
}

export async function setDefaultAddressAction(addressId: string) {
  const userId = await requireUserId();
  const supabase = await createClient();

  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  await supabase.from("addresses").update({ is_default: true }).eq("id", addressId);
  revalidatePath("/konto/adresy");
}

export async function toggleWishlistAction(productId: string) {
  const userId = await requireUserId();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId);
  } else {
    await supabase.from("wishlists").insert({ user_id: userId, product_id: productId });
  }

  revalidatePath("/", "layout");
}
