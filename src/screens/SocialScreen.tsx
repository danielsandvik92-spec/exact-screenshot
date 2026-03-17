import { useState } from "react";
import { SOCIAL_CATS, REFRAMES_SOCIAL } from "@/lib/data";
import { ChipSelector } from "@/components/ChipSelector";
import { ReflectionBubble } from "@/components/ReflectionBubble";
import type { SocialSessionEntry } from "@/lib/types";

interface SocialScreenProps {
  onBack: () => void;
  addSession: (entry: SocialSessionEntry) => Promise<void>;
}

export function SocialScreen({ onBack, addSession }: SocialScreenProps) {
  const [mode, setMode] = useState<"choose" | "free" | "guided" | null>("choose");
  const [step, setStep] = useState(0);

  // Fri skriving
  const [freeText, setFreeText] = useState("");

  // Guided
  const [category, setCategory] = useState<string | null>(null);
  const [fear, setFear] = useState("");
  const [evidence, setEvidence] = useState("");
  const [friendView, setFriendView] = useState("");

  // Felles
  const [reframe, setReframe] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reflectionContext, setReflectionContext] = useState("");

  const totalSteps = mode === "free" ? 2 : 3;

  const finish = async () => {
    const context = mode === "free"
      ? `Brukeren skrev fritt etter en sosial situasjon: "${freeText}". Valgt reframe: "${reframe || "ingen"}".`
      : `Brukeren hadde kategori: "${category}". Frykt: "${fear}". Bevis: "${evidence}". Venneperspektiv: "${friendView}". Valgt reframe: "${reframe || "ingen"}".`;

    setReflectionContext(context);

    const entry: SocialSessionEntry = {
      category: category || "fri skriving",
      what: freeText,
      fear,
      evidence,
      neutral: "",
      friendView,
      reframe: reframe || "",
      ts: new Date().toISOString()
    };
    await addSession(entry);
    setDone(true);
  };

  // ── Ferdig-skjerm ──────────────────────────────────────────────
  if (done) {
    return (
      <div className="fade-up">
        <div className="module-header" style={{ background: "hsl(var(--mauve))" }}>
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Etter sosiale situasjoner</h1>
          <p>For når hodet ikke vil la det gå.</p>
        </div>
        <div style={{ padding: "16px" }}>
          <div className="ro-card" style={{ margin: "0 0 14px" }}>
            <div className="reframe-box">
              Du tok deg tid til å stoppe opp og se det tydeligere. Det er ikke lite. 🌿
            </div>
          </div>
          <ReflectionBubble
            context={reflectionContext}
            systemPrompt="Du er en varm, rolig venn. Brukeren har nettopp grublet over en sosial situasjon og prøvd å se den tydeligere. Ikke analyser det de har skrevet — bare anerkjenn at de tok seg tid, og si noe rolig og avdramatiserende om at hjernen gjør dette fordi den bryr seg, ikke fordi noe gikk galt. Skriv på norsk, 2-3 setninger. Ikke bruk fagord."
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
      <div className="module-header" style={{ background: "hsl(var(--mauve))" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Etter sosiale situasjoner</h1>
        <p>For når hodet ikke vil la det gå.</p>
      </div>
      <div className="scroll-area" style={{ padding: "0 16px" }}>

        {/* Steg-indikatorer */}
        {mode !== "choose" && (
          <div className="step-dots">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`step-dot ${step === i ? "active" : step > i ? "done" : ""}`} />
            ))}
          </div>
        )}

        {/* ── Velg inngang ─────────────────────────────────────── */}
        {mode === "choose" && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva trenger du nå?</div>
              <div className="card-sub">Velg den som kjennes riktig i dag.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                <div className="entry-card" onClick={() => { setMode("free"); setStep(0); }}>
                  <div style={{ fontSize: 20 }}>✍️</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Bare skriv det ut</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
                      Ingen struktur — bare få det ut av hodet
                    </div>
                  </div>
                </div>
                <div className="entry-card" onClick={() => { setMode("guided"); setStep(0); }}>
                  <div style={{ fontSize: 20 }}>🧭</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Hjelp meg å sortere det</div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
                      Guided — steg for steg
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FRI SKRIVING ─────────────────────────────────────── */}
        {mode === "free" && step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva spinner i hodet ditt?</div>
              <div className="card-sub">
                Ikke tenk på hvordan du formulerer det. Bare skriv.
              </div>
              <textarea
                className="ro-textarea"
                rows={6}
                placeholder="Det som skjedde var..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
              />
            </div>
            <div className="reframe-box">
              Hjernen replayer sosiale situasjoner fordi den bryr seg om deg — ikke fordi noe gikk galt.
            </div>
            {freeText.length > 10 && (
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(1)}>
                Videre →
              </button>
            )}
          </div>
        )}

        {mode === "free" && step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Velg en setning å bære med deg</div>
              <div className="card-sub">Eller avslutt uten — det er også helt greit.</div>
              <div style={{ marginTop: 12 }}>
                {REFRAMES_SOCIAL.map((r, i) => (
                  <div
                    key={i}
                    className={`ro-chip ${reframe === r ? "selected" : ""}`}
                    style={{ display: "block", marginBottom: 8, padding: "14px 16px" }}
                    onClick={() => setReframe(reframe === r ? null : r)}
                  >
                    "{r}"
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>
              Avslutt
            </button>
          </div>
        )}

        {/* ── GUIDED ───────────────────────────────────────────── */}
        {mode === "guided" && step === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Hva handler det om?</div>
              <div className="card-sub">Velg det som kjennes nærmest.</div>
              <ChipSelector
                items={SOCIAL_CATS.map(c => ({ id: c, label: c }))}
                selected={category}
                onSelect={setCategory}
                storageKey="social-cats"
                color="terra"
              />
            </div>
            {category && (
              <div className="fade-up">
                <div className="ro-card" style={{ margin: "12px 0 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Hva frykter du at de tenker?
                  </div>
                  <textarea
                    className="ro-textarea"
                    rows={3}
                    placeholder="Min største frykt er..."
                    value={fear}
                    onChange={e => setFear(e.target.value)}
                  />
                </div>
                {fear.length > 5 && (
                  <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setStep(1)}>
                    Videre →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {mode === "guided" && step === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Stemmer det egentlig?</div>
              <div className="card-sub">
                Hjernen fyller inn hull med det den frykter mest — ikke nødvendigvis sannheten.
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Har du konkrete holdepunkter for frykten?
                </div>
                <textarea
                  className="ro-textarea"
                  rows={2}
                  placeholder="Faktiske ting som skjedde, ikke tolkninger..."
                  value={evidence}
                  onChange={e => setEvidence(e.target.value)}
                />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Hva ville du tenkt om en venn som gjorde det samme?
                </div>
                <textarea
                  className="ro-textarea"
                  rows={2}
                  placeholder="Jeg ville tenkt at hun/han..."
                  value={friendView}
                  onChange={e => setFriendView(e.target.value)}
                />
              </div>
            </div>
            <div className="reframe-box">
              Du er mye snillere mot andre enn mot deg selv. Det du nettopp svarte — gjelder det ikke deg også?
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(2)}>
              Videre →
            </button>
          </div>
        )}

        {mode === "guided" && step === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "16px 0 0" }}>
              <div className="card-title">Velg en setning å bære med deg</div>
              <div className="card-sub">Eller avslutt uten — det er også helt greit.</div>
              <div style={{ marginTop: 12 }}>
                {REFRAMES_SOCIAL.map((r, i) => (
                  <div
                    key={i}
                    className={`ro-chip ${reframe === r ? "selected" : ""}`}
                    style={{ display: "block", marginBottom: 8, padding: "14px 16px" }}
                    onClick={() => setReframe(reframe === r ? null : r)}
                  >
                    "{r}"
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={finish}>
              Avslutt
            </button>
          </div>
        )}

      </div>
    </div>
  );
}