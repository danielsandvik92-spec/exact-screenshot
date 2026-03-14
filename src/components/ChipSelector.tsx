import { useState, useEffect } from "react";
import { sGet, sSet } from "@/lib/storage";
import { AddCustomRow } from "./AddCustomRow";

interface ChipItem {
  id: string;
  label: string;
  emoji?: string;
}

interface ChipSelectorProps {
  items: (ChipItem | string)[];
  selected: string | null;
  onSelect: (id: string) => void;
  storageKey: string;
  color?: "green" | "terra";
}

export function ChipSelector({ items, selected, onSelect, storageKey, color = "green" }: ChipSelectorProps) {
  const [custom, setCustom] = useState<ChipItem[]>([]);
  useEffect(() => { sGet<ChipItem[]>(`chips-${storageKey}`).then(d => d && setCustom(d)); }, [storageKey]);
  const addItem = async (label: string) => {
    const updated = [...custom, { id: `c-${label}`, label }];
    setCustom(updated);
    await sSet(`chips-${storageKey}`, updated);
  };
  const normalize = (item: ChipItem | string): ChipItem => {
    if (typeof item === "string") return { id: item, label: item };
    return item;
  };
  const all = [...items.map(normalize), ...custom];
  return (
    <>
      <div className="chip-grid">
        {all.map(item => {
          const isSel = selected === item.id || selected === item.label;
          return (
            <div key={item.id}
              className={`ro-chip ${isSel ? (color === "terra" ? "selected-terra" : "selected") : ""}`}
              style={isSel && color === "terra" ? { borderColor: "hsl(var(--terra))" } : {}}
              onClick={() => onSelect(item.id)}>
              {item.emoji}{item.emoji ? " " : ""}{item.label}
            </div>
          );
        })}
      </div>
      <AddCustomRow onAdd={addItem} />
    </>
  );
}
