// /lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Minimal, adapter-free NextAuth config (JWT sessions).
 * Env needed:
 *   AUTH_GOOGLE_ID
 *   AUTH_GOOGLE_SECRET
 *   NEXTAUTH_URL
 *   NEXTAUTH_SECRET
 */
const HAS_GOOGLE =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: { signIn: "/auth/login" },

  providers: [
    ...(HAS_GOOGLE
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
          }),
        ]
      : []),
  ],

  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
