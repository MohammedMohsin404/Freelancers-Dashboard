// /lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // No adapter — sessions will use JWT strategy only
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Dev Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim();
        const name = credentials?.name?.toString().trim() || "Freelancer";
        if (!email) return null;
        // You can do a DB lookup here if you want to validate users
        return { id: email, email, name };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name || token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = {
          name: (token.name as string) || session.user?.name || "Freelancer",
          email: token.email as string,
        } as any;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
