import { useState, useEffect } from "react";
import { QUALITIES, VALUES } from "@/lib/data";
import { TagSelector } from "@/components/TagSelector";
import { sGet, sSet } from "@/lib/storage";

interface IdentityScreenProps {
  onBack: () => void;
}

export function IdentityScreen({ onBack }: IdentityScreenProps) {
  const [tab, setTab] = useState(0);
  const [selQ, setSelQ] = useState<string[]>([]);
  const [selV, setSelV] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [voice, setVoice] = useState("");
  const [relations, setRelations] = useState("");
  const [tab0Saved, setTab0Saved] = useState(false);
  const [love, setLove] = useState("");
  const [friend, setFriend] = useState("");
  const [life, setLife] = useState("");
  const [tab2Saved, setTab2Saved] = useState(false);

  useEffect(() => {
    sGet<string[]>("id-qualities").then(d => d && setSelQ(d));
    sGet<string[]>("id-values").then(d => d && setSelV(d));
    sGet<{body: string; voice: string; relations: string}>("id-regulated").then(d => { if (d) { setBody(d.body || ""); setVoice(d.voice || ""); setRelations(d.relations || ""); }});
    sGet<{love: string; friend: string; life: string}>("id-future").then(d => { if (d) { setLove(d.love || ""); setFriend(d.friend || ""); setLife(d.life || ""); }});
  }, []);

  const toggleQ = async (q: string) => { const u = selQ.includes(q) ? selQ.filter(x => x !== q) : [...selQ, q]; setSelQ(u); await sSet("id-qualities", u); };
  const toggleV = async (v: string) => { const u = selV.includes(v) ? selV.filter(x => x !== v) : [...selV, v]; setSelV(u); await sSet("id-values", u); };

  const saveTab0 = async () => {
    await sSet("id-regulated", { body, voice, relations, ts: new Date().toISOString() });
    setTab0Saved(true);
    setTimeout(() => setTab0Saved(false), 2500);
  };
  const saveTab2 = async () => {
    await sSet("id-future", { love, friend, life, ts: new Date().toISOString() });
    setTab2Saved(true);
    setTimeout(() => setTab2Saved(false), 2500);
  };

  return (
    <div className="fade-up">
      <div className="module-header" style={{ background: "#3A5A2A" }}>
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Identitet & autentisitet</h1>
        <p>Hvem er du når du ikke er styrt av frykt?</p>
      </div>
      <div style={{ display: "flex", padding: "0 16px", borderBottom: "1px solid hsl(var(--surface2))", background: "hsl(var(--background))" }}>
        {["Regulert meg", "Verdier", "Fremtid"].map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, background: "none", border: "none", padding: "14px 4px", fontSize: 13, fontWeight: tab === i ? 600 : 400, color: tab === i ? "hsl(var(--green))" : "hsl(var(--text-muted))", borderBottom: tab === i ? "2px solid hsl(var(--green))" : "2px solid transparent", cursor: "pointer", fontFamily: "'Nunito'" }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {tab === 0 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: "0 0 14px" }}>
              <div className="card-title">Når jeg er regulert...</div>
              <div className="card-sub">Beskriv deg selv i disse øyeblikkene.</div>
              {[
                { label: "Kroppen føles...", ph: "Rolig, lett, tilstede...", val: body, set: setBody },
                { label: "Stemmen min er...", ph: "Varm, tydelig, rolig...", val: voice, set: setVoice },
                { label: "I relasjoner er jeg...", ph: "Åpen, til stede, ekte...", val: relations, set: setRelations },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                  <input className="ro-input" placeholder={item.ph} value={item.val} onChange={e => item.set(e.target.value)} />
                </div>
              ))}
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={saveTab0}>
                {tab0Saved ? "✓ Lagret" : "Lagre"}
              </button>
            </div>
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Mine ekte kvaliteter</div>
              <div className="card-sub">Kryss av — eller legg til egne. Lagres automatisk.</div>
              <TagSelector items={QUALITIES} selected={selQ} onToggle={toggleQ} storageKey="qualities" />
            </div>
          </div>
        )}
        {tab === 1 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Mine verdier</div>
              <div className="card-sub">Hva betyr mest for deg? Lagres automatisk.</div>
              <TagSelector items={VALUES} selected={selV} onToggle={toggleV} storageKey="values" />
            </div>
            {selV.length > 0 && <div className="fade-up reframe-box">Du lever etter: {selV.join(", ")}. Det er ikke tilfeldig — det er deg.</div>}
          </div>
        )}
        {tab === 2 && (
          <div className="fade-up">
            <div className="ro-card" style={{ margin: 0 }}>
              <div className="card-title">Min fremtidige retning</div>
              <div className="card-sub">Skriv fritt — ikke tenk for mye.</div>
              {[
                { q: "Hva slags mann vil jeg være i kjærlighet?", ph: "Jeg vil være en person som...", val: love, set: setLove },
                { q: "Hva slags venn vil jeg være?", ph: "I vennskap vil jeg...", val: friend, set: setFriend },
                { q: "Hva slags liv vil jeg bygge?", ph: "Jeg drømmer om et liv der...", val: life, set: setLife },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: 14, color: "hsl(var(--green))", marginBottom: 6 }}>{item.q}</div>
                  <textarea className="ro-textarea" rows={3} placeholder={item.ph} value={item.val} onChange={e => item.set(e.target.value)} />
                </div>
              ))}
              <button className="btn-primary" style={{ marginTop: 4, marginBottom: 16 }} onClick={saveTab2}>
                {tab2Saved ? "✓ Lagret" : "Lagre"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
