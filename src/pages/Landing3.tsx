import { useState } from "react";
import { useNavigate } from "react-router-dom";

const choices = [
  { id: "forsta", label: "Jeg vil forstå meg selv bedre" },
  { id: "regulere", label: "Jeg vil regulere sterke følelser" },
  { id: "terapi", label: "Jeg bruker appen som støtte ved siden av terapi" },
];

const Landing3 = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

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
          Hva passer best for deg akkurat nå?
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => setSelected(choice.id)}
              style={{
                padding: "16px 18px",
                background: selected === choice.id ? "rgba(45,74,62,0.08)" : "#F9FAF8",
                border: selected === choice.id ? "1.5px solid #2D4A3E" : "1.5px solid #DFE5DC",
                borderRadius: "12px",
                fontFamily: "'Nunito', sans-serif",
                fontSize: "15px",
                color: selected === choice.id ? "#2D4A3E" : "#5E6B5A",
                fontWeight: selected === choice.id ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                lineHeight: 1.5,
              }}
            >
              {selected === choice.id ? "✓ " : ""}{choice.label}
            </button>
          ))}
        </div>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "13px",
          color: "#8E9B8A",
          lineHeight: 1.7,
          margin: 0,
        }}>
          Dette hjelper appen å møte deg der du er. Du kan endre det når som helst.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={() => navigate("/innlogging")}
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
            Fortsett med e-post
          </button>

          <button
            onClick={() => navigate("/innlogging")}
            style={{
              width: "100%",
              padding: "16px",
              background: "transparent",
              color: "#2D4A3E",
              border: "1.5px solid #2D4A3E",
              borderRadius: "12px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Fortsett med Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing3;
