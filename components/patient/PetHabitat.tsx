"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadPet, petStage, careProgress, sessionsToNextStage, petDisplayName,
  usedInteractionsToday, spendInteraction,
  INTERACTIONS_PER_SESSION, STAGE_LABELS, PET_ACTIONS, petPalette,
  type PetState, type PetAction,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";

// Habitat estilo Tamagotchi (tema Kids). O bichinho vive numa cena e a criança
// pode alimentar, brincar e colocar pra dormir. As interações são LIBERADAS por
// treino (recompensa), então cuidar do bichinho incentiva a terapia.
export function PetHabitat({ patientId, playerName, sessionsToday }: { patientId: string; playerName: string; sessionsToday: number }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [used, setUsed] = useState(0);
  const [anim, setAnim] = useState<PetAction | null>(null);
  const [heart, setHeart] = useState(0);

  useEffect(() => {
    setPet(loadPet(patientId));
    setUsed(usedInteractionsToday(patientId));
  }, [patientId]);

  if (!pet) return null;

  const available = Math.max(0, sessionsToday * INTERACTIONS_PER_SESSION - used);

  function doAction(a: PetAction) {
    if (available < 1 || anim) return;
    spendInteraction(patientId);
    setUsed((u) => u + 1);
    setAnim(a);
    setHeart((h) => h + 1);
    window.setTimeout(() => setAnim(null), a === "dormir" ? 2600 : 1700);
  }

  // Sem bichinho ainda → manda criar no Início.
  if (!pet.kind) {
    return (
      <div style={{ minHeight: "calc(100vh - 130px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, boxShadow: "0 16px 40px rgba(30,60,120,.12)" }}>
          <div style={{ fontSize: 56 }}>🥚</div>
          <p style={{ fontWeight: 800, color: "#0f766e", fontSize: 18, margin: "10px 0 6px" }}>Você ainda não tem um bichinho!</p>
          <p style={{ color: "#5b7", fontSize: 13, marginBottom: 16 }}>Vá ao Início e escolha o seu para começar a cuidar dele.</p>
          <Link href="/inicio" style={{ display: "inline-block", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", color: "#fff", fontWeight: 800, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}>Ir para o Início →</Link>
        </div>
      </div>
    );
  }

  const stage = petStage(pet.care);
  const pct = Math.round(careProgress(pet.care) * 100);
  const faltam = sessionsToNextStage(pet.care);
  const isAdult = stage >= 3;
  const name = petDisplayName(pet);
  const pal = petPalette(pet);
  const mood = anim === "dormir" ? "sleep" : "idle";

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      {/* CENA */}
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 18px 44px rgba(30,60,120,.18)", border: "3px solid #fff" }}>
        {/* céu + sol + nuvens (escurece ao dormir) */}
        <div style={{
          position: "relative", height: 340,
          background: anim === "dormir"
            ? "linear-gradient(180deg,#3b3170 0%,#5b4a9e 52%,#4a6b3a 52%,#3f5a30 100%)"
            : "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 52%,#c9edb0 52%,#b7e39a 100%)",
          transition: "background 0.6s ease",
        }}>
          <div style={{ position: "absolute", top: 18, right: 22, width: 46, height: 46, borderRadius: "50%",
            background: anim === "dormir" ? "radial-gradient(circle at 40% 35%,#e5e7eb,#cbd5e1)" : "radial-gradient(circle at 40% 35%,#fef08a,#fbbf24)",
            boxShadow: anim === "dormir" ? "0 0 18px rgba(203,213,225,.6)" : "0 0 24px rgba(251,191,36,.7)", transition: "all 0.6s ease" }} />
          <div style={{ position: "absolute", top: 40, left: 28, width: 58, height: 20, borderRadius: 999, background: "rgba(255,255,255,.9)" }} />
          <div style={{ position: "absolute", top: 70, left: 90, width: 42, height: 16, borderRadius: 999, background: "rgba(255,255,255,.85)" }} />

          {/* cabeçalho: nome + fase + carinho */}
          <div style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,.9)", borderRadius: 14, padding: "8px 12px", minWidth: 150 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 800, color: "#0f766e", fontSize: 14 }}>{name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#0d9488", background: "#ccfbf1", padding: "1px 7px", borderRadius: 999 }}>{STAGE_LABELS[stage]}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#e2e8f0", marginTop: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f43f5e,#fb7185)", borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                {isAdult ? "Cresceu tudo! 🎉" : `Faltam ${faltam} ${faltam === 1 ? "treino" : "treinos"} 🌟`}
              </div>
            </div>
          </div>

          {/* comidinha / bola durante a interação */}
          <AnimatePresence>
            {anim === "alimentar" && (
              <motion.div key="food" initial={{ y: 40, x: 0, opacity: 0, scale: 1 }} animate={{ y: 150, opacity: [0, 1, 1, 0], scale: [1, 1, 0.4] }} exit={{ opacity: 0 }}
                transition={{ duration: 1.4 }} style={{ position: "absolute", left: "50%", top: 60, fontSize: 34, translateX: "-50%" }}>🍎</motion.div>
            )}
            {anim === "brincar" && (
              <motion.div key="ball" initial={{ x: -80, y: 210 }} animate={{ x: [-80, 60, -40, 40, 0], y: [210, 150, 210, 170, 210] }}
                transition={{ duration: 1.5 }} style={{ position: "absolute", left: "50%", fontSize: 30 }}>🎾</motion.div>
            )}
            {anim === "dormir" && (
              <motion.div key="zzz" initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 1, 0], y: -40 }} transition={{ duration: 2.4 }}
                style={{ position: "absolute", left: "58%", top: 120, fontSize: 30, color: "#fff" }}>💤</motion.div>
            )}
            {(anim === "alimentar" || anim === "brincar") && (
              <motion.div key={`heart-${heart}`} initial={{ opacity: 0, y: 150, scale: 0.6 }} animate={{ opacity: [0, 1, 0], y: 80, scale: 1.1 }} transition={{ duration: 1.4, delay: 0.5 }}
                style={{ position: "absolute", left: "50%", fontSize: 26, translateX: "-50%" }}>❤️</motion.div>
            )}
          </AnimatePresence>

          {/* bichinho no chão */}
          <div style={{ position: "absolute", left: "50%", bottom: 6, transform: "translateX(-50%)" }}>
            <motion.div
              animate={anim === "alimentar" || anim === "brincar" ? { y: [0, -18, 0, -10, 0] } : anim === "dormir" ? { rotate: [0, -4, 0] } : { y: [0, -6, 0] }}
              transition={{ duration: anim ? 1.4 : 2.6, repeat: anim ? 0 : Infinity, ease: "easeInOut" }}>
              <div style={{ width: 200, height: 12, background: "rgba(0,0,0,.14)", borderRadius: "50%", position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", filter: "blur(2px)" }} />
              <PetCreature kind={pet.kind} stage={stage} size={190} accessory={pet.accessory ?? "coroa"} color={pet.color} mood={mood} />
            </motion.div>
          </div>
        </div>

        {/* AÇÕES */}
        <div style={{ background: "#fff", padding: "14px 12px 12px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {PET_ACTIONS.map((a) => {
              const locked = available < 1;
              return (
                <button key={a.id} onClick={() => doAction(a.id)} disabled={locked || !!anim}
                  style={{
                    flex: 1, border: "2px solid", borderColor: locked ? "#e2e8f0" : "#a5f3fc",
                    background: locked ? "#f1f5f9" : "#ecfeff", borderRadius: 16, padding: "10px 4px",
                    cursor: locked || anim ? "default" : "pointer", opacity: anim && !locked ? 0.6 : 1,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "transform .1s",
                  }}>
                  <span style={{ fontSize: 26 }}>{locked ? "🔒" : a.emoji}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: locked ? "#94a3b8" : "#0f766e" }}>{locked ? "amanhã" : a.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            {available > 0 ? (
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 999, padding: "5px 14px" }}>
                ✨ {available} {available === 1 ? "interação liberada" : "interações liberadas"} hoje
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: "#64748b" }}>
                Faça um treino para liberar carinhos com {name}! 💪
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
