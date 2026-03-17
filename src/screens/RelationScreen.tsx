import { useState } from "react";
import { RELATION_TRIGS } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import type { RelationSessionEntry } from "@/lib/types";

interface RelationScreenProps {
  onBack: () => void;
  addSession: (entry: RelationSessionEntry) => Promise<void>;
}

type Mode = null | "liste" | "fri";

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

  const finish = async (handlingMode: string) => {
    const trigItem = RELATION_TRIGS.find(t => t.id === trigger);
    const label = trigItem ? trigItem.label : (trigger || "fri refleksjon");
    const entry: RelationSessionEntry = {
      trigger: label,
      interpretation: mode === "fri" ? freeText : interpretation,
      alternatives,
      feeling,
      mode: handlingMode,
      ts: new Date().toISOString(),
    };
    await addSession(entry);

    const ctx = mode === "fri"
      ? `Brukeren beskrev dette i en relasjon som var vanskelig: "${freeText}"`
      : `Brukeren ble trigget av: "${label}". Tolkning: "${interpretation}". Alternative forklaringer: "${alternatives}". Følelsen under: "${feeling}". Valgte: ${handlingMode === "regulering" ? "bare regulering" : "planlegge handling"}.`;

    setReflectionContext(ctx);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up" style={{ padding: "0 16px 24px" }}>
        <div className="ro-card" style={{ margin: "80px 0 14px" }}>
          <div className="reframe-box">Du tok deg tid til å forstå triggeren. Det er styrke. 🌿</div>
        </div>
        <ReflectionBubble
          context={reflectionContext}
          systemPrompt="Du er en varm, ikke-dømmende støtteperson. Brukeren har nettopp jobbet med noe vanskelig i en relasjon. Valider det de kjente på, normaliser reaksjonen, og si noe kort og sant om hva du hører. Skriv 2-3 setninger på norsk. Gi ingen råd."
          color="green"
          autoFetch={true}
        />
        <button className="btn-secondary" style={{ marginTop: 14, width: "100%" }} onClick={onBack}>
          Gå tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#2A4A6A" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Når relasjoner er vanskelige</h1>
        <p>Forstå triggere uten å gå i panikk.</p>
      </div>

      <div className="scroll-area" style={{ padding: "0 16px" }}>

        {/* INNGANGSVALG */}
        {mode === null && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hvordan vil du starte?</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>
                Velg det som passer deg akkurat nå.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => setMode("liste")}
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
                  📋 <strong>Velg fra liste</strong>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 4 }}>
                    For når du vil ha struktur og gjenkjenning
                  </div>
                </button>
                <button
                  onClick={() => setMode("fri")}
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
                  ✍️ <strong>Skriv fritt</strong>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 4 }}>
                    For når du vil utforske uten rammer
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FRI SKRIVING */}
        {mode === "fri" && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva skjer i relasjonen akkurat nå?</div>
              <div className="card-sub" style={{ marginBottom: 12 }}>
                Skriv fritt — du trenger ikke analysere, bare beskrive.
              </div>
              <textarea
                className="ro-textarea"
                rows={6}
                placeholder="Det som skjer er..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <button
                className="btn-primary"
                onClick={() => finish("regulering")}
                disabled={freeText.trim().length < 5}
                style={{ opacity: freeText.trim().length < 5 ? 0.5 : 1 }}
              >
                Lagre og få refleksjon
              </button>
              <button
                className="btn-ghost"
                onClick={() => setMode(null)}
                style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }}
              >
                ← Tilbake
              </button>
            </div>
          </div>
        )}

        {/* LISTE-MODUS */}
        {mode === "liste" && step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva trigget deg?</div>
              <ChipSelector items={RELATION_TRIGS} selected={trigger} onSelect={setTrigger} storageKey="relation-trigs" />
            </div>
            {trigger && (
              <div className="fade-up">
                {trigger === "nomsg" && (
                  <div className="ro-card" style={{ margin: "12px 0 0" }}>
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
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
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
            <button
              className="btn-ghost"
              onClick={() => setMode(null)}
              style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }}
            >
              ← Tilbake
            </button>
          </div>
        )}

        {mode === "liste" && step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Handling eller regulering?</div>
              <div className="card-sub">Noen ganger trenger situasjonen handling. Andre ganger trenger kroppen bare ro.</div>
              <div className="divider" />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => finish("regulering")}>
                  Bare regulering
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => finish("handling")}>
                  Planlegg handling
                </button>
              </div>
            </div>
            <div className="reframe-box">
              Hva ville du gjort hvis du stolte mer på denne relasjonen akkurat nå?
            </div>
          </div>
        )}

      </div>
    </div>
  );
}