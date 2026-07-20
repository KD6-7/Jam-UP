import type { Metadata } from "next";
import { Hanken_Grotesk, Young_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import Header from "@/components/Header";
import Providers from "@/components/Providers";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Jam Up — Where Every Bite Is a Delight",
  description:
    "Premium fusion jams fortified with chia seeds — real fruit pulp, sulphur-less sugar, zero artificial additives. Made in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${hanken.variable} scroll-smooth`}>
      <body className="bg-cream font-sans text-maroon-dark antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>

        <footer className="bg-maroon-dark text-cream">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="font-display text-3xl lowercase tracking-tight md:text-4xl">
              jam up<span className="text-marigold">.</span>
            </p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-md text-sm leading-relaxed text-cream/80">
                Where every bite is a delight. Made in India with real fruit
                pulp, sulphur-less sugar and zero artificial additives.
              </p>
              <nav className="flex gap-6 text-sm font-semibold">
                <Link href="/#fusion" className="text-cream/90 hover:text-marigold">Fusion</Link>
                <Link href="/#chia" className="text-cream/90 hover:text-marigold">Chia</Link>
                <Link href="/#slices" className="text-cream/90 hover:text-marigold">Slices</Link>
                <Link href="/cart" className="text-cream/90 hover:text-marigold">Cart</Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
