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
export async function checkIsPlus(): Promise<boolean> {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from("profiles")
    .select("is_plus")
    .eq("id", user.id)
    .single();
  
  return data?.is_plus ?? false;
}