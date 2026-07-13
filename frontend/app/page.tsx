"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/api";

const VALUES = [
  { icon: "🍓", title: "Real fruit pulp", text: "Every jar starts with actual fruit, not flavouring." },
  { icon: "🌱", title: "Fortified with chia", text: "Superfood chia seeds for everyday wellness." },
  { icon: "🍯", title: "Sulphur-less sugar", text: "Sweetened the cleaner, unbleached way." },
  { icon: "🚫", title: "Zero additives", text: "No artificial colours, flavours or preservatives." },
];

export default function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-maroon text-cream">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Jam Up — where every bite is a delight"
            className="h-40 w-40 rounded-full shadow-lg md:h-52 md:w-52"
          />
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Wellness in a Jar
          </h1>
          <p className="max-w-2xl text-cream/85 md:text-lg">
            Premium fusion jams crafted with real fruit pulp, fortified with
            chia seeds, sweetened with sulphur-less sugar — and absolutely zero
            artificial additives. Uniquely Indian in soul, globally appealing
            in execution.
          </p>
          <a
            href="#products"
            className="rounded-full bg-marigold px-8 py-3 font-semibold text-maroon-dark transition hover:bg-jamred hover:text-cream"
          >
            Explore our jams
          </a>
        </div>
      </section>

      {/* Value strip */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="text-center">
              <div className="text-3xl">{v.icon}</div>
              <h2 className="mt-2 font-display font-semibold">{v.title}</h2>
              <p className="mt-1 text-sm text-maroon/70">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-5xl scroll-mt-8 px-4 py-8">
        <h2 className="font-display text-3xl font-bold">Our Jams</h2>
        <p className="mt-1 text-maroon/70">
          Fusion jars, chia-fortified classics and mess-free jam slices.
        </p>

        {error && (
          <p className="mt-8 rounded-lg bg-jamred/10 p-4 text-jamred">
            Failed to load products: {error}
          </p>
        )}
        {!error && products === null && (
          <p className="mt-8 animate-pulse text-maroon/70">
            Waking up the jam kitchen… this can take up to a minute on the
            first visit.
          </p>
        )}

        {products && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Jam Slices callout */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-marigold/15 p-8 text-center md:p-12">
          <h2 className="font-display text-3xl font-bold">
            Peel · Place · Eat
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-maroon/80">
            Our first-of-its-kind Jam Slices are individually wrapped squares
            that fit right between two slices of bread — a mess-free jam
            sandwich for school tiffins, travel and on-the-go snacking.
          </p>
        </div>
      </section>
    </main>
  );
}
