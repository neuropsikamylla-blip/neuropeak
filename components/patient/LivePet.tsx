"use client";

// Bichinho "vivo": anima SOZINHO (sem cliques), trocando de atividade ao longo
// do tempo. Entre atividades há transição suave (crossfade). DENTRO de uma
// atividade pode haver animação quadro-a-quadro (flipbook): troca instantânea
// de 2-3 imagens pra dar vida real — ex.: piscar, e (no monstrinho) pular/comer.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import { PetCreature } from "./PetCreature";
import type { PetKind, PetColorId } from "@/lib/pet";

type MotionKind = "bob" | "run" | "float" | "jump" | "sway" | "still" | "shake";
interface Frame { pose: string; ms: number }
interface Activity {
  pose?: string; frames?: Frame[]; motion: MotionKind; dur: number; mood?: "idle" | "sleep";
}

// ───────── DRAGÃO ─────────
const BLINK_D: Activity = { frames: [{ pose: "idle", ms: 2800 }, { pose: "piscar", ms: 140 }], motion: "bob", dur: 5600 };
const COMER_D: Activity = { frames: [{ pose: "comer1", ms: 420 }, { pose: "comer2", ms: 420 }, { pose: "comer3", ms: 420 }], motion: "bob", dur: 1900 };
const FOGO_D: Activity = { frames: [{ pose: "fogo1", ms: 300 }, { pose: "fogo2", ms: 900 }, { pose: "fogo3", ms: 300 }], motion: "bob", dur: 2000 };
const ASAS_D: Activity = { frames: [{ pose: "asas1", ms: 200 }, { pose: "asas2", ms: 200 }], motion: "float", dur: 3000 };
const ROAM_D: Activity[] = [
  BLINK_D,
  { pose: "respirando", motion: "bob", dur: 2600 },
  { pose: "feliz", motion: "bob", dur: 2400 },
  { pose: "curioso", motion: "bob", dur: 2400 },
  { pose: "bocejando", motion: "bob", dur: 2200 },
  { pose: "rindo", motion: "bob", dur: 2200 },
  { pose: "acenando", motion: "bob", dur: 2200 },
  { pose: "coracao", motion: "bob", dur: 2400 },
  ASAS_D,
  { pose: "voando", motion: "float", dur: 2800 },
  FOGO_D,
  { pose: "dancando", motion: "sway", dur: 2600 },
  { pose: "cantando", motion: "sway", dur: 2400 },
  { pose: "pensando", motion: "bob", dur: 2400 },
];
const SHOW_SEQ: Activity[] = [
  ASAS_D,
  FOGO_D,
  { pose: "dancando", motion: "sway", dur: 1300 },
];
const ACTION_D: Record<string, Activity> = {
  comer: COMER_D,
  brincar: { pose: "brincar", motion: "jump", dur: 1800 },
  dormir: { pose: "dormir", motion: "still", dur: 2800, mood: "sleep" },
  cocegas: { pose: "gargalhando", motion: "shake", dur: 1500 },
};

// ───────── MONSTRINHO (sem asas/fogo; pisca, pula, come em quadros) ─────────
const BLINK_M: Activity = { frames: [{ pose: "piscar1", ms: 2600 }, { pose: "piscar2", ms: 150 }], motion: "bob", dur: 5200 };
const PULAR_M: Activity = { frames: [{ pose: "pular1", ms: 220 }, { pose: "pular2", ms: 240 }, { pose: "pular3", ms: 220 }], motion: "jump", dur: 2400 };
const COMER_M: Activity = { frames: [{ pose: "comer1", ms: 420 }, { pose: "comer2", ms: 420 }, { pose: "comer3", ms: 420 }], motion: "bob", dur: 1900 };
const ROAM_M: Activity[] = [
  BLINK_M,
  { pose: "idle", motion: "bob", dur: 3000 },
  { pose: "feliz", motion: "bob", dur: 2400 },
  { pose: "bocejando", motion: "bob", dur: 2200 },
  { pose: "fumaca", motion: "bob", dur: 2600 },
  { pose: "coracao", motion: "bob", dur: 2400 },
  PULAR_M,
];
const ACTION_M: Record<string, Activity> = {
  comer: COMER_M,
  brincar: PULAR_M,
  dormir: { pose: "dormir", motion: "still", dur: 2800, mood: "sleep" },
  cocegas: { pose: "feliz", motion: "shake", dur: 1500 },
};

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
    const step = () => { if (!alive) return; i = (i + 1) % frames.length; setFi(i); t = setTimeout(step, frames[i].ms); };
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

  const isMonster = kind === "monstrinho";
  const ROAM = isMonster ? ROAM_M : ROAM_D;
  const ACTMAP = isMonster ? ACTION_M : ACTION_D;
  const canRoam = stage >= 1 && !action;

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
  }, [canRoam, isMonster]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show do dragão: cicla voar → fogo → dançar.
  useEffect(() => {
    if (action !== "show") { setShowIdx(0); return; }
    let k = 0; setShowIdx(0);
    const id = setInterval(() => { k = (k + 1) % SHOW_SEQ.length; setShowIdx(k); }, 1400);
    return () => clearInterval(id);
  }, [action]);

  const safeIdx = idx < ROAM.length ? idx : 0;
  const act: Activity = action === "show"
    ? (isMonster ? PULAR_M : SHOW_SEQ[showIdx])
    : action ? ACTMAP[action]
    : (canRoam ? ROAM[safeIdx] : ROAM[0]);
  const m = MOTION[act.motion];

  const actKey = action === "show" ? `show-${isMonster ? 0 : showIdx}`
    : action ? `action-${action}`
    : (canRoam ? `roam-${safeIdx}` : "idle0");

  return (
    <motion.div
      animate={m}
      transition={{ duration: MOTION_DUR[act.motion], repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, position: "relative" }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${kind}-${actKey}`}
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
