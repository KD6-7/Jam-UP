import Link from "next/link";

import Drip from "@/components/Drip";
import {
  ChilliArt,
  FigArt,
  MangoArt,
  OrangeSliceArt,
  StrawberryArt,
} from "@/components/FruitArt";
import Reveal from "@/components/Reveal";
import { CATEGORY_PLATES } from "@/lib/catalogMeta";

const VALUES = [
  { title: "Real fruit pulp", text: "Every jar starts with actual fruit, not flavouring." },
  { title: "Fortified with chia", text: "Superfood seeds riding along on your toast." },
  { title: "Sulphur-less sugar", text: "Sweetened the cleaner, unbleached way." },
  { title: "Zero additives", text: "No artificial colours, flavours or preservatives." },
];

const CHAPTERS: {
  plateKey: string;
  kicker: string;
  heading: string;
  copy: string;
  flavors: string[];
  art: React.ReactNode;
  image?: { src: string; alt: string };
  flip: boolean;
}[] = [
  {
    plateKey: "Fusion Jam",
    kicker: "The fusion jams",
    heading: "Pairings that shouldn't work — but absolutely do.",
    copy:
      "Mango with a slow chilli burn. Guava with street-cart heat. Ginger cutting through ripe sweetness. Our fusion range takes the flavor collisions of Indian streets and slow-cooks them into jars that are uniquely Indian in soul, globally appealing on toast.",
    flavors: ["Mango Chilli", "Mango Ginger", "Guava Chilli"],
    art: (
      <>
        <MangoArt className="h-28 w-28 animate-float [--float-tilt:-8deg]" />
        <ChilliArt className="h-24 w-24 animate-float [--float-tilt:10deg] [animation-delay:1.2s]" />
      </>
    ),
    flip: false,
  },
  {
    plateKey: "Chia Jam",
    kicker: "The chia jams",
    heading: "Breakfast classics, quietly fortified.",
    copy:
      "Apple-cinnamon, fig, mango — the flavors your mornings already love, folded through with chia seeds. Fibre, protein and omega-3s arrive uninvited and unnoticed, because wellness should taste like jam, not like homework.",
    flavors: ["Apple Cinnamon Chia", "Fig Chia", "Mango Chia"],
    art: (
      <>
        <FigArt className="h-28 w-28 animate-float [--float-tilt:6deg]" />
        <OrangeSliceArt className="h-24 w-24 animate-float [--float-tilt:-6deg] [animation-delay:0.8s]" />
      </>
    ),
    image: {
      src: "/photos/chia-plate.jpg",
      alt: "Halved figs, apple slices, cinnamon sticks and a spoon of chia-flecked jam on a wooden table",
    },
    flip: true,
  },
  {
    plateKey: "Jam Slices",
    kicker: "The jam slices",
    heading: "The jam sandwich, solved.",
    copy:
      "Individually wrapped squares of jam that fit sliced bread exactly — peel, place, eat. No jar, no knife, no mess. First of their kind in India, built for school tiffins, train windows and anywhere bread happens.",
    flavors: ["Strawberry", "Mango", "Mixed Fruit"],
    art: <StrawberryArt className="h-32 w-32 animate-float [--float-tilt:-5deg]" />,
    image: {
      src: "/photos/slices-plate.jpg",
      alt: "A square jam slice on white bread with one corner peeled up, strawberries and a lunchbox behind",
    },
    flip: false,
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero — brand first, one quiet path to the store */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mango via-jamred to-fig bg-[length:200%_200%] text-cream animate-gradient-drift">
        <MangoArt className="absolute right-[8%] top-12 h-24 w-24 animate-float opacity-90 [--float-tilt:-10deg] md:h-32 md:w-32" />
        <StrawberryArt className="absolute right-[28%] top-32 hidden h-20 w-20 animate-float opacity-90 [--float-tilt:8deg] [animation-delay:1.5s] md:block" />
        <ChilliArt className="absolute bottom-24 right-[14%] hidden h-24 w-24 animate-float opacity-90 [--float-tilt:14deg] [animation-delay:0.7s] md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-jamred to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <p className="animate-rise-in text-xs font-bold uppercase tracking-[0.2em] text-cream/90">
            Made in India · Wellness in a jar
          </p>
          <h1 className="mt-4 max-w-3xl animate-rise-in font-display text-5xl leading-[1.02] [animation-delay:0.1s] md:text-7xl">
            where every bite is a{" "}
            <span className="underline decoration-wavy decoration-cream/60 underline-offset-8">
              delight
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md animate-rise-in text-[15px] leading-relaxed text-cream/95 [animation-delay:0.22s]">
            We make jams for homes walking away from sugary, chemical-laden
            spreads — real fruit, superfood seeds, and flavors with an Indian
            soul. This page is the story;{" "}
            <Link href="/products" className="font-bold underline underline-offset-4 hover:text-marigold">
              the store is here
            </Link>{" "}
            when you&apos;re hungry.
          </p>
        </div>
      </section>
      <Drip className="-mt-px text-jamred" />

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title}>
                <h2 className="flex items-center gap-2 font-display text-lg leading-tight">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-jamred" />
                  {v.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-maroon/80">{v.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* The range — story only, nothing to buy here */}
      {CHAPTERS.map((chapter) => (
        <section key={chapter.plateKey}>
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            <Reveal>
              <div
                className={`grid items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-14 ${
                  chapter.flip ? "md:[direction:rtl]" : ""
                }`}
              >
                {chapter.image ? (
                  <div className="overflow-hidden rounded-3xl md:[direction:ltr]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chapter.image.src}
                      alt={chapter.image.alt}
                      loading="lazy"
                      className="h-64 w-full object-cover md:h-80"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex min-h-52 items-center justify-center gap-6 rounded-3xl p-10 ${CATEGORY_PLATES[chapter.plateKey]} md:[direction:ltr]`}
                  >
                    {chapter.art}
                  </div>
                )}
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
                  <p className="mt-4 flex flex-wrap gap-2">
                    {chapter.flavors.map((flavor) => (
                      <span
                        key={flavor}
                        className="rounded-full border border-maroon/20 px-3.5 py-1.5 text-[13px] font-semibold text-maroon/85"
                      >
                        {flavor}
                      </span>
                    ))}
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-block py-1 text-sm font-semibold text-maroon underline underline-offset-4 hover:text-jamred"
                  >
                    Find them in the store →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* Story band */}
      <section className="relative mt-4 overflow-hidden bg-maroon-dark text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photos/story-kitchen.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark via-maroon-dark/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-marigold">
              Our story
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[1.1] md:text-4xl">
              A Made-in-India movement for how families eat, one jar at a time.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cream/90">
              From family kitchens to organic chains, hotels and flight
              catering — every jar carries the same promise.{" "}
              <Link href="/story" className="font-bold underline underline-offset-4 hover:text-marigold">
                Read how it started
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
      <Drip className="-mt-px bg-marigold text-maroon-dark" />

      {/* The one door to the store */}
      <section className="bg-marigold text-maroon-dark">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.08] md:text-5xl">
              Convinced? The shelf is stocked.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed">
              Nine jars and slices, all real fruit, all made in India — ready
              to travel from our kitchen to yours.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-block min-h-12 rounded-full bg-maroon px-10 py-3.5 font-bold text-cream transition hover:bg-maroon-dark"
            >
              Visit the store
            </Link>
          </Reveal>
        </div>
      </section>
      <Drip className="-mt-px bg-maroon-dark text-marigold" />
    </main>
  );
}
