"use client";

import React, { useState, useRef, useCallback } from "react";
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
  difficulty: 1 | 2 | 3 | 4; // 1=easy, 2=medium, 3=hard, 4=expert (4×4)
}

const PUZZLES: Puzzle[] = [
  // ── FÁCIL (d=1) — 3×3, 2 pistas, eliminação direta ──────────────────────
  {
    title: "Cores das Casas",
    people: ["Ana", "Bruno", "Carla"],
    attribute: "Casa",
    values: ["Azul", "Verde", "Amarela"],
    clues: ["Bruno tem a casa Verde.", "Ana não tem a casa Azul."],
    solution: { Ana: "Amarela", Bruno: "Verde", Carla: "Azul" },
    difficulty: 1,
  },
  {
    title: "Animais de Estimação",
    people: ["João", "Maria", "Pedro"],
    attribute: "Animal",
    values: ["Gato", "Cão", "Peixe"],
    clues: ["Maria tem um Cão.", "João não tem um Gato."],
    solution: { João: "Peixe", Maria: "Cão", Pedro: "Gato" },
    difficulty: 1,
  },
  {
    title: "Frutas Preferidas",
    people: ["Lucas", "Bia", "Teo"],
    attribute: "Fruta",
    values: ["Maçã", "Banana", "Uva"],
    clues: ["Bia prefere Banana.", "Teo não gosta de Maçã."],
    solution: { Lucas: "Maçã", Bia: "Banana", Teo: "Uva" },
    difficulty: 1,
  },
  {
    title: "Profissões",
    people: ["Sara", "Rui", "Lena"],
    attribute: "Profissão",
    values: ["Médico", "Professor", "Chef"],
    clues: ["Rui é Professor.", "Sara não é Chef."],
    solution: { Sara: "Médico", Rui: "Professor", Lena: "Chef" },
    difficulty: 1,
  },
  {
    title: "Cores Favoritas",
    people: ["Davi", "Eva", "Fabi"],
    attribute: "Cor",
    values: ["Roxo", "Laranja", "Rosa"],
    clues: ["Eva adora Laranja.", "Davi não gosta de Rosa."],
    solution: { Davi: "Roxo", Eva: "Laranja", Fabi: "Rosa" },
    difficulty: 1,
  },
  {
    title: "Camisas",
    people: ["Nico", "Olga", "Paco"],
    attribute: "Camisa",
    values: ["Branca", "Cinza", "Preta"],
    clues: ["Olga usa camisa Cinza.", "Nico não usa camisa Branca."],
    solution: { Nico: "Preta", Olga: "Cinza", Paco: "Branca" },
    difficulty: 1,
  },
  {
    title: "Bebidas Simples",
    people: ["Raul", "Sônia", "Tino"],
    attribute: "Bebida",
    values: ["Café", "Chá", "Suco"],
    clues: ["Sônia bebe Chá.", "Raul não bebe Café."],
    solution: { Raul: "Suco", Sônia: "Chá", Tino: "Café" },
    difficulty: 1,
  },
  // ── MÉDIO (d=2) — 3×3, 3-4 pistas, cadeia de eliminação ─────────────────
  {
    title: "Esportes",
    people: ["Alice", "Beto", "Cris"],
    attribute: "Esporte",
    values: ["Natação", "Futebol", "Tênis"],
    clues: [
      "Cris pratica Tênis.",
      "Beto não pratica Natação.",
      "Alice não pratica Futebol.",
    ],
    solution: { Alice: "Natação", Beto: "Futebol", Cris: "Tênis" },
    difficulty: 2,
  },
  {
    title: "Instrumentos",
    people: ["Hugo", "Iris", "Júlio"],
    attribute: "Instrumento",
    values: ["Violão", "Piano", "Flauta"],
    clues: [
      "Júlio não toca Violão.",
      "Júlio não toca Flauta.",
      "Iris não toca Flauta.",
      "Hugo não toca Piano.",
    ],
    solution: { Hugo: "Flauta", Iris: "Violão", Júlio: "Piano" },
    difficulty: 2,
  },
  {
    title: "Cidades",
    people: ["Kim", "Leo", "Mia"],
    attribute: "Cidade",
    values: ["Rio", "SP", "BH"],
    clues: [
      "Mia mora em SP.",
      "Leo não mora em Rio.",
      "Kim não mora em SP.",
    ],
    solution: { Kim: "Rio", Leo: "BH", Mia: "SP" },
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
      "Sabi não pratica Xadrez.",
    ],
    solution: { Quen: "Xadrez", Rosa: "Leitura", Sabi: "Pintura" },
    difficulty: 2,
  },
  {
    title: "Transportes",
    people: ["Vera", "Walt", "Xena"],
    attribute: "Transporte",
    values: ["Ônibus", "Bicicleta", "Carro"],
    clues: [
      "Vera não usa Bicicleta.",
      "Xena não usa Carro.",
      "Walt não usa Ônibus.",
      "Xena não usa Ônibus.",
    ],
    solution: { Vera: "Ônibus", Walt: "Carro", Xena: "Bicicleta" },
    difficulty: 2,
  },
  {
    title: "Times de Futebol",
    people: ["Alef", "Bibi", "Cadu"],
    attribute: "Time",
    values: ["Flamengo", "Corinthians", "Palmeiras"],
    clues: [
      "Bibi não torce para Flamengo.",
      "Alef não torce para Corinthians.",
      "Cadu não torce para Palmeiras.",
      "Bibi não torce para Palmeiras.",
    ],
    solution: { Alef: "Palmeiras", Bibi: "Corinthians", Cadu: "Flamengo" },
    difficulty: 2,
  },
  // ── DIFÍCIL (d=3) — 3×3, 4 pistas, cadeia longa com alternativas ─────────
  {
    title: "Viagens dos Amigos",
    people: ["Tali", "Ugo", "Vera"],
    attribute: "Destino",
    values: ["Paris", "Tóquio", "Nova York"],
    clues: [
      "Ugo não vai para Paris.",
      "Tali não vai para Tóquio.",
      "Vera não vai para Nova York.",
      "Tali não vai para Nova York.",
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
      "Wil não lê Ficção.",
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
      "Alex não gosta de Drama.",
      "Zara não gosta de Ação.",
      "Zara não gosta de Comédia.",
    ],
    solution: { Zara: "Drama", Alex: "Ação", Bela: "Comédia" },
    difficulty: 3,
  },
  {
    title: "Músicas Favoritas",
    people: ["Cleo", "Dani", "Edu"],
    attribute: "Estilo",
    values: ["Rock", "MPB", "Jazz"],
    clues: [
      "Edu não ouve Rock.",
      "Edu não ouve Jazz.",
      "Cleo não ouve Jazz.",
      "Cleo não ouve MPB.",
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
      "Fred não tem carro Branco.",
      "Fred não tem carro Prata.",
      "Hana não tem carro Branco.",
      "Gabi não tem carro Preto.",
    ],
    solution: { Fred: "Preto", Gabi: "Branco", Hana: "Prata" },
    difficulty: 3,
  },
  {
    title: "Férias",
    people: ["Iago", "Jade", "Kiko"],
    attribute: "Destino",
    values: ["Montanha", "Praia", "Campo"],
    clues: [
      "Jade não vai para Praia.",
      "Kiko não vai para Montanha.",
      "Iago não vai para Montanha.",
      "Kiko não vai para Campo.",
    ],
    solution: { Iago: "Campo", Jade: "Montanha", Kiko: "Praia" },
    difficulty: 3,
  },
  {
    title: "Estilos de Dança",
    people: ["Fran", "Guto", "Helo"],
    attribute: "Dança",
    values: ["Samba", "Forró", "Valsa"],
    clues: [
      "Guto não dança Samba.",
      "Guto não dança Valsa.",
      "Helo dança Forró ou Samba.",
      "Fran não dança Forró.",
    ],
    solution: { Fran: "Valsa", Guto: "Forró", Helo: "Samba" },
    difficulty: 3,
  },
  {
    title: "Disciplinas Favoritas",
    people: ["Lina", "Meco", "Nabi"],
    attribute: "Disciplina",
    values: ["Matemática", "História", "Ciências"],
    clues: [
      "Nabi não gosta de Matemática.",
      "Nabi não gosta de Ciências.",
      "Meco gosta de Ciências ou História.",
      "Lina não gosta de Ciências.",
    ],
    solution: { Lina: "Matemática", Meco: "Ciências", Nabi: "História" },
    difficulty: 3,
  },
  // ── EXPERT (d=4) — 4×4, 5 pistas, múltiplas cadeias ─────────────────────
  {
    title: "Bebidas dos Colegas",
    people: ["Eli", "Fabi", "Gael", "Helo"],
    attribute: "Bebida",
    values: ["Café", "Chá", "Suco", "Água"],
    clues: [
      "Gael bebe Água.",
      "Eli não bebe Suco.",
      "Eli não bebe Chá.",
      "Fabi não bebe Chá.",
      "Helo não bebe Suco.",
    ],
    solution: { Eli: "Café", Fabi: "Suco", Gael: "Água", Helo: "Chá" },
    difficulty: 4,
  },
  {
    title: "Cidades de Nascimento",
    people: ["Ana", "Beto", "Carla", "Duda"],
    attribute: "Cidade",
    values: ["Rio", "SP", "BH", "Curitiba"],
    clues: [
      "Beto nasceu em SP.",
      "Ana não nasceu em BH.",
      "Ana não nasceu em Curitiba.",
      "Duda não nasceu em Rio.",
      "Duda não nasceu em BH.",
    ],
    solution: { Ana: "Rio", Beto: "SP", Carla: "BH", Duda: "Curitiba" },
    difficulty: 4,
  },
  {
    title: "Esportes no Clube",
    people: ["Isa", "José", "Keli", "Luca"],
    attribute: "Esporte",
    values: ["Futebol", "Tênis", "Natação", "Ciclismo"],
    clues: [
      "Keli pratica Futebol.",
      "Isa não pratica Tênis.",
      "Isa não pratica Natação.",
      "José não pratica Futebol.",
      "José não pratica Natação.",
    ],
    solution: { Isa: "Ciclismo", José: "Tênis", Keli: "Futebol", Luca: "Natação" },
    difficulty: 4,
  },
  {
    title: "Animais dos Amigos",
    people: ["Mara", "Nilo", "Olga", "Pier"],
    attribute: "Animal",
    values: ["Cachorro", "Gato", "Peixe", "Hamster"],
    clues: [
      "Olga tem Cachorro.",
      "Mara não tem Peixe.",
      "Mara não tem Hamster.",
      "Pier não tem Hamster.",
      "Nilo não tem Gato.",
    ],
    solution: { Mara: "Gato", Nilo: "Hamster", Olga: "Cachorro", Pier: "Peixe" },
    difficulty: 4,
  },
  {
    title: "Destinos de Viagem",
    people: ["Quen", "Rosa", "Sabi", "Teo"],
    attribute: "Destino",
    values: ["Paris", "Tóquio", "N. York", "Londres"],
    clues: [
      "Rosa viajou para Paris.",
      "Quen não viajou para Tóquio.",
      "Sabi não viajou para Tóquio.",
      "Sabi não viajou para Londres.",
      "Teo não viajou para Londres.",
    ],
    solution: { Quen: "Londres", Rosa: "Paris", Sabi: "N. York", Teo: "Tóquio" },
    difficulty: 4,
  },
];

function getPuzzlePool(d: number): Puzzle[] {
  // Estava fácil demais (níveis baixos só pegavam d1: 3×3 com 2 pistas, quase dado).
  // Piso agora é d2 (cadeia de eliminação = raciocínio real) e os 4×4 (expert) chegam mais cedo.
  if (d <= 1) return PUZZLES.filter(p => p.difficulty <= 2);                 // leve, mas já com cadeia
  if (d <= 3) return PUZZLES.filter(p => p.difficulty === 2);
  if (d <= 5) return PUZZLES.filter(p => p.difficulty === 2 || p.difficulty === 3);
  if (d <= 7) return PUZZLES.filter(p => p.difficulty === 3);
  if (d <= 9) return PUZZLES.filter(p => p.difficulty === 3 || p.difficulty === 4);
  return PUZZLES.filter(p => p.difficulty === 4);
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
  // Mais puzzles em níveis mais altos para treino progressivo
  const PUZZLES_TO_SOLVE = difficulty <= 2 ? 3 : difficulty <= 6 ? 4 : 5;

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
      const updated = { ...prev, [key]: next };
      // Cada pessoa tem exatamente UM valor: ao marcar "yes", os demais "yes" da mesma
      // linha viram "no" (dedução lógica). Impede múltiplos "yes" por pessoa, que antes
      // corrompiam a validação — ela só conferia o primeiro "yes" via Array.find.
      if (next === "yes") {
        for (const v of currentPuzzle.values) {
          if (v !== value && updated[`${person}|${v}`] === "yes") {
            updated[`${person}|${v}`] = "no";
          }
        }
      }
      return updated;
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

  const isGamified = theme === "GAMIFIED";
  const isColorful = theme === "COLORFUL";

  const rootBg: React.CSSProperties = isGamified
    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };

  const cardStyle: React.CSSProperties = isGamified
    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };

  const confirmBtnStyle: React.CSSProperties = isGamified
    ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
    : isColorful
    ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };

  const pal = {
    title: isGamified ? "text-white" : "text-[#1a2744]",
    sub: isGamified ? "text-white/70" : "text-[#8a7a6a]",
    clueBox: isGamified ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-700",
    cellEmpty: isGamified ? "bg-white/10 border-white/20 text-white/30" : "bg-gray-50 border-gray-200 text-gray-300",
    cellYes: "bg-green-500 border-green-600 text-white",
    cellNo: "bg-red-400 border-red-500 text-white",
    cellErr: "bg-orange-400 border-orange-500 text-white ring-2 ring-orange-300",
    personHead: isGamified ? "text-white/80" : "text-gray-700",
    valueHead: isGamified ? "text-white/60" : "text-gray-500",
  };

  const allHaveYes = currentPuzzle.people.every(p =>
    currentPuzzle.values.some(v => grid[`${p}|${v}`] === "yes")
  );

  // Células menores para grids 4×4 (expert)
  const isExpert = currentPuzzle.values.length >= 4;
  const cellCls = isExpert ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  const headCls = isExpert ? "text-[9px]" : "text-[11px]";

  return (
    <div className="min-h-screen overflow-y-auto" style={rootBg}>
      <div className="max-w-sm mx-auto px-4 py-5 flex flex-col gap-4">

        {/* Header */}
        <div className="p-4" style={cardStyle}>
          <div className="flex justify-between items-center mb-1">
            <h2 className={`font-bold text-sm ${pal.title}`}>🔍 {currentPuzzle.title}</h2>
            <span className={`text-xs ${pal.sub}`}>{totalPuzzles + 1}/{PUZZLES_TO_SOLVE}</span>
          </div>
          <div className={`h-1.5 rounded-full ${isGamified ? "bg-white/10" : "bg-slate-200"}`}>
            <div className={`h-full rounded-full transition-all ${
              isGamified ? "bg-cyan-400" : "bg-emerald-500"
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
        <div className="p-3 overflow-x-auto" style={cardStyle}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-1"></th>
                {currentPuzzle.values.map(v => (
                  <th key={v} className={`p-1 ${headCls} font-bold text-center leading-tight ${pal.valueHead}`}>{v}</th>
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
                          className={`${cellCls} rounded-lg border-2 font-bold transition-all ${
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
              className="text-center py-3 rounded-xl font-bold text-sm"
              style={{ background: "rgba(22,163,74,0.92)", backdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}>
              ✅ Correto! Excelente raciocínio!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm button */}
        {!showSuccess && (
          <button
            onClick={handleConfirm}
            disabled={!allHaveYes}
            className="w-full py-3 font-bold text-sm transition-all disabled:opacity-40"
            style={allHaveYes ? confirmBtnStyle : { borderRadius: 9999, background: isGamified ? "rgba(255,255,255,0.1)" : "#e5e7eb", color: isGamified ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
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
