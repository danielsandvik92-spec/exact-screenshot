import { useNavigate } from "react-router-dom";

const Landing2 = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EFF2EE",
      display: "flex",
      flexDirection: "column",
      padding: "40px 24px",
      maxWidth: "430px",
      margin: "0 auto",
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px" }}>

        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: "28px",
          color: "#2D4A3E",
          lineHeight: 1.5,
          fontWeight: 400,
          margin: 0,
        }}>
          Ikke et kurs. Ikke terapi. Et stille verktøy for hverdagen.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[
            { icon: "🌬️", title: "Reguler det som er vanskelig akkurat nå", sub: "Når alarmen er høy og kroppen ikke roer seg." },
            { icon: "🧭", title: "Forstå mønstrene som gjentar seg", sub: "Se deg selv tydeligere over tid." },
            { icon: "🪞", title: "Finn tilbake til deg selv — på din måte", sub: "Ingen fasit. Bare deg og det som er der." },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                fontSize: 24,
                width: 44, height: 44,
                background: "rgba(45,74,62,0.08)",
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 15, fontWeight: 600,
                  color: "#2D4A3E", marginBottom: 3,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13, color: "#8E9B8A", lineHeight: 1.6,
                }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "13px",
          color: "#8E9B8A",
          lineHeight: 1.7,
          margin: 0,
          fontStyle: "italic",
        }}>
          Du trenger ikke ha en diagnose. Du trenger ikke være i krise. Du trenger bare å ville kjenne etter.
        </p>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "12px",
          color: "#B8C4B0",
          lineHeight: 1.6,
          margin: 0,
        }}>
          🔒 Det du deler er bare ditt. Ingen andre ser det — og du kan slette alt når som helst.
        </p>

      </div>

      <button
        onClick={() => navigate("/kom-i-gang")}
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
          marginTop: "32px",
        }}
      >
        Fortsett
      </button>
    </div>
  );
};

export default Landing2;