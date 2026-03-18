import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "@/lib/supabase";

export function DeleteAccountSection() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const result = await deleteAccount();
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Noe gikk galt. Prøv igjen.");
      setLoading(false);
    }
  };

  return (
    <>
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px",
        }}>
          <div style={{
            background: "hsl(var(--white))",
            borderRadius: "var(--radius)",
            padding: "32px 24px 40px",
            width: "100%", maxWidth: 390,
          }}>
            <div style={{
              fontFamily: "'Lora', serif",
              fontSize: 20, color: "hsl(var(--text))",
              marginBottom: 12, lineHeight: 1.4,
            }}>
              Er du sikker på at du vil slette kontoen?
            </div>
            <div style={{
              fontSize: 14, color: "hsl(var(--text-muted))",
              lineHeight: 1.7, marginBottom: 24,
            }}>
              All data du har registrert i appen vil bli slettet permanent. Dette kan ikke angres.
            </div>
            {error && (
              <div style={{ fontSize: 13, color: "#9B6B8A", marginBottom: 12 }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-primary"
              >
                Nei, behold kontoen
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: "none", border: "none",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13, color: "hsl(var(--text-light))",
                  cursor: "pointer", textDecoration: "underline",
                  textUnderlineOffset: 3, padding: "8px 0",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Sletter..." : "Ja, slett kontoen min permanent"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        textAlign: "center",
        padding: "0 24px 48px",
      }}>
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: "none", border: "none",
            fontFamily: "'Nunito', sans-serif",
            fontSize: 12, color: "hsl(var(--text-light))",
            cursor: "pointer", textDecoration: "underline",
            textUnderlineOffset: 3, padding: 0,
          }}
        >
          Slett konto og all data
        </button>
      </div>
    </>
  );
}