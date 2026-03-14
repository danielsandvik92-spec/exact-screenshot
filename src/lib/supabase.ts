import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase-variabler mangler i .env — faller tilbake til localStorage");
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function getSessionId(): string {
  let id = localStorage.getItem("ro-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ro-session-id", id);
  }
  return id;
}