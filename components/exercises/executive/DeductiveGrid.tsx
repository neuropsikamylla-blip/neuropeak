"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateExerciseScore } from "@/lib/scoring";
import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import type { ExerciseResult, Theme } from "@/types";

interface DeductiveGridProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

// ── Puzzle data ────────────────────────────────────────────────────────────

interface Puzzle {
  title: string;
  people: string[];
  attribute: string;
  values: string[];
  clues: string[];
  solution: Record<string, string>; // person → value
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
}

const PUZZLES: Puzzle[] = [
  // EASY (d=1)
  {
    title: "Cores das Casas",
    people: ["Ana", "Bruno", "Carla"],
    attribute: "Casa",
    values: ["Azul", "Verde", "Amarela"],
    clues: [
      "Bruno tem a casa Verde.",
      "Ana não tem a casa Azul.",
    ],
    solution: { Ana: "Amarela", Bruno: "Verde", Carla: "Azul" },
    difficulty: 1,
  },
  {
    title: "Animais de Estimação",
    people: ["João", "Maria", "Pedro"],
    attribute: "Animal",
    values: ["Gato", "Cão", "Peixe"],
    clues: [
      "Maria tem um Cão.",
      "João não tem um Gato.",
    ],
    solution: { João: "Peixe", Maria: "Cão", Pedro: "Gato" },
    difficulty: 1,
  },
  {
    title: "Frutas Preferidas",
    people: ["Lucas", "Bia", "Teo"],
    attribute: "Fruta",
    values: ["Maçã", "Banana", "Uva"],
    clues: [
      "Bia prefere Banana.",
      "Teo não gosta de Maçã.",
    ],
    solution: { Lucas: "Maçã", Bia: "Banana", Teo: "Uva" },
    difficulty: 1,
  },
  {
    title: "Profissões",
    people: ["Sara", "Rui", "Lena"],
    attribute: "Profissão",
    values: ["Médico", "Professor", "Chef"],
    clues: [
      "Rui é Professor.",
      "Sara não é Chef.",
    ],
    solution: { Sara: "Médico", Rui: "Professor", Lena: "Chef" },
    difficulty: 1,
  },
  {
    title: "Cores Favoritas",
    people: ["Davi", "Eva", "Fabi"],
    attribute: "Cor",
    values: ["Roxo", "Laranja", "Rosa"],
    clues: [
      "Eva adora Laranja.",
      "Davi não gosta de Rosa.",
    ],
    solution: { Davi: "Roxo", Eva: "Laranja", Fabi: "Rosa" },
    difficulty: 1,
  },
  // MEDIUM (d=2)
  {
    title: "Esportes",
    people: ["Alice", "Beto", "Cris"],
    attribute: "Esporte",
    values: ["Natação", "Futebol", "Tênis"],
    clues: [
      "Alice não pratica Futebol.",
      "Beto não pratica Natação.",
      "Cris pratica Tênis.",
    ],
    solution: { Alice: "Tênis", Beto: "Futebol", Cris: "Tênis" },
    difficulty: 2,
  },
  {
    title: "Instrumentos",
    people: ["Hugo", "Iris", "Júlio"],
    attribute: "Instrumento",
    values: ["Violão", "Piano", "Flauta"],
    clues: [
      "Hugo toca Violão ou Piano.",
      "Iris não toca Piano.",
      "Júlio não toca Violão.",
    ],
    solution: { Hugo: "Piano", Iris: "Flauta", Júlio: "Piano" },
    difficulty: 2,
  },
  {
    title: "Cidades",
    people: ["Kim", "Leo", "Mia"],
    attribute: "Cidade",
    values: ["Rio", "SP", "BH"],
    clues: [
      "Kim não mora em SP.",
      "Leo não mora em Rio.",
      "Mia mora em SP.",
    ],
    solution: { Kim: "BH", Leo: "BH", Mia: "SP" },
    difficulty: 2,
  },
  {
    title: "Sobremesas",
    people: ["Nina", "Otto", "Pia"],
    attribute: "Sobremesa",
    values: ["Bolo", "Pudim", "Sorvete"],
    clues: [
      "Otto prefere Pudim.",
      "Nina não gosta de Sorvete.",
      "Pia não come Bolo.",
    ],
    solution: { Nina: "Bolo", Otto: "Pudim", Pia: "Sorvete" },
    difficulty: 2,
  },
  {
    title: "Hobbies",
    people: ["Quen", "Rosa", "Sabi"],
    attribute: "Hobby",
    values: ["Pintura", "Leitura", "Xadrez"],
    clues: [
      "Rosa pratica Leitura.",
      "Quen não gosta de Pintura.",
    ],
    solution: { Quen: "Xadrez", Rosa: "Leitura", Sabi: "Pintura" },
    difficulty: 2,
  },
  // HARD (d=3)
  {
    title: "Viagens dos Amigos",
    people: ["Tali", "Ugo", "Vera"],
    attribute: "Destino",
    values: ["Paris", "Tóquio", "Nova York"],
    clues: [
      "Ugo não vai para Paris.",
      "Tali não vai para Tóquio.",
      "Quem vai para Nova York não é Vera.",
      "Ugo vai para Tóquio ou Nova York.",
    ],
    solution: { Tali: "Paris", Ugo: "Nova York", Vera: "Tóquio" },
    difficulty: 3,
  },
  {
    title: "Livros Favoritos",
    people: ["Wil", "Xena", "Yara"],
    attribute: "Livro",
    values: ["Romance", "Ficção", "Terror"],
    clues: [
      "Yara lê Terror ou Romance.",
      "Wil não lê Terror.",
      "Xena não lê Romance.",
    ],
    solution: { Wil: "Romance", Xena: "Ficção", Yara: "Terror" },
    difficulty: 3,
  },
  {
    title: "Filmes Preferidos",
    people: ["Zara", "Alex", "Bela"],
    attribute: "Gênero",
    values: ["Ação", "Comédia", "Drama"],
    clues: [
      "Alex não gosta de Comédia.",
      "Bela gosta de Drama ou Comédia.",
      "Zara não gosta de Ação.",
    ],
    solution: { Zara: "Comédia", Alex: "Ação", Bela: "Drama" },
    difficulty: 3,
  },
  {
    title: "Músicas Favoritas",
    people: ["Cleo", "Dani", "Edu"],
    attribute: "Estilo",
    values: ["Rock", "MPB", "Jazz"],
    clues: [
      "Edu não ouve Rock.",
      "Cleo não ouve Jazz.",
      "Dani ouve MPB ou Jazz.",
    ],
    solution: { Cleo: "Rock", Dani: "Jazz", Edu: "MPB" },
    difficulty: 3,
  },
  {
    title: "Cores dos Carros",
    people: ["Fred", "Gabi", "Hana"],
    attribute: "Carro",
    values: ["Branco", "Preto", "Prata"],
    clues: [
      "Hana não tem carro Branco.",
      "Fred tem carro Prata ou Preto.",
      "Gabi não tem carro Preto.",
    ],
    solution: { Fred: "Preto", Gabi: "Branco", Hana: "Prata" },
    difficulty: 3,
  },
];

function getPuzzlePool(d: number): Puzzle[] {
  if (d <= 3) return PUZZLES.filter(p => p.difficulty === 1);
  if (d <= 7) return PUZZLES.filter(p => p.difficulty <= 2);
  return PUZZLES;
}

type CellState = "empty" | "yes" | "no";

// ── Tutorial ──────────────────────────────────────────────────────────────

function TutStep1({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const [cellState, setCellState] = useState<CellState>("empty");
  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";

  function cycle() {
    setCellState(s => s === "empty" ? "yes" : s === "yes" ? "no" : "empty");
  }

  // Auto-advance after 2 cycles
  const clicks = useRef(0);
  function handleClick() {
    clicks.current++;
    cycle();
    if (clicks.current >= 3) setTimeout(onDone, 400);
  }

  const cellBg =
    cellState === "yes" ? "bg-green-500 text-white" :
    cellState === "no" ? "bg-red-400 text-white" :
    theme === "GAMIFIED" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400";

  return (
    <div className="flex flex-col items-center gap-3">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className={`p-2 text-xs ${sub}`}></th>
            {["Azul", "Verde", "Amarela"].map(v => (
              <th key={v} className={`p-2 text-xs font-bold ${sub}`}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["Ana", "Bruno", "Carla"].map((person, pi) => (
            <tr key={person}>
              <td className={`p-2 text-xs font-bold ${sub}`}>{person}</td>
              {["Azul", "Verde", "Amarela"].map((val, vi) => (
                <td key={val} className="p-1">
                  <button
                    onClick={pi === 0 && vi === 0 ? handleClick : undefined}
                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
                      pi === 0 && vi === 0 ? cellBg + " border-blue-400 ring-2 ring-blue-300" :
                      theme === "GAMIFIED" ? "bg-gray-700 text-gray-600 border-gray-600" : "bg-gray-100 text-gray-300 border-gray-200"
                    }`}>
                    {pi === 0 && vi === 0 ? (cellState === "yes" ? "✓" : cellState === "no" ? "✗" : "") : ""}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`text-xs text-center ${sub}`}>Toque na célula azul para alternar: vazio → ✓ → ✗</p>
    </div>
  );
}

function DeductiveGridTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Leia as pistas e deduza quem tem cada atributo. Toque para marcar ✓ (SIM) ou ✗ (NÃO).",
      content: (done: () => void) => <TutStep1 theme={theme} onDone={done} />,
    },
  ];
  return <TutorialBase theme={theme} title="Grade Dedutiva" steps={steps} onDone={onDone} />;
}

// ── Main component ─────────────────────────────────────────────────────────

export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const reportProgress = useExerciseProgress();

  const pool = useRef<Puzzle[]>(getPuzzlePool(difficulty).sort(() => Math.random() - 0.5));
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [grid, setGrid] = useState<Record<string, CellState>>({});
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const startTime = useRef(Date.now());
  const puzzleStartTime = useRef(Date.now());
  const errorsThisPuzzle = useRef(0);
  const PUZZLES_TO_SOLVE = 3;

  const currentPuzzle = pool.current[puzzleIdx % pool.current.length];

  const initGrid = useCallback((puzzle: Puzzle) => {
    const g: Record<string, CellState> = {};
    for (const person of puzzle.people) {
      for (const value of puzzle.values) {
        g[`${person}|${value}`] = "empty";
      }
    }
    setGrid(g);
    setErrorCells(new Set());
    setShowSuccess(false);
    errorsThisPuzzle.current = 0;
    puzzleStartTime.current = Date.now();
  }, []);

  // Initialize on start
  const startedRef = useRef(false);
  if (!startedRef.current && !showTutorial) {
    startedRef.current = true;
    initGrid(currentPuzzle);
    startTime.current = Date.now();
  }

  function cycleCellState(person: string, value: string) {
    const key = `${person}|${value}`;
    setGrid(prev => {
      const cur = prev[key] ?? "empty";
      const next: CellState = cur === "empty" ? "yes" : cur === "yes" ? "no" : "empty";
      return { ...prev, [key]: next };
    });
    setErrorCells(prev => { const n = new Set(prev); n.delete(`${person}|${value}`); return n; });
  }

  function handleConfirm() {
    // Check if all cells have a state (not empty)
    const allFilled = currentPuzzle.people.every(p =>
      currentPuzzle.values.some(v => grid[`${p}|${v}`] === "yes")
    );
    if (!allFilled) return;

    // Validate
    const newErrors = new Set<string>();
    let correct = true;
    for (const person of currentPuzzle.people) {
      const selected = currentPuzzle.values.find(v => grid[`${person}|${v}`] === "yes");
      if (selected !== currentPuzzle.solution[person]) {
        newErrors.add(`${person}|${selected ?? ""}`);
        newErrors.add(`${person}|${currentPuzzle.solution[person]}`);
        correct = false;
      }
    }

    if (!correct) {
      setErrorCells(newErrors);
      errorsThisPuzzle.current++;
      setTotalErrors(e => e + 1);
      return;
    }

    // Success
    setShowSuccess(true);
    const nextTotal = totalPuzzles + 1;
    setTotalPuzzles(nextTotal);
    reportProgress(Math.round((nextTotal / PUZZLES_TO_SOLVE) * 100));

    if (nextTotal >= PUZZLES_TO_SOLVE) {
      setTimeout(() => {
        const accuracy = Math.max(0, 1 - (totalErrors + errorsThisPuzzle.current) / (nextTotal * 2));
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const score = calculateExerciseScore("deductive-grid", accuracy, undefined, difficulty);
        onComplete({
          exerciseId: "deductive-grid",
          domain: "executive",
          score,
          accuracy,
          difficulty,
          duration,
          metadata: { puzzlesSolved: nextTotal, totalErrors: totalErrors + errorsThisPuzzle.current },
        });
      }, 1200);
    } else {
      setTimeout(() => {
        const nextIdx = puzzleIdx + 1;
        setPuzzleIdx(nextIdx);
        initGrid(pool.current[nextIdx % pool.current.length]);
      }, 1200);
    }
  }

  if (showTutorial) {
    return <DeductiveGridTutorial theme={theme}
      onDone={() => { setShowTutorial(false); initGrid(currentPuzzle); startTime.current = Date.now(); }} />;
  }

  const pal = {
    bg: theme === "GAMIFIED" ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-slate-50",
    card: theme === "GAMIFIED" ? "bg-gray-800 border border-cyan-500/20" : "bg-white shadow-lg",
    title: theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-emerald-700" : "text-slate-800",
    sub: theme === "GAMIFIED" ? "text-gray-400" : "text-slate-500",
    clueBox: theme === "GAMIFIED" ? "bg-gray-700/60 text-gray-300" : "bg-gray-50 text-gray-700",
    cellEmpty: theme === "GAMIFIED" ? "bg-gray-700 border-gray-600 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-300",
    cellYes: "bg-green-500 border-green-600 text-white",
    cellNo: "bg-red-400 border-red-500 text-white",
    cellErr: "bg-orange-400 border-orange-500 text-white ring-2 ring-orange-300",
    personHead: theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700",
    valueHead: theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500",
    confirmBtn: theme === "GAMIFIED" ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-emerald-600 text-white hover:bg-emerald-700",
  };

  const allHaveYes = currentPuzzle.people.every(p =>
    currentPuzzle.values.some(v => grid[`${p}|${v}`] === "yes")
  );

  return (
    <div className={`min-h-screen overflow-y-auto ${pal.bg}`}>
      <div className="max-w-sm mx-auto px-4 py-5 flex flex-col gap-4">

        {/* Header */}
        <div className={`rounded-2xl p-4 ${pal.card}`}>
          <div className="flex justify-between items-center mb-1">
            <h2 className={`font-bold text-sm ${pal.title}`}>🔍 {currentPuzzle.title}</h2>
            <span className={`text-xs ${pal.sub}`}>{totalPuzzles + 1}/{PUZZLES_TO_SOLVE}</span>
          </div>
          <div className={`h-1.5 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-slate-200"}`}>
            <div className={`h-full rounded-full transition-all ${
              theme === "GAMIFIED" ? "bg-cyan-500" : "bg-emerald-500"
            }`} style={{ width: `${(totalPuzzles / PUZZLES_TO_SOLVE) * 100}%` }} />
          </div>
        </div>

        {/* Clues */}
        <div className={`rounded-xl p-3 ${pal.clueBox}`}>
          <p className={`text-xs font-bold mb-1 ${pal.title}`}>Pistas:</p>
          {currentPuzzle.clues.map((clue, i) => (
            <p key={i} className="text-xs leading-relaxed">• {clue}</p>
          ))}
        </div>

        {/* Grid */}
        <div className={`rounded-2xl p-3 ${pal.card} overflow-x-auto`}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-1"></th>
                {currentPuzzle.values.map(v => (
                  <th key={v} className={`p-1 text-[11px] font-bold text-center ${pal.valueHead}`}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPuzzle.people.map(person => (
                <tr key={person}>
                  <td className={`p-1 pr-2 text-xs font-bold ${pal.personHead}`}>{person}</td>
                  {currentPuzzle.values.map(value => {
                    const key = `${person}|${value}`;
                    const state = grid[key] ?? "empty";
                    const isErr = errorCells.has(key);
                    return (
                      <td key={value} className="p-1 text-center">
                        <button
                          onClick={() => cycleCellState(person, value)}
                          className={`w-11 h-11 rounded-lg border-2 text-base font-bold transition-all ${
                            isErr ? pal.cellErr :
                            state === "yes" ? pal.cellYes :
                            state === "no" ? pal.cellNo :
                            pal.cellEmpty
                          }`}>
                          {state === "yes" ? "✓" : state === "no" ? "✗" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Error hint */}
        <AnimatePresence>
          {errorCells.size > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-center text-orange-500 font-bold">
              ⚠️ Algumas células estão erradas — reveja as pistas!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`text-center py-3 rounded-xl font-bold text-sm ${
                theme === "GAMIFIED" ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800"
              }`}>
              ✅ Correto! Excelente raciocínio!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm button */}
        {!showSuccess && (
          <button
            onClick={handleConfirm}
            disabled={!allHaveYes}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              allHaveYes ? pal.confirmBtn : (theme === "GAMIFIED" ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400")
            }`}>
            {allHaveYes ? "Confirmar →" : "Marque ✓ para cada pessoa"}
          </button>
        )}

        <p className={`text-xs text-center ${pal.sub}`}>
          Toque: 1x = ✓ (SIM), 2x = ✗ (NÃO), 3x = apaga
        </p>
      </div>
    </div>
  );
}
