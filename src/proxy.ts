import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16: plik nazywa się "proxy.ts" (dawniej "middleware.ts").
// To jest OPTYMISTYCZNA, szybka kontrola przy każdym żądaniu — sprawdza
// tylko czy jest ważna sesja i (dla /admin) jaka rola. Prawdziwe, pełne
// zabezpieczenie danych i tak leży w regułach RLS w bazie danych.
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAccountRoute = path.startsWith("/konto");
  const isAdminRoute = path.startsWith("/admin");
  const isAuthRoute = path === "/logowanie" || path === "/rejestracja";

  if ((isAccountRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/logowanie";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/konto", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/konto/:path*", "/admin/:path*", "/logowanie", "/rejestracja"],
};
