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

export interface CheckoutForm {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
}

export interface CheckoutResponse {
  order_id: string;
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  key_id: string;
  prefill: { name: string; email: string; contact: string };
}

export interface OrderItemData {
  name: string;
  slug: string;
  image_url: string | null;
  quantity: number;
  unit_price_paise: number;
}

export interface OrderData {
  id: string;
  status: string;
  total_paise: number;
  customer_name: string;
  shipping_address: string;
  created_at: string | null;
  items: OrderItemData[];
}

async function postJson(path: string, body: unknown, token: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `API returned ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // non-JSON error body
    }
    throw new Error(detail);
  }
  return res.json();
}

export function checkoutApi(
  form: CheckoutForm,
  items: { product_id: string; quantity: number }[],
  token: string | null
): Promise<CheckoutResponse> {
  return postJson("/api/checkout", { ...form, items }, token);
}

export function verifyPaymentApi(
  payload: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  token: string | null
): Promise<{ status: string; order_id: string }> {
  return postJson("/api/checkout/verify", payload, token);
}

export async function fetchOrder(orderId: string): Promise<OrderData | null> {
  const res = await fetch(`${apiBase()}/api/orders/${encodeURIComponent(orderId)}`);
  if (res.status === 404 || res.status === 422) return null;
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
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
