import type { Metadata } from "next";

import Drip from "@/components/Drip";
import { OrangeSliceArt } from "@/components/FruitArt";

export const metadata: Metadata = {
  title: "Contact Us — Jam Up",
  description: "Get in touch with Jam Up for orders, retail partnerships and private-label manufacturing.",
};

// TODO(owner): replace the placeholder contact details below with the real
// business email, phone and address before sharing this page.
const CONTACT = {
  email: "hello@jamup.example",
  phone: "+91 00000 00000",
  address: "Jam Up — address to be added",
};

export default function ContactPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-maroon text-cream">
        <OrangeSliceArt className="absolute right-[12%] top-8 h-24 w-24 animate-float opacity-80 [--float-tilt:12deg]" />
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-14 md:pb-20 md:pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold">
            Contact us
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] md:text-5xl">
            Talk to us about jars, shelves and everything between.
          </h1>
        </div>
      </section>
      <Drip className="-mt-px text-maroon" />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-cream-light p-7">
            <h2 className="font-display text-xl">Orders & questions</h2>
            <p className="mt-2 text-sm leading-relaxed text-maroon/85">
              About an order, a flavor, or where to find us offline.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-4 inline-block min-h-11 rounded-full bg-marigold px-6 py-2.5 text-sm font-bold text-maroon-dark transition hover:bg-maroon hover:text-cream"
            >
              Email {CONTACT.email}
            </a>
          </div>

          <div className="rounded-3xl bg-cream-light p-7">
            <h2 className="font-display text-xl">Retail & partnerships</h2>
            <p className="mt-2 text-sm leading-relaxed text-maroon/85">
              Stock Jam Up, or have us design and manufacture for your brand —
              we work with organic chains, hotels and flight catering.
            </p>
            <a
              href={`mailto:${CONTACT.email}?subject=Partnership%20enquiry`}
              className="mt-4 inline-block min-h-11 rounded-full bg-maroon px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-maroon-dark"
            >
              Start a conversation
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-dashed border-maroon/25 p-7 text-sm leading-relaxed text-maroon/85">
          <p className="font-semibold text-maroon">Reach us directly</p>
          <p className="mt-1">{CONTACT.phone}</p>
          <p>{CONTACT.address}</p>
        </div>
      </section>
    </main>
  );
}
