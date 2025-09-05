// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Run on Node; never cache
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only export HTTP handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
