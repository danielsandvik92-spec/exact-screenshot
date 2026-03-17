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
  const [eveningSaved, setEveningSaved] = useState(false);
  const [showEvening, setShowEvening] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const checkins = db?.checkins || [];
  const eveningEvals = db?.eveningEvals || [];

  const today = new Date().toDateString();
  const checkinDoneToday = checkins.some(c => new Date(c.ts).toDateString() === today);
  const eveningDoneToday = eveningEvals.some(e => new Date(e.ts).toDateString() === today);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "God morgen" : hour < 18 ? "God ettermiddag" : "God kveld";

  useEffect(() => {
    const seen = localStorage.getItem("rr-onboarding-seen");
    if (!seen) {
      const timeout = setTimeout(() => setShowOnboarding(true), 1200);
      return () => clearTimeout(timeout);
    }
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
      q1: eq1, q2: eq2, q3: eq3,
      ts: now.toISOString()
    };
    await addEveningEval(entry);
    setEveningSaved(true);
  };

  const modules = [
    { icon: "🌬️", title: "Akutt regulering", sub: "Når alarmen er høy", nav: "acute" as ScreenId, color: "#2D4A3E" },
    { icon: "👥", title: "Etter sosiale situasjoner", sub: "Når tankene spinner etter å ha vært med folk", nav: "social" as ScreenId, color: "#9B6B8A" },
    { icon: "🔥", title: "Når du er hard mot deg selv", sub: "Når du er din egen verste kritiker", nav: "critic" as ScreenId, color: "#7A5A3A" },
    { icon: "💙", title: "Når relasjoner er vanskelige", sub: "Når noen nære gjør vondt eller skaper uro", nav: "relation" as ScreenId, color: "#3A5A7A" },
    { icon: "🌱", title: "Hvem er du egentlig?", sub: "Hvem er du når du er rolig?", nav: "identity" as ScreenId, color: "#4A6A3A" },
    { icon: "🫧", title: "Kjenn etter", sub: "Møt det som er der, uten å analysere", nav: "emotion" as ScreenId, color: "#4A3A6A" },
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

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ padding: "52px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 26, color: "hsl(var(--green))", lineHeight: 1.2 }}>Ro & Retning</div>
            <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginTop: 2, fontWeight: 400 }}>{greeting}. Hva trenger du akkurat nå?</div>
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
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 6 }}>Reguleringsgrad (0–10)</div>
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

      {/* ── Moduler ───────────────────────────────────────────── */}
      <div className="section-label">Moduler</div>
      {modules.map(m => (
        <div
          key={m.nav}
          className="ro-card"
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
          onClick={() => onNav(m.nav)}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {m.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: "hsl(var(--text-light))", marginTop: 2 }}>{m.sub}</div>
          </div>
          <div style={{ color: "hsl(var(--text-light))", fontSize: 18 }}>›</div>
        </div>
      ))}

      {/* ── Info-rad ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 24,
        padding: "20px 24px 32px",
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
          onClick={() => navigate("/betaling")}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif", fontSize: 12,
            color: "#9B6B8A", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
            fontWeight: 600,
          }}
        >
          ⭐ Ro & Retning Plus
        </button>
      </div>

    </div>
  );
}