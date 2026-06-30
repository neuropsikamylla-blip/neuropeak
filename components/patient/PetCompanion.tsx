"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "@/types";
import {
  loadPet, savePet, petStage, careProgress, sessionsToNextStage, petDisplayName,
  STAGE_LABELS, PET_NAMES, ACCESSORIES, SUGGESTED_NAMES,
  type PetKind, type PetState, type AccessoryId,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";

const AURA: Record<PetKind, string> = {
  dragao: "rgba(52,211,153,0.28)",
  monstrinho: "rgba(167,139,250,0.30)",
};

// Fala curta e contextual do bichinho. Determinística (varia conforme o carinho,
// sem aleatoriedade) para não trocar a cada re-render.
function petSpeech(pet: PetState): string {
  const stage = petStage(pet.care);
  const faltam = sessionsToNextStage(pet.care);
  const name = petDisplayName(pet);
  let pool: string[];
  if (pet.care === 0) {
    pool = [`Oi! Eu sou ${name}. Bora treinar? 🎮`, `Que bom te ver! Vamos começar? ✨`];
  } else if (stage >= 3) {
    pool = [`Cresci graças a você! 💖`, `Curtiu meu acessório? 😎`, `Bora treinar mais um pouquinho!`];
  } else if (faltam === 1) {
    pool = [`Tô quase crescendo! Só mais 1 treino! 🌟`, `Falta pouquinho pra eu evoluir! 💪`];
  } else {
    pool = [`Bora fazer um treino hoje? 💪`, `Tô com vontade de crescer! 🌱`, `Eu confio em você! Vamos lá! ⭐`];
  }
  return pool[pet.care % pool.length];
}

export function PetCompanion({ patientId, theme }: { patientId: string; theme: Theme }) {
  const isG = theme === "GAMIFIED";
  const [pet, setPet] = useState<PetState | null>(null);
  const [pendingKind, setPendingKind] = useState<PetKind | null>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => { setPet(loadPet(patientId)); }, [patientId]);

  if (!pet) return null; // evita mismatch de hidratação até ler o localStorage

  const card = isG
    ? "bg-gray-800 border border-cyan-500/20"
    : "bg-white border-2 border-teal-100 shadow-lg";
  const titleC = isG ? "text-cyan-300" : "text-teal-700";
  const subC = isG ? "text-gray-400" : "text-teal-500";

  function persist(next: PetState) { savePet(patientId, next); setPet(next); }

  function confirmName() {
    if (!pendingKind) return;
    const name = nameInput.trim();
    persist({ ...(pet as PetState), kind: pendingKind, name: name || PET_NAMES[pendingKind] });
    setPendingKind(null);
    setNameInput("");
  }

  // ── Passo 2: dar um nome ────────────────────────────────────────────────
  if (!pet.kind && pendingKind) {
    return (
      <div className={`rounded-2xl p-4 ${card}`}>
        <p className={`font-bold mb-3 ${titleC}`}>Como seu {PET_NAMES[pendingKind].toLowerCase()} vai se chamar?</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full flex-shrink-0" style={{ background: `radial-gradient(circle at 50% 45%, ${AURA[pendingKind]}, transparent 70%)` }}>
            <PetCreature kind={pendingKind} stage={2} size={84} />
          </div>
          <div className="flex-1">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value.slice(0, 14))}
              placeholder={PET_NAMES[pendingKind]}
              className={`w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none ${
                isG ? "bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 focus:border-cyan-400"
                    : "bg-teal-50 border-2 border-teal-100 text-gray-800 placeholder-teal-300 focus:border-teal-400"
              }`}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_NAMES[pendingKind].map((n) => (
                <button
                  key={n}
                  onClick={() => setNameInput(n)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isG ? "bg-gray-900/70 border border-gray-700 text-gray-300"
                        : "bg-teal-50 border border-teal-200 text-teal-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setPendingKind(null); setNameInput(""); }}
            className={`px-3 h-10 rounded-full text-sm font-semibold ${isG ? "text-gray-400" : "text-teal-500"}`}
          >
            Voltar
          </button>
          <button
            onClick={confirmName}
            className={`flex-1 h-10 rounded-full text-sm font-bold text-white ${isG ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-gradient-to-r from-teal-500 to-cyan-500"}`}
          >
            Pronto! 🎉
          </button>
        </div>
      </div>
    );
  }

  // ── Passo 1: escolher o bichinho ────────────────────────────────────────
  if (!pet.kind) {
    return (
      <div className={`rounded-2xl p-4 ${card}`}>
        <p className={`font-bold mb-1 ${titleC}`}>Escolha seu bichinho 🥚</p>
        <p className={`text-xs mb-3 ${subC}`}>Ele cresce a cada treino que você faz!</p>
        <div className="grid grid-cols-2 gap-3">
          {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setPendingKind(k)}
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
  const accessory: AccessoryId = pet.accessory ?? "coroa";
  const speech = petSpeech(pet);
  const bubbleBg = isG ? "#0f172a" : "#ccfbf1";
  const bubbleTx = isG ? "#a5f3fc" : "#0f766e";

  return (
    <div className={`rounded-2xl p-4 ${card}`}>
      <div className="flex items-center justify-between mb-1">
        <p className={`font-bold ${titleC}`}>{petDisplayName(pet)}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isG ? "bg-cyan-500/15 text-cyan-300" : "bg-teal-100 text-teal-700"}`}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      {/* Balão de fala do bichinho */}
      <div className="relative mb-2 ml-1 w-fit max-w-full">
        <motion.div
          key={speech}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl px-3 py-1.5 text-xs font-semibold"
          style={{ background: bubbleBg, color: bubbleTx }}
        >
          {speech}
        </motion.div>
        <div className="absolute -bottom-1 left-5 w-3 h-3 rotate-45" style={{ background: bubbleBg }} />
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-full flex-shrink-0" style={{ background: `radial-gradient(circle at 50% 45%, ${AURA[pet.kind]}, transparent 70%)` }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
            <PetCreature kind={pet.kind} stage={stage} size={104} accessory={accessory} />
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
              ? "Cresceu até o máximo! 🎉 Escolha um acessório:"
              : `Faltam ${faltam} ${faltam === 1 ? "treino" : "treinos"} para evoluir 🌟`}
          </p>
        </div>
      </div>

      {/* Acessórios — desbloqueiam quando vira adulto */}
      {isAdult && (
        <div className="flex gap-2 mt-3">
          {ACCESSORIES.map((a) => {
            const sel = accessory === a.id;
            return (
              <button
                key={a.id}
                onClick={() => persist({ ...pet, accessory: a.id })}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all active:scale-95 border ${
                  sel
                    ? (isG ? "bg-cyan-500/15 border-cyan-400" : "bg-teal-100 border-teal-400")
                    : (isG ? "bg-gray-900/50 border-gray-700" : "bg-teal-50/60 border-teal-100")
                }`}
              >
                <span className="text-lg leading-none">{a.emoji}</span>
                <span className={`text-[10px] font-semibold ${isG ? "text-gray-300" : "text-teal-700"}`}>{a.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
