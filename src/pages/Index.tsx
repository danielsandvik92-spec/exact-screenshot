import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sGet, sSet } from "@/lib/storage";
import type { ScreenId, AppDB, CheckinEntry, EveningEvalEntry, AcuteSessionEntry, SocialSessionEntry, CriticSessionEntry, RelationSessionEntry } from "@/lib/types";
import { HomeScreen } from "@/screens/HomeScreen";
import { AcuteScreen } from "@/screens/AcuteScreen";
import { SocialScreen } from "@/screens/SocialScreen";
import { CriticScreen } from "@/screens/CriticScreen";
import { RelationScreen } from "@/screens/RelationScreen";
import { IdentityScreen } from "@/screens/IdentityScreen";
import { EmotionScreen } from "@/screens/EmotionScreen";
import { PatternsScreen } from "@/screens/PatternsScreen";
import { GratitudeScreen } from "@/screens/GratitudeScreen";

const Index = () => {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);
  const [eveningEvals, setEveningEvals] = useState<EveningEvalEntry[]>([]);
  const [acuteSessions, setAcuteSessions] = useState<AcuteSessionEntry[]>([]);
  const [socialSessions, setSocialSessions] = useState<SocialSessionEntry[]>([]);
  const [criticSessions, setCriticSessions] = useState<CriticSessionEntry[]>([]);
  const [relationSessions, setRelationSessions] = useState<RelationSessionEntry[]>([]);

useEffect(() => {
  if (!supabase) return;
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = "/";
    } else {
      console.log("Bruker innlogget:", data.session.user.id);
    }
  });
  sGet<CheckinEntry[]>("checkins").then(d => d && setCheckins(d));
  sGet<EveningEvalEntry[]>("evening-evals").then(d => d && setEveningEvals(d));
  sGet<AcuteSessionEntry[]>("acute-sessions").then(d => d && setAcuteSessions(d));
  sGet<SocialSessionEntry[]>("social-sessions").then(d => d && setSocialSessions(d));
  sGet<CriticSessionEntry[]>("critic-sessions").then(d => d && setCriticSessions(d));
  sGet<RelationSessionEntry[]>("relation-sessions").then(d => d && setRelationSessions(d));
}, []);

  const addCheckin = async (entry: CheckinEntry) => { const u = [...checkins, entry]; setCheckins(u); await sSet("checkins", u); };
  const addEveningEval = async (entry: EveningEvalEntry) => { const u = [...eveningEvals, entry]; setEveningEvals(u); await sSet("evening-evals", u); };
  const addAcuteSession = async (entry: AcuteSessionEntry) => { const u = [...acuteSessions, entry]; setAcuteSessions(u); await sSet("acute-sessions", u); };
  const addSocialSession = async (entry: SocialSessionEntry) => { const u = [...socialSessions, entry]; setSocialSessions(u); await sSet("social-sessions", u); };
  const addCriticSession = async (entry: CriticSessionEntry) => { const u = [...criticSessions, entry]; setCriticSessions(u); await sSet("critic-sessions", u); };
  const addRelationSession = async (entry: RelationSessionEntry) => { const u = [...relationSessions, entry]; setRelationSessions(u); await sSet("relation-sessions", u); };

  const db: AppDB = { checkins, eveningEvals, acuteSessions, socialSessions, criticSessions, relationSessions };

const navItems = [
  { icon: "🏠", label: "Hjem", id: "home" as ScreenId },
  { icon: "📊", label: "Mønstre", id: "patterns" as ScreenId },
];

const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen onNav={setScreen} db={db} addCheckin={addCheckin} addEveningEval={addEveningEval} />;
      case "acute": return <AcuteScreen onBack={() => setScreen("home")} addSession={addAcuteSession} onEmotion={() => setScreen("emotion")} />;
      case "social": return <SocialScreen onBack={() => setScreen("home")} addSession={addSocialSession} />;
      case "critic": return <CriticScreen onBack={() => setScreen("home")} addSession={addCriticSession} />;
      case "relation": return <RelationScreen onBack={() => setScreen("home")} addSession={addRelationSession} />;
      case "identity": return <IdentityScreen onBack={() => setScreen("home")} />;
      case "emotion": return <EmotionScreen onBack={() => setScreen("home")} />;
      case "patterns": return <PatternsScreen onBack={() => setScreen("home")} db={db} />;
      case "gratitude": return <GratitudeScreen onBack={() => setScreen("home")} />;
      default: return <HomeScreen onNav={setScreen} db={db} addCheckin={addCheckin} addEveningEval={addEveningEval} />;
    }
  };

  return (
    <div className="app-shell">
      {renderScreen()}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;