import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReflection } from "@/lib/useReflection";
import { checkIsPlus } from "@/lib/supabase";

interface ReflectionBubbleProps {
  context: string;
  systemPrompt?: string;
  color?: "green" | "terra" | "purple";
  autoFetch?: boolean;
  onInsightReady?: (insight: string) => void;
}

const COLOR_MAP = {
  green: { border: "hsl(var(--green))", label: "hsl(var(--green))", bg: "hsla(var(--green) / 0.04)" },
  terra: { border: "hsl(var(--terra))", label: "hsl(var(--terra))", bg: "hsla(var(--terra) / 0.04)" },
  purple: { border: "#6A5A9A", label: "#6A5A9A", bg: "rgba(106,90,154,0.04)" },
};

export function ReflectionBubble({
  context,
  systemPrompt,
  color = "green",
  autoFetch = true,
  onInsightReady,
}: ReflectionBubbleProps) {
  const navigate = useNavigate();
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlus, setIsPlus] = useState<boolean | null>(null);

  const c = COLOR_MAP[color];

  useEffect(() => {
    checkIsPlus().then(setIsPlus);
  }, []);

  const fetchReflection = async () => {
    setLoading(true);
    const result = await getReflection(context, systemPrompt);
    setText(result);
    setLoading(false);
    if (result && onInsightReady) {
      onInsightReady(result);
    }
  };

  useEffect(() => {
    if (autoFetch && isPlus === true) fetchReflection();
  }, [isPlus]);

  if (isPlus === null) return null;

  if (!isPlus) {
    return (
      <div style={{
        background: "hsla(var(--surface) / 0.8)",
        borderLeft: "3px solid hsl(var(--sand))",
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        padding: "16px 18px",
        marginTop: 14,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 6, opacity: 0.8 }}>
          🌿 Refleksjon
        </div>
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          color: "hsl(var(--text-muted))",
          lineHeight: 1.7,
          marginBottom: 10,
        }}>
          AI-refleksjon er tilgjengelig for Plus-medlemmer. Oppgrader for å få en personlig refleksjon etter hver øvelse.
        </div>
        <button
          onClick={() => navigate("/betaling")}
          style={{
            background: "hsl(var(--green))",
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
        onClick={fetchReflection}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "hsl(var(--text-muted))",
          textDecoration: "underline", textUnderlineOffset: 3,
          padding: "4px 0", fontFamily: "'Nunito', sans-serif",
        }}
      >
        🌿 Få en refleksjon
      </button>
    );
  }

  if (loading) {
    return (
      <div style={{
        background: c.bg,
        borderLeft: `3px solid ${c.border}`,
        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
        padding: "16px 18px",
        marginTop: 14,
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
      background: c.bg,
      borderLeft: `3px solid ${c.border}`,
      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
      padding: "16px 18px",
      marginTop: 14,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.label, marginBottom: 8, opacity: 0.7 }}>
        🌿 Refleksjon
      </div>
      <div style={{
        fontFamily: "'Lora', serif",
        fontStyle: "italic",
        fontSize: 14,
        color: "hsl(var(--text))",
        lineHeight: 1.8,
      }}>
        {text}
      </div>
    </div>
  );
}