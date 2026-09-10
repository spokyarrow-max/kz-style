"use client";

import { useActionState, useEffect, useState } from "react";
import { saveShippingAction, type CheckoutActionState } from "@/app/actions/checkout";
import {
  getShippingCost,
  SHIPPING_METHODS,
  type ShippingAddress,
  type ShippingMethod,
} from "@/lib/shipping";

interface SavedAddress {
  id: string;
  label: string | null;
  recipient_name: string;
  street: string;
  city: string;
  postal_code: string;
  phone: string | null;
  is_default: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);
}

const initialState: CheckoutActionState = {};

export function ShippingForm({
  addresses,
  subtotal,
  defaultMethod,
  defaultAddress,
}: {
  addresses: SavedAddress[];
  subtotal: number;
  defaultMethod: ShippingMethod;
  defaultAddress?: ShippingAddress;
}) {
  const [state, formAction, isPending] = useActionState(saveShippingAction, initialState);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt((n) => n + 1);
  }, [state]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? "new"
  );
  const [method, setMethod] = useState<ShippingMethod>(defaultMethod);
  const showNewAddressForm = selectedAddressId === "new";

  return (
    <form key={attempt} action={formAction} className="mt-8 flex max-w-lg flex-col gap-8">
      {addresses.length > 0 && (
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Zapisane adresy
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer items-start gap-3 border p-3 ${
                  selectedAddressId === address.id ? "border-signal" : "border-stone-800"
                }`}
              >
                <input
                  type="radio"
                  name="savedAddressId"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="mt-1 accent-signal"
                />
                <span className="text-sm text-stone-200">
                  <span className="block font-bold uppercase text-stone-100">
                    {address.recipient_name}
                  </span>
                  {address.street}, {address.postal_code} {address.city}
                </span>
              </label>
            ))}
            <label
              className={`flex cursor-pointer items-center gap-3 border p-3 ${
                showNewAddressForm ? "border-signal" : "border-stone-800"
              }`}
            >
              <input
                type="radio"
                name="savedAddressId"
                value=""
                checked={showNewAddressForm}
                onChange={() => setSelectedAddressId("new")}
                className="accent-signal"
              />
              <span className="text-sm uppercase text-stone-200">Inny adres</span>
            </label>
          </div>
        </div>
      )}

      {showNewAddressForm && (
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            {addresses.length > 0 ? "Nowy adres" : "Adres dostawy"}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <input
              name="recipientName"
              placeholder="Imię i nazwisko odbiorcy"
              required={showNewAddressForm}
              defaultValue={defaultAddress?.recipientName}
              className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
            />
            <input
              name="street"
              placeholder="Ulica i numer"
              required={showNewAddressForm}
              defaultValue={defaultAddress?.street}
              className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="postalCode"
                placeholder="Kod pocztowy"
                required={showNewAddressForm}
                defaultValue={defaultAddress?.postalCode}
                className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
              />
              <input
                name="city"
                placeholder="Miasto"
                required={showNewAddressForm}
                defaultValue={defaultAddress?.city}
                className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
              />
            </div>
            <input
              name="phone"
              placeholder="Telefon"
              required={showNewAddressForm}
              defaultValue={defaultAddress?.phone}
              className="border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 placeholder:text-stone-500 focus:border-signal focus:outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Metoda dostawy
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((key) => {
            const cost = getShippingCost(key, subtotal);
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center justify-between border p-3 ${
                  method === key ? "border-signal" : "border-stone-800"
                }`}
              >
                <span className="flex items-center gap-3 text-sm text-stone-200">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={key}
                    checked={method === key}
                    onChange={() => setMethod(key)}
                    className="accent-signal"
                  />
                  {SHIPPING_METHODS[key].label}
                </span>
                <span className="font-mono text-sm text-stone-100">
                  {cost === 0 ? "Gratis" : formatPrice(cost)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit bg-signal px-8 py-3.5 font-display text-lg font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
      >
        {isPending ? "Zapisywanie…" : "Dalej: podsumowanie"}
      </button>
    </form>
  );
}
