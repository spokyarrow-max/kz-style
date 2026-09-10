"use client";

import { useTransition } from "react";
import { deleteAddressAction, setDefaultAddressAction } from "@/app/actions/account";

export interface AddressItem {
  id: string;
  label: string | null;
  recipient_name: string;
  street: string;
  city: string;
  postal_code: string;
  phone: string | null;
  is_default: boolean;
}

export function AddressList({ addresses }: { addresses: AddressItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (addresses.length === 0) {
    return <p className="mt-6 text-stone-400">Nie masz jeszcze zapisanych adresów.</p>;
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`border p-4 transition-opacity ${
            address.is_default ? "border-signal" : "border-stone-800"
          } ${isPending ? "opacity-50" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {address.label && (
                <p className="font-mono text-xs uppercase text-stone-500">{address.label}</p>
              )}
              <p className="font-display text-lg font-bold uppercase text-stone-100">
                {address.recipient_name}
              </p>
              <p className="mt-1 text-sm text-stone-300">
                {address.street}, {address.postal_code} {address.city}
              </p>
              {address.phone && <p className="text-sm text-stone-400">{address.phone}</p>}
            </div>
            {address.is_default && (
              <span className="bg-signal px-2 py-1 font-mono text-[10px] font-bold uppercase text-signal-ink">
                Domyślny
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-4 font-mono text-xs uppercase">
            {!address.is_default && (
              <button
                type="button"
                onClick={() => startTransition(() => setDefaultAddressAction(address.id))}
                className="text-stone-400 hover:text-signal"
              >
                Ustaw jako domyślny
              </button>
            )}
            <button
              type="button"
              onClick={() => startTransition(() => deleteAddressAction(address.id))}
              className="text-stone-500 underline hover:text-signal"
            >
              Usuń
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
