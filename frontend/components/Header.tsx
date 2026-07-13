"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();

  return (
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
        <nav className="flex items-center gap-5">
          <Link href="/#fusion" className="hidden text-sm font-semibold text-maroon hover:text-jamred md:block">
            Fusion
          </Link>
          <Link href="/#chia" className="hidden text-sm font-semibold text-maroon hover:text-jamred md:block">
            Chia
          </Link>
          <Link href="/#slices" className="hidden text-sm font-semibold text-maroon hover:text-jamred md:block">
            Slices
          </Link>

          <Link
            href="/cart"
            className="relative rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-cream transition hover:bg-jamred"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-marigold px-1 text-[11px] font-bold text-maroon-dark">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <span className="flex items-center gap-2">
              {user.picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture_url}
                  alt={user.name ?? user.email}
                  title={user.name ?? user.email}
                  className="h-8 w-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold text-sm font-bold text-maroon-dark">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <button
                onClick={signOut}
                className="text-sm font-semibold text-maroon/70 hover:text-jamred"
              >
                Sign out
              </button>
            </span>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-maroon hover:text-jamred">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
