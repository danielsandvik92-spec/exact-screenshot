import { useState, useEffect } from "react";
import { BODY_AREAS, SURFACE_EMOTIONS } from "@/lib/data";
import { ReflectionBubble } from "@/components/ReflectionBubble";

interface EmotionScreenProps {
  onBack: () => void;
}

export function EmotionScreen({ onBack }: EmotionScreenProps) {
  const [step, setStep] = useState(0);
  const [bodyArea, setBodyArea] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [surfaceEmotion, setSurfaceEmotion] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [deeperText, setDeeperText] = useState("");
  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  // Sittesteg
  const [sitDuration, setSitDuration] = useState<number | null>(null);
  const [sitTimer, setSitTimer] = useState(0);
  const [sitRunning, setSitRunning] = useState(false);
  const [sitDone, setSitDone] = useState(false);

  const selected = SURFACE_EMOTIONS.find(e => e.id === surfaceEmotion);
  const bodyAreaLabel = BODY_AREAS.find(b => b.id === bodyArea)?.label || "kroppen";

  useEffect(() => {
    if (!sitRunning || sitDuration === null) return;
    if (sitTimer <= 0) {
      setSitRunning(false);
      setSitDone(true);
      return;
    }
    const iv = setInterval(() => {
      setSitTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [sitRunning, sitTimer]);

  const startSit = (seconds: number) => {
    setSitDuration(seconds);
    setSitTimer(seconds);
    setSitRunning(true);
    setSitDone(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}`;
  };

  const finish = () => {
    setReflectionContext(
      `Brukeren kjente noe i ${bodyAreaLabel} (intensitet ${intensity}/10). Overflate-følelse: "${selected?.label || "ukjent"}". Det de skrev: "${freeText || "ingenting"}". Dypere lag: "${deeperText || "ingenting"}".`
    );
    setDone(true);
  };

  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "linear-gradient(135deg, #3A2D5A, #4A3A6A)" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Kjenn etter</h1>
          <p>Ikke for å forstå — bare for å være til stede med det som er.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm, stille støtteperson. Brukeren har nettopp tatt seg tid til å kjenne etter — vært til stede med noe inni seg uten å prøve å løse det. Det er modig og sjeldent. Les hva de delte med stor varsomhet. Ikke analyser, ikke forklar, ikke oppmuntre med tomme ord. Si noe stille og sant om det de sitter med. Skriv på norsk, 2-3 setninger."
            color="purple"
            autoFetch={true}
          />
          <button
            className="btn-primary"
            style={{ background: "#4A3A6A", marginTop: 14 }}
            onClick={onBack}
          >
            Gå tilbake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "linear-gradient(135deg, #3A2D5A, #4A3A6A)" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Kjenn etter</h1>
        <p>Ikke for å forstå — bare for å være til stede med det som er.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>
        <div className="step-dots" style={{ paddingTop: 20 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`}
              style={step === i ? { background: "#6A5A9A" } : step > i ? { background: "#6A5A9A", opacity: 0.35 } : {}} />
          ))}
        </div>

        {step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0", borderColor: "rgba(106,90,154,0.2)" }}>
              <div className="card-title" style={{ color: "#4A3A6A" }}>Hvor kjenner du det i kroppen?</div>
              <div className="card-sub">Ikke tenk — bare legg merke til. Er det noe sted det kjennes tett, tungt eller urolig?</div>
              <div className="chip-grid" style={{ marginTop: 14 }}>
                {BODY_AREAS.map(b => (
                  <div key={b.id}
                    className={`ro-chip ${bodyArea === b.id ? "selected" : ""}`}
                    style={bodyArea === b.id ? { borderColor: "#6A5A9A", background: "rgba(106,90,154,0.08)", color: "#4A3A6A" } : {}}
                    onClick={() => setBodyArea(b.id)}>
                    {b.emoji} {b.label}
                  </div>
                ))}
              </div>
            </div>
            {bodyArea && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "12px 0 0", borderColor: "rgba(106,90,154,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4A3A6A", marginBottom: 10 }}>Hvor sterkt kjennes det? (0–10)</div>
                  <div className="scale-row">
                    {[...Array(11)].map((_, i) => (
                      <div key={i}
                        className={`scale-dot ${intensity === i ? "active" : ""}`}
                        style={intensity === i ? { background: "#6A5A9A", borderColor: "#6A5A9A" } : {}}
                        onClick={() => setIntensity(i)}>{i}</div>
                    ))}
                  </div>
                </div>
                {intensity !== null && (
                  <button className="btn-primary" style={{ background: "#4A3A6A", marginTop: 4 }} onClick={() => setStep(1)}>
                    Videre →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0", borderColor: "rgba(106,90,154,0.2)" }}>
              <div className="card-title" style={{ color: "#4A3A6A" }}>Hva er det nærmeste ordet?</div>
              <div className="card-sub">Dette er ikke diagnosen — bare overflaten. Vi går dypere etterpå.</div>
              <div className="chip-grid" style={{ marginTop: 14 }}>
                {SURFACE_EMOTIONS.map(e => (
                  <div key={e.id}
                    className={`ro-chip ${surfaceEmotion === e.id ? "selected" : ""}`}
                    style={surfaceEmotion === e.id ? { borderColor: "#6A5A9A", background: "rgba(106,90,154,0.08)", color: "#4A3A6A" } : {}}
                    onClick={() => setSurfaceEmotion(e.id)}>
                    {e.label}
                  </div>
                ))}
              </div>
            </div>
            {surfaceEmotion && selected && (
              <div className="fade-up">
                <div style={{
                  background: "rgba(106,90,154,0.07)", border: "1px solid rgba(106,90,154,0.2)",
                  borderRadius: "var(--radius-sm)", padding: "16px 18px", margin: "12px 0",
                  fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14, color: "#4A3A6A", lineHeight: 1.7
                }}>
                  {selected.under}
                </div>
                <button className="btn-primary" style={{ background: "#4A3A6A" }} onClick={() => setStep(2)}>
                  Ja, jeg er klar →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0", borderColor: "rgba(106,90,154,0.2)" }}>
              <div className="card-title" style={{ color: "#4A3A6A" }}>Sitt med det et øyeblikk</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>
                Ikke løs noe. Ikke forstå noe. Bare la følelsen få lov til å være der — i kroppen, ikke i hodet.
              </div>

              {/* Velg varighet */}
              {!sitRunning && !sitDone && (
                <div className="fade-up">
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 10, textAlign: "center" }}>
                    Hvor lenge vil du sitte med det?
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {[
                      { label: "60 sek", seconds: 60 },
                      { label: "90 sek", seconds: 90 },
                      { label: "3 min", seconds: 180 },
                    ].map(opt => (
                      <button
                        key={opt.seconds}
                        onClick={() => startSit(opt.seconds)}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          background: "rgba(106,90,154,0.08)",
                          border: "1.5px solid rgba(106,90,154,0.25)",
                          borderRadius: "var(--radius-sm)",
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#4A3A6A",
                          cursor: "pointer",
                          transition: "all 0.18s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ display: "block", textAlign: "center", width: "100%", marginTop: 12 }}
                    onClick={() => { setSitDone(true); }}
                  >
                    Hopp over
                  </button>
                </div>
              )}

              {/* Nedtelling */}
              {sitRunning && !sitDone && (
                <div className="fade-up" style={{ textAlign: "center" }}>
                  <div style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #6A5A9A, #4A3A6A)",
                    margin: "20px auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 0 50px rgba(106,90,154,0.25)",
                    animation: "breathe37 8s ease-in-out infinite",
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{formatTime(sitTimer)}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>bare vær her</div>
                  </div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", fontStyle: "italic", lineHeight: 1.7 }}>
                    Kjenn at du puster.<br />La følelsen være der uten å gjøre noe med den.
                  </div>
                </div>
              )}

              {/* Ferdig */}
              {sitDone && (
                <div className="fade-up" style={{ textAlign: "center" }}>
                  <div style={{
                    width: 130,
                    height: 130,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #6A5A9A, #4A3A6A)",
                    margin: "20px auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: "0 0 50px rgba(106,90,154,0.15)",
                    opacity: 0.7,
                  }}>
                    <div style={{ fontSize: 28 }}>🌿</div>
                  </div>
                  <div style={{ fontSize: 14, color: "#4A3A6A", fontFamily: "'Lora', serif", fontStyle: "italic", lineHeight: 1.7, marginBottom: 16 }}>
                    Du kan gå videre nå — eller bli litt til.
                  </div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 8, textAlign: "left" }}>
                    Hvis du vil — skriv hva som var der. Ikke for å forstå det, bare for å gi det rom.
                  </div>
                  <textarea
                    className="ro-textarea"
                    rows={4}
                    placeholder="Det som var der var..."
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    style={{ borderColor: "rgba(106,90,154,0.3)" }}
                  />
                </div>
              )}
            </div>

            {sitDone && (
              <div className="fade-up">
                <button className="btn-primary" style={{ background: "#4A3A6A", marginTop: 4 }} onClick={() => setStep(3)}>
                  Gå dypere →
                </button>
                <button className="btn-ghost" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 8 }} onClick={() => setStep(3)}>
                  Hopp over
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0", borderColor: "rgba(106,90,154,0.2)" }}>
              <div className="card-title" style={{ color: "#4A3A6A" }}>Hva er under?</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>
                {selected?.under || "Under overflaten — hva er egentlig der?"}
              </div>
              <textarea
                className="ro-textarea"
                rows={4}
                placeholder="Under det jeg kjenner på overflaten er det kanskje..."
                value={deeperText}
                onChange={e => setDeeperText(e.target.value)}
                style={{ borderColor: "rgba(106,90,154,0.3)" }}
              />
            </div>
            <div style={{
              background: "rgba(106,90,154,0.05)", border: "1px solid rgba(106,90,154,0.15)",
              borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: 12,
              fontSize: 13, color: "hsl(var(--text-muted))", lineHeight: 1.7, fontStyle: "italic"
            }}>
              Du trenger ikke finne svar. Det holder å ha sett etter.
            </div>
            <button className="btn-primary" style={{ background: "#4A3A6A" }} onClick={finish}>
              Avslutt
            </button>
            <button className="btn-ghost" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 8 }} onClick={finish}>
              Avslutt uten å skrive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}