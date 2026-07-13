import Link from "next/link";

import { formatPaise, type Product } from "@/lib/api";

export interface CardMeta {
  tagline: string;
  badge: string;
  badgeClass: string; // e.g. "bg-jamred text-cream"
}

export default function ProductCard({
  product,
  meta,
}: {
  product: Product;
  meta?: CardMeta;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-maroon/10 bg-cream-light shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-maroon-dark/10"
    >
      <div className="relative flex h-[250px] items-center justify-center bg-white p-5">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-4xl text-marigold">Jam Up</span>
        )}
        {meta && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.badgeClass}`}
          >
            {meta.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-[18px] pb-[18px] pt-4">
        <h3 className="font-display text-[19px] font-bold leading-tight">
          {product.name}
        </h3>
        {meta && (
          <p className="text-[13px] leading-snug text-maroon/70">{meta.tagline}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="flex items-baseline gap-1.5">
            <span className="text-[19px] font-extrabold">
              {formatPaise(product.price_paise)}
            </span>
            <span className="text-xs text-maroon/55">{product.weight_grams}g</span>
          </span>
          <span className="rounded-full bg-marigold px-4 py-2 text-[13px] font-bold text-maroon-dark transition group-hover:bg-jamred group-hover:text-cream">
            Add +
          </span>
        </div>
      </div>
    </Link>
  );
}
