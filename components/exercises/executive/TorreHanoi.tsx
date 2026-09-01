"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { calculateExerciseScore } from "@/lib/scoring";
import { deveAvancarDeFase, deveSubirDeNivel, eficiencia } from "@/lib/torre-hanoi";
import { contarReversoes, type MovimentoTorre } from "@/lib/torres-registro";
import { BANCO, type Problema } from "@/lib/torres/banco";
import { dificuldadeDaFase, faseDaDificuldade, proximoProblema, type Fase } from "@/lib/torres/selecao";
import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
import { TutorialBase } from "@/components/exercises/TutorialBase";
import { ExerciseStage } from "@/components/exercises/ExerciseStage";
import type { ExerciseResult, Theme } from "@/types";

interface TorreHanoiProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

const MIN_DISCS = 3;
// Seis discos voltam apenas nas fases avançadas, previstas para a fatia 5.
const MAX_DISCS = 5;

interface EventoReinicio {
  movimento: number;
  tempoMs: number;
}

interface ResultadoPuzzle {
  correct: boolean;
  discs: number;
  problemaId: string;
  tipo: string;
  fase: number;
  restarts: number;
  eficiencia: number;
  movimentosTotais: number;
  movimentosSolucao: number;
  invalidos: number;
  reversoes: number;
  latenciaMs: number | null;
  eventosReinicio: EventoReinicio[];
}

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

/**
 * Miniatura do objetivo. Desenho sóbrio das três hastes com os discos na posição-alvo — sem
 * números e sem legenda. Nos alvos que NÃO são torre completa (tipos C e D) ela permanece
 * visível durante a execução: seção 47 dela, "não transformar o exercício em jogo de memória...
 * o foco é planejamento e resolução de problemas, não memória visual".
 */
function MiniaturaAlvo({ alvo, discos, escala = 1 }: { alvo: readonly (readonly number[])[]; discos: number; escala?: number }) {
  // `escala` existe para a hierarquia visual que ela pediu em 01/set/2026: na tela inicial o
  // objetivo é MENOR que a configuração inicial (é referência, não o estado de partida); durante
  // a execução fica menor ainda, só como apoio, sem competir com o tabuleiro.
  const H = 44 * escala, W = 34 * escala, DH = 5 * escala;
  return (
    <div className="flex items-end justify-center" style={{ gap: 6 * escala }} aria-hidden>
      {[0, 1, 2].map((haste) => (
        <div key={haste} className="relative flex flex-col-reverse items-center"
          style={{ width: W, height: H, borderBottom: `${Math.max(1.5, 2 * escala)}px solid #CBD5E1` }}>
          <div className="absolute bottom-0" style={{ width: Math.max(1.5, 2 * escala), height: H - 4 * escala, background: "#E2E8F0" }} />
          {alvo[haste].map((disc) => (
            <div key={disc} className="relative rounded-sm"
              style={{
                width: 8 * escala + (disc / discos) * (W - 10 * escala),
                height: DH,
                marginBottom: Math.max(1, escala),
                background: "#93C5FD",
              }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Alvo que é uma torre completa numa haste — nesses casos basta a linha de texto. */
function hasteUnicaDoAlvo(alvo: readonly (readonly number[])[]): 0 | 1 | 2 | null {
  const cheias = [0, 1, 2].filter((i) => alvo[i].length > 0);
  return cheias.length === 1 ? (cheias[0] as 0 | 1 | 2) : null;
}

const NOME_HASTE = ["esquerda", "central", "direita"] as const;
const POSICOES = ["Esquerda", "Central", "Direita"] as const;

/** Cópia profunda das três pilhas — o estado do banco é congelado e nunca pode ser mutado. */
function clonarEstado(e: readonly (readonly number[])[]): State {
  return [[...e[0]], [...e[1]], [...e[2]]] as State;
}

/**
 * Vitória deixou de ser "haste 2 cheia" e passou a ser IGUALDADE COM O ALVO do problema — com os
 * tipos C e D o alvo pode ser qualquer configuração. Comparação por valor, pilha a pilha: por
 * referência nunca daria certo, e o exercício simplesmente não terminaria.
 */
function mesmoEstado(a: readonly (readonly number[])[], b: readonly (readonly number[])[]): boolean {
  for (let i = 0; i < 3; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) if (a[i][j] !== b[i][j]) return false;
  }
  return true;
}


function HanoiPegsDisplay({
  rotularHastes = true,
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
  rotularHastes?: boolean;
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
          {/* Rótulo fixo só no TUTORIAL, onde o problema é de fato origem → destino. Fora dele
              (tela de objetivo de cada problema) os nomes mentiriam, porque o destino varia. */}
          {rotularHastes && (
            <div className={`text-xs absolute -bottom-5 ${theme === "GAMIFIED" ? "text-gray-400" : "text-gray-500"}`}>
              {POSICOES[pegIdx]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TorreHanoiTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
  const steps = [
    {
      instruction: "Objetivo: leve TODOS os discos para a haste da DIREITA. Regra: um disco MAIOR nunca pode ficar sobre um MENOR.",
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
  const SOLUTION: [number, number][] = [[0, 1], [0, 2], [1, 2]]; // de → para (0=Esquerda, 1=Central, 2=Direita)
  const HINTS = [
    "Passo 1 de 3 — tire o disco pequeno da frente: toque na Esquerda e depois na Central.",
    "Passo 2 de 3 — leve o disco grande DIRETO ao fim: toque na Esquerda e depois na Direita.",
    "Passo 3 de 3 — coloque o pequeno por cima: toque na Central e depois na Direita.",
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
          ? "🎉 Você conseguiu! Viu como o disco grande foi DIRETO à Direita? A haste do meio é só um apoio."
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
  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress(11 * 60 * 1000); // 11 min — planejamento (pedido da Kamylla)

  // O problema deixa de ser gerado (torre cheia → haste 2) e passa a VIR DO BANCO pré-validado:
  // configuração inicial, alvo e mínimo (da BFS) são propriedades dele. É o que traz os tipos
  // B–E da espec dela, e portanto a flexibilidade — seção 2: a dificuldade cresce pela NOVIDADE
  // do problema, não só pelo número de discos.
  const [fase, setFase] = useState<Fase>(() => faseDaDificuldade(difficulty));
  const usadosRef = useRef<string[]>([]);
  const tiposRef = useRef<string[]>([]);
  const [problema, setProblema] = useState<Problema>(() => {
    const p = proximoProblema(faseDaDificuldade(difficulty), [], []);
    return p;
  });
  const [mostrandoObjetivo, setMostrandoObjetivo] = useState(true);
  const [objetivoAmpliado, setObjetivoAmpliado] = useState(false);
  const discCount = problema.discos;
  const [puzzle, setPuzzle] = useState(0);
  const [puzzleResults, setPuzzleResults] = useState<ResultadoPuzzle[]>([]);

  // Puzzle state
  const [pegs, setPegs] = useState<State>(() => clonarEstado(problema.inicial));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [restartsThisPuzzle, setRestartsThisPuzzle] = useState(0);
  const [movesBeforeRestarts, setMovesBeforeRestarts] = useState(0);
  const [restartEvents, setRestartEvents] = useState<EventoReinicio[]>([]);
  const [invalidMoves, setInvalidMoves] = useState(0);
  const [movesThisAttempt, setMovesThisAttempt] = useState<MovimentoTorre[]>([]);
  const [reversoesBeforeRestarts, setReversoesBeforeRestarts] = useState(0);
  const [showInvalidMove, setShowInvalidMove] = useState(false);
  // Segunda tentativa (seções 7, 8, 24-27, 51, 52 da espec dela). NADA a ver com os reinícios,
  // que são ilimitados e acontecem ANTES de concluir: esta é a tentativa voluntária DEPOIS de
  // concluir e de ver o menor caminho — e só se permite UMA, senão vira repetição até decorar
  // aquela configuração (seção 52).
  const [isSegundaTentativa, setIsSegundaTentativa] = useState(false);
  const [movimentosPrimeira, setMovimentosPrimeira] = useState<number | null>(null);
  const [aguardandoEscolha, setAguardandoEscolha] = useState(false);
  const segundasRef = useRef<{ primeira: number; segunda: number }[]>([]);
  // Para onde ir quando ele escolher "Continuar": o cálculo acontece na vitória, o uso acontece
  // depois, na escolha.
  const proximoRef = useRef<{ puzzle: number; fase: Fase } | null>(null);

  const puzzleStart = useRef<number>(Date.now());
  // A latência pertence ao problema inteiro: um reinício não apaga o primeiro contato válido.
  const firstValidMoveAt = useRef<number | null>(null);
  const invalidMoveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Largura de cada torre (medida) → discos escalam pra caber em qualquer tela.
  const rowRef = useRef<HTMLDivElement>(null);
  const [slotW, setSlotW] = useState(180);
  useEffect(() => {
    const measure = () => { const w = rowRef.current?.offsetWidth; if (w) setSlotW((w - 16) / 3); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showTutorial]);

  useEffect(() => () => {
    if (invalidMoveTimer.current !== null) clearTimeout(invalidMoveTimer.current);
  }, []);

  // O mínimo vem da BFS, gravado no problema. A fórmula 2^n−1 só valia para a torre
  // clássica e mentiria em todos os outros tipos.
  const optimal = problema.minimo;

  /** Sorteia o próximo problema da fase e reabre a tela de objetivo (seção 45). */
  function avancarParaProximoProblema(proxFase: Fase) {
    const prox = proximoProblema(proxFase, usadosRef.current, tiposRef.current);
    usadosRef.current = [...usadosRef.current, prox.id];
    tiposRef.current = [...tiposRef.current, prox.tipo];
    setProblema(prox);
    startNewPuzzle(prox);
    setMostrandoObjetivo(true);
  }

  function startNewPuzzle(prox: Problema) {
    setPegs(clonarEstado(prox.inicial));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setRestartsThisPuzzle(0);
    setMovesBeforeRestarts(0);
    setRestartEvents([]);
    setInvalidMoves(0);
    setMovesThisAttempt([]);
    setReversoesBeforeRestarts(0);
    setShowInvalidMove(false);
    firstValidMoveAt.current = null;
    setIsSegundaTentativa(false);
    setMovimentosPrimeira(null);
    setAguardandoEscolha(false);
    puzzleStart.current = Date.now();
  }

  // Refaz O MESMO problema: mesmos discos, mesma configuração inicial. Preserva
  // `movimentosPrimeira` para a comparação do fim, e marca que a cota de uma tentativa foi usada.
  function tentarNovamente() {
    setPegs(clonarEstado(problema.inicial));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setRestartsThisPuzzle(0);
    setMovesBeforeRestarts(0);
    setRestartEvents([]);
    setInvalidMoves(0);
    setMovesThisAttempt([]);
    setReversoesBeforeRestarts(0);
    setShowInvalidMove(false);
    firstValidMoveAt.current = null;
    setIsSegundaTentativa(true);
    setAguardandoEscolha(false);
    puzzleStart.current = Date.now();
  }

  function restartPuzzle() {
    if (won || moves === 0) return;

    setMovesBeforeRestarts((total) => total + moves);
    setRestartEvents((eventos) => [...eventos, {
      movimento: moves,
      tempoMs: Date.now() - puzzleStart.current,
    }]);
    setReversoesBeforeRestarts((total) => total + contarReversoes(movesThisAttempt));
    setPegs(clonarEstado(problema.inicial));
    setSelected(null);
    setMoves(0);
    setWon(false);
    setRestartsThisPuzzle((restarts) => restarts + 1);
    setMovesThisAttempt([]);
  }

  // Botão "Continuar" da escolha. Se o tempo da sessão acabou enquanto ele decidia, a próxima
  // vitória encerra a sessão pelo caminho normal — aqui só avançamos o problema.
  function continuarAposEscolha() {
    const destino = proximoRef.current;
    setAguardandoEscolha(false);
    if (!destino) return;
    proximoRef.current = null;
    setPuzzle(destino.puzzle);
    setFase(destino.fase);
    avancarParaProximoProblema(destino.fase);
  }

  function flashInvalidMove() {
    setInvalidMoves((total) => total + 1);
    setShowInvalidMove(true);
    if (invalidMoveTimer.current !== null) clearTimeout(invalidMoveTimer.current);
    invalidMoveTimer.current = setTimeout(() => {
      setShowInvalidMove(false);
      invalidMoveTimer.current = null;
    }, 1200);
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
        flashInvalidMove();
        return;
      }

      const newPegs: State = pegs.map((p) => [...p]) as State;
      newPegs[selected].pop();
      newPegs[pegIdx].push(disc);
      setPegs(newPegs);
      const newMoves = moves + 1;
      setMoves(newMoves);
      const movimento: MovimentoTorre = { disco: disc, de: selected, para: pegIdx };
      const newMovesThisAttempt = [...movesThisAttempt, movimento];
      setMovesThisAttempt(newMovesThisAttempt);
      const movedAt = Date.now();
      if (firstValidMoveAt.current === null) firstValidMoveAt.current = movedAt;
      setSelected(null);

      if (mesmoEstado(newPegs, problema.alvo)) {
        setWon(true);
        const ef = eficiencia(newMoves, optimal);

        const newPuzzleResults = [...puzzleResults, {
          correct: true,
          discs: discCount,
          problemaId: problema.id,
          tipo: problema.tipo,
          fase: problema.fase,
          restarts: restartsThisPuzzle,
          eficiencia: ef,
          movimentosTotais: movesBeforeRestarts + newMoves,
          movimentosSolucao: newMoves,
          invalidos: invalidMoves,
          reversoes: reversoesBeforeRestarts + contarReversoes(newMovesThisAttempt),
          latenciaMs: firstValidMoveAt.current === null ? null : firstValidMoveAt.current - puzzleStart.current,
          eventosReinicio: restartEvents,
        }];
        // A PRIMEIRA tentativa é a que alimenta progressão e acurácia: ela é a espontânea
        // (seção 6 — antes dela o mínimo nunca foi mostrado). A segunda acontece já sabendo que
        // existe caminho melhor, então mediria outra coisa. Ela é registrada, nunca promovida.
        if (!isSegundaTentativa) {
          setPuzzleResults(newPuzzleResults);
          setMovimentosPrimeira(newMoves);
        } else if (movimentosPrimeira !== null) {
          segundasRef.current = [...segundasRef.current, { primeira: movimentosPrimeira, segunda: newMoves }];
        }

        const base = isSegundaTentativa ? puzzleResults : newPuzzleResults;
        // Resolver é sucesso; eficiência boa ou adequada define a progressão.
        // A progressão passa a subir de FASE (seção 14: o nível não é o número de discos). O
        // número de discos vem do problema sorteado dentro da fase.
        // Nas fases 1 e 2 o critério é o GATE de aquisição (resolveu sem dificuldade importante,
        // sem exigir o mínimo); da 3 em diante volta o critério de eficiência. São 8 fases.
        const avanca = deveAvancarDeFase(fase, {
          eficiencia: ef,
          reinicios: restartsThisPuzzle,
          invalidos: invalidMoves,
        });
        const proxFase: Fase = avanca ? (Math.min(8, fase + 1) as Fase) : fase;

        const nextPuzzle = puzzle + 1;
        const timeUp = isTimeUp();

        // Fim de sessão nunca oferece segunda tentativa: encerra como sempre.
        if (!timeUp && !isSegundaTentativa) {
          proximoRef.current = { puzzle: nextPuzzle, fase: proxFase };
          setAguardandoEscolha(true);
          return;
        }

        setTimeout(() => {
          if (timeUp) {
            finish();
            const resultados = base;
            const correctCount = resultados.filter((r) => r.correct).length;
            // `accuracy` é o campo que ALIMENTA A ENGINE ADAPTATIVA (`lib/adaptive.ts:154`:
            // ≥ 0,80 sobe de nível) e o que a terapeuta lê. Se fosse "resolvidos ÷ total", como
            // resolver passou a ser sempre o sucesso, daria 100% em toda sessão — o exercício
            // subiria de nível para sempre e a conquista de 100% dispararia sozinha.
            // Então a acurácia é a proporção de puzzles resolvidos com eficiência BOA ou
            // ADEQUADA (≤ 1,40), o mesmo critério de `deveSubirDeNivel`. Não é o mínimo exato,
            // revogado por ela em 31/ago; é o desempenho estratégico, que discrimina.
            // `correct` no metadata segue significando RESOLVIDOS.
            const eficientes = resultados.filter((r) => deveSubirDeNivel(r.eficiencia)).length;
            const accuracy = eficientes / Math.max(1, resultados.length);
            const maxDiscs = Math.max(...resultados.map((r) => r.discs));
            const restarts = resultados.reduce((total, result) => total + result.restarts, 0);
            const puzzlesComReinicio = resultados.filter((result) => result.restarts > 0).length;
            const eficienciaMedia = resultados.reduce((total, result) => total + result.eficiencia, 0) / Math.max(1, resultados.length);
            const movimentosTotais = resultados.reduce((total, result) => total + result.movimentosTotais, 0);
            const movimentosSolucao = resultados.reduce((total, result) => total + result.movimentosSolucao, 0);
            const invalidos = resultados.reduce((total, result) => total + result.invalidos, 0);
            const reversoes = resultados.reduce((total, result) => total + result.reversoes, 0);
            const latencias = resultados
              .map((result) => result.latenciaMs)
              .filter((latencia): latencia is number => latencia !== null);
            // `null` é intencional quando não há primeiro movimento válido, evitando NaN no JSON.
            const latenciaMediaMs = latencias.length > 0
              ? latencias.reduce((total, latencia) => total + latencia, 0) / latencias.length
              : null;
            const reinicios = resultados
              .map((result, index) => ({ puzzle: index + 1, discos: result.discs, eventos: result.eventosReinicio }))
              .filter((result) => result.eventos.length > 0);
            const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, maxDiscs);
            onComplete({
              exerciseId: "torre-hanoi",
              domain: "executive",
              score,
              accuracy,
              // A FASE é o que precisa sobreviver à sessão. Enviar `maxDiscs` aqui fazia o
              // paciente REGREDIR de fase a cada retomada (bug de 01/set/2026); `maxDiscs`
              // continua no metadata, que é onde ele é informação clínica.
              difficulty: dificuldadeDaFase(proxFase),
              duration: elapsedSec(),
              metadata: {
                puzzles: resultados.length,
                maxDiscs,
                correct: correctCount,
                resolvidosComBoaEficiencia: eficientes,
                restarts,
                puzzlesComReinicio,
                eficienciaMedia,
                movimentosTotais,
                movimentosSolucao,
                invalidos,
                reversoes,
                latenciaMediaMs,
                reinicios,
                tiposJogados: resultados.reduce<Record<string, number>>((acc, r) => {
                  acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
                  return acc;
                }, {}),
                fasesJogadas: resultados.reduce<Record<string, number>>((acc, r) => {
                  acc[String(r.fase)] = (acc[String(r.fase)] ?? 0) + 1;
                  return acc;
                }, {}),
                segundasTentativas: segundasRef.current.length,
                melhoraMediaMovimentos: segundasRef.current.length
                  ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda), 0) / segundasRef.current.length
                  : null,
                // Registrada, NUNCA mostrada ao paciente (seção 51 dela).
                melhoraMediaPercentual: segundasRef.current.length
                  ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda) / Math.max(1, r.primeira), 0) / segundasRef.current.length
                  : null,
              },
            });
          } else {
            setPuzzle(nextPuzzle);
            setFase(proxFase);
            avancarParaProximoProblema(proxFase);
          }
        }, 2500);
      }
    }
  }

  // Tela de cada problema (seção 45): o enunciado, o objetivo em miniatura e COMEÇAR. Ela existe
  // porque com configuração inicial e alvo variáveis o paciente PRECISA analisar a situação antes
  // de agir — é o "observe o problema antes de começar" da instrução dela (seção 21).
  if (!showTutorial && mostrandoObjetivo) {
    return (
      <ExerciseStage width="medio" background="#F3F4F6">
        <div className="w-full rounded-3xl bg-white p-6 sm:p-7 text-center"
          style={{ boxShadow: "0 12px 40px rgba(15,23,42,.10)", border: "1px solid #EEF0F4" }}>
          <h2 className="font-bold tracking-tight" style={{ color: "#0F172A", fontSize: 20 }}>
            Organize os discos conforme o objetivo.
          </h2>

          {/* Os dois estados visuais, com PESOS DIFERENTES — hierarquia pedida por ela em
              01/set/2026 vendo a tela: "manter a Configuração Inicial em destaque principal;
              deixar o Objetivo menor... a ideia é que o paciente entenda: isso é o estado de
              partida e isso é a referência para onde preciso chegar". Antes os dois ocupavam
              metade da tela cada e competiam entre si. */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="sm:flex-1 sm:min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#94A3B8" }}>Configuração inicial</p>
              <HanoiPegsDisplay pegs={problema.inicial as State} theme={theme} selected={null} discCount={problema.discos} rotularHastes={false} />
            </div>

            <div className="shrink-0 rounded-2xl px-4 py-3 mx-auto sm:mx-0"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2 text-center" style={{ color: "#94A3B8" }}>Objetivo</p>
              <MiniaturaAlvo alvo={problema.alvo} discos={problema.discos} escala={2.4} />
            </div>
          </div>

          <button type="button" onClick={() => { setMostrandoObjetivo(false); puzzleStart.current = Date.now(); }}
            className="mt-8 w-full rounded-xl py-3 font-bold text-sm"
            style={{ background: "#2563EB", color: "#FFFFFF" }}>
            Começar
          </button>
        </div>
      </ExerciseStage>
    );
  }

  if (showTutorial) {
    return <TorreHanoiTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); setMostrandoObjetivo(true); }} />;
  }

  // Progresso VISUAL do jogo: quantos discos já chegaram ao destino.

  // Larguras progressivas (disco 1 mais estreito, disco N mais largo), escaladas
  // pela largura da torre pra caber em qualquer tela sem cortar.
  const MAXW = Math.min(168, slotW * 0.88);
  const MINW = Math.max(30, Math.min(46, slotW * 0.30));
  const DISC_H = 26;
  const discWidth = (disc: number) =>
    discCount <= 1 ? MAXW : MINW + ((disc - 1) / (discCount - 1)) * (MAXW - MINW);
  // O teto baixou para 5, mas a altura mínima preserva uma área confortável para tocar nas hastes.
  const towerH = Math.max(200, MAX_DISCS * (DISC_H + 4) + 26);
  // Rótulos por POSIÇÃO, nunca por papel. Decisão dela em 01/set/2026: "usar sempre os rótulos
  // Esquerda / Central / Direita... porque agora qualquer haste pode exercer qualquer função".
  // "Origem/Auxiliar/Destino" mentiam assim que o destino passou a variar — a haste rotulada
  // "Destino" não era o destino do problema. Posição não tem como mentir.
  const rotuloDaHaste = (i: number) => POSICOES[i];

  return (
    <ExerciseStage width="medio" background="#F3F4F6">
      <div className="w-full rounded-3xl bg-white p-6 sm:p-7"
        style={{ boxShadow: "0 12px 40px rgba(15,23,42,.10)", border: "1px solid #EEF0F4" }}>

        {/* Título à esquerda, OBJETIVO no canto superior direito — escolha dela em 01/set/2026:
            "não colocaria o objetivo no meio das três hastes, porque pode parecer uma quarta
            informação misturada ao tabuleiro... uma pequena caixa no canto superior direito do
            card. Assim o paciente olha rapidamente para ela e volta ao tabuleiro principal."
            A miniatura fica SEMPRE visível: esconder o alvo transformaria o exercício em prova de
            memória visual, que não é o foco. O botão só AMPLIA. */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold tracking-tight" style={{ color: "#0F172A", fontSize: 22, lineHeight: 1.1 }}>Jogo das Torres</h2>
            {/* O nível passou a ser a FASE, não o número de discos — e a fase é mecânica interna, que
                não vai para a tela. Sobra a informação neutra do problema em jogo. */}
            <p className="mt-1 text-sm font-medium" style={{ color: "#64748B" }}>{discCount} discos</p>
          </div>

          <button type="button" onClick={() => setObjetivoAmpliado(true)}
            className="shrink-0 rounded-xl px-3 py-2 text-left transition-colors"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            aria-label="Ampliar objetivo">
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#94A3B8" }}>Objetivo</p>
            <MiniaturaAlvo alvo={problema.alvo} discos={problema.discos} escala={0.85} />
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#2563EB" }}>Ampliar</p>
          </button>
        </div>

        {!won && (() => { const reiniciarBloqueado = moves === 0; return (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={restartPuzzle}
              disabled={moves === 0}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              style={{
                background: reiniciarBloqueado ? "#F8FAFC" : "#FFFFFF",
                border: `1px solid ${reiniciarBloqueado ? "#E2E8F0" : "#CBD5E1"}`,
                color: reiniciarBloqueado ? "#94A3B8" : "#475569",
              }}
            >
              Reiniciar
            </button>
          </div>
        ); })()}

        {/* A barra de progresso do jogo SAIU em 01/set/2026, vendo a tela com ela. Ela contava
            discos já na posição do alvo — e como o alvo pode ser qualquer haste, os discos entram
            e saem dela o tempo todo: a barra subia e descia sem querer dizer nada. Além disso era
            um placar, e placar durante a execução é justamente o que ela mandou tirar. */}

        {/* Ampliação temporária do objetivo. Nunca é a ÚNICA forma de ver o alvo — a miniatura
            do canto continua ali. Isto é conforto de leitura, não um recurso a ser gerenciado. */}
        <AnimatePresence>
          {objetivoAmpliado && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{ background: "rgba(15,23,42,0.55)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setObjetivoAmpliado(false)}
            >
              <motion.div className="rounded-3xl bg-white p-6 text-center"
                style={{ boxShadow: "0 20px 60px rgba(15,23,42,.25)", maxWidth: 520, width: "100%" }}
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "#94A3B8" }}>Objetivo</p>
                <HanoiPegsDisplay pegs={problema.alvo as State} theme={theme} selected={null} discCount={problema.discos} rotularHastes={false} />
                <button type="button" onClick={() => setObjetivoAmpliado(false)}
                  className="mt-6 w-full rounded-xl py-3 font-bold text-sm"
                  style={{ background: "#2563EB", color: "#FFFFFF" }}>
                  Fechar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Único texto permitido na execução da 2ª tentativa (seção 25): nada de mínimo,
            contador ou eficiência — a regra da fatia 1 continua valendo integralmente. */}
        {isSegundaTentativa && !won && (
          <p className="mt-3 text-center text-sm" style={{ color: "#64748B" }}>
            Tente encontrar uma estratégia mais eficiente.
          </p>
        )}

        {/* A linha do aviso ocupa altura FIXA, com ou sem mensagem: se ela entrasse e saísse do
            fluxo, as torres seriam empurradas para baixo e puxadas de volta a cada movimento
            inválido — e é justamente quem erra mais que veria a tela pular mais. */}
        <div className="mt-3 h-5 flex items-center justify-center">
          <AnimatePresence>
            {showInvalidMove && (
              <motion.p
                className="text-center text-sm"
                style={{ color: "#475569" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Esse movimento não é permitido.
              </motion.p>
            )}
          </AnimatePresence>
        </div>


        {/* Torres */}
        <div ref={rowRef} className="mt-7 flex justify-between items-end gap-2" style={{ paddingBottom: 28 }}>
          {pegs.map((peg, pegIdx) => {
            const isSel = selected === pegIdx;
            return (
              <button key={pegIdx} onClick={() => handlePegClick(pegIdx)} aria-label={`Haste ${POSICOES[pegIdx]}`}
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
                <span className="absolute text-xs font-semibold" style={{ bottom: -24, color: isSel ? "#B45309" : "#94A3B8" }}>{rotuloDaHaste(pegIdx)}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {won && (
            <motion.div
              className="text-center mt-6 rounded-2xl p-4"
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
              }}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mx-auto mb-2 flex items-center justify-center rounded-full"
                style={{ width: 44, height: 44, background: "#DBEAFE" }}>
                <Check size={22} color="#2563EB" strokeWidth={3} />
              </div>
              <p className="font-bold text-lg" style={{ color: "#1D4ED8" }}>
                Muito bem!
              </p>
              <p className="text-sm" style={{ color: "#2563EB" }}>
                Você resolveu o desafio em {moves} movimento{moves !== 1 ? "s" : ""}.
              </p>
              <p className="text-xs mt-1" style={{ color: "#2563EB" }}>
                O menor caminho possível era {optimal} movimento{optimal !== 1 ? "s" : ""}.
              </p>

              {/* Comparação entre as duas tentativas: a informação basta como retorno. Sem
                  "Excelente!", sem "Perfeito!" — e, se piorou, sem nenhuma mensagem negativa
                  (seções 26 e 27 dela). */}
              {isSegundaTentativa && movimentosPrimeira !== null && (
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid #BFDBFE" }}>
                  <p className="text-sm font-semibold" style={{ color: "#1D4ED8" }}>
                    {moves < movimentosPrimeira
                      ? "Você encontrou um caminho mais eficiente."
                      : "Desafio concluído."}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: "#2563EB" }}>
                    1ª tentativa: {movimentosPrimeira} movimento{movimentosPrimeira !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs" style={{ color: "#2563EB" }}>
                    2ª tentativa: {moves} movimento{moves !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* A escolha da seção 7. Só aparece na PRIMEIRA conclusão do problema: uma segunda
                  tentativa voluntária, nunca duas (seção 52). */}
              {aguardandoEscolha && (
                <>
                  <p className="text-sm mt-3" style={{ color: "#1D4ED8" }}>
                    Quer tentar encontrar um caminho mais eficiente?
                  </p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button type="button" onClick={tentarNovamente}
                      className="rounded-xl px-4 py-2.5 text-sm font-bold"
                      style={{ background: "#FFFFFF", border: "1px solid #BFDBFE", color: "#1D4ED8" }}>
                      Tentar novamente
                    </button>
                    <button type="button" onClick={continuarAposEscolha}
                      className="rounded-xl px-4 py-2.5 text-sm font-bold"
                      style={{ background: "#2563EB", color: "#FFFFFF" }}>
                      Continuar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ExerciseStage>
  );
}
