== DIFF do lab grade-f3 (contra a base do bundle) ==
diff --git a/components/exercises/executive/DeductiveGrid.tsx b/components/exercises/executive/DeductiveGrid.tsx
index 15c8d49c..9b646893 100644
--- a/components/exercises/executive/DeductiveGrid.tsx
+++ b/components/exercises/executive/DeductiveGrid.tsx
@@ -1,12 +1,26 @@
 "use client";
 
-import React, { useState, useRef, useCallback } from "react";
-import { motion, AnimatePresence } from "framer-motion";
-import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
-import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
-import { TutorialBase } from "@/components/exercises/TutorialBase";
+import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
+import { useEffect, useMemo, useRef, useState } from "react";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
+import {
+  PROBLEMA_TUTORIAL,
+  admiteSolucao,
+  celulasComValorRepetido,
+  chavePosicaoGrade,
+  criarGradeVazia,
+  gradeEstaCorreta,
+  mensagemVerificacao,
+  paraMarcacaoParcial,
+  relacaoJaDeterminada,
+  resumirAtribuicoes,
+  selecionarProblema,
+  verificacaoDisponivel,
+  type RegistroAtribuicao,
+  type ValorCelula,
+  type Puzzle,
+} from "@/lib/grade";
+import { calculateExerciseScore } from "@/lib/scoring";
 import type { ExerciseResult, Theme } from "@/types";
 
 interface DeductiveGridProps {
@@ -15,713 +29,435 @@ interface DeductiveGridProps {
   onComplete: (result: ExerciseResult) => void;
 }
 
-// ── Puzzle data ────────────────────────────────────────────────────────────
-
-interface Puzzle {
-  title: string;
-  people: string[];
-  attribute: string;
-  values: string[];
-  clues: string[];
-  solution: Record<string, string>; // person → value
-  difficulty: 1 | 2 | 3 | 4; // 1=easy, 2=medium, 3=hard, 4=expert (4×4)
+interface EventoPista {
+  type: "clue_crossed" | "clue_uncrossed";
+  pistaId: string;
+  momento: number;
+  timestamp: number;
 }
 
-const PUZZLES: Puzzle[] = [
-  // ── FÁCIL (d=1) — 3×3, 2 pistas, eliminação direta ──────────────────────
-  {
-    title: "Cores das Casas",
-    people: ["Ana", "Bruno", "Carla"],
-    attribute: "Casa",
-    values: ["Azul", "Verde", "Amarela"],
-    clues: ["Bruno tem a casa Verde.", "Ana não tem a casa Azul."],
-    solution: { Ana: "Amarela", Bruno: "Verde", Carla: "Azul" },
-    difficulty: 1,
-  },
-  {
-    title: "Animais de Estimação",
-    people: ["João", "Maria", "Pedro"],
-    attribute: "Animal",
-    values: ["Gato", "Cão", "Peixe"],
-    clues: ["Maria tem um Cão.", "João não tem um Gato."],
-    solution: { João: "Peixe", Maria: "Cão", Pedro: "Gato" },
-    difficulty: 1,
-  },
-  {
-    title: "Frutas Preferidas",
-    people: ["Lucas", "Bia", "Teo"],
-    attribute: "Fruta",
-    values: ["Maçã", "Banana", "Uva"],
-    clues: ["Bia prefere Banana.", "Teo não gosta de Maçã."],
-    solution: { Lucas: "Maçã", Bia: "Banana", Teo: "Uva" },
-    difficulty: 1,
-  },
-  {
-    title: "Profissões",
-    people: ["Sara", "Rui", "Lena"],
-    attribute: "Profissão",
-    values: ["Médico", "Professor", "Chef"],
-    clues: ["Rui é Professor.", "Sara não é Chef."],
-    solution: { Sara: "Médico", Rui: "Professor", Lena: "Chef" },
-    difficulty: 1,
-  },
-  {
-    title: "Cores Favoritas",
-    people: ["Davi", "Eva", "Fabi"],
-    attribute: "Cor",
-    values: ["Roxo", "Laranja", "Rosa"],
-    clues: ["Eva adora Laranja.", "Davi não gosta de Rosa."],
-    solution: { Davi: "Roxo", Eva: "Laranja", Fabi: "Rosa" },
-    difficulty: 1,
-  },
-  {
-    title: "Camisas",
-    people: ["Nico", "Olga", "Paco"],
-    attribute: "Camisa",
-    values: ["Branca", "Cinza", "Preta"],
-    clues: ["Olga usa camisa Cinza.", "Nico não usa camisa Branca."],
-    solution: { Nico: "Preta", Olga: "Cinza", Paco: "Branca" },
-    difficulty: 1,
-  },
-  {
-    title: "Bebidas Simples",
-    people: ["Raul", "Sônia", "Tino"],
-    attribute: "Bebida",
-    values: ["Café", "Chá", "Suco"],
-    clues: ["Sônia bebe Chá.", "Raul não bebe Café."],
-    solution: { Raul: "Suco", Sônia: "Chá", Tino: "Café" },
-    difficulty: 1,
-  },
-  // ── MÉDIO (d=2) — 3×3, 3-4 pistas, cadeia de eliminação ─────────────────
-  {
-    title: "Esportes",
-    people: ["Alice", "Beto", "Cris"],
-    attribute: "Esporte",
-    values: ["Natação", "Futebol", "Tênis"],
-    clues: [
-      "Cris pratica Tênis.",
-      "Beto não pratica Natação.",
-      "Alice não pratica Futebol.",
-    ],
-    solution: { Alice: "Natação", Beto: "Futebol", Cris: "Tênis" },
-    difficulty: 2,
-  },
-  {
-    title: "Instrumentos",
-    people: ["Hugo", "Iris", "Júlio"],
-    attribute: "Instrumento",
-    values: ["Violão", "Piano", "Flauta"],
-    clues: [
-      "Júlio não toca Violão.",
-      "Júlio não toca Flauta.",
-      "Iris não toca Flauta.",
-      "Hugo não toca Piano.",
-    ],
-    solution: { Hugo: "Flauta", Iris: "Violão", Júlio: "Piano" },
-    difficulty: 2,
-  },
-  {
-    title: "Cidades",
-    people: ["Kim", "Leo", "Mia"],
-    attribute: "Cidade",
-    values: ["Rio", "SP", "BH"],
-    clues: [
-      "Mia mora em SP.",
-      "Leo não mora em Rio.",
-      "Kim não mora em SP.",
-    ],
-    solution: { Kim: "Rio", Leo: "BH", Mia: "SP" },
-    difficulty: 2,
-  },
-  {
-    title: "Sobremesas",
-    people: ["Nina", "Otto", "Pia"],
-    attribute: "Sobremesa",
-    values: ["Bolo", "Pudim", "Sorvete"],
-    clues: [
-      "Otto prefere Pudim.",
-      "Nina não gosta de Sorvete.",
-      "Pia não come Bolo.",
-    ],
-    solution: { Nina: "Bolo", Otto: "Pudim", Pia: "Sorvete" },
-    difficulty: 2,
-  },
-  {
-    title: "Hobbies",
-    people: ["Quen", "Rosa", "Sabi"],
-    attribute: "Hobby",
-    values: ["Pintura", "Leitura", "Xadrez"],
-    clues: [
-      "Rosa pratica Leitura.",
-      "Quen não gosta de Pintura.",
-      "Sabi não pratica Xadrez.",
-    ],
-    solution: { Quen: "Xadrez", Rosa: "Leitura", Sabi: "Pintura" },
-    difficulty: 2,
-  },
-  {
-    title: "Transportes",
-    people: ["Vera", "Walt", "Xena"],
-    attribute: "Transporte",
-    values: ["Ônibus", "Bicicleta", "Carro"],
-    clues: [
-      "Vera não usa Bicicleta.",
-      "Xena não usa Carro.",
-      "Walt não usa Ônibus.",
-      "Xena não usa Ônibus.",
-    ],
-    solution: { Vera: "Ônibus", Walt: "Carro", Xena: "Bicicleta" },
-    difficulty: 2,
-  },
-  {
-    title: "Times de Futebol",
-    people: ["Alef", "Bibi", "Cadu"],
-    attribute: "Time",
-    values: ["Flamengo", "Corinthians", "Palmeiras"],
-    clues: [
-      "Bibi não torce para Flamengo.",
-      "Alef não torce para Corinthians.",
-      "Cadu não torce para Palmeiras.",
-      "Bibi não torce para Palmeiras.",
-    ],
-    solution: { Alef: "Palmeiras", Bibi: "Corinthians", Cadu: "Flamengo" },
-    difficulty: 2,
-  },
-  // ── DIFÍCIL (d=3) — 3×3, 4 pistas, cadeia longa com alternativas ─────────
-  {
-    title: "Viagens dos Amigos",
-    people: ["Tali", "Ugo", "Vera"],
-    attribute: "Destino",
-    values: ["Paris", "Tóquio", "Nova York"],
-    clues: [
-      "Ugo não vai para Paris.",
-      "Tali não vai para Tóquio.",
-      "Vera não vai para Nova York.",
-      "Tali não vai para Nova York.",
-    ],
-    solution: { Tali: "Paris", Ugo: "Nova York", Vera: "Tóquio" },
-    difficulty: 3,
-  },
-  {
-    title: "Livros Favoritos",
-    people: ["Wil", "Xena", "Yara"],
-    attribute: "Livro",
-    values: ["Romance", "Ficção", "Terror"],
-    clues: [
-      "Yara lê Terror ou Romance.",
-      "Wil não lê Terror.",
-      "Wil não lê Ficção.",
-      "Xena não lê Romance.",
-    ],
-    solution: { Wil: "Romance", Xena: "Ficção", Yara: "Terror" },
-    difficulty: 3,
-  },
-  {
-    title: "Filmes Preferidos",
-    people: ["Zara", "Alex", "Bela"],
-    attribute: "Gênero",
-    values: ["Ação", "Comédia", "Drama"],
-    clues: [
-      "Alex não gosta de Comédia.",
-      "Alex não gosta de Drama.",
-      "Zara não gosta de Ação.",
-      "Zara não gosta de Comédia.",
-    ],
-    solution: { Zara: "Drama", Alex: "Ação", Bela: "Comédia" },
-    difficulty: 3,
-  },
-  {
-    title: "Músicas Favoritas",
-    people: ["Cleo", "Dani", "Edu"],
-    attribute: "Estilo",
-    values: ["Rock", "MPB", "Jazz"],
-    clues: [
-      "Edu não ouve Rock.",
-      "Edu não ouve Jazz.",
-      "Cleo não ouve Jazz.",
-      "Cleo não ouve MPB.",
-    ],
-    solution: { Cleo: "Rock", Dani: "Jazz", Edu: "MPB" },
-    difficulty: 3,
-  },
-  {
-    title: "Cores dos Carros",
-    people: ["Fred", "Gabi", "Hana"],
-    attribute: "Carro",
-    values: ["Branco", "Preto", "Prata"],
-    clues: [
-      "Fred não tem carro Branco.",
-      "Fred não tem carro Prata.",
-      "Hana não tem carro Branco.",
-      "Gabi não tem carro Preto.",
-    ],
-    solution: { Fred: "Preto", Gabi: "Branco", Hana: "Prata" },
-    difficulty: 3,
-  },
-  {
-    title: "Férias",
-    people: ["Iago", "Jade", "Kiko"],
-    attribute: "Destino",
-    values: ["Montanha", "Praia", "Campo"],
-    clues: [
-      "Jade não vai para Praia.",
-      "Kiko não vai para Montanha.",
-      "Iago não vai para Montanha.",
-      "Kiko não vai para Campo.",
-    ],
-    solution: { Iago: "Campo", Jade: "Montanha", Kiko: "Praia" },
-    difficulty: 3,
-  },
-  {
-    title: "Estilos de Dança",
-    people: ["Fran", "Guto", "Helo"],
-    attribute: "Dança",
-    values: ["Samba", "Forró", "Valsa"],
-    clues: [
-      "Guto não dança Samba.",
-      "Guto não dança Valsa.",
-      "Helo dança Forró ou Samba.",
-      "Fran não dança Forró.",
-    ],
-    solution: { Fran: "Valsa", Guto: "Forró", Helo: "Samba" },
-    difficulty: 3,
-  },
-  {
-    title: "Disciplinas Favoritas",
-    people: ["Lina", "Meco", "Nabi"],
-    attribute: "Disciplina",
-    values: ["Matemática", "História", "Ciências"],
-    clues: [
-      "Nabi não gosta de Matemática.",
-      "Nabi não gosta de Ciências.",
-      "Meco gosta de Ciências ou História.",
-      "Lina não gosta de Ciências.",
-    ],
-    solution: { Lina: "Matemática", Meco: "Ciências", Nabi: "História" },
-    difficulty: 3,
-  },
-  // ── EXPERT (d=4) — 4×4, 5 pistas, múltiplas cadeias ─────────────────────
-  {
-    title: "Bebidas dos Colegas",
-    people: ["Eli", "Fabi", "Gael", "Helo"],
-    attribute: "Bebida",
-    values: ["Café", "Chá", "Suco", "Água"],
-    clues: [
-      "Gael bebe Água.",
-      "Eli não bebe Suco.",
-      "Eli não bebe Chá.",
-      "Fabi não bebe Chá.",
-      "Helo não bebe Suco.",
-    ],
-    solution: { Eli: "Café", Fabi: "Suco", Gael: "Água", Helo: "Chá" },
-    difficulty: 4,
-  },
-  {
-    title: "Cidades de Nascimento",
-    people: ["Ana", "Beto", "Carla", "Duda"],
-    attribute: "Cidade",
-    values: ["Rio", "SP", "BH", "Curitiba"],
-    clues: [
-      "Beto nasceu em SP.",
-      "Ana não nasceu em BH.",
-      "Ana não nasceu em Curitiba.",
-      "Duda não nasceu em Rio.",
-      "Duda não nasceu em BH.",
-    ],
-    solution: { Ana: "Rio", Beto: "SP", Carla: "BH", Duda: "Curitiba" },
-    difficulty: 4,
-  },
-  {
-    title: "Esportes no Clube",
-    people: ["Isa", "José", "Keli", "Luca"],
-    attribute: "Esporte",
-    values: ["Futebol", "Tênis", "Natação", "Ciclismo"],
-    clues: [
-      "Keli pratica Futebol.",
-      "Isa não pratica Tênis.",
-      "Isa não pratica Natação.",
-      "José não pratica Futebol.",
-      "José não pratica Natação.",
-    ],
-    solution: { Isa: "Ciclismo", José: "Tênis", Keli: "Futebol", Luca: "Natação" },
-    difficulty: 4,
-  },
-  {
-    title: "Animais dos Amigos",
-    people: ["Mara", "Nilo", "Olga", "Pier"],
-    attribute: "Animal",
-    values: ["Cachorro", "Gato", "Peixe", "Hamster"],
-    clues: [
-      "Olga tem Cachorro.",
-      "Mara não tem Peixe.",
-      "Mara não tem Hamster.",
-      "Pier não tem Hamster.",
-      "Nilo não tem Gato.",
-    ],
-    solution: { Mara: "Gato", Nilo: "Hamster", Olga: "Cachorro", Pier: "Peixe" },
-    difficulty: 4,
-  },
-  {
-    title: "Destinos de Viagem",
-    people: ["Quen", "Rosa", "Sabi", "Teo"],
-    attribute: "Destino",
-    values: ["Paris", "Tóquio", "N. York", "Londres"],
-    clues: [
-      "Rosa viajou para Paris.",
-      "Quen não viajou para Tóquio.",
-      "Sabi não viajou para Tóquio.",
-      "Sabi não viajou para Londres.",
-      "Teo não viajou para Londres.",
-    ],
-    solution: { Quen: "Londres", Rosa: "Paris", Sabi: "N. York", Teo: "Tóquio" },
-    difficulty: 4,
-  },
-];
-
-function getPuzzlePool(d: number): Puzzle[] {
-  // Estava fácil demais (níveis baixos só pegavam d1: 3×3 com 2 pistas, quase dado).
-  // Piso agora é d2 (cadeia de eliminação = raciocínio real) e os 4×4 (expert) chegam mais cedo.
-  if (d <= 1) return PUZZLES.filter(p => p.difficulty <= 2);                 // leve, mas já com cadeia
-  if (d <= 3) return PUZZLES.filter(p => p.difficulty === 2);
-  if (d <= 5) return PUZZLES.filter(p => p.difficulty === 2 || p.difficulty === 3);
-  if (d <= 7) return PUZZLES.filter(p => p.difficulty === 3);
-  if (d <= 9) return PUZZLES.filter(p => p.difficulty === 3 || p.difficulty === 4);
-  return PUZZLES.filter(p => p.difficulty === 4);
+interface RegistroProblema {
+  atribuicoes: RegistroAtribuicao[];
+  eventosPista: EventoPista[];
+  latenciaPrimeiraAcao: number | null;
+  totalAcoes: number;
+  tentativasConcluirIncorretas: number;
+  usosVerificarRaciocinio: number;
 }
 
-type CellState = "empty" | "yes" | "no";
-
-// ── Tutorial ──────────────────────────────────────────────────────────────
-
-function TutStep1({ theme, onDone }: { theme: Theme; onDone: () => void }) {
-  const [cellState, setCellState] = useState<CellState>("empty");
-  const sub = theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500";
+function novoRegistroProblema(): RegistroProblema {
+  return {
+    atribuicoes: [],
+    eventosPista: [],
+    latenciaPrimeiraAcao: null,
+    totalAcoes: 0,
+    tentativasConcluirIncorretas: 0,
+    usosVerificarRaciocinio: 0,
+  };
+}
 
-  function cycle() {
-    setCellState(s => s === "empty" ? "yes" : s === "yes" ? "no" : "empty");
+function paleta(theme: Theme) {
+  if (theme === "GAMIFIED") {
+    return {
+      fundo: "linear-gradient(145deg, #101b2d 0%, #17243a 55%, #111827 100%)",
+      painel: "border-white/10 bg-slate-900/80",
+      titulo: "text-slate-50",
+      texto: "text-slate-300",
+      textoSuave: "text-slate-400",
+      superficie: "bg-slate-950/40",
+      divisoria: "border-white/10",
+      rotulo: "bg-slate-800 text-slate-200",
+      celula: "border-slate-600 bg-slate-800 text-slate-100 hover:border-sky-500",
+      primaria: "bg-sky-700 text-white hover:bg-sky-600",
+      secundaria: "border-slate-500 bg-transparent text-slate-100 hover:bg-white/5",
+      mensagem: "border-slate-600 bg-slate-800 text-slate-100",
+    };
   }
-
-  // Auto-advance after 2 cycles
-  const clicks = useRef(0);
-  function handleClick() {
-    clicks.current++;
-    cycle();
-    if (clicks.current >= 3) setTimeout(onDone, 400);
+  if (theme === "COLORFUL") {
+    return {
+      fundo: "linear-gradient(145deg, #f5f1ff 0%, #eef5ff 55%, #f7f4ee 100%)",
+      painel: "border-violet-100 bg-white/95",
+      titulo: "text-slate-900",
+      texto: "text-slate-700",
+      textoSuave: "text-slate-500",
+      superficie: "bg-violet-50/50",
+      divisoria: "border-violet-100",
+      rotulo: "bg-violet-50 text-slate-700",
+      celula: "border-slate-200 bg-white text-slate-800 hover:border-violet-400",
+      primaria: "bg-violet-700 text-white hover:bg-violet-600",
+      secundaria: "border-violet-300 bg-white text-violet-900 hover:bg-violet-50",
+      mensagem: "border-violet-200 bg-violet-50 text-slate-800",
+    };
   }
-
-  const cellBg =
-    cellState === "yes" ? "bg-green-500 text-white" :
-    cellState === "no" ? "bg-red-400 text-white" :
-    theme === "GAMIFIED" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400";
-
-  return (
-    <div className="flex flex-col items-center gap-3">
-      <table className="border-collapse">
-        <thead>
-          <tr>
-            <th className={`p-2 text-xs ${sub}`}></th>
-            {["Azul", "Verde", "Amarela"].map(v => (
-              <th key={v} className={`p-2 text-xs font-bold ${sub}`}>{v}</th>
-            ))}
-          </tr>
-        </thead>
-        <tbody>
-          {["Ana", "Bruno", "Carla"].map((person, pi) => (
-            <tr key={person}>
-              <td className={`p-2 text-xs font-bold ${sub}`}>{person}</td>
-              {["Azul", "Verde", "Amarela"].map((val, vi) => (
-                <td key={val} className="p-1">
-                  <button
-                    onClick={pi === 0 && vi === 0 ? handleClick : undefined}
-                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
-                      pi === 0 && vi === 0 ? cellBg + " border-blue-400 ring-2 ring-blue-300" :
-                      theme === "GAMIFIED" ? "bg-gray-700 text-gray-600 border-gray-600" : "bg-gray-100 text-gray-300 border-gray-200"
-                    }`}>
-                    {pi === 0 && vi === 0 ? (cellState === "yes" ? "✓" : cellState === "no" ? "✗" : "") : ""}
-                  </button>
-                </td>
-              ))}
-            </tr>
-          ))}
-        </tbody>
-      </table>
-      <p className={`text-xs text-center ${sub}`}>Toque na célula azul para alternar: vazio → ✓ → ✗</p>
-    </div>
-  );
+  return {
+    fundo: "linear-gradient(155deg, #edf2f4 0%, #e4ecef 55%, #dde5e8 100%)",
+    painel: "border-slate-200 bg-white/95",
+    titulo: "text-slate-900",
+    texto: "text-slate-700",
+    textoSuave: "text-slate-500",
+    superficie: "bg-slate-50",
+    divisoria: "border-slate-200",
+    rotulo: "bg-slate-100 text-slate-700",
+    celula: "border-slate-300 bg-white text-slate-800 hover:border-sky-600",
+    primaria: "bg-slate-800 text-white hover:bg-slate-700",
+    secundaria: "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
+    mensagem: "border-slate-300 bg-slate-50 text-slate-800",
+  };
 }
 
-function DeductiveGridTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
-  const steps = [
-    {
-      instruction: "Leia as pistas e deduza quem tem cada atributo. Toque para marcar ✓ (SIM) ou ✗ (NÃO).",
-      content: (done: () => void) => <TutStep1 theme={theme} onDone={done} />,
-    },
-  ];
-  return <TutorialBase theme={theme} title="Grade Dedutiva" steps={steps} onDone={onDone} />;
+function celulaComValor(
+  grade: Record<string, ValorCelula[]>,
+  categoria: string,
+  posicao: number,
+  valor: ValorCelula
+): Record<string, ValorCelula[]> {
+  return {
+    ...grade,
+    [categoria]: grade[categoria].map((atual, indice) => indice === posicao - 1 ? valor : atual),
+  };
 }
 
-// ── Main component ─────────────────────────────────────────────────────────
-
 export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridProps) {
-  const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
-
-  const pool = useRef<Puzzle[]>(getPuzzlePool(difficulty).sort(() => Math.random() - 0.5));
-  const [puzzleIdx, setPuzzleIdx] = useState(0);
-  const [grid, setGrid] = useState<Record<string, CellState>>({});
-  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
-  const [showSuccess, setShowSuccess] = useState(false);
-
-  const [totalPuzzles, setTotalPuzzles] = useState(0);
-  const [totalErrors, setTotalErrors] = useState(0);
-  const startTime = useRef(Date.now());
-  const puzzleStartTime = useRef(Date.now());
-  const errorsThisPuzzle = useRef(0);
-  // Mais puzzles em níveis mais altos para treino progressivo
+  const desafio = useMemo(() => selecionarProblema(difficulty), [difficulty]);
+  const [tutorial, setTutorial] = useState(true);
+  const [puzzle, setPuzzle] = useState<Puzzle>(PROBLEMA_TUTORIAL);
+  const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(() => criarGradeVazia(PROBLEMA_TUTORIAL));
+  const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
+  const [mensagem, setMensagem] = useState<string | null>(null);
+  const [concluido, setConcluido] = useState(false);
+  const inicioProblema = useRef(Date.now());
+  const registro = useRef<RegistroProblema>(novoRegistroProblema());
+  const transicao = useRef<ReturnType<typeof setTimeout> | null>(null);
+  const pal = paleta(theme);
+
+  useEffect(() => () => {
+    if (transicao.current !== null) clearTimeout(transicao.current);
+  }, []);
 
-  const currentPuzzle = pool.current[puzzleIdx % pool.current.length];
+  const duplicadas = celulasComValorRepetido(grade);
 
-  const initGrid = useCallback((puzzle: Puzzle) => {
-    const g: Record<string, CellState> = {};
-    for (const person of puzzle.people) {
-      for (const value of puzzle.values) {
-        g[`${person}|${value}`] = "empty";
-      }
+  function registrarAcao(): number {
+    const momento = Math.max(0, Date.now() - inicioProblema.current);
+    registro.current.totalAcoes += 1;
+    if (registro.current.latenciaPrimeiraAcao === null) {
+      registro.current.latenciaPrimeiraAcao = momento;
     }
-    setGrid(g);
-    setErrorCells(new Set());
-    setShowSuccess(false);
-    errorsThisPuzzle.current = 0;
-    puzzleStartTime.current = Date.now();
-  }, []);
-
-  // Initialize on start
-  const startedRef = useRef(false);
-  if (!startedRef.current && !showTutorial) {
-    startedRef.current = true;
-    initGrid(currentPuzzle);
-    startTime.current = Date.now();
+    return momento;
   }
 
-  function cycleCellState(person: string, value: string) {
-    const key = `${person}|${value}`;
-    setGrid(prev => {
-      const cur = prev[key] ?? "empty";
-      const next: CellState = cur === "empty" ? "yes" : cur === "yes" ? "no" : "empty";
-      const updated = { ...prev, [key]: next };
-      // Cada pessoa tem exatamente UM valor: ao marcar "yes", os demais "yes" da mesma
-      // linha viram "no" (dedução lógica). Impede múltiplos "yes" por pessoa, que antes
-      // corrompiam a validação — ela só conferia o primeiro "yes" via Array.find.
-      if (next === "yes") {
-        for (const v of currentPuzzle.values) {
-          if (v !== value && updated[`${person}|${v}`] === "yes") {
-            updated[`${person}|${v}`] = "no";
-          }
-        }
+  function marcarAtribuicoesRevisadas(categoria: string, posicao: number): void {
+    registro.current.atribuicoes.forEach((atribuicao) => {
+      if (atribuicao.categoria === categoria && atribuicao.posicao === posicao) {
+        atribuicao.revisadaDepois = true;
       }
-      return updated;
     });
-    setErrorCells(prev => { const n = new Set(prev); n.delete(`${person}|${value}`); return n; });
   }
 
-  function handleConfirm() {
-    // Check if all cells have a state (not empty)
-    const allFilled = currentPuzzle.people.every(p =>
-      currentPuzzle.values.some(v => grid[`${p}|${v}`] === "yes")
+  function atribuir(categoria: string, posicao: number, valor: string): void {
+    if (concluido) return;
+    const valorAnterior = grade[categoria][posicao - 1];
+    if (valorAnterior === valor) return;
+    if (valorAnterior !== null) marcarAtribuicoesRevisadas(categoria, posicao);
+
+    const determinada = relacaoJaDeterminada(
+      puzzle,
+      paraMarcacaoParcial(grade),
+      categoria,
+      valor,
+      posicao
     );
-    if (!allFilled) return;
-
-    // Validate
-    const newErrors = new Set<string>();
-    let correct = true;
-    for (const person of currentPuzzle.people) {
-      const selected = currentPuzzle.values.find(v => grid[`${person}|${v}`] === "yes");
-      if (selected !== currentPuzzle.solution[person]) {
-        newErrors.add(`${person}|${selected ?? ""}`);
-        newErrors.add(`${person}|${currentPuzzle.solution[person]}`);
-        correct = false;
-      }
-    }
-
-    if (!correct) {
-      setErrorCells(newErrors);
-      errorsThisPuzzle.current++;
-      setTotalErrors(e => e + 1);
-      return;
-    }
-
-    // Success
-    setShowSuccess(true);
-    const nextTotal = totalPuzzles + 1;
-    setTotalPuzzles(nextTotal);
+    registro.current.atribuicoes.push({
+      categoria,
+      valor,
+      posicao,
+      momento: registrarAcao(),
+      valorAnterior,
+      relacaoJaEstavaLogicamenteDeterminada: determinada,
+      revisadaDepois: false,
+    });
+    setGrade((atual) => celulaComValor(atual, categoria, posicao, valor));
+    setMensagem(null);
+  }
 
-    if (isTimeUp()) {
-      finish();
-      setTimeout(() => {
-        // totalErrors já soma TODOS os erros (inclui os deste puzzle); não somar errorsThisPuzzle de novo.
-        const accuracy = Math.max(0, 1 - totalErrors / (nextTotal * 2));
-        const duration = elapsedSec();
-        const score = calculateExerciseScore("deductive-grid", accuracy, undefined, difficulty);
-        onComplete({
-          exerciseId: "deductive-grid",
-          domain: "executive",
-          score,
-          accuracy,
-          difficulty,
-          duration,
-          metadata: { puzzlesSolved: nextTotal, totalErrors },
-        });
-      }, 1200);
-    } else {
-      setTimeout(() => {
-        const nextIdx = puzzleIdx + 1;
-        setPuzzleIdx(nextIdx);
-        initGrid(pool.current[nextIdx % pool.current.length]);
-      }, 1200);
-    }
+  function limpar(categoria: string, posicao: number): void {
+    if (concluido || grade[categoria][posicao - 1] === null) return;
+    marcarAtribuicoesRevisadas(categoria, posicao);
+    registrarAcao();
+    setGrade((atual) => celulaComValor(atual, categoria, posicao, null));
+    setMensagem(null);
   }
 
-  if (showTutorial) {
-    return <DeductiveGridTutorial theme={theme}
-      onDone={() => { begin(); setShowTutorial(false); initGrid(currentPuzzle); startTime.current = Date.now(); }} />;
+  function alternarPista(pistaId: string): void {
+    if (concluido) return;
+    const estavaRiscada = pistasRiscadas.has(pistaId);
+    const momento = registrarAcao();
+    registro.current.eventosPista.push({
+      type: estavaRiscada ? "clue_uncrossed" : "clue_crossed",
+      pistaId,
+      momento,
+      timestamp: Date.now(),
+    });
+    setPistasRiscadas((atuais) => {
+      const proximas = new Set(atuais);
+      if (estavaRiscada) proximas.delete(pistaId);
+      else proximas.add(pistaId);
+      return proximas;
+    });
+    setMensagem(null);
   }
 
-  const isGamified = theme === "GAMIFIED";
-  const isColorful = theme === "COLORFUL";
+  function verificar(): void {
+    if (concluido || !verificacaoDisponivel(puzzle.nivel)) return;
+    registrarAcao();
+    registro.current.usosVerificarRaciocinio += 1;
+    const temIncompatibilidade = !admiteSolucao(puzzle, paraMarcacaoParcial(grade));
+    setMensagem(mensagemVerificacao(puzzle.nivel, temIncompatibilidade));
+  }
 
-  const rootBg: React.CSSProperties = isGamified
-    ? { background: "linear-gradient(145deg, #0a1628 0%, #0d2244 45%, #132a52 70%, #081020 100%)" }
-    : isColorful
-    ? { background: "linear-gradient(135deg, #f0e6ff 0%, #fce4f0 55%, #ffe8e0 100%)" }
-    : { background: "linear-gradient(160deg, #ede8df 0%, #e4ddd0 55%, #dbd4c5 100%)" };
+  function iniciarDesafio(): void {
+    setTutorial(false);
+    setPuzzle(desafio);
+    setGrade(criarGradeVazia(desafio));
+    setPistasRiscadas(new Set());
+    setMensagem(null);
+    setConcluido(false);
+    registro.current = novoRegistroProblema();
+    inicioProblema.current = Date.now();
+  }
 
-  const cardStyle: React.CSSProperties = isGamified
-    ? { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }
-    : { background: "#ffffff", border: "1.5px solid rgba(26,39,68,0.08)", borderRadius: 20, boxShadow: "0 4px 20px rgba(26,39,68,0.08)" };
+  function concluir(): void {
+    if (concluido) return;
+    registrarAcao();
+    if (!gradeEstaCorreta(puzzle, grade)) {
+      registro.current.tentativasConcluirIncorretas += 1;
+      setMensagem("Sua organização ainda contém incompatibilidades. Revise antes de concluir.");
+      return;
+    }
 
-  const confirmBtnStyle: React.CSSProperties = isGamified
-    ? { background: "linear-gradient(135deg, #0891b2, #0e7490)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(8,145,178,0.4)" }
-    : isColorful
-    ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", borderRadius: 9999, color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }
-    : { background: "linear-gradient(135deg, #1a2744, #2a4a8a)", borderRadius: 9999, color: "white", boxShadow: "0 4px 16px rgba(26,39,68,0.35)" };
+    const tempoTotal = Math.max(0, Date.now() - inicioProblema.current);
+    setConcluido(true);
+    setMensagem("Desafio concluído.");
 
-  const pal = {
-    title: isGamified ? "text-white" : "text-[#1a2744]",
-    sub: isGamified ? "text-white/70" : "text-[#8a7a6a]",
-    clueBox: isGamified ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-700",
-    cellEmpty: isGamified ? "bg-white/10 border-white/20 text-white/30" : "bg-gray-50 border-gray-200 text-gray-300",
-    cellYes: "bg-green-500 border-green-600 text-white",
-    cellNo: "bg-red-400 border-red-500 text-white",
-    cellErr: "bg-orange-400 border-orange-500 text-white ring-2 ring-orange-300",
-    personHead: isGamified ? "text-white/80" : "text-gray-700",
-    valueHead: isGamified ? "text-white/60" : "text-gray-500",
-  };
-
-  const allHaveYes = currentPuzzle.people.every(p =>
-    currentPuzzle.values.some(v => grid[`${p}|${v}`] === "yes")
-  );
+    if (tutorial) {
+      transicao.current = setTimeout(iniciarDesafio, 700);
+      return;
+    }
 
-  // Células menores para grids 4×4 (expert)
-  const isExpert = currentPuzzle.values.length >= 4;
-  const cellCls = isExpert ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
-  const headCls = isExpert ? "text-[9px]" : "text-[11px]";
+    const atribuicoes = registro.current.atribuicoes.map((atribuicao) => ({ ...atribuicao }));
+    const eventosPista = registro.current.eventosPista.map((evento) => ({ ...evento }));
+    const resumo = resumirAtribuicoes(atribuicoes);
+    const metadata = {
+      puzzleId: puzzle.id,
+      nivel: puzzle.nivel,
+      atribuicoes,
+      eventosPista,
+      ...resumo,
+      latenciaPrimeiraAcao: registro.current.latenciaPrimeiraAcao ?? tempoTotal,
+      totalAcoes: registro.current.totalAcoes,
+      tempoTotal,
+      tentativasConcluirIncorretas: registro.current.tentativasConcluirIncorretas,
+      usosVerificarRaciocinio: registro.current.usosVerificarRaciocinio,
+    };
+
+    transicao.current = setTimeout(() => {
+      onComplete({
+        exerciseId: "deductive-grid",
+        domain: "executive",
+        score: calculateExerciseScore("deductive-grid", 1, undefined, difficulty),
+        accuracy: 1,
+        difficulty,
+        duration: Math.round(tempoTotal / 1000),
+        metadata,
+      });
+    }, 700);
+  }
 
   return (
-    <ExerciseStage width="medio" background={rootBg.background as string}>
-      <div className="px-4 py-5 flex flex-col gap-4">
-
-        {/* Header */}
-        <div className="p-4" style={cardStyle}>
-          <div className="flex justify-between items-center mb-1">
-            <h2 className={`font-bold text-sm ${pal.title}`}>🔍 {currentPuzzle.title}</h2>
+    <ExerciseStage width="medio" background={pal.fundo}>
+      <main className="mx-auto w-full max-w-full overflow-x-hidden py-1 sm:py-3">
+        <section className={`overflow-hidden rounded-2xl border shadow-sm ${pal.painel}`}>
+          <header className={`border-b px-4 py-4 sm:px-6 ${pal.divisoria}`}>
+            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${pal.textoSuave}`}>
+              {tutorial ? "Tutorial" : "Desafio de lógica"}
+            </p>
+            <h1 className={`mt-1 text-xl font-semibold sm:text-2xl ${pal.titulo}`}>{puzzle.titulo}</h1>
+            <p className={`mt-2 max-w-3xl text-sm leading-6 ${pal.texto}`}>{puzzle.contexto}</p>
+            {tutorial && (
+              <p className={`mt-2 text-sm leading-6 ${pal.texto}`}>
+                Toque em uma célula e escolha um valor. Você pode trocar a escolha a qualquer momento.
+              </p>
+            )}
+          </header>
+
+          <div className="space-y-5 p-4 sm:p-6">
+            <section aria-labelledby="titulo-pistas">
+              <div className="mb-3 flex items-baseline justify-between gap-3">
+                <h2 id="titulo-pistas" className={`text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
+                  Pistas
+                </h2>
+                <span className={`text-xs ${pal.textoSuave}`}>Toque para riscar ou restaurar</span>
+              </div>
+              <ol className="columns-1 gap-x-7 sm:columns-2">
+                {puzzle.pistas.map((pista, indice) => {
+                  const riscada = pistasRiscadas.has(pista.id);
+                  return (
+                    <li key={pista.id} className="mb-2 break-inside-avoid">
+                      <button
+                        type="button"
+                        aria-pressed={riscada}
+                        onClick={() => alternarPista(pista.id)}
+                        className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-black/5 ${pal.texto} ${riscada ? "line-through opacity-50" : ""}`}
+                      >
+                        <span className="mr-2 font-semibold tabular-nums">{indice + 1}.</span>
+                        {pista.texto}
+                      </button>
+                    </li>
+                  );
+                })}
+              </ol>
+            </section>
+
+            <section aria-labelledby="titulo-grade" className="min-w-0">
+              <h2 id="titulo-grade" className={`mb-3 text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
+                Organização
+              </h2>
+              <div
+                className={`max-w-full overflow-x-auto overscroll-x-contain rounded-xl border ${pal.divisoria} ${pal.superficie}`}
+                tabIndex={0}
+                aria-label="Grade com rolagem horizontal quando necessária"
+              >
+                <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0">
+                  <colgroup>
+                    <col className="w-[140px]" />
+                    {Array.from({ length: puzzle.posicoes }, (_, indice) => <col key={indice} className="w-[105px]" />)}
+                  </colgroup>
+                  <thead>
+                    <tr>
+                      <th className={`sticky left-0 z-20 border-b border-r px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.rotulo}`}>
+                        Categoria
+                      </th>
+                      {Array.from({ length: puzzle.posicoes }, (_, indice) => (
+                        <th key={indice} className={`border-b px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.textoSuave}`}>
+                          Posição {indice + 1}
+                        </th>
+                      ))}
+                    </tr>
+                  </thead>
+                  <tbody>
+                    {puzzle.categorias.map((categoria, indiceCategoria) => (
+                      <tr key={categoria.id}>
+                        <th
+                          scope="row"
+                          className={`sticky left-0 z-10 border-r px-3 py-3 text-left text-sm font-semibold ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria} ${pal.rotulo}`}
+                        >
+                          {categoria.label}
+                        </th>
+                        {Array.from({ length: puzzle.posicoes }, (_, indicePosicao) => {
+                          const posicao = indicePosicao + 1;
+                          const valorAtual = grade[categoria.id][indicePosicao];
+                          const duplicada = duplicadas.has(chavePosicaoGrade(categoria.id, posicao));
+                          return (
+                            <td
+                              key={posicao}
+                              className={`px-2 py-2 ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria}`}
+                            >
+                              <DropdownMenu.Root>
+                                <DropdownMenu.Trigger asChild>
+                                  <button
+                                    type="button"
+                                    disabled={concluido}
+                                    title={duplicada ? "Este item já está sendo usado em outra posição." : undefined}
+                                    aria-label={`${categoria.label}, posição ${posicao}: ${valorAtual ?? "vazia"}`}
+                                    className={`min-h-12 w-full rounded-lg border px-2 py-2 text-sm font-medium transition-colors disabled:cursor-default ${
+                                      duplicada
+                                        ? "border-amber-400 bg-amber-50 text-amber-950"
+                                        : valorAtual !== null
+                                          ? "border-sky-500 bg-sky-50 text-sky-950"
+                                          : pal.celula
+                                    }`}
+                                  >
+                                    {valorAtual ?? "Selecionar"}
+                                  </button>
+                                </DropdownMenu.Trigger>
+                                <DropdownMenu.Portal>
+                                  <DropdownMenu.Content
+                                    sideOffset={6}
+                                    collisionPadding={12}
+                                    className="z-50 min-w-[210px] max-h-[min(320px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl"
+                                  >
+                                    <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
+                                      {categoria.label}
+                                    </DropdownMenu.Label>
+                                    {categoria.valores.map((valor) => {
+                                      const atual = valorAtual === valor;
+                                      const usadaEmOutraPosicao = grade[categoria.id].some(
+                                        (usado, outroIndice) => usado === valor && outroIndice !== indicePosicao
+                                      );
+                                      return (
+                                        <DropdownMenu.Item
+                                          key={valor}
+                                          onSelect={() => atribuir(categoria.id, posicao, valor)}
+                                          className={`cursor-pointer select-none rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100 ${
+                                            atual ? "bg-sky-50 font-semibold text-sky-950" : ""
+                                          } ${usadaEmOutraPosicao ? "line-through text-slate-400" : ""}`}
+                                        >
+                                          {valor}
+                                        </DropdownMenu.Item>
+                                      );
+                                    })}
+                                    {valorAtual !== null && (
+                                      <>
+                                        <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
+                                        <DropdownMenu.Item
+                                          onSelect={() => limpar(categoria.id, posicao)}
+                                          className="cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none data-[highlighted]:bg-slate-100"
+                                        >
+                                          Limpar
+                                        </DropdownMenu.Item>
+                                      </>
+                                    )}
+                                  </DropdownMenu.Content>
+                                </DropdownMenu.Portal>
+                              </DropdownMenu.Root>
+                            </td>
+                          );
+                        })}
+                      </tr>
+                    ))}
+                  </tbody>
+                </table>
+              </div>
+            </section>
+
+            {mensagem !== null && (
+              <p role="status" aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${pal.mensagem}`}>
+                {mensagem}
+              </p>
+            )}
+
+            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
+              {verificacaoDisponivel(puzzle.nivel) && (
+                <button
+                  type="button"
+                  onClick={verificar}
+                  disabled={concluido}
+                  className={`min-h-11 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${pal.secundaria}`}
+                >
+                  Verificar raciocínio
+                </button>
+              )}
+              <button
+                type="button"
+                onClick={concluir}
+                disabled={concluido}
+                className={`min-h-11 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${pal.primaria}`}
+              >
+                Concluir
+              </button>
+            </div>
           </div>
-          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
-        </div>
-
-        {/* Clues */}
-        <div className={`rounded-xl p-3 ${pal.clueBox}`}>
-          <p className={`text-xs font-bold mb-1 ${pal.title}`}>Pistas:</p>
-          {currentPuzzle.clues.map((clue, i) => (
-            <p key={i} className="text-xs leading-relaxed">• {clue}</p>
-          ))}
-        </div>
-
-        {/* Grid */}
-        <div className="p-3 overflow-x-auto" style={cardStyle}>
-          <table className="w-full border-collapse">
-            <thead>
-              <tr>
-                <th className="p-1"></th>
-                {currentPuzzle.values.map(v => (
-                  <th key={v} className={`p-1 ${headCls} font-bold text-center leading-tight ${pal.valueHead}`}>{v}</th>
-                ))}
-              </tr>
-            </thead>
-            <tbody>
-              {currentPuzzle.people.map(person => (
-                <tr key={person}>
-                  <td className={`p-1 pr-2 text-xs font-bold ${pal.personHead}`}>{person}</td>
-                  {currentPuzzle.values.map(value => {
-                    const key = `${person}|${value}`;
-                    const state = grid[key] ?? "empty";
-                    const isErr = errorCells.has(key);
-                    return (
-                      <td key={value} className="p-1 text-center">
-                        <button
-                          onClick={() => cycleCellState(person, value)}
-                          className={`${cellCls} rounded-lg border-2 font-bold transition-all ${
-                            isErr ? pal.cellErr :
-                            state === "yes" ? pal.cellYes :
-                            state === "no" ? pal.cellNo :
-                            pal.cellEmpty
-                          }`}>
-                          {state === "yes" ? "✓" : state === "no" ? "✗" : ""}
-                        </button>
-                      </td>
-                    );
-                  })}
-                </tr>
-              ))}
-            </tbody>
-          </table>
-        </div>
-
-        {/* Error hint */}
-        <AnimatePresence>
-          {errorCells.size > 0 && (
-            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
-              className="text-xs text-center text-orange-500 font-bold">
-              ⚠️ Algumas células estão erradas — reveja as pistas!
-            </motion.p>
-          )}
-        </AnimatePresence>
-
-        {/* Success */}
-        <AnimatePresence>
-          {showSuccess && (
-            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
-              className="text-center py-3 rounded-xl font-bold text-sm"
-              style={{ background: "rgba(22,163,74,0.92)", backdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}>
-              ✅ Correto! Excelente raciocínio!
-            </motion.div>
-          )}
-        </AnimatePresence>
-
-        {/* Confirm button */}
-        {!showSuccess && (
-          <button
-            onClick={handleConfirm}
-            disabled={!allHaveYes}
-            className="w-full py-3 font-bold text-sm transition-all disabled:opacity-40"
-            style={allHaveYes ? confirmBtnStyle : { borderRadius: 9999, background: isGamified ? "rgba(255,255,255,0.1)" : "#e5e7eb", color: isGamified ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
-            {allHaveYes ? "Confirmar →" : "Marque ✓ para cada pessoa"}
-          </button>
-        )}
-
-        <p className={`text-xs text-center ${pal.sub}`}>
-          Toque: 1x = ✓ (SIM), 2x = ✗ (NÃO), 3x = apaga
-        </p>
-      </div>
+        </section>
+      </main>
     </ExerciseStage>
   );
 }
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index c3e6129e..eeac2b0f 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -8,3 +8,23 @@ export {
   validarPuzzle,
 } from "./solver";
 export { derivar } from "./derivacao";
+export { BANCO_GRADE, PROBLEMA_TUTORIAL, PROBLEMAS_GRADE, selecionarProblema } from "./banco";
+export {
+  MENSAGEM_SEM_INCOMPATIBILIDADE,
+  NIVEIS_COM_VERIFICACAO,
+  celulasComValorRepetido,
+  chavePosicaoGrade,
+  criarGradeVazia,
+  gradeEstaCorreta,
+  mensagemVerificacao,
+  paraMarcacaoParcial,
+  relacaoJaDeterminada,
+  resumirAtribuicoes,
+  verificacaoDisponivel,
+} from "./interacao";
+export type {
+  EstadoGrade,
+  RegistroAtribuicao,
+  ResumoAtribuicoes,
+  ValorCelula,
+} from "./interacao";
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/grade/banco.ts
?? lib/grade/interacao.test.ts
?? lib/grade/interacao.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-f3 ==
