import { useState } from "react";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import { ConfirmLeaveDialog } from "@/components/ConfirmLeaveDialog";

interface CompassionScreenProps {
  onBack: () => void;
}

type Mode = "good" | "hard" | null;

const QUESTIONS: Record<"good" | "hard", [string, string]> = {
  good: [
    "Hva har du gjort for deg selv nylig som du fortjener å anerkjenne?",
    "Hva ville du sagt til en god venn som hadde gjort det samme?",
  ],
  hard: [
    "Hva er du hard mot deg selv for akkurat nå?",
    "Hva ville du sagt til en god venn som hadde det slik du har det nå?",
  ],
};

export function CompassionScreen({ onBack }: CompassionScreenProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const [qStep, setQStep] = useState(0);
  const [answers, setAnswers] = useState(["", ""]);
  const [current, setCurrent] = useState("");
  const [done, setDone] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleBack = () => {
    if (step > 0 && !done) setConfirmLeave(true);
    else onBack();
  };

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setStep(1);
    setQStep(0);
    setCurrent("");
  };

  const handleNextQuestion = () => {
    const updated = [...answers];
    updated[qStep] = current;
    setAnswers(updated);
    setCurrent("");
    if (qStep < 1) {
      setQStep(1);
    } else {
      setStep(2);
    }
  };

  const handleToReframe = () => setStep(3);

  const questions = mode ? QUESTIONS[mode] : QUESTIONS.good;
  const friendAnswer = answers[1];

  const reflectionContext = mode
    ? `Modus: ${mode === "good" ? "anerkjennelse" : "hard mot seg selv"}\n\n${questions[0]}\n${answers[0] || "(ikke besvart)"}\n\n${questions[1]}\n${answers[1] || "(ikke besvart)"}`
    : "";

  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "#9B6B8A" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Vær snill mot deg selv</h1>
          <p>Du fortjener den samme varmen du gir andre.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm støtteperson som har lest det denne personen delte om seg selv. Speiler tilbake noe du legger merke til — spesielt mellom det de er hard mot seg selv for og det de ville sagt til en venn. Si noe sant og varmt, uten å gi råd. Skriv på norsk, 2-3 setninger."
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
      <div className="module-header" style={{ background: "#9B6B8A" }}>
        <button className="back-btn" onClick={handleBack}>←</button>
        <h1>Vær snill mot deg selv</h1>
        <p>Du fortjener den samme varmen du gir andre.</p>
      </div>

      <div className="scroll-area">

        {step === 0 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div style={{
                fontFamily: "'Lora', serif", fontStyle: "italic",
                fontSize: 15, color: "#9B6B8A", lineHeight: 1.8, marginBottom: 12,
              }}>
                Dette er ikke en øvelse i å tenke positivt.
              </div>
              <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", lineHeight: 1.8, marginBottom: 20 }}>
                Det er en invitasjon til å møte deg selv med den samme omsorgen du ville gitt en god venn.
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-light))", marginBottom: 12 }}>
                Hvor er du akkurat nå?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "good" as Mode, label: "Jeg har det bra og vil anerkjenne meg selv" },
                  { id: "hard" as Mode, label: "Jeg er hard mot meg selv akkurat nå" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleModeSelect(opt.id)}
                    style={{
                      padding: "14px 16px",
                      background: "hsl(var(--surface))",
                      border: "1.5px solid hsl(var(--surface2))",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 14, color: "hsl(var(--text))",
                      fontWeight: 500, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="step-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`step-dot ${
                  i === 0 ? "done" :
                  i === 1 && qStep === 0 ? "active" :
                  i === 2 && qStep === 1 ? "active" :
                  i < (qStep + 1) ? "done" : ""
                }`} />
              ))}
            </div>
            <div className="ro-card" style={{ margin: 0 }}>
              <div style={{
                fontFamily: "'Lora', serif", fontStyle: "italic",
                fontSize: 15, color: "#9B6B8A", lineHeight: 1.7, marginBottom: 16,
              }}>
                {questions[qStep]}
              </div>
              <textarea
                className="ro-textarea"
                rows={4}
                placeholder="Skriv fritt..."
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 14 }}
              onClick={handleNextQuestion}
            >
              {qStep < 1 ? "Neste →" : "Videre"}
            </button>
            <button
              className="btn-ghost"
              style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }}
              onClick={handleNextQuestion}
            >
              Hopp over
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="step-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`step-dot ${i <= 2 ? "done" : ""}`} />
              ))}
            </div>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="reframe-box" style={{ marginBottom: 16 }}>
                Det du ville sagt til en venn — det fortjener du selv å høre.
              </div>
              {friendAnswer ? (
                <div style={{
                  fontFamily: "'Lora', serif", fontStyle: "italic",
                  fontSize: 15, color: "hsl(var(--text))", lineHeight: 1.8,
                  padding: "16px 18px",
                  background: "rgba(155,107,138,0.06)",
                  borderLeft: "3px solid #9B6B8A",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                }}>
                  "{friendAnswer}"
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", fontStyle: "italic" }}>
                  Du hoppet over vennesvaret — og det er greit. Du kan bære det uten ord.
                </div>
              )}
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => { setStep(3); setDone(true); }}>
              Avslutt
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
