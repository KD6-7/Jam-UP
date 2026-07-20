"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Drip from "@/components/Drip";
import {
  ChilliArt,
  FigArt,
  MangoArt,
  OrangeSliceArt,
  StrawberryArt,
} from "@/components/FruitArt";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import SkeletonCard from "@/components/SkeletonCard";
import { categoryOf, fetchProducts, type Category, type Product } from "@/lib/api";
import { CARD_META, CATEGORY_PLATES } from "@/lib/catalogMeta";

const CHAPTERS: {
  category: Category;
  anchor: string;
  kicker: string;
  heading: string;
  copy: string;
  link: string;
  art: React.ReactNode;
  flip: boolean;
  tilt: string;
}[] = [
  {
    category: "Fusion Jam",
    anchor: "fusion",
    kicker: "Bold & spicy",
    heading: "Pairings that shouldn't work — but absolutely do.",
    copy:
      "Mango with chilli. Guava with heat. Ginger cutting through sweetness. Our fusion jams take the flavor collisions of Indian streets and bottle them with real fruit pulp and sulphur-less sugar.",
    link: "/products#fusion",
    art: (
      <>
        <MangoArt className="h-28 w-28 animate-float [--float-tilt:-8deg]" />
        <ChilliArt className="h-24 w-24 animate-float [--float-tilt:10deg] [animation-delay:1.2s]" />
      </>
    ),
    flip: false,
    tilt: "-rotate-2",
  },
  {
    category: "Chia Jam",
    anchor: "chia",
    kicker: "Everyday wellness",
    heading: "Breakfast classics, quietly fortified.",
    copy:
      "Apple-cinnamon, fig, mango — the flavors your mornings already love, folded through with chia seeds. Fibre, protein and omega-3s hitch a ride on your toast without changing how it tastes.",
    link: "/products#chia",
    art: (
      <>
        <FigArt className="h-28 w-28 animate-float [--float-tilt:6deg]" />
        <OrangeSliceArt className="h-24 w-24 animate-float [--float-tilt:-6deg] [animation-delay:0.8s]" />
      </>
    ),
    flip: true,
    tilt: "rotate-2",
  },
  {
    category: "Jam Slices",
    anchor: "slices",
    kicker: "Peel · Place · Eat",
    heading: "The jam sandwich, solved.",
    copy:
      "Individually wrapped squares of jam that fit sliced bread exactly. No jar, no knife, no mess — just peel, place and eat. First of their kind in India, made for tiffins and travel.",
    link: "/products#slices",
    art: (
      <StrawberryArt className="h-32 w-32 animate-float [--float-tilt:-5deg]" />
    ),
    flip: false,
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
      {/* Hero: full-bleed flavor gradient, editorial headline, no center CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mango via-jamred to-fig bg-[length:200%_200%] text-cream animate-gradient-drift">
        <MangoArt className="absolute right-[8%] top-12 h-24 w-24 animate-float opacity-90 [--float-tilt:-10deg] md:h-32 md:w-32" />
        <StrawberryArt className="absolute right-[28%] top-32 hidden h-20 w-20 animate-float opacity-90 [--float-tilt:8deg] [animation-delay:1.5s] md:block" />
        <ChilliArt className="absolute bottom-24 right-[14%] hidden h-24 w-24 animate-float opacity-90 [--float-tilt:14deg] [animation-delay:0.7s] md:block" />

        {/* Settle the gradient to one color at the bottom so the drip edge matches */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-jamred to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <p className="animate-rise-in text-xs font-bold uppercase tracking-[0.2em] text-cream/90">
            Made in India · Real fruit pulp
          </p>
          <h1 className="mt-4 max-w-3xl animate-rise-in font-display text-5xl leading-[1.02] [animation-delay:0.1s] md:text-7xl">
            where every bite is a{" "}
            <span className="underline decoration-wavy decoration-cream/60 underline-offset-8">
              delight
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md animate-rise-in text-[15px] leading-relaxed text-cream/95 [animation-delay:0.22s]">
            Fusion jams, chia-fortified classics and mess-free jam slices —
            keep scrolling, the shelf unpacks itself. Or head straight to{" "}
            <Link href="/products" className="font-bold underline underline-offset-4 hover:text-marigold">
              the shop
            </Link>
            .
          </p>
        </div>
      </section>
      <Drip className="-mt-px text-jamred" />

      {/* Chapters — load and reveal as you scroll */}
      {CHAPTERS.map((chapter) => {
        const items = products?.filter((p) => categoryOf(p) === chapter.category);
        return (
          <section key={chapter.anchor} id={chapter.anchor} className="[scroll-margin-top:80px]">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <Reveal>
                <div
                  className={`grid items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-14 ${
                    chapter.flip ? "md:[direction:rtl]" : ""
                  }`}
                >
                  <div
                    className={`flex min-h-52 items-center justify-center gap-6 rounded-3xl p-10 ${CATEGORY_PLATES[chapter.category]} md:[direction:ltr]`}
                  >
                    {chapter.art}
                  </div>
                  <div className="md:[direction:ltr]">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-jamred">
                      {chapter.kicker}
                    </p>
                    <h2 className="mt-2 font-display text-3xl leading-[1.08] md:text-4xl">
                      {chapter.heading}
                    </h2>
                    <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-maroon/85">
                      {chapter.copy}
                    </p>
                    <Link
                      href={chapter.link}
                      className="mt-4 inline-block py-2 text-sm font-bold text-maroon underline underline-offset-4 hover:text-jamred"
                    >
                      See every {chapter.category.toLowerCase()} →
                    </Link>
                  </div>
                </div>
              </Reveal>

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items
                  ? items.map((p, i) => (
                      <Reveal key={p.id} delay={i * 90}>
                        <ProductCard product={p} meta={CARD_META[p.slug]} tilt={chapter.tilt} />
                      </Reveal>
                    ))
                  : [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
              </div>
              {error && (
                <p className="mt-6 rounded-lg bg-jamred/10 p-4 text-jamred">
                  Couldn&apos;t load the shelf: {error}. Refresh to try again.
                </p>
              )}
            </div>
          </section>
        );
      })}

      {/* Story teaser */}
      <section className="bg-maroon text-cream">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-marigold">
              Our story
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[1.1] md:text-4xl">
              A Made-in-India movement for how families eat, one jar at a time.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cream/90">
              Health-conscious homes are walking away from sugary, chemical-laden
              spreads. Jam Up exists to give them somewhere better to land.{" "}
              <Link href="/story" className="font-bold underline underline-offset-4 hover:text-marigold">
                Read how it started
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
      <Drip className="-mt-px bg-marigold text-maroon" />

      {/* Closing band */}
      <section className="bg-marigold text-maroon-dark">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl">
              Peel <span className="text-jamred">·</span> Place{" "}
              <span className="text-jamred">·</span> Eat
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed">
              First-of-their-kind Jam Slices: individually wrapped squares that
              fit right between two slices of bread.{" "}
              <Link href="/products#slices" className="font-bold underline underline-offset-4 hover:text-jamred">
                Try the slices
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
      <Drip className="-mt-px bg-maroon-dark text-marigold" />
    </main>
  );
}
