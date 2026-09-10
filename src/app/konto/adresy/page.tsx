import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddressList } from "@/components/address-list";
import { AddressForm } from "@/components/address-form";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, label, recipient_name, street, city, postal_code, phone, is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Adresy dostawy
      </p>
      <AddressList addresses={addresses ?? []} />
      <AddressForm />
    </div>
  );
}
