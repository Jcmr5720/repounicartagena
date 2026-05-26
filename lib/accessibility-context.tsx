"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ContrastMode = "normal" | "high";
export type TextSizeMode = "normal" | "large" | "xlarge";

type AccessibilityContextValue = {
  contrastMode: ContrastMode;
  textSize: TextSizeMode;
  isHydrated: boolean;
  setContrastMode: (mode: ContrastMode) => void;
  toggleContrastMode: () => void;
  setTextSize: (size: TextSizeMode) => void;
};

const STORAGE_KEYS = {
  contrast: "reds-accessibility-contrast",
  textSize: "reds-accessibility-text-size",
} as const;

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readStoredContrast(): ContrastMode {
  if (typeof window === "undefined") {
    return "normal";
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEYS.contrast);
    return storedValue === "high" ? "high" : "normal";
  } catch {
    return "normal";
  }
}

function readStoredTextSize(): TextSizeMode {
  if (typeof window === "undefined") {
    return "normal";
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEYS.textSize);
    if (storedValue === "large" || storedValue === "xlarge") {
      return storedValue;
    }
  } catch {
    return "normal";
  }

  return "normal";
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contrastMode, setContrastModeState] = useState<ContrastMode>("normal");
  const [textSize, setTextSizeState] = useState<TextSizeMode>("normal");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setContrastModeState(readStoredContrast());
    setTextSizeState(readStoredTextSize());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const root = document.documentElement;
    root.dataset.contrast = contrastMode;
    root.dataset.textSize = textSize;

    try {
      window.localStorage.setItem(STORAGE_KEYS.contrast, contrastMode);
      window.localStorage.setItem(STORAGE_KEYS.textSize, textSize);
    } catch {
      // Ignore storage failures and keep the UI functional.
    }
  }, [contrastMode, textSize, isHydrated]);

  const setContrastMode = useCallback((mode: ContrastMode) => {
    setContrastModeState(mode);
  }, []);

  const toggleContrastMode = useCallback(() => {
    setContrastModeState((currentMode) => (currentMode === "high" ? "normal" : "high"));
  }, []);

  const setTextSize = useCallback((size: TextSizeMode) => {
    setTextSizeState(size);
  }, []);

  const value = useMemo(
    () => ({
      contrastMode,
      isHydrated,
      textSize,
      setContrastMode,
      toggleContrastMode,
      setTextSize,
    }),
    [
      contrastMode,
      isHydrated,
      textSize,
      setContrastMode,
      setTextSize,
      toggleContrastMode,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }

  return context;
}
