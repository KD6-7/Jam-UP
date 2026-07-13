"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import { categoryOf, fetchProducts, type Category, type Product } from "@/lib/api";
import { CARD_META } from "@/lib/catalogMeta";

const VALUES = [
  "Real fruit pulp",
  "Fortified with chia",
  "Sulphur-less sugar",
  "Zero additives",
];

const SECTIONS: {
  category: Category;
  anchor: string;
  kicker: string;
  heading: string;
  blurb: string;
  headerClass: string;
}[] = [
  {
    category: "Fusion Jam",
    anchor: "fusion",
    kicker: "Bold & spicy",
    heading: "Fusion Jams",
    blurb:
      "Mango-chilli, guava-chilli and other pairings that shouldn't work — but absolutely do.",
    headerClass: "bg-jamred text-cream",
  },
  {
    category: "Chia Jam",
    anchor: "chia",
    kicker: "Everyday wellness",
    heading: "Chia Jams",
    blurb: "Classic fruit jams fortified with superfood chia seeds. Breakfast, upgraded.",
    headerClass: "bg-marigold text-maroon-dark",
  },
  {
    category: "Jam Slices",
    anchor: "slices",
    kicker: "Peel · Place · Eat",
    heading: "Jam Slices",
    blurb:
      "Individually wrapped squares that fit right between two slices of bread. Mess-free, tiffin-ready.",
    headerClass: "bg-maroon text-cream",
  },
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
      {/* Slim brand banner */}
      <section className="bg-maroon text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-10 px-6 py-9">
          <div className="flex max-w-2xl flex-col gap-2.5">
            <h1 className="font-display text-4xl font-black leading-[1.08]">
              Wellness in a jar.
              <br />
              <span className="text-marigold">Mischief on your toast.</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-cream/85">
              Fusion jams with real fruit pulp, chia-fortified classics and
              mess-free jam slices — uniquely Indian in soul.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Jam Up — where every bite is a delight"
            className="hidden h-32 w-32 shrink-0 rotate-6 rounded-full shadow-lg md:block"
          />
        </div>
      </section>

      {/* Value pills strip */}
      <section className="bg-marigold text-maroon-dark">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-2 px-6 py-2.5 text-[13px] font-bold">
          {VALUES.map((title) => (
            <span key={title} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-maroon-dark" />
              {title}
            </span>
          ))}
        </div>
      </section>

      {/* Product sections */}
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-2 pt-10">
        {error && (
          <p className="rounded-lg bg-jamred/10 p-4 text-jamred">
            Failed to load products: {error}
          </p>
        )}
        {!error && products === null && (
          <p className="animate-pulse text-maroon/70">
            Waking up the jam kitchen… this can take up to a minute on the
            first visit.
          </p>
        )}

        {products &&
          SECTIONS.map((section) => {
            const items = products.filter((p) => categoryOf(p) === section.category);
            if (items.length === 0) return null;
            return (
              <section
                key={section.anchor}
                id={section.anchor}
                className="[scroll-margin-top:88px]"
              >
                <div
                  className={`flex items-center justify-between gap-6 rounded-[20px] px-8 py-7 ${section.headerClass}`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] opacity-85">
                      {section.kicker}
                    </span>
                    <h2 className="font-display text-[34px] font-black leading-[1.05]">
                      {section.heading}
                    </h2>
                    <p className="mt-0.5 max-w-xl text-sm leading-normal opacity-90">
                      {section.blurb}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} meta={CARD_META[p.slug]} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>

      {/* Peel Place Eat ribbon */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] border-2 border-dashed border-maroon/35 px-8 py-7">
          <div>
            <h2 className="font-display text-[26px] font-black">Peel · Place · Eat</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-maroon/75">
              First-of-their-kind Jam Slices: individually wrapped squares that
              fit right between two slices of bread. School tiffins, travel,
              zero mess.
            </p>
          </div>
          <a
            href="#slices"
            className="shrink-0 rounded-full bg-jamred px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-maroon"
          >
            Try the slices
          </a>
        </div>
      </section>
    </main>
  );
}
