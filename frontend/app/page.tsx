"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_paise: number;
  weight_grams: number;
  image_url: string | null;
}

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export default function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${apiUrl}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Jam Up</h1>

      {error && <p className="text-red-600">Failed to load products: {error}</p>}
      {!error && products === null && <p>Loading products...</p>}

      <ul className="space-y-2">
        {products?.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <span className="font-medium">{p.name}</span> — {formatPaise(p.price_paise)}
          </li>
        ))}
      </ul>
    </main>
  );
}
