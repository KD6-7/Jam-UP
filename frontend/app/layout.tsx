import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
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
    <html lang="en" className={fraunces.variable}>
      <body className="bg-cream text-maroon-dark antialiased">
        <header className="border-b border-maroon/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Jam Up logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="font-display text-2xl font-bold lowercase tracking-tight">
                jam up
              </span>
            </Link>
            <nav>
              <Link
                href="/#products"
                className="text-sm font-medium text-maroon hover:text-jamred"
              >
                Our Jams
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-16 bg-maroon-dark text-cream">
          <div className="mx-auto max-w-5xl px-4 py-8 text-center">
            <p className="font-display text-lg">
              jam up — where every bite is a delight
            </p>
            <p className="mt-2 text-sm text-cream/70">
              Made in India · Real fruit pulp · Sulphur-less sugar · Zero
              artificial additives
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
