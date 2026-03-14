import { useState } from "react";

interface AddCustomRowProps {
  placeholder?: string;
  onAdd: (text: string) => void;
}

export function AddCustomRow({ placeholder, onAdd }: AddCustomRowProps) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const t = draft.trim();
    if (t) { onAdd(t); setDraft(""); }
  };
  return (
    <div className="add-row">
      <input className="add-input" placeholder={placeholder || "+ Legg til eget..."} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
      <button className="add-btn" onClick={submit}>+</button>
    </div>
  );
}
