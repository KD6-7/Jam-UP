import type { Metadata } from "next";
import { Young_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import Header from "@/components/Header";
import Providers from "@/components/Providers";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
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
    <html lang="en" className={`${youngSerif.variable} scroll-smooth`}>
      <body className="bg-cream text-maroon-dark antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>

        <footer className="bg-maroon-dark text-cream">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-9">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Jam Up logo"
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <p className="font-display text-lg">jam up — where every bite is a delight</p>
                <p className="mt-0.5 text-[13px] text-cream/70">
                  Made in India · Real fruit pulp · Sulphur-less sugar · Zero artificial additives
                </p>
              </div>
            </div>
            <nav className="flex gap-5 text-[13px] font-semibold">
              <Link href="/#fusion" className="text-cream/85 hover:text-marigold">Fusion</Link>
              <Link href="/#chia" className="text-cream/85 hover:text-marigold">Chia</Link>
              <Link href="/#slices" className="text-cream/85 hover:text-marigold">Slices</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
