import { useState } from "react";
import { RELATION_TRIGS } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import type { RelationSessionEntry } from "@/lib/types";

interface RelationScreenProps {
  onBack: () => void;
  addSession: (entry: RelationSessionEntry) => Promise<void>;
}

export function RelationScreen({ onBack, addSession }: RelationScreenProps) {
  const [trigger, setTrigger] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [interpretation, setInterpretation] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [feeling, setFeeling] = useState("");
  const [done, setDone] = useState(false);

  const finish = async (mode: string) => {
    const trigItem = RELATION_TRIGS.find(t => t.id === trigger);
    const label = trigItem ? trigItem.label : (trigger || "ukjent");
    const entry: RelationSessionEntry = { trigger: label, interpretation, alternatives, feeling, mode, ts: new Date().toISOString() };
    await addSession(entry);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up" style={{ padding: "0 16px 24px" }}>
        <div className="ro-card" style={{ margin: "80px 0 0" }}>
          <div className="reframe-box">Du tok deg tid til å forstå triggeren. Det er styrke. 🌿</div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={onBack}>Gå tilbake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#2A4A6A" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Relasjon & tilknytning</h1>
        <p>Forstå triggere uten å gå i panikk.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>
        {step === 0 && (
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
                      <div key={i} className="insight-row"><div className="insight-dot" style={{ background: "hsl(var(--green))" }} /><div className="insight-text">{e}</div></div>
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
                  <button className="btn-primary" style={{ marginTop: 4 }} onClick={() => setStep(1)}>Trenger dette handling? →</button>
                )}
                <button className="btn-ghost" style={{ marginTop: 4 }} onClick={() => setStep(1)}>Hopp over refleksjon →</button>
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Handling eller regulering?</div>
              <div className="card-sub">Noen ganger trenger situasjonen handling. Andre ganger trenger kroppen bare ro.</div>
              <div className="divider" />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => finish("regulering")}>Bare regulering</button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => finish("handling")}>Planlegg handling</button>
              </div>
            </div>
            <div className="reframe-box">Hva ville du gjort hvis du stolte mer på denne relasjonen akkurat nå?</div>
          </div>
        )}
      </div>
    </div>
  );
}
