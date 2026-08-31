"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import type { ExerciseResult, Theme } from "@/types";

interface TempoReacaoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// Direção de entrada do balão (o paciente não sabe de onde vem → trabalha o reflexo).
// Nunca misturamos direções na MESMA leva — só alternamos entre levas (pedido da Kamylla).
type Dir = "top" | "bottom" | "left" | "right";

interface Balloon {
  id: number;
  isTarget: boolean;
  color: string;
  size: number;    // px diameter
  duration: number; // ms to cross the play area
  spawnedAt: number;
  // trajetória (posição-base CSS + transform inicial→final, animado por framer-motion)
  left: string; top: string;
  fx: number; fy: number;   // transform inicial (fora da tela)
  tx: number; ty: number;   // transform final (sai pelo lado oposto)
}

const SESSION_MS = 5 * 60 * 1000;   // 5 min (era 7)
const GREEN = "#16a34a";       // o ÚNICO verde que vale
// distratores "fáceis" (cores bem diferentes do verde)
const DISTRACTOR_COLORS = ["#dc2626", "#2563eb", "#9333ea", "#ea580c", "#f59e0b"];
// distratores "difíceis" — tons AZUL-ESVERDEADOS (teal), parecidos mas NÃO são o verde-alvo.
// Treinam discriminação fina de cor; entram na fase de alternância. (pedido da Kamylla)
const NEAR_GREEN_COLORS = ["#14b8a6", "#2dd4bf", "#0d9488", "#5eead4", "#10b981"];

function distractorCount(difficulty: number) {
  // 0 distractors at diff 1-2, then grows progressively
  if (difficulty <= 2) return 0;
  if (difficulty <= 4) return 1;
  if (difficulty <= 6) return 2;
  if (difficulty <= 8) return 3;
  return 5;
}

type DirMode = "single" | "alternate";
const DIRS_ALT: Dir[] = ["top", "bottom", "left", "right"]; // descer · subir · esquerda · direita

// Progressão dos balões (pedido da Kamylla): sobe UMA coisa por vez, SEM misturar lados.
//  1) UMA direção fixa (de cima) e a velocidade sobe;
//  2) depois ALTERNA a direção a cada leva (descer, subir, laterais), UMA por vez,
//     e a velocidade segue subindo devagar. Nunca vários lados ao mesmo tempo.
function progressao(acertos: number): { modo: DirMode; vel: number } {
  if (acertos < 6) return { modo: "single", vel: Math.min(3, Math.floor(acertos / 2)) };   // 0,0,1,1,2,2 — só de cima
  return { modo: "alternate", vel: Math.min(6, 1 + Math.floor((acertos - 6) / 4)) };        // alterna 1 lado por leva; vel 1..6
}
// duração da travessia (ms) por nível de velocidade — menor = mais rápido
function durMs(vel: number): number { return Math.round(5200 - vel * 600); } // 5200 … 1600

// direção → trajetória (posição-base + transform inicial→final)
function trajetoria(dir: Dir, size: number) {
  const off = size * 1.6, D = 1400;
  const cross = 8 + Math.random() * 72; // posição transversal (%) — margem segura
  let left = "0px", top = "0px", fx = 0, fy = 0, tx = 0, ty = 0;
  if (dir === "top")         { left = `${cross}%`; top = "0px"; fy = -off; ty = D; }
  else if (dir === "bottom") { left = `${cross}%`; top = "0px"; fy = D;    ty = -off; }
  else if (dir === "left")   { left = "0px"; top = `${cross}%`; fx = -off; tx = D; }
  else                       { left = "0px"; top = `${cross}%`; fx = D;    tx = -off; } // right
  return { left, top, fx, fy, tx, ty };
}

function makeBalloon(isTarget: boolean, ms: number, pNear: number, dir: Dir): Balloon {
  const size = 62 + Math.random() * 22;
  const pool = Math.random() < pNear ? NEAR_GREEN_COLORS : DISTRACTOR_COLORS;
  return {
    id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
    isTarget,
    color: isTarget ? GREEN : pool[Math.floor(Math.random() * pool.length)],
    size,
    duration: ms * (0.85 + Math.random() * 0.3),
    spawnedAt: Date.now(),
    ...trajetoria(dir, size),
  };
}

function BalloonShape({ color, size = 70 }: { color: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: size, height: size,
        backgroundColor: color,
        borderRadius: "50% 50% 48% 52% / 55% 55% 45% 45%",
        boxShadow: `inset -4px -4px 10px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.3)`,
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: "18%", left: "20%", width: "26%", height: "16%", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "50%", transform: "rotate(-30deg)" }} />
      </div>
      <div style={{ width: 6, height: 5, backgroundColor: color, borderRadius: "0 0 3px 3px", marginTop: -1 }} />
      <div style={{ width: 1.5, height: 14, backgroundColor: "#9ca3af", opacity: 0.7 }} />
    </div>
  );
}

export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps) {
  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(SESSION_MS);

  const [started, setStarted] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [results, setResults] = useState<{ correct: boolean; rt: number | null; omitted: boolean }[]>([]);
  const [wrongId, setWrongId] = useState<number | null>(null); // balloon id that was wrong-clicked
  const [missFlash, setMissFlash] = useState(false);

  const startedRef = useRef(false);
  const resolvedIds = useRef(new Set<number>());
  const resultsRef = useRef<{ correct: boolean; rt: number | null; omitted: boolean }[]>([]);
  const doneRef = useRef(false);
  const startTime = useRef(Date.now());
  const nextSpawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctCountRef = useRef(0);
  const pendingTargetsRef = useRef(0);
  const levaCountRef = useRef(0); // alterna a direção da leva no modo "alternate"

  const nd = distractorCount(difficulty);

  const recordResult = useCallback((correct: boolean, rt: number | null, omitted: boolean = false) => {
    if (doneRef.current) return;

    const newResults = [...resultsRef.current, { correct, rt, omitted }];
    resultsRef.current = newResults;
    setResults(newResults);

    if (isTimeUp()) {
      doneRef.current = true;
      finish();
      if (nextSpawnTimer.current) clearTimeout(nextSpawnTimer.current);

      const hits = newResults.filter((r) => r.correct && r.rt !== null);
      const avgRT = hits.length > 0 ? hits.reduce((s, r) => s + (r.rt ?? 0), 0) / hits.length : 1000;
      const accuracy = newResults.filter((r) => r.correct).length / Math.max(1, newResults.length);
      const dur = elapsedSec();
      const score = calculateExerciseScore("tempo-reacao", accuracy, avgRT, difficulty);

      setTimeout(() => {
        onComplete({
          exerciseId: "tempo-reacao",
          domain: "processing",
          score,
          accuracy,
          reactionTime: avgRT,
          difficulty,
          duration: dur,
          metadata: { trials: newResults.length, avgRT, correct: hits.length, omissions: newResults.filter((r) => r.omitted).length },
        });
      }, 1500);
    }
  }, [difficulty, onComplete, isTimeUp, elapsedSec, finish]);

  const spawnBatch = useCallback(() => {
    if (doneRef.current) return;
    if (isTimeUp()) return;

    const acertos = correctCountRef.current;
    const prog = progressao(acertos);
    // Distratores AZUL-ESVERDEADOS (discriminação de cor fina): entram na fase de
    // alternância e ficam mais frequentes conforme o paciente evolui (25%→60%).
    const pNear = acertos < 6 ? 0 : Math.min(0.6, 0.25 + (acertos - 6) * 0.02);

    // Progressive: after every 4 correct hits, add 1 extra target (max 3) and 1 extra distractor (max +3)
    const bonus = Math.min(Math.floor(acertos / 4), 2);
    const numTargets = 1 + bonus;
    const numDistr = nd + Math.min(Math.floor(acertos / 4), 3);

    // Velocidade PROPORCIONAL ao nº de alvos (pedido da Kamylla): com mais estímulos
    // para tocar, os balões atravessam mais devagar — senão, com 2–3 alvos fica impossível.
    const ms = Math.round(durMs(prog.vel) * (1 + (numTargets - 1) * 0.4));

    // UMA direção por leva (nunca vários lados ao mesmo tempo): fixa de cima (single)
    // ou alterna descer/subir/laterais a cada leva (alternate). Todos os balões da leva
    // vêm do MESMO lado — assim, com a velocidade subindo, continua factível.
    const levaDir: Dir = prog.modo === "single" ? "top" : DIRS_ALT[levaCountRef.current % DIRS_ALT.length];
    levaCountRef.current++;

    const batch: Balloon[] = [
      ...Array.from({ length: numTargets }, () => makeBalloon(true, ms, pNear, levaDir)),
      ...Array.from({ length: numDistr }, () => makeBalloon(false, ms, pNear, levaDir)),
    ];
    pendingTargetsRef.current = numTargets;
    setBalloons(batch);
  }, [nd, isTimeUp]);

  function start() {
    setStarted(true);
    startedRef.current = true;
    startTime.current = Date.now();
    begin();
    spawnBatch();
  }

  useEffect(() => () => {
    if (nextSpawnTimer.current) clearTimeout(nextSpawnTimer.current);
  }, []);

  function handleBalloonClick(balloon: Balloon) {
    if (!startedRef.current || doneRef.current) return;
    if (resolvedIds.current.has(balloon.id)) return;
    if (isTimeUp()) return;

    resolvedIds.current.add(balloon.id);
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.isTarget) {
      const rt = Date.now() - balloon.spawnedAt;
      correctCountRef.current++;
      pendingTargetsRef.current = Math.max(0, pendingTargetsRef.current - 1);
      recordResult(true, rt);
      if (pendingTargetsRef.current <= 0) {
        nextSpawnTimer.current = setTimeout(spawnBatch, 700);
      }
    } else {
      setWrongId(balloon.id);
      setTimeout(() => setWrongId(null), 500);
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 350);
      recordResult(false, null);
    }
  }

  function handleBalloonExit(balloon: Balloon) {
    if (resolvedIds.current.has(balloon.id)) return;
    resolvedIds.current.add(balloon.id);
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.isTarget && started && !doneRef.current) {
      pendingTargetsRef.current = Math.max(0, pendingTargetsRef.current - 1);
      recordResult(false, null, true);
      if (pendingTargetsRef.current <= 0) {
        nextSpawnTimer.current = setTimeout(spawnBatch, 700);
      }
    }
  }

  const bg = `transition-colors ${
    theme === "GAMIFIED" ? "bg-gray-950" :
    theme === "COLORFUL" ? "bg-gradient-to-b from-sky-100 to-blue-200" :
    "bg-gray-100"
  } ${missFlash ? "!bg-red-200" : ""}`;

  const cardClass =
    theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-md";

  const titleClass =
    theme === "GAMIFIED" ? "text-cyan-400" :
    theme === "COLORFUL" ? "text-sky-700" :
    "text-gray-900";

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <ExerciseStage width="compacto" backgroundClassName={bg}>
      <div className="flex flex-col p-3">
      {/* Header card */}
      <div className={`rounded-2xl p-3 mb-3 ${cardClass}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className={`font-bold text-base ${titleClass}`}>🎯 Reflexos</h2>
            <p className={`text-xs ${subClass}`}>Toque apenas nos balões <span className="font-bold text-green-600">VERDES</span></p>
          </div>
        </div>
        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
      </div>

      {/* Play area */}
      <div
        className={`relative flex-1 rounded-2xl overflow-hidden ${
          theme === "GAMIFIED" ? "bg-gray-900" : "bg-white/40"
        }`}
        style={{ minHeight: "65vh" }}
      >
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className={`text-sm text-center px-6 ${subClass}`}>
              Balões vão aparecer de vários lados. Toque <strong className="text-green-600">só nos verdes</strong>!
            </p>
            <button
              onClick={start}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform ${
                theme === "GAMIFIED"
                  ? "bg-cyan-500 text-gray-900"
                  : "bg-green-500 text-white"
              }`}
            >
              🎈 Começar
            </button>
          </div>
        )}

        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ x: balloon.fx, y: balloon.fy }}
              animate={{ x: balloon.tx, y: balloon.ty }}
              transition={{ duration: balloon.duration / 1000, ease: "linear" }}
              onAnimationComplete={() => handleBalloonExit(balloon)}
              style={{
                position: "absolute",
                left: balloon.left,
                top: balloon.top,
                width: balloon.size,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                touchAction: "manipulation",
                pointerEvents: "auto",
                zIndex: balloon.isTarget ? 20 : 10,
              }}
              onPointerDown={() => handleBalloonClick(balloon)}
            >
              {/* Balloon body */}
              <div
                style={{
                  width: balloon.size,
                  height: balloon.size,
                  backgroundColor: balloon.color,
                  borderRadius: "50% 50% 48% 52% / 55% 55% 45% 45%",
                  boxShadow: `inset -6px -6px 14px rgba(0,0,0,0.22), inset 6px 6px 10px rgba(255,255,255,0.35)`,
                  position: "relative",
                }}
              >
                {/* Highlight spot */}
                <div
                  style={{
                    position: "absolute",
                    top: "18%",
                    left: "20%",
                    width: "28%",
                    height: "18%",
                    backgroundColor: "rgba(255,255,255,0.45)",
                    borderRadius: "50%",
                    transform: "rotate(-30deg)",
                  }}
                />
              </div>
              {/* Knot */}
              <div
                style={{
                  width: 8,
                  height: 6,
                  backgroundColor: balloon.color,
                  borderRadius: "0 0 4px 4px",
                  marginTop: -1,
                }}
              />
              {/* String */}
              <div
                style={{
                  width: 1.5,
                  height: 18,
                  backgroundColor: "#6b7280",
                  opacity: 0.7,
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </div>
    </ExerciseStage>
  );
}
