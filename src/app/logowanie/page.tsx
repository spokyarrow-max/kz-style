import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage(props: PageProps<"/logowanie">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === "string" ? searchParams.next : "/konto";

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-4xl font-black uppercase text-stone-100">Logowanie</h1>
        <p className="mt-2 text-stone-400">Wróć do swoich zamówień i ulubionych.</p>

        <LoginForm next={next} />

        <p className="mt-6 text-center font-mono text-sm text-stone-400">
          Nie masz konta?{" "}
          <Link href="/rejestracja" className="text-signal hover:text-stone-100">
            Załóż je
          </Link>
        </p>
      </div>
    </main>
  );
}
