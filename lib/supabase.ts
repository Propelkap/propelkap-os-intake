import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Cliente Supabase con SERVICE_ROLE_KEY (bypass RLS).
 * Solo usar en server-side (route handlers, server actions).
 *
 * Apunta al proyecto Supabase de PropelKap (hmwikgjihesyvfsqccfs),
 * el mismo del CRM productivo. Tabla destino: `pk_leads`.
 */
export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
