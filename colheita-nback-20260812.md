== DIFF do lab aposentar-nback (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index 2385f3bd..60ebf12d 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -38,7 +38,6 @@ import {
 import {
   certoOuErradoTutorial,
   dualTaskTutorial,
-  nbackTutorial,
   semaforoTutorial,
   tempoReacaoTutorial,
 } from "@/lib/tutorial/definitions/estimulo-continuo";
@@ -70,7 +69,6 @@ const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>> = Ob
   "semaforo": semaforoTutorial,
   "vigilancia": vigilanciaTutorial,
   "tempo-reacao": tempoReacaoTutorial,
-  "nback": nbackTutorial,
   "dual-task": dualTaskTutorial,
   "mot": motTutorial,
   "certo-ou-errado": certoOuErradoTutorial,
@@ -86,7 +84,6 @@ const MatrizEspacial      = dynamic(() => import("@/components/exercises/memory/
 const JogoMemoria         = dynamic(() => import("@/components/exercises/memory/JogoMemoria").then(m => ({ default: m.JogoMemoria })), { loading: ExerciseLoader, ssr: false });
 const SpanNumericoInverso = dynamic(() => import("@/components/exercises/memory/SpanNumericoInverso").then(m => ({ default: m.SpanNumericoInverso })), { loading: ExerciseLoader, ssr: false });
 const MatrizEspacialInversa = dynamic(() => import("@/components/exercises/memory/MatrizEspacialInversa").then(m => ({ default: m.MatrizEspacialInversa })), { loading: ExerciseLoader, ssr: false });
-const NBack               = dynamic(() => import("@/components/exercises/memory/NBack").then(m => ({ default: m.NBack })), { loading: ExerciseLoader, ssr: false });
 const TrilhaVisual        = dynamic(() => import("@/components/exercises/attention/TrilhaVisual").then(m => ({ default: m.TrilhaVisual })), { loading: ExerciseLoader, ssr: false });
 const StroopTask          = dynamic(() => import("@/components/exercises/executive/StroopTask").then(m => ({ default: m.StroopTask })), { loading: ExerciseLoader, ssr: false });
 const Vigilancia          = dynamic(() => import("@/components/exercises/attention/Vigilancia").then(m => ({ default: m.Vigilancia })), { loading: ExerciseLoader, ssr: false });
@@ -192,12 +189,6 @@ const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
     "Se acendeu posição A → B → C, clique C → B → A.",
     "Este exercício treina memória operacional visuoespacial.",
   ],
-  "nback": [
-    "Uma letra será exibida por vez na tela.",
-    "Você deve responder se a letra ATUAL é igual à de N posições atrás.",
-    "Exemplo (2-back): A B C A → a 4ª letra (A) é igual à 2ª (B)? NÃO.",
-    "Responda SIM ou NÃO antes que a próxima letra apareça.",
-  ],
   "ordem-historia": [
     "Você verá as cenas de uma história — mas fora de ordem!",
     "Arraste os cartões para a ordem em que a história acontece. O número no canto mostra a posição de cada cena.",
@@ -748,7 +739,6 @@ export default function ExercicioPage() {
       case "jogo-memoria": return <JogoMemoria {...props} />;
       case "span-numerico-inverso": return <SpanNumericoInverso {...props} settings={exerciseSettings} />;
       case "matriz-espacial-inversa": return <MatrizEspacialInversa {...props} />;
-      case "nback": return <NBack {...props} />;
       case "ordem-historia": return <OrdemHistoria {...props} settings={exerciseSettings as { unlockIntruso?: boolean; unlockFalta?: boolean } | undefined} />;
       case "certo-ou-errado": return <CertoOuErrado {...props} patientAge={patientAge} />;
       case "antes-depois": return <CaminhosMeta {...props} settings={exerciseSettings} />;
@@ -787,7 +777,7 @@ export default function ExercicioPage() {
   // Exercícios que gerenciam o próprio layout (sem barra de progresso no canto)
   // Exercícios com barra de progresso própria (por tempo) no layout
   const HIDE_PROGRESS_WIDGET = new Set([
-    "estacionamento-logico", "cubo-corsi", "matriz-espacial", "matriz-espacial-inversa", "nback", "jogo-memoria", "sequencia-itens", "lista-distracao", "letras-sequencia", "padroes-rotacao", "torre-hanoi", "tempo-reacao", "semaforo", "certo-ou-errado", "stroop-task", "identificacao-simbolos", "trilha-visual", "informacao-em-foco", "caca-item-barato", "corrida-tempo", "mudanca-regras", "labirinto", "vigilancia", "atencao-dividida", "focus-agents", "mot", "dual-task", "desafio-orcamento", "compra-multifuncional", "investigadores-sociais", "ordem-historia", "desafio-cidade", "antes-depois", "restaurante-ordem", "desafio-supermercado", "task-switching", "deductive-grid", "span-numerico", "span-numerico-inverso",
+    "estacionamento-logico", "cubo-corsi", "matriz-espacial", "matriz-espacial-inversa", "jogo-memoria", "sequencia-itens", "lista-distracao", "letras-sequencia", "padroes-rotacao", "torre-hanoi", "tempo-reacao", "semaforo", "certo-ou-errado", "stroop-task", "identificacao-simbolos", "trilha-visual", "informacao-em-foco", "caca-item-barato", "corrida-tempo", "mudanca-regras", "labirinto", "vigilancia", "atencao-dividida", "focus-agents", "mot", "dual-task", "desafio-orcamento", "compra-multifuncional", "investigadores-sociais", "ordem-historia", "desafio-cidade", "antes-depois", "restaurante-ordem", "desafio-supermercado", "task-switching", "deductive-grid", "span-numerico", "span-numerico-inverso",
   ]);
 
   return (
diff --git a/components/exercises/memory/NBack.tsx b/components/exercises/memory/NBack.tsx
deleted file mode 100644
index 56206dac..00000000
--- a/components/exercises/memory/NBack.tsx
+++ /dev/null
@@ -1,242 +0,0 @@
-"use client";
-
-import { useState, useRef, useEffect, useCallback } from "react";
-import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
-import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
-import type { ExerciseResult, Theme } from "@/types";
-
-interface NBackProps {
-  difficulty: number;
-  theme: Theme;
-  onComplete: (result: ExerciseResult) => void;
-}
-
-// ── Parâmetros ────────────────────────────────────────────────────────────────
-const LETTERS = ["A", "B", "C", "E", "F", "H", "K", "L", "M", "P", "R", "T"];
-const BLOCK_LEN = 14;        // estímulos que pedem resposta, por bloco
-const TARGET_RATIO = 0.42;   // ~42% são "iguais" (equilíbrio anti-chute)
-const MIN_N = 1;
-const MAX_N = 4;
-const GOOD_ACC = 0.8;        // bloco "bom" → ≥80% de acertos
-const STIM_MS = 2200;        // janela para ver a letra e responder
-const PRIME_MS = 1100;       // exibição de cada letra de "memorização" (priming)
-const FEEDBACK_MS = 520;
-const BLANK_MS = 320;
-
-function initialN(difficulty: number) {
-  return Math.min(Math.max(MIN_N, Math.floor(difficulty * 0.3) + 1), 3);
-}
-const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
-
-// Gera um bloco: n letras de "memorização" + BLOCK_LEN estímulos ativos.
-function genBlock(n: number) {
-  const seq: string[] = [];
-  for (let i = 0; i < n; i++) seq.push(rand(LETTERS));
-  const match: boolean[] = [];
-  for (let i = 0; i < BLOCK_LEN; i++) {
-    const nBack = seq[seq.length - n];
-    let letter: string;
-    if (Math.random() < TARGET_RATIO) {
-      letter = nBack;
-      match.push(true);
-    } else {
-      do { letter = rand(LETTERS); } while (letter === nBack);
-      match.push(false);
-    }
-    seq.push(letter);
-  }
-  return { seq, match };
-}
-
-// ── Componente principal ──────────────────────────────────────────────────────
-type Phase = "prime" | "stim" | "feedback" | "between";
-
-export function NBack({ difficulty, theme, onComplete }: NBackProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
-
-  const [phase, setPhase]   = useState<Phase>("between");
-  const [letter, setLetter] = useState("");
-  const [nLevel, setNLevel] = useState(initialN(difficulty));
-  const [fb, setFb]         = useState<null | "ok" | "no" | "slow">(null);
-
-  // refs de controle assíncrono
-  const cancelRef  = useRef(false);
-  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
-  const answerRef  = useRef<((a: "same" | "diff" | null) => void) | null>(null);
-  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
-  const statRef    = useRef({ hits: 0, misses: 0, fa: 0, cr: 0, omit: 0 });
-  const maxNRef     = useRef(initialN(difficulty));
-
-  const sleep = useCallback((ms: number) => new Promise<void>((res, rej) => {
-    if (cancelRef.current) { rej("c"); return; }
-    const t = setTimeout(() => cancelRef.current ? rej("c") : res(), ms);
-    timersRef.current.push(t);
-  }), []);
-
-  // espera a resposta do paciente (clique) ou estoura o tempo (omissão).
-  // IMPORTANTE: guardar o timer e cancelá-lo ao responder — senão o timeout deste
-  // estímulo dispara depois e resolve o PRÓXIMO com null (bug "só o primeiro").
-  const waitAnswer = useCallback((ms: number) => new Promise<"same" | "diff" | null>((resolve) => {
-    answerRef.current = resolve;
-    answerTimerRef.current = setTimeout(() => {
-      answerTimerRef.current = null;
-      if (answerRef.current) { answerRef.current = null; resolve(null); }
-    }, ms);
-  }), []);
-
-  const answer = useCallback((a: "same" | "diff") => {
-    if (answerRef.current) {
-      if (answerTimerRef.current) { clearTimeout(answerTimerRef.current); answerTimerRef.current = null; }
-      const r = answerRef.current; answerRef.current = null; r(a);
-    }
-  }, []);
-
-  const run = useCallback(async () => {
-    cancelRef.current = false;
-    begin();
-    let n = initialN(difficulty);
-    let goodStreak = 0;
-    const blocks: { acc: number; n: number }[] = [];
-
-    try {
-      while (!isTimeUp()) {
-        setNLevel(n);
-        maxNRef.current = Math.max(maxNRef.current, n);
-        const { seq, match } = genBlock(n);
-
-        // priming: mostra as n primeiras letras só para memorizar
-        setPhase("between");
-        await sleep(500);
-        for (let i = 0; i < n; i++) {
-          setLetter(seq[i]);
-          setFb(null);
-          setPhase("prime");
-          await sleep(PRIME_MS);
-          setPhase("between");
-          await sleep(BLANK_MS);
-        }
-
-        // estímulos ativos: pede resposta a cada um
-        let blockCorrect = 0;
-        for (let i = 0; i < BLOCK_LEN; i++) {
-          const isMatch = match[i];
-          setLetter(seq[n + i]);
-          setFb(null);
-          setPhase("stim");
-
-          const a = await waitAnswer(STIM_MS);
-          const correct = a !== null && (a === "same") === isMatch;
-          if (a === null)         { statRef.current.omit++; setFb("slow"); }
-          else if (correct)       { if (isMatch) statRef.current.hits++; else statRef.current.cr++; setFb("ok"); }
-          else                    { if (isMatch) statRef.current.misses++; else statRef.current.fa++; setFb("no"); }
-          if (correct) blockCorrect++;
-
-          setPhase("feedback");
-          await sleep(FEEDBACK_MS);
-          setPhase("between");
-          await sleep(BLANK_MS);
-        }
-
-        const acc = blockCorrect / BLOCK_LEN;
-        blocks.push({ acc, n });
-        if (acc >= GOOD_ACC) {
-          goodStreak++;
-          if (goodStreak >= 2) { n = Math.min(MAX_N, n + 1); goodStreak = 0; }  // 2 blocos bons → sobe
-        } else {
-          goodStreak = 0;
-          if (acc < 0.5) n = Math.max(MIN_N, n - 1);  // muito mal → alivia
-        }
-      }
-
-      // fim por tempo
-      finish();
-      const s = statRef.current;
-      const totalAnswered = s.hits + s.misses + s.fa + s.cr + s.omit;
-      const correctTotal = s.hits + s.cr;
-      const acc = correctTotal / Math.max(1, totalAnswered);
-      // sensibilidade (detecção de "iguais") — penaliza chute e omissão
-      const hitRate = s.hits / Math.max(1, s.hits + s.misses + s.omit);
-      const faRate  = s.fa / Math.max(1, s.fa + s.cr);
-      const sensitivity = Math.max(0, hitRate - faRate);
-      const score = calculateExerciseScore("nback", Math.max(acc, sensitivity), undefined, maxNRef.current);
-      onComplete({
-        exerciseId: "nback", domain: "memory",
-        score, accuracy: acc, difficulty: maxNRef.current, duration: elapsedSec(),
-        metadata: { blocks: blocks.length, maxN: maxNRef.current, hits: s.hits, misses: s.misses, falseAlarms: s.fa, omissions: s.omit, sensitivity: Math.round(sensitivity * 100) / 100 },
-      });
-    } catch { /* cancelado */ }
-  }, [begin, isTimeUp, finish, elapsedSec, difficulty, sleep, waitAnswer, onComplete]);
-
-  useEffect(() => {
-    // O lint alerta com razão: `timersRef.current` pode ter mudado quando a limpeza roda. Copiar a
-    // referência do array aqui garante que limpamos exatamente os timers que este efeito criou.
-    const timers = timersRef.current;
-    void run();
-    return () => {
-      cancelRef.current = true;
-      timers.forEach(clearTimeout);
-      if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
-    };
-    // O treino começa uma vez ao montar, como antes começava uma vez ao sair do tutorial legado.
-    // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, []);
-
-  // ── Estilos por tema ─────────────────────────────────────────────
-  const isG = theme === "GAMIFIED";
-  const bg   = isG ? "bg-gray-950" : theme === "COLORFUL" ? "bg-gradient-to-br from-violet-50 to-indigo-50" : "bg-[#F0F4F8]";
-  const card = isG ? "bg-gray-800 border border-cyan-500/30" : "bg-white shadow-lg";
-
-  const fbColor = fb === "ok" ? "#46C66A" : fb === "no" ? "#F2645A" : fb === "slow" ? "#E6A23C" : null;
-  const boxBorder = fbColor ?? (isG ? "#22D3EE" : "#60A5FA");
-  const boxBg = fb === "ok" ? "#EAF8EF" : fb === "no" ? "#FDECEA" : fb === "slow" ? "#FBF1E0" : (isG ? "#1F2937" : "#EFF6FF");
-  const priming = phase === "prime";
-
-  return (
-    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
-      <div className={`w-full max-w-md rounded-2xl p-6 ${card}`}>
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
-
-        {/* Letra */}
-        <div className="flex flex-col items-center">
-          <div
-            className="flex items-center justify-center font-bold rounded-3xl mb-2"
-            style={{
-              width: 150, height: 150, fontSize: 64,
-              background: boxBg, border: `5px solid ${boxBorder}`,
-              color: isG ? "#67E8F9" : "#1D4ED8",
-              transition: "background 0.2s, border-color 0.2s",
-            }}
-          >
-            {letter}
-          </div>
-          <p className="text-sm font-medium mb-4" style={{ minHeight: 22, color: priming ? "#6366F1" : fbColor ?? (isG ? "#94A3B8" : "#64748B") }}>
-            {priming ? "Memorize..." :
-              fb === "ok" ? "Certo!" : fb === "no" ? "Errou" : fb === "slow" ? "Responda mais rápido!" :
-              phase === "stim" ? `É igual à de ${nLevel} atrás?` : ""}
-          </p>
-        </div>
-
-        {/* Botões — só na fase de resposta */}
-        <div className="grid grid-cols-2 gap-3">
-          <button
-            onClick={() => answer("diff")}
-            disabled={phase !== "stim"}
-            className="py-4 rounded-2xl font-bold text-base text-white transition-opacity disabled:opacity-40"
-            style={{ background: "#F2645A" }}
-          >
-            DIFERENTE
-          </button>
-          <button
-            onClick={() => answer("same")}
-            disabled={phase !== "stim"}
-            className="py-4 rounded-2xl font-bold text-base text-white transition-opacity disabled:opacity-40"
-            style={{ background: "#46C66A" }}
-          >
-            IGUAL
-          </button>
-        </div>
-      </div>
-    </div>
-  );
-}
diff --git a/docs/architecture/CANONICAL_EXERCISES.md b/docs/architecture/CANONICAL_EXERCISES.md
index 662cef49..54c65005 100644
--- a/docs/architecture/CANONICAL_EXERCISES.md
+++ b/docs/architecture/CANONICAL_EXERCISES.md
@@ -42,12 +42,11 @@ registrado aqui.
 | 26 | `lista-distracao` | Lista com Distração | Memória | Memória Operacional | não | ACTIVE |
 | 27 | `restaurante-ordem` | Restaurante | Memória | Memória Operacional | **sim** | ACTIVE |
 | 28 | `desafio-supermercado` | Supermercado | Memória | Memória Operacional | **sim** | ACTIVE |
-| 29 | `nback` | N-Back | Memória | Memória Operacional | não | ACTIVE |
-| 30 | `cubo-corsi` | Cubos | Memória | Memória Visuoespacial | não | ACTIVE |
-| 31 | `vigilancia` | Vigilância | Atenção | Atenção Sustentada | não | ACTIVE |
-| 32 | `identificacao-simbolos` | Identificação de Símbolos | Velocidade de Processamento | Busca Visual Rápida | não | ACTIVE |
-| 33 | `estacionamento-logico` | Estacionamento Lógico | Funções Executivas | Planejamento | não | ACTIVE |
-| 34 | `investigadores-sociais` | Investigadores da Situação Social | Desenvolvimento Funcional | Cognição Social | não | ACTIVE |
+| 29 | `cubo-corsi` | Cubos | Memória | Memória Visuoespacial | não | ACTIVE |
+| 30 | `vigilancia` | Vigilância | Atenção | Atenção Sustentada | não | ACTIVE |
+| 31 | `identificacao-simbolos` | Identificação de Símbolos | Velocidade de Processamento | Busca Visual Rápida | não | ACTIVE |
+| 32 | `estacionamento-logico` | Estacionamento Lógico | Funções Executivas | Planejamento | não | ACTIVE |
+| 33 | `investigadores-sociais` | Investigadores da Situação Social | Desenvolvimento Funcional | Cognição Social | não | ACTIVE |
 
 ## Modalidades
 
diff --git a/docs/clinical-architecture/associated-profiles.json b/docs/clinical-architecture/associated-profiles.json
index 63e94acd..6139c415 100644
--- a/docs/clinical-architecture/associated-profiles.json
+++ b/docs/clinical-architecture/associated-profiles.json
@@ -505,24 +505,6 @@
     ],
     "profileStatus": "FINALIZED_PROFILE"
   },
-  {
-    "exerciseId": "nback",
-    "officialName": "N-Back",
-    "catalogDomain": "Memória",
-    "catalogSubdomain": "Memória Operacional",
-    "mechanicalPrimary": "Atualização e Manipulação Mental",
-    "associatedCognitiveProfiles": [
-      "Memória Operacional Verbal",
-      "Atenção Sustentada",
-      "Monitoramento Executivo e Manutenção de Meta",
-      "Tempo de Reação"
-    ],
-    "functionalClinicalTags": [],
-    "instrumentalDemands": [
-      "reconhecimento visual de letras e rótulos dos botões; leitura; uso de mouse ou toque; velocidade e coordenação motora suficientes para responder na janela. Ler letras é requisito, não treino de linguagem"
-    ],
-    "profileStatus": "FINALIZED_PROFILE"
-  },
   {
     "exerciseId": "cubo-corsi",
     "officialName": "Cubos",
@@ -614,4 +596,4 @@
     ],
     "profileStatus": "FINALIZED_PROFILE"
   }
-]
\ No newline at end of file
+]
diff --git a/docs/prescription-architecture/prescription-parameters.json b/docs/prescription-architecture/prescription-parameters.json
index f95f930b..2165cafb 100644
--- a/docs/prescription-architecture/prescription-parameters.json
+++ b/docs/prescription-architecture/prescription-parameters.json
@@ -359,10 +359,6 @@
         {
           "exercise": "Span Numérico Auditivo Direto",
           "reason": "Interferência de regra direta/inversa."
-        },
-        {
-          "exercise": "N-Back",
-          "reason": "Sobrecarga atualização e memória verbal."
         }
       ]
     },
@@ -1093,10 +1089,6 @@
       "canClose": false,
       "bestPosition": "início, após breve checagem motora",
       "badCombinations": [
-        {
-          "exercise": "N-Back",
-          "reason": "Atualização contínua e prazo acumulam fadiga intensa."
-        },
         {
           "exercise": "Rastreamento de Objetos",
           "reason": "Atenção dividida consecutiva compromete tolerância."
@@ -2366,10 +2358,6 @@
       "canClose": false,
       "bestPosition": "início ou meio",
       "badCombinations": [
-        {
-          "exercise": "N-Back",
-          "reason": "Manutenção e atualização acumulam fadiga."
-        },
         {
           "exercise": "Restaurante",
           "reason": "Listas sob distratores sofrem interferência proativa."
@@ -2608,96 +2596,6 @@
       }
     }
   },
-  {
-    "exerciseId": "nback",
-    "officialName": "N-Back",
-    "prescriptionParameterStatus": "FINAL_PARAMETERS",
-    "executionModel": {
-      "value": "FIXED_HIGH_FATIGUE",
-      "justification": "Cada bloco tem preparação e 14 estímulos contínuos; progressão exige blocos completos e longa exposição fatiga atualização."
-    },
-    "minimumValidUnit": {
-      "value": "bloco",
-      "justification": "A sequência completa sob o mesmo N é necessária para decidir progressão."
-    },
-    "terminationPolicy": {
-      "atLimit": "termina o bloco",
-      "midUnit": "Se o limite chegar durante os 14 estímulos, conclui o bloco; interrupção real invalida o parcial."
-    },
-    "protocols": {
-      "BRIEF": {
-        "unitCount": 1,
-        "estimatedDuration": "~2,5 min",
-        "clinicalValidity": "Manutenção/aquecimento; insuficiente para progressão. Confirma regra e tolerância; progressão exige mais de um bloco."
-      },
-      "STANDARD": {
-        "unitCount": 3,
-        "estimatedDuration": "~7,5 min",
-        "clinicalValidity": "Três blocos permitem consistência e regra de progressão. Sustenta progressão somente com unidades completas; não permite concluir transferência além da mecânica."
-      },
-      "EXTENDED": {
-        "unitCount": 4,
-        "estimatedDuration": "~10 min",
-        "clinicalValidity": "Aumenta estabilidade ou variedade da observação. Teto curto limita fadiga de atualização e omissões tardias."
-      }
-    },
-    "baselineCognitiveLoad": {
-      "value": 3,
-      "justification": "Cada estímulo exige atualizar a janela, comparar e responder sob prazo, sem pausa durante o bloco."
-    },
-    "loadModifiers": [
-      {
-        "dimension": "quantidade de estímulos",
-        "effect": "Cada bloco mantém 14 itens ativos."
-      },
-      {
-        "dimension": "memória exigida",
-        "effect": "1-back a 4-back amplia distância e itens intervenientes."
-      },
-      {
-        "dimension": "interferência",
-        "effect": "Letras intervenientes competem com a referência."
-      },
-      {
-        "dimension": "semelhança dos distratores",
-        "effect": "Repetições próximas aumentam competição serial, com coincidências acidentais controladas."
-      }
-    ],
-    "clinicalDuration": {
-      "minimumUseful": "2,5 min",
-      "standard": "7,5 min",
-      "maximumRecommended": "10 min",
-      "justification": "Um bloco confirma regra, três permitem progressão e quatro limitam queda por fadiga."
-    },
-    "fatigue": {
-      "level": "ALTA",
-      "explanation": "Atualização, comparação e resposta temporizada em cada estímulo, sem pausa no bloco, favorecem omissões e queda rápida de qualidade."
-    },
-    "interference": {
-      "level": "ALTA",
-      "explanation": "Itens intervenientes precisam ser mantidos e descartados sem perder a referência."
-    },
-    "resumptionAfterInterruption": {
-      "strategy": "um nível abaixo",
-      "rationale": "Sobrecarga pede novo bloco um N abaixo; interrupção externa repete bloco integral no mesmo N."
-    },
-    "sessionEligibility": {
-      "canOpen": true,
-      "canClose": false,
-      "bestPosition": "início",
-      "badCombinations": [
-        {
-          "exercise": "Dupla Tarefa",
-          "reason": "Atualização contínua e prazo acumulam fadiga intensa."
-        },
-        {
-          "exercise": "Lista com Distração",
-          "reason": "Interferência verbal altera manutenção e descarte."
-        }
-      ]
-    },
-    "modality": "não se aplica"
-  },
   {
     "exerciseId": "cubo-corsi",
     "officialName": "Cubos",
diff --git a/lib/domain-taxonomy.ts b/lib/domain-taxonomy.ts
index f2bf00a0..afa8c658 100644
--- a/lib/domain-taxonomy.ts
+++ b/lib/domain-taxonomy.ts
@@ -14,7 +14,7 @@ export const ALL_DOMAINS: Domain[] = ["memory", "attention", "executive", "proce
 
 export const DOMAIN_SUBDOMAINS: Record<Domain, Subdomain[]> = {
   memory: [
-    { id: "operacional", label: "Memória Operacional", exercises: ["span-numerico", "span-numerico-inverso", "letras-sequencia", "sequencia-itens", "lista-distracao", "restaurante-ordem", "desafio-supermercado", "nback"] },
+    { id: "operacional", label: "Memória Operacional", exercises: ["span-numerico", "span-numerico-inverso", "letras-sequencia", "sequencia-itens", "lista-distracao", "restaurante-ordem", "desafio-supermercado"] },
     { id: "visuoespacial", label: "Memória Visuoespacial", exercises: ["jogo-memoria", "matriz-espacial", "matriz-espacial-inversa", "padroes-rotacao", "cubo-corsi"] },
     { id: "episodica", label: "Memória Episódica", exercises: [] },
     { id: "semantica", label: "Memória Semântica", exercises: [] },
diff --git a/lib/exercise-functional.ts b/lib/exercise-functional.ts
index 3ba4122a..151fba39 100644
--- a/lib/exercise-functional.ts
+++ b/lib/exercise-functional.ts
@@ -32,15 +32,6 @@ export const EXERCISE_FUNCTIONAL: Record<string, ExerciseFunctional> = {
     ],
     dailyTip: "Ao guardar objetos, olhe para eles e diga o nome em voz alta. Isso ativa memória visual e verbal ao mesmo tempo.",
   },
-  "nback": {
-    scenario: "Acompanhar uma conversa longa e perceber quando o mesmo assunto já foi mencionado antes, sem perder o fio.",
-    strategies: [
-      "Repita mentalmente o estímulo atual enquanto aguarda o próximo.",
-      "Use um 'ancorinha' — uma imagem ou palavra associada ao estímulo atual.",
-      "Não tente antecipar; foque em comparar o atual com o que veio antes.",
-    ],
-    dailyTip: "Em conversas ou consultas, não hesite em perguntar: 'Você pode repetir?' ou 'Isso foi dito antes?' — manter o contexto é uma habilidade treinável.",
-  },
   "trilha-visual": {
     scenario: "Seguir a sequência numerada de uma receita, de um manual de montagem ou das etapas de um procedimento médico.",
     strategies: [
diff --git a/lib/exercise-icons.ts b/lib/exercise-icons.ts
index e6b46eab..f1db0060 100644
--- a/lib/exercise-icons.ts
+++ b/lib/exercise-icons.ts
@@ -40,7 +40,6 @@ export const EXERCISE_ICON_IDS = new Set<string>([
   "deductive-grid",
   "estacionamento-logico",
   // memória — novos
-  "nback",
   "cubo-corsi",
   // funcional / supermercado
   "desafio-supermercado",
diff --git a/lib/exercise-meta.ts b/lib/exercise-meta.ts
index 19054f37..5531c394 100644
--- a/lib/exercise-meta.ts
+++ b/lib/exercise-meta.ts
@@ -26,7 +26,6 @@ export const EXERCISE_META: Record<string, ExerciseMeta> = {
   "lista-distracao": { type: "verbal", difficulty: "dificil", secondary: ["Memória Operacional", "Controle Inibitório"] },
   "restaurante-ordem": { type: "visual", difficulty: "medio", secondary: ["Memória Operacional", "Atenção Seletiva"] },
   "restaurante-ordem-auditivo": { type: "auditiva", difficulty: "medio", secondary: ["Memória Operacional", "Atenção Seletiva"] },
-  "nback": { type: "visual", difficulty: "dificil", secondary: ["Memória Operacional", "Atenção Sustentada"] },
   "padroes-rotacao": { type: "espacial", difficulty: "dificil", secondary: ["Memória Visuoespacial", "Rotação Mental"] },
   "cubo-corsi": { type: "espacial", difficulty: "medio", secondary: ["Memória Visuoespacial", "Atenção Visual"] },
   // Atenção
diff --git a/lib/exercise-science.ts b/lib/exercise-science.ts
index 448562d9..5c40527b 100644
--- a/lib/exercise-science.ts
+++ b/lib/exercise-science.ts
@@ -204,21 +204,6 @@ export const EXERCISE_SCIENCE: Record<string, ExerciseScience> = {
     ],
   },
 
-  "nback": {
-    exerciseId: "nback",
-    neuroanatomy:
-      "Rede de memória operacional fronto-parietal: CPFDL bilateral (BA 9/46), córtex parietal posterior (BA 7/40) e gânglios da base. Meta-análise de neuroimagem de Rottschy et al. (2012) com 189 estudos confirmou rede robusta ativada pelo N-Back, com escalada de ativação proporcional ao nível N.",
-    trainingEffects:
-      "N-Back é o paradigma de treino de memória operacional mais estudado: meta-análise de Soveri et al. (2017) com 66 estudos mostra melhora de 0,3–0,5 DP em memória operacional e atenção. Efeitos de transferência far-transfer controversos (Melby-Lervåg et al., 2016) mas near-transfer consistentes. Ganhos maiores com protocolos adaptativos ≥ 4 semanas.",
-    clinicalRelevance:
-      "N-Back adaptativo é componente de intervenções cognitivas em TDA/H, esquizofrenia, CCL e pós-TCE. Protocolo dual N-Back (auditivo + visual simultâneo) mostra resultados superiores em tarefas de raciocínio fluido. Normas de desempenho por nível N disponíveis para comparação clínica (Jaeggi et al., 2010; revisado 2022).",
-    references: [
-      "Soveri, A., et al. (2017). Working memory training revisited: A multi-level meta-analysis of n-back training studies. Psychonomic Bulletin & Review, 24(4), 1077–1096.",
-      "Rottschy, C., et al. (2012). Modelling neural correlates of working memory: A coordinate-based meta-analysis. NeuroImage, 60(1), 830–846.",
-      "Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of 'far transfer'. Perspectives on Psychological Science, 11(4), 512–534.",
-    ],
-  },
-
   "labirinto": {
     exerciseId: "labirinto",
     neuroanatomy:
diff --git a/lib/prescription/__tests__/library-coverage.test.ts b/lib/prescription/__tests__/library-coverage.test.ts
index 824cc4fc..19103c16 100644
--- a/lib/prescription/__tests__/library-coverage.test.ts
+++ b/lib/prescription/__tests__/library-coverage.test.ts
@@ -15,8 +15,9 @@ describe("cobertura de prescrição da biblioteca de exercícios", () => {
     .flatMap((domain) => DOMAIN_EXERCISES[domain])
     .filter((id) => Boolean(EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS]));
 
-  it("mostra os 34 exercícios canônicos", () => {
-    expect(new Set(visibleIds).size).toBe(34);
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("mostra os 33 exercícios canônicos", () => {
+    expect(new Set(visibleIds).size).toBe(33);
   });
 
   it("todo exercício visível tem parâmetros de prescrição", () => {
diff --git a/lib/prescription/alert-taxonomy.test.ts b/lib/prescription/alert-taxonomy.test.ts
index 58d36636..ea955356 100644
--- a/lib/prescription/alert-taxonomy.test.ts
+++ b/lib/prescription/alert-taxonomy.test.ts
@@ -46,14 +46,15 @@ describe("assistente clínico da revisão do plano", () => {
     expect(Object.values(presentation.alertGroups).flat()).toEqual([]);
   });
 
-  it("reduz o plano de 34 exercícios a no máximo cinco insights e mantém 66 ocorrências no núcleo", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("reduz o plano de 33 exercícios a no máximo cinco insights e mantém 60 ocorrências no núcleo", () => {
     const completePlan = plan(allIds);
     const core = interpretPlan(completePlan);
     const presentation = presentPlan(completePlan);
     const insights = Object.values(presentation.alertGroups).flat();
 
-    expect(core.alerts).toHaveLength(66);
-    expect(presentation.exercises).toHaveLength(34);
+    expect(core.alerts).toHaveLength(60);
+    expect(presentation.exercises).toHaveLength(33);
     expect(insights).toHaveLength(3);
     expect(insights.length).toBeLessThanOrEqual(5);
     expect(firstLevelAlertCardCounts(presentation.alertGroups)).toEqual({
@@ -97,7 +98,8 @@ describe("assistente clínico da revisão do plano", () => {
     const intensity = presentation.alertGroups.revisao_plano[0];
     expect(intensity).toMatchObject({
       titulo: "Plano de demanda elevada",
-      mensagem: "12 dos 34 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 40 minutos.",
+      // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+      mensagem: "11 dos 33 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 40 minutos.",
       blocksSave: false,
     });
     expect(intensity.mensagem).not.toMatch(/69|13|carga basal/i);
@@ -105,7 +107,8 @@ describe("assistente clínico da revisão do plano", () => {
 
   it("não menciona demanda total quando a duração não tem referência", () => {
     const presentation = presentPlan(plan(allIds, 35));
-    expect(presentation.alertGroups.revisao_plano[0].mensagem).toMatch(/12 dos 34 exercícios.*fatigantes/);
+    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+    expect(presentation.alertGroups.revisao_plano[0].mensagem).toMatch(/11 dos 33 exercícios.*fatigantes/);
     expect(allVisibleText(presentation)).not.toMatch(/demanda total/i);
   });
 
diff --git a/lib/prescription/assistant-clinical.test.ts b/lib/prescription/assistant-clinical.test.ts
index f80c1bc5..0ef0ceac 100644
--- a/lib/prescription/assistant-clinical.test.ts
+++ b/lib/prescription/assistant-clinical.test.ts
@@ -39,11 +39,13 @@ describe("aceite da Fase 1 — assistente clínico", () => {
     expect(cards(presentPlan(plan(["deductive-grid", "matriz-espacial", "certo-ou-errado"], 30)))).toHaveLength(0);
   });
 
-  it("2. plano com 34 exercícios tem no máximo cinco insights", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("2. plano com 33 exercícios tem no máximo cinco insights", () => {
     expect(cards(presentPlan(plan(allIds))).length).toBeLessThanOrEqual(5);
   });
 
-  it("3. plano com 34 exercícios não contém linguagem dependente da ordem", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("3. plano com 33 exercícios não contém linguagem dependente da ordem", () => {
     expect(visible(presentPlan(plan(allIds))))
       .not.toMatch(/consecutiv|adjacen|encerramento|posição preferencial|carga basal/i);
   });
@@ -52,8 +54,8 @@ describe("aceite da Fase 1 — assistente clínico", () => {
     expect(visible(presentPlan(plan(allIds)))).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
   });
 
-  it("5. o núcleo continua devolvendo 66 ocorrências", () => {
-    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(66);
+  it("5. o núcleo continua devolvendo 60 ocorrências", () => {
+    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(60);
   });
 
   it("6. a duração da sessão aparece uma vez, no cabeçalho", () => {
diff --git a/lib/prescription/catalog.test.ts b/lib/prescription/catalog.test.ts
index 0a873922..96f2f00c 100644
--- a/lib/prescription/catalog.test.ts
+++ b/lib/prescription/catalog.test.ts
@@ -3,15 +3,16 @@ import { describe, expect, it } from "vitest";
 import { EXERCISE_CATALOG } from "./catalog";
 
 describe("catálogo de prescrição", () => {
-  it("porta os 34 IDs canônicos", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("porta os 33 IDs canônicos", () => {
     const canonical = readFileSync("docs/architecture/CANONICAL_EXERCISES.md", "utf8");
     const ids = [...canonical.matchAll(/\| \d+ \| `([^`]+)`/g)].map((match) => match[1]);
-    expect(EXERCISE_CATALOG).toHaveLength(34);
+    expect(EXERCISE_CATALOG).toHaveLength(33);
     expect(EXERCISE_CATALOG.map((exercise) => exercise.exerciseId)).toEqual(ids);
   });
 
   it("preserva texto e converte duração decimal para minutos", () => {
-    const nback = EXERCISE_CATALOG.find((exercise) => exercise.exerciseId === "nback")!;
-    expect(nback.protocols.PADRAO).toMatchObject({ durationText: "~7,5 min", durationMinutes: 7.5 });
+    const cuboCorsi = EXERCISE_CATALOG.find((exercise) => exercise.exerciseId === "cubo-corsi")!;
+    expect(cuboCorsi.protocols.PADRAO).toMatchObject({ durationText: "~8 min", durationMinutes: 8 });
   });
 });
diff --git a/lib/prescription/duration.test.ts b/lib/prescription/duration.test.ts
index 865a30c9..8d57efd7 100644
--- a/lib/prescription/duration.test.ts
+++ b/lib/prescription/duration.test.ts
@@ -14,10 +14,10 @@ describe("duração da composição", () => {
     const continuous = exercise("tempo-reacao"); // 5 + 0,5
     const closed = exercise("letras-sequencia"); // 6 + 1
     const planning = exercise("ordem-historia"); // 9 + 3
-    const fixed = exercise("nback"); // 7,5 + 0
+    const fixed = exercise("dual-task"); // 6 + 0
     expect(calculateDuration([continuous])).toEqual([5, 5.5]);
     expect(calculateDuration([continuous, closed])).toEqual([11.5, 13.5]);
-    expect(calculateDuration([continuous, closed, planning, fixed, continuous])).toEqual([34.5, 41.5]);
+    expect(calculateDuration([continuous, closed, planning, fixed, continuous])).toEqual([33, 40]);
   });
 
   it("aplica modalidade antes das margens", () => {
@@ -59,9 +59,9 @@ describe("duração da composição", () => {
     expect(duration.every(Number.isFinite)).toBe(true);
   });
 
-  it("identifica taxa constante exatamente nos 19 exercícios catalogados", () => {
+  it("identifica taxa constante exatamente nos 18 exercícios catalogados", () => {
     const dose = { kind: "legacyCustom", unitCount: 1, sourceKey: "trials" } as const;
-    expect(EXERCISE_CATALOG.filter((definition) => legacyDoseMinutes(definition, dose).minutes).length).toBe(19);
+    expect(EXERCISE_CATALOG.filter((definition) => legacyDoseMinutes(definition, dose).minutes).length).toBe(18);
   });
 
   it("modalidade recalcula duração sem alterar carga basal", () => {
diff --git a/lib/prescription/interpreter.test.ts b/lib/prescription/interpreter.test.ts
index 9b5ff42e..0d27e9d4 100644
--- a/lib/prescription/interpreter.test.ts
+++ b/lib/prescription/interpreter.test.ts
@@ -19,7 +19,7 @@ describe("interpretador", () => {
     const examples = [
       { targetMinutes: 20 as const, ids: ["tempo-reacao", "letras-sequencia", "certo-ou-errado"], duration: [19, 22], load: 4, fatigue: { BAIXA: 1, MODERADA: 2, ALTA: 0 } },
       { targetMinutes: 30 as const, ids: ["deductive-grid", "matriz-espacial", "certo-ou-errado"], duration: [27, 32.5], load: 4, fatigue: { BAIXA: 2, MODERADA: 0, ALTA: 1 } },
-      { targetMinutes: 40 as const, ids: ["nback", "semaforo", "ordem-historia", "identificacao-simbolos", "certo-ou-errado"], duration: [36.5, 43], load: 9, fatigue: { BAIXA: 1, MODERADA: 3, ALTA: 1 } },
+      { targetMinutes: 40 as const, ids: ["task-switching", "semaforo", "ordem-historia", "identificacao-simbolos", "certo-ou-errado"], duration: [36, 43.5], load: 9, fatigue: { BAIXA: 1, MODERADA: 3, ALTA: 1 } },
     ];
     for (const example of examples) {
       const result = interpretPlan({ targetMinutes: example.targetMinutes, exercises: example.ids.map((exerciseId, index) => ({ exerciseId, order: index + 1 })) });
diff --git a/lib/prescription/presentation-finalization.test.ts b/lib/prescription/presentation-finalization.test.ts
index d19afd20..5af7058b 100644
--- a/lib/prescription/presentation-finalization.test.ts
+++ b/lib/prescription/presentation-finalization.test.ts
@@ -94,7 +94,8 @@ describe("aceite da Fase 1 — ajustes finais", () => {
   it("3. apresenta demanda elevada em uma frase, com a meta real uma única vez", () => {
     const message = presentPlan(plan(allIds, 30)).alertGroups.revisao_plano[0].mensagem;
     expect(message).toBe(
-      "12 dos 34 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 30 minutos.",
+      // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+      "11 dos 33 exercícios são potencialmente fatigantes, e a demanda total está acima do previsto para uma sessão de 30 minutos.",
     );
     expect(message.match(/30 minutos/g)).toHaveLength(1);
     expect(message.match(/\./g)).toHaveLength(1);
@@ -102,7 +103,8 @@ describe("aceite da Fase 1 — ajustes finais", () => {
 
   it("4. omite demanda total sem referência válida", () => {
     const message = presentPlan(plan(allIds, 35)).alertGroups.revisao_plano[0].mensagem;
-    expect(message).toBe("12 dos 34 exercícios são potencialmente fatigantes.");
+    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+    expect(message).toBe("11 dos 33 exercícios são potencialmente fatigantes.");
     expect(message).not.toMatch(/demanda total/i);
   });
 
@@ -148,9 +150,10 @@ describe("aceite da Fase 1 — ajustes finais", () => {
     expect(titles).not.toMatch(/Mapeamento cor–resposta|Concentração de treino verbal|Concentração de busca visual|Sobreposição executiva|Concentração cognitiva|Processos cognitivos semelhantes/i);
   });
 
-  it("8. faz todo título da varredura dos 34 combinados dois a dois começar com Sobreposição", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("8. faz todo título da varredura dos 33 combinados dois a dois começar com Sobreposição", () => {
     const titles = pairPresentations().flatMap(overlapAlerts).map(({ titulo }) => titulo);
-    expect(allIds).toHaveLength(34);
+    expect(allIds).toHaveLength(33);
     expect(titles.length).toBeGreaterThan(0);
     expect(titles.every((title) => title.startsWith("Sobreposição"))).toBe(true);
   });
@@ -181,8 +184,8 @@ describe("aceite da Fase 1 — ajustes finais", () => {
     expect(visible).not.toMatch(/carga basal|referência interna|janela de planejamento|parâmetros|heurística|regra interna|indicador interno/i);
   });
 
-  it("12. preserva as 66 ocorrências produzidas pelo núcleo", () => {
-    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(66);
+  it("12. preserva as 60 ocorrências produzidas pelo núcleo", () => {
+    expect(interpretPlan(plan(allIds)).alerts).toHaveLength(60);
   });
 
   it("13. mantém canSave verdadeiro", () => {
diff --git a/lib/prescription/presentation.test.ts b/lib/prescription/presentation.test.ts
index 7d6cc1d4..65e69a7c 100644
--- a/lib/prescription/presentation.test.ts
+++ b/lib/prescription/presentation.test.ts
@@ -250,9 +250,10 @@ describe("apresentação consultiva da prescrição", () => {
     expect(presentLegacyPlan([{ id: "tempo-reacao", settings: { protocol: "desconhecido" } }], 30).legacyMarker).toBeDefined();
   });
 
-  it("apresenta o protocolo padrão de todos os 34 exercícios em texto legível", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("apresenta o protocolo padrão de todos os 33 exercícios em texto legível", () => {
     const labels = EXERCISE_CATALOG.map((definition) => presentCatalogExercise(definition.exerciseId)?.protocolLabel);
-    expect(labels).toHaveLength(34);
+    expect(labels).toHaveLength(33);
     expect(labels.filter((label) => label?.startsWith("Protocolo padrão: "))).toHaveLength(33);
     expect(presentCatalogExercise("antes-depois")?.protocolLabel).toBe("Configuração provisória");
     expect(presentCatalogExercise("span-numerico")?.protocolLabel).toBe("Protocolo padrão: 8 séries · ~6 min");
@@ -297,9 +298,10 @@ describe("apresentação consultiva da prescrição", () => {
     expect(ADAPTIVE_VALIDITY_NOTE).not.toContain("insuficiente para progressão");
   });
 
-  it("apresenta o perfil cognitivo de todos os 34 exercícios em texto legível", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("apresenta o perfil cognitivo de todos os 33 exercícios em texto legível", () => {
     const labels = EXERCISE_CATALOG.map((definition) => presentCatalogExercise(definition.exerciseId)?.cognitiveProfileLabel);
-    expect(labels).toHaveLength(34);
+    expect(labels).toHaveLength(33);
     expect(labels.every((label) => Boolean(label?.trim()))).toBe(true);
     expect(labels.join(" ")).not.toMatch(/[A-Z]{3,}_[A-Z_]+/);
   });
diff --git a/lib/prescription/progressive-disclosure.test.ts b/lib/prescription/progressive-disclosure.test.ts
index 0b28a2cf..fbed92a4 100644
--- a/lib/prescription/progressive-disclosure.test.ts
+++ b/lib/prescription/progressive-disclosure.test.ts
@@ -26,8 +26,8 @@ describe("divulgação progressiva dos insights", () => {
 
     expect(concentration?.dadoPrincipal).toBeUndefined();
     expect(concentration?.mensagem).not.toMatch(/\d/);
-    expect(concentration?.ocorrencias).toHaveLength(41);
-    expect(concentration?.occurrenceCount).toBe(41);
+    expect(concentration?.ocorrencias).toHaveLength(38);
+    expect(concentration?.occurrenceCount).toBe(38);
     expect(concentration?.expansionLabel).toBe("Ver detalhes");
   });
 
@@ -42,12 +42,12 @@ describe("divulgação progressiva dos insights", () => {
     expect(observations.initial).toHaveLength(2);
   });
 
-  it("mantém três cartões de primeiro nível e 66 ocorrências no núcleo", () => {
+  it("mantém três cartões de primeiro nível e 60 ocorrências no núcleo", () => {
     const plan = completePlan();
     const core = interpretPlan(plan);
     const presentation = presentPlan(plan);
 
-    expect(core.alerts).toHaveLength(66);
+    expect(core.alerts).toHaveLength(60);
     expect(firstLevelAlertCardCounts(presentation.alertGroups)).toEqual({
       revisao_plano: 1,
       observacao_clinica: 2,
@@ -58,7 +58,7 @@ describe("divulgação progressiva dos insights", () => {
   it("expande a intensidade pelos exercícios de fadiga alta, sem expor a escala", () => {
     const intensity = presentPlan(completePlan()).alertGroups.revisao_plano[0];
     expect(intensity.expansionLabel).toBe("Ver exercícios");
-    expect(intensity.exercicios).toHaveLength(12);
+    expect(intensity.exercicios).toHaveLength(11);
     expect(intensity).not.toHaveProperty("dadoPrincipal");
   });
 
diff --git a/lib/tutorial/definitions/estimulo-continuo.tsx b/lib/tutorial/definitions/estimulo-continuo.tsx
index e600d344..83c59e0d 100644
--- a/lib/tutorial/definitions/estimulo-continuo.tsx
+++ b/lib/tutorial/definitions/estimulo-continuo.tsx
@@ -303,39 +303,6 @@ function TempoReacaoBoard({ stimulus, interactive, pressed, hitIds, onAction }:
   );
 }
 
-interface NBackStimulus extends EstimuloBase {
-  history: readonly string[];
-  letter: string;
-  priming?: boolean;
-}
-
-function NBackBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<NBackStimulus>) {
-  return (
-    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center">
-      <div className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-500">
-        {stimulus.history.map((letter, index) => (
-          <span key={`${letter}-${index}`} className="rounded-lg border bg-white px-3 py-2">{letter}</span>
-        ))}
-      </div>
-      <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-indigo-400 bg-white text-5xl font-bold text-indigo-800">
-        {stimulus.letter}
-      </div>
-      <p className="mb-3 min-h-5 text-xs text-slate-600">
-        {stimulus.priming ? "Observe a letra." : "É igual à de duas posições atrás?"}
-      </p>
-      <button
-        data-action="same"
-        type="button"
-        onClick={() => interactive && onAction("same")}
-        className={`w-full rounded-xl bg-emerald-600 py-3 font-bold text-white ${pressed ? "scale-95" : ""}`}
-      >
-        IGUAL
-        <HitMark visible={hitIds.has(stimulus.id)} />
-      </button>
-    </div>
-  );
-}
-
 type ShapeKind = "circle" | "triangle";
 interface DualStimulus extends EstimuloBase {
   shape: ShapeKind;
@@ -469,27 +436,6 @@ export const tempoReacaoTutorial = criarTutorialEstimuloContinuo<BalloonStimulus
   targetSelectorFor: () => '[data-action="balloon"]',
 });
 
-const nbackDemo: readonly NBackStimulus[] = [
-  { id: "nback-prime-a", history: [], letter: "A", priming: true, isTarget: false },
-  { id: "nback-prime-b", history: ["A"], letter: "B", priming: true, isTarget: false },
-  { id: "nback-different", history: ["A", "B"], letter: "C", isTarget: false },
-  { id: "nback-same", history: ["B", "C"], letter: "B", isTarget: true },
-];
-
-export const nbackTutorial = criarTutorialEstimuloContinuo<NBackStimulus>({
-  exerciseId: "nback",
-  version: 1,
-  modo: "continua",
-  guidedInstruction: "Clique quando a letra for igual à de duas posições atrás.",
-  retryHint: "Compare a letra atual com a de duas posições atrás e clique quando forem iguais.",
-  smallestValidUnit: ONE_RESPONSE,
-  demonstrationStimuli: nbackDemo,
-  guidedStimuli: nbackDemo,
-  Board: NBackBoard,
-  expectedActionFor: () => "same",
-  targetSelectorFor: () => '[data-action="same"]',
-});
-
 const dualTaskDemo: readonly DualStimulus[] = [
   { id: "dual-wait", shape: "circle", shapeColor: "red", digit: 4, previousDigit: 2, action: "none", isTarget: false },
   { id: "dual-shape", shape: "triangle", shapeColor: "green", digit: 3, previousDigit: 4, action: "shape", isTarget: true },
diff --git a/lib/tutorial/estimulo-continuo.test.ts b/lib/tutorial/estimulo-continuo.test.ts
index 636e5f6f..65e5ad02 100644
--- a/lib/tutorial/estimulo-continuo.test.ts
+++ b/lib/tutorial/estimulo-continuo.test.ts
@@ -79,7 +79,6 @@ describe("Família 4 — estímulo contínuo", () => {
   const continuousDemos = [
     "semaforoDemo",
     "tempoReacaoDemo",
-    "nbackDemo",
     "dualTaskDemo",
   ];
 
@@ -123,11 +122,10 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(guided).toMatch(/Um alvo não possui timeout/);
   });
 
-  it("usa os cinco textos que continuam nesta família e não menciona teclado nem toque", () => {
+  it("usa os quatro textos que continuam nesta família e não menciona teclado nem toque", () => {
     const instructions = [
       "Clique em avançar somente quando o sinal abrir.",
       "Clique assim que o sinal aparecer.",
-      "Clique quando a letra for igual à de duas posições atrás.",
       "Responda às duas tarefas conforme elas aparecerem.",
       "Clique em certo ou errado conforme a operação.",
     ];
@@ -164,23 +162,21 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(modoDe("tempo-reacao")).toBe("explicativo");
     expect(modoDe("certo-ou-errado")).toBe("explicativo");
 
-    expect(modoDe("nback")).toBe("continua");
     expect(modoDe("dual-task")).toBe("continua");
   });
 
-  it("registra os sete e preserva os 20 convertidos", () => {
+  it("registra os seis e preserva os 19 convertidos", () => {
     const page = source("app/(patient)/treino/[exercicio]/page.tsx");
     const register = page.slice(
       page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
       page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
     );
     const converted = register.match(/(?:"[a-z-]+"|[a-z]+):\s*[a-zA-Z]+Tutorial/g) ?? [];
-    expect(converted).toHaveLength(20);
+    expect(converted).toHaveLength(19);
     for (const exerciseId of [
       "semaforo",
       "vigilancia",
       "tempo-reacao",
-      "nback",
       "dual-task",
       "mot",
       "certo-ou-errado",
@@ -189,12 +185,11 @@ describe("Família 4 — estímulo contínuo", () => {
     }
   });
 
-  it("remove os tutoriais legados dos sete exercícios convertidos", () => {
+  it("remove os tutoriais legados dos seis exercícios convertidos", () => {
     const exercises = [
       "components/exercises/processing/Semaforo.tsx",
       "components/exercises/attention/Vigilancia.tsx",
       "components/exercises/processing/TempoReacao.tsx",
-      "components/exercises/memory/NBack.tsx",
       "components/exercises/attention/DualTask.tsx",
       "components/exercises/attention/MOT.tsx",
       "components/exercises/processing/CertoOuErrado.tsx",
diff --git a/lib/tutorial/gravacao-unica.test.ts b/lib/tutorial/gravacao-unica.test.ts
index 43abe47f..b1f1a81c 100644
--- a/lib/tutorial/gravacao-unica.test.ts
+++ b/lib/tutorial/gravacao-unica.test.ts
@@ -6,9 +6,10 @@ import { describe, expect, it } from "vitest";
  * REGRA GLOBAL 10 DA T1 — a gravação do tutorial tem UM caminho só.
  *
  * Congelada por ela em 07/ago/2026, ao elevar a garantia da regra 8 de "vale para o Span" para
- * "vale para os 34". A motivação é direta: se cada exercício puder gravar do seu jeito, a promessa
+ * "vale para os 33". O N‑Back foi aposentado em 12/ago/2026 por decisão dela. A motivação é direta:
+ * se cada exercício puder gravar do seu jeito, a promessa
  * de que rever o tutorial não altera dado clínico deixa de ser verificável — passaria a depender de
- * 34 implementações estarem todas corretas, para sempre.
+ * 33 implementações estarem todas corretas, para sempre.
  *
  * Estes testes valem para TODOS os exercícios, inclusive os que ainda serão convertidos. Um
  * exercício novo que tente gravar por conta própria falha aqui, no lote em que for criado.
@@ -50,7 +51,8 @@ describe("T1 global — 10: a gravação do tutorial tem um caminho único", ()
       .filter((f) => MARCAS_DE_GRAVACAO.test(fonte(f)));
 
     // Se este teste falhar, um exercício está tentando gravar por conta própria. A correção nunca
-    // é relaxar o teste: é usar o caminho do ExerciseWrapper, como os outros 33.
+    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+    // Isto não é relaxar o teste: é usar o caminho do ExerciseWrapper, como os outros 33.
     expect(infratores).toEqual([]);
   });
 
diff --git a/lib/tutorial/span-reference.test.ts b/lib/tutorial/span-reference.test.ts
index 892b3a44..a0c17eef 100644
--- a/lib/tutorial/span-reference.test.ts
+++ b/lib/tutorial/span-reference.test.ts
@@ -201,7 +201,7 @@ describe("integração do tutorial de referência", () => {
     const page = source("app/(patient)/treino/[exercicio]/page.tsx");
 
     // Um só ponto de ligação: a cada lote, uma linha no registro. Condicional por exerciseId
-    // espalhada pelo arquivo seria insustentável em 34 conversões.
+    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela; a cobertura agora tem 33 conversões.
     expect(page).toMatch(/const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>>/);
     expect(page.match(/tutorial:\s*tutorialAtual/g) ?? []).toHaveLength(1);
     expect(page).not.toMatch(/exerciseId\s*===\s*["']span-numerico["']\s*\?/);
@@ -371,7 +371,6 @@ describe("o Span Inverso continua na fábrica compartilhada", () => {
       "matriz-espacial",
       "matriz-espacial-inversa",
       "mot",
-      "nback",
       "padroes-rotacao",
       "restaurante-ordem",
       "semaforo",
@@ -806,7 +805,8 @@ describe("sincronismo entre voz e estímulo visual", () => {
 
 describe("texto da demonstração", () => {
   // A redação "Observe como ouvir a sequência e responder corretamente" foi pedida para o Span e
-  // durou algumas horas: no mesmo dia a regra global 1 fixou um texto ÚNICO para os 34, e o texto
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  // durou algumas horas: no mesmo dia a regra global 1 fixou um texto ÚNICO para os 33, e o texto
   // específico do Span deixou de existir. Quem manda aqui é a regra global.
   it("usa o texto padrão do framework, não uma redação por exercício", () => {
     const runner = source("components/exercises/tutorial/TutorialRunner.tsx");
@@ -818,7 +818,8 @@ describe("texto da demonstração", () => {
 });
 
 // ─────────────────────────────────────────────────────────────────────────────
-// LOTE 0 — as nove regras globais da T1 (07/ago/2026). Valem para os 34.
+// O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+// LOTE 0 — as nove regras globais da T1 (07/ago/2026). Valem para os 33.
 // ─────────────────────────────────────────────────────────────────────────────
 
 describe("T1 global — 1 e 5: linguagem padrão", () => {
@@ -907,7 +908,8 @@ describe("T1 global — 7: um só padrão visual para todos", () => {
   });
 });
 
-describe("T1 congelada — 4. os títulos das etapas valem para os 34", () => {
+// O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+describe("T1 congelada — 4. os títulos das etapas valem para os 33", () => {
   const runner = () => source("components/exercises/tutorial/TutorialRunner.tsx");
 
   it('a tentativa guiada se chama "Agora é sua vez", nunca "Ouça e responda"', () => {
diff --git a/lib/tutorial/versions.test.ts b/lib/tutorial/versions.test.ts
index f09080a4..faf06fa7 100644
--- a/lib/tutorial/versions.test.ts
+++ b/lib/tutorial/versions.test.ts
@@ -3,11 +3,12 @@ import { EXERCISE_CATALOG } from "@/lib/prescription/catalog";
 import { TUTORIAL_VERSIONS, tutorialVersionFor } from "./versions";
 
 describe("catálogo de versões de tutorial", () => {
-  it("cobre exatamente os 34 exercícios canônicos", () => {
+  // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
+  it("cobre exatamente os 33 exercícios canônicos", () => {
     const canonicalIds = EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId).sort();
     const versionedIds = Object.keys(TUTORIAL_VERSIONS).sort();
 
-    expect(canonicalIds).toHaveLength(34);
+    expect(canonicalIds).toHaveLength(33);
     expect(versionedIds).toEqual(canonicalIds);
   });
 
diff --git a/lib/tutorial/versions.ts b/lib/tutorial/versions.ts
index 10647195..88943833 100644
--- a/lib/tutorial/versions.ts
+++ b/lib/tutorial/versions.ts
@@ -27,7 +27,6 @@ export const TUTORIAL_VERSIONS: Readonly<Record<string, number>> = Object.freeze
   "lista-distracao": 1,
   "restaurante-ordem": 1,
   "desafio-supermercado": 1,
-  nback: 1,
   "cubo-corsi": 1,
   vigilancia: 2,
   "identificacao-simbolos": 1,
diff --git a/types/index.ts b/types/index.ts
index a41facbb..2a2b02e9 100644
--- a/types/index.ts
+++ b/types/index.ts
@@ -423,14 +423,6 @@ export const EXERCISE_DEFINITIONS = {
     estimatedMinutes: 7,
     icon: "🔎",
   },
-  "nback": {
-    id: "nback",
-    name: "N-Back",
-    domain: "memory" as Domain,
-    description: "Decida se a letra atual é igual à de N posições atrás — memória operacional",
-    estimatedMinutes: 7,
-    icon: "🧠",
-  },
   "estacionamento-logico": {
     id: "estacionamento-logico",
     name: "Estacionamento Lógico",
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/exercise-retirement.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover aposentar-nback ==
