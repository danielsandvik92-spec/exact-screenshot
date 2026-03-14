import { useState, useEffect } from "react";
import { SOCIAL_CATS, REFRAMES_DEFAULT } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import { AddCustomRow } from "@/components/AddCustomRow";
import { sGet, sSet } from "@/lib/storage";
import type { SocialSessionEntry } from "@/lib/types";

interface SocialScreenProps {
  onBack: () => void;
  addSession: (entry: SocialSessionEntry) => Promise<void>;
}

export function SocialScreen({ onBack, addSession }: SocialScreenProps) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [what, setWhat] = useState("");
  const [fear, setFear] = useState("");
  const [evidence, setEvidence] = useState("");
  const [neutral, setNeutral] = useState("");
  const [friendView, setFriendView] = useState("");
  const [chosen, setChosen] = useState<number | null>(null);
  const [customReframes, setCustomReframes] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => { sGet<string[]>("custom-reframes").then(d => d && setCustomReframes(d)); }, []);

  const addReframe = async (t: string) => {
    const updated = [...customReframes, t];
    setCustomReframes(updated);
    await sSet("custom-reframes", updated);
  };

  const allReframes = [...REFRAMES_DEFAULT, ...customReframes];

  const finish = async () => {
    const entry: SocialSessionEntry = { category: category || "ukjent", what, fear, evidence, neutral, friendView, reframe: chosen !== null ? allReframes[chosen] : "", ts: new Date().toISOString() };
    await addSession(entry);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up" style={{ padding: "0 16px 24px" }}>
        <div className="ro-card" style={{ margin: "80px 0 0" }}>
          <div className="reframe-box">Du tok deg tid til å stoppe opp og se situasjonen tydeligere. Det er ikke lite. 🌿</div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={onBack}>Gå tilbake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "hsl(var(--terra))" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Sosial etterreaksjon</h1>
        <p>For når sosiale situasjoner setter seg i kroppen.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>
        <div className="step-dots">
          {[0, 1, 2].map(i => <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />)}
        </div>
        {step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva skjedde?</div>
              <div className="card-sub">Velg kategori — eller legg til eget.</div>
              <ChipSelector items={SOCIAL_CATS.map(c => ({ id: c, label: c }))} selected={category} onSelect={setCategory} storageKey="social-cats" color="terra" />
            </div>
            {category && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva skjedde faktisk?</div>
                  <textarea className="ro-textarea" rows={3} placeholder="Beskriv situasjonen kort..." value={what} onChange={e => setWhat(e.target.value)} />
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, marginTop: 14 }}>Hva frykter du at de tenker?</div>
                  <textarea className="ro-textarea" rows={2} placeholder="Min største frykt er..." value={fear} onChange={e => setFear(e.target.value)} />
                </div>
                {what.length > 5 && <button className="btn-terra" onClick={() => setStep(1)}>Videre →</button>}
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Sjekk bevisene</div>
              <div className="card-sub">Hjernens første tolkning er ikke alltid sann.</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Har du konkrete bevis for frykten din?</div>
                <textarea className="ro-textarea" rows={2} placeholder="Faktisk bevis, ikke tolkninger..." value={evidence} onChange={e => setEvidence(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva er 3 nøytrale forklaringer?</div>
                <textarea className="ro-textarea" rows={3} placeholder="Det er mulig at..." value={neutral} onChange={e => setNeutral(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva ville du tenkt om en venn som gjorde det samme?</div>
                <textarea className="ro-textarea" rows={2} placeholder="Jeg ville tenkt at han..." value={friendView} onChange={e => setFriendView(e.target.value)} />
              </div>
            </div>
            <button className="btn-terra" onClick={() => setStep(2)}>Avslutt med reframe →</button>
          </div>
        )}
        {step === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Velg en setning å bære med deg</div>
              <div className="card-sub">Velg én — eller skriv din egen. Du kan også avslutte uten å velge.</div>
              <div style={{ marginTop: 12 }}>
                {allReframes.map((r, i) => (
                  <div key={i} className={`ro-chip ${chosen === i ? "selected" : ""}`} style={{ display: "block", marginBottom: 8, padding: "14px 16px" }} onClick={() => setChosen(i)}>"{r}"</div>
                ))}
              </div>
              <AddCustomRow placeholder="+ Skriv din egen setning..." onAdd={addReframe} />
            </div>
            {chosen !== null && (
              <div className="fade-up">
                <div className="reframe-box">{allReframes[chosen]}</div>
              </div>
            )}
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>Lagre og avslutt</button>
          </div>
        )}
      </div>
    </div>
  );
}
