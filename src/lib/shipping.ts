// Czyste dane/logika bez dostępu do ciasteczek — bezpieczne do importu
// zarówno w komponentach serwerowych, jak i klienckich (np. do pokazania
// cen metod dostawy na żywo w formularzu).

export interface ShippingAddress {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
}

export type ShippingMethod = "standard" | "express";

export const SHIPPING_METHODS: Record<
  ShippingMethod,
  { label: string; price: number; freeAbove?: number }
> = {
  standard: { label: "Kurier standardowy (2-3 dni robocze)", price: 14.99, freeAbove: 300 },
  express: { label: "Kurier ekspresowy (następny dzień roboczy)", price: 24.99 },
};

export function getShippingCost(method: ShippingMethod, subtotal: number): number {
  const config = SHIPPING_METHODS[method];
  if (config.freeAbove !== undefined && subtotal >= config.freeAbove) return 0;
  return config.price;
}
