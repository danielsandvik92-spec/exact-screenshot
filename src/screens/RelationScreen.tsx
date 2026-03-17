import { useState } from "react";
import { RELATION_TRIGS } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import type { RelationSessionEntry } from "@/lib/types";

interface RelationScreenProps {
  onBack: () => void;
  addSession: (entry: RelationSessionEntry) => Promise<void>;
}

type Mode = "velg" | "skriv" | null;

export function RelationScreen({ onBack, addSession }: RelationScreenProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [interpretation, setInterpretation] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [feeling, setFeeling] = useState("");
  const [freeText, setFreeText] = useState("");
  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  const finishStructured = async (handling: string) => {
    const trigItem = RELATION_TRIGS.find(t => t.id === trigger);
    const label = trigItem ? trigItem.label : (trigger || "ukjent");
    const entry: RelationSessionEntry = {
      trigger: label, interpretation, alternatives, feeling, mode: handling, ts: new Date().toISOString()
    };
    await addSession(entry);
    setReflectionContext(`Brukeren ble trigget av: "${label}". Tolkning: "${interpretation}". Alternative forklaringer: "${alternatives}". Følelsen under: "${feeling}".`);
    setDone(true);
  };

  const finishFree = async () => {
    const entry: RelationSessionEntry = {
      trigger: "fri refleksjon", interpretation: freeText, alternatives: "", feeling: "", mode: "fri", ts: new Date().toISOString()
    };
    await addSession(entry);
    setReflectionContext(`Brukeren beskrev en vanskelig relasjonssituasjon: "${freeText}"`);
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
            systemPrompt="Du er en varm, rolig støtteperson. Brukeren har nettopp delt noe vanskelig om en relasjon. Valider det de kjenner på — ikke analyser, ikke gi råd. Si noe sant og varmt om det de har delt. Skriv på norsk, 2-4 setninger."
            color="green"
            autoFetch={true}
          />
          <button className="btn-secondary" style={{ marginTop: 14, width: "100%" }} onClick={onBack}>
            Tilbake til hjem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#2A4A6A" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Når relasjoner er vanskelige</h1>
        <p>Når noen nære gjør vondt eller skaper uro.</p>
      </div>

      <div style={{ padding: "16px" }}>

        {/* INNGANGSVALG */}
        {mode === null && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Hvordan vil du starte?</div>
              <div className="card-sub" style={{ marginBottom: 20 }}>
                Velg det som passer deg best akkurat nå.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📋 Velg fra liste</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                    For når du vil ha struktur og gjenkjenning
                  </div>
                </button>
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
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>✍️ Skriv fritt</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                    For når du vil utforske uten rammer
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FRI SKRIVING */}
        {mode === "skriv" && (
          <div className="fade-up">
            <button
              onClick={() => setMode(null)}
              style={{ background: "none", border: "none", fontSize: 13, color: "hsl(var(--text-muted))", cursor: "pointer", marginBottom: 12, padding: 0 }}
            >
              ← Tilbake
            </button>
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Hva skjer i relasjonen akkurat nå?</div>
              <div className="card-sub" style={{ marginBottom: 14 }}>
                Skriv fritt — hva du kjenner, hva som skjedde, hva som er vanskelig.
              </div>
              <textarea
                className="ro-textarea"
                rows={7}
                placeholder="Det som er vanskelig akkurat nå er..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <button
                className="btn-primary"
                onClick={finishFree}
                disabled={freeText.trim().length < 10}
                style={{ opacity: freeText.trim().length < 10 ? 0.5 : 1 }}
              >
                Lagre og avslutt
              </button>
            </div>
          </div>
        )}

        {/* STRUKTURERT FLYT */}
        {mode === "velg" && (
          <div className="fade-up">
            <button
              onClick={() => setMode(null)}
              style={{ background: "none", border: "none", fontSize: 13, color: "hsl(var(--text-muted))", cursor: "pointer", marginBottom: 12, padding: 0 }}
            >
              ← Tilbake
            </button>

            {step === 0 && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "0 0 14px" }}>
                  <div className="card-title">Hva trigget deg?</div>
                  <ChipSelector items={RELATION_TRIGS} selected={trigger} onSelect={setTrigger} storageKey="relation-trigs" />
                </div>
                {trigger && (
                  <div className="fade-up">
                    {trigger === "nomsg" && (
                      <div className="ro-card" style={{ margin: "0 0 12px" }}>
                        <div className="card-title">Melding uten svar</div>
                        <div className="card-sub">Stillhet er ikke bevis på avvisning.</div>
                        {["De er opptatt med noe annet", "De har kanskje ikke sett meldingen", "De sliter selv med noe", "Timingen var dårlig for dem"].map((e, i) => (
                          <div key={i} className="insight-row">
                            <div className="insight-dot" style={{ background: "hsl(var(--green))" }} />
                            <div className="insight-text">{e}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Er dette savn, skam, ensomhet, eller avvisningsfrykt?</div>
                        <textarea className="ro-textarea" rows={2} placeholder="Det kjennes mest som..." value={feeling} onChange={e => setFeeling(e.target.value)} />
                      </div>
                    </div>
                    {(interpretation.length > 0 || alternatives.length > 0 || feeling.length > 0) && (
                      <button className="btn-primary" style={{ marginTop: 4 }} onClick={() => setStep(1)}>
                        Trenger dette handling? →
                      </button>
                    )}
                    <button className="btn-ghost" style={{ marginTop: 4 }} onClick={() => setStep(1)}>
                      Hopp over refleksjon →
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