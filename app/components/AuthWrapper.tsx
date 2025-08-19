"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return; // wait for session to load

    // Exclude /auth/login page from redirect
    if (!session && pathname !== "/auth/login") {
      signIn(); // redirects to /auth/login
    }
  }, [status, session, pathname]);

  if (!session && pathname !== "/auth/login") return <p>Loading...</p>;

  return <>{children}</>;
}
