"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "@/types";
import {
  loadPet, savePet, petStage, careProgress, sessionsToNextStage,
  STAGE_LABELS, PET_NAMES, type PetKind, type PetState,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";

const AURA: Record<PetKind, string> = {
  dragao: "rgba(52,211,153,0.28)",
  monstrinho: "rgba(167,139,250,0.30)",
};

export function PetCompanion({ patientId, theme }: { patientId: string; theme: Theme }) {
  const isG = theme === "GAMIFIED";
  const [pet, setPet] = useState<PetState | null>(null);

  useEffect(() => { setPet(loadPet(patientId)); }, [patientId]);

  if (!pet) return null; // evita mismatch de hidratação até ler o localStorage

  const card = isG
    ? "bg-gray-800 border border-cyan-500/20"
    : "bg-white border-2 border-teal-100 shadow-lg";
  const titleC = isG ? "text-cyan-300" : "text-teal-700";
  const subC = isG ? "text-gray-400" : "text-teal-500";

  function choose(kind: PetKind) {
    const next = { ...(pet as PetState), kind };
    savePet(patientId, next);
    setPet(next);
  }

  // ── Ainda não escolheu ──────────────────────────────────────────────────
  if (!pet.kind) {
    return (
      <div className={`rounded-2xl p-4 ${card}`}>
        <p className={`font-bold mb-1 ${titleC}`}>Escolha seu bichinho 🥚</p>
        <p className={`text-xs mb-3 ${subC}`}>Ele cresce a cada treino que você faz!</p>
        <div className="grid grid-cols-2 gap-3">
          {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
            <button
              key={k}
              onClick={() => choose(k)}
              className={`rounded-2xl p-2 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                isG ? "bg-gray-900/60 border border-gray-700 hover:border-cyan-400"
                    : "bg-teal-50/60 border-2 border-teal-100 hover:border-teal-400"
              }`}
            >
              <div className="rounded-full" style={{ background: `radial-gradient(circle at 50% 45%, ${AURA[k]}, transparent 70%)` }}>
                <PetCreature kind={k} stage={2} size={96} />
              </div>
              <span className={`text-sm font-bold ${isG ? "text-gray-200" : "text-gray-700"}`}>{PET_NAMES[k]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Já tem bichinho ─────────────────────────────────────────────────────
  const stage = petStage(pet.care);
  const pct = Math.round(careProgress(pet.care) * 100);
  const faltam = sessionsToNextStage(pet.care);
  const isAdult = stage >= 3;

  return (
    <div className={`rounded-2xl p-4 ${card}`}>
      <div className="flex items-center justify-between mb-1">
        <p className={`font-bold ${titleC}`}>Seu {PET_NAMES[pet.kind].toLowerCase()}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isG ? "bg-cyan-500/15 text-cyan-300" : "bg-teal-100 text-teal-700"}`}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-full flex-shrink-0" style={{ background: `radial-gradient(circle at 50% 45%, ${AURA[pet.kind]}, transparent 70%)` }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
            <PetCreature kind={pet.kind} stage={stage} size={104} />
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${subC}`}>Carinho ❤️</span>
            <span className={`text-xs font-bold ${isG ? "text-cyan-300" : "text-teal-600"}`}>{isAdult ? "MÁX" : `${pct}%`}</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isG ? "bg-gray-700" : "bg-teal-100"}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isG ? "#22d3ee" : "#14b8a6" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className={`text-xs mt-2 ${subC}`}>
            {isAdult
              ? "Cresceu até o máximo! 🎉 Continue treinando pra ele ficar feliz."
              : `Faltam ${faltam} ${faltam === 1 ? "treino" : "treinos"} para evoluir 🌟`}
          </p>
        </div>
      </div>
    </div>
  );
}
