"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchOrder, formatPaise, type OrderData } from "@/lib/api";

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId)
      .then((o) => (o ? setOrder(o) : setNotFound(true)))
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, [orderId]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {error && (
        <p className="rounded-lg bg-jamred/10 p-4 text-jamred">
          Couldn&apos;t load the order: {error}
        </p>
      )}
      {notFound && (
        <div className="py-16 text-center">
          <h1 className="font-display text-3xl">Order not found</h1>
        </div>
      )}
      {!error && !notFound && order === null && (
        <p className="animate-pulse text-maroon/80">Loading your order…</p>
      )}

      {order && (
        <>
          {order.status === "paid" ? (
            <div className="rounded-2xl bg-marigold/15 p-8 text-center">
              <div className="text-4xl">🎉</div>
              <h1 className="mt-2 font-display text-3xl">
                Order confirmed!
              </h1>
              <p className="mt-2 text-maroon/85">
                Thanks, {order.customer_name.split(" ")[0]} — your jams are on
                their way to the kitchen.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-jamred/10 p-8 text-center">
              <h1 className="font-display text-3xl">
                Payment not completed
              </h1>
              <p className="mt-2 text-maroon/85">
                This order was created but hasn&apos;t been paid. Your cart is
                untouched — you can check out again.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-cream-light p-6">
            <p className="text-xs uppercase tracking-wider text-maroon/75">
              Order {order.id}
            </p>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3 text-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      "🍯"
                    )}
                  </span>
                  <span className="flex-1">
                    {item.name} <span className="text-maroon/75">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    {formatPaise(item.unit_price_paise * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-maroon/15 pt-4 font-display text-lg">
              <span>Total</span>
              <span>{formatPaise(order.total_paise)}</span>
            </div>
            <p className="mt-4 text-sm text-maroon/80">
              <span className="font-semibold">Ships to:</span>{" "}
              {order.shipping_address}
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block min-h-11 rounded-full bg-maroon px-7 py-3 text-sm font-bold text-cream transition hover:bg-maroon-dark"
            >
              Back to the store
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
