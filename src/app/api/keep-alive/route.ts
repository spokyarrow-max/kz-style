import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase (darmowy plan) usypia projekt po 7 dniach bez żadnego zapytania.
// Vercel Cron (patrz vercel.json) odpytuje ten endpoint co jakiś czas, żeby
// baza nigdy nie zdążyła się uśpić. Zwykły, lekki odczyt — nic nie zmienia.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { error } = await supabase.from("categories").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
