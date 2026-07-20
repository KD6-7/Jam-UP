"use client";

import Link from "next/link";
import { useState } from "react";

import { formatPaise, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";

export interface CardMeta {
  tagline: string;
  badge: string;
  badgeClass: string; // e.g. "bg-jamred text-cream"
  /** Optional flavor-gradient classes behind the sticker */
  plate?: string;
  /** Optional 1:1 ingredient photograph shown instead of the sticker */
  tile?: string;
}

export default function ProductCard({
  product,
  meta,
  tilt = "-rotate-2",
}: {
  product: Product;
  meta?: CardMeta;
  tilt?: string;
}) {
  const { add, items } = useCart();
  const inCart = items.find((e) => e.product.id === product.id)?.quantity ?? 0;
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-maroon/10 bg-cream-light p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-maroon-dark/10"
    >
      {/* Ingredient tile when we have one; otherwise sticker photo on its flavor plate */}
      <div
        className={`relative flex h-52 items-center justify-center overflow-hidden rounded-xl ${meta?.plate ?? "bg-white"}`}
      >
        {meta?.tile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meta.tile}
            alt={`${product.name} ingredients`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-44 w-40 items-center justify-center rounded-xl bg-white p-2 shadow-md shadow-maroon-dark/20 transition duration-200 ${tilt} group-hover:rotate-0`}
          >
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-40 max-w-full object-contain"
              />
            ) : (
              <span className="font-display text-3xl text-marigold">jam</span>
            )}
          </div>
        )}
        {meta && (
          <span
            className={`absolute left-2 top-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.badgeClass}`}
          >
            {meta.badge}
          </span>
        )}
        {inCart > 0 && (
          <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-maroon px-1.5 text-xs font-bold text-cream">
            ×{inCart}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="font-display text-[19px] leading-tight">{product.name}</h3>
        {meta && (
          <p className="text-[13px] leading-snug text-maroon/75">{meta.tagline}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="flex items-baseline gap-1.5">
            <span className="text-[19px] font-extrabold">
              {formatPaise(product.price_paise)}
            </span>
            <span className="text-xs font-medium text-maroon/75">
              {product.weight_grams}g
            </span>
          </span>
          <button
            onClick={handleAdd}
            className={`min-h-11 rounded-full px-5 text-sm font-bold transition ${
              justAdded
                ? "bg-maroon text-cream"
                : "bg-marigold text-maroon-dark hover:bg-maroon hover:text-cream"
            }`}
          >
            {justAdded ? "Added ✓" : "Add +"}
          </button>
        </div>
      </div>
    </Link>
  );
}
