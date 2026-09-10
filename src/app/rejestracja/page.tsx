"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  // React czyści niekontrolowane pola po każdym wywołaniu akcji — licznik
  // prób wymusza ponowne "zamontowanie" formularza z przywróconymi danymi.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt((n) => n + 1);
  }, [state]);

  if (state.needsConfirmation) {
    return (
      <main className="flex-1 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-black uppercase text-stone-100">
            Sprawdź skrzynkę e-mail
          </h1>
          <p className="mt-4 text-stone-400">
            Wysłaliśmy link potwierdzający na podany adres. Kliknij go, żeby
            aktywować konto, a potem się zaloguj.
          </p>
          <Link
            href="/logowanie"
            className="mt-8 inline-block bg-signal px-6 py-3 font-display text-sm font-bold uppercase text-signal-ink hover:bg-stone-100"
          >
            Przejdź do logowania
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-4xl font-black uppercase text-stone-100">
          Załóż konto
        </h1>
        <p className="mt-2 text-stone-400">
          Szybszy checkout, historia zamówień i lista ulubionych.
        </p>

        <form key={attempt} action={formAction} className="mt-8 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="font-mono text-xs uppercase text-stone-400">
                Imię
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                defaultValue={state.values?.firstName}
                className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="font-mono text-xs uppercase text-stone-400">
                Nazwisko
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                defaultValue={state.values?.lastName}
                className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="font-mono text-xs uppercase text-stone-400">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={state.values?.email}
              className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="font-mono text-xs uppercase text-stone-400">
              Hasło (min. 8 znaków)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full border border-stone-700 bg-stone-900 px-3 py-2.5 text-stone-100 focus:border-signal focus:outline-none"
            />
          </div>

          {state.error && <p className="font-mono text-sm text-signal">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 bg-signal px-6 py-3.5 font-display text-lg font-bold uppercase text-signal-ink hover:bg-stone-100 disabled:opacity-60"
          >
            {isPending ? "Zakładanie konta…" : "Załóż konto"}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-sm text-stone-400">
          Masz już konto?{" "}
          <Link href="/logowanie" className="text-signal hover:text-stone-100">
            Zaloguj się
          </Link>
        </p>
      </div>
    </main>
  );
}
