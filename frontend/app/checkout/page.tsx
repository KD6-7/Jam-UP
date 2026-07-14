"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { checkoutApi, formatPaise, verifyPaymentApi, type CheckoutForm } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load the payment window"));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { items, subtotalPaise, ready, clear } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from the signed-in account (only fields the user hasn't typed in)
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      customer_name: f.customer_name || user.name || "",
      customer_email: f.customer_email || user.email,
    }));
  }, [user]);

  const set = (key: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const payNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const guestItems = items.map((en) => ({
        product_id: en.product.id,
        quantity: en.quantity,
      }));
      const order = await checkoutApi(form, token ? [] : guestItems, token);
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: order.key_id,
        order_id: order.razorpay_order_id,
        amount: order.amount_paise,
        currency: order.currency,
        name: "Jam Up",
        description: "Jam Up order",
        prefill: order.prefill,
        theme: { color: "#7A1E0C" },
        modal: {
          ondismiss: () => setBusy(false),
        },
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          verifyPaymentApi({ order_id: order.order_id, ...response }, token)
            .then(() => {
              clear();
              router.replace(`/orders/${order.order_id}`);
            })
            .catch(() =>
              setError(
                "Payment went through but confirmation failed — don't pay again; contact us with your order id " +
                  order.order_id
              )
            )
            .finally(() => setBusy(false));
        },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed — you can try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/cart" className="text-sm font-medium text-jamred hover:underline">
        ← Back to cart
      </Link>
      <h1 className="mt-2 font-display text-4xl font-black">Checkout</h1>

      {ready && items.length === 0 && (
        <div className="mt-10 rounded-[20px] border-2 border-dashed border-maroon/35 p-10 text-center">
          <p className="font-display text-xl">Your cart is empty.</p>
          <Link
            href="/#fusion"
            className="mt-5 inline-block rounded-full bg-jamred px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-maroon"
          >
            Browse the jams
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <form onSubmit={payNow} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Full name
              <input
                required
                value={form.customer_name}
                onChange={set("customer_name")}
                className="rounded-xl border border-maroon/25 bg-white px-4 py-2.5 font-normal outline-none focus:border-jamred"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Email
              <input
                required
                type="email"
                value={form.customer_email}
                onChange={set("customer_email")}
                className="rounded-xl border border-maroon/25 bg-white px-4 py-2.5 font-normal outline-none focus:border-jamred"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Phone
              <input
                required
                type="tel"
                minLength={7}
                value={form.customer_phone}
                onChange={set("customer_phone")}
                className="rounded-xl border border-maroon/25 bg-white px-4 py-2.5 font-normal outline-none focus:border-jamred"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Shipping address
              <textarea
                required
                minLength={10}
                rows={4}
                value={form.shipping_address}
                onChange={set("shipping_address")}
                className="rounded-xl border border-maroon/25 bg-white px-4 py-2.5 font-normal outline-none focus:border-jamred"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-jamred/10 p-3 text-sm text-jamred">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-full bg-jamred px-8 py-3 font-bold text-cream transition hover:bg-maroon disabled:opacity-60"
            >
              {busy ? "Opening payment…" : `Pay ${formatPaise(subtotalPaise)}`}
            </button>
            <p className="text-xs text-maroon/60">
              Payments are processed by Razorpay. Card details never touch our
              servers.
            </p>
          </form>

          <aside className="h-fit rounded-[20px] bg-cream-light p-6">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {product.name} <span className="text-maroon/60">× {quantity}</span>
                  </span>
                  <span className="font-semibold">
                    {formatPaise(product.price_paise * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-maroon/15 pt-4 font-display text-lg font-bold">
              <span>Total</span>
              <span>{formatPaise(subtotalPaise)}</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
