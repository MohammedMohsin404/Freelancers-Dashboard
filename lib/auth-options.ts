// lib/auth-options.ts
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import getMongoClientPromise from "@/lib/mongodb";

const hasMongo = !!process.env.MONGODB_URI;

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  // ✅ Only attach the adapter if MONGODB_URI exists
  ...(hasMongo ? { adapter: MongoDBAdapter(getMongoClientPromise()) } : {}),

  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      // If MongoDB isn't configured, skip audit (but allow login)
      if (!hasMongo) return true;

      try {
        const client = await getMongoClientPromise();
        const db = client.db("freelancers-dashboard");
        const usersCollection = db.collection("users");
        await usersCollection.updateOne(
          { email: user.email },
          {
            $set: {
              name: user.name,
              email: user.email,
              image: user.image,
              loginMethod: "google",
              lastLogin: new Date(),
            },
          },
          { upsert: true }
        );
        return true;
      } catch (err) {
        console.error("Error updating login details:", err);
        // Still allow login even if audit fails
        return true;
      }
    },

    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string;
      return session;
    },
  },
};
