"use client";

import { AuthProvider } from "@/lib/auth-context";
import { PublicationsProvider } from "@/lib/publications-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PublicationsProvider>{children}</PublicationsProvider>
    </AuthProvider>
  );
}
