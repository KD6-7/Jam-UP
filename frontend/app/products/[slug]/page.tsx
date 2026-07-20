"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { categoryOf, fetchProduct, formatPaise, type Product } from "@/lib/api";
import { CARD_META } from "@/lib/catalogMeta";
import { useCart } from "@/lib/cart";

const CHECKLIST = [
  "Real fruit pulp",
  "Sulphur-less sugar",
  "No artificial colours, flavours or preservatives",
  "12-month shelf life",
];

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { add, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = product
    ? items.find((e) => e.product.id === product.id)?.quantity ?? 0
    : 0;

  useEffect(() => {
    if (!slug) return;
    fetchProduct(slug)
      .then((p) => (p ? setProduct(p) : setNotFound(true)))
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    add(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const meta = product ? CARD_META[product.slug] : undefined;
  const backAnchor = product
    ? { "Fusion Jam": "fusion", "Chia Jam": "chia", "Jam Slices": "slices" }[categoryOf(product)]
    : "fusion";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/#${backAnchor}`}
        className="inline-block py-2 text-sm font-semibold text-maroon hover:text-jamred"
      >
        ← Back to the shelf
      </Link>

      {error && (
        <p className="mt-8 rounded-lg bg-jamred/10 p-4 text-jamred">
          Couldn&apos;t load this jar: {error}. Refresh to try again.
        </p>
      )}

      {notFound && (
        <div className="mt-16 text-center">
          <h1 className="font-display text-3xl">Jar not found</h1>
          <p className="mt-2 text-maroon/80">
            It may have been discontinued — the shelf has plenty more.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block min-h-11 rounded-full bg-maroon px-7 py-3 text-sm font-bold text-cream transition hover:bg-maroon-dark"
          >
            Back to the store
          </Link>
        </div>
      )}

      {!error && !notFound && product === null && (
        <div className="mt-10 grid animate-pulse gap-10 md:grid-cols-2">
          <div className="mx-auto h-80 w-64 -rotate-2 rounded-2xl bg-maroon/10" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-maroon/10" />
            <div className="h-10 w-3/4 rounded bg-maroon/10" />
            <div className="h-4 w-full rounded bg-maroon/10" />
            <div className="h-4 w-2/3 rounded bg-maroon/10" />
            <div className="h-12 w-44 rounded-full bg-maroon/10" />
          </div>
        </div>
      )}

      {product && (
        <div className="mt-8 grid items-center gap-10 md:mt-12 md:grid-cols-2 md:gap-14">
          <div className="flex justify-center">
            <div className="-rotate-2 rounded-2xl bg-white p-4 shadow-xl shadow-maroon-dark/15">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-72 w-auto"
                />
              ) : (
                <span className="font-display text-5xl text-marigold">jam</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-maroon/75">
              {categoryOf(product)}
              {meta && <span className="text-jamred"> · {meta.badge}</span>}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] md:text-5xl">
              {product.name}
            </h1>
            {meta && (
              <p className="mt-2 text-[15px] italic text-maroon/80">{meta.tagline}</p>
            )}

            <p className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">
                {formatPaise(product.price_paise)}
              </span>
              <span className="text-sm font-medium text-maroon/75">
                · net wt. {product.weight_grams}g
              </span>
            </p>

            <p className="mt-5 max-w-md leading-relaxed text-maroon/90">
              {product.description}
            </p>

            <div className="mt-7 flex items-center gap-4">
              <button
                onClick={handleAdd}
                className={`min-h-12 rounded-full px-9 py-3 font-bold transition ${
                  justAdded
                    ? "bg-maroon text-cream"
                    : "bg-marigold text-maroon-dark hover:bg-maroon hover:text-cream"
                }`}
              >
                {justAdded ? "Added to cart ✓" : "Add to cart"}
              </button>
              {inCart > 0 && (
                <Link href="/cart" className="text-sm font-semibold text-maroon hover:text-jamred">
                  {inCart} in cart →
                </Link>
              )}
            </div>

            <ul className="mt-8 space-y-1.5 text-sm text-maroon/85">
              {CHECKLIST.map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-jamred" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
