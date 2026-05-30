"use client";

import { AgentCharacter } from "./AgentCharacter";
import type { AgentConfig } from "@/data/agents";

interface AgentCardProps {
  agent: AgentConfig;
  selected?: boolean;
  onClick?: () => void;
  size?: number;
  /** Índice da variante de imagem (0 = principal, 1 = alternativa). Default: 0 */
  variant?: number;
}

export function AgentCard({ agent, selected = false, onClick, size = 80, variant = 0 }: AgentCardProps) {
  const imageSrc = agent.images.length > 0
    ? agent.images[variant % agent.images.length].src
    : undefined;
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "16px 12px 12px",
        background: "#FFFFFF",
        border: selected ? "2.5px solid #2563EB" : "2px solid #F1F5F9",
        borderRadius: 16,
        boxShadow: selected
          ? "0 0 0 4px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.12s",
        transform: selected ? "scale(1.03)" : "scale(1)",
        outline: "none",
        userSelect: "none",
        width: size + 40,
        minWidth: 100,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#93C5FD";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#F1F5F9";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        }
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            background: "#2563EB",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l2.8 2.8L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <AgentCharacter
        agent={agent.id}
        color={agent.color}
        accessory={agent.accessory}
        expression={agent.expression}
        size={size}
        selected={selected}
        imageSrc={imageSrc}
      />

      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: selected ? "#2563EB" : "#475569",
          marginTop: 2,
        }}
      >
        {agent.name}
      </span>
    </button>
  );
}
