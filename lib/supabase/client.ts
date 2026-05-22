import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export const SUPABASE_MISSING_ENV_MESSAGE =
  "Supabase is not configured in this environment";

export function getSupabaseMissingEnvMessage() {
  return SUPABASE_MISSING_ENV_MESSAGE;
}

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
};
