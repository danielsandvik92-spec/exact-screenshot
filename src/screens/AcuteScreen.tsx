import { useState, useEffect } from "react";
import { ACUTE } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import { ConfirmLeaveDialog } from "@/components/ConfirmLeaveDialog";
import type { AcuteSessionEntry } from "@/lib/types";

interface AcuteScreenProps {
  onBack: () => void;
  addSession: (entry: AcuteSessionEntry) => Promise<void>;
  onEmotion?: () => void;
}

const BREATH_DURATIONS: Record<string, number> = {
  inn1: 3, inn2: 1, ut: 7, pause: 1,
};

const BREATH_NEXT: Record<string, string> = {
  inn1: "inn2", inn2: "ut", ut: "pause", pause: "inn1",
};

export function AcuteScreen({ onBack, addSession, onEmotion }: AcuteScreenProps) {
  const [step, setStep] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [breathStep, setBreathStep] = useState("inn1");
  const [intensityBefore, setIntensityBefore] = useState<number | null>(null);
  const [intensityAfter, setIntensityAfter] = useState<number | null>(null);
  const [timer, setTimer] = useState(BREATH_DURATIONS["inn1"]);
  const [breathCount, setBreathCount] = useState(0);
  const [g1, setG1] = useState("");
  const [g2, setG2] = useState("");
  const [g3, setG3] = useState("");
  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  const handleBack = () => {
    if (step > 0) {
      setConfirmLeave(true);
    } else {
      onBack();
    }
  };

  useEffect(() => {
    if (step !== 1) return;
    setTimer(BREATH_DURATIONS[breathStep]);
    const iv = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          const nextStep = BREATH_NEXT[breathStep];
          setBreathCount(c => c + 1);
          setBreathStep(nextStep);
          return BREATH_DURATIONS[nextStep];
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [step, breathStep]);

  const finish = async () => {
    if (intensityBefore === null || intensityAfter === null) return;
    const chosenItem = ACUTE.find(a => a.id === chosen);
    const label = chosenItem ? chosenItem.label : (chosen || "ukjent");
    const entry: AcuteSessionEntry = {
      symptom: label,
      intensityBefore,
      intensityAfter,
      grounding: [g1, g2, g3].filter(Boolean),
      ts: new Date().toISOString()
    };
    await addSession(entry);
    setReflectionContext(
      `Brukeren hadde symptom: "${label}". Intensitet før: ${intensityBefore}, etter: ${intensityAfter}. Grounding: ${[g1, g2, g3].filter(Boolean).join(", ") || "ikke fylt ut"}.`
    );
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "hsl(var(--green))" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Akutt regulering</h1>
          <p>Reguler kroppen før du analyserer situasjonen.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <div className="ro-card" style={{ margin: "0 0 14px" }}>
            <div className="reframe-box">
              {(intensityBefore ?? 0) - (intensityAfter ?? 0) >= 2
                ? "Kroppen din regulerte seg. Du er tryggere nå. 🌿"
                : "Noen ganger tar det litt lengre tid. Du er trygg nå. 🌿"}
            </div>
          </div>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm, rolig støtteperson. Brukeren har nettopp gjennomført en akutt reguleringssesjon. De brukte pust og grounding for å roe nervesystemet. Ikke ros dem, ikke analyser — si noe sant og varmt om det de gjorde for seg selv. Skriv på norsk, 2-3 setninger."
            color="green"
            autoFetch={true}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <button className="btn-primary" onClick={onBack}>Gå tilbake</button>
            {onEmotion && (
              <div style={{
                padding: "14px 16px",
                background: "rgba(74,58,106,0.06)",
                border: "1px solid rgba(74,58,106,0.15)",
                borderRadius: "var(--radius-sm)",
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
              }} onClick={onEmotion}>
                <div style={{ fontSize: 22 }}>🫧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4A3A6A" }}>Nervesystemet er roligere nå</div>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-light))", marginTop: 2 }}>Vil du kjenne etter hva som var der? →</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      {confirmLeave && (
        <ConfirmLeaveDialog
          onConfirm={() => { setConfirmLeave(false); onBack(); }}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
      <div className="module-header" style={{ background: "hsl(var(--green))" }}>
        <button className="back-btn" onClick={handleBack}>←</button>
        <h1>Akutt regulering</h1>
        <p>Reguler kroppen før du analyserer situasjonen.</p>
      </div>
      <div className="scroll-area">
        <div className="step-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Hva skjer i systemet ditt nå?</div>
              <div className="card-sub">Velg det som kjennes mest sant — eller legg til eget.</div>
              <ChipSelector items={ACUTE} selected={chosen} onSelect={setChosen} storageKey="acute" />
            </div>
            {chosen && (
              <div className="fade-up">
                <div className="reframe-box">Dette er en stressrespons. Du trenger ikke løse situasjonen akkurat nå.</div>
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 8 }}>Intensitet nå (0–10)</div>
                  <div className="scale-row">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className={`scale-dot ${intensityBefore === i ? "active-high" : ""}`} onClick={() => setIntensityBefore(i)}>{i}</div>
                    ))}
                  </div>
                </div>
                {intensityBefore !== null && (
                  <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(1)}>
                    Start pusteguide →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="fade-up" style={{ padding: "0 16px", textAlign: "center" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Fysiologisk sukk</div>
              <div className="card-sub">
                Dobbelt innpust + lang utpust — den raskeste måten å roe nervesystemet på.
              </div>
              <div className="breathe-circle">
                {breathStep === "inn1" ? `Pust inn (nese)... ${timer}` :
                 breathStep === "inn2" ? `Ekstra sukk inn... ${timer}` :
                 breathStep === "ut" ? `Pust sakte ut... ${timer}` :
                 `Pause... ${timer}`}
              </div>
              <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                Runde {Math.floor(breathCount / 4) + 1} av 5
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (breathCount / 20) * 100)}%` }} />
              </div>
            </div>
            {breathCount >= 20 && (
              <div className="fade-up" style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={() => setStep(2)}>Videre til grounding →</button>
              </div>
            )}
            <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setStep(2)}>Hopp over</button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">60 sekunder grounding</div>
              <div className="card-sub">Navngi det du ser, hører og kjenner.</div>
              <div className="divider" />
              {[
                { emoji: "👁️", label: "3 ting du ser akkurat nå", val: g1, set: setG1 },
                { emoji: "👂", label: "2 lyder du hører", val: g2, set: setG2 },
                { emoji: "✋", label: "1 ting du kan kjenne på kroppen", val: g3, set: setG3 },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{item.emoji} {item.label}</div>
                  <textarea className="ro-textarea" rows={2} placeholder="Skriv her..." value={item.val} onChange={e => item.set(e.target.value)} />
                </div>
              ))}
            </div>
            <div className="reframe-box">Er dette gammel alarm eller nåtidsfare?</div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(3)}>Avslutt og evaluer →</button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Intensitet nå?</div>
              <div className="scale-row" style={{ marginTop: 12 }}>
                {[...Array(11)].map((_, i) => (
                  <div key={i} className={`scale-dot ${intensityAfter === i ? "active" : ""}`} onClick={() => setIntensityAfter(i)}>{i}</div>
                ))}
              </div>
              {intensityAfter !== null && (
                <div className="fade-up">
                  <div className="divider" />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>Før: <strong style={{ color: "hsl(var(--terra))" }}>{intensityBefore}</strong></span>
                    <span>Etter: <strong style={{ color: "hsl(var(--green))" }}>{intensityAfter}</strong></span>
                    <span>Endring: <strong style={{ color: "hsl(var(--green))" }}>{(intensityBefore ?? 0) - intensityAfter > 0 ? `-${(intensityBefore ?? 0) - intensityAfter}` : "±0"}</strong></span>
                  </div>
                  <div className="reframe-box" style={{ marginTop: 14 }}>
                    {(intensityBefore ?? 0) - intensityAfter >= 2
                      ? "Kroppen din regulerte seg. Du er tryggere nå."
                      : "Noen ganger tar det litt lengre tid. Du er trygg nå."}
                  </div>
                  <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>
                    Lagre og gå tilbake
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}