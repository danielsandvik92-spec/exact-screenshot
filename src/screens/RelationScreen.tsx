import { useState } from "react";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import { ConfirmLeaveDialog } from "@/components/ConfirmLeaveDialog";
import type { RelationSessionEntry } from "@/lib/types";

interface RelationScreenProps {
  onBack: () => void;
  addSession: (entry: RelationSessionEntry) => Promise<void>;
}

type Mode = "velg" | "skriv" | null;

export function RelationScreen({ onBack, addSession }: RelationScreenProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState("");
  const [what, setWhat] = useState("");
  const [perspective, setPerspective] = useState("");
  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  const [trigger, setTrigger] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [alternatives, setAlternatives] = useState("");

  const handleBack = () => {
    if (mode !== null) {
      setConfirmLeave(true);
    } else {
      onBack();
    }
  };

  const finishFree = async () => {
    const entry: RelationSessionEntry = {
      trigger: "fri refleksjon",
      interpretation: what,
      alternatives: perspective,
      feeling,
      mode: "fri",
      ts: new Date().toISOString()
    };
    await addSession(entry);
    setReflectionContext(
      `Brukeren kjenner: "${feeling}"\nHva skjedde: "${what}"\nAnnet perspektiv: "${perspective}"`
    );
    setDone(true);
  };

  const finishStructured = async (handling: string) => {
    const entry: RelationSessionEntry = {
      trigger: trigger || "ukjent",
      interpretation,
      alternatives,
      feeling,
      mode: handling,
      ts: new Date().toISOString()
    };
    await addSession(entry);
    setReflectionContext(
      `Brukeren ble trigget av: "${trigger}". Tolkning: "${interpretation}". Alternative forklaringer: "${alternatives}". Følelsen under: "${feeling}".`
    );
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "#2A4A6A" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Når relasjoner er vanskelige</h1>
          <p>Når noen nære gjør vondt eller skaper uro.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <div className="ro-card" style={{ margin: "0 0 14px" }}>
            <div className="card-title">Du tok deg tid til å kjenne etter</div>
            <div className="card-sub">Det er ikke lite å stoppe opp midt i en trigget tilstand.</div>
          </div>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm, rolig støtteperson. Brukeren har nettopp gått gjennom tre steg der de har kjent etter hva de føler, hva som skjedde, og forsøkt å se det fra et annet perspektiv. Les alt de har delt nøye. Valider det de kjenner på — ikke analyser, ikke gi råd. Si noe sant og varmt om mønstre du hører. Skriv på norsk, 3-4 setninger."
            color="green"
            autoFetch={true}
          />
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={onBack}>
            Gå tilbake
          </button>
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
      <div className="module-header" style={{ background: "#2A4A6A" }}>
        <button className="back-btn" onClick={handleBack}>←</button>
        <h1>Når relasjoner er vanskelige</h1>
        <p>Når noen nære gjør vondt eller skaper uro.</p>
      </div>

      <div style={{ padding: "16px" }}>

        {mode === null && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Hvordan vil du starte?</div>
              <div className="card-sub" style={{ marginBottom: 20 }}>
                Velg det som passer deg best akkurat nå.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => setMode("skriv")}
                  style={{
                    padding: "16px 18px",
                    background: "hsl(var(--surface))",
                    border: "1.5px solid hsl(var(--surface2))",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 15,
                    color: "hsl(var(--text))",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>✍️ Skriv fritt</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                    Tre enkle spørsmål — skriv det som er
                  </div>
                </button>
                <button
                  onClick={() => setMode("velg")}
                  style={{
                    padding: "16px 18px",
                    background: "hsl(var(--surface))",
                    border: "1.5px solid hsl(var(--surface2))",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 15,
                    color: "hsl(var(--text))",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📋 Velg fra liste</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                    For når du vil ha struktur og gjenkjenning
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "skriv" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "4px 0 20px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i <= step ? "#2A4A6A" : "hsl(var(--surface2))",
                  opacity: i < step ? 0.4 : 1,
                  transform: i === step ? "scale(1.25)" : "scale(1)",
                  transition: "all 0.25s",
                }} />
              ))}
            </div>

            {step === 0 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 12 }}>
                    Steg 1 — Hva kjenner du?
                  </div>
                  <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 17, color: "#2A4A6A", lineHeight: 1.6, marginBottom: 16 }}>
                    Stopp et øyeblikk. Hva kjenner du i kroppen og hjertet akkurat nå?
                  </div>
                  <textarea className="ro-textarea" rows={4} placeholder="Jeg kjenner..." value={feeling} onChange={e => setFeeling(e.target.value)} style={{ marginBottom: 16 }} />
                  <button className="btn-primary" style={{ background: "#2A4A6A", opacity: feeling.trim().length < 3 ? 0.5 : 1 }} disabled={feeling.trim().length < 3} onClick={() => setStep(1)}>
                    Neste →
                  </button>
                  <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={() => setStep(1)}>
                    Hopp over
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 12 }}>
                    Steg 2 — Hva skjedde?
                  </div>
                  <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 17, color: "#2A4A6A", lineHeight: 1.6, marginBottom: 16 }}>
                    Hva var det som skjedde? Beskriv situasjonen kort.
                  </div>
                  <textarea className="ro-textarea" rows={4} placeholder="Det som skjedde var..." value={what} onChange={e => setWhat(e.target.value)} style={{ marginBottom: 16 }} />
                  <button className="btn-primary" style={{ background: "#2A4A6A", opacity: what.trim().length < 3 ? 0.5 : 1 }} disabled={what.trim().length < 3} onClick={() => setStep(2)}>
                    Neste →
                  </button>
                  <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={() => setStep(2)}>
                    Hopp over
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "hsl(var(--text-light))", marginBottom: 12 }}>
                    Steg 3 — Et annet perspektiv
                  </div>
                  <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 17, color: "#2A4A6A", lineHeight: 1.6, marginBottom: 16 }}>
                    Er det mulig å se dette fra et annet ståsted — eller er det noe du ikke vet ennå?
                  </div>
                  <textarea className="ro-textarea" rows={4} placeholder="Det er mulig at... / Jeg vet ikke ennå om..." value={perspective} onChange={e => setPerspective(e.target.value)} style={{ marginBottom: 16 }} />
                  <button className="btn-primary" style={{ background: "#2A4A6A" }} onClick={finishFree}>
                    Avslutt økten
                  </button>
                  <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={finishFree}>
                    Avslutt uten å svare
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "velg" && (
          <div className="fade-up">
            {step === 0 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div className="card-title">Hva trigget deg?</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    {[
                      { id: "nomsg", label: "Melding uten svar" },
                      { id: "distance", label: "Avstand eller kulde" },
                      { id: "conflict", label: "Konflikt" },
                      { id: "unclear", label: "Uklarhet eller tvetydighet" },
                      { id: "longing", label: "Savn" },
                      { id: "confirm", label: "Behov for bekreftelse" },
                      { id: "rejected", label: "Følte meg avvist" },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTrigger(t.id === trigger ? null : t.id)}
                        style={{
                          padding: "12px 16px",
                          background: trigger === t.id ? "hsla(var(--green) / 0.08)" : "hsl(var(--surface))",
                          border: `1.5px solid ${trigger === t.id ? "hsl(var(--green))" : "hsl(var(--surface2))"}`,
                          borderRadius: "var(--radius-sm)",
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 14,
                          color: trigger === t.id ? "hsl(var(--green))" : "hsl(var(--text-muted))",
                          fontWeight: trigger === t.id ? 600 : 400,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {trigger === t.id ? "✓ " : ""}{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {trigger && (
                  <div className="fade-up">
                    <div className="ro-card" style={{ margin: "0 0 14px" }}>
                      <div className="card-title">Kartlegg reaksjonen</div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva tolket jeg det som?</div>
                        <textarea className="ro-textarea" rows={2} placeholder="Jeg tolket det som..." value={interpretation} onChange={e => setInterpretation(e.target.value)} />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva kan være alternative forklaringer?</div>
                        <textarea className="ro-textarea" rows={2} placeholder="Det er mulig at..." value={alternatives} onChange={e => setAlternatives(e.target.value)} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Hva kjenner du under reaksjonen?</div>
                        <textarea className="ro-textarea" rows={2} placeholder="Det kjennes mest som..." value={feeling} onChange={e => setFeeling(e.target.value)} />
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => setStep(1)}>
                      Handling eller regulering? →
                    </button>
                    <button className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }} onClick={() => setStep(1)}>
                      Hopp over
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div className="card-title">Handling eller regulering?</div>
                  <div className="card-sub">Noen ganger trenger situasjonen handling. Andre ganger trenger kroppen bare ro.</div>
                  <div className="divider" />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => finishStructured("regulering")}>Bare regulering</button>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => finishStructured("handling")}>Planlegg handling</button>
                  </div>
                </div>
                <div className="reframe-box">Hva ville du gjort hvis du stolte mer på denne relasjonen akkurat nå?</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}