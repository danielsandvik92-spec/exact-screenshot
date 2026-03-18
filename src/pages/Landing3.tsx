import { useState } from "react";
import { useNavigate } from "react-router-dom";

const choices = [
  { id: "forsta", label: "Jeg vil forstå meg selv bedre" },
  { id: "regulere", label: "Jeg vil regulere sterke følelser" },
  { id: "terapi", label: "Jeg bruker appen som støtte ved siden av terapi" },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.583 9 3.583z" fill="#EA4335"/>
  </svg>
);

const Landing3 = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    localStorage.setItem("ro-har-sett-intro", "ja");
    navigate("/innlogging");
  };

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
            onClick={handleContinue}
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
            onClick={handleContinue}
            style={{
              width: "100%",
              padding: "16px",
              background: "#F9FAF8",
              color: "#2D4A3E",
              border: "1.5px solid #DFE5DC",
              borderRadius: "12px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <GoogleIcon />
            Fortsett med Google
          </button>
        </div>

        <button
          onClick={handleContinue}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Nunito', sans-serif",
            fontSize: "13px",
            color: "#B8C4B0",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            padding: 0,
          }}
        >
          Hopp over
        </button>

      </div>
    </div>
  );
};

export default Landing3;