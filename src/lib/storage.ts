import { supabase, getSessionId } from "./supabase";

async function lsGet<T>(key: string): Promise<T | null> {
  try {
    const val = localStorage.getItem(`ro-${key}`);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function lsSet(key: string, val: unknown): Promise<void> {
  try {
    localStorage.setItem(`ro-${key}`, JSON.stringify(val));
  } catch {}
}

const TABLE_MAP: Record<string, string> = {
  "checkins": "checkins",
  "evening-evals": "evening_evals",
  "acute-sessions": "acute_sessions",
  "social-sessions": "social_sessions",
  "critic-sessions": "critic_sessions",
  "relation-sessions": "relation_sessions",
};

async function getUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.user?.id ?? null;
}

function toRow(key: string, entry: Record<string, unknown>, userId: string) {
  const base = { user_id: userId };
  switch (key) {
    case "checkins":
      return { ...base, mood: entry.mood, energy: entry.energy, date: entry.date, ts: entry.ts };
    case "evening-evals":
      return { ...base, date: entry.date, q1: entry.q1, q2: entry.q2, q3: entry.q3, ts: entry.ts };
    case "acute-sessions":
      return { ...base, symptom: entry.symptom, intensity_before: entry.intensityBefore, intensity_after: entry.intensityAfter, grounding: entry.grounding, ts: entry.ts };
    case "social-sessions":
      return { ...base, category: entry.category, what: entry.what, fear: entry.fear, evidence: entry.evidence, neutral: entry.neutral, friend_view: entry.friendView, reframe: entry.reframe, ts: entry.ts };
    case "critic-sessions":
      return { ...base, voice: entry.voice, who_sounds_like: entry.whoSoundsLike, safe_response: entry.safeResponse, ts: entry.ts };
    case "relation-sessions":
      return { ...base, trigger: entry.trigger, interpretation: entry.interpretation, alternatives: entry.alternatives, feeling: entry.feeling, mode: entry.mode, ts: entry.ts };
    default:
      return { ...base, ...entry };
  }
}

function fromRow(key: string, row: Record<string, unknown>) {
  switch (key) {
    case "acute-sessions":
      return { symptom: row.symptom, intensityBefore: row.intensity_before, intensityAfter: row.intensity_after, grounding: row.grounding ?? [], ts: row.ts };
    case "social-sessions":
      return { category: row.category, what: row.what, fear: row.fear, evidence: row.evidence, neutral: row.neutral, friendView: row.friend_view, reframe: row.reframe, ts: row.ts };
    case "critic-sessions":
      return { voice: row.voice, whoSoundsLike: row.who_sounds_like, safeResponse: row.safe_response, ts: row.ts };
    case "relation-sessions":
      return { trigger: row.trigger, interpretation: row.interpretation, alternatives: row.alternatives, feeling: row.feeling, mode: row.mode, ts: row.ts };
    default:
      return row;
  }
}

export async function sGet<T>(key: string): Promise<T | null> {
  const table = TABLE_MAP[key];
  if (!table || !supabase) return lsGet<T>(key);
  try {
    const userId = await getUserId();
    if (!userId) return lsGet<T>(key);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("ts", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data.map((row) => fromRow(key, row)) as T;
  } catch (err) {
    console.warn(`Supabase sGet feilet for ${key}, bruker localStorage:`, err);
    return lsGet<T>(key);
  }
}

export async function sSet(key: string, val: unknown): Promise<void> {
  const table = TABLE_MAP[key];
  if (!table || !supabase) return lsSet(key, val);
  const arr = Array.isArray(val) ? val : [val];
  if (arr.length === 0) return;
  const latest = arr[arr.length - 1] as Record<string, unknown>;
  try {
    const userId = await getUserId();
    if (!userId) return lsSet(key, val);
    const row = toRow(key, latest, userId);
    const { error } = await supabase.from(table).insert(row);
    if (error) throw error;
    lsSet(key, val);
  } catch (err) {
    console.warn(`Supabase sSet feilet for ${key}, bruker localStorage:`, err);
    lsSet(key, val);
  }
}