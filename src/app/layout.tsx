import type { Metadata } from "next";
import { Big_Shoulders, Archivo, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCartItemCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KZ Style — Polski Premium Streetwear",
    template: "%s | KZ Style",
  },
  description:
    "KZ Style — polski premium streetwear. Bluzy, kurtki, spodnie cargo i biżuteria zaprojektowane w Polsce. Projekt demonstracyjny (portfolio).",
  keywords: ["streetwear", "polski streetwear", "bluzy", "kurtki", "biżuteria uliczna", "KZ Style"],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "KZ Style",
    title: "KZ Style — Polski Premium Streetwear",
    description: "Bluzy, kurtki, spodnie cargo i biżuteria zaprojektowane w Polsce.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KZ Style — Polski Premium Streetwear",
    description: "Bluzy, kurtki, spodnie cargo i biżuteria zaprojektowane w Polsce.",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [cartCount, user] = await Promise.all([getCartItemCount(), getCurrentUser()]);

  return (
    <html
      lang="pl"
      className={`${bigShoulders.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader cartCount={cartCount} user={user} />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
