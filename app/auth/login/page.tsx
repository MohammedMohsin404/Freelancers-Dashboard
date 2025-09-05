"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Ensure this client page isn't prerendered
export const dynamic = "force-dynamic";

function LoginContent() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="w-full max-w-sm p-10 bg-white rounded-2xl shadow-xl flex flex-col items-center gap-6">
        {/* Logo / Branding */}
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-3xl font-extrabold text-indigo-700">MyApp</h1>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-700 text-center">
          Sign in to your account
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center">
          Use your Google account to access your dashboard securely.
        </p>

        {/* Sign In Button */}
        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <Image src="/G_logo.svg" alt="Google Logo" width={20} height={20} />
          Sign in with Google
        </button>

        {/* Footer / Note */}
        <p className="text-xs text-gray-400 text-center">
          By signing in, you agree to our{" "}
          <span className="text-indigo-600">Terms &amp; Conditions</span>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
