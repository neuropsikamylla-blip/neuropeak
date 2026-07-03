"use client";

import { useEffect, useState } from "react";
import type { PetKind, AccessoryId, PetColorId } from "@/lib/pet";

// Bichinho renderizado por IMAGEM (arte da Kamylla). Dragão e monstrinho, cada
// um com suas cores e poses. As imagens ficam em /petimg com margem generosa e
// fundo transparente, então o bicho aparece sempre inteiro (nunca cortado).

type Mood = "idle" | "sleep";

function fileFor(kind: PetKind, stage: number, mood: Mood, pose: string): string {
  if (stage <= 0) return "ovo";
  if (mood === "sleep") return "dormir";
  return pose;
}

export function PetCreature({ kind, stage, size = 140, color, mood = "idle", pose = "idle" }: {
  kind: PetKind; stage: number; size?: number; accessory?: AccessoryId; color?: PetColorId; mood?: Mood; pose?: string;
}) {
  const isDragon = kind === "dragao";
  const prefix = isDragon ? "dragao" : "monstro";
  const cor = isDragon ? (color === "vinho" ? "vinho" : "verde") : (color === "azul" ? "azul" : "roxo");
  const file = fileFor(kind, stage, mood, pose);
  const src = `/petimg/${prefix}-${cor}-${file}.png`;

  // Se a pose não existir pra este bicho, cai no "idle" (evita imagem quebrada).
  const [current, setCurrent] = useState(src);
  useEffect(() => { setCurrent(src); }, [src]);

  const sc = stage <= 0 ? 0.9 : stage === 1 ? 0.82 : stage === 2 ? 0.92 : 1.0;
  const px = Math.round(size * sc);
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt=""
        draggable={false}
        onError={() => setCurrent(`/petimg/${prefix}-${cor}-idle.png`)}
        style={{
          display: "block", width: px, height: "auto", maxHeight: size, margin: "0 auto",
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.16))",
        }}
      />
    </div>
  );
}
