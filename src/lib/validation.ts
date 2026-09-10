import { z } from "zod";

// Wspólne schematy walidacji danych z formularzy (zod) — używane w
// Akcjach Serwerowych, żeby nie ufać niczemu, co przyszło z przeglądarki:
// złe typy, brakujące pola i nierealne wartości (np. ujemna cena) są
// odrzucane w jednym, czytelnym miejscu zamiast rozproszonych ręcznych
// sprawdzeń.

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Podaj adres e-mail.")
  .email("Podaj prawidłowy adres e-mail.");

export const shippingAddressSchema = z.object({
  recipientName: z.string().trim().min(2, "Podaj imię i nazwisko odbiorcy."),
  street: z.string().trim().min(3, "Podaj ulicę i numer."),
  city: z.string().trim().min(2, "Podaj miasto."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{2}-\d{3}$/, "Kod pocztowy musi mieć format XX-XXX."),
  phone: z.string().trim().min(9, "Podaj prawidłowy numer telefonu.").max(20),
});

export const discountCodeInputSchema = z.object({
  code: z.string().trim().min(2, "Kod musi mieć co najmniej 2 znaki.").max(30),
  type: z.enum(["percentage", "fixed"], { message: "Wybierz typ rabatu." }),
  value: z.coerce.number().positive("Podaj prawidłową wartość rabatu."),
  minOrderValue: z.coerce.number().nonnegative().nullable(),
  maxUses: z.coerce.number().int().positive().nullable(),
});

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Podaj nazwę produktu."),
    price: z.coerce.number().nonnegative("Cena nie może być ujemna."),
    compareAtPrice: z.coerce.number().nonnegative().nullable(),
    description: z.string().trim().nullable(),
  })
  .refine((data) => data.compareAtPrice === null || data.compareAtPrice > data.price, {
    message: "Cena przed promocją musi być wyższa niż cena obecna.",
    path: ["compareAtPrice"],
  });

export const variantStockSchema = z.object({
  stockQuantity: z.coerce
    .number()
    .int("Stan magazynowy musi być liczbą całkowitą.")
    .nonnegative("Stan magazynowy nie może być ujemny."),
});

/** Wyciąga pierwszy, czytelny komunikat błędu z wyniku zod — do pokazania w UI. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Sprawdź poprawność danych.";
}
