"use client";

import Link from "next/link";

import { formatPaise } from "@/lib/api";
import { GoogleSignInButton, useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { user } = useAuth();
  const { items, subtotalPaise, ready, syncError, setQuantity } = useCart();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-4xl">Your cart</h1>

      {syncError && (
        <p className="mt-4 rounded-lg bg-jamred/10 p-3 text-sm text-jamred">{syncError}</p>
      )}

      {!ready && (
        <ul className="mt-8 animate-pulse space-y-4">
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl bg-maroon/10" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/2 rounded bg-maroon/10" />
                <div className="h-4 w-1/3 rounded bg-maroon/10" />
              </div>
              <div className="h-11 w-32 rounded-full bg-maroon/10" />
            </li>
          ))}
        </ul>
      )}

      {ready && items.length === 0 && (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-maroon/35 p-10 text-center">
          <p className="font-display text-xl">Nothing in here yet.</p>
          <p className="mt-2 text-sm text-maroon/80">
            Your toast deserves better — go pick a jar.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block min-h-11 rounded-full bg-marigold px-7 py-3 text-sm font-bold text-maroon-dark transition hover:bg-maroon hover:text-cream"
          >
            Browse the shelf
          </Link>
        </div>
      )}

      {ready && items.length > 0 && (
        <>
          <ul className="mt-8 divide-y divide-maroon/10">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex h-20 w-20 shrink-0 -rotate-2 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm"
                >
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-display text-marigold">jam</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-display text-lg leading-tight hover:text-jamred"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-maroon/75">
                    {formatPaise(product.price_paise)} · {product.weight_grams}g
                  </p>
                  <button
                    onClick={() => setQuantity(product, 0)}
                    className="mt-1 py-1 text-xs font-semibold text-maroon/75 underline hover:text-jamred"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    onClick={() => setQuantity(product, quantity - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-maroon/25 text-lg font-bold hover:bg-maroon hover:text-cream"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    onClick={() => setQuantity(product, quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-maroon/25 text-lg font-bold hover:bg-maroon hover:text-cream"
                  >
                    +
                  </button>
                </div>
                <span className="w-24 text-right font-display text-lg">
                  {formatPaise(product.price_paise * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-cream-light px-6 py-5">
            <span className="font-display text-xl">Subtotal</span>
            <span className="font-display text-2xl">{formatPaise(subtotalPaise)}</span>
          </div>

          <div className="mt-5 text-right">
            <Link
              href="/checkout"
              className="inline-block min-h-12 rounded-full bg-marigold px-9 py-3.5 font-bold text-maroon-dark transition hover:bg-maroon hover:text-cream"
            >
              Checkout
            </Link>
          </div>
        </>
      )}

      {ready && !user && (
        <div className="mt-10 rounded-2xl bg-marigold/15 p-6">
          <h2 className="font-display text-xl">Keep this cart</h2>
          <p className="mt-1 text-sm text-maroon/85">
            Sign in with Google and your cart follows you to any device.
          </p>
          <div className="mt-4">
            <GoogleSignInButton />
          </div>
        </div>
      )}
    </main>
  );
}
