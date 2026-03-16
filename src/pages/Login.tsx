import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/app");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app" },
    });
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>

        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: "26px",
          color: "#2D4A3E",
          fontWeight: 400,
          margin: "0 0 8px 0",
        }}>
          {isRegister ? "Opprett konto" : "Velkommen tilbake"}
        </h2>

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "#F9FAF8",
            border: "1.5px solid #DFE5DC",
            borderRadius: "12px",
            fontFamily: "'Nunito', sans-serif",
            fontSize: "15px",
            color: "#2A2E28",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "#F9FAF8",
            border: "1.5px solid #DFE5DC",
            borderRadius: "12px",
            fontFamily: "'Nunito', sans-serif",
            fontSize: "15px",
            color: "#2A2E28",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "13px",
            color: "#9B6B8A",
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
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
          {loading ? "Venter..." : isRegister ? "Opprett konto" : "Logg inn"}
        </button>

        <button
          onClick={handleGoogle}
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

        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Nunito', sans-serif",
            fontSize: "14px",
            color: "#8E9B8A",
            cursor: "pointer",
            textDecoration: "underline",
            padding: "4px 0",
          }}
        >
          {isRegister ? "Har du allerede konto? Logg inn" : "Ny bruker? Opprett konto"}
        </button>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "12px",
          color: "#8E9B8A",
          textAlign: "center",
          marginTop: "8px",
        }}>
          Ved å logge inn godtar du vår{" "}
          <a href="/personvern" style={{ color: "#2D4A3E" }}>
            personvernserklæring
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;