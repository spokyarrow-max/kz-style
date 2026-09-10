import "server-only";
import Stripe from "stripe";

// Jeden, współdzielony klient Stripe do wszystkich operacji server-side
// (tworzenie PaymentIntent, sprawdzanie statusu, weryfikacja webhooków).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
