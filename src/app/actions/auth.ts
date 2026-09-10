"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mergeGuestCartIntoUser } from "@/lib/cart";

export interface AuthActionState {
  error?: string;
  needsConfirmation?: boolean;
  values?: { email?: string; firstName?: string; lastName?: string };
}

/** Supabase zwraca komunikaty błędów po angielsku — tłumaczymy te
 * najczęstsze, żeby strona nie mieszała języków. */
function translateSupabaseAuthError(message: string): string {
  const known: Record<string, string> = {
    "User already registered": "Konto z tym adresem e-mail już istnieje.",
    "Password should be at least 6 characters": "Hasło jest za krótkie.",
    "Unable to validate email address: invalid format": "Nieprawidłowy adres e-mail.",
    "Invalid login credentials": "Nieprawidłowy e-mail lub hasło.",
  };

  for (const [needle, translation] of Object.entries(known)) {
    if (message.includes(needle)) return translation;
  }
  if (/invalid/i.test(message) && /email/i.test(message)) {
    return "Nieprawidłowy adres e-mail.";
  }
  return message;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const values = { email, firstName, lastName };

  if (!email || !password || !firstName || !lastName) {
    return { error: "Uzupełnij wszystkie pola.", values };
  }
  if (password.length < 8) {
    return { error: "Hasło musi mieć co najmniej 8 znaków.", values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, last_name: lastName } },
  });

  if (error) {
    return { error: translateSupabaseAuthError(error.message), values };
  }

  // Supabase celowo NIE zwraca błędu, gdy e-mail już istnieje (żeby nikt
  // obcy nie mógł w ten sposób sprawdzać, czyj adres jest zarejestrowany).
  // Jedyny sygnał to pusta tablica "identities" — sprawdzamy to sami.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "Jeśli to Twój adres e-mail, konto już istnieje — spróbuj się zalogować.",
      values,
    };
  }

  if (!data.session) {
    // Konto Supabase wymaga potwierdzenia adresu e-mail przed zalogowaniem.
    return { needsConfirmation: true };
  }

  if (data.user) {
    await mergeGuestCartIntoUser(data.user.id);
  }
  revalidatePath("/", "layout");
  redirect("/konto");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/konto");
  const values = { email };

  if (!email || !password) {
    return { error: "Podaj e-mail i hasło.", values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Nieprawidłowy e-mail lub hasło.", values };
  }

  if (data.user) {
    await mergeGuestCartIntoUser(data.user.id);
  }
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/konto");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
