import type { CardMeta } from "@/components/ProductCard";

// Presentation-only copy from the approved redesign — the catalog itself
// (names, prices, descriptions) lives in the database.
export const CARD_META: Record<string, CardMeta> = {
  "mango-chilli-jam": {
    tagline: "Sweet mango pulp with a slow-building chilli kick.",
    badge: "Bestseller",
    badgeClass: "bg-jamred text-cream",
  },
  "mango-ginger-jam": {
    tagline: "Ripe mango brightened with fresh ginger warmth.",
    badge: "Zingy",
    badgeClass: "bg-marigold text-maroon-dark",
  },
  "guava-chilli-jam": {
    tagline: "The street-side guava-chilli classic, in a jar.",
    badge: "Sweet heat",
    badgeClass: "bg-jamred text-cream",
  },
  "apple-cinnamon-chia-jam": {
    tagline: "Slow-cooked apple pie feelings, chia boosted.",
    badge: "Chia boost",
    badgeClass: "bg-marigold text-maroon-dark",
  },
  "fig-chia-jam": {
    tagline: "Rich, jammy figs with superfood seeds.",
    badge: "Chia boost",
    badgeClass: "bg-marigold text-maroon-dark",
  },
  "mango-chia-jam": {
    tagline: "The classic mango jam, fortified.",
    badge: "Chia boost",
    badgeClass: "bg-marigold text-maroon-dark",
  },
  "jam-slice-strawberry": {
    tagline: "Peel, place, eat — strawberry, zero mess.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
  },
  "jam-slice-mango": {
    tagline: "A mango jam sandwich, anywhere.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
  },
  "jam-slice-mixed-fruit": {
    tagline: "Every fruit invited, no mess allowed.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
  },
};
