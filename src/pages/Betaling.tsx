cat > /workspaces/exact-screenshot/src/pages/Betaling.tsx << 'ENDOFFILE'
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        user_id: user.id,
        email: user.email,
        return_url: window.location.origin + "/app",
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
            Du har tilgang til AI-refleksjon etter alle øvelser.
          </p>
        </div>
      ) : (
        <>
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "15px",
            color: "#5E6B5A",
            lineHeight: 1.8,
            marginBottom: "32px",
          }}>
            Få tilgang til AI-refleksjon etter hver øvelse — en varm, ikke-dømmende stemme som hjelper deg å bearbeide det du nettopp kjente på.
          </p>

          <div style={{
            background: "#F9FAF8",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #DFE5DC",
            marginBottom: "24px",
          }}>
            <div style={{
              fontFamily: "'Lora', serif",
              fontSize: "22px",
              color: "#2D4A3E",
              marginBottom: "4px",
            }}>
              49 kr / mnd
            </div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "13px",
              color: "#8E9B8A",
              marginBottom: "20px",
            }}>
              Avslutt når som helst
            </div>

            {[
              "AI-refleksjon etter hver øvelse",
              "Sparringspartner i identitetsmodulen",
              "Støtter videre utvikling av appen",
            ].map((punkt) => (
              <div key={punkt} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "'Nunito', sans-serif",
                fontSize: "14px",
                color: "#5E6B5A",
                marginBottom: "10px",
              }}>
                <span style={{ color: "#2D4A3E", fontWeight: 600 }}>✓</span>
                {punkt}
              </div>
            ))}
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
            {loading ? "Venter..." : "Bli Plus-medlem"}
          </button>

          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "12px",
            color: "#8E9B8A",
            textAlign: "center",
            marginTop: "16px",
            lineHeight: 1.7,
          }}>
            Sikker betaling via Stripe. Du kan avslutte abonnementet når som helst.
          </p>
        </>
      )}
    </div>
  );
};

export default Betaling;
ENDOFFILE