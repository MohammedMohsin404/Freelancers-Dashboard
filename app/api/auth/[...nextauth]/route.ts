import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Called on login
    async signIn({ user }) {
      try {
        const client = await clientPromise;
        const db = client.db("freelancers-dashboard"); // your DB
        const usersCollection = db.collection("users");

        // Update or insert login details
        await usersCollection.updateOne(
          { email: user.email },
          {
            $set: {
              name: user.name,
              email: user.email,
              image: user.image,
        
              loginMethod: "google",
            },
          },
          { upsert: true }
        );

        return true;
      } catch (err) {
        console.error("Error updating login details:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Save user.id in token
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
