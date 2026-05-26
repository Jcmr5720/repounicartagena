"use client";

import { AccessibilityProvider } from "@/lib/accessibility-context";
import { CookieConsentProvider } from "@/lib/cookie-consent-context";
import { AuthProvider } from "@/lib/auth-context";
import { PublicationsProvider } from "@/lib/publications-context";
import { SupabaseProvider } from "@/lib/supabase/provider";
import { CookieBanner } from "@/components/cookie-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <AccessibilityProvider>
          <CookieConsentProvider>
            <PublicationsProvider>{children}</PublicationsProvider>
            <CookieBanner />
          </CookieConsentProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}
