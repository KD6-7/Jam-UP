"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { GoogleSignInButton, useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="font-display text-4xl">Sign in</h1>
      <p className="mt-3 text-maroon/85">
        Sign in with Google to keep your cart saved across visits and devices.
        Anything already in your cart comes with you.
      </p>
      <div className="mt-8 flex justify-center">
        <GoogleSignInButton />
      </div>
    </main>
  );
}
