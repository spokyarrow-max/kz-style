"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "@/app/actions/account";

export function WishlistButton({
  productId,
  initialWishlisted,
  isLoggedIn,
  size = "sm",
}: {
  productId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "lg";
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/logowanie");
      return;
    }

    setWishlisted((prev) => !prev);
    startTransition(async () => {
      await toggleWishlistAction(productId);
    });
  }

  const dimension = size === "lg" ? 24 : 18;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      className={`flex items-center justify-center transition-colors ${
        size === "lg"
          ? "h-11 w-11 border border-stone-700 hover:border-signal"
          : "h-8 w-8 bg-stone-950/70"
      }`}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        className={wishlisted ? "text-signal" : "text-stone-200"}
      >
        <path
          d="M12 20s-7.5-4.8-10-9.3C0.4 7.5 2 4 5.6 4c2 0 3.4 1 4.4 2.4C11 5 12.4 4 14.4 4 18 4 19.6 7.5 22 10.7 19.5 15.2 12 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
