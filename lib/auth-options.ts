// /lib/auth-options.ts
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClientPromise from "@/lib/mongodb";

// If you’re using AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET (as you showed)
const GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

const hasMongo = Boolean(process.env.MONGODB_URI);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID as string,
      clientSecret: GOOGLE_SECRET as string,
    }),
  ],

  // Only attach adapter if Mongo is configured
  ...(hasMongo ? { adapter: MongoDBAdapter(getMongoClientPromise()) } : {}),

  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.id = (user as any).id ?? token.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = (user as any).image ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string | undefined;
        session.user.email = token.email ?? session.user.email ?? undefined;
        session.user.name = token.name ?? session.user.name ?? undefined;
        // @ts-ignore
        session.user.image = token.picture ?? session.user.image ?? undefined;
      }
      return session;
    },
    // Optional: guard sign-in when Mongo isn’t configured
    async signIn() {
      if (!hasMongo) {
        console.error("Blocking sign-in: MONGODB_URI is not set.");
        return false;
      }
      return true;
    },
  },
};
