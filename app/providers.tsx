"use client";

import { AuthProvider } from "@/lib/auth-context";
import { PublicationsProvider } from "@/lib/publications-context";
import { SupabaseProvider } from "@/lib/supabase/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <PublicationsProvider>{children}</PublicationsProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}
