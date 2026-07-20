"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/story", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l1.2 13a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

export default function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-maroon/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Jam Up logo"
            className="h-11 w-11 rounded-full object-cover"
          />
          <span className="flex flex-col">
            <span className="font-display text-[22px] leading-none tracking-tight">
              jam up
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-maroon/75 sm:block">
              where every bite is a delight
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden px-2 py-2.5 text-sm font-semibold text-maroon hover:text-jamred md:block"
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={signOut}
              className="hidden px-2 py-2.5 text-sm font-semibold text-maroon/75 hover:text-jamred md:block"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden px-2 py-2.5 text-sm font-semibold text-maroon hover:text-jamred md:block"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-maroon transition hover:bg-maroon hover:text-cream"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-jamred px-1 text-[11px] font-bold text-cream">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full md:hidden"
          >
            <span className={`h-0.5 w-5 rounded bg-maroon transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 rounded bg-maroon transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 rounded bg-maroon transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-maroon/10 bg-cream px-6 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-display text-xl text-maroon"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-maroon/10 pt-3">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="py-3 text-sm font-semibold text-maroon/75"
              >
                Sign out ({user.name ?? user.email})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-3 text-sm font-semibold text-maroon"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
