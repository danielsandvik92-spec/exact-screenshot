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
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Ingen tilkobling" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Ikke innlogget" };

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();
    return { success: false, error: data.error || "Noe gikk galt" };
  }

  // Rydd opp localStorage
  localStorage.clear();

  return { success: true };
}