"use client";

import { useState } from "react";
import { agents } from "@/data/agents";
import { AgentCard } from "./AgentCard";
import type { AgentId } from "@/data/agents";

interface AgentGridProps {
  selectedId?: AgentId;
  onSelect?: (id: AgentId) => void;
  cardSize?: number;
}

export function AgentGrid({ selectedId, onSelect, cardSize = 80 }: AgentGridProps) {
  const [localSelected, setLocalSelected] = useState<AgentId | undefined>(selectedId);

  const selected = onSelect !== undefined ? selectedId : localSelected;
  const handleSelect = (id: AgentId) => {
    if (onSelect) {
      onSelect(id);
    } else {
      setLocalSelected(id);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 12,
        width: "100%",
      }}
    >
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          selected={selected === agent.id}
          onClick={() => handleSelect(agent.id)}
          size={cardSize}
        />
      ))}
    </div>
  );
}
