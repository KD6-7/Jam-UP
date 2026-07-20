"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/#fusion", label: "Fusion" },
  { href: "/#chia", label: "Chia" },
  { href: "/#slices", label: "Slices" },
];

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
            <span className="font-display text-[22px] font-bold leading-none tracking-tight">
              jam up
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-maroon/75 sm:block">
              where every bite is a delight
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden px-1 py-2.5 text-sm font-semibold text-maroon hover:text-jamred md:block"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className="relative rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-dark"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-marigold px-1.5 text-xs font-bold text-maroon-dark">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <span className="hidden items-center gap-2 md:flex">
              {user.picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture_url}
                  alt={user.name ?? user.email}
                  title={user.name ?? user.email}
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold text-sm font-bold text-maroon-dark">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <button
                onClick={signOut}
                className="px-1 py-2.5 text-sm font-semibold text-maroon/75 hover:text-jamred"
              >
                Sign out
              </button>
            </span>
          ) : (
            <Link
              href="/login"
              className="hidden px-1 py-2.5 text-sm font-semibold text-maroon hover:text-jamred md:block"
            >
              Sign in
            </Link>
          )}

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
