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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>
        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: "26px",
          color: "#2D4A3E",
          lineHeight: 1.4,
          fontWeight: 400,
          margin: 0,
        }}>
          Ro og Retning er et verktøy for deg som vil forstå deg selv bedre.
        </h2>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "15px",
          color: "#5E6B5A",
          lineHeight: 1.8,
          margin: 0,
        }}>
          Kanskje kjenner du på sterke følelser som er vanskelige å håndtere. Kanskje er du hard mot deg selv etter sosiale situasjoner. Kanskje jobber du med noe i terapi og vil ha støtte mellom timene.
        </p>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "14px",
          color: "#8E9B8A",
          lineHeight: 1.7,
          margin: 0,
        }}>
          Appen er bygget på metoder fra psykologisk forskning og klinisk praksis — men den er ikke et kurs, og den er ikke terapi. Den er et varmt, strukturert verktøy du kan bruke i hverdagen.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "8px 0" }}>
          {[
            { icon: "🌿", text: "Reguler det som er vanskelig" },
            { icon: "🧭", text: "Forstå mønstrene dine" },
            { icon: "🪞", text: "Finn veien tilbake til deg selv" },
          ].map((item) => (
            <div key={item.text} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "15px",
              color: "#2D4A3E",
              fontWeight: 600,
            }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {item.text}
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
          Det du deler her er bare ditt. Ingen andre ser det — og du kan slette alt når som helst.
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
