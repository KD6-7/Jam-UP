import type { Metadata } from "next";
import Link from "next/link";

import Drip from "@/components/Drip";
import { ChilliArt, StrawberryArt } from "@/components/FruitArt";

export const metadata: Metadata = {
  title: "Our Story — Jam Up",
  description:
    "Jam Up is a Made-in-India movement reimagining how families consume nutrition daily — fusion jams with real fruit pulp, chia fortification and zero artificial additives.",
};

export default function StoryPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-maroon-dark text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/photos/story-kitchen.jpg"
          alt="Hands stirring a copper pot of bubbling jam in a warm Indian home kitchen"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark via-maroon-dark/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-32 md:pt-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold">
            Our story
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
            Wellness in a jar isn&apos;t a slogan. It&apos;s the whole plan.
          </h1>
        </div>
      </section>
      <Drip className="-mt-px text-maroon-dark" />

      <section className="mx-auto max-w-3xl space-y-12 px-6 py-14">
        <div>
          <h2 className="font-display text-2xl">Why we exist</h2>
          <p className="mt-3 leading-relaxed text-maroon/90">
            Jam Up isn&apos;t just another jam brand. It&apos;s a Made-in-India
            movement reimagining how families consume nutrition daily.
            Health-conscious homes are actively walking away from sugary,
            chemical-laden spreads — we build them somewhere better to land:
            jams crafted with real fruit pulp, sulphur-less sugar and zero
            artificial additives, fortified with chia and rooted in local taste
            palettes.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl">What we make</h2>
          <p className="mt-3 leading-relaxed text-maroon/90">
            Our fusion jams — mango-chilli, mango-ginger, guava-chilli — are
            uniquely Indian in soul and globally appealing in execution. Our
            chia range fortifies breakfast classics with superfood seeds. And
            our Jam Slices are a first-of-their-kind innovation in India:
            individually wrapped squares of jam that fit sliced bread exactly.
            Peel, place, eat.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl">Where we&apos;re going</h2>
          <p className="mt-3 leading-relaxed text-maroon/90">
            Every jar has a 12-month shelf life and packaging we can customise —
            which is why Jam Up jams travel from family kitchens to organic
            chains, premium hotels and flight catering. We also design and
            manufacture jams and other food products for partner brands. This is
            an FMCG play with a wellness core, and we&apos;re just getting
            started.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-marigold/15 p-8">
          <div className="flex items-center gap-4">
            <StrawberryArt className="h-14 w-14" />
            <ChilliArt className="h-14 w-14" />
          </div>
          <p className="text-[15px] font-semibold">
            Taste the argument for yourself —{" "}
            <Link href="/products" className="underline underline-offset-4 hover:text-jamred">
              shop the shelf
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
