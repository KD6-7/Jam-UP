"use client";

import { useEffect, useState } from "react";

import Drip from "@/components/Drip";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import { categoryOf, fetchProducts, type Category, type Product } from "@/lib/api";
import { CARD_META } from "@/lib/catalogMeta";

const VALUES = [
  "Real fruit pulp",
  "Fortified with chia",
  "Sulphur-less sugar",
  "Zero additives",
];

const HERO_JARS: { slug: string; img: string; tilt: string; delay: string }[] = [
  { slug: "mango-chilli-jam", img: "/products/mango-chilli-jam.jpg", tilt: "-6deg", delay: "0.15s" },
  { slug: "guava-chilli-jam", img: "/products/guava-chilli-jam.jpg", tilt: "4deg", delay: "0.3s" },
  { slug: "fig-chia-jam", img: "/products/fig-chia-jam.jpg", tilt: "-3deg", delay: "0.45s" },
];

const SECTIONS: {
  category: Category;
  anchor: string;
  kicker: string;
  heading: string;
  blurb: string;
  accentClass: string;
  bandClass: string;
  tilt: string;
}[] = [
  {
    category: "Fusion Jam",
    anchor: "fusion",
    kicker: "Bold & spicy",
    heading: "Fusion Jams",
    blurb:
      "Mango-chilli, guava-chilli and other pairings that shouldn't work — but absolutely do.",
    accentClass: "text-jamred",
    bandClass: "",
    tilt: "-rotate-2",
  },
  {
    category: "Chia Jam",
    anchor: "chia",
    kicker: "Everyday wellness",
    heading: "Chia Jams",
    blurb: "Classic fruit jams fortified with superfood chia seeds. Breakfast, upgraded.",
    accentClass: "text-marigold",
    bandClass: "bg-cream-light",
    tilt: "rotate-2",
  },
  {
    category: "Jam Slices",
    anchor: "slices",
    kicker: "Peel · Place · Eat",
    heading: "Jam Slices",
    blurb:
      "Individually wrapped squares that fit right between two slices of bread. Mess-free, tiffin-ready.",
    accentClass: "text-jamred",
    bandClass: "",
    tilt: "-rotate-1",
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
      {/* Hero: the tagline, said big, with the shelf settling in */}
      <section className="bg-maroon text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-8 pt-14 md:grid-cols-[1.2fr_1fr] md:pb-12 md:pt-20">
          <div>
            <h1 className="font-display text-[44px] leading-[1.04] md:text-6xl">
              <span className="block animate-rise-in">where every bite</span>
              <span className="block animate-rise-in text-marigold [animation-delay:0.12s]">
                is a delight.
              </span>
            </h1>
            <p className="mt-5 max-w-md animate-rise-in text-[15px] leading-relaxed text-cream/90 [animation-delay:0.24s]">
              Fusion jams with real fruit pulp, chia-fortified classics and
              mess-free jam slices — uniquely Indian in soul.
            </p>
            <a
              href="#fusion"
              className="mt-7 inline-block min-h-11 animate-rise-in rounded-full bg-marigold px-8 py-3 font-bold text-maroon-dark transition [animation-delay:0.36s] hover:bg-cream"
            >
              Shop the shelf
            </a>
          </div>

          <div className="hidden items-end justify-center gap-4 md:flex">
            {HERO_JARS.map((jar) => (
              <div
                key={jar.slug}
                className="animate-settle-in rounded-xl bg-white p-2 shadow-lg shadow-black/25"
                style={{ animationDelay: jar.delay, "--settle-tilt": jar.tilt } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={jar.img} alt="" className="h-36 w-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Drip className="-mt-px text-maroon" />

      {/* Value line */}
      <section className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 pb-2 pt-6 text-[13px] font-bold text-maroon">
        {VALUES.map((title) => (
          <span key={title} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-jamred" />
            {title}
          </span>
        ))}
      </section>

      {/* Shelves */}
      {error && (
        <p className="mx-auto max-w-6xl px-6 py-10">
          <span className="block rounded-lg bg-jamred/10 p-4 text-jamred">
            Couldn&apos;t load the shelf: {error}. Refresh to try again.
          </span>
        </p>
      )}

      {SECTIONS.map((section) => {
        const items = products?.filter((p) => categoryOf(p) === section.category);
        if (items && items.length === 0) return null;
        return (
          <section
            key={section.anchor}
            id={section.anchor}
            className={`[scroll-margin-top:80px] ${section.bandClass}`}
          >
            <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[260px_1fr] md:gap-12">
              <div className="md:pt-2">
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${section.accentClass}`}>
                  {section.kicker}
                </p>
                <h2 className="mt-2 font-display text-4xl leading-[1.05]">
                  {section.heading}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-maroon/80">
                  {section.blurb}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items
                  ? items.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        meta={CARD_META[p.slug]}
                        tilt={section.tilt}
                      />
                    ))
                  : [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* Peel Place Eat */}
      <section className="mt-6 bg-marigold text-maroon-dark">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <h2 className="font-display text-4xl md:text-5xl">
            Peel <span className="text-jamred">·</span> Place{" "}
            <span className="text-jamred">·</span> Eat
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed">
            First-of-their-kind Jam Slices: individually wrapped squares that
            fit right between two slices of bread. School tiffins, travel, zero
            mess.
          </p>
          <a
            href="#slices"
            className="mt-7 inline-block min-h-11 rounded-full bg-maroon px-8 py-3 font-bold text-cream transition hover:bg-maroon-dark"
          >
            Try the slices
          </a>
        </div>
      </section>
      <Drip className="-mt-px bg-maroon-dark text-marigold" />
    </main>
  );
}
