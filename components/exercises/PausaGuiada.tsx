"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Pausa guiada após 3 erros seguidos — épico de padronização Cogmed
// (COGMED-PADRONIZACAO-PROPOSTA.md). Princípio: fadiga gera erros em cascata;
// uma pausa curta recupera a concentração. O overlay não tem cronômetro rígido:
// o tempo ATIVO do exercício (useTimedProgress) já para sozinho sem interação,
// então a pausa não consome a sessão.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onContinuar: () => void;
}

export function PausaGuiada({ onContinuar }: Props) {
  return (
    <div
      role="dialog"
      aria-label="Pausa para respirar"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(20,30,48,0.55)",
        backdropFilter: "blur(3px)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#FDFEFF",
          borderRadius: 22,
          padding: "28px 24px",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(10,20,40,0.35)",
        }}
      >
        {/* círculo de respiração (CSS puro; discreto) */}
        <div
          aria-hidden
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #7FB2F0, #4F8FEA)",
            animation: "np-respira 4s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes np-respira {
            0%, 100% { transform: scale(0.82); opacity: 0.75; }
            50%      { transform: scale(1.06); opacity: 1; }
          }
        `}</style>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#2C4257", marginBottom: 8 }}>
          Hora de uma pausa curta
        </h2>
        <p style={{ fontSize: 13.5, color: "#5C7A94", lineHeight: 1.45, marginBottom: 18 }}>
          Respire fundo algumas vezes, alongue o corpo ou beba um pouco de água.
          Quando se sentir pronto, é só continuar.
        </p>
        <button
          onClick={onContinuar}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #4F8FEA, #3B79D9)",
            color: "#fff",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(79,143,234,0.4)",
          }}
        >
          Estou pronto, continuar
        </button>
      </div>
    </div>
  );
}
