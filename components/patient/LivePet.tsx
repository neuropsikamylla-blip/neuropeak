"use client";

// Bichinho "vivo": anima SOZINHO (sem cliques), trocando de atividade ao longo
// do tempo — parado, voando, dançando, acenando… Entre atividades há uma
// transição suave (crossfade). DENTRO de uma atividade pode haver animação
// quadro-a-quadro (flipbook): troca instantânea de 2 imagens bem rápido pra dar
// vida real — ex.: piscar (olho aberto ↔ fechado) e bater asas (asa ↕).

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import { PetCreature } from "./PetCreature";
import type { PetKind, PetColorId, DragonPose } from "@/lib/pet";

type MotionKind = "bob" | "run" | "float" | "jump" | "sway" | "still" | "shake";
interface Frame { pose: DragonPose; ms: number }
interface Activity {
  pose?: DragonPose;      // pose única (estática)
  frames?: Frame[];       // OU animação quadro-a-quadro (flipbook)
  motion: MotionKind;
  dur: number;            // tempo até trocar de atividade
  mood?: "idle" | "sleep";
}

// Clips quadro-a-quadro (pares já alinhados entre si):
const BLINK: Activity = { frames: [{ pose: "idle", ms: 2800 }, { pose: "piscar", ms: 140 }], motion: "bob", dur: 5600 };
const FLAP: Activity = { frames: [{ pose: "voando", ms: 190 }, { pose: "batendoasas", ms: 190 }], motion: "float", dur: 3400 };

// Poses que o dragão faz por conta própria — usa TODAS as imagens disponíveis.
const ROAM: Activity[] = [
  BLINK,
  { pose: "respirando", motion: "bob", dur: 2600 },
  { pose: "feliz", motion: "bob", dur: 2400 },
  { pose: "curioso", motion: "bob", dur: 2400 },
  { pose: "bocejando", motion: "bob", dur: 2200 },
  { pose: "rindo", motion: "bob", dur: 2200 },
  { pose: "gargalhando", motion: "bob", dur: 2000 },
  { pose: "fumaca", motion: "bob", dur: 2600 },
  { pose: "acenando", motion: "bob", dur: 2200 },
  FLAP,
  { pose: "planando", motion: "float", dur: 2600 },
  { pose: "dancando", motion: "sway", dur: 2800 },
  { pose: "cantando", motion: "sway", dur: 2400 },
  { pose: "notas", motion: "sway", dur: 2400 },
  { pose: "comfome", motion: "bob", dur: 2200 },
  { pose: "pensando", motion: "bob", dur: 2600 },
  { pose: "fogo", motion: "bob", dur: 2400 },
];

const ACTION_ACT: Record<string, Activity> = {
  comer: { pose: "comer", motion: "bob", dur: 1800 },
  brincar: { pose: "brincar", motion: "jump", dur: 1800 },
  dormir: { pose: "dormir", motion: "still", dur: 2800, mood: "sleep" },
  cocegas: { pose: "gargalhando", motion: "shake", dur: 1500 },
};

// Show/Truque: sequência voar → soltar fogo → dançar (conquista de fase alta).
const SHOW_SEQ: Activity[] = [
  FLAP,
  { pose: "fogo", motion: "bob", dur: 1200 },
  { pose: "dancando", motion: "sway", dur: 1300 },
];

const MOTION: Record<MotionKind, TargetAndTransition> = {
  bob: { y: [0, -7, 0] },
  run: { x: [-3, 3, -3, 3, -3], y: [0, -4, 0, -4, 0] },
  float: { y: [0, -14, 0] },
  jump: { y: [0, -22, 0] },
  sway: { rotate: [-5, 5, -5], y: [0, -3, 0] },
  still: { y: [0, -2, 0] },
  shake: { x: [0, -4, 4, -4, 4, 0], rotate: [0, -2, 2, -2, 0] },
};
const MOTION_DUR: Record<MotionKind, number> = { bob: 2.4, run: 0.7, float: 2.2, jump: 0.9, sway: 1.2, still: 3.2, shake: 0.5 };

// Renderiza a pose atual; se a atividade for um clip, alterna os quadros com
// troca INSTANTÂNEA (sem fade) pra parecer animação de verdade.
function FrameView({ activity, kind, stage, color, size }: {
  activity: Activity; kind: PetKind; stage: number; color?: PetColorId; size: number;
}) {
  const [fi, setFi] = useState(0);
  const frames = activity.frames;
  useEffect(() => {
    setFi(0);
    if (!frames) return;
    let i = 0, alive = true;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!alive) return;
      i = (i + 1) % frames.length;
      setFi(i);
      t = setTimeout(step, frames[i].ms);
    };
    t = setTimeout(step, frames[0].ms);
    return () => { alive = false; clearTimeout(t); };
  }, [frames]);
  const pose = frames ? frames[fi].pose : activity.pose;
  return <PetCreature kind={kind} stage={stage} color={color} pose={pose} mood={activity.mood ?? "idle"} size={size} />;
}

export function LivePet({ kind, stage, color, size, action }: {
  kind: PetKind; stage: number; color?: PetColorId; size: number;
  action?: "comer" | "brincar" | "dormir" | "cocegas" | "show" | null;
}) {
  const [idx, setIdx] = useState(0);
  const [showIdx, setShowIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Só o dragão a partir do filhote "vagueia"; ovo e monstrinho ficam parados.
  const canRoam = kind === "dragao" && stage >= 1 && !action;

  useEffect(() => {
    if (!canRoam) { setIdx(0); return; }
    let alive = true;
    function next() {
      if (!alive) return;
      const n = Math.floor(Math.random() * ROAM.length);
      setIdx(n);
      timerRef.current = setTimeout(next, ROAM[n].dur);
    }
    timerRef.current = setTimeout(next, ROAM[0].dur);
    return () => { alive = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, [canRoam]);

  // Show: cicla voar → soltar fogo → dançar enquanto durar.
  useEffect(() => {
    if (action !== "show") { setShowIdx(0); return; }
    let k = 0; setShowIdx(0);
    const id = setInterval(() => { k = (k + 1) % SHOW_SEQ.length; setShowIdx(k); }, 1400);
    return () => clearInterval(id);
  }, [action]);

  const act: Activity = action === "show" ? SHOW_SEQ[showIdx]
    : action ? ACTION_ACT[action]
    : (canRoam ? ROAM[idx] : ROAM[0]);
  const m = MOTION[act.motion];

  const actKey = action === "show" ? `show-${showIdx}`
    : action ? `action-${action}`
    : (canRoam ? `roam-${idx}` : "idle0");

  return (
    <motion.div
      animate={m}
      transition={{ duration: MOTION_DUR[act.motion], repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, position: "relative" }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={actKey}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <FrameView activity={act} kind={kind} stage={stage} color={color} size={size} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
