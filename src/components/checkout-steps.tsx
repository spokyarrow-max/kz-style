import Link from "next/link";

const STEPS = [
  { href: "/checkout/dane", label: "Dane" },
  { href: "/checkout/dostawa", label: "Dostawa" },
  { href: "/checkout", label: "Podsumowanie" },
  { href: "/checkout/platnosc", label: "Płatność" },
];

export function CheckoutSteps({ current }: { current: string }) {
  return (
    <nav className="flex gap-6 border-b border-stone-800 pb-6 font-mono text-xs uppercase tracking-wide">
      {STEPS.map((step, i) => {
        const isActive = step.href === current;
        return (
          <Link
            key={step.href}
            href={step.href}
            className={isActive ? "text-signal" : "text-stone-500 hover:text-stone-200"}
          >
            {i + 1}. {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
