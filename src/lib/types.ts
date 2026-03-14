export interface CheckinEntry {
  mood: string;
  energy: number;
  date: string;
  ts: string;
}

export interface EveningEvalEntry {
  date: string;
  q1: string;
  q2: string;
  q3: string;
  ts: string;
}

export interface AcuteSessionEntry {
  symptom: string;
  intensityBefore: number;
  intensityAfter: number;
  grounding: string[];
  ts: string;
}

export interface SocialSessionEntry {
  category: string;
  what: string;
  fear: string;
  evidence: string;
  neutral: string;
  friendView: string;
  reframe: string;
  ts: string;
}

export interface CriticSessionEntry {
  voice: string;
  whoSoundsLike: string;
  safeResponse: string;
  ts: string;
}

export interface RelationSessionEntry {
  trigger: string;
  interpretation: string;
  alternatives: string;
  feeling: string;
  mode: string;
  ts: string;
}

export interface AppDB {
  checkins: CheckinEntry[];
  eveningEvals: EveningEvalEntry[];
  acuteSessions: AcuteSessionEntry[];
  socialSessions: SocialSessionEntry[];
  criticSessions: CriticSessionEntry[];
  relationSessions: RelationSessionEntry[];
}

export type ScreenId = "home" | "acute" | "social" | "critic" | "relation" | "identity" | "emotion" | "patterns";
