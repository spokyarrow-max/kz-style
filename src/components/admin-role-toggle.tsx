"use client";

import { useTransition } from "react";
import { toggleAdminRoleAction } from "@/app/actions/admin";

export function AdminRoleToggle({
  userId,
  isAdmin,
  isSelf,
}: {
  userId: string;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="font-mono text-xs text-stone-600">(Ty)</span>;
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleAdminRoleAction(userId, !isAdmin))}
      className="font-mono text-xs uppercase text-stone-400 hover:text-signal disabled:opacity-50"
    >
      {isAdmin ? "Odbierz admina" : "Nadaj admina"}
    </button>
  );
}
