"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { categoryOf, fetchProduct, formatPaise, type Product } from "@/lib/api";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchProduct(slug)
      .then((p) => (p ? setProduct(p) : setNotFound(true)))
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, [slug]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/#products" className="text-sm font-medium text-jamred hover:underline">
        ← Back to all jams
      </Link>

      {error && (
        <p className="mt-8 rounded-lg bg-jamred/10 p-4 text-jamred">
          Failed to load product: {error}
        </p>
      )}

      {notFound && (
        <div className="mt-16 text-center">
          <h1 className="font-display text-3xl font-bold">Jar not found</h1>
          <p className="mt-2 text-maroon/70">
            We couldn&apos;t find that product — it may have been discontinued.
          </p>
        </div>
      )}

      {!error && !notFound && product === null && (
        <p className="mt-8 animate-pulse text-maroon/70">
          Waking up the jam kitchen… this can take up to a minute on the first
          visit.
        </p>
      )}

      {product && (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="flex items-center justify-center rounded-3xl bg-white p-8">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-96 w-auto object-contain"
              />
            ) : (
              <span className="font-display text-6xl text-marigold">🍯</span>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-jamred/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-jamred">
              {categoryOf(product)}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-maroon/60">
              Net wt. {product.weight_grams}g
            </p>
            <p className="mt-4 text-2xl font-bold">
              {formatPaise(product.price_paise)}
            </p>
            <p className="mt-6 leading-relaxed text-maroon/85">
              {product.description}
            </p>
            <ul className="mt-6 space-y-1 text-sm text-maroon/70">
              <li>✓ Real fruit pulp</li>
              <li>✓ Sulphur-less sugar</li>
              <li>✓ No artificial colours, flavours or preservatives</li>
              <li>✓ 12-month shelf life</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
