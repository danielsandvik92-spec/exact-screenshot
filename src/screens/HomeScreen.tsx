import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOOD_META } from "@/lib/data";
import { CheckinGraph } from "@/components/CheckinGraph";
import type { AppDB, CheckinEntry, ScreenId } from "@/lib/types";

interface HomeScreenProps {
  onNav: (screen: ScreenId) => void;
  db: AppDB;
  addCheckin: (entry: CheckinEntry) => Promise<void>;
}

export function HomeScreen({ onNav, db, addCheckin }: HomeScreenProps) {
  const navigate = useNavigate();
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  const checkins = db?.checkins || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "God morgen" : hour < 18 ? "God ettermiddag" : "God kveld";

  const save = async () => {
    if (!mood || energy === null) return;
    const now = new Date();
    const entry: CheckinEntry = { mood, energy, date: `${now.getDate()}/${now.getMonth() + 1}`, ts: now.toISOString() };
    await addCheckin(entry);
    setSaved(true);
  };

  const modules = [
    { icon: "🌬️", title: "Akutt regulering", sub: "Når alarmen er høy", nav: "acute" as ScreenId, color: "#2D4A3E" },
    { icon: "👥", title: "Etter sosiale situasjoner", sub: "Når tankene spinner etter å ha vært med folk", nav: "social" as ScreenId, color: "#9B6B8A" },
    { icon: "🔥", title: "Når du er hard mot deg selv", sub: "Når du er din egen verste kritiker", nav: "critic" as ScreenId, color: "#7A5A3A" },
    { icon: "💙", title: "Når relasjoner er vanskelige", sub: "Når noen nære gjør vondt eller skaper uro", nav: "relation" as ScreenId, color: "#3A5A7A" },
    { icon: "🌱", title: "Hvem er du egentlig?", sub: "Hvem er du når du er rolig?", nav: "identity" as ScreenId, color: "#4A6A3A" },
    { icon: "🫧", title: "Kjenn etter", sub: "Møt det som er der, uten å analysere", nav: "emotion" as ScreenId, color: "#4A3A6A" },
    { icon: "📊", title: "Dine mønstre", sub: "Se dine mønstre over tid", nav: "patterns" as ScreenId, color: "#6B5E54" },
  ];

  return (
    <div className="fade-up">
      <div style={{ padding: "52px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 26, color: "hsl(var(--green))", lineHeight: 1.2 }}>Ro & Retning</div>
            <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginTop: 2, fontWeight: 400 }}>{greeting}. Hva trenger du akkurat nå?</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <button
                onClick={() => navigate("/bakgrunn")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "13px",
                  color: "hsl(var(--text-muted))",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                📖 Hvorfor appen er som den er
              </button>
              <button
                onClick={() => navigate("/betaling")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "13px",
                  color: "#9B6B8A",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontWeight: 600,
                }}
              >
                ⭐ Ro & Retning Plus
              </button>
            </div>
            <div style={{ width: 40, height: 40, background: "hsl(var(--green))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <div className="ro-card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Daglig innsjekk</div>
            {checkins.length > 0 && (
              <button onClick={() => setShowGraph(s => !s)} style={{ background: "none", border: "none", fontSize: 12, color: "hsl(var(--green))", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {showGraph ? "Skjul graf" : `Se utvikling (${checkins.length})`}
              </button>
            )}
          </div>
          <div className="card-sub" style={{ marginTop: 4 }}>Ta ett minutt til deg selv.</div>
          {showGraph && <div className="fade-up" style={{ marginTop: 14 }}><CheckinGraph checkins={checkins} /><div className="divider" /></div>}
          {!saved ? (
            <>
              <div className="checkin-row" style={{ marginTop: 14 }}>
                {MOOD_META.map(m => (
                  <div key={m.label} className={`checkin-item ${mood === m.label ? "selected" : ""}`} onClick={() => setMood(m.label)}>
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
                      <div key={i} className={`scale-dot ${energy === i ? (i > 6 ? "active" : "active-high") : ""}`} onClick={() => setEnergy(i)} style={{ fontSize: 10 }}>{i}</div>
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
            <div className="fade-up reframe-box" style={{ marginTop: 12 }}>Lagret. Ta vare på deg selv i dag. 🌿</div>
          )}
        </div>
      </div>

      <div className="section-label">Moduler</div>
      {modules.map(m => (
        <div key={m.nav} className="ro-card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }} onClick={() => onNav(m.nav)}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{m.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: "hsl(var(--text-light))", marginTop: 2 }}>{m.sub}</div>
          </div>
          <div style={{ color: "hsl(var(--text-light))", fontSize: 18 }}>›</div>
        </div>
      ))}
    </div>
  );
}