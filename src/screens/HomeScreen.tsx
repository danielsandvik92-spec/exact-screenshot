import { DeleteAccountSection } from "@/components/DeleteAccountSection";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOOD_META } from "@/lib/data";
import { CheckinGraph } from "@/components/CheckinGraph";
import type { AppDB, CheckinEntry, EveningEvalEntry, ScreenId } from "@/lib/types";

interface HomeScreenProps {
  onNav: (screen: ScreenId) => void;
  db: AppDB;
  addCheckin: (entry: CheckinEntry) => Promise<void>;
  addEveningEval: (entry: EveningEvalEntry) => Promise<void>;
}

export function HomeScreen({ onNav, db, addCheckin, addEveningEval }: HomeScreenProps) {
  const navigate = useNavigate();
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

const [eq1, setEq1] = useState("");
const [eq2, setEq2] = useState("");
const [eq3, setEq3] = useState("");
const [eq4, setEq4] = useState("");
  const [eveningSaved, setEveningSaved] = useState(false);
  const [showEvening, setShowEvening] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTime, setReminderTime] = useState<string | null>(() => localStorage.getItem("rr-reminder-time"));
  const [reminderSet, setReminderSet] = useState(false);

  const checkins = db?.checkins || [];
  const eveningEvals = db?.eveningEvals || [];

  const today = new Date().toDateString();
  const checkinDoneToday = checkins.some(c => new Date(c.ts).toDateString() === today);
  const eveningDoneToday = eveningEvals.some(e => new Date(e.ts).toDateString() === today);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "God morgen" : hour < 18 ? "God ettermiddag" : "God kveld";

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toDateString();
  });
  const checkinDays = new Set(checkins.map(c => new Date(c.ts).toDateString()));
  const activeDaysThisWeek = last7Days.filter(d => checkinDays.has(d)).length;

  const scheduleReminder = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const target = new Date(); target.setHours(h, m, 0, 0);
    const ms = target.getTime() - Date.now();
    if (ms > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Ro & Retning 🌿", {
            body: "Ta tre minutter til deg selv i kveld. Kveldstankene venter.",
          });
        }
      }, ms);
    }
  };

  const handleSetReminder = async (time: string) => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    localStorage.setItem("rr-reminder-time", time);
    setReminderTime(time);
    scheduleReminder(time);
    setReminderSet(true);
    setShowReminderModal(false);
  };

  useEffect(() => {
    const seen = localStorage.getItem("rr-onboarding-seen");
    if (!seen) {
      const timeout = setTimeout(() => setShowOnboarding(true), 1200);
      return () => clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("rr-reminder-time");
    if (saved) scheduleReminder(saved);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("rr-onboarding-seen", "true");
    setShowOnboarding(false);
  };

  const save = async () => {
    if (!mood || energy === null) return;
    const now = new Date();
    const entry: CheckinEntry = {
      mood, energy,
      date: `${now.getDate()}/${now.getMonth() + 1}`,
      ts: now.toISOString()
    };
    await addCheckin(entry);
    setSaved(true);
  };

  const saveEvening = async () => {
  const now = new Date();
  const entry: EveningEvalEntry = {
    date: `${now.getDate()}/${now.getMonth() + 1}`,
    q1: eq1, q2: eq2, q3: eq3, q4: eq4,
    ts: now.toISOString()
  };
  await addEveningEval(entry);
  setEveningSaved(true);
};

  const supportModules = [
    { icon: "🌬️", title: "Akutt regulering", nav: "acute" as ScreenId, color: "#2D4A3E" },
    { icon: "👥", title: "Etter sosiale situasjoner", nav: "social" as ScreenId, color: "#9B6B8A" },
    { icon: "🔥", title: "Når du er hard mot deg selv", nav: "critic" as ScreenId, color: "#7A5A3A" },
    { icon: "💙", title: "Når relasjoner er vanskelige", nav: "relation" as ScreenId, color: "#3A5A7A" },
    { icon: "🌱", title: "Hvem er du egentlig?", nav: "identity" as ScreenId, color: "#4A6A3A" },
    { icon: "🫧", title: "Kjenn etter", nav: "emotion" as ScreenId, color: "#4A3A6A" },
  ];

  const wellnessModules = [
    { icon: "🌸", title: "Takknemlighet", nav: "gratitude" as ScreenId, color: "#4A6A3A", active: true },
    { icon: "🤗", title: "Vær snill mot deg selv", nav: "compassion" as ScreenId, color: "#9B6B8A", active: true },
    { icon: "🌞", title: "Forstå det gode", nav: null, color: "#7A6A3A", active: false },
    { icon: "⭐", title: "Hva du er god på", nav: null, color: "#3A5A7A", active: false },
  ];

  return (
    <div className="fade-up">

{/* ── Onboarding popup ─────────────────────────────────── */}
{showOnboarding && (
  <div style={{
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 24px",
  }}>
    <div style={{
      background: "hsl(var(--white))",
      borderRadius: "var(--radius)",
      padding: "32px 24px 40px",
      width: "100%", maxWidth: 390,
      animation: "fadeUp 0.3s ease forwards",
    }}>
      <div style={{
        fontFamily: "'Lora', serif",
        fontSize: 22,
        color: "hsl(var(--green))",
        marginBottom: 12,
        lineHeight: 1.3,
      }}>
        Velkommen til Ro & Retning 🌿
      </div>
      <div style={{
        fontSize: 14,
        color: "hsl(var(--text-muted))",
        lineHeight: 1.8,
        marginBottom: 20,
      }}>
        Et stille sted å kjenne etter, bearbeide og finne tilbake til deg selv.
        <br /><br />
        Alle moduler er gratis å bruke. Med Plus får du AI-refleksjon etter hver økt — en personlig, varm tilbakemelding basert på det du har delt.
      </div>
      <button className="btn-primary" onClick={dismissOnboarding}>
        Kom i gang
      </button>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button
          onClick={() => { dismissOnboarding(); navigate("/betaling"); }}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13, color: "#9B6B8A",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Nysgjerrig på Plus? Se hva du får →
        </button>
      </div>
    </div>
  </div>
)}

      {/* ── Reminder modal ───────────────────────────────────── */}
      {showReminderModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px",
        }}>
          <div style={{
            background: "hsl(var(--white))", borderRadius: "var(--radius)",
            padding: "28px 24px 32px", width: "100%", maxWidth: 360,
            animation: "fadeUp 0.25s ease forwards",
          }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "hsl(var(--green))", marginBottom: 8 }}>
              🔔 Kveldspåminnelse
            </div>
            <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 20, lineHeight: 1.6 }}>
              Velg tidspunkt for daglig påminnelse. Krever at appen er åpen.
              {reminderTime && ` Nåværende: ${reminderTime}.`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["18:00", "19:00", "20:00", "21:00", "22:00"].map(t => (
                <button
                  key={t}
                  onClick={() => handleSetReminder(t)}
                  style={{
                    padding: "13px 16px",
                    background: reminderTime === t ? "hsla(var(--green) / 0.08)" : "hsl(var(--surface))",
                    border: `1.5px solid ${reminderTime === t ? "hsl(var(--green))" : "hsl(var(--surface2))"}`,
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "'Nunito', sans-serif", fontSize: 15,
                    color: reminderTime === t ? "hsl(var(--green))" : "hsl(var(--text))",
                    fontWeight: reminderTime === t ? 600 : 400,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {reminderTime === t ? "✓ " : ""}{t}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReminderModal(false)}
              style={{
                marginTop: 16, background: "none", border: "none",
                fontFamily: "'Nunito', sans-serif", fontSize: 13,
                color: "hsl(var(--text-light))", cursor: "pointer", width: "100%",
              }}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ padding: "52px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 26, color: "hsl(var(--green))", lineHeight: 1.2 }}>Ro & Retning</div>
            <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginTop: 2, fontWeight: 400 }}>{greeting}. Hva trenger du akkurat nå?</div>
            {activeDaysThisWeek > 0 && (
              <div style={{ fontSize: 12, color: "hsl(var(--text-light))", marginTop: 5 }}>
                🌿 {activeDaysThisWeek} dag{activeDaysThisWeek > 1 ? "er" : ""} aktiv denne uken
              </div>
            )}
          </div>
          <div style={{ width: 40, height: 40, background: "hsl(var(--green))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
        </div>
      </div>

      {/* ── Daglig innsjekk ───────────────────────────────────── */}
      <div style={{ padding: "0 16px 12px" }}>
        <div className="ro-card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Daglig innsjekk</div>
            {checkins.length > 0 && (
              <button
                onClick={() => setShowGraph(s => !s)}
                style={{ background: "none", border: "none", fontSize: 12, color: "hsl(var(--green))", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                {showGraph ? "Skjul graf" : `Se utvikling (${checkins.length})`}
              </button>
            )}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>Ta ett minutt til deg selv.</div>
          {showGraph && (
            <div className="fade-up" style={{ marginTop: 14 }}>
              <CheckinGraph checkins={checkins} />
              <div className="divider" />
            </div>
          )}
          {checkinDoneToday && !saved ? (
            <div className="fade-up reframe-box" style={{ marginTop: 12 }}>
              Gjort for i dag. Ta vare på deg selv. 🌿
            </div>
          ) : !saved ? (
            <>
              <div className="checkin-row" style={{ marginTop: 14 }}>
                {MOOD_META.map(m => (
                  <div
                    key={m.label}
                    className={`checkin-item ${mood === m.label ? "selected" : ""}`}
                    onClick={() => setMood(m.label)}
                  >
                    <div className="checkin-emoji">{m.emoji}</div>
                    <div className="checkin-label">{m.label}</div>
                  </div>
                ))}
              </div>
              {mood && (
                <div className="fade-up" style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 6 }}>Hvor rolig er kroppen og sinnet ditt akkurat nå? (0–10)</div>
                  <div className="scale-row">
                    {[...Array(11)].map((_, i) => (
                      <div
                        key={i}
                        className={`scale-dot ${energy === i ? (i > 6 ? "active" : "active-high") : ""}`}
                        onClick={() => setEnergy(i)}
                        style={{ fontSize: 10 }}
                      >{i}</div>
                    ))}
                  </div>
                </div>
              )}
              {mood && energy !== null && (
                <div className="fade-up" style={{ marginTop: 14 }}>
                  <button className="btn-primary" onClick={save}>Lagre innsjekk</button>
                </div>
              )}
            </>
          ) : (
            <div className="fade-up reframe-box" style={{ marginTop: 12 }}>
              Lagret. Ta vare på deg selv i dag. 🌿
            </div>
          )}
        </div>
      </div>

      {/* ── Kveldstanker ─────────────────────────────────────── */}
      <div style={{ padding: "0 16px 12px" }}>
        <div className="ro-card" style={{ margin: 0, borderColor: "hsla(var(--sand) / 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-title" style={{ marginBottom: 0, color: "hsl(var(--text))", fontSize: 15 }}>
              Kveldstanker
            </div>
            {!eveningDoneToday && !eveningSaved && (
              <button
                onClick={() => setShowEvening(s => !s)}
                style={{ background: "none", border: "none", fontSize: 12, color: "hsl(var(--text-muted))", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                {showEvening ? "Skjul" : "Åpne"}
              </button>
            )}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>Tre minutter før du legger deg.</div>
          {eveningDoneToday && !eveningSaved ? (
            <div className="fade-up reframe-box" style={{ marginTop: 12 }}>
              Gjort for i kveld. Godt gjort. 🌿
            </div>
          ) : eveningSaved ? (
            <div className="fade-up reframe-box" style={{ marginTop: 12 }}>
              Lagret. Godt gjort — du tar vare på deg selv. 🌿
            </div>
          ) : showEvening ? (
            <div className="fade-up" style={{ marginTop: 14 }}>
              {[
  { q: "Når følte jeg meg mest ekte i dag?", val: eq1, set: setEq1 },
  { q: "Når ble jeg mest trigget?", val: eq2, set: setEq2 },
  { q: "Hva ville jeg sagt til meg selv nå hvis jeg var trygg?", val: eq3, set: setEq3 },
  { q: "Hva ga meg energi eller ro i dag — stort eller lite?", val: eq4, set: setEq4 },
].map((item, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "'Lora', serif", fontStyle: "italic",
                    fontSize: 13, color: "hsl(var(--green))", marginBottom: 5
                  }}>
                    {item.q}
                  </div>
                  <textarea
                    className="ro-textarea"
                    rows={2}
                    placeholder="Skriv her..."
                    value={item.val}
                    onChange={e => item.set(e.target.value)}
                  />
                </div>
              ))}
              <button className="btn-secondary" style={{ marginTop: 4 }} onClick={saveEvening}>
                Lagre kveldstanker
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Moduler: støtte ─────────────────────────────────── */}
      <div className="section-label">Når du trenger støtte</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 4px" }}>
        {supportModules.map(m => (
          <div
            key={m.nav}
            onClick={() => onNav(m.nav)}
            style={{
              background: "hsl(var(--white))",
              border: "1px solid hsl(var(--surface2))",
              borderRadius: 14,
              padding: "14px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              cursor: "pointer", textAlign: "center",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {m.icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text))", lineHeight: 1.4 }}>{m.title}</div>
          </div>
        ))}
      </div>

      {/* ── Moduler: det gode ────────────────────────────────── */}
      <div className="section-label">Når du vil kjenne etter det gode</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px 4px" }}>
        {wellnessModules.map(m => (
          <div
            key={m.title}
            onClick={() => m.active && m.nav && onNav(m.nav)}
            style={{
              position: "relative",
              background: "hsl(var(--white))",
              border: "1px solid hsl(var(--surface2))",
              borderRadius: 14,
              padding: "14px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              cursor: m.active ? "pointer" : "default",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: m.active ? 1 : 0.5 }}>
              {m.icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text))", lineHeight: 1.4, opacity: m.active ? 1 : 0.5 }}>{m.title}</div>
            {!m.active && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                paddingBottom: 8,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "hsl(var(--text-light))", background: "hsl(var(--surface))", borderRadius: 20, padding: "2px 8px", letterSpacing: "0.5px" }}>
                  Kommer snart
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Info-rad ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 20,
        padding: "20px 24px 32px", flexWrap: "wrap",
      }}>
        <button
          onClick={() => navigate("/bakgrunn")}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: "hsl(var(--text-light))", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}
        >
          📖 Om appen
        </button>
        <button
          onClick={() => setShowReminderModal(true)}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: reminderSet || reminderTime ? "hsl(var(--green))" : "hsl(var(--text-light))",
            cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}
        >
          🔔 Kveldspåminnelse{reminderTime ? ` (${reminderTime})` : ""}
        </button>
        <button
          onClick={() => navigate("/betaling")}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: "#9B6B8A", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
            fontWeight: 600,
          }}
        >
          ⭐ Plus
        </button>
      </div>

    </div>
  );
}
{/* ── Slett konto ─────────────────────────────────────── */}
<DeleteAccountSection />
