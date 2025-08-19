import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // redirect to login if no session
    return { redirect: "/auth/login" };
  }
  return { session };
}
