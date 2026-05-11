import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (anon) — safe to expose
export const supabaseAnon = () => createClient(url, anonKey);

// Server-side (service role) — bypasses RLS, NEVER ship to client
export const supabaseAdmin = () => createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
