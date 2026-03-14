import { useNavigate } from "react-router-dom";

const Landing1 = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EFF2EE",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 32px 40px",
      maxWidth: "430px",
      margin: "0 auto",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "auto",
      }}>
        <span style={{ fontSize: "22px" }}>🌿</span>
        <span style={{
          fontFamily: "'Lora', serif",
          fontSize: "20px",
          color: "#2D4A3E",
          fontWeight: 400,
        }}>
          Ro & Retning
        </span>
      </div>

      <div style={{ textAlign: "center", padding: "0 8px" }}>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: "30px",
          color: "#2D4A3E",
          lineHeight: 1.6,
          fontWeight: 400,
          margin: 0,
        }}>
          Et sted å lande.<br />
          Et sted å kjenne etter.<br />
          Et sted å finne veien<br />tilbake til deg selv.
        </h1>
      </div>

      <div style={{ width: "100%", marginTop: "auto", paddingTop: "48px" }}>
        <button
          onClick={() => navigate("/om-appen")}
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
          }}
        >
          Fortsett
        </button>
      </div>
    </div>
  );
};

export default Landing1;