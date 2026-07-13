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

export interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
}

export interface CartEntry {
  product: Product;
  quantity: number;
}

export interface CartData {
  items: CartEntry[];
  subtotal_paise: number;
}

async function authedFetch(
  path: string,
  token: string,
  init?: { method?: string; body?: string }
) {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (init?.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

export async function authGoogle(
  credential: string
): Promise<{ token: string; user: UserInfo }> {
  const res = await fetch(`${apiBase()}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(`Sign-in failed (${res.status})`);
  return res.json();
}

export function fetchCart(token: string): Promise<CartData> {
  return authedFetch("/api/cart", token);
}

export function setCartItemApi(
  token: string,
  productId: string,
  quantity: number
): Promise<CartData> {
  return authedFetch("/api/cart/items", token, {
    method: "PUT",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function mergeCartApi(
  token: string,
  items: { product_id: string; quantity: number }[]
): Promise<CartData> {
  return authedFetch("/api/cart/merge", token, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
