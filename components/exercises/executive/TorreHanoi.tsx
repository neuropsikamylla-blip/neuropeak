"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Check, X } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface TorreHanoiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MIN_DISCS = 3;
const MAX_DISCS = 8;

function initialDiscs(difficulty: number) {
  return Math.min(Math.max(MIN_DISCS, Math.floor(difficulty * 0.4) + 2), MAX_DISCS);
}

// 8 cores (disco 1 no topo → 8 na base). Cada disco usa um gradiente leve
// (clara → base) montado a partir destas cores.
const DISC_COLORS = [
  "#F43F5E", // 1 rosa/vermelho
  "#FB923C", // 2 laranja
  "#FACC15", // 3 amarelo
  "#34D399", // 4 verde
  "#22D3EE", // 5 turquesa
  "#3B82F6", // 6 azul
  "#6366F1", // 7 índigo
  "#A855F7", // 8 violeta
];
// Tom mais claro para o topo do gradiente do disco.
const DISC_COLORS_LIGHT = [
  "#FB7185", "#FDBA74", "#FDE047", "#6EE7B7",
  "#67E8F9", "#93C5FD", "#A5B4FC", "#D8B4FE",
];

type Peg = number[];
type State = [Peg, Peg, Peg];

function optimalMoves(n: number): number {
  return Math.pow(2, n) - 1;
}

function initialPegs(discCount: number): State {
  return [
    Array.from({ length: discCount }, (_, i) => discCount - i),
    [],
    [],
  ];
}

function HanoiPegsDisplay({
  pegs,
  theme,
  selected,
  discCount,
  onPegClick,
  hint,
}: {
  pegs: [number[], number[], number[]];
  theme: Theme;
  selected: number | null;
  discCount: number;
  onPegClick?: (i: number) => void;
  hint?: number | null; // pino que o tutorial destaca (onde tocar agora)
}) {
  const maxW = 140;
  return (
    <div className="flex justify-around items-end" style={{ height: 200 }}>
      {pegs.map((peg, pegIdx) => (
        <div
          key={pegIdx}
          className="flex flex-col items-center cursor-pointer relative"
          style={{ width: maxW + 16 }}
          onClick={() => onPegClick?.(pegIdx)}
        >
          {/* Dica: destaque pulsante no pino onde o paciente deve tocar */}
          {hint === pegIdx && (
            <div className="absolute rounded-2xl animate-pulse" style={{ inset: "-8px 4px 6px", border: "3px solid #f59e0b", pointerEvents: "none" }} />
          )}
          {/* base de madeira */}
          <div
            className="absolute bottom-0 rounded-lg"
            style={{ width: maxW + 16, height: 10, background: selected === pegIdx ? "linear-gradient(180deg,#d19a3a,#9c6b1e)" : "linear-gradient(180deg,#9c6b3f,#6b4423)" }}
          />
          {/* haste de madeira */}
          <div
            className="absolute rounded-full"
            style={{ width: 22, height: 180, bottom: 10, background: selected === pegIdx ? "linear-gradient(90deg,#e6ac33,#b57a1e,#e6ac33)" : "linear-gradient(90deg,#c39b6d,#8a5a2e,#c39b6d)" }}
          />
          <div className="absolute bottom-3 flex flex-col-reverse items-center gap-1">
            {peg.map((disc, di) => {
              const w = (disc / discCount) * maxW + 16;
              const isTop = di === peg.length - 1;
              return (
                <div
                  key={disc}
                  className="rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    width: w, height: 32,
                    backgroundColor: DISC_COLORS[disc - 1] ?? "#666",
                    opacity: selected === pegIdx && isTop ? 0.6 : 1,
                  }}
                >
                  {disc}
                </div>
              );
            })}
          </div>
          <div className={`text-xs absolute -bottom-5 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
            {pegIdx === 0 ? "Origem" : pegIdx === 1 ? "Aux" : "Destino"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TorreHanoiTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Objetivo: leve TODOS os discos para o pino da DIREITA (Destino). Regra: um disco MAIOR nunca pode ficar sobre um MENOR.",
      content: (onStepDone: () => void) => <HanoiRuleStep theme={theme} onDone={onStepDone} />,
    },
    {
      instruction: "Vamos praticar com 2 discos! Siga a torre destacada em cada passo.",
      content: (onStepDone: () => void) => <HanoiTeachStep theme={theme} onDone={onStepDone} />,
    },
  ];

  return <TutorialBase theme={theme} title="Jogo das Torres" steps={steps} onDone={onDone} />;
}

// Tutorial INTERATIVO: o paciente resolve um quebra-cabeça de 2 discos, guiado passo a
// passo (só aceita o toque certo, destacando o pino). No 2º passo o disco GRANDE vai
// direto ao Destino — ensinando na prática que o pino do meio é só um apoio.
function HanoiTeachStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const SOLUTION: [number, number][] = [[0, 1], [0, 2], [1, 2]]; // de → para (0=Origem,1=Aux,2=Destino)
  const HINTS = [
    "Passo 1 de 3 — tire o disco pequeno da frente: toque na Origem e depois no pino do meio.",
    "Passo 2 de 3 — leve o disco grande DIRETO ao Destino: toque na Origem e depois no Destino.",
    "Passo 3 de 3 — coloque o pequeno por cima: toque no pino do meio e depois no Destino.",
  ];
  const [pegs, setPegs] = useState<[number[], number[], number[]]>([[2, 1], [], []]);
  const [selected, setSelected] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const expected = SOLUTION[Math.min(step, SOLUTION.length - 1)];
  const hintPeg = done ? null : selected === null ? expected[0] : expected[1];

  function tap(i: number) {
    if (done) return;
    if (selected === null) {
      if (i === expected[0] && pegs[i].length > 0) setSelected(i); // só o pino certo pega
      return;
    }
    if (i === selected) { setSelected(null); return; } // toca de novo = cancela
    if (i !== expected[1]) return; // só aceita soltar no pino certo
    const from = selected;
    const disc = pegs[from][pegs[from].length - 1];
    const np: [number[], number[], number[]] = [[...pegs[0]], [...pegs[1]], [...pegs[2]]];
    np[from] = np[from].slice(0, -1);
    np[i] = [...np[i], disc];
    setPegs(np);
    setSelected(null);
    if (step + 1 >= SOLUTION.length) { setDone(true); setTimeout(onDone, 1600); }
    else setStep(step + 1);
  }

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <HanoiPegsDisplay pegs={pegs} theme={theme} selected={selected} hint={hintPeg} discCount={2} onPegClick={tap} />
      <p className={`text-sm mt-8 text-center font-medium ${done ? "text-green-600" : subClass}`} style={{ minHeight: 40 }}>
        {done
          ? "🎉 Você conseguiu! Viu como o disco grande foi DIRETO ao Destino? O pino do meio é só um apoio."
          : HINTS[step]}
      </p>
    </div>
  );
}

function HanoiRuleStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [autoAdvanced, setAutoAdvanced] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setAutoAdvanced(true); }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validPegs: [number[], number[], number[]] = [[2, 1], [], []]; // big on bottom, small on top
  const invalidPegs: [number[], number[], number[]] = [[1, 2], [], []]; // invalid: big on top of small

  const subClass = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 border-2 border-green-400 ${theme === "GAMIFIED" ? "bg-gray-700/50" : "bg-green-50"}`}>
          <p className="text-xs text-green-600 font-bold mb-2 flex items-center justify-center gap-1"><Check size={13} strokeWidth={3} /> Válido</p>
          <HanoiPegsDisplay pegs={validPegs} theme={theme} selected={null} discCount={2} />
        </div>
        <div className={`rounded-xl p-3 border-2 border-red-400 ${theme === "GAMIFIED" ? "bg-gray-700/50" : "bg-red-50"}`}>
          <p className="text-xs text-red-500 font-bold mb-2 flex items-center justify-center gap-1"><X size={13} strokeWidth={3} /> Inválido</p>
          <HanoiPegsDisplay pegs={invalidPegs} theme={theme} selected={null} discCount={2} />
        </div>
      </div>
      <p className={`text-xs text-center ${subClass}`}>Disco maior nunca sobre disco menor!</p>
      {autoAdvanced ? (
        <button
          onClick={onDone}
          className={`w-full py-2 rounded-xl font-bold text-sm ${theme === "GAMIFIED" ? "bg-cyan-600 text-white" : "bg-blue-600 text-white"}`}
        >
          Entendi!
        </button>
      ) : null}
    </div>
  );
}

export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();

  const [discCount, setDiscCount] = useState(initialDiscs(difficulty));
  const [puzzle, setPuzzle] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<{ correct: boolean; discs: number }[]>([]);
  const [lastWasOptimal, setLastWasOptimal] = useState(false);

  // Puzzle state
  const [pegs, setPegs] = useState<State>(() => initialPegs(initialDiscs(difficulty)));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const puzzleStart = useRef<number>(Date.now());

  // Largura de cada torre (medida) → discos escalam pra caber em qualquer tela.
  const rowRef = useRef<HTMLDivElement>(null);
  const [slotW, setSlotW] = useState(180);
  useEffect(() => {
    const measure = () => { const w = rowRef.current?.offsetWidth; if (w) setSlotW((w - 16) / 3); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showTutorial]);

  const optimal = optimalMoves(discCount);

  function startNewPuzzle(nextDiscs: number) {
    setPegs(initialPegs(nextDiscs));
    setSelected(null);
    setMoves(0);
    setWon(false);
    puzzleStart.current = Date.now();
  }

  function handlePegClick(pegIdx: number) {
    if (won) return;

    if (selected === null) {
      if (pegs[pegIdx].length === 0) return;
      setSelected(pegIdx);
    } else {
      if (selected === pegIdx) {
        setSelected(null);
        return;
      }

      const fromPeg = pegs[selected];
      const toPeg = pegs[pegIdx];
      const disc = fromPeg[fromPeg.length - 1];

      if (toPeg.length > 0 && toPeg[toPeg.length - 1] < disc) {
        setSelected(null);
        return;
      }

      const newPegs: State = pegs.map((p) => [...p]) as State;
      newPegs[selected].pop();
      newPegs[pegIdx].push(disc);
      setPegs(newPegs);
      const newMoves = moves + 1;
      setMoves(newMoves);
      setSelected(null);

      if (newPegs[2].length === discCount) {
        setWon(true);
        // "Correct" = used the minimum number of moves
        const isOptimal = newMoves <= optimal;
        setLastWasOptimal(isOptimal);

        const newPuzzleResults = [...puzzleResults, { correct: isOptimal, discs: discCount }];
        setPuzzleResults(newPuzzleResults);

        // If optimal → increase disc count; if not → stay at same difficulty
        const nextDiscs = isOptimal ? Math.min(discCount + 1, MAX_DISCS) : discCount;

        const nextPuzzle = puzzle + 1;
        const timeUp = isTimeUp();

        setTimeout(() => {
          if (timeUp) {
            finish();
            const correctCount = newPuzzleResults.filter((r) => r.correct).length;
            const accuracy = correctCount / Math.max(1, newPuzzleResults.length);
            const maxDiscs = Math.max(...newPuzzleResults.map((r) => r.discs));
            const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, maxDiscs);
            onComplete({
              exerciseId: "torre-hanoi",
              domain: "executive",
              score,
              accuracy,
              difficulty: maxDiscs,
              duration: elapsedSec(),
              metadata: { puzzles: newPuzzleResults.length, maxDiscs, correct: correctCount },
            });
          } else {
            setPuzzle(nextPuzzle);
            setDiscCount(nextDiscs);
            startNewPuzzle(nextDiscs);
          }
        }, 2500);
      }
    }
  }

  if (showTutorial) {
    return <TorreHanoiTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;
  }

  // Progresso VISUAL do jogo: quantos discos já chegaram ao destino.
  const gameProgress = Math.round((pegs[2].length / discCount) * 100);

  // Larguras progressivas (disco 1 mais estreito, disco N mais largo), escaladas
  // pela largura da torre pra caber em qualquer tela sem cortar.
  const MAXW = Math.min(168, slotW * 0.88);
  const MINW = Math.max(30, Math.min(46, slotW * 0.30));
  const DISC_H = 26;
  const discWidth = (disc: number) =>
    discCount <= 1 ? MAXW : MINW + ((disc - 1) / (discCount - 1)) * (MAXW - MINW);
  const towerH = MAX_DISCS * (DISC_H + 4) + 26;   // espaço seguro p/ até 8 discos
  const LABELS = ["Origem", "Auxiliar", "Destino"];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6" style={{ background: "#F3F4F6" }}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-7"
        style={{ boxShadow: "0 12px 40px rgba(15,23,42,.10)", border: "1px solid #EEF0F4" }}>

        {/* Título + nível + indicadores */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-bold tracking-tight" style={{ color: "#0F172A", fontSize: 22, lineHeight: 1.1 }}>Jogo das Torres</h2>
            <p className="mt-1 text-sm font-medium" style={{ color: "#64748B" }}>Nível: {discCount} discos</p>
          </div>
          <div className="flex gap-2.5">
            <Indicator label="Movimentos" value={moves} />
            <Indicator label="Mínimo" value={optimal} />
          </div>
        </div>

        {/* Barra de progresso (visual do jogo) */}
        <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "#EEF2F7" }}>
          <div className="h-full rounded-full" style={{ width: `${gameProgress}%`, background: "#1D4ED8", transition: "width .35s ease" }} />
        </div>


        {/* Torres */}
        <div ref={rowRef} className="mt-7 flex justify-between items-end gap-2" style={{ paddingBottom: 28 }}>
          {pegs.map((peg, pegIdx) => {
            const isSel = selected === pegIdx;
            return (
              <button key={pegIdx} onClick={() => handlePegClick(pegIdx)} aria-label={LABELS[pegIdx]}
                className="relative flex-1 flex items-end justify-center border-0 bg-transparent cursor-pointer"
                style={{ height: towerH, WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
                {/* zona tocável: a coluna INTEIRA é clicável — deixa isso visível */}
                <div className="absolute rounded-2xl" style={{ inset: "6px 2px 20px", background: isSel ? "rgba(217,148,32,.15)" : "rgba(148,163,184,.06)", border: `1px solid ${isSel ? "rgba(180,120,20,.55)" : "rgba(148,163,184,.18)"}`, transition: "background .15s, border-color .15s" }} />
                {/* haste de madeira (grossa, fácil de mirar) */}
                <div className="absolute rounded-full" style={{ width: 16, height: towerH - 16, bottom: 14, background: isSel ? "linear-gradient(90deg,#e6ac33,#b57a1e,#e6ac33)" : "linear-gradient(90deg,#c39b6d,#8a5a2e,#c39b6d)", boxShadow: "0 1px 3px rgba(15,23,42,.22)", transition: "background .15s" }} />
                {/* pilha de discos */}
                <div className="absolute flex flex-col-reverse items-center" style={{ bottom: 18, gap: 4 }}>
                  {peg.map((disc, di) => {
                    const lifted = isSel && di === peg.length - 1;
                    const c = DISC_COLORS[disc - 1] ?? "#666";
                    const cl = DISC_COLORS_LIGHT[disc - 1] ?? "#999";
                    return (
                      <motion.div key={disc}
                        layoutId={`disc-${disc}-${puzzle}`}
                        transition={{ type: "tween", duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                        className="flex items-center justify-center font-bold text-white"
                        style={{
                          width: discWidth(disc), height: DISC_H, borderRadius: 8, fontSize: 12,
                          background: `linear-gradient(180deg, ${cl}, ${c})`,
                          boxShadow: lifted
                            ? `0 7px 16px ${c}66, 0 0 0 2px #B45309`
                            : "0 2px 5px rgba(15,23,42,.16)",
                          transform: lifted ? "translateY(-6px)" : "none",
                          transition: "transform .12s, box-shadow .12s",
                        }}>
                        {disc}
                      </motion.div>
                    );
                  })}
                </div>
                {/* base de madeira */}
                <div className="absolute rounded-full" style={{ bottom: 0, width: "92%", height: 16, background: isSel ? "linear-gradient(180deg,#d19a3a,#9c6b1e)" : "linear-gradient(180deg,#9c6b3f,#6b4423)", boxShadow: "0 3px 8px rgba(15,23,42,.22)", transition: "background .15s" }} />
                {/* rótulo */}
                <span className="absolute text-xs font-semibold" style={{ bottom: -24, color: isSel ? "#B45309" : "#94A3B8" }}>{LABELS[pegIdx]}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {won && (
            <motion.div
              className="text-center mt-6 rounded-2xl p-4"
              style={{
                background: lastWasOptimal ? "#ECFDF5" : "#FFFBEB",
                border: `1px solid ${lastWasOptimal ? "#A7F3D0" : "#FDE68A"}`,
              }}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mx-auto mb-2 flex items-center justify-center rounded-full"
                style={{ width: 44, height: 44, background: lastWasOptimal ? "#DDF7EF" : "#FEF3C7" }}>
                {lastWasOptimal ? <Trophy size={22} color="#047857" /> : <Check size={22} color="#B45309" strokeWidth={3} />}
              </div>
              <p className="font-bold text-lg" style={{ color: lastWasOptimal ? "#047857" : "#B45309" }}>
                {lastWasOptimal ? "Movimentos mínimos!" : "Resolvido!"}
              </p>
              <p className="text-sm" style={{ color: lastWasOptimal ? "#059669" : "#D97706" }}>
                {moves} movimento{moves !== 1 ? "s" : ""} · mínimo: {optimal}
              </p>
              {!lastWasOptimal && (
                <p className="text-xs mt-1" style={{ color: "#D97706" }}>
                  Você pode fazer em {optimal} movimentos — tente de novo!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Indicador discreto (Movimentos / Mínimo).
function Indicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center rounded-2xl px-4 py-2" style={{ background: "#F8FAFC", border: "1px solid #EEF0F4", minWidth: 84 }}>
      <div className="font-bold tabular-nums" style={{ color: "#0F172A", fontSize: 19, lineHeight: 1 }}>{value}</div>
      <div className="uppercase" style={{ color: "#94A3B8", fontSize: 10, fontWeight: 700, letterSpacing: ".04em", marginTop: 3 }}>{label}</div>
    </div>
  );
}
