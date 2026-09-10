import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Moje dane</p>
      <ProfileForm
        firstName={user.firstName ?? ""}
        lastName={user.lastName ?? ""}
        email={user.email ?? ""}
      />
    </div>
  );
}
