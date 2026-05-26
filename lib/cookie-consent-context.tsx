"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CookieConsentStatus = "unknown" | "accepted" | "rejected" | "essential";

type CookieConsentContextValue = {
  consentStatus: CookieConsentStatus;
  isHydrated: boolean;
  allowsNonEssentialCookies: boolean;
  acceptAllCookies: () => void;
  rejectNonEssentialCookies: () => void;
  allowEssentialOnly: () => void;
};

const STORAGE_KEY = "reds-cookie-consent";

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readStoredConsent(): CookieConsentStatus {
  if (typeof window === "undefined") {
    return "unknown";
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (
      storedValue === "accepted" ||
      storedValue === "rejected" ||
      storedValue === "essential"
    ) {
      return storedValue;
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>("unknown");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setConsentStatus(readStoredConsent());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || consentStatus === "unknown") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, consentStatus);
    } catch {
      // Keep the banner functional even if storage is unavailable.
    }
  }, [consentStatus, isHydrated]);

  const acceptAllCookies = useCallback(() => {
    setConsentStatus("accepted");
  }, []);

  const rejectNonEssentialCookies = useCallback(() => {
    setConsentStatus("rejected");
  }, []);

  const allowEssentialOnly = useCallback(() => {
    setConsentStatus("essential");
  }, []);

  const value = useMemo(
    () => ({
      consentStatus,
      isHydrated,
      allowsNonEssentialCookies: consentStatus === "accepted",
      acceptAllCookies,
      rejectNonEssentialCookies,
      allowEssentialOnly,
    }),
    [
      acceptAllCookies,
      allowEssentialOnly,
      consentStatus,
      isHydrated,
      rejectNonEssentialCookies,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }

  return context;
}
