import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error(
    "supabaseAdmin uses the service role key and must never be imported into client-side code."
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Server-side payment verification will fail until these are set in .env.local."
  );
}

// Bypasses Row Level Security — only ever import this from server-only code
// (Route Handlers), never from a "use client" component or a module they import.
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  { auth: { persistSession: false } }
);
