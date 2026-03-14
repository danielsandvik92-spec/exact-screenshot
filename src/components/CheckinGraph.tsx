import { CheckinEntry } from "@/lib/types";
import { MOOD_META } from "@/lib/data";

interface CheckinGraphProps {
  checkins: CheckinEntry[];
}

export function CheckinGraph({ checkins }: CheckinGraphProps) {
  if (!checkins || checkins.length === 0) {
    return <div style={{ textAlign: "center", padding: "20px 0", color: "hsl(var(--text-light))", fontSize: 13 }}>Ingen innsjekker ennå. Start med din første innsjekk ovenfor.</div>;
  }
  const last = checkins.slice(-14);
  return (
    <div>
      <div className="graph-bars">
        {last.map((c, i) => {
          const meta = MOOD_META.find(m => m.label === c.mood);
          const color = meta ? meta.color : "#2D4A3E";
          const h = Math.max(4, (c.energy / 10) * 72);
          return (
            <div key={i} className="graph-bar-col">
              <div className="graph-val">{c.energy}</div>
              <div className="graph-bar" style={{ height: h, background: color }} />
              <div className="graph-date">{c.date}</div>
            </div>
          );
        })}
      </div>
      <div className="mood-legend">
        {MOOD_META.map(m => (
          <div key={m.label} className="mood-dot-row">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
      {checkins.length >= 4 && (() => {
        const recent = checkins.slice(-3).map(c => c.energy);
        const older = checkins.slice(-7, -3).map(c => c.energy);
        if (older.length === 0) return null;
        const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const oAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const diff = rAvg - oAvg;
        if (Math.abs(diff) < 1) return null;
        return (
          <div className="reframe-box" style={{ marginTop: 10 }}>
            {diff > 0 ? `Reguleringen har gått opp ${diff.toFixed(1)} poeng de siste dagene. Det er fremgang.` : `De siste dagene har vært tyngre. Det er lov. Du er her fortsatt.`}
          </div>
        );
      })()}
    </div>
  );
}
