import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReflection } from "@/lib/useReflection";
import { checkIsPlus } from "@/lib/supabase";

interface ReflectionBubbleProps {
  context: string;
  systemPrompt?: string;
  color?: "green" | "terra" | "purple";
  autoFetch?: boolean;
}

const COLOR_MAP = {
  green: { border: "hsl(var(--green))", text: "hsl(var(--green))", bg: "hsla(var(--green) / 0.06)" },
  terra: { border: "hsl(var(--terra))", text: "hsl(var(--terra))", bg: "hsla(var(--terra) / 0.06)" },
  purple: { border: "#6A5A9A", text: "#4A3A6A", bg: "rgba(106,90,154,0.06)" },
};

export function ReflectionBubble({
  context,
  systemPrompt,
  color = "green",
  autoFetch = true,
}: ReflectionBubbleProps) {
  const navigate = useNavigate();
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlus, setIsPlus] = useState<boolean | null>(null);

  const c = COLOR_MAP[color];

  useEffect(() => {
    checkIsPlus().then(setIsPlus);
  }, []);

  const fetch = async () => {
    setLoading(true);
    const result = await getReflection(context, systemPrompt);
    setText(result);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch && isPlus === true) fetch();
  }, [isPlus]);

  if (isPlus === null) return null;

  if (!isPlus) {
    return (
      <div style={{
        background: "rgba(155,107,138,0.06)",
        borderLeft: "3px solid #9B6B8A",
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        padding: "16px 18px",
        marginTop: 14,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#9B6B8A", marginBottom: 6, opacity: 0.7 }}>
          🌿 Refleksjon
        </div>
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          color: "hsl(var(--text-muted))",
          lineHeight: 1.7,
          marginBottom: 10,
        }}>
          AI-refleksjon er en Plus-funksjon. Oppgrader for å få en varm, personlig refleksjon etter hver øvelse.
        </div>
        <button
          onClick={() => navigate("/betaling")}
          style={{
            background: "#9B6B8A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ⭐ Bli Plus-medlem
        </button>
      </div>
    );
  }

  if (!text && !loading) {
    return (
      <button
        onClick={fetch}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: c.text, textDecoration: "underline",
          textUnderlineOffset: 3, padding: "4px 0", fontFamily: "'Nunito', sans-serif",
        }}
      >
        🌿 Få en refleksjon
      </button>
    );
  }

  if (loading) {
    return (
      <div style={{
        background: c.bg, borderLeft: `3px solid ${c.border}`,
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        padding: "16px 18px", marginTop: 14,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 13, color: "hsl(var(--text-light))", fontStyle: "italic" }}>
          Henter refleksjon...
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: c.bg, borderLeft: `3px solid ${c.border}`,
      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
      padding: "16px 18px", marginTop: 14,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 6, opacity: 0.7 }}>
        🌿 Refleksjon
      </div>
      <div style={{
        fontFamily: "'Lora', serif", fontStyle: "italic",
        fontSize: 14, color: c.text, lineHeight: 1.7,
      }}>
        {text}
      </div>
      <button
        onClick={fetch}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "hsl(var(--text-light))", marginTop: 8,
          textDecoration: "underline", textUnderlineOffset: 2,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        Ny refleksjon
      </button>
    </div>
  );
}