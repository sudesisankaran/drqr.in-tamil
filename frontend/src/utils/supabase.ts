import { createClient } from "@supabase/supabase-js";
import _env from "./_env";

const supabaseUrl = _env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = _env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables in the frontend.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
