import Link from "next/link";

import { categoryOf, formatPaise, type Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-maroon/10 bg-cream-light shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex h-56 items-center justify-center bg-white p-4">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-4xl text-marigold">🍯</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-jamred">
          {categoryOf(product)}
        </span>
        <h3 className="font-display text-lg font-semibold leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-lg font-bold">{formatPaise(product.price_paise)}</span>
          <span className="text-xs text-maroon/60">{product.weight_grams}g</span>
        </div>
      </div>
    </Link>
  );
}
