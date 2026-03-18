import { useState, useEffect } from "react";
import { CRITIC_VOICES } from "@/lib/data";
import { AddCustomRow } from "@/components/AddCustomRow";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import { ConfirmLeaveDialog } from "@/components/ConfirmLeaveDialog";
import { sGet, sSet } from "@/lib/storage";
import type { CriticSessionEntry } from "@/lib/types";

interface CriticVoice {
  id: string;
  label: string;
  fear: string;
  closing?: string;
}

interface CriticScreenProps {
  onBack: () => void;
  addSession: (entry: CriticSessionEntry) => Promise<void>;
}

export function CriticScreen({ onBack, addSession }: CriticScreenProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [mode, setMode] = useState<"choose" | "structured" | "free" | null>("choose");
  const [step, setStep] = useState(0);

  const [chosen, setChosen] = useState<string | null>(null);
  const [whoSoundsLike, setWhoSoundsLike] = useState("");
  const [whatINeed, setWhatINeed] = useState("");
  const [achievement, setAchievement] = useState("");
  const [customVoices, setCustomVoices] = useState<CriticVoice[]>([]);

  const [freeVoice, setFreeVoice] = useState("");
  const [freeOrigin, setFreeOrigin] = useState("");
  const [freeNeed, setFreeNeed] = useState("");

  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  useEffect(() => {
    sGet<CriticVoice[]>("custom-voices").then(d => d && setCustomVoices(d));
  }, []);

  const addVoice = async (label: string) => {
    const updated = [...customVoices, { id: `c-${label}`, label, fear: "Jeg er redd for noe som gjør vondt." }];
    setCustomVoices(updated);
    await sSet("custom-voices", updated);
  };

  const allVoices = [...CRITIC_VOICES, ...customVoices];
  const selected = allVoices.find(v => v.id === chosen);
  const totalSteps = 3;

  const handleBack = () => {
    if (mode !== "choose") {
      setConfirmLeave(true);
    } else {
      onBack();
    }
  };

  const finish = async () => {
    const context = mode === "free"
      ? `Brukeren er hard mot seg selv. Stemmen sier: "${freeVoice}". Kjenner igjen fra: "${freeOrigin}". Trenger: "${freeNeed}".`
      : `Kritikerstemme: "${selected?.label}". Frykten under: "${selected?.fear}". Ligner på: "${whoSoundsLike}". Trenger: "${whatINeed}". Har fått til: "${achievement}".`;

    setReflectionContext(context);

    const entry: CriticSessionEntry = {
      voice: selected?.label || freeVoice || "ukjent",
      whoSoundsLike: mode === "free" ? freeOrigin : whoSoundsLike,
      safeResponse: mode === "free" ? freeNeed : whatINeed,
      ts: new Date().toISOString()
    };
    await addSession(entry);
    setDone(true);
  };

  if (done) {
  const closingMessage = selected?.closing || "Det du hører er ikke hele bildet av deg.";
  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "hsl(var(--critic-brown))" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Når du er hard mot deg selv</h1>
        <p>Kritikeren er en strategi, ikke sannheten om deg.</p>
      </div>
      <div style={{ padding: "16px" }}>
        <div className="reframe-box" style={{
          borderLeftColor: "hsl(var(--critic-brown))",
          background: "hsla(var(--critic-brown) / 0.04)",
          marginBottom: 14,
        }}>
          {closingMessage}
        </div>
        <ReflectionBubble
          context={reflectionContext}
          systemPrompt="Du er en varm, stille støtteperson. Brukeren har nettopp jobbet med en indre kritikerstemme — noe sårbart og tungt. Les hva de har delt med stor varsomhet. Ikke analyser, ikke oppmuntre med tomme ord, ikke løs noe. Bare anerkjenn det de sitter med, og si noe stille og sant. Skriv på norsk, 2-3 setninger."
          color="terra"
          autoFetch={true}
        />
        <button className="btn-primary" style={{ marginTop: 14 }} onClick={onBack}>Gå tilbake</button>
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
      <div className="module-header" style={{ background: "hsl(var(--critic-brown))" }}>
        <button className="back-btn" onClick={handleBack}>←</button>
        <h1>Når du er hard mot deg selv</h1>
        <p>Kritikeren er en strategi, ikke sannheten om deg.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>

        {mode !== "choose" && (
          <div className="step-dots">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />
            ))}
          </div>
        )}

        {mode === "choose" && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva kjennes riktig nå?</div>
              <div className="card-sub">Velg den som passer i dag.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                <div className="entry-card" onClick={() => { setMode("structured"); setStep(0); }}>
                  <div style={{ fontSize: 20 }}>🎯</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Jeg vet hva kritikeren sier</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
                      Velg stemmen og utforsk hva som ligger under
                    </div>
                  </div>
                </div>
                <div className="entry-card" onClick={() => { setMode("free"); setStep(0); }}>
                  <div style={{ fontSize: 20 }}>🌫️</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Jeg er bare hard mot meg selv</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
                      Sett ord på det — steg for steg
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "structured" && step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva sier den indre stemmen nå?</div>
              <div className="card-sub">Velg det som kjennes nærmest — eller legg til din egen.</div>
              <div className="chip-grid">
                {allVoices.map(v => (
                  <div key={v.id} className={`ro-chip ${chosen === v.id ? "selected" : ""}`} onClick={() => setChosen(v.id)}>
                    {v.label}
                  </div>
                ))}
              </div>
              <AddCustomRow placeholder="+ Legg til din egen stemme..." onAdd={addVoice} />
            </div>
            {chosen && selected && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
                  <div className="card-title">Det som egentlig skjer</div>
                  <div className="card-sub" style={{ marginBottom: 12 }}>Kritikeren snakker ikke sant — den er redd.</div>
                  <div className="critic-translate">
                    <div className="critic-box">
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>STEMMEN SIER</div>
                      {selected.label}
                    </div>
                    <div className="translate-arrow">→</div>
                    <div className="fear-box">
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>FRYKTEN UNDER</div>
                      {selected.fear}
                    </div>
                  </div>
                </div>
                <div className="reframe-box">
                  Denne stemmen lærte deg noe en gang. Den prøver fortsatt å beskytte deg — men på feil måte.
                </div>
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(1)}>
                  Jeg kjenner igjen dette →
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "structured" && step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Kjenner du igjen denne stemmen?</div>
              <div className="card-sub">Tenk tilbake — hvem sa slike ting til deg, eller hvem viste deg at du måtte være slik?</div>
              <textarea className="ro-textarea" rows={3} placeholder="Denne stemmen ligner på..." value={whoSoundsLike} onChange={e => setWhoSoundsLike(e.target.value)} />
            </div>
            <div className="ro-card" style={{ margin: "0" }}>
              <div className="card-title">Hva trenger den delen av deg?</div>
              <div className="card-sub">Den delen som hører disse ordene — hva trenger den egentlig?</div>
              <textarea className="ro-textarea" rows={4} placeholder="Det jeg egentlig trenger er..." value={whatINeed} onChange={e => setWhatINeed(e.target.value)} />
            </div>
            {whatINeed.length > 5 && (
              <div className="fade-up">
                <div className="reframe-box">{whatINeed}</div>
              </div>
            )}
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(2)}>Videre →</button>
          </div>
        )}

        {mode === "structured" && step === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Noe kritikeren aldri gir deg credit for</div>
              <div className="card-sub">Tenk på noe du faktisk har fått til — stort eller lite. Noe kritikeren aldri nevner.</div>
              <textarea className="ro-textarea" rows={4} placeholder="Noe jeg faktisk har fått til er..." value={achievement} onChange={e => setAchievement(e.target.value)} />
            </div>
            <div className="reframe-box">
              Det du nettopp skrev er like sant som det kritikeren sier — men mye sjeldnere sagt.
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>Avslutt</button>
          </div>
        )}

        {mode === "free" && step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva sier stemmen inni deg nå?</div>
              <div className="card-sub">Ikke kategoriser det — bare skriv det akkurat slik det høres ut inni deg.</div>
              <textarea className="ro-textarea" rows={6} placeholder="Stemmen sier at jeg..." value={freeVoice} onChange={e => setFreeVoice(e.target.value)} />
            </div>
            <div className="reframe-box">Det du hører er ikke hele bildet av deg.</div>
            {freeVoice.length > 10 && (
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(1)}>Videre →</button>
            )}
          </div>
        )}

        {mode === "free" && step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Kjenner du igjen denne stemmen?</div>
              <div className="card-sub">Ikke alle gjør det — men noen ganger har stemmen lært seg dette fra noe eller noen. Hva tenker du?</div>
              <textarea className="ro-textarea" rows={4} placeholder="Denne stemmen minner meg om..." value={freeOrigin} onChange={e => setFreeOrigin(e.target.value)} />
            </div>
            <div className="reframe-box">Det som kom utenfra en gang, er ikke det du er inni.</div>
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(2)}>Videre →</button>
          </div>
        )}

        {mode === "free" && step === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva trenger den delen av deg?</div>
              <div className="card-sub">Den delen som hører disse ordene — hva trenger den egentlig nå?</div>
              <textarea className="ro-textarea" rows={5} placeholder="Det jeg egentlig trenger er..." value={freeNeed} onChange={e => setFreeNeed(e.target.value)} />
            </div>
            {freeNeed.length > 5 && (
              <div className="fade-up">
                <div className="reframe-box">{freeNeed}</div>
              </div>
            )}
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>Avslutt</button>
          </div>
        )}

      </div>
    </div>
  );
}