import { useState, useEffect } from "react";
import { sGet, sSet } from "@/lib/storage";
import { AddCustomRow } from "./AddCustomRow";

interface TagSelectorProps {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  storageKey: string;
}

export function TagSelector({ items, selected, onToggle, storageKey }: TagSelectorProps) {
  const [custom, setCustom] = useState<string[]>([]);
  useEffect(() => { sGet<string[]>(`tags-${storageKey}`).then(d => d && setCustom(d)); }, [storageKey]);
  const addItem = async (label: string) => {
    const updated = [...custom, label];
    setCustom(updated);
    await sSet(`tags-${storageKey}`, updated);
  };
  const all = [...items, ...custom];
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 8 }}>
        {all.map((item, i) => (
          <div key={i} className={`tag-pill ${selected.includes(item) ? "active" : ""}`} onClick={() => onToggle(item)}>{item}</div>
        ))}
      </div>
      <AddCustomRow onAdd={addItem} />
    </>
  );
}
