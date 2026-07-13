export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_paise: number;
  weight_grams: number;
  image_url: string | null;
}

export type Category = "Fusion Jam" | "Chia Jam" | "Jam Slices";

export function categoryOf(product: Product): Category {
  if (product.slug.startsWith("jam-slice")) return "Jam Slices";
  if (product.slug.includes("chia")) return "Chia Jam";
  return "Fusion Jam";
}

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `₹${Number.isInteger(rupees) ? rupees : rupees.toFixed(2)}`;
}

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${apiBase()}/api/products`);
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${apiBase()}/api/products/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}
