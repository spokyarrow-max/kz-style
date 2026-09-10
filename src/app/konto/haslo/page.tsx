import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Zmiana hasła</p>
      <ChangePasswordForm />
    </div>
  );
}
