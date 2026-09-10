export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}
