import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jam Up",
  description: "Jam Up walking skeleton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
