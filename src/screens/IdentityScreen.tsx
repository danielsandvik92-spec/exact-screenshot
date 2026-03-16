import { useState, useEffect } from "react";
import { sGet, sSet } from "@/lib/storage";
import { ReflectionBubble } from "@/components/ReflectionBubble";

interface IdentityScreenProps {
  onBack: () => void;
}

const QUESTIONS = {
  oyeblikk: [
    "Tenk på et øyeblikk der du kjente deg mest deg selv. Hva skjedde?",
    "Når var sist du gjorde noe som føltes virkelig meningsfylt?",
    "Hva har du gjort den siste måneden som du er stille stolt av?",
    "Når glemmer du tid og sted fordi du er så til stede i det du gjør?",
    "Beskriv et øyeblikk der du kjente at du var akkurat der du skulle være.",
  ],
  verdier: [
    "Hva er du villig til å stå for når det koster deg noe?",
    "Hva sårer deg mest — og hva sier det om hva du bryr deg om?",
    "Når har du sagt ja til noe, men ment nei? Hva skjedde inni deg?",
    "Hva ville du ikke gitt slipp på uansett hva?",
    "Hva gjør deg sint eller lei deg — og hva sier det om verdiene dine?",
  ],
  fremtid: [
    "Hva ville du gjort mer av hvis du ikke var redd for hva andre tenker?",
    "Hvem beundrer du — og hva ved dem kjenner du igjen i deg selv?",
    "Hva vil du at folk som kjenner deg godt skal si om deg?",
    "Hvis du visste at du ikke kunne mislykkes — hva ville du gjort?",
    "Hva vil du at livet ditt skal handle om om ti år?",
  ],
};

function pickQuestions(answered: string[]): { kategori: string; spørsmål: string }[] {
  const result = [];
  for (const [kategori, spørsmål] of Object.entries(QUESTIONS)) {
    const ubesvarte = spørsmål.filter(s => !answered.includes(s));
    const pool = ubesvarte.length > 0 ? ubesvarte : spørsmål;
    const valgt = pool[Math.floor(Math.random() * pool.length)];
    result.push({ kategori, spørsmål: valgt });
  }
  return result;
}

export function IdentityScreen({ onBack }: IdentityScreenProps) {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<{ kategori: string; spørsmål: string }[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [answered, setAnswered] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");

  useEffect(() => {
    sGet<string[]>("id-answered-questions").then(d => {
      const prev = d || [];
      setAnswered(prev);
      setQuestions(pickQuestions(prev));
    });
  }, []);

  const handleNext = async () => {
    const newAnswers = [...answers];
    newAnswers[step] = currentAnswer;
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (step < 2) {
      setStep(step + 1);
    } else {
      const newAnswered = [...answered, ...questions.map(q => q.spørsmål)];
      await sSet("id-answered-questions", newAnswered);
      await sSet("id-session-" + Date.now(), {
        questions: questions.map(q => q.spørsmål),
        answers: newAnswers,
        ts: new Date().toISOString(),
      });
      setDone(true);
    }
  };

  const getContext = () => {
    return questions.map((q, i) =>
      `Spørsmål: "${q.spørsmål}"\nSvar: "${answers[i]}"`
    ).join("\n\n");
  };

  if (questions.length === 0) return null;

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#3A5A2A" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Hvem er du egentlig?</h1>
        <p>Ikke for å finne et svar — men for å utforske.</p>
      </div>

      <div style={{ padding: "16px" }}>
        {!done ? (
          <div className="fade-up">
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 0 20px",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i === step ? "hsl(var(--green))" : i < step ? "hsl(var(--green))" : "hsl(var(--surface2))",
                  opacity: i < step ? 0.4 : 1,
                  transform: i === step ? "scale(1.25)" : "scale(1)",
                  transition: "all 0.25s",
                }} />
              ))}
            </div>

            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "hsl(var(--text-light))",
                marginBottom: 12,
              }}>
                {questions[step]?.kategori === "oyeblikk" ? "Øyeblikk" :
                 questions[step]?.kategori === "verdier" ? "Verdier" : "Fremtid"}
              </div>

              <div style={{
                fontFamily: "'Lora', serif",
                fontSize: 18,
                color: "hsl(var(--green))",
                lineHeight: 1.6,
                marginBottom: 20,
                fontStyle: "italic",
              }}>
                {questions[step]?.spørsmål}
              </div>

              <textarea
                className="ro-textarea"
                rows={5}
                placeholder="Skriv fritt — det finnes ingen feil svar her..."
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                style={{ marginBottom: 16 }}
              />

              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={currentAnswer.trim().length < 3}
                style={{ opacity: currentAnswer.trim().length < 3 ? 0.5 : 1 }}
              >
                {step < 2 ? "Neste spørsmål →" : "Avslutt økten"}
              </button>

              <button
                className="btn-ghost"
                onClick={handleNext}
                style={{ display: "block", width: "100%", textAlign: "center", marginTop: 8 }}
              >
                Hopp over dette spørsmålet
              </button>
            </div>
          </div>
        ) : (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Økten er fullført</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>
                Du tok deg tid til å kjenne etter hvem du er. Det er ikke lite.
              </div>

              {questions.map((q, i) => (
                <div key={i} style={{
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: i < 2 ? "1px solid hsl(var(--surface2))" : "none",
                }}>
                  <div style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "hsl(var(--text-muted))",
                    marginBottom: 6,
                  }}>
                    {q.spørsmål}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "hsl(var(--text))",
                    lineHeight: 1.7,
                  }}>
                    {answers[i] || <span style={{ color: "hsl(var(--text-light))", fontStyle: "italic" }}>Hoppet over</span>}
                  </div>
                </div>
              ))}
            </div>

            <ReflectionBubble
              context={getContext()}
              systemPrompt="Du er en varm, nysgjerrig samtalepartner. Brukeren har nettopp svart på tre spørsmål om hvem de er. Les svarene deres nøye. Reflekter tilbake ett eller to mønstre du legger merke til — ikke analyser, men si hva du hører. Still gjerne ett enkelt oppfølgingsspørsmål til slutt. Skriv på norsk, 3-5 setninger."
              color="green"
              autoFetch={true}
            />

            <button
              className="btn-secondary"
              style={{ marginTop: 14, width: "100%" }}
              onClick={onBack}
            >
              Tilbake til hjem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}