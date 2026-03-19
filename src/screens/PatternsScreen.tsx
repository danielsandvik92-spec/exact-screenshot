import { useState, useEffect } from "react";
import { MOOD_META } from "@/lib/data";
import { CheckinGraph } from "@/components/CheckinGraph";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import type { AppDB } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getReflection } from "@/lib/useReflection";
import { checkIsPlus } from "@/lib/supabase";

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function getWeekLabel(weekStart: Date) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}`;
  return `${fmt(weekStart)} – ${fmt(end)}`;
}
function getAvailableWeeks(allItems: { ts?: string }[]) {
  const seen = new Set<string>();
  (allItems || []).forEach(e => {
    if (e.ts) { const ws = getWeekStart(new Date(e.ts)); seen.add(ws.toISOString()); }
  });
  return [...seen].sort((a, b) => b.localeCompare(a)).map(iso => new Date(iso));
}
function filterByWeek<T extends { ts?: string }>(items: T[], weekStart: Date): T[] {
  const end = new Date(weekStart); end.setDate(end.getDate() + 7);
  return (items || []).filter(e => {
    if (!e.ts) return false;
    const d = new Date(e.ts);
    return d >= weekStart && d < end;
  });
}

interface PatternsScreenProps {
  onBack: () => void;
  db: AppDB;
}

interface PortraitEntry {
  id: string;
  session_date: string;
  questions: string[];
  answers: string[];
  ai_insight: string;
}

export function PatternsScreen({ onBack, db }: PatternsScreenProps) {
  const [tab, setTab] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [portrait, setPortrait] = useState<PortraitEntry[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isPlus, setIsPlus] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [dialogQuestion, setDialogQuestion] = useState("");
  const [dialogAnswer, setDialogAnswer] = useState<string | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const checkins = db?.checkins || [];
  const acuteSessions = db?.acuteSessions || [];
  const socialSessions = db?.socialSessions || [];
  const criticSessions = db?.criticSessions || [];
  const eveningEvals = db?.eveningEvals || [];

  const allSessions = [...checkins, ...acuteSessions, ...socialSessions, ...criticSessions, ...eveningEvals];
  const availableWeeks = getAvailableWeeks(allSessions);
  const activeWeek = selectedWeek || (availableWeeks.length > 0 ? availableWeeks[0] : getWeekStart(new Date()));

  const weekCheckins = filterByWeek(checkins, activeWeek);
  const weekCritic = filterByWeek(criticSessions, activeWeek);
  const weekSocial = filterByWeek(socialSessions, activeWeek);
  const weekAcute = filterByWeek(acuteSessions, activeWeek);
  const weekEvenings = filterByWeek(eveningEvals, activeWeek);

  const avgEnergy = weekCheckins.length > 0
    ? (weekCheckins.reduce((a, b) => a + b.energy, 0) / weekCheckins.length).toFixed(1)
    : null;

  const moodCounts = weekCheckins.reduce<Record<string, number>>((acc, c) => {
    acc[c.mood] = (acc[c.mood] || 0) + 1; return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const topMoodMeta = topMood ? MOOD_META.find(m => m.label === topMood[0]) : null;

  const criticCounts: Record<string, number> = {};
  weekCritic.forEach(s => { if (s.voice) criticCounts[s.voice] = (criticCounts[s.voice] || 0) + 1; });

  const socialCounts: Record<string, number> = {};
  weekSocial.forEach(s => { if (s.category) socialCounts[s.category] = (socialCounts[s.category] || 0) + 1; });

  const acuteCounts: Record<string, number> = {};
  weekAcute.forEach(s => { if (s.symptom) acuteCounts[s.symptom] = (acuteCounts[s.symptom] || 0) + 1; });

  const allTimeCriticCounts: Record<string, number> = {};
  criticSessions.forEach(s => { if (s.voice) allTimeCriticCounts[s.voice] = (allTimeCriticCounts[s.voice] || 0) + 1; });
  const topCriticVoice = Object.entries(allTimeCriticCounts).sort((a, b) => b[1] - a[1])[0];

  const moduleUsage = [
    { label: "Akutt regulering", count: acuteSessions.length, color: "#2D4A3E" },
    { label: "Sosiale situasjoner", count: socialSessions.length, color: "#9B6B8A" },
    { label: "Indre kritiker", count: criticSessions.length, color: "#7A5A3A" },
  ].sort((a, b) => b.count - a.count);
  const topModule = moduleUsage[0];

  const allTimeMoodCounts = checkins.reduce<Record<string, number>>((acc, c) => {
    acc[c.mood] = (acc[c.mood] || 0) + 1; return acc;
  }, {});

  // ── Adaptive reflection period ───────────────────────────
  const filterByDate = <T extends { ts?: string }>(items: T[], from: Date): T[] =>
    items.filter(e => e.ts && new Date(e.ts) >= from);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const r7Acute = filterByDate(acuteSessions, sevenDaysAgo);
  const r7Social = filterByDate(socialSessions, sevenDaysAgo);
  const r7Critic = filterByDate(criticSessions, sevenDaysAgo);
  const r7Checkins = filterByDate(checkins, sevenDaysAgo);
  const r7Evenings = filterByDate(eveningEvals, sevenDaysAgo);
  const useWeekPeriod = (r7Acute.length + r7Social.length + r7Critic.length) >= 3 || r7Checkins.length >= 5;

  const r30Acute = filterByDate(acuteSessions, thirtyDaysAgo);
  const r30Social = filterByDate(socialSessions, thirtyDaysAgo);
  const r30Critic = filterByDate(criticSessions, thirtyDaysAgo);
  const r30Checkins = filterByDate(checkins, thirtyDaysAgo);
  const r30Evenings = filterByDate(eveningEvals, thirtyDaysAgo);
  const useMonthPeriod = !useWeekPeriod && ((r30Acute.length + r30Social.length + r30Critic.length) >= 3 || r30Checkins.length >= 5);

  const adaptivePeriod: "uke" | "måned" | null = useWeekPeriod ? "uke" : useMonthPeriod ? "måned" : null;
  const adAcute = useWeekPeriod ? r7Acute : r30Acute;
  const adSocial = useWeekPeriod ? r7Social : r30Social;
  const adCritic = useWeekPeriod ? r7Critic : r30Critic;
  const adCheckins = useWeekPeriod ? r7Checkins : r30Checkins;
  const adEvenings = useWeekPeriod ? r7Evenings : r30Evenings;

  const buildAdaptiveContext = (): string => {
    const parts: string[] = [];
    if (adAcute.length > 0) {
      const symptoms = [...new Set(adAcute.map(s => s.symptom).filter(Boolean))];
      parts.push(`Akutt regulering: ${adAcute.length} gang${adAcute.length > 1 ? "er" : ""}${symptoms.length ? ". Triggere: " + symptoms.join(", ") : ""}`);
    }
    if (adSocial.length > 0) {
      const cats = [...new Set(adSocial.map(s => s.category).filter(Boolean))];
      parts.push(`Sosiale situasjoner: ${adSocial.length} økt${adSocial.length > 1 ? "er" : ""}${cats.length ? ". Kategorier: " + cats.join(", ") : ""}`);
    }
    if (adCritic.length > 0) {
      const voices = [...new Set(adCritic.map(s => s.voice).filter(Boolean))];
      parts.push(`Indre kritiker: ${adCritic.length} økt${adCritic.length > 1 ? "er" : ""}${voices.length ? ". Stemmer: " + voices.join(", ") : ""}`);
    }
    if (adCheckins.length > 0) {
      const moodMap: Record<string, number> = {};
      adCheckins.forEach(c => { moodMap[c.mood] = (moodMap[c.mood] || 0) + 1; });
      const topM = Object.entries(moodMap).sort((a, b) => b[1] - a[1])[0];
      parts.push(`${adCheckins.length} innsjekker. Vanligste stemning: ${topM?.[0] || "ukjent"}`);
    }
    const q4s = adEvenings.filter(e => e.q4).map(e => e.q4);
    if (q4s.length > 0) parts.push(`Kveldstanker (energi/ro): ${q4s.join(" / ")}`);
    return parts.join("\n");
  };

  // ── Rule-based pattern observations ─────────────────────
  const totalSessions = acuteSessions.length + socialSessions.length + criticSessions.length;
  const patternObservations: string[] = [];
  if (totalSessions >= 3) {
    if (acuteSessions.length > 2 && socialSessions.length > 2)
      patternObservations.push("Du bruker ofte akutt-modulen og jobber med sosiale situasjoner — disse henger gjerne sammen.");
    if (topCriticVoice && topCriticVoice[1] > 2)
      patternObservations.push(`Stemmen du oftest møter er: "${topCriticVoice[0]}". Den kommer tilbake — det betyr at den bærer på noe viktig.`);
  }

  useEffect(() => {
    checkIsPlus().then(setIsPlus);
    loadPortrait();
  }, []);

  const loadPortrait = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("identity_portrait")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false });
    if (data) setPortrait(data);
  };

  const generateSummary = async () => {
    if (portrait.length === 0) return;
    setSummaryLoading(true);
    const context = portrait.map((e, i) =>
      `Økt ${i + 1} (${new Date(e.session_date).toLocaleDateString("nb-NO")}):\n${e.ai_insight}`
    ).join("\n\n");
    const result = await getReflection(
      context,
      "Du er en varm støtteperson som leser gjennom flere identitetsøkter fra samme person over tid. Oppsummer de viktigste mønstrene du ser — hva går igjen, hva ser ut til å være kjernen i denne personen? Skriv et kort, varmt og presist portrett på 4-6 setninger. Ikke analyser, men beskriv hva du hører. Skriv på norsk."
    );
    setSummary(result);
    setSummaryLoading(false);
  };

  const handleShare = async () => {
    const lines: string[] = [
      `Ro & Retning — uke ${getWeekLabel(activeWeek)}`,
      "",
      `Innsjekker: ${weekCheckins.length}${topMoodMeta ? ` (vanligste stemning: ${topMoodMeta.emoji} ${topMoodMeta.label})` : ""}`,
    ];
    if (avgEnergy) lines.push(`Snittenergsnivå: ${avgEnergy}/10`);
    if (weekAcute.length > 0) lines.push(`Akutt regulering brukt: ${weekAcute.length} gang${weekAcute.length > 1 ? "er" : ""}`);
    if (weekSocial.length > 0) lines.push(`Sosiale situasjoner: ${weekSocial.length} gang${weekSocial.length > 1 ? "er" : ""}`);
    if (weekCritic.length > 0) lines.push(`Indre kritiker: ${weekCritic.length} gang${weekCritic.length > 1 ? "er" : ""}`);
    const q4entries = weekEvenings.filter(e => e.q4);
    if (q4entries.length > 0) {
      lines.push("", "Kveldstanker (energi/ro):");
      q4entries.forEach(e => lines.push(`• ${e.date}: ${e.q4}`));
    }
    const text = lines.join("\n");
    if (navigator.share) {
      await navigator.share({ title: "Min uke — Ro & Retning", text });
    } else {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    }
  };

  const handleDialogAsk = async () => {
    if (!dialogQuestion.trim()) return;
    setDialogLoading(true);
    setDialogAnswer(null);
    const portraitContext = portrait.map((e, i) =>
      `Økt ${i + 1} (${new Date(e.session_date).toLocaleDateString("nb-NO")}):\n${e.questions?.map((q, j) => `Q: ${q}\nA: ${e.answers?.[j] || ""}`).join("\n") || e.ai_insight}`
    ).join("\n\n");
    const result = await getReflection(
      `${portraitContext}\n\nBrukerens spørsmål: "${dialogQuestion}"`,
      "Du er en varm, nysgjerrig samtalepartner som har lest denne personens identitetsøkter over tid. Svar på spørsmålet deres på en måte som er personlig, varm og ikke-analyserende. Ikke gi råd. Ikke diagnostiser. Bare svar som en klok venn som har fulgt med. Skriv på norsk, 2-4 setninger."
    );
    setDialogAnswer(result);
    setDialogLoading(false);
  };

  const TABS = ["Denne uken", "Portrett"];

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "hsl(var(--text))" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Dine mønstre</h1>
        <p>Det du kommer tilbake til, sier noe om deg.</p>
      </div>

      <div style={{ display: "flex", background: "hsl(var(--white))", borderBottom: "1px solid hsl(var(--surface2))" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: 1, background: "none", border: "none", padding: "13px 4px",
            fontSize: 13, fontWeight: tab === i ? 600 : 400,
            color: tab === i ? "hsl(var(--green))" : "hsl(var(--text-muted))",
            borderBottom: tab === i ? "2px solid hsl(var(--green))" : "2px solid transparent",
            cursor: "pointer", fontFamily: "'Nunito'"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {tab === 0 && (
  <div className="fade-up">

    {isPlus && adaptivePeriod && (
      <div className="ro-card fade-up" style={{ margin: "0 0 14px", borderColor: "hsla(var(--green) / 0.25)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--green))", marginBottom: 8, opacity: 0.7 }}>
          {adaptivePeriod === "uke" ? "Ukens refleksjon" : "Månedlig refleksjon"}
        </div>
        <div className="card-sub" style={{ marginBottom: 10 }}>
          Basert på din aktivitet {adaptivePeriod === "uke" ? "de siste 7 dagene" : "den siste måneden"}.
        </div>
        <ReflectionBubble
          context={buildAdaptiveContext()}
          systemPrompt="Du er en varm, oppmerksom støtteperson som har fulgt denne personen over tid. Les dataen og si noe sant og gjenkjennelig om ett mønster du legger merke til — ikke en rapport, ikke en liste, bare én eller to setninger som speiler noe tilbake. Ikke analyser. Ikke konkluder. Bare si hva du hører. Skriv på norsk."
          color="green"
          autoFetch={false}
        />
      </div>
    )}

    {patternObservations.length > 0 && (
      <div className="ro-card fade-up" style={{ margin: "0 0 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 12 }}>
          Det jeg legger merke til
        </div>
        {patternObservations.map((obs, i) => (
          <div key={i} style={{
            fontFamily: "'Lora', serif", fontStyle: "italic",
            fontSize: 13, color: "hsl(var(--text-muted))", lineHeight: 1.8,
            marginBottom: i < patternObservations.length - 1 ? 10 : 0,
          }}>
            {obs}
          </div>
        ))}
      </div>
    )}

    <div className="ro-card" style={{ margin: "0 0 14px" }}>
      <div className="card-title" style={{ marginBottom: 8 }}>Velg uke</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {availableWeeks.length === 0 ? (
          <div style={{ fontSize: 12, color: "hsl(var(--text-light))", fontStyle: "italic" }}>
            Ingen data ennå. Gjør din første innsjekk på forsiden.
          </div>
        ) : availableWeeks.map((ws, i) => (
          <div key={i} onClick={() => setSelectedWeek(ws)} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: `1.5px solid ${activeWeek.toISOString() === ws.toISOString() ? "hsl(var(--green))" : "hsl(var(--surface2))"}`,
            background: activeWeek.toISOString() === ws.toISOString() ? "hsla(var(--green) / 0.08)" : "hsl(var(--surface))",
            color: activeWeek.toISOString() === ws.toISOString() ? "hsl(var(--green))" : "hsl(var(--text-muted))",
            fontWeight: activeWeek.toISOString() === ws.toISOString() ? 600 : 400,
          }}>
            {getWeekLabel(ws)}{i === 0 ? " (siste)" : ""}
          </div>
        ))}
      </div>
    </div>

    <div className="ro-card" style={{ margin: "0 0 14px" }}>
      <div className="card-title">Uke {getWeekLabel(activeWeek)}</div>
      {weekCheckins.length === 0 ? (
        <div className="card-sub">Ingen innsjekker registrert denne uken.</div>
      ) : (
        <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14, color: "hsl(var(--text))", lineHeight: 1.8, marginTop: 8 }}>
          {weekCheckins.length === 1
            ? "Du tok deg tid til å sjekke inn denne uken. Det betyr noe."
            : `Du tok deg tid til å sjekke inn ${weekCheckins.length} ganger denne uken.`}
          {topMoodMeta && (() => {
            const label = topMoodMeta.label.toLowerCase();
            if (label === "god" || label === "rolig") return ` Du har stort sett hatt det ${label} ${topMoodMeta.emoji}`;
            if (label === "nøytral") return ` Stemningen din har vært i balanse denne uken ${topMoodMeta.emoji}`;
            if (label === "tung") return ` Det har vært litt tungt denne uken ${topMoodMeta.emoji} — det er lov.`;
            if (label === "numb") return ` Det virker som du har kjent deg litt nummen denne uken ${topMoodMeta.emoji}`;
            return ` Vanligste stemning var ${topMoodMeta.emoji} ${topMoodMeta.label}.`;
          })()}
          {avgEnergy && (() => {
            const e = parseFloat(avgEnergy);
            if (e >= 7) return " Kroppen din har hatt god energi og ro.";
            if (e >= 4) return " Kroppen din har vært i noenlunde balanse.";
            return " Det virker som kroppen din har hatt det litt tungt denne uken.";
          })()}
          {weekAcute.length > 0 && ` Du brukte akutt-modulen ${weekAcute.length > 1 ? `${weekAcute.length} ganger` : "én gang"} — bra at du tok vare på deg selv.`}
          {weekSocial.length > 0 && ` Du bearbeidet ${weekSocial.length > 1 ? `${weekSocial.length} sosiale situasjoner` : "en sosial situasjon"} denne uken.`}
          {weekCritic.length > 0 && ` Du møtte den indre kritikeren ${weekCritic.length > 1 ? `${weekCritic.length} ganger` : "én gang"} — det krever mot.`}
          {weekEvenings.length > 0 && ` Du tok deg tid til ${weekEvenings.length > 1 ? `${weekEvenings.length} kveldsstunder` : "en kveldsstund"} med deg selv.`}
        </div>
      )}
      {weekCheckins.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <CheckinGraph checkins={weekCheckins} />
        </div>
      )}
    </div>

    {weekCheckins.length > 0 && (
      <button
        onClick={handleShare}
        style={{
          width: "100%", marginBottom: 14, padding: "13px 16px",
          background: shareStatus === "copied" ? "hsla(var(--green) / 0.08)" : "hsl(var(--surface))",
          border: `1.5px solid ${shareStatus === "copied" ? "hsl(var(--green))" : "hsl(var(--surface2))"}`,
          borderRadius: "var(--radius-sm)",
          fontFamily: "'Nunito', sans-serif", fontSize: 14,
          color: shareStatus === "copied" ? "hsl(var(--green))" : "hsl(var(--text-muted))",
          fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {shareStatus === "copied" ? "✓ Kopiert til utklippstavlen!" : "📋 Del med psykolog"}
      </button>
    )}

    {(topCriticVoice || topModule?.count > 0) && (
      <div className="ro-card" style={{ margin: "0 0 14px" }}>
        <div className="card-title">Det du kommer tilbake til</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>
          Mønstre over all tid — ikke for å analysere, men for å kjenne igjen.
        </div>
        {topModule?.count > 0 && (
          <div style={{ marginBottom: 12, padding: "12px 14px", background: "hsl(var(--surface))", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-light))", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Modul du bruker oftest</div>
            <div style={{ fontSize: 14, color: "hsl(var(--text))", fontFamily: "'Lora', serif", fontStyle: "italic" }}>
              {topModule.label}
            </div>
          </div>
        )}
        {topCriticVoice && (
          <div style={{ padding: "12px 14px", background: "hsl(var(--surface))", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-light))", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Stemmen du oftest kjenner igjen</div>
            <div style={{ fontSize: 14, color: "hsl(var(--text))", fontFamily: "'Lora', serif", fontStyle: "italic" }}>
              {topCriticVoice[0]}
            </div>
          </div>
        )}
      </div>
    )}

    {(Object.keys(criticCounts).length > 0 || Object.keys(socialCounts).length > 0) && (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {Object.keys(criticCounts).length > 0 && (
          <div className="ro-card" style={{ margin: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🔥 Kritiker</div>
            {Object.entries(criticCounts).sort((a, b) => b[1] - a[1]).map(([v, c], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "hsl(var(--text-muted))" }}>{v}</span>
                <span style={{ fontWeight: 600, color: "hsl(var(--terra))" }}>{c}x</span>
              </div>
            ))}
          </div>
        )}
        {Object.keys(socialCounts).length > 0 && (
          <div className="ro-card" style={{ margin: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>👥 Sosialt</div>
            {Object.entries(socialCounts).sort((a, b) => b[1] - a[1]).map(([v, c], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "hsl(var(--text-muted))" }}>{v}</span>
                <span style={{ fontWeight: 600, color: "hsl(var(--terra))" }}>{c}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {Object.keys(acuteCounts).length > 0 && (
      <div className="ro-card" style={{ margin: "0 0 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>🌀 Akutte triggere</div>
        {Object.entries(acuteCounts).sort((a, b) => b[1] - a[1]).map(([symptom, count], i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>{symptom}</span>
              <span style={{ color: "hsl(var(--text-light))" }}>{count}x</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(acuteCounts))) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    )}

    {weekEvenings.length > 0 && (
      <div className="ro-card" style={{ margin: "0 0 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>🌙 Kveldstanker</div>
        {weekEvenings.map((e, i) => (
          <div key={i} style={{
            paddingBottom: i < weekEvenings.length - 1 ? 12 : 0,
            marginBottom: i < weekEvenings.length - 1 ? 12 : 0,
            borderBottom: i < weekEvenings.length - 1 ? "1px solid hsl(var(--surface2))" : "none",
          }}>
            <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginBottom: 6, fontWeight: 500 }}>{e.date}</div>
            {e.q4 && (
              <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600, color: "hsl(var(--green))" }}>Energi/ro: </span>{e.q4}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {checkins.length > 0 && (
      <div className="ro-card" style={{ margin: "0 0 14px" }}>
        <div className="card-title">Humørfordeling totalt</div>
        <div style={{ marginTop: 10 }}>
          {MOOD_META.map(m => {
            const count = allTimeMoodCounts[m.label] || 0;
            const pct = checkins.length > 0 ? Math.round((count / checkins.length) * 100) : 0;
            return (
              <div key={m.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "hsl(var(--text-muted))" }}>{m.emoji} {m.label}</span>
                  <span style={{ color: "hsl(var(--text-light))" }}>{count}x</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

  </div>
)}

        {tab === 1 && (
          <div className="fade-up">
            {portrait.length === 0 ? (
              <div className="ro-card">
                <div className="card-title">Portrettet ditt er tomt ennå</div>
                <div className="card-sub">
                  Fullfør en økt i "Hvem er du egentlig?" så begynner portrettet ditt å ta form.
                </div>
              </div>
            ) : (
              <>
                <div className="ro-card" style={{ margin: "0 0 14px", background: "rgba(58,90,42,0.04)", border: "1px solid rgba(58,90,42,0.12)" }}>
                  <div className="card-title">Ditt portrett</div>
                  <div className="card-sub" style={{ marginBottom: 16 }}>
                    Basert på {portrait.length} økt{portrait.length > 1 ? "er" : ""} — med dine egne ord.
                  </div>
                  {isPlus ? (
                    summary ? (
                      <div style={{
                        fontFamily: "'Lora', serif", fontStyle: "italic",
                        fontSize: 15, color: "hsl(var(--green))", lineHeight: 1.8,
                        padding: "16px", background: "white", borderRadius: 12, marginBottom: 12,
                      }}>
                        {summary}
                      </div>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={generateSummary}
                        disabled={summaryLoading}
                        style={{ opacity: summaryLoading ? 0.7 : 1 }}
                      >
                        {summaryLoading ? "Genererer portrett..." : "🌿 Generer levende portrett"}
                      </button>
                    )
                  ) : (
                    <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", fontStyle: "italic", lineHeight: 1.6 }}>
                      Plus-medlemmer får et AI-generert sammendrag av hvem de er på tvers av alle øktene.
                    </div>
                  )}
                </div>

                {portrait.map(entry => (
                  <div key={entry.id} className="ro-card" style={{ margin: "0 0 14px" }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "1px",
                      textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 12,
                    }}>
                      {new Date(entry.session_date).toLocaleDateString("nb-NO", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </div>
                    {entry.ai_insight && (
                      <div style={{
                        fontFamily: "'Lora', serif", fontStyle: "italic",
                        fontSize: 14, color: "hsl(var(--green))", lineHeight: 1.7,
                        paddingLeft: 12, borderLeft: "3px solid hsl(var(--green))",
                      }}>
                        {entry.ai_insight}
                      </div>
                    )}
                  </div>
                ))}

                {isPlus && (
                  <div className="ro-card" style={{ margin: "0 0 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 8 }}>
                      Spør om det du har oppdaget
                    </div>
                    <textarea
                      className="ro-textarea"
                      rows={2}
                      placeholder="Still ett spørsmål om det du har oppdaget om deg selv..."
                      value={dialogQuestion}
                      onChange={e => { setDialogQuestion(e.target.value); setDialogAnswer(null); }}
                      style={{ marginBottom: 10 }}
                    />
                    <button
                      className="btn-primary"
                      onClick={handleDialogAsk}
                      disabled={dialogLoading || dialogQuestion.trim().length < 5}
                      style={{ opacity: dialogLoading || dialogQuestion.trim().length < 5 ? 0.5 : 1 }}
                    >
                      {dialogLoading ? "Tenker..." : "Spør"}
                    </button>
                    {dialogAnswer && (
                      <div style={{
                        marginTop: 14,
                        background: "hsla(var(--green) / 0.04)",
                        borderLeft: "3px solid hsl(var(--green))",
                        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                        padding: "16px 18px",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--green))", marginBottom: 8, opacity: 0.7 }}>
                          🌿 Refleksjon
                        </div>
                        <div style={{
                          fontFamily: "'Lora', serif", fontStyle: "italic",
                          fontSize: 14, color: "hsl(var(--text))", lineHeight: 1.8,
                        }}>
                          {dialogAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}