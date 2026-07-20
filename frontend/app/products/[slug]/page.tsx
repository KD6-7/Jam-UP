"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [qty, setQty] = useState(1);
  const { setQuantity, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const goToSlide = (i: number) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };

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
    setQuantity(product, inCart + qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const meta = product ? CARD_META[product.slug] : undefined;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/products"
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
          <p className="mt-2 text-maroon/85">
            It may have been discontinued — the shelf has plenty more.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block min-h-11 rounded-full bg-maroon px-7 py-3 text-sm font-bold text-cream transition hover:bg-maroon-dark"
          >
            Back to the shelf
          </Link>
        </div>
      )}

      {!error && !notFound && product === null && (
        <div className="mt-10 grid animate-pulse gap-10 md:grid-cols-2">
          <div className="h-96 rounded-3xl bg-maroon/10" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-maroon/10" />
            <div className="h-10 w-3/4 rounded bg-maroon/10" />
            <div className="h-4 w-full rounded bg-maroon/10" />
            <div className="h-4 w-2/3 rounded bg-maroon/10" />
            <div className="h-12 w-52 rounded-full bg-maroon/10" />
          </div>
        </div>
      )}

      {product && (
        <div className="mt-8 grid items-start gap-10 md:grid-cols-2 md:gap-14">
          {/* Gallery: ingredient tile first, scroll/swipe to the jar itself */}
          <div className="md:sticky md:top-24">
            <div
              ref={trackRef}
              onScroll={(e) => {
                const t = e.currentTarget;
                setSlide(Math.round(t.scrollLeft / t.clientWidth));
              }}
              className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {meta?.tile && (
                <div className="w-full shrink-0 snap-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.tile}
                    alt={`${product.name} — the fruit and spices that go in`}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              )}
              <div
                className={`flex aspect-square w-full shrink-0 snap-center items-center justify-center p-8 ${
                  meta?.plate ?? "bg-cream-light"
                }`}
              >
                <div className="-rotate-2 rounded-2xl bg-white p-4 shadow-xl shadow-maroon-dark/25">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={`${product.name} jar`}
                      className="max-h-64 w-auto"
                    />
                  ) : (
                    <span className="font-display text-5xl text-marigold">jam</span>
                  )}
                </div>
              </div>
            </div>

            {meta?.tile && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToSlide(0)}
                  aria-label="Show the ingredients"
                  className={`h-2.5 rounded-full transition-all ${
                    slide === 0 ? "w-8 bg-maroon" : "w-2.5 bg-maroon/30 hover:bg-maroon/50"
                  }`}
                />
                <button
                  onClick={() => goToSlide(1)}
                  aria-label="Show the jar"
                  className={`h-2.5 rounded-full transition-all ${
                    slide === 1 ? "w-8 bg-maroon" : "w-2.5 bg-maroon/30 hover:bg-maroon/50"
                  }`}
                />
              </div>
            )}
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
              <p className="mt-2 text-[15px] italic text-maroon/85">{meta.tagline}</p>
            )}

            <p className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">
                {formatPaise(product.price_paise)}
              </span>
              <span className="text-sm font-medium text-maroon/75">
                · net wt. {product.weight_grams}g
              </span>
            </p>

            {/* Quantity + add */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border-2 border-maroon/20 p-1">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold hover:bg-maroon hover:text-cream"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-bold" aria-live="polite">
                  {qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold hover:bg-maroon hover:text-cream"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                className={`min-h-12 rounded-full px-8 py-3 font-bold transition ${
                  justAdded
                    ? "bg-maroon text-cream"
                    : "bg-marigold text-maroon-dark hover:bg-maroon hover:text-cream"
                }`}
              >
                {justAdded
                  ? "Added ✓"
                  : `Add ${qty > 1 ? `${qty} jars` : "to cart"}`}
              </button>
            </div>
            {inCart > 0 && (
              <p className="mt-3 text-sm font-semibold text-maroon/85">
                {inCart} in your cart ·{" "}
                <Link href="/cart" className="underline underline-offset-4 hover:text-jamred">
                  view cart
                </Link>
              </p>
            )}

            {/* Flavor story */}
            <div className="mt-8 space-y-4 border-t border-maroon/10 pt-7">
              {(meta?.story ?? [product.description]).map((para) => (
                <p key={para.slice(0, 24)} className="max-w-prose leading-relaxed text-maroon/90">
                  {para}
                </p>
              ))}
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
