import type { CardMeta } from "@/components/ProductCard";

// Presentation-only copy and art direction — the catalog itself (names,
// prices, descriptions) lives in the database.

export interface ProductMeta extends CardMeta {
  /** Tailwind gradient classes for this flavor's plate */
  plate: string;
  /** Narrative flavor story for the product page, one string per paragraph */
  story: string[];
}

export const CARD_META: Record<string, ProductMeta> = {
  "mango-chilli-jam": {
    tagline: "Sweet mango pulp with a slow-building chilli kick.",
    badge: "Bestseller",
    badgeClass: "bg-jamred text-cream",
    plate: "bg-gradient-to-br from-mango to-jamred",
    story: [
      "Every Indian summer has a moment where mango meets chilli — a wedge of ripe fruit, a pinch of red powder, eyes closed. This jam bottles that moment. We start with real mango pulp, sweeten it with sulphur-less sugar, and let red chilli build slowly instead of shouting over the fruit.",
      "Spread it thick on hot toast, melt it over grilled paneer, or serve it beside a cheese board and watch it disappear first. The heat arrives late and leaves politely — enough to wake the mango up, never enough to need a glass of water.",
    ],
  },
  "mango-ginger-jam": {
    tagline: "Ripe mango brightened with fresh ginger warmth.",
    badge: "Zingy",
    badgeClass: "bg-maroon text-cream",
    plate: "bg-gradient-to-br from-mango to-marigold",
    story: [
      "Ginger has sharpened Indian kitchens for centuries — grated into chai, pounded into pastes, sliced into pickles. Here it cuts through sweet mango pulp with a clean, warming zing that makes the fruit taste more like itself.",
      "This is the jar for winter mornings: stirred into porridge, spread on paratha, or whisked into a glaze for roast vegetables. Real fruit pulp, sulphur-less sugar, no artificial anything — just mango and ginger doing what they've always done together.",
    ],
  },
  "guava-chilli-jam": {
    tagline: "The street-side guava-chilli classic, in a jar.",
    badge: "Sweet heat",
    badgeClass: "bg-jamred text-cream",
    plate: "bg-gradient-to-br from-guava to-jamred",
    story: [
      "Outside every Indian school gate there was a cart: guavas split open, rubbed with chilli-salt, handed over wrapped in newspaper. This jam is that memory, slow-cooked. Fragrant pink guava pulp meets a confident chilli edge, balanced with sulphur-less sugar.",
      "It belongs on buttered toast, alongside sharp cheddar, or spooned over dahi as an unapologetic dessert. One jar in, you'll understand why the cart always had a queue.",
    ],
  },
  "apple-cinnamon-chia-jam": {
    tagline: "Slow-cooked apple pie feelings, chia boosted.",
    badge: "Chia boost",
    badgeClass: "bg-fig text-cream",
    plate: "bg-gradient-to-br from-jamred to-guava",
    story: [
      "Apples and cinnamon have been comforting people for as long as ovens have existed. We slow-cook them into a soft, spiced jam and fold in chia seeds — tiny, nutty pearls that carry fibre, protein and omega-3s into your breakfast without asking for credit.",
      "Swirl it into yoghurt, layer it over pancakes, or eat it the honest way: straight off the spoon while the toast is still in the toaster. Wellness that tastes like pie filling.",
    ],
  },
  "fig-chia-jam": {
    tagline: "Rich, jammy figs with superfood seeds.",
    badge: "Chia boost",
    badgeClass: "bg-fig text-cream",
    plate: "bg-gradient-to-br from-guava to-fig",
    story: [
      "Figs barely need help becoming jam — they're halfway there on the tree. We take dark, honeyed figs, cook them low and slow, and fold in chia seeds for texture and everyday nutrition. The result is deep, sticky and quietly luxurious.",
      "Pair it with anything that loves sweetness with gravity: aged cheese, morning porridge, a peanut-butter sandwich that deserves promotion. This is the jar that makes people ask where you bought it.",
    ],
  },
  "mango-chia-jam": {
    tagline: "The classic mango jam, fortified.",
    badge: "Chia boost",
    badgeClass: "bg-fig text-cream",
    plate: "bg-gradient-to-br from-mango to-guava",
    story: [
      "Mango jam is the taste most Indian childhoods share — the jar that emptied faster than any other. Ours keeps that sunshine sweetness, made from real pulp and sulphur-less sugar, and adds chia seeds so the nostalgic choice is also the sensible one.",
      "It disappears into tiffin sandwiches, milkshakes and midnight toast. The chia is there working either way.",
    ],
  },
  "jam-slice-strawberry": {
    tagline: "Peel, place, eat — strawberry, zero mess.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
    plate: "bg-gradient-to-br from-jamred to-guava",
    story: [
      "A jam sandwich needs a knife, a jar, a counter and someone to wipe the counter. A Jam Slice needs none of them. Each individually wrapped strawberry square fits a slice of bread exactly — peel the wrapper, place the slice, eat the sandwich.",
      "Built for school tiffins, train journeys and gym bags. 100% natural, no artificial colours, and the first of its kind in India.",
    ],
  },
  "jam-slice-mango": {
    tagline: "A mango jam sandwich, anywhere.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
    plate: "bg-gradient-to-br from-mango to-marigold",
    story: [
      "The mango jam sandwich, freed from the kitchen. Each wrapped square is an even layer of mango jam sized for sliced bread — no jar, no knife, no sticky fingers on the school bus.",
      "Five slices to a pack, 100% natural, no artificial colours. Keep a pack in the tiffin drawer and one in the travel bag; they have a way of vanishing.",
    ],
  },
  "jam-slice-mixed-fruit": {
    tagline: "Every fruit invited, no mess allowed.",
    badge: "Pack of 5",
    badgeClass: "bg-maroon text-cream",
    plate: "bg-gradient-to-br from-fig to-jamred",
    story: [
      "Mixed fruit jam is the crowd-pleaser of Indian breakfasts — everyone's second-favourite flavor and therefore everyone's compromise. Ours turns it into a mess-free square: peel, place between bread, done.",
      "Individually wrapped, five to a pack, 100% natural with no artificial colours. The tiffin solves itself.",
    ],
  },
};

export const CATEGORY_PLATES: Record<string, string> = {
  "Fusion Jam": "bg-gradient-to-br from-mango via-jamred to-guava",
  "Chia Jam": "bg-gradient-to-br from-guava via-jamred to-fig",
  "Jam Slices": "bg-gradient-to-br from-marigold via-mango to-jamred",
};
