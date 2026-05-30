"use client";

import { useEffect, useRef, useState } from "react";
import { AgentCharacter } from "./AgentCharacter";
import { agents } from "@/data/agents";
import type { AgentConfig } from "@/data/agents";

interface FallingAgent {
  id: string;
  agent: AgentConfig;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createFallingAgent(index: number): FallingAgent {
  const agent = agents[index % agents.length];
  return {
    id: `${agent.id}-${Date.now()}-${Math.random()}`,
    agent,
    x: randomBetween(5, 90),
    delay: randomBetween(0, 3),
    duration: randomBetween(4, 8),
    size: randomBetween(48, 80),
    rotation: randomBetween(-20, 20),
    rotationSpeed: randomBetween(-1, 1),
  };
}

interface FallingAgentsDemoProps {
  count?: number;
  height?: number | string;
  background?: string;
}

export function FallingAgentsDemo({
  count = 12,
  height = 400,
  background = "#EFF6FF",
}: FallingAgentsDemoProps) {
  const [fallingAgents, setFallingAgents] = useState<FallingAgent[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items: FallingAgent[] = [];
    for (let i = 0; i < count; i++) {
      items.push(createFallingAgent(i));
    }
    setFallingAgents(items);
  }, [count]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height,
        background,
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes agentFall {
          0%   { transform: translateY(-120px) rotate(var(--rot-start)); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(calc(var(--fall-height) + 120px)) rotate(var(--rot-end)); opacity: 0; }
        }
      `}</style>

      {fallingAgents.map((fa) => (
        <div
          key={fa.id}
          style={{
            position: "absolute",
            left: `${fa.x}%`,
            top: 0,
            animationName: "agentFall",
            animationDuration: `${fa.duration}s`,
            animationDelay: `${fa.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            // CSS vars for rotation
            ["--rot-start" as string]: `${fa.rotation}deg`,
            ["--rot-end" as string]: `${fa.rotation + fa.rotationSpeed * 30}deg`,
            ["--fall-height" as string]: typeof height === "number" ? `${height}px` : height,
          }}
        >
          <AgentCharacter
            agent={fa.agent.id}
            color={fa.agent.color}
            accessory={fa.agent.accessory}
            expression={fa.agent.expression}
            size={fa.size}
          />
        </div>
      ))}
    </div>
  );
}
