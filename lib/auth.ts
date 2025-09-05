// lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

/**
 * Require an authenticated session on the server.
 * Throws if no session; return value is the session object when present.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get session (nullable) on the server.
 */
export async function getSession() {
  return getServerSession(authOptions);
}
