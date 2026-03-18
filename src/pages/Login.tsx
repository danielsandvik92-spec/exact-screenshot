import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!supabase) return;
    if (isRegister && !consent) {
      setError("Du må godta personvernserklæringen for å opprette konto.");
      return;
    }
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

        {isRegister && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{
                marginTop: 3,
                width: 18,
                height: 18,
                accentColor: "#2D4A3E",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <label
              htmlFor="consent"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "13px",
                color: "#5E6B5A",
                lineHeight: 1.6,
                cursor: "pointer",
              }}
            >
              Jeg godtar{" "}
              <a href="/personvern" style={{ color: "#2D4A3E", textDecoration: "underline", fontWeight: 700 }}>
                personvernserklæringen
              </a>{" "}
              og samtykker til at Ro & Retning lagrer dataen jeg registrerer i appen.
            </label>
          </div>
        )}

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
          disabled={loading || (isRegister && !consent)}
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
            cursor: isRegister && !consent ? "not-allowed" : "pointer",
            opacity: loading || (isRegister && !consent) ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Venter..." : isRegister ? "Opprett konto" : "Logg inn"}
        </button>

        <button
          onClick={handleGoogle}
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
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.583 9 3.583z" fill="#EA4335"/>
          </svg>
          Fortsett med Google
        </button>

        <button
          onClick={() => { setIsRegister(!isRegister); setConsent(false); setError(null); }}
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

      </div>
    </div>
  );
};

export default Login;