import { useState, useEffect } from "react";
import { CRITIC_VOICES } from "@/lib/data";
import { AddCustomRow } from "@/components/AddCustomRow";
import { sGet, sSet } from "@/lib/storage";
import type { CriticSessionEntry } from "@/lib/types";

interface CriticVoice {
  id: string;
  label: string;
  fear: string;
}

interface CriticScreenProps {
  onBack: () => void;
  addSession: (entry: CriticSessionEntry) => Promise<void>;
}

export function CriticScreen({ onBack, addSession }: CriticScreenProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [whoSoundsLike, setWhoSoundsLike] = useState("");
  const [safeResponse, setSafeResponse] = useState("");
  const [step, setStep] = useState(0);
  const [customVoices, setCustomVoices] = useState<CriticVoice[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => { sGet<CriticVoice[]>("custom-voices").then(d => d && setCustomVoices(d)); }, []);

  const addVoice = async (label: string) => {
    const updated = [...customVoices, { id: `c-${label}`, label, fear: "Jeg er redd for noe som gjør vondt." }];
    setCustomVoices(updated);
    await sSet("custom-voices", updated);
  };

  const allVoices = [...CRITIC_VOICES, ...customVoices];
  const selected = allVoices.find(v => v.id === chosen);

  const finish = async () => {
    const entry: CriticSessionEntry = { voice: selected?.label || "ukjent", whoSoundsLike, safeResponse, ts: new Date().toISOString() };
    await addSession(entry);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up" style={{ padding: "0 16px 24px" }}>
        <div className="ro-card" style={{ margin: "80px 0 0" }}>
          <div className="reframe-box">Skam er ikke identitet. Selvangrep er ikke sannhet. 🌿</div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={onBack}>Gå tilbake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#5A3A28" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Skam & indre kritiker</h1>
        <p>Kritikeren er en strategi, ikke sannheten om deg.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>
        <div className="step-dots">
          {[0, 1].map(i => <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />)}
        </div>
        {step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva sier den indre kritikeren nå?</div>
              <div className="card-sub">Velg — eller legg til din egen stemme.</div>
              <div className="chip-grid">
                {allVoices.map(v => <div key={v.id} className={`ro-chip ${chosen === v.id ? "selected" : ""}`} onClick={() => setChosen(v.id)}>{v.label}</div>)}
              </div>
              <AddCustomRow placeholder="+ Legg til kritikerstemme..." onAdd={addVoice} />
            </div>
            {chosen && selected && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
                  <div className="card-title">Oversettelse</div>
                  <div className="critic-translate">
                    <div className="critic-box"><div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>KRITIKEREN SIER</div>{selected.label}</div>
                    <div className="translate-arrow">→</div>
                    <div className="fear-box"><div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>FRYKTEN UNDER</div>{selected.fear}</div>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setStep(1)}>Videre: svar trygt →</button>
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hvem ligner denne stemmen?</div>
              <div className="card-sub">Tenk tilbake — hvem sa slike ting til deg?</div>
              <textarea className="ro-textarea" rows={2} placeholder="Denne stemmen ligner på..." value={whoSoundsLike} onChange={e => setWhoSoundsLike(e.target.value)} />
            </div>
            <div className="ro-card" style={{ margin: "0" }}>
              <div className="card-title">Hva ville en trygg voksen sagt?</div>
              <div className="card-sub">Skriv til deg selv som til en god venn.</div>
              <textarea className="ro-textarea" rows={4} placeholder="Det jeg egentlig trenger å høre er..." value={safeResponse} onChange={e => setSafeResponse(e.target.value)} />
            </div>
            {safeResponse.length > 0 && (
              <div className="fade-up">
                <div className="reframe-box">{safeResponse}</div>
              </div>
            )}
            <div style={{ padding: "0 0 8px" }}>
              <div style={{ marginTop: 10, padding: "10px 16px", background: "hsla(var(--green) / 0.06)", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Skam er ikke identitet. Selvangrep er ikke sannhet.</div>
              </div>
              <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>Lagre og avslutt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
