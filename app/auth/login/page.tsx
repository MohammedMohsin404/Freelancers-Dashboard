// /app/auth/login/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * This page checks available providers at runtime so we can show a clear message
 * if Google isn’t configured (no more cryptic OAuth “client_id is required”).
 * Also: if already signed in, we show a message instead of the Google button.
 */

type ProvidersResponse = Record<
  string,
  {
    id: string;
    name: string;
    type: "oauth" | "credentials" | "email";
    signinUrl: string;
    callbackUrl: string;
  }
>;

function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const current = theme === "system" ? systemTheme : theme;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-2.5 py-1.5 text-sm hover:bg-base-200"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
    >
      {current === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{current === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}

function LoginContent() {
  const { status } = useSession(); // 'authenticated' | 'unauthenticated' | 'loading'
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/dashboard";

  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingProviders(true);
        const res = await fetch("/api/auth/providers", { cache: "no-store" });
        const data = (await res.json()) as ProvidersResponse;
        if (alive) setProviders(data);
      } catch {
        if (alive) setProviders(null);
      } finally {
        if (alive) setLoadingProviders(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const googleEnabled = !!providers?.google;

  // If already logged in, show message + CTA
  const isAuthed = status === "authenticated";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-base-200 dark:to-base-200">
      <div className="relative w-full max-w-sm p-8 sm:p-10 bg-white dark:bg-base-100 rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <ThemeToggle />

        {/* Logo / Branding */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          <h1 className="text-xl text-center font-extrabold text-indigo-700 dark:text-indigo-400">
            Freelancers Dashboard
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">
          {isAuthed ? "You're already signed in" : "Sign in to your account"}
        </h2>

        {isAuthed ? (
          <div className="w-full space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              You’re logged in. Continue to your dashboard.
            </p>
            <a
              href={callbackUrl || "/dashboard"}
              className="btn btn-primary w-full"
            >
              Go to Dashboard
            </a>
          </div>
        ) : loadingProviders ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Checking sign-in options…</p>
        ) : googleEnabled ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Use your Google account to access your dashboard securely.
            </p>

            <button
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-base-300 rounded-lg shadow-sm bg-white dark:bg-base-100 hover:bg-gray-50 dark:hover:bg-base-200 transition-colors text-gray-700 dark:text-gray-200 font-medium"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <Image src="/G_logo.svg" alt="Google Logo" width={20} height={20} />
              Sign in with Google
            </button>
          </>
        ) : (
          <div className="w-full rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700">
            <p className="font-medium">Google sign-in isn’t configured.</p>
            <p className="mt-1">
              Set <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">AUTH_GOOGLE_ID</code> and{" "}
              <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">AUTH_GOOGLE_SECRET</code> in your environment, then restart the server.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          By signing in, you agree to our{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Terms &amp; Conditions</span>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
