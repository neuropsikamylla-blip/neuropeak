== DIFF do lab migracao-31 (contra a base do bundle) ==
diff --git a/components/exercises/attention/AntesDepois.tsx b/components/exercises/attention/AntesDepois.tsx
index 03036cde..9cd5bf3d 100644
--- a/components/exercises/attention/AntesDepois.tsx
+++ b/components/exercises/attention/AntesDepois.tsx
@@ -4,7 +4,7 @@ import { useState, useRef, useEffect, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { GitBranch, Lightbulb, Check, RotateCcw, Volume2 } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import type { ExerciseResult, Theme } from "@/types";
 
@@ -259,8 +259,8 @@ function mcOptions(q: Question): { text: string; correct: boolean }[] {
 // visual = sem áudio · visual_audio = texto + áudio · audio_only = só áudio (esconde o texto).
 type PresMode = "visual" | "visual_audio" | "audio_only" | null;
 
-export function AntesDepois({ difficulty, onComplete }: AntesDepoisProps) {
-  const { begin, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function AntesDepois({ difficulty, theme, onComplete }: AntesDepoisProps) {
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("antes-depois", difficulty);
   const band = bandOf(difficulty);
   const startLevel = Math.min(10, Math.max(1, Math.round(difficulty)));
 
@@ -328,7 +328,7 @@ export function AntesDepois({ difficulty, onComplete }: AntesDepoisProps) {
     hits.current = newHits;
     const n = idx + 1;
     totalRef.current = n;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     const delay = correct ? 1700 : 2700;   // erro: tempo p/ ler a explicação
     setTimeout(() => { if (timeUp) finish(newHits); else setIdx(n); }, delay);
   }
@@ -413,7 +413,7 @@ export function AntesDepois({ difficulty, onComplete }: AntesDepoisProps) {
             Raciocínio sequencial
           </span>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 16px 18px", gap: 16 }}>
diff --git a/components/exercises/attention/CacaItemBarato.tsx b/components/exercises/attention/CacaItemBarato.tsx
index 9467eece..2d995154 100644
--- a/components/exercises/attention/CacaItemBarato.tsx
+++ b/components/exercises/attention/CacaItemBarato.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -408,7 +408,7 @@ function CacaTutorial({ theme, onDone }: { theme: Theme; onDone: () => void }) {
 
 export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("caca-item-barato", difficulty);
 
   const [round, setRound] = useState(0);
   const [roundResults, setRoundResults] = useState<boolean[]>([]);
@@ -422,7 +422,7 @@ export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
   const reachedRef = useRef(difficulty);
 
   const nextRound = useCallback((results: boolean[]) => {
-    if (isTimeUp()) {
+    if (!podeIniciarNovoDesafio()) {
       finish();
       const accuracy = results.filter(Boolean).length / Math.max(1, results.length);
       onComplete({
@@ -445,7 +445,7 @@ export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
       setRound(results.length);
       setPhase("question");
     }
-  }, [isTimeUp, finish, elapsedSec, onComplete]);
+  }, [podeIniciarNovoDesafio, finish, elapsedSec, onComplete]);
 
   function handleProductTap(id: string) {
     if (phase !== "question" || picked !== null) return;
@@ -500,7 +500,7 @@ export function CacaItemBarato({ difficulty, theme, onComplete }: Props) {
         </div>
 
         {/* Progress (pelo tempo, ~7 min) */}
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Question */}
         <AnimatePresence mode="wait">
diff --git a/components/exercises/attention/DualTask.tsx b/components/exercises/attention/DualTask.tsx
index 1cc3b1ac..6d3dddaf 100644
--- a/components/exercises/attention/DualTask.tsx
+++ b/components/exercises/attention/DualTask.tsx
@@ -4,7 +4,7 @@ import { useState, useEffect, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Hash, AlertTriangle, Sparkles } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -235,7 +235,7 @@ function InstrucaoBloco({ spec, idx, theme, alterada }: { spec: LevelSpec; idx:
 export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
   const spec = levelOf(difficulty);
   const nback = spec.nback;
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("dual-task", difficulty);
 
   const [shapes] = useState<ShapeTrial[]>(() => buildShapeSequence(spec, TOTAL_SHAPES));
   const [digitSeq] = useState<number[]>(() => buildDigitSequence(900, nback));
@@ -330,7 +330,7 @@ export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
     function scheduleNextShape() {
       if (allDoneRef.current) return;
       const idx = shapeIdxRef.current;
-      if (isTimeUp() || idx >= TOTAL_SHAPES) { finishSession(); return; }
+      if (!podeIniciarNovoDesafio() || idx >= TOTAL_SHAPES) { finishSession(); return; }
 
       // Mudança de regra (block-alt): ao entrar num novo bloco, avisa "REGRA ALTERADA".
       if (spec.topRule === "block-alt") {
@@ -471,7 +471,7 @@ export function DualTask({ difficulty, theme, onComplete }: DualTaskProps) {
             <p className={`shrink-0 whitespace-nowrap text-xs ${pal.sub}`}>Seu progresso</p>
             {/* A barra canônica traz `marginBottom: 14` embutido; compensado aqui para o
                 cabeçalho ficar compacto, sem reescrever a peça compartilhada. */}
-            <div style={{ marginBottom: -14 }} className="min-w-0 flex-1"><ExerciseProgressBar progressPct={progressPct} theme={theme} /></div>
+            <div style={{ marginBottom: -14 }} className="min-w-0 flex-1"><ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} /></div>
           </div>
         </header>
 
diff --git a/components/exercises/attention/FocusAgents.tsx b/components/exercises/attention/FocusAgents.tsx
index 73c46fbf..ba79a620 100644
--- a/components/exercises/attention/FocusAgents.tsx
+++ b/components/exercises/attention/FocusAgents.tsx
@@ -13,7 +13,7 @@
 import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { playTTS, cancelTTS } from "@/lib/tts";
 import type { ExerciseResult, Theme } from "@/types";
@@ -128,7 +128,7 @@ function AnuncioComando({ round, onOk }: { round: FocusRound; onOk: () => void }
 // ── Componente principal ─────────────────────────────────────────────────────
 export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents", settings }: FocusAgentsProps) {
   const auditivo = exerciseId === "focus-agents-auditivo";
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino(exerciseId, difficulty);
 
   type Fase = "comando" | "jogando" | "feedback";
   const [fase, setFase] = useState<Fase>("comando");
@@ -352,7 +352,7 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
 
   // ANUNCIA o comando, depois solta a queda (§ "mandar antes" + sempre visível)
   const novaRodada = useCallback(() => {
-    if (doneRef.current || isTimeUp()) { encerrar(); return; }
+    if (doneRef.current || !podeIniciarNovoDesafio()) { encerrar(); return; }
     const step = STEPS[stepRef.current];
     const r = gerarRodada(step.etapa, step.n, roundRef.current?.texto, step.semelhantes); // não repete o comando anterior
     // Os personagens desta rodada furam a fila: são os únicos que precisam estar prontos AGORA.
@@ -365,7 +365,7 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
     if (auditivo) falar(r);
     // NÃO inicia sozinho: o card mostra o comando e espera o paciente clicar OK
     // (confirma que leu). Depois disso, nenhuma dica fica na tela. (pedido da Kamylla)
-  }, [auditivo, falar, isTimeUp, encerrar]);
+  }, [auditivo, falar, podeIniciarNovoDesafio, encerrar]);
 
   // Paciente confirmou que leu o comando → começa a rodada (sem o comando visível).
   const confirmarComando = useCallback(() => {
@@ -450,7 +450,7 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
       {/* Só a barra de progresso no topo — SEM o comando visível durante a busca
           (sem dica após a instrução). O comando aparece só no card "Encontre". */}
       <div className="flex-shrink-0 px-3 pt-3 pb-2" style={{ zIndex: 50 }}>
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       <div ref={arenaRef} className="relative flex-1 overflow-hidden mx-2 mb-2 rounded-2xl"
diff --git a/components/exercises/attention/InformacaoEmFoco.tsx b/components/exercises/attention/InformacaoEmFoco.tsx
index 33745f77..ae4f4b70 100644
--- a/components/exercises/attention/InformacaoEmFoco.tsx
+++ b/components/exercises/attention/InformacaoEmFoco.tsx
@@ -13,7 +13,8 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { HelpCircle, Lightbulb, Check, X, Volume2, Search } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { playTTS, cancelTTS } from "@/lib/tts";
 import type { ExerciseResult, Theme } from "@/types";
@@ -224,7 +225,7 @@ function Tutorial({ theme, onStart }: { theme: Theme; onStart: () => void }) {
 
 export function InformacaoEmFoco({ difficulty, theme, onComplete }: Props) {
   const s = styles(theme);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(6 * 60 * 1000); // sessão por TEMPO (~6 min)
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("informacao-em-foco", difficulty);
 
   const [fase, setFase] = useState<"tutorial" | "play" | "fim">("tutorial");
   const nivelRef = useRef<number>(nivelInicialDe(difficulty));
@@ -288,12 +289,12 @@ export function InformacaoEmFoco({ difficulty, theme, onComplete }: Props) {
   }, [finish, elapsedSec, onComplete]);
 
   const proxima = useCallback(() => {
-    if (isTimeUp()) { encerrar(); return; }
+    if (!podeIniciarNovoDesafio()) { encerrar(); return; }
     // adaptativo: 3 acertos de 1ª sobe; 2 erros seguidos desce (spec §21)
     if (acertosSeguidos.current >= 3 && nivelRef.current < NIVEL_MAX) { nivelRef.current += 1; acertosSeguidos.current = 0; }
     else if (errosSeguidos.current >= 2 && nivelRef.current > 1) { nivelRef.current -= 1; errosSeguidos.current = 0; }
     novaQuestao();
-  }, [isTimeUp, encerrar, novaQuestao]);
+  }, [podeIniciarNovoDesafio, encerrar, novaQuestao]);
 
   const responder = useCallback((idx: number) => {
     if (!questao || revelou || fb?.ok) return;
@@ -368,17 +369,11 @@ export function InformacaoEmFoco({ difficulty, theme, onComplete }: Props) {
               {`Nível ${nivelRef.current}`}
             </span>
           </div>
-          {/* O que a barra mede fica EXPLÍCITO: a sessão é por tempo, não por nº de questões.
-              Antes aparecia "Questão 7" ao lado de um "%" de tempo — parecia progresso errado. */}
           <div className="flex items-center justify-between mt-2 mb-1">
             <span className={`text-xs font-semibold ${s.sub}`}>Atividade {qNum}</span>
             <span className={`text-xs ${s.sub}`}>Tempo da sessão · {Math.round(progressPct)}%</span>
           </div>
-          {/* progresso por TEMPO (sessão de ~6 min), não por nº de questões */}
-          <div className={`h-2 rounded-full overflow-hidden ${s.isG ? "bg-white/10" : "bg-slate-200"}`}>
-            <motion.div className="h-full rounded-full" style={{ background: s.isG ? "#22d3ee" : "#2563eb" }}
-              animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
-          </div>
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
         </div>
 
         {/* Pergunta + ajuda + áudio */}
@@ -447,7 +442,7 @@ export function InformacaoEmFoco({ difficulty, theme, onComplete }: Props) {
         {/* Continuar — só depois de resolver (sem auto-avanço) */}
         {revelou && (
           <button onClick={proxima} className={`w-full h-12 rounded-full font-bold ${s.btn}`}>
-            {isTimeUp() ? "Ver resultado" : "Continuar"}
+            {!podeIniciarNovoDesafio() ? "Ver resultado" : "Continuar"}
           </button>
         )}
         </div>
diff --git a/components/exercises/attention/MOT.tsx b/components/exercises/attention/MOT.tsx
index baeef8c3..553a230b 100644
--- a/components/exercises/attention/MOT.tsx
+++ b/components/exercises/attention/MOT.tsx
@@ -3,7 +3,7 @@
 import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { MOTBall } from "@/components/exercises/attention/MOTBall";
@@ -39,7 +39,7 @@ type Phase = "memorize" | "track" | "identify";
 // ── Main component ─────────────────────────────────────────────────────────
 
 export function MOT({ difficulty, theme, onComplete }: MOTProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("mot", difficulty);
 
   // Nível ADAPTATIVO dentro da sessão. Começa a partir da dificuldade salva do
   // paciente (modesto) e sobe a cada 3 rodadas perfeitas seguidas.
@@ -225,7 +225,7 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
     const nextRound = round + 1;
     const reachedDifficulty = Math.max(1, Math.min(10, 2 + reachedLevelRef.current));
 
-    if (isTimeUp()) {
+    if (!podeIniciarNovoDesafio()) {
       finish();
       const accuracy = (totalCorrect + correct) / Math.max(1, totalTargets + k);
       const duration = elapsedSec();
@@ -278,7 +278,7 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
           <div className="flex justify-between items-center mb-2">
             <h2 className={`font-bold text-sm ${pal.title}`}>👁️ Rastreamento de Objetos</h2>
           </div>
-          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
         </div>
 
         {/* Phase label */}
diff --git a/components/exercises/attention/TrilhaVisual.tsx b/components/exercises/attention/TrilhaVisual.tsx
index e71f6840..98793bc0 100644
--- a/components/exercises/attention/TrilhaVisual.tsx
+++ b/components/exercises/attention/TrilhaVisual.tsx
@@ -5,7 +5,7 @@ import { motion } from "framer-motion";
 import { Hash, Pointer } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { shuffle } from "@/lib/utils";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -188,7 +188,7 @@ function TrilhaVisualTutorial({ theme, onDone }: { theme: Theme; onDone: () => v
 
 export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProps) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("trilha-visual", difficulty);
 
   const [count, setCount] = useState(initialCount(difficulty));
   const [streak, setStreak] = useState(0);
@@ -237,7 +237,7 @@ export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProp
         if (newStreak <= -2) { nextCount = Math.max(count - 2, MIN_COUNT); nextStreak = 0; }
 
         const nextRound = round + 1;
-        const timeUp = isTimeUp();
+        const timeUp = !podeIniciarNovoDesafio();
 
         setTimeout(() => {
           if (timeUp) {
@@ -265,7 +265,7 @@ export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProp
     } else {
       setErrors((e) => e + 1);
     }
-  }, [roundPhase, nextExpected, count, errors, streak, round, roundResults, difficulty, cells, onComplete, isTimeUp, elapsedSec, finish, startNewRound]);
+  }, [roundPhase, nextExpected, count, errors, streak, round, roundResults, difficulty, cells, onComplete, podeIniciarNovoDesafio, elapsedSec, finish, startNewRound]);
 
   if (showTutorial) {
     return <TrilhaVisualTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); }} />;
@@ -309,7 +309,7 @@ export function TrilhaVisual({ difficulty, theme, onComplete }: TrilhaVisualProp
           </span>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Faixa de instrução */}
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: stripBg, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
diff --git a/components/exercises/attention/Vigilancia.tsx b/components/exercises/attention/Vigilancia.tsx
index c0251d42..73d88fd0 100644
--- a/components/exercises/attention/Vigilancia.tsx
+++ b/components/exercises/attention/Vigilancia.tsx
@@ -11,7 +11,8 @@
 
 import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -33,9 +34,7 @@ interface Kite { pos: number; isAlvo: boolean }
 
 export function Vigilancia({ difficulty, theme, onComplete }: Props) {
   const isG = theme === "GAMIFIED";
-  // Sessão por TEMPO (~8 min), como Estacionamento e Torre — não por nº de blocos.
-  const { begin, finish: finishTimer, progressPct } = useTimedProgress(8 * 60 * 1000);
-  const tempoAcabouRef = useRef(false);
+  const { begin, finish: finishTimer, progressPct, emTolerancia, podeIniciarNovoDesafio } = useBlocoDeTreino("vigilancia", difficulty);
   const [fase, setFase] = useState<Fase>("fixacao");
 
   const nivelRef = useRef(nivelDe(difficulty));
@@ -87,8 +86,6 @@ export function Vigilancia({ difficulty, theme, onComplete }: Props) {
     return () => ro.disconnect();
   }, [tentativa]);
 
-  useEffect(() => { tempoAcabouRef.current = progressPct >= 100; }, [progressPct]);
-
   const posToXY = (pos: number): Ponto => centrosRef.current[pos] ?? { x: dims.w / 2, y: dims.h / 2 };
 
   // Fim de bloco SILENCIOSO (§ princípio dela: nada de tela de "resultado do bloco" no meio):
@@ -97,14 +94,14 @@ export function Vigilancia({ difficulty, theme, onComplete }: Props) {
   const encerrarRef = useRef<() => void>(() => {});
   const finalizarBloco = useCallback(() => {
     clearTimers();
-    if (tempoAcabouRef.current) { encerrarRef.current(); return; }
+    if (!podeIniciarNovoDesafio()) { encerrarRef.current(); return; }
     const { decisao } = avaliarBloco(bloco.current.acertos);
     if (decisao === "avancar" && nivelRef.current < NIVEIS.length) {
       nivelRef.current++;
       estadoRef.current = estadoInicial(DEGRAU_CONFORTAVEL);
     }
     proximoBlocoRef.current();
-  }, []);
+  }, [podeIniciarNovoDesafio]);
 
   // ── Uma tentativa: fixação → exposição → resposta (SEM reapresentar o alvo) ──
   const iniciarTentativa = useCallback(() => {
@@ -136,12 +133,12 @@ export function Vigilancia({ difficulty, theme, onComplete }: Props) {
     setFase("feedback");
     const dur = correto ? 900 : 2600;  // erro: tempo de OLHAR onde estava a certa
     timers.current.push(setTimeout(() => {
-      if (tempoAcabouRef.current) { encerrarRef.current(); return; }
+      if (!podeIniciarNovoDesafio()) { encerrarRef.current(); return; }
       if (tentativaRef.current >= BLOCO_TENTATIVAS) { finalizarBloco(); return; }
       tentativaRef.current += 1; setTentativa(tentativaRef.current);
       iniciarTentativa();
     }, dur));
-  }, [finalizarBloco, iniciarTentativa]);
+  }, [finalizarBloco, iniciarTentativa, podeIniciarNovoDesafio]);
 
   const aoTocar = useCallback((e: React.PointerEvent) => {
     if (fase !== "resposta" || respondidoRef.current) return;
@@ -227,10 +224,7 @@ export function Vigilancia({ difficulty, theme, onComplete }: Props) {
           <span className={`font-black ${txt}`}>Vigilância</span>
           <span className={`text-xs font-semibold ${sub}`}>Nível {nivelRef.current}</span>
         </div>
-        <div className={`h-2 rounded-full overflow-hidden ${isG ? "bg-white/10" : "bg-slate-300"}`}>
-          <div className="h-full rounded-full transition-[width] duration-500"
-            style={{ width: `${Math.min(100, progressPct)}%`, background: isG ? "#22d3ee" : "#0284c7" }} />
-        </div>
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       <div ref={arenaRef} onPointerDown={aoTocar} onPointerMove={aoMover}
diff --git a/components/exercises/executive/CompraMultifuncional.tsx b/components/exercises/executive/CompraMultifuncional.tsx
index f01f67fb..4677ecfe 100644
--- a/components/exercises/executive/CompraMultifuncional.tsx
+++ b/components/exercises/executive/CompraMultifuncional.tsx
@@ -17,7 +17,8 @@
 import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -470,7 +471,7 @@ function PainelHistoria({ missao, etapa }: { missao: Missao; etapa: Etapa }) {
 // ── Componente principal ──────────────────────────────────────────────────────
 export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
   const { rootBg, cardStyle, btnStyle, pal, isG } = styles(theme);
-  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();
+  const { begin, atingiuTeto, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("compra-multifuncional", difficulty);
 
   const [stage, setStage] = useState<"config" | "tutorial" | "play">("config");
   const [temaCfg, setTemaCfg] = useState<TemaConfig>("variado");
@@ -527,7 +528,7 @@ export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
   const handleEtapaDone = useCallback((result: EtapaResult) => {
     sessionResultsRef.current = [...sessionResultsRef.current, result];
     missionResultsRef.current = [...missionResultsRef.current, result.firstTry];
-    if (isTimeUp()) { finishSession(); return; }
+    if (atingiuTeto()) { finishSession(); return; }
 
     const m = missao!;
     if (etapaIdx + 1 < m.etapas.length) { setEtapaIdx((i) => i + 1); return; }
@@ -538,10 +539,10 @@ export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
     if (rate >= 0.75 && levelRef.current < MAX_LEVEL) levelRef.current += 1;
     else if (rate < 0.4 && levelRef.current > 1) levelRef.current -= 1;
     reachedRef.current = Math.max(reachedRef.current, levelRef.current);
-    if (isTimeUp()) { finishSession(); return; }
+    if (!podeIniciarNovoDesafio()) { finishSession(); return; }
     iniciarMissao();
     // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, [missao, etapaIdx]);
+  }, [missao, etapaIdx, atingiuTeto, podeIniciarNovoDesafio]);
 
   // ── Config ──
   if (stage === "config") {
@@ -619,6 +620,7 @@ export function CompraMultifuncional({ difficulty, theme, onComplete }: Props) {
             </div>
           </div>
         </div>
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Dois painéis: história | missão */}
         <div className="grid md:grid-cols-2 gap-4 items-stretch">
diff --git a/components/exercises/executive/DesafioCidade.tsx b/components/exercises/executive/DesafioCidade.tsx
index b9ab5682..256e6eff 100644
--- a/components/exercises/executive/DesafioCidade.tsx
+++ b/components/exercises/executive/DesafioCidade.tsx
@@ -3,7 +3,7 @@
 import React, { useState, useEffect, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -1030,7 +1030,7 @@ function buildMissionQueue(count: number): EnvId[] {
 export function DesafioCidade({ difficulty, theme, onComplete }: {
   difficulty: number; theme: Theme; onComplete: (result: ExerciseResult) => void;
 }) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("desafio-cidade", difficulty);
   const results = useRef<boolean[]>([]);
   const missionQueue = useRef<EnvId[]>(buildMissionQueue(80));
   useEffect(() => { begin(); }, [begin]);
@@ -1075,7 +1075,7 @@ export function DesafioCidade({ difficulty, theme, onComplete }: {
     setPhase("result");
 
     if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     resultTimerRef.current = setTimeout(() => {
       if (timeUp) {
         finish();
@@ -1099,7 +1099,7 @@ export function DesafioCidade({ difficulty, theme, onComplete }: {
   }
 
   const ProgressBar = () => (
-    <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+    <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
   );
 
   return (
diff --git a/components/exercises/executive/DesafioOrcamento.tsx b/components/exercises/executive/DesafioOrcamento.tsx
index e84cfc21..7e8b6572 100644
--- a/components/exercises/executive/DesafioOrcamento.tsx
+++ b/components/exercises/executive/DesafioOrcamento.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -202,7 +202,7 @@ function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
 
 export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("desafio-orcamento", difficulty);
 
   const [round, setRound] = useState(0);
   const [roundResults, setRoundResults] = useState<boolean[]>([]);
@@ -240,7 +240,7 @@ export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
     if (streakRef.current >= 2) { streakRef.current = 0; curLevelRef.current = Math.min(10, curLevelRef.current + 1); reachedRef.current = Math.max(reachedRef.current, curLevelRef.current); }
     else if (streakRef.current <= -2) { streakRef.current = 0; curLevelRef.current = Math.max(1, curLevelRef.current - 1); }
     const nextR = roundRef.current + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -300,7 +300,7 @@ export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
             <span className={`text-xs ${pal.sub}`}>{currentRound.domain.name}</span>
           </div>
 
-          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
           <AnimatePresence mode="wait">
             {phase === "shopping" && (
diff --git a/components/exercises/executive/EstacionamentoLogico.tsx b/components/exercises/executive/EstacionamentoLogico.tsx
index a2893412..fdc552b4 100644
--- a/components/exercises/executive/EstacionamentoLogico.tsx
+++ b/components/exercises/executive/EstacionamentoLogico.tsx
@@ -2,7 +2,7 @@
 
 import { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { assignCarImages, ALL_CAR_IMAGES } from "@/lib/parking-cars";
@@ -355,8 +355,8 @@ const TUTORIAL_LEVEL: Level = {
   ],
 };
 
-export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }: Props) {
-  const { begin, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress(11 * 60 * 1000); // 11 min — tarefa de planejamento (pedido da Kamylla)
+export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("estacionamento-logico", difficulty);
 
   const [cellPx, setCellPx] = useState(52);
   const wrapRef = useRef<HTMLDivElement>(null);
@@ -480,12 +480,12 @@ export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }:
       streakRef.current -= 1;
       if (streakRef.current <= -2) { streakRef.current = 0; curDiffRef.current = stepDiff(curDiffRef.current, -1); }
     }
-    if (isTimeUp()) { completeSession(); return; }
+    if (!podeIniciarNovoDesafio()) { completeSession(); return; }
     const picked = pickLevel(curDiffRef.current, recentRef.current);
     curDiffRef.current = picked.diff;
     reachedRef.current = Math.max(reachedRef.current, picked.diff);
     loadLevel(picked.level);
-  }, [isTimeUp, completeSession, loadLevel]);
+  }, [podeIniciarNovoDesafio, completeSession, loadLevel]);
 
   // Fim do tutorial → começa o jogo de verdade (não conta nas estatísticas).
   const startRealGame = useCallback(() => {
@@ -724,7 +724,7 @@ export function EstacionamentoLogico({ difficulty, theme: _theme, onComplete }:
 
       {/* Barra de progresso (pelo tempo, ~11 min, em saltos de 10%) */}
       <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14 }}>
-        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* Banner da DICA no MODO GUIADO (ativado pelo "Ver dica" após 4 erros seguidos) */}
diff --git a/components/exercises/executive/Labirinto.tsx b/components/exercises/executive/Labirinto.tsx
index c03c26fb..5edee1f5 100644
--- a/components/exercises/executive/Labirinto.tsx
+++ b/components/exercises/executive/Labirinto.tsx
@@ -1,7 +1,7 @@
 "use client";
 
 import { useState, useEffect, useCallback, useRef } from "react";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -608,7 +608,7 @@ function LabirintoTutorial({ theme, onDone }: { theme: Theme; onDone: () => void
 // ── Main component ─────────────────────────────────────────────────────────
 export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("labirinto", difficulty);
   const pal = PALETTES[theme];
 
   const [sizeIdx, setSizeIdx] = useState(() => initialIdx(difficulty));
@@ -744,7 +744,7 @@ export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
     }
     const nextMaze = curMazeNum + 1;
 
-    if (isTimeUp()) {
+    if (!podeIniciarNovoDesafio()) {
       allDoneRef.current = true;
       finish();
       const solvedCount = all.filter((x) => x.solved).length;
@@ -965,7 +965,7 @@ export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
             <p className="text-[11px] tabular-nums" style={{ color: timeColor }}>{elapsed}s / {timeLimit}s</p>
           </div>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* Maze */}
@@ -999,7 +999,7 @@ export function Labirinto({ difficulty, theme, onComplete }: LabirintoProps) {
             : report.deadEnds >= 3 ? "Evite os becos: trace o caminho com o olho antes de mover."
             : report.efficiency < 0.6 ? "Muitos movimentos extras — planeje a rota mais curta."
             : "Bom! Tente usar ainda menos movimentos.";
-          const last = isTimeUp();
+          const last = !podeIniciarNovoDesafio();
           const Row = ({ k, v, warn }: { k: string; v: string | number; warn?: boolean }) => (
             <div className="flex justify-between" style={{ fontSize: 12.5 }}>
               <span style={{ color: "#9ca3af" }}>{k}</span>
diff --git a/components/exercises/executive/MudancaRegras.tsx b/components/exercises/executive/MudancaRegras.tsx
index a9ad2aea..3f3aa9ac 100644
--- a/components/exercises/executive/MudancaRegras.tsx
+++ b/components/exercises/executive/MudancaRegras.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -564,7 +564,7 @@ function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
 
 export function MudancaRegras({ difficulty, theme, onComplete }: Props) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("mudanca-regras", difficulty);
 
   const [level, setLevel] = useState<MRLevel>(() => getLevel(difficulty));
   const [streak, setStreak] = useState(0);
@@ -613,7 +613,7 @@ export function MudancaRegras({ difficulty, theme, onComplete }: Props) {
     setLevel(nextLevel);
 
     const nextTrial = trialRef.current + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -689,7 +689,7 @@ export function MudancaRegras({ difficulty, theme, onComplete }: Props) {
           </div>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Question banner */}
         <AnimatePresence mode="wait">
diff --git a/components/exercises/executive/OrdemHistoria.tsx b/components/exercises/executive/OrdemHistoria.tsx
index 08d45bbb..6d4caa57 100644
--- a/components/exercises/executive/OrdemHistoria.tsx
+++ b/components/exercises/executive/OrdemHistoria.tsx
@@ -11,7 +11,7 @@ import {
 } from "@dnd-kit/sortable";
 import { CSS } from "@dnd-kit/utilities";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { HISTORIAS, HISTORIAS_INTRUSO, HISTORIAS_DESCUBRA, histPanelSrc, descubraScene, descubraOption, type HistDiff } from "@/data/historias";
 import type { ExerciseResult, Theme } from "@/types";
@@ -171,8 +171,8 @@ function SortableScene({
   );
 }
 
-export function OrdemHistoria({ difficulty, onComplete, settings }: OrdemHistoriaProps) {
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function OrdemHistoria({ difficulty, theme, onComplete, settings }: OrdemHistoriaProps) {
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("ordem-historia", difficulty);
   // Trilha (estágio salvo em currentDifficulty): 1-10 = ordenar; 11 = Encontre o Intruso; 12 = Descubra o que falta.
   const stage = Math.min(12, Math.max(1, Math.round(difficulty)));
   // Atalho do terapeuta: ligar um desafio sobe o estágio efetivo da sessão.
@@ -343,7 +343,7 @@ export function OrdemHistoria({ difficulty, onComplete, settings }: OrdemHistori
   }, [onComplete, difficulty, reportLevel, tier, sessionMode, finishTimer, elapsedSec]);
 
   function advance(wasExact: boolean) {
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => { if (timeUp) finish(); else { setTrial((t) => t + 1); startRound(); } }, wasExact ? 1900 : 3200);
   }
 
@@ -478,7 +478,7 @@ export function OrdemHistoria({ difficulty, onComplete, settings }: OrdemHistori
             <div style={{ fontSize: 11.5, color: "#9a93b0" }}>{headerSub}</div>
           </div>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme="COLORFUL" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* Instrução + dicas */}
diff --git a/components/exercises/executive/StroopTask.tsx b/components/exercises/executive/StroopTask.tsx
index 4e68d7f5..41459d78 100644
--- a/components/exercises/executive/StroopTask.tsx
+++ b/components/exercises/executive/StroopTask.tsx
@@ -3,9 +3,8 @@
 import { useState, useEffect, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
-import { stroopDosage } from "@/lib/exercise-dosage";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
 
@@ -428,7 +427,7 @@ function TutorialStep({
 // ── Main exercise ─────────────────────────────────────────────────────────────
 
 export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(stroopDosage(difficulty).targetDurationSec * 1000);
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("stroop-task", difficulty);
 
   const [phase, setPhase] = useState<Phase>("tutorial");
   const [tutorialStep, setTutorialStep] = useState(0);
@@ -485,7 +484,7 @@ export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
 
     const nextTrial = trialRef.current + 1;
 
-    if (isTimeUp()) {
+    if (!podeIniciarNovoDesafio()) {
       doneRef.current = true;
       setDone(true);
       finish();
@@ -572,7 +571,7 @@ export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
           </span>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Timer bar */}
         <div
diff --git a/components/exercises/executive/TaskSwitching.tsx b/components/exercises/executive/TaskSwitching.tsx
index dc3af0bf..d6826e52 100644
--- a/components/exercises/executive/TaskSwitching.tsx
+++ b/components/exercises/executive/TaskSwitching.tsx
@@ -3,7 +3,7 @@
 import { useState, useEffect, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -219,7 +219,7 @@ function TaskSwitchingTutorial({ theme, onDone }: { theme: Theme; onDone: () =>
 
 export function TaskSwitching({ difficulty, theme, onComplete }: TaskSwitchingProps) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("task-switching", difficulty);
 
   const [trials] = useState<Trial[]>(() => buildTrials(difficulty));
   const [trialIdx, setTrialIdx] = useState(0);
@@ -269,7 +269,7 @@ export function TaskSwitching({ difficulty, theme, onComplete }: TaskSwitchingPr
 
   const advance = useCallback((res: TrialResult[]) => {
     const next = trialIdx + 1;
-    if (isTimeUp()) {
+    if (!podeIniciarNovoDesafio()) {
       finishSession(res);
       return;
     }
@@ -289,7 +289,7 @@ export function TaskSwitching({ difficulty, theme, onComplete }: TaskSwitchingPr
       setPhase("stimulus");
       stimulusStart.current = Date.now();
     }
-  }, [trialIdx, TOTAL, trials, isTimeUp, finishSession]);
+  }, [trialIdx, TOTAL, trials, podeIniciarNovoDesafio, finishSession]);
 
   function handleAnswer(side: "left" | "right") {
     if (phase !== "stimulus" || allDoneRef.current) return;
@@ -352,7 +352,7 @@ export function TaskSwitching({ difficulty, theme, onComplete }: TaskSwitchingPr
           <div className="flex justify-between items-center mb-2">
             <h2 className={`font-bold text-sm ${pal.title}`}>🔄 Task Switching</h2>
           </div>
-          <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
         </div>
 
         {/* Rule banner */}
diff --git a/components/exercises/executive/caminhos-meta/CaminhosMeta.tsx b/components/exercises/executive/caminhos-meta/CaminhosMeta.tsx
index fbf56dac..0a336b8f 100644
--- a/components/exercises/executive/caminhos-meta/CaminhosMeta.tsx
+++ b/components/exercises/executive/caminhos-meta/CaminhosMeta.tsx
@@ -32,7 +32,7 @@ import {
 } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { playTTS, cancelTTS } from "@/lib/tts";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { corrigirResposta, corrigirImprevisto } from "@/lib/caminhos-meta";
 import {
@@ -391,7 +391,7 @@ export function CaminhosMeta({ difficulty, theme, onComplete, settings }: Caminh
   const cfg = useMemo(() => normalizeCaminhosSettings(settings), [settings]);
   const sessao = useMemo(() => montarSessao(cfg), [cfg]);
 
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("antes-depois", difficulty);
 
   const [idx, setIdx] = useState(0);
   const atividade = sessao[Math.min(idx, sessao.length - 1)];
@@ -473,12 +473,12 @@ export function CaminhosMeta({ difficulty, theme, onComplete, settings }: Caminh
 
   const proximaAtividade = useCallback(() => {
     limparProgresso(atividade.id);
-    if (isTimeUp() || idx + 1 >= sessao.length) {
+    if (!podeIniciarNovoDesafio() || idx + 1 >= sessao.length) {
       finalizarSessao();
       return;
     }
     setIdx((i) => i + 1);
-  }, [atividade.id, isTimeUp, idx, sessao.length, finalizarSessao]);
+  }, [atividade.id, podeIniciarNovoDesafio, idx, sessao.length, finalizarSessao]);
 
   // registra o desempenho de UMA atividade e avança
   const registrarEavancar = useCallback(
@@ -1159,7 +1159,7 @@ function AtividadeRunner({
           </button>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* CARTÃO DA META — sempre visível (spec §13) */}
         <div
diff --git a/components/exercises/memory/DesafioSupermercado.tsx b/components/exercises/memory/DesafioSupermercado.tsx
index e24cea0c..574ad66e 100644
--- a/components/exercises/memory/DesafioSupermercado.tsx
+++ b/components/exercises/memory/DesafioSupermercado.tsx
@@ -7,7 +7,7 @@ import { cancelTTS } from "@/lib/tts";
 import { resolveVoice, ensureVoices } from "@/lib/voicePrefs";
 import { VoicePicker } from "@/components/exercises/VoicePicker";
 import { PresentationConfig, type PresMode } from "@/components/exercises/PresentationConfig";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import type { ExerciseResult, Theme } from "@/types";
 
@@ -455,8 +455,8 @@ export function DesafioSupermercadoBoard({
 
 // ── HUD (barra azul-marinho) ─────────────────────────────────────────────────────
 
-function Hud({ level, mode, progressPct }: {
-  level: number; mode: "leitura" | "auditivo"; progressPct: number;
+function Hud({ level, mode, progressPct, theme, emTolerancia }: {
+  level: number; mode: "leitura" | "auditivo"; progressPct: number; theme: Theme; emTolerancia: boolean;
 }) {
   return (
     <div style={{
@@ -475,7 +475,7 @@ function Hud({ level, mode, progressPct }: {
         </div>
       </div>
 
-      <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+      <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia} />
 
       {/* direita: Treino de Memória */}
       <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }} className="np-hud-right">
@@ -496,13 +496,13 @@ function Hud({ level, mode, progressPct }: {
 // ── Main component ────────────────────────────────────────────────────────────────
 
 
-export function DesafioSupermercado({ difficulty, onComplete }: DesafioSupermercadoProps) {
+export function DesafioSupermercado({ difficulty, theme, onComplete }: DesafioSupermercadoProps) {
   // Modo de apresentação (escolhido na tela "Configurar atividade", antes de iniciar).
   const [presMode, setPresMode] = useState<PresMode | null>(null);
   const displayMode: "leitura" | "auditivo" = presMode === "audio_only" ? "auditivo" : "leitura";
   const mode = displayMode;                                  // controla esconder/mostrar texto
   const speakOn = presMode === "visual_audio" || presMode === "audio_only";  // controla a fala
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("desafio-supermercado", difficulty);
 
   const startLevel = useMemo(() => clampLevel(difficulty), [difficulty]);
   const [sessionLevel, setSessionLevel] = useState(startLevel);
@@ -614,7 +614,7 @@ export function DesafioSupermercado({ difficulty, onComplete }: DesafioSupermerc
     setTrialResults(newResults);
     setPhase("result");
     const nextTrial = trial + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -663,7 +663,7 @@ export function DesafioSupermercado({ difficulty, onComplete }: DesafioSupermerc
       {showVoice && <VoicePicker onClose={() => setShowVoice(false)} />}
 
       <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
-        <Hud level={sessionLevel} mode={mode} progressPct={progressPct} />
+        <Hud level={sessionLevel} mode={mode} progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         <AnimatePresence mode="wait">
 
diff --git a/components/exercises/memory/JogoMemoria.tsx b/components/exercises/memory/JogoMemoria.tsx
index b37aaccb..7480ae21 100644
--- a/components/exercises/memory/JogoMemoria.tsx
+++ b/components/exercises/memory/JogoMemoria.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -129,7 +129,7 @@ export function JogoMemoriaBoard({
 }
 
 export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("jogo-memoria", difficulty);
 
   const isGamified = theme === "GAMIFIED";
   const isColorful = theme === "COLORFUL";
@@ -183,7 +183,7 @@ export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps)
     if (newStreak <= -2) { nextPairs = Math.max(currentPairCount - 2, MIN_PAIRS); nextStreak = 0; }
 
     const nextRound = round + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -294,7 +294,7 @@ export function JogoMemoria({ difficulty, theme, onComplete }: JogoMemoriaProps)
           )}
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Instrução */}
         <p style={{ fontSize: 13, textAlign: "center", marginBottom: 12, color: instructionColor }}>
diff --git a/components/exercises/memory/LetrasSequencia.tsx b/components/exercises/memory/LetrasSequencia.tsx
index 6ca9a20c..55b58412 100644
--- a/components/exercises/memory/LetrasSequencia.tsx
+++ b/components/exercises/memory/LetrasSequencia.tsx
@@ -4,7 +4,7 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Eye, Headphones } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
@@ -133,8 +133,8 @@ export function LetrasSequenciaBoard({
   );
 }
 
-export function LetrasSequencia({ difficulty, onComplete }: LetrasSequenciaProps) {
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function LetrasSequencia({ difficulty, theme, onComplete }: LetrasSequenciaProps) {
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("letras-sequencia", difficulty);
   const startLevel = levelOf(difficulty);
   const [level, setLevel] = useState(startLevel);
   const spec = LS_LEVELS[level];
@@ -246,12 +246,12 @@ export function LetrasSequencia({ difficulty, onComplete }: LetrasSequenciaProps
       reachedRef.current = Math.max(reachedRef.current, nl);
       return nl;
     });
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => {
       if (timeUp) { finish(); }
       else { startRound(); }
     }, correct ? 1300 : 2400);
-  }, [expected, startRound, finish, isTimeUp]);
+  }, [expected, startRound, finish, podeIniciarNovoDesafio]);
 
   function handleKey(k: string) {
     if (phase !== "input" || enteredRef.current.length >= spec.count) return;
@@ -308,7 +308,7 @@ export function LetrasSequencia({ difficulty, onComplete }: LetrasSequenciaProps
           </p>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Apresentação */}
         {phase === "show" && (
diff --git a/components/exercises/memory/ListaDistracao.tsx b/components/exercises/memory/ListaDistracao.tsx
index 5aa0d020..abd1fd63 100644
--- a/components/exercises/memory/ListaDistracao.tsx
+++ b/components/exercises/memory/ListaDistracao.tsx
@@ -4,7 +4,7 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion } from "framer-motion";
 import { ListChecks } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -118,8 +118,8 @@ export function ListaDistracaoBoard({
   );
 }
 
-export function ListaDistracao({ difficulty, onComplete }: ListaDistracaoProps) {
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function ListaDistracao({ difficulty, theme, onComplete }: ListaDistracaoProps) {
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("lista-distracao", difficulty);
   const startLevel = levelOf(difficulty);
   const [level, setLevel] = useState(startLevel);
   const spec = LD_LEVELS[level];
@@ -213,9 +213,9 @@ export function ListaDistracao({ difficulty, onComplete }: ListaDistracaoProps)
     streakRef.current = correct ? Math.max(0, streakRef.current) + 1 : Math.min(0, streakRef.current) - 1;
     if (streakRef.current >= 2) { streakRef.current = 0; setLevel((l) => { const nl = Math.min(10, l + 1); reachedRef.current = Math.max(reachedRef.current, nl); return nl; }); }
     else if (streakRef.current <= -2) { streakRef.current = 0; setLevel((l) => Math.max(1, l - 1)); }
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => { if (timeUp) finish(); else startRound(); }, correct ? 1300 : 2400);
-  }, [spec, list, startRound, finish, isTimeUp]);
+  }, [spec, list, startRound, finish, podeIniciarNovoDesafio]);
 
   function pickWord(w: string) {
     if (phase !== "recall" || pickedRef.current.includes(w) || pickedRef.current.length >= spec.count) return;
@@ -267,7 +267,7 @@ export function ListaDistracao({ difficulty, onComplete }: ListaDistracaoProps)
             Nível {level} · {spec.count} itens · {spec.order ? "em ordem" : "reconhecer"}
           </p>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Etapa 1 — memorizar */}
         {phase === "memorize" && (
diff --git a/components/exercises/memory/MatrizEspacial.tsx b/components/exercises/memory/MatrizEspacial.tsx
index 337c5864..a8bd90cc 100644
--- a/components/exercises/memory/MatrizEspacial.tsx
+++ b/components/exercises/memory/MatrizEspacial.tsx
@@ -4,7 +4,7 @@ import { useState, useEffect, useCallback } from "react";
 import { motion } from "framer-motion";
 import { LayoutGrid, Pointer } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
@@ -134,6 +134,7 @@ export function MatrizEspacialGrid({
 }
 
 export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }: MatrizEspacialProps) {
+  const exerciseId = alwaysReverse === true ? "matriz-espacial-inversa" : "matriz-espacial";
   const reverse = alwaysReverse ?? REVERSE_MODE(difficulty);
   const [seqLength, setSeqLength] = useState(matrizEspacialSequenceLengthFor(difficulty));
   const [phase, setPhase] = useState<Phase>("showing");
@@ -143,7 +144,7 @@ export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }:
   const [trial, setTrial] = useState(0);
   const [attempts, setAttempts] = useState<{ correct: boolean; seqLen: number }[]>([]);
   const [feedbackData, setFeedbackData] = useState<{ correct: boolean; userSeq: number[] } | null>(null);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino(exerciseId, difficulty);
 
   useEffect(() => { begin(); }, [begin]);
 
@@ -208,7 +209,7 @@ export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }:
     const nextSeqLen = nextLevelPerTrial(seqLength, verdict, MIN_SEQ, MAX_SEQ);
 
     const nextTrial = trial + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -332,7 +333,7 @@ export function MatrizEspacial({ difficulty, theme, onComplete, alwaysReverse }:
           </span>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Faixa de instrução */}
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: stripBg, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
diff --git a/components/exercises/memory/PadroesRotacao.tsx b/components/exercises/memory/PadroesRotacao.tsx
index 121534c1..1a6a9fae 100644
--- a/components/exercises/memory/PadroesRotacao.tsx
+++ b/components/exercises/memory/PadroesRotacao.tsx
@@ -4,7 +4,7 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion } from "framer-motion";
 import { RotateCw } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -126,8 +126,8 @@ export function PadroesRotacaoGrid({
   );
 }
 
-export function PadroesRotacao({ difficulty, onComplete }: PadroesRotacaoProps) {
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function PadroesRotacao({ difficulty, theme, onComplete }: PadroesRotacaoProps) {
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("padroes-rotacao", difficulty);
   const startLevel = levelOf(difficulty);
   const [level, setLevel] = useState(startLevel);
   const spec = LEVELS[level];
@@ -261,9 +261,9 @@ export function PadroesRotacao({ difficulty, onComplete }: PadroesRotacaoProps)
     streakRef.current = exact ? Math.max(0, streakRef.current) + 1 : Math.min(0, streakRef.current) - 1;
     if (streakRef.current >= 2) { streakRef.current = 0; setLevel((l) => { const nl = Math.min(10, l + 1); reachedRef.current = Math.max(reachedRef.current, nl); return nl; }); }
     else if (streakRef.current <= -2) { streakRef.current = 0; setLevel((l) => Math.max(1, l - 1)); }
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => { if (timeUp) finish(); else startRound(); }, exact ? 1300 : 2300);
-  }, [startRound, finish, isTimeUp]);
+  }, [startRound, finish, podeIniciarNovoDesafio]);
 
   function toggle(r: number, c: number) {
     if (phase !== "input") return;
@@ -318,7 +318,7 @@ export function PadroesRotacao({ difficulty, onComplete }: PadroesRotacaoProps)
           )}
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         <p className="text-sm font-semibold text-center" style={{ color: phase === "feedback" && feedback === "incorrect" ? "#2C6B84" : TEAL, minHeight: 22 }}>
           {phase === "show" ? "👀 " : phase === "rotating" ? "🔄 " : ""}{instruction}
diff --git a/components/exercises/memory/RestauranteOrdem.tsx b/components/exercises/memory/RestauranteOrdem.tsx
index b519d538..af7d1845 100644
--- a/components/exercises/memory/RestauranteOrdem.tsx
+++ b/components/exercises/memory/RestauranteOrdem.tsx
@@ -6,7 +6,7 @@ import { Timer, Bell, ArrowLeftRight, Volume2 } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { speakText } from "@/lib/voicePrefs";
 import { VoicePicker } from "@/components/exercises/VoicePicker";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { PresentationConfig, type PresMode } from "@/components/exercises/PresentationConfig";
 import type { ExerciseResult, Theme } from "@/types";
@@ -423,11 +423,11 @@ export function RestauranteOrdemBoard({
 type Phase = "ready" | "salao" | "update" | "bancada" | "feedback";
 
 // ── Componente principal ────────────────────────────────────────────────────────
-export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemProps) {
+export function RestauranteOrdem({ difficulty, theme, onComplete }: RestauranteOrdemProps) {
   const [presMode, setPresMode] = useState<PresMode | null>(null);
   const speakOn = presMode === "visual_audio" || presMode === "audio_only";
   const hideText = presMode === "audio_only";
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("restaurante-ordem", difficulty);
   const startLevel = levelOf(difficulty);
   const [sessionLevel, setSessionLevel] = useState(startLevel);
   const spec = R_LEVELS[sessionLevel];
@@ -559,7 +559,7 @@ export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemPro
 
   function advance() {
     const nextTrial = trial + 1;
-    if (isTimeUp()) finish();
+    if (!podeIniciarNovoDesafio()) finish();
     else { setTrial(nextTrial); startRound(); }
   }
 
@@ -787,7 +787,7 @@ export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemPro
           </button>
         </div>
         <div style={{ flexShrink: 0, padding: "0 18px 10px" }}>
-          <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
         </div>
       </div>
     );
@@ -847,7 +847,7 @@ export function RestauranteOrdem({ difficulty, onComplete }: RestauranteOrdemPro
               color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 6px 20px rgba(20,122,69,0.5)" }}>
             Continuar →
           </button>
-          <div style={{ width: "100%", maxWidth: 280 }}><ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" /></div>
+          <div style={{ width: "100%", maxWidth: 280 }}><ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} /></div>
         </div>
       </div>
     );
diff --git a/components/exercises/memory/SequenciaItens.tsx b/components/exercises/memory/SequenciaItens.tsx
index d4fbf1e3..a2287c4c 100644
--- a/components/exercises/memory/SequenciaItens.tsx
+++ b/components/exercises/memory/SequenciaItens.tsx
@@ -4,7 +4,7 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Eye, Headphones } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { ItemVisual } from "@/components/exercises/ItemVisual";
@@ -140,8 +140,8 @@ export function SequenciaItensBoard({
   );
 }
 
-export function SequenciaItens({ difficulty, onComplete }: SequenciaItensProps) {
-  const { begin: startTimer, isTimeUp, elapsedSec, finish: finishTimer, progressPct } = useTimedProgress();
+export function SequenciaItens({ difficulty, theme, onComplete }: SequenciaItensProps) {
+  const { begin: startTimer, podeIniciarNovoDesafio, elapsedSec, finish: finishTimer, progressPct, emTolerancia } = useBlocoDeTreino("sequencia-itens", difficulty);
   const startLevel = levelOf(difficulty);
   const [level, setLevel] = useState(startLevel);
   const spec = SI_LEVELS[level];
@@ -245,9 +245,9 @@ export function SequenciaItens({ difficulty, onComplete }: SequenciaItensProps)
       reachedRef.current = Math.max(reachedRef.current, nl);
       return nl;
     });
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => { if (timeUp) finish(); else startRound(); }, correct ? 1200 : 2200);
-  }, [sequence, startRound, finish, isTimeUp]);
+  }, [sequence, startRound, finish, podeIniciarNovoDesafio]);
 
   function handleKey(it: Item) {
     if (phase !== "input" || enteredRef.current.length >= spec.count) return;
@@ -291,7 +291,7 @@ export function SequenciaItens({ difficulty, onComplete }: SequenciaItensProps)
             Nível {level} · {spec.count} itens · {spec.audio ? "áudio" : "visual"}{spec.similar ? " · semelhantes" : ""}
           </p>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme="GAMIFIED" />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {phase === "show" && (
           <div className="flex flex-col items-center gap-4 py-6" style={{ minHeight: 200 }}>
diff --git a/components/exercises/memory/SpanNumerico.tsx b/components/exercises/memory/SpanNumerico.tsx
index da8208fd..d037738d 100644
--- a/components/exercises/memory/SpanNumerico.tsx
+++ b/components/exercises/memory/SpanNumerico.tsx
@@ -4,7 +4,7 @@ import { useState, useEffect, useCallback, useRef } from "react";
 import { motion } from "framer-motion";
 import { Headphones } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
@@ -191,10 +191,10 @@ export function Beads({
 
 // ── Componente principal ────────────────────────────────────────────────────────
 
-export function SpanNumerico({ difficulty, onComplete, reverse = false, settings }: SpanNumericoProps) {
+export function SpanNumerico({ difficulty, theme, onComplete, reverse = false, settings }: SpanNumericoProps) {
   const exerciseId = reverse ? "span-numerico-inverso" : "span-numerico";
   const title = reverse ? "Span Numérico Auditivo Inverso" : "Span Numérico Auditivo Direto";
-  const { begin, elapsedSec, finish } = useTimedProgress();
+  const { begin, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino(exerciseId, difficulty);
 
   // Config do TERAPEUTA (prescrição) — fixa para o paciente. Ausente = padrões.
   const cfg: SpanSettings = normalizeSettings(settings);
@@ -396,8 +396,7 @@ export function SpanNumerico({ difficulty, onComplete, reverse = false, settings
           <p className="text-sm font-bold leading-tight" style={{ color: "#3B5A75" }}>{title}</p>
         </div>
 
-        {/* Conclusão do exercício (0–100% pelas tentativas feitas, como no método) */}
-        <ExerciseProgressBar progressPct={Math.min(100, Math.round((attempts.length / cfg.trials) * 100))} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* ── FASE: ouvir (painel visível; a tecla falada PISCA) ─────────── */}
         {(phase === "listen" || phase === "flip") && (
diff --git a/components/exercises/processing/CertoOuErrado.tsx b/components/exercises/processing/CertoOuErrado.tsx
index ac672eae..aeb71f80 100644
--- a/components/exercises/processing/CertoOuErrado.tsx
+++ b/components/exercises/processing/CertoOuErrado.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef, useCallback, useMemo, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -510,7 +510,7 @@ export function CertoOuErrado({
   onComplete,
   patientAge,
 }: CertoOuErradoProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("certo-ou-errado", difficulty);
 
   const SCENARIO_POOL = useMemo(() => getScenarioPool(patientAge), [patientAge]);
 
@@ -559,7 +559,7 @@ export function CertoOuErrado({
       resultsRef.current = newResults;
       setResults(newResults);
 
-      if (isTimeUp()) {
+      if (!podeIniciarNovoDesafio()) {
         doneRef.current = true;
         finish();
 
@@ -593,7 +593,7 @@ export function CertoOuErrado({
         }, 1600);
       }
     },
-    [difficulty, onComplete, isTimeUp, elapsedSec, finish]
+    [difficulty, onComplete, podeIniciarNovoDesafio, elapsedSec, finish]
   );
 
   // ── Handle patient's answer ─────────────────────────────────────────────────
@@ -697,7 +697,7 @@ export function CertoOuErrado({
           </div>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* ── Main play area ── */}
diff --git a/components/exercises/processing/CorridaContraOTempo.tsx b/components/exercises/processing/CorridaContraOTempo.tsx
index 17d61d75..7247fa33 100644
--- a/components/exercises/processing/CorridaContraOTempo.tsx
+++ b/components/exercises/processing/CorridaContraOTempo.tsx
@@ -4,7 +4,8 @@ import { useState, useEffect, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Timer, Target, Ban, Check, Zap, Crosshair, MousePointerClick, Eye } from "lucide-react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
 import type { ExerciseResult, Theme } from "@/types";
@@ -149,7 +150,7 @@ type Phase = "ready" | "loading" | "playing" | "roundfb" | "roundpause" | "summa
 
 export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("corrida-tempo", difficulty);
 
   const [round, setRound] = useState(0);
   const [phase, setPhase] = useState<Phase>("ready");
@@ -230,7 +231,7 @@ export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
 
     setLastRound({ hits, total, errors });
     setPhase(porTempo ? "roundpause" : "roundfb");
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
     setTimeout(() => {
       if (timeUp) { setPhase("summary"); }
       else { roundRef.current++; setRound(roundRef.current); startRound(); }
@@ -313,6 +314,7 @@ export function CorridaContraOTempo({ difficulty, theme, onComplete }: Props) {
             </div>
           )}
         </div>
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         <AnimatePresence mode="wait">
           {phase === "ready" && (
diff --git a/components/exercises/processing/IdentificacaoSimbolos.tsx b/components/exercises/processing/IdentificacaoSimbolos.tsx
index b44c37ce..2ef552e1 100644
--- a/components/exercises/processing/IdentificacaoSimbolos.tsx
+++ b/components/exercises/processing/IdentificacaoSimbolos.tsx
@@ -4,7 +4,7 @@ import { useState, useRef } from "react";
 import { motion } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { shuffle } from "@/lib/utils";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
@@ -97,7 +97,7 @@ function IdentificacaoStep({ theme, onDone }: { theme: Theme; onDone: () => void
 
 export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: IdentificacaoSimbolosProps) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("identificacao-simbolos", difficulty);
 
   const [distractorCount, setDistractorCount] = useState(initialDistractors(difficulty));
   const [streak, setStreak] = useState(0);
@@ -136,7 +136,7 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
     if (newStreak <= -2) { nextDistr = Math.max(distractorCount - 2, MIN_DISTRACTORS); nextStreak = 0; }
 
     const nextTrialNum = trial + 1;
-    const timeUp = isTimeUp();
+    const timeUp = !podeIniciarNovoDesafio();
 
     setTimeout(() => {
       if (timeUp) {
@@ -187,7 +187,7 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
           </div>
         </div>
 
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Target */}
         <div className={`text-center p-4 rounded-xl mb-4 ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-50"}`}>
diff --git a/components/exercises/processing/TempoReacao.tsx b/components/exercises/processing/TempoReacao.tsx
index b9a47f61..1521ae93 100644
--- a/components/exercises/processing/TempoReacao.tsx
+++ b/components/exercises/processing/TempoReacao.tsx
@@ -3,7 +3,7 @@
 import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -31,7 +31,6 @@ interface Balloon {
   tx: number; ty: number;   // transform final (sai pelo lado oposto)
 }
 
-const SESSION_MS = 5 * 60 * 1000;   // 5 min (era 7)
 const GREEN = "#16a34a";       // o ÚNICO verde que vale
 // distratores "fáceis" (cores bem diferentes do verde)
 const DISTRACTOR_COLORS = ["#dc2626", "#2563eb", "#9333ea", "#ea580c", "#f59e0b"];
@@ -107,7 +106,9 @@ function BalloonShape({ color, size = 70 }: { color: string; size?: number }) {
 }
 
 export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(SESSION_MS);
+  const {
+    begin, atingiuTeto, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia,
+  } = useBlocoDeTreino("tempo-reacao", difficulty);
 
   const [started, setStarted] = useState(false);
   const [balloons, setBalloons] = useState<Balloon[]>([]);
@@ -134,7 +135,7 @@ export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps)
     resultsRef.current = newResults;
     setResults(newResults);
 
-    if (isTimeUp()) {
+    if (atingiuTeto() || (!podeIniciarNovoDesafio() && pendingTargetsRef.current <= 0)) {
       doneRef.current = true;
       finish();
       if (nextSpawnTimer.current) clearTimeout(nextSpawnTimer.current);
@@ -158,11 +159,11 @@ export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps)
         });
       }, 1500);
     }
-  }, [difficulty, onComplete, isTimeUp, elapsedSec, finish]);
+  }, [difficulty, onComplete, atingiuTeto, podeIniciarNovoDesafio, elapsedSec, finish]);
 
   const spawnBatch = useCallback(() => {
     if (doneRef.current) return;
-    if (isTimeUp()) return;
+    if (!podeIniciarNovoDesafio()) return;
 
     const acertos = correctCountRef.current;
     const prog = progressao(acertos);
@@ -191,7 +192,7 @@ export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps)
     ];
     pendingTargetsRef.current = numTargets;
     setBalloons(batch);
-  }, [nd, isTimeUp]);
+  }, [nd, podeIniciarNovoDesafio]);
 
   function start() {
     setStarted(true);
@@ -208,7 +209,7 @@ export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps)
   function handleBalloonClick(balloon: Balloon) {
     if (!startedRef.current || doneRef.current) return;
     if (resolvedIds.current.has(balloon.id)) return;
-    if (isTimeUp()) return;
+    if (atingiuTeto()) return;
 
     resolvedIds.current.add(balloon.id);
     setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
@@ -271,7 +272,7 @@ export function TempoReacao({ difficulty, theme, onComplete }: TempoReacaoProps)
             <p className={`text-xs ${subClass}`}>Toque apenas nos balões <span className="font-bold text-green-600">VERDES</span></p>
           </div>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* Play area */}
diff --git a/components/exercises/social/InvestigadoresSociais.tsx b/components/exercises/social/InvestigadoresSociais.tsx
index 395d7bce..c2edef6f 100644
--- a/components/exercises/social/InvestigadoresSociais.tsx
+++ b/components/exercises/social/InvestigadoresSociais.tsx
@@ -11,9 +11,10 @@
 import React, { useMemo, useRef, useState, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import type { ExerciseResult, Theme } from "@/types";
 import { AssetImage } from "@/components/assets/AssetImage";
 import { socialStyles } from "./socialTheme";
@@ -159,7 +160,7 @@ function QuestionView({ story, scene, q, theme, index, total, onAnswered }: {
 // ── Componente principal ──────────────────────────────────────────────────────
 export function InvestigadoresSociais({ difficulty, theme, onComplete }: Props) {
   const { rootBg, card, btn, pal, isG } = socialStyles(theme);
-  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress();
+  const { begin, podeIniciarNovoDesafio, elapsedSec, finish, progressPct, emTolerancia } = useBlocoDeTreino("investigadores-sociais", difficulty);
 
   const faixasDisp = useMemo(() => FAIXAS.filter((f) => storiesByFaixa(f).length > 0), []);
   const [faixa, setFaixa] = useState<FaixaEtaria>(faixasDisp[0] ?? "crianca");
@@ -216,7 +217,7 @@ export function InvestigadoresSociais({ difficulty, theme, onComplete }: Props)
     const curItems = cur ? scoredItems(cur) : [];
     if (itemIdx + 1 < curItems.length) { setItemIdx((i) => i + 1); return; }
     // fim do caso
-    if (isTimeUp() || storyIdx + 1 >= poolRef.current.length) { finishSession(); return; }
+    if (!podeIniciarNovoDesafio() || storyIdx + 1 >= poolRef.current.length) { finishSession(); return; }
     const next = poolRef.current[storyIdx + 1];
     if (next) maxNivelRef.current = Math.max(maxNivelRef.current, next.nivel);
     setStoryIdx((s) => s + 1); setItemIdx(0);
@@ -276,6 +277,7 @@ export function InvestigadoresSociais({ difficulty, theme, onComplete }: Props)
         <div className="p-5" style={card}>
           <StoryHeader story={story} theme={theme}
             right={<span className={`text-xs font-semibold ${pal.sub}`}>Caso {storyIdx + 1}/{poolRef.current.length}</span>} />
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
           <AnimatePresence mode="wait">
             <QuestionView key={`${story.id}-${item.q.id}`} story={story} scene={item.scene} q={item.q}
               theme={theme} index={itemIdx} total={items.length} onAnswered={handleAnswered} />
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/migracao-dosagem-global.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover migracao-31 ==
