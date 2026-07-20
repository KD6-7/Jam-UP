"use client";

import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import { categoryOf, fetchProducts, type Category, type Product } from "@/lib/api";
import { CARD_META, CATEGORY_PLATES } from "@/lib/catalogMeta";

const RIBBON: { category: Category; anchor: string; label: string; blurb: string }[] = [
  { category: "Fusion Jam", anchor: "fusion", label: "Fusion Jams", blurb: "Bold, spicy fruit pairings" },
  { category: "Chia Jam", anchor: "chia", label: "Chia Jams", blurb: "Classics with a superfood boost" },
  { category: "Jam Slices", anchor: "slices", label: "Jam Slices", blurb: "Peel · place · eat" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const meta = CARD_META[p.slug];
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        categoryOf(p).toLowerCase().includes(q) ||
        (meta?.tagline.toLowerCase().includes(q) ?? false)
      );
    });
  }, [products, query]);

  return (
    <main>
      {/* Ribbon: category banner, sticky under the header */}
      <nav
        aria-label="Product categories"
        className="sticky top-[62px] z-40 border-b border-maroon/10 bg-cream/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl items-stretch gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          {RIBBON.map((r) => (
            <a
              key={r.anchor}
              href={`#${r.anchor}`}
              className={`flex min-w-40 flex-1 flex-col justify-center rounded-xl px-4 py-2.5 text-cream transition hover:opacity-90 ${CATEGORY_PLATES[r.category]}`}
            >
              <span className="font-display text-lg leading-tight">{r.label}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cream/90">
                {r.blurb}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* Search */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <h1 className="text-center font-display text-4xl md:text-5xl">The whole shelf</h1>
        <div className="mx-auto mt-6 max-w-xl">
          <label htmlFor="shelf-search" className="sr-only">
            Search the shelf
          </label>
          <input
            id="shelf-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — mango, chia, spicy, slices…"
            className="w-full rounded-full border-2 border-maroon/20 bg-white px-6 py-3.5 text-[15px] outline-none placeholder:text-maroon/50 focus:border-maroon"
          />
        </div>
      </div>

      {error && (
        <p className="mx-auto max-w-6xl px-6 py-10">
          <span className="block rounded-lg bg-jamred/10 p-4 text-jamred">
            Couldn&apos;t load the shelf: {error}. Refresh to try again.
          </span>
        </p>
      )}

      {!error && filtered === null && (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {filtered && query.trim() !== "" && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-maroon/35 p-10 text-center">
              <p className="font-display text-xl">No jars match “{query}”.</p>
              <p className="mt-2 text-sm text-maroon/80">
                Try a fruit (mango, fig, guava), a mood (spicy, wellness) or a
                format (slices).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} meta={CARD_META[p.slug]} />
              ))}
            </div>
          )}
        </section>
      )}

      {filtered && query.trim() === "" &&
        RIBBON.map((r) => {
          const items = filtered.filter((p) => categoryOf(p) === r.category);
          if (items.length === 0) return null;
          return (
            <section key={r.anchor} id={r.anchor} className="[scroll-margin-top:140px]">
              <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-3xl">{r.label}</h2>
                  <span className="text-sm font-semibold text-maroon/75">
                    {items.length} products
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} meta={CARD_META[p.slug]} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
    </main>
  );
}
