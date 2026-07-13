import type { Metadata } from "next";
import { Young_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
        <header className="sticky top-0 z-50 border-b border-maroon/10 bg-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Jam Up logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="flex flex-col">
                <span className="font-display text-[22px] font-bold leading-none tracking-tight">
                  jam up
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-jamred">
                  where every bite is a delight
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/#fusion" className="hidden text-sm font-semibold text-maroon hover:text-jamred sm:block">
                Fusion
              </Link>
              <Link href="/#chia" className="hidden text-sm font-semibold text-maroon hover:text-jamred sm:block">
                Chia
              </Link>
              <Link href="/#slices" className="hidden text-sm font-semibold text-maroon hover:text-jamred sm:block">
                Slices
              </Link>
              <Link
                href="/#fusion"
                className="rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-cream transition hover:bg-jamred"
              >
                Shop jams
              </Link>
            </nav>
          </div>
        </header>

        {children}

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
