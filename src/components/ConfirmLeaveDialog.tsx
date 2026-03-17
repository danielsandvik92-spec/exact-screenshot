interface ConfirmLeaveDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmLeaveDialog({ onConfirm, onCancel }: ConfirmLeaveDialogProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "hsl(var(--white))",
        borderRadius: "var(--radius) var(--radius) 0 0",
        padding: "28px 24px 36px",
        width: "100%", maxWidth: 430,
        animation: "fadeUp 0.2s ease forwards",
      }}>
        <div style={{
          fontFamily: "'Lora', serif",
          fontSize: 17,
          color: "hsl(var(--green))",
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          Er du sikker på at du vil avbryte?
        </div>
        <div style={{
          fontSize: 13,
          color: "hsl(var(--text-muted))",
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          Det du har skrevet vil ikke bli lagret.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" onClick={onCancel}>
            Fortsett her
          </button>
          <button className="btn-ghost" style={{ textAlign: "center" }} onClick={onConfirm}>
            Ja, gå tilbake
          </button>
        </div>
      </div>
    </div>
  );
}