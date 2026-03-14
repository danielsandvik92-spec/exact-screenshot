import { supabase } from "./supabase";

const FALLBACK_MESSAGES = [
  "Det du nettopp gjorde krever mot. Ta vare på deg selv nå. 🌿",
  "Det er lov å stoppe opp og kjenne etter. Du er trygg akkurat nå.",
  "Du tok deg tid til å være til stede med det som er. Det er ikke lite.",
  "Kroppen din gjør så godt den kan. Du er tryggere enn du tror.",
];

function randomFallback(): string {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}

export async function getReflection(
  context: string,
  systemPrompt?: string
): Promise<string> {
  if (!supabase) return randomFallback();
  try {
    const { data, error } = await supabase.functions.invoke("ai-reflect", {
      body: { context, systemPrompt },
    });
    if (error) throw error;
    return data?.text ?? randomFallback();
  } catch (err) {
    console.warn("AI-refleksjon utilgjengelig:", err);
    return randomFallback();
  }
}