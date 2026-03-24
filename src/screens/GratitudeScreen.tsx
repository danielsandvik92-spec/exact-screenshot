import { useState } from "react";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import { ConfirmLeaveDialog } from "@/components/ConfirmLeaveDialog";

interface GratitudeScreenProps {
  onBack: () => void;
}

const QUESTIONS = [
  "Hva skjedde i dag som du ikke vil glemme?",
  "Hvem tenkte du på med varme i dag?",
  "Hva var du stolt av — stort eller lite?",
];

export function GratitudeScreen({ onBack }: GratitudeScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [current, setCurrent] = useState("");
  const [done, setDone] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleBack = () => {
    if (step > 0 && !done) setConfirmLeave(true);
    else onBack();
  };

  const handleNext = () => {
    const updated = [...answers];
    updated[step - 1] = current;
    setAnswers(updated);
    setCurrent("");
    if (step < 3) {
      setStep(step + 1);
    } else {
      const session = { answers: updated, ts: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem("gratitude-sessions") || "[]");
      localStorage.setItem("gratitude-sessions", JSON.stringify([...existing, session]));
      setDone(true);
    }
  };

  const reflectionContext = answers
    .map((a, i) => `${QUESTIONS[i]}\n${a || "(ikke besvart)"}`)
    .join("\n\n");

  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "hsl(var(--green))" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Det som var bra</h1>
          <p>Et sted å la det gode lande.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <div className="ro-card" style={{ margin: "0 0 14px" }}>
            {answers.map((a, i) => a && (
              <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-light))", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {QUESTIONS[i]}
                </div>
                <div style={{ fontSize: 14, color: "hsl(var(--text))", lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm støtteperson som leser gjennom det denne personen delte om dagen sin. Speiler tilbake noe du legger merke til — ikke analyser, ikke gi råd. Si noe sant og varmt om det de delte. Skriv på norsk, 2-3 setninger."
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
      <div className="module-header" style={{ background: "hsl(var(--green))" }}>
        <button className="back-btn" onClick={handleBack}>←</button>
        <h1>Det som var bra</h1>
        <p>Et sted å la det gode lande.</p>
      </div>

      <div className="scroll-area">
        {step === 0 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="ro-card" style={{ margin: 0 }}>
              <div style={{
                fontFamily: "'Lora', serif", fontStyle: "italic",
                fontSize: 15, color: "hsl(var(--green))", lineHeight: 1.8, marginBottom: 16,
              }}>
                Dette er ikke en øvelse i å tenke positivt.
              </div>
              <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", lineHeight: 1.8 }}>
                Det er en invitasjon til å legge merke til det som faktisk var bra — stort eller lite.
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(1)}>
              Jeg er klar
            </button>
          </div>
        )}

        {step >= 1 && step <= 3 && (
          <div className="fade-up" style={{ padding: "0 16px" }}>
            <div className="step-dots">
              {[1, 2, 3].map(i => (
                <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />
              ))}
            </div>
            <div className="ro-card" style={{ margin: 0 }}>
              <div style={{
                fontFamily: "'Lora', serif", fontStyle: "italic",
                fontSize: 16, color: "hsl(var(--green))", lineHeight: 1.7, marginBottom: 16,
              }}>
                {QUESTIONS[step - 1]}
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
              onClick={handleNext}
            >
              {step < 3 ? "Neste →" : "Avslutt"}
            </button>
            <button
              className="btn-ghost"
              style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }}
              onClick={handleNext}
            >
              Hopp over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
