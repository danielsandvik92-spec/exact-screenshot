import { useState, useEffect } from "react";
import { MOOD_META } from "@/lib/data";
import { CheckinGraph } from "@/components/CheckinGraph";
import type { AppDB, EveningEvalEntry } from "@/lib/types";
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
  return (items || []).filter(e => { if (!e.ts) return false; const d = new Date(e.ts); return d >= weekStart && d < end; });
}

interface PatternsScreenProps {
  onBack: () => void;
  db: AppDB;
  addEveningEval: (entry: EveningEvalEntry) => Promise<void>;
}

interface PortraitEntry {
  id: string;
  session_date: string;
  questions: string[];
  answers: string[];
  ai_insight: string;
}

export function PatternsScreen({ onBack, db, addEveningEval }: PatternsScreenProps) {
  const [tab, setTab] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [q1, setQ1] = useState(""); const [q2, setQ2] = useState(""); const [q3, setQ3] = useState("");
  const [eveningSaved, setEveningSaved] = useState(false);
  const [portrait, setPortrait] = useState<PortraitEntry[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isPlus, setIsPlus] = useState(false);

  const checkins = db?.checkins || [];
  const eveningEvals = db?.eveningEvals || [];
  const criticSessions = db?.criticSessions || [];
  const socialSessions = db?.socialSessions || [];
  const acuteSessions = db?.acuteSessions || [];

  const allSessions = [...checkins, ...eveningEvals, ...acuteSessions, ...socialSessions, ...criticSessions];
  const availableWeeks = getAvailableWeeks(allSessions);
  const activeWeek = selectedWeek || (availableWeeks.length > 0 ? availableWeeks[0] : getWeekStart(new Date()));
  const weekCheckins = filterByWeek(checkins, activeWeek);
  const weekEvenings = filterByWeek(eveningEvals, activeWeek);
  const weekCritic = filterByWeek(criticSessions, activeWeek);
  const weekSocial = filterByWeek(socialSessions, activeWeek);
  const weekAcute = filterByWeek(acuteSessions, activeWeek);

  const acuteCounts: Record<string, number> = {};
  weekAcute.forEach(s => { if (s.symptom) acuteCounts[s.symptom] = (acuteCounts[s.symptom] || 0) + 1; });

  const avgEnergy = weekCheckins.length > 0 ? (weekCheckins.reduce((a, b) => a + b.energy, 0) / weekCheckins.length).toFixed(1) : null;
  const moodCounts = weekCheckins.reduce<Record<string, number>>((acc, c) => { acc[c.mood] = (acc[c.mood] || 0) + 1; return acc; }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const topMoodMeta = topMood ? MOOD_META.find(m => m.label === topMood[0]) : null;

  const criticCounts: Record<string, number> = {};
  weekCritic.forEach(s => { if (s.voice) criticCounts[s.voice] = (criticCounts[s.voice] || 0) + 1; });
  const socialCounts: Record<string, number> = {};
  weekSocial.forEach(s => { if (s.category) socialCounts[s.category] = (socialCounts[s.category] || 0) + 1; });

  const allTimeMoodCounts = checkins.reduce<Record<string, number>>((acc, c) => { acc[c.mood] = (acc[c.mood] || 0) + 1; return acc; }, {});
  const allTimeAvg = checkins.length > 0 ? (checkins.reduce((a, b) => a + b.energy, 0) / checkins.length).toFixed(1) : null;

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
      "Du er en varm psykolog som leser gjennom flere identitetsøkter fra samme person over tid. Oppsummer de viktigste mønstrene du ser på tvers av øktene — hva går igjen, hva ser ut til å være kjernen i denne personen? Skriv et kort, varmt og presist portrett på 4-6 setninger. Ikke analyser, men beskriv hva du hører. Skriv på norsk."
    );
    setSummary(result);
    setSummaryLoading(false);
  };

  const saveEvening = async () => {
    const now = new Date();
    const entry: EveningEvalEntry = { date: `${now.getDate()}/${now.getMonth() + 1}`, q1, q2, q3, ts: now.toISOString() };
    await addEveningEval(entry);
    setEveningSaved(true);
    setQ1(""); setQ2(""); setQ3("");
  };

  const TABS = ["Ukesrapport", "Alle data", "Identitet", "Kveld"];

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "hsl(var(--text))" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Dine mønstre</h1>
        <p>Se mønstre, følg utvikling, del med psykolog.</p>
      </div>

      <div style={{ display: "flex", background: "hsl(var(--white))", borderBottom: "1px solid hsl(var(--surface2))" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, background: "none", border: "none", padding: "13px 4px", fontSize: 12, fontWeight: tab === i ? 600 : 400, color: tab === i ? "hsl(var(--green))" : "hsl(var(--text-muted))", borderBottom: tab === i ? "2px solid hsl(var(--green))" : "2px solid transparent", cursor: "pointer", fontFamily: "'Nunito'" }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {tab === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Velg uke</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {availableWeeks.length === 0 ? (
                  <div style={{ fontSize: 12, color: "hsl(var(--text-light))", fontStyle: "italic" }}>Ingen data ennå. Gjør din første innsjekk på Hjem-siden.</div>
                ) : availableWeeks.map((ws, i) => (
                  <div key={i}
                    onClick={() => setSelectedWeek(ws)}
                    style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
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
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {[
                  { val: avgEnergy || "–", label: "Snitt regulering" },
                  { val: weekCheckins.length, label: "Innsjekker" },
                  { val: topMoodMeta ? topMoodMeta.emoji : "–", label: "Vanligste humør" },
                  { val: weekEvenings.length, label: "Kveldseval." },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, background: "hsl(var(--surface))", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "hsl(var(--green))" }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: "hsl(var(--text-light))", marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {weekCheckins.length > 0 && (
              <div className="ro-card" style={{ margin: "0 0 14px" }}>
                <div className="card-title">Regulering dag for dag</div>
                <div style={{ marginTop: 10 }}><CheckinGraph checkins={weekCheckins} /></div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <div className="ro-card" style={{ marginRight: 0, borderRadius: "var(--radius) 0 0 var(--radius)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🔥 Indre kritiker</div>
                {Object.keys(criticCounts).length > 0 ? Object.entries(criticCounts).sort((a, b) => b[1] - a[1]).map(([v, c], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: "hsl(var(--text-muted))", marginRight: 4 }}>{v}</span>
                    <span style={{ fontWeight: 600, color: "hsl(var(--terra))" }}>{c}x</span>
                  </div>
                )) : <div style={{ fontSize: 11, color: "hsl(var(--text-light))", fontStyle: "italic" }}>Ingen</div>}
              </div>
              <div className="ro-card" style={{ marginLeft: 4, borderRadius: "0 var(--radius) var(--radius) 0" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>👥 Sosial reaksjon</div>
                {Object.keys(socialCounts).length > 0 ? Object.entries(socialCounts).sort((a, b) => b[1] - a[1]).map(([v, c], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: "hsl(var(--text-muted))", marginRight: 4 }}>{v}</span>
                    <span style={{ fontWeight: 600, color: "hsl(var(--terra))" }}>{c}x</span>
                  </div>
                )) : <div style={{ fontSize: 11, color: "hsl(var(--text-light))", fontStyle: "italic" }}>Ingen</div>}
              </div>
            </div>

            {Object.keys(acuteCounts).length > 0 && (
              <div className="ro-card" style={{ margin: "14px 0" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>🌀 Akutte triggere denne uken</div>
                {Object.entries(acuteCounts).sort((a, b) => b[1] - a[1]).map(([symptom, count], i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{symptom}</span>
                      <span style={{ color: "hsl(var(--text-light))" }}>{count}x</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(acuteCounts))) * 100)}%`, background: "hsl(var(--green-light))" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {weekEvenings.length > 0 && (
              <div className="ro-card" style={{ margin: "0 0 14px" }}>
                <div className="card-title">Kveldsevalueringer</div>
                {weekEvenings.map((e, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: i < weekEvenings.length - 1 ? "1px solid hsl(var(--surface2))" : "none" }}>
                    <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginBottom: 5, fontWeight: 500 }}>{e.date}</div>
                    {e.q1 && <div style={{ fontSize: 12, marginBottom: 3 }}><span style={{ color: "hsl(var(--green))", fontWeight: 500 }}>Mest ekte: </span>{e.q1}</div>}
                    {e.q2 && <div style={{ fontSize: 12, marginBottom: 3 }}><span style={{ color: "hsl(var(--terra))", fontWeight: 500 }}>Trigget av: </span>{e.q2}</div>}
                    {e.q3 && <div style={{ fontSize: 12, fontStyle: "italic", color: "hsl(var(--green))" }}>"{e.q3}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">All-time oversikt</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, background: "hsl(var(--surface))", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "hsl(var(--green))" }}>{allTimeAvg || "–"}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginTop: 2 }}>Snitt alle dager</div>
                </div>
                <div style={{ flex: 1, background: "hsl(var(--surface))", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "hsl(var(--green))" }}>{checkins.length}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginTop: 2 }}>Totale innsjekker</div>
                </div>
                <div style={{ flex: 1, background: "hsl(var(--surface))", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: "hsl(var(--green))" }}>{eveningEvals.length}</div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginTop: 2 }}>Kveldsevalueringer</div>
                </div>
              </div>
            </div>

            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Alle innsjekker</div>
              <div style={{ marginTop: 10 }}><CheckinGraph checkins={checkins} /></div>
            </div>

            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Humørfordeling totalt</div>
              <div style={{ marginTop: 10 }}>
                {MOOD_META.map(m => {
                  const count = allTimeMoodCounts[m.label] || 0;
                  const pct = checkins.length > 0 ? Math.round((count / checkins.length) * 100) : 0;
                  return (
                    <div key={m.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>{m.emoji} {m.label}</span>
                        <span style={{ color: "hsl(var(--text-light))" }}>{count}x ({pct}%)</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: m.color }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 2 && (
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
                <div className="ro-card" style={{ margin: "0 0 14px", background: "rgba(58,90,42,0.05)", border: "1px solid rgba(58,90,42,0.15)" }}>
                  <div className="card-title">Ditt identitetsportrett</div>
                  <div className="card-sub" style={{ marginBottom: 16 }}>
                    Basert på {portrait.length} økt{portrait.length > 1 ? "er" : ""} — med dine egne ord.
                  </div>

                  {isPlus ? (
                    <>
                      {summary ? (
                        <div style={{
                          fontFamily: "'Lora', serif",
                          fontStyle: "italic",
                          fontSize: 15,
                          color: "hsl(var(--green))",
                          lineHeight: 1.8,
                          padding: "16px",
                          background: "white",
                          borderRadius: 12,
                          marginBottom: 12,
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
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", fontStyle: "italic" }}>
                      Oppgrader til Plus for å få et AI-generert sammendrag av hvem du er på tvers av alle øktene.
                    </div>
                  )}
                </div>

                {portrait.map((entry) => (
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
                        fontFamily: "'Lora', serif",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "hsl(var(--green))",
                        lineHeight: 1.7,
                        marginBottom: 12,
                        paddingLeft: 12,
                        borderLeft: "3px solid hsl(var(--green))",
                      }}>
                        {entry.ai_insight}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 3 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Kveldsevaluering</div>
              <div className="card-sub">Tre enkle spørsmål fra dagen.</div>
              {!eveningSaved ? (
                <div style={{ marginTop: 10 }}>
                  {[
                    { q: "Når følte jeg meg mest ekte i dag?", val: q1, set: setQ1 },
                    { q: "Når ble jeg mest trigget?", val: q2, set: setQ2 },
                    { q: "Hva ville jeg sagt til meg selv nå hvis jeg var trygg?", val: q3, set: setQ3 },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 13, color: "hsl(var(--green))", marginBottom: 5 }}>{item.q}</div>
                      <textarea className="ro-textarea" rows={2} placeholder="Skriv her..." value={item.val} onChange={e => item.set(e.target.value)} />
                    </div>
                  ))}
                  <button className="btn-secondary" style={{ marginTop: 4 }} onClick={saveEvening}>Lagre kveldsevaluering</button>
                </div>
              ) : (
                <div className="fade-up reframe-box" style={{ marginTop: 12 }}>Lagret. Godt gjort — du tar vare på deg selv. 🌿</div>
              )}
            </div>

            {eveningEvals.length > 0 && (
              <div className="ro-card" style={{ margin: 0 }}>
                <div className="card-title">Tidligere evalueringer</div>
                {[...eveningEvals].reverse().slice(0, 5).map((e, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: i < Math.min(4, eveningEvals.length - 1) ? "1px solid hsl(var(--surface2))" : "none" }}>
                    <div style={{ fontSize: 10, color: "hsl(var(--text-light))", marginBottom: 5, fontWeight: 500 }}>{e.date}</div>
                    {e.q1 && <div style={{ fontSize: 12, marginBottom: 3, color: "hsl(var(--text-muted))" }}>{e.q1}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}