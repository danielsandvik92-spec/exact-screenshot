import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Betaling = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("profiles")
        .select("is_plus")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.is_plus) setIsPlus(true);
        });
    });
  }, []);

const handleBetaling = async () => {
  if (!supabase) return;
  setLoading(true);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      user_id: session.user.id,
      email: session.user.email,
      return_url: window.location.origin + "/app",
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error || !data?.url) {
    console.error("Feil ved opprettelse av betalingsside:", error);
    setLoading(false);
    return;
  }

  window.location.href = data.url;
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EFF2EE",
      display: "flex",
      flexDirection: "column",
      padding: "60px 24px 40px",
      maxWidth: "430px",
      margin: "0 auto",
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          fontFamily: "'Nunito', sans-serif",
          fontSize: "15px",
          color: "#5E6B5A",
          cursor: "pointer",
          textAlign: "left",
          marginBottom: "32px",
          padding: 0,
        }}
      >
        ← Tilbake
      </button>

      <h1 style={{
        fontFamily: "'Lora', serif",
        fontSize: "26px",
        color: "#2D4A3E",
        fontWeight: 400,
        marginBottom: "8px",
      }}>
        Ro & Retning Plus
      </h1>

      {isPlus ? (
        <div style={{
          background: "#F9FAF8",
          borderRadius: "16px",
          padding: "24px",
          border: "1.5px solid #2D4A3E",
          marginTop: "16px",
        }}>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "15px",
            color: "#2D4A3E",
            lineHeight: 1.8,
            margin: 0,
            fontWeight: 600,
          }}>
            ✓ Du har Ro & Retning Plus
          </p>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "14px",
            color: "#5E6B5A",
            lineHeight: 1.8,
            marginTop: "8px",
          }}>
            Du blir møtt med noe sant og varmt etter hver økt. Vi er glad du er her.
          </p>
        </div>
      ) : (
        <>
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: "18px",
            color: "#2D4A3E",
            lineHeight: 1.6,
            fontWeight: 400,
            fontStyle: "italic",
            marginBottom: "28px",
          }}>
            For deg som vil gå et steg dypere — og bli sett i det du bærer på.
          </p>

          <div style={{
            background: "#F9FAF8",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #DFE5DC",
            marginBottom: "24px",
          }}>
            {[
              {
                title: "Bli møtt etter hver økt",
                body: "En varm, ikke-dømmende stemme reflekterer tilbake det du nettopp delte — ikke for å analysere, men for å la det lande.",
              },
              {
                title: "En samtalepartner som kjenner deg",
                body: "I identitetsmodulen går du dypere med en sparringspartner som tar svarene dine på alvor og stiller det neste riktige spørsmålet.",
              },
              {
                title: "Ingen begrensninger — bare deg",
                body: "Bruk modulene så mye du trenger, uten å tenke på tilgang. Gratis-versjonen er fin, men Plus er for de som vil gi seg selv mer rom.",
              },
            ].map((punkt) => (
              <div key={punkt.title} style={{ marginBottom: "20px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  marginBottom: "4px",
                }}>
                  <span style={{ color: "#2D4A3E", fontWeight: 600, fontSize: "13px" }}>✓</span>
                  <span style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "14px",
                    color: "#2D4A3E",
                    fontWeight: 600,
                  }}>{punkt.title}</span>
                </div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "13px",
                  color: "#8E9B8A",
                  lineHeight: 1.7,
                  paddingLeft: "21px",
                }}>
                  {punkt.body}
                </div>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #DFE5DC", paddingTop: "20px", marginTop: "4px" }}>
              <div style={{
                fontFamily: "'Lora', serif",
                fontSize: "22px",
                color: "#2D4A3E",
                marginBottom: "2px",
              }}>
                49 kr / mnd
              </div>
              <div style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "13px",
                color: "#8E9B8A",
              }}>
                Avslutt når som helst — ingen binding
              </div>
            </div>
          </div>

          <button
            onClick={handleBetaling}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "#2D4A3E",
              color: "#F9FAF8",
              border: "none",
              borderRadius: "12px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Venter..." : "Ja, jeg vil gå dypere"}
          </button>

          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "12px",
            color: "#8E9B8A",
            textAlign: "center",
            marginTop: "16px",
            lineHeight: 1.7,
          }}>
            Sikker betaling via Stripe. Gratis-versjonen forblir alltid tilgjengelig.
          </p>
        </>
      )}
    </div>
  );
};

export default Betaling;