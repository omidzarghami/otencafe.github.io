import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Server-only client. Prefer service role so API routes can write menu state. */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export type MenuStateRow = {
  id: string;
  prices: Record<string, number>;
  settings: Record<string, unknown>;
  custom_sections: unknown[];
  custom_items: Record<string, unknown[]>;
  section_name_overrides: Record<string, string>;
  item_name_overrides: Record<string, string>;
  deleted_items: string[];
  deleted_sections: string[];
  updated_at?: string;
};
