"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { authGoogle, type UserInfo } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

const TOKEN_KEY = "jamup_token";
const USER_KEY = "jamup_user";

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  ready: boolean;
  signInWithCredential: (credential: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // corrupted storage — start signed out
    }
    setReady(true);
  }, []);

  const signInWithCredential = useCallback(async (credential: string) => {
    const result = await authGoogle(credential);
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    window.google?.accounts?.id?.disableAutoSelect?.();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, ready, signInWithCredential, signOut }}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function GoogleSignInButton() {
  const { signInWithCredential } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return true;
      const gsi = window.google?.accounts?.id;
      if (!gsi || !containerRef.current) return false;
      gsi.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          signInWithCredential(response.credential).catch(() =>
            setError("Sign-in failed — please try again.")
          );
        },
      });
      gsi.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
      });
      return true;
    };

    if (!tryRender()) {
      const interval = setInterval(() => {
        if (tryRender()) clearInterval(interval);
      }, 300);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [clientId, signInWithCredential]);

  if (!clientId) {
    return (
      <p className="text-sm text-maroon/60">
        Google sign-in isn&apos;t configured yet (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && <p className="mt-2 text-sm text-jamred">{error}</p>}
    </div>
  );
}
