"use client";

import { createContext, useContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./client";

const SupabaseContext = createContext<SupabaseClient | null | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
}
