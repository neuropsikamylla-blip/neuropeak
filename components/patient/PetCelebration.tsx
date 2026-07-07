"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "@/types";
import { petStage, careProgress, STAGE_LABELS, PET_NAMES, type PetKind, type AccessoryId, type PetColorId } from "@/lib/pet";
import { Heart } from "lucide-react";
import { PetCreature } from "./PetCreature";

export function PetCelebration({
  kind, careBefore, careAfter, theme, onContinue, name, accessory, xpGained, color,
}: {
  kind: PetKind; careBefore: number; careAfter: number; theme: Theme; onContinue: () => void;
  name?: string; accessory?: AccessoryId; xpGained?: number; color?: PetColorId;
}) {
  const isG = theme === "GAMIFIED";
  const stageBefore = petStage(careBefore);
  const stageAfter = petStage(careAfter);
  const evolved = stageAfter > stageBefore;
  const petName = name?.trim() || PET_NAMES[kind];

  // anima a barra de carinho do valor anterior para o novo
  const [pct, setPct] = useState(Math.round(careProgress(careBefore) * 100));
  useEffect(() => {
    const t = setTimeout(() => setPct(Math.round(careProgress(careAfter) * 100)), 350);
    return () => clearTimeout(t);
  }, [careAfter]);

  const bg = isG
    ? "bg-gray-950"
    : "bg-[#F6F8FC]";
  const card = isG
    ? "bg-gray-800 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)]"
    : "bg-white border border-[#E2E8F0] shadow-xl";
  const titleC = isG ? "text-cyan-300" : "text-[#173B78]";
  const subC = isG ? "text-gray-400" : "text-[#667085]";
  const btn = isG
    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
    : "bg-gradient-to-r from-[#173B78] to-[#1D4ED8] text-white";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
      <div className={`relative rounded-3xl p-7 max-w-sm w-full text-center overflow-hidden ${card}`}>
        {/* confete quando evolui */}
        {evolved && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute top-0"
                style={{ left: `${(i * 7 + 4) % 100}%` }}
                initial={{ y: -20, opacity: 0, rotate: 0 }}
                animate={{ y: 320, opacity: [0, 1, 1, 0], rotate: 360 }}
                transition={{ duration: 1.8, delay: 0.1 + (i % 5) * 0.12, ease: "easeIn", repeat: Infinity, repeatDelay: 0.6 }}
              >
                <span style={{ display: "block", width: 9, height: 9, borderRadius: i % 2 ? 9 : 2, background: ["#E8B547", "#1D4ED8", "#DBEAFE", "#173B78"][i % 4] }} />
              </motion.span>
            ))}
          </div>
        )}

        <p className={`text-xs font-bold mb-2 ${subC}`}>Treino concluído!</p>

        {!!xpGained && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-1"
            style={{ color: "#8A6410", background: "#FBF3DC", border: "1px solid #E8B54755" }}>
            +{xpGained} XP
          </div>
        )}

        <motion.div
          className="mx-auto rounded-full"
          style={{ width: 150, background: "radial-gradient(circle at 50% 45%, #EEF2FF, transparent 70%)" }}
          initial={evolved ? { scale: 0.5, rotate: -8 } : { scale: 0.9 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: evolved ? 0.25 : 0 }}
        >
          <PetCreature kind={kind} stage={stageAfter} size={150} accessory={accessory} color={color} />
        </motion.div>

        <h2 className={`text-xl font-black mt-3 mb-1 inline-flex items-center justify-center gap-2 ${titleC}`}>
          {evolved ? `${petName} evoluiu!` : <>+1 carinho <Heart size={18} fill={isG ? "#22d3ee" : "#E8B547"} stroke="none" /></>}
        </h2>
        <p className={`text-sm mb-5 ${subC}`}>
          {evolved
            ? `Agora ${petName} é ${STAGE_LABELS[stageAfter]}! Você cuidou muito bem dele.`
            : `Você deixou ${petName} mais feliz. Continue assim!`}
        </p>

        {/* barra de progresso do crescimento */}
        <div className="px-1 mb-6">
          <div className={`h-3 rounded-full overflow-hidden ${isG ? "bg-gray-700" : "bg-[#EEF2F7]"}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isG ? "#22d3ee" : "#1D4ED8" }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>

        <button onClick={onContinue} className={`w-full h-11 rounded-full font-bold ${btn}`}>
          Continuar
        </button>
      </div>
    </div>
  );
}
