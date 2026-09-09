== DIFF do lab dosagem-global (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index b5687e16..af3fa0b5 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -7,6 +7,7 @@ import dynamic from "next/dynamic";
 import { ExerciseWrapper } from "@/components/exercises/ExerciseWrapper";
 import { EXERCISE_DEFINITIONS, type ExerciseResult, type Theme } from "@/types";
 import { planExerciseSettings, planExerciseIds } from "@/lib/exercise-plan";
+import { gravarSessaoDiariaLocal, lerSessaoDiariaLocal, marcarExercicioConcluido } from "@/lib/session-storage";
 import { useToast } from "@/components/ui/use-toast";
 import { Loader2, CheckCircle2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
@@ -502,15 +503,9 @@ export default function ExercicioPage() {
           // Session tracking (Cogmed global progress)
           const planIds = planExerciseIds(activePlan.exercises);
           const total = planIds.length;
-          const today = new Date().toLocaleDateString("sv"); // YYYY-MM-DD local
-          const storageKey = `np_session_${today}`;
           try {
-            const raw = localStorage.getItem(storageKey);
-            const saved = raw ? (JSON.parse(raw) as { total: number; completed: string[] }) : null;
-            const sessionData = saved && saved.total === total ? saved : { total, completed: [] as string[] };
-            if (!raw || !saved || saved.total !== total) {
-              localStorage.setItem(storageKey, JSON.stringify(sessionData));
-            }
+            const sessionData = lerSessaoDiariaLocal(total);
+            gravarSessaoDiariaLocal(sessionData);
             setSessionTotal(total);
             setSessionCompleted(sessionData.completed.filter((id: string) => id !== exerciseId).length);
           } catch {
@@ -606,14 +601,8 @@ export default function ExercicioPage() {
 
     // Marca exercício como concluído no tracking global da sessão
     try {
-      const today = new Date().toLocaleDateString("sv");
-      const storageKey = `np_session_${today}`;
-      const raw = localStorage.getItem(storageKey);
-      const sessionData = raw ? (JSON.parse(raw) as { total: number; completed: string[] }) : { total: sessionTotal ?? 1, completed: [] as string[] };
-      if (!sessionData.completed.includes(exerciseId)) {
-        sessionData.completed.push(exerciseId);
-      }
-      localStorage.setItem(storageKey, JSON.stringify(sessionData));
+      const sessionData = lerSessaoDiariaLocal(sessionTotal ?? 1);
+      gravarSessaoDiariaLocal(marcarExercicioConcluido(sessionData, exerciseId));
     } catch { /* ignore */ }
 
     // Game On (gamificado): cada treino soma XP da Jornada. Cache otimista no
diff --git a/components/exercises/ExerciseProgressBar.tsx b/components/exercises/ExerciseProgressBar.tsx
index d4e31ebf..20b7f668 100644
--- a/components/exercises/ExerciseProgressBar.tsx
+++ b/components/exercises/ExerciseProgressBar.tsx
@@ -1,27 +1,28 @@
 "use client";
 
+import { useRef } from "react";
 import type { Theme } from "@/types";
 
 /**
  * Barra de progresso PADRÃO dos exercícios — uma só, igual em todas as telas.
  * Fina e discreta (não compete com o exercício). A cor segue o tema do paciente
  * (clínico = azul, colorido = índigo, gamificado = ciano), mantendo o mesmo formato.
- * Use sempre com o `progressPct` vindo do useTimedProgress (tempo ativo).
+ * Use sempre com `progressPct` temporal (tempo ativo).
  */
-export function ExerciseProgressBar({ progressPct, theme }: { progressPct: number; theme?: Theme }) {
+export function ExerciseProgressBar({ progressPct, theme, emTolerancia = false }: { progressPct: number; theme?: Theme; emTolerancia?: boolean }) {
+  const greatestPct = useRef(0);
+  greatestPct.current = Math.max(greatestPct.current, Math.max(0, Math.min(100, progressPct)));
   const isG = theme === "GAMIFIED";
   const isC = theme === "COLORFUL";
-  const accent = isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
+  const accent = emTolerancia
+    ? isG ? "rgba(34,211,238,0.55)" : isC ? "rgba(99,102,241,0.55)" : "rgba(59,130,246,0.55)"
+    : isG ? "#22d3ee" : isC ? "#6366f1" : "#3b82f6";
   const track = isG ? "rgba(255,255,255,0.12)" : "rgba(148,163,184,0.22)";
-  const label = isG ? "rgba(255,255,255,0.65)" : "#64748b";
   return (
-    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginBottom: 14 }}>
-      <div style={{ flex: 1, height: 6, borderRadius: 9999, background: track, overflow: "hidden" }}>
-        <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: accent, transition: "width 0.45s linear" }} />
+    <div style={{ width: "100%", marginBottom: 14 }}>
+      <div style={{ width: "100%", height: 6, borderRadius: 9999, background: track, overflow: "hidden" }}>
+        <div style={{ height: "100%", borderRadius: 9999, width: `${emTolerancia ? 100 : greatestPct.current}%`, background: accent, transition: "width 0.45s linear" }} />
       </div>
-      <span style={{ fontSize: 11, fontWeight: 700, color: label, minWidth: 30, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
-        {progressPct}%
-      </span>
     </div>
   );
 }
diff --git a/components/exercises/ExerciseWrapper.tsx b/components/exercises/ExerciseWrapper.tsx
index 3a999ac8..b3e8cff8 100644
--- a/components/exercises/ExerciseWrapper.tsx
+++ b/components/exercises/ExerciseWrapper.tsx
@@ -7,6 +7,7 @@ import { ScoreDisplay } from "@/components/gamification/ScoreDisplay";
 import { formatDuration, formatReactionTime } from "@/lib/utils";
 import { EXERCISE_FUNCTIONAL } from "@/lib/exercise-functional";
 import { completionRecordFor, tutorialRequired, type TutorialState } from "@/lib/tutorial/state";
+import { progressoDaSessao } from "@/lib/session-storage";
 import type { TutorialDefinition } from "@/lib/tutorial/types";
 import type { ExerciseResult, Theme } from "@/types";
 import { TutorialRunner } from "@/components/exercises/tutorial/TutorialRunner";
@@ -75,21 +76,15 @@ export function ExerciseWrapper({
   const [isTutorialReview, setIsTutorialReview] = useState(false);
 
   // Progresso interno do exercício atual (0-100), reportado via useExerciseProgress().
-  const [innerPct, setInnerPct] = useState(0);
+  const innerPctRef = useRef(0);
   const reportProgress = useCallback((pct: number) => {
-    setInnerPct((prev) => {
-      const next = Math.max(0, Math.min(100, pct));
-      // Monotônico: nunca recua dentro do mesmo exercício (evita "piscadas" da barra).
-      return next > prev ? next : prev;
-    });
+    const next = Math.max(0, Math.min(100, pct));
+    // Monotônico: nunca recua dentro do mesmo exercício (evita "piscadas" da barra).
+    innerPctRef.current = Math.max(innerPctRef.current, next);
   }, []);
 
-  // Barra única do dia que TAMBÉM sobe aos poucos durante o exercício atual:
-  // (exercícios concluídos + fração do exercício atual) / total do plano.
-  const sessionProgress =
-    sessionTotal && sessionTotal > 0
-      ? Math.round(((sessionCompleted + innerPct / 100) / sessionTotal) * 100)
-      : Math.round(innerPct);
+  // Progresso do dia conta somente exercícios concluídos; a dose do bloco é independente.
+  const sessionProgress = progressoDaSessao(sessionCompleted, sessionTotal);
 
   useEffect(() => {
     const onChange = () => setIsFullscreen(!!document.fullscreenElement);
@@ -356,11 +351,10 @@ export function ExerciseWrapper({
                   ? "bg-white/95 border-2 border-teal-300 backdrop-blur-sm"
                   : "bg-white/95 border border-gray-200 backdrop-blur-sm shadow-md"
               }`}>
-                <p className={`text-xs font-bold mb-1 flex items-center justify-between gap-2 ${
+                <p className={`text-xs font-bold mb-1 ${
                   theme === "GAMIFIED" ? "text-cyan-400" : theme === "COLORFUL" ? "text-teal-700" : "text-gray-800"
                 }`}>
                   <span>Progresso</span>
-                  <span className="tabular-nums">{sessionProgress}%</span>
                 </p>
                 <div className={`h-1.5 rounded-full ${theme === "GAMIFIED" ? "bg-gray-600" : "bg-gray-200"}`}>
                   <motion.div
diff --git a/components/exercises/executive/StroopTask.tsx b/components/exercises/executive/StroopTask.tsx
index 422cbeaa..4e68d7f5 100644
--- a/components/exercises/executive/StroopTask.tsx
+++ b/components/exercises/executive/StroopTask.tsx
@@ -5,6 +5,7 @@ import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
+import { stroopDosage } from "@/lib/exercise-dosage";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
 
@@ -424,20 +425,10 @@ function TutorialStep({
   );
 }
 
-// ── Duração por nível do paciente (CASO ESPECIAL do Cores e Palavras) ──────────
-// A duração da sessão cresce conforme o paciente evolui entre sessões (o difficulty
-// reflete esse progresso). beginner 4 → standard 5 → intermediate 6 → advanced 7 min.
-function stroopDurationMin(difficulty: number): number {
-  if (difficulty <= 2) return 4;  // beginner
-  if (difficulty <= 5) return 5;  // standard
-  if (difficulty <= 8) return 6;  // intermediate
-  return 7;                       // advanced
-}
-
 // ── Main exercise ─────────────────────────────────────────────────────────────
 
 export function StroopTask({ difficulty, theme, onComplete }: StroopTaskProps) {
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(stroopDurationMin(difficulty) * 60 * 1000);
+  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(stroopDosage(difficulty).targetDurationSec * 1000);
 
   const [phase, setPhase] = useState<Phase>("tutorial");
   const [tutorialStep, setTutorialStep] = useState(0);
diff --git a/components/exercises/executive/TorreHanoi.tsx b/components/exercises/executive/TorreHanoi.tsx
index 60cf1179..ef80a1e8 100644
--- a/components/exercises/executive/TorreHanoi.tsx
+++ b/components/exercises/executive/TorreHanoi.tsx
@@ -8,7 +8,9 @@ import { deveAvancarDeFase, deveSubirDeNivel, eficiencia, ofereceSegundaTentativ
 import { contarReversoes, type MovimentoTorre } from "@/lib/torres-registro";
 import { BANCO, type Problema } from "@/lib/torres/banco";
 import { dificuldadeDaFase, faseDaDificuldade, proximoProblema, type Fase } from "@/lib/torres/selecao";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
+import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
+import { registrarDesafioInterrompido } from "@/lib/exercise-block";
 import { TutorialBase } from "@/components/exercises/TutorialBase";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import type { ExerciseResult, Theme } from "@/types";
@@ -308,7 +310,10 @@ function HanoiRuleStep({ theme, onDone }: { theme: Theme; onDone: () => void })
 
 export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
   const [showTutorial, setShowTutorial] = useState(true);
-  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress(11 * 60 * 1000); // 11 min — planejamento (pedido da Kamylla)
+  const {
+    begin, elapsedSec, finish, progressPct, emTolerancia, atingiuTeto,
+    podeIniciarNovoDesafio, registroBloco,
+  } = useBlocoDeTreino("torre-hanoi", difficulty);
 
   // O problema deixa de ser gerado (torre cheia → haste 2) e passa a VIR DO BANCO pré-validado:
   // configuração inicial, alvo e mínimo (da BFS) são propriedades dele. É o que traz os tipos
@@ -326,6 +331,7 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
   const discCount = problema.discos;
   const [puzzle, setPuzzle] = useState(0);
   const [puzzleResults, setPuzzleResults] = useState<ResultadoPuzzle[]>([]);
+  const doneRef = useRef(false);
 
   // Puzzle state
   const [pegs, setPegs] = useState<State>(() => clonarEstado(problema.inicial));
@@ -440,6 +446,76 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
     setMovesThisAttempt([]);
   }
 
+  function finishGame(
+    resultados: ResultadoPuzzle[],
+    proxFase: Fase,
+    desafioInterrompido?: { id: string; interrompidoPeloFimDoBloco: true; dados: Record<string, unknown> },
+  ) {
+    if (doneRef.current) return;
+    doneRef.current = true;
+    const bloco = registroBloco(desafioInterrompido?.id ?? null);
+    finish();
+    const correctCount = resultados.filter((r) => r.correct).length;
+    const eficientes = resultados.filter((r) => deveSubirDeNivel(r.eficiencia)).length;
+    const accuracy = eficientes / Math.max(1, resultados.length);
+    const maxDiscs = resultados.length > 0 ? Math.max(...resultados.map((r) => r.discs)) : discCount;
+    const restarts = resultados.reduce((total, result) => total + result.restarts, 0);
+    const puzzlesComReinicio = resultados.filter((result) => result.restarts > 0).length;
+    const eficienciaMedia = resultados.reduce((total, result) => total + result.eficiencia, 0) / Math.max(1, resultados.length);
+    const movimentosTotais = resultados.reduce((total, result) => total + result.movimentosTotais, 0);
+    const movimentosSolucao = resultados.reduce((total, result) => total + result.movimentosSolucao, 0);
+    const invalidos = resultados.reduce((total, result) => total + result.invalidos, 0);
+    const reversoes = resultados.reduce((total, result) => total + result.reversoes, 0);
+    const latencias = resultados.map((result) => result.latenciaMs).filter((latencia): latencia is number => latencia !== null);
+    const latenciaMediaMs = latencias.length > 0
+      ? latencias.reduce((total, latencia) => total + latencia, 0) / latencias.length
+      : null;
+    const reinicios = resultados
+      .map((result, index) => ({ puzzle: index + 1, discos: result.discs, eventos: result.eventosReinicio }))
+      .filter((result) => result.eventos.length > 0);
+    const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, maxDiscs);
+    onComplete({
+      exerciseId: "torre-hanoi",
+      domain: "executive",
+      score,
+      accuracy,
+      difficulty: dificuldadeDaFase(proxFase),
+      duration: elapsedSec(),
+      metadata: {
+        puzzles: resultados.length,
+        maxDiscs,
+        correct: correctCount,
+        resolvidosComBoaEficiencia: eficientes,
+        restarts,
+        puzzlesComReinicio,
+        eficienciaMedia,
+        movimentosTotais,
+        movimentosSolucao,
+        invalidos,
+        reversoes,
+        latenciaMediaMs,
+        reinicios,
+        tiposJogados: resultados.reduce<Record<string, number>>((acc, r) => {
+          acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
+          return acc;
+        }, {}),
+        fasesJogadas: resultados.reduce<Record<string, number>>((acc, r) => {
+          acc[String(r.fase)] = (acc[String(r.fase)] ?? 0) + 1;
+          return acc;
+        }, {}),
+        segundasTentativas: segundasRef.current.length,
+        melhoraMediaMovimentos: segundasRef.current.length
+          ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda), 0) / segundasRef.current.length
+          : null,
+        melhoraMediaPercentual: segundasRef.current.length
+          ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda) / Math.max(1, r.primeira), 0) / segundasRef.current.length
+          : null,
+        bloco,
+        ...(desafioInterrompido ? { desafioInterrompido } : {}),
+      },
+    });
+  }
+
   // Botão "Continuar" da escolha. Se o tempo da sessão acabou enquanto ele decidia, a próxima
   // vitória encerra a sessão pelo caminho normal — aqui só avançamos o problema.
   function continuarAposEscolha() {
@@ -447,6 +523,10 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
     setAguardandoEscolha(false);
     if (!destino) return;
     proximoRef.current = null;
+    if (!podeIniciarNovoDesafio()) {
+      finishGame(puzzleResults, destino.fase);
+      return;
+    }
     setPuzzle(destino.puzzle);
     setFase(destino.fase);
     avancarParaProximoProblema(destino.fase);
@@ -540,92 +620,19 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
         const proxFase: Fase = avanca ? (Math.min(8, fase + 1) as Fase) : fase;
 
         const nextPuzzle = puzzle + 1;
-        const timeUp = isTimeUp();
+        const encerraAposDesafio = !podeIniciarNovoDesafio();
 
         // Fim de sessão nunca oferece segunda tentativa; solução ÓTIMA também não — não há
         // caminho mais curto para procurar. Nesse caso a tela espera só o "Continuar".
-        if (!timeUp && !isSegundaTentativa) {
+        if (!encerraAposDesafio && !isSegundaTentativa) {
           proximoRef.current = { puzzle: nextPuzzle, fase: proxFase };
           setAguardandoEscolha(true);
           return;
         }
 
         setTimeout(() => {
-          if (timeUp) {
-            finish();
-            const resultados = base;
-            const correctCount = resultados.filter((r) => r.correct).length;
-            // `accuracy` é o campo que ALIMENTA A ENGINE ADAPTATIVA (`lib/adaptive.ts:154`:
-            // ≥ 0,80 sobe de nível) e o que a terapeuta lê. Se fosse "resolvidos ÷ total", como
-            // resolver passou a ser sempre o sucesso, daria 100% em toda sessão — o exercício
-            // subiria de nível para sempre e a conquista de 100% dispararia sozinha.
-            // Então a acurácia é a proporção de puzzles resolvidos com eficiência BOA ou
-            // ADEQUADA (≤ 1,40), o mesmo critério de `deveSubirDeNivel`. Não é o mínimo exato,
-            // revogado por ela em 31/ago; é o desempenho estratégico, que discrimina.
-            // `correct` no metadata segue significando RESOLVIDOS.
-            const eficientes = resultados.filter((r) => deveSubirDeNivel(r.eficiencia)).length;
-            const accuracy = eficientes / Math.max(1, resultados.length);
-            const maxDiscs = Math.max(...resultados.map((r) => r.discs));
-            const restarts = resultados.reduce((total, result) => total + result.restarts, 0);
-            const puzzlesComReinicio = resultados.filter((result) => result.restarts > 0).length;
-            const eficienciaMedia = resultados.reduce((total, result) => total + result.eficiencia, 0) / Math.max(1, resultados.length);
-            const movimentosTotais = resultados.reduce((total, result) => total + result.movimentosTotais, 0);
-            const movimentosSolucao = resultados.reduce((total, result) => total + result.movimentosSolucao, 0);
-            const invalidos = resultados.reduce((total, result) => total + result.invalidos, 0);
-            const reversoes = resultados.reduce((total, result) => total + result.reversoes, 0);
-            const latencias = resultados
-              .map((result) => result.latenciaMs)
-              .filter((latencia): latencia is number => latencia !== null);
-            // `null` é intencional quando não há primeiro movimento válido, evitando NaN no JSON.
-            const latenciaMediaMs = latencias.length > 0
-              ? latencias.reduce((total, latencia) => total + latencia, 0) / latencias.length
-              : null;
-            const reinicios = resultados
-              .map((result, index) => ({ puzzle: index + 1, discos: result.discs, eventos: result.eventosReinicio }))
-              .filter((result) => result.eventos.length > 0);
-            const score = calculateExerciseScore("torre-hanoi", accuracy, undefined, maxDiscs);
-            onComplete({
-              exerciseId: "torre-hanoi",
-              domain: "executive",
-              score,
-              accuracy,
-              // A FASE é o que precisa sobreviver à sessão. Enviar `maxDiscs` aqui fazia o
-              // paciente REGREDIR de fase a cada retomada (bug de 01/set/2026); `maxDiscs`
-              // continua no metadata, que é onde ele é informação clínica.
-              difficulty: dificuldadeDaFase(proxFase),
-              duration: elapsedSec(),
-              metadata: {
-                puzzles: resultados.length,
-                maxDiscs,
-                correct: correctCount,
-                resolvidosComBoaEficiencia: eficientes,
-                restarts,
-                puzzlesComReinicio,
-                eficienciaMedia,
-                movimentosTotais,
-                movimentosSolucao,
-                invalidos,
-                reversoes,
-                latenciaMediaMs,
-                reinicios,
-                tiposJogados: resultados.reduce<Record<string, number>>((acc, r) => {
-                  acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
-                  return acc;
-                }, {}),
-                fasesJogadas: resultados.reduce<Record<string, number>>((acc, r) => {
-                  acc[String(r.fase)] = (acc[String(r.fase)] ?? 0) + 1;
-                  return acc;
-                }, {}),
-                segundasTentativas: segundasRef.current.length,
-                melhoraMediaMovimentos: segundasRef.current.length
-                  ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda), 0) / segundasRef.current.length
-                  : null,
-                // Registrada, NUNCA mostrada ao paciente (seção 51 dela).
-                melhoraMediaPercentual: segundasRef.current.length
-                  ? segundasRef.current.reduce((t, r) => t + (r.primeira - r.segunda) / Math.max(1, r.primeira), 0) / segundasRef.current.length
-                  : null,
-              },
-            });
+          if (!podeIniciarNovoDesafio()) {
+            finishGame(base, proxFase);
           } else {
             setPuzzle(nextPuzzle);
             setFase(proxFase);
@@ -636,6 +643,34 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
     }
   }
 
+  useEffect(() => {
+    if (showTutorial || !atingiuTeto() || doneRef.current) return;
+    if (won) {
+      finishGame(puzzleResults, proximoRef.current?.fase ?? fase);
+      return;
+    }
+    finishGame(puzzleResults, fase, registrarDesafioInterrompido(problema.id, {
+      problemaId: problema.id,
+      tipo: problema.tipo,
+      fase: problema.fase,
+      configuracaoInicial: problema.inicial.map((peg) => [...peg]),
+      objetivo: problema.alvo.map((peg) => [...peg]),
+      estadoAtual: pegs.map((peg) => [...peg]),
+      movimentos: moves,
+      movimentosAntesDeReinicios: movesBeforeRestarts,
+      movimentosDestaTentativa: [...movesThisAttempt],
+      reinicios: restartsThisPuzzle,
+      eventosReinicio: [...restartEvents],
+      movimentosInvalidos: invalidMoves,
+      reversoesAntesDeReinicios: reversoesBeforeRestarts,
+      segundaTentativa: isSegundaTentativa,
+      movimentosPrimeiraTentativa: movimentosPrimeira,
+      mostrandoObjetivo,
+    }));
+  // A identidade de atingiuTeto muda a cada tick e traz o estado temporal atual.
+  // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [atingiuTeto]);
+
   // Tela de cada problema (seção 45): o enunciado, o objetivo em miniatura e COMEÇAR. Ela existe
   // porque com configuração inicial e alvo variáveis o paciente PRECISA analisar a situação antes
   // de agir — é o "observe o problema antes de começar" da instrução dela (seção 21).
@@ -647,6 +682,11 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
           <h2 className="font-bold tracking-tight" style={{ color: "#0F172A", fontSize: 20 }}>
             Organize os discos conforme o objetivo.
           </h2>
+          {/* 09/set/2026: esta barra é apenas temporal; não conhece discos, movimentos,
+              mínimo, eficiência nem reinícios. A barra de solução removida não voltou. */}
+          <div className="mt-4">
+            <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
+          </div>
 
           {/* Os dois estados visuais, com PESOS DIFERENTES — hierarquia pedida por ela em
               01/set/2026 vendo a tela: "manter a Configuração Inicial em destaque principal;
@@ -680,8 +720,6 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
     return <TorreHanoiTutorial theme={theme} onDone={() => { begin(); setShowTutorial(false); setMostrandoObjetivo(true); }} />;
   }
 
-  // Progresso VISUAL do jogo: quantos discos já chegaram ao destino.
-
   // Larguras progressivas (disco 1 mais estreito, disco N mais largo), escaladas
   // pela largura da torre pra caber em qualquer tela sem cortar.
   const MAXW = Math.min(168, slotW * 0.88);
@@ -726,6 +764,11 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
           </button>
         </div>
 
+        {/* 09/set/2026: barra temporal, independente de qualquer estado da solução. */}
+        <div className="mt-4">
+          <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
+        </div>
+
         {!won && (() => { const reiniciarBloqueado = moves === 0; return (
           <div className="mt-3 flex justify-end">
             <button
@@ -744,10 +787,11 @@ export function TorreHanoi({ difficulty, theme, onComplete }: TorreHanoiProps) {
           </div>
         ); })()}
 
-        {/* A barra de progresso do jogo SAIU em 01/set/2026, vendo a tela com ela. Ela contava
+        {/* A barra de progresso da SOLUÇÃO SAIU em 01/set/2026, vendo a tela com ela. Ela contava
             discos já na posição do alvo — e como o alvo pode ser qualquer haste, os discos entram
             e saem dela o tempo todo: a barra subia e descia sem querer dizer nada. Além disso era
-            um placar, e placar durante a execução é justamente o que ela mandou tirar. */}
+            um placar, e placar durante a execução é justamente o que ela mandou tirar. Continua
+            inexistente; a barra acima é exclusivamente temporal. */}
 
         {/* Ampliação temporária do objetivo. Nunca é a ÚNICA forma de ver o alvo — a miniatura
             do canto continua ali. Isto é conforto de leitura, não um recurso a ser gerenciado. */}
diff --git a/components/exercises/memory/CuboCorsi.tsx b/components/exercises/memory/CuboCorsi.tsx
index 12163776..49c07127 100644
--- a/components/exercises/memory/CuboCorsi.tsx
+++ b/components/exercises/memory/CuboCorsi.tsx
@@ -2,10 +2,11 @@
 
 import { useState, useRef, useCallback, useEffect } from "react";
 import { calculateExerciseScore } from "@/lib/scoring";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { classifyTrial, nextLevelPerTrial } from "@/lib/adaptive-trial";
+import { registrarDesafioInterrompido } from "@/lib/exercise-block";
 import type { ExerciseResult, Theme } from "@/types";
 
 // ── Cubo 2×2×2 em CSS 3D real ──────────────────────────────
@@ -226,7 +227,6 @@ const sndWrong   = () => beep(180, 300, 0.05);
 // ── Sequência / timing ────────────────────────────────────────────────────────
 // Engine padrão: a sessão dura ~7 min (faixa 6-8) e a barra avança pelo TEMPO
 // decorrido (0→100%). A dificuldade sobe +1 a cada 2 acertos SEGUIDOS.
-const TARGET_MS  = 7 * 60 * 1000;  // duração-alvo da sessão
 const MAX_ROUNDS = 80;             // trava de segurança (normalmente não atingida)
 const N_TILES    = CUBO_CORSI_CELL_COUNT;
 
@@ -252,9 +252,11 @@ function randSeq(len: number): number[] {
 interface Props { difficulty: number; theme: Theme; onComplete: (r: ExerciseResult) => void; }
 type Phase = "watch" | "input" | "result" | "between";
 
-export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
-  // Barra por TEMPO ATIVO (pausa quando o paciente não interage) — hook padrão.
-  const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress(TARGET_MS);
+export function CuboCorsi({ difficulty, theme, onComplete }: Props) {
+  const {
+    begin, elapsedSec, finish, progressPct, emTolerancia, atingiuTeto,
+    podeIniciarNovoDesafio, registroBloco,
+  } = useBlocoDeTreino("cubo-corsi", difficulty);
 
   const [phase, setPhase]      = useState<Phase>("watch");
   const [round, setRound]      = useState(0);
@@ -270,6 +272,7 @@ export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
   const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
   const rtsRef        = useRef<number[]>([]);
   const inputStartRef = useRef(0);
+  const doneRef       = useRef(false);
 
   // Dificuldade adaptativa intra-sessão — motor POR TENTATIVA (épico Cogmed):
   // correta → +1 já na próxima; erro leve (só o último toque errado ou troca de
@@ -322,6 +325,29 @@ export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
     } catch { /* cancelado */ }
   }, [sleep]);
 
+  const finishGame = useCallback((rounds: number, desafioInterrompido?: ReturnType<typeof registrarDesafioInterrompido>) => {
+    if (doneRef.current) return;
+    doneRef.current = true;
+    clearAll();
+    const bloco = registroBloco(desafioInterrompido?.id ?? null);
+    finish();
+    const avgRt = rtsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, rtsRef.current.length);
+    const fc = correctRef.current, fe = errorsRef.current;
+    const acc = fc / Math.max(1, fc + fe);
+    const reached = maxDiffRef.current;
+    const score = calculateExerciseScore("cubo-corsi", acc, avgRt, reached);
+    onComplete({
+      exerciseId: "cubo-corsi", domain: "memory",
+      score, accuracy: acc, reactionTime: avgRt, difficulty: reached, duration: elapsedSec(),
+      metadata: {
+        correct: fc, errors: fe, rounds, reachedDifficulty: reached, bloco,
+        ...(desafioInterrompido ? { desafioInterrompido } : {}),
+      },
+    });
+  // clearAll só opera refs estáveis.
+  // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [elapsedSec, finish, onComplete, registroBloco]);
+
   const evaluateSequence = useCallback((userInput: number[], seq: number[], r: number) => {
     const verdict = classifyTrial(seq, userInput);
     const allOk = verdict === "correta";
@@ -352,27 +378,16 @@ export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
 
     const t = setTimeout(() => {
       setTS(Array(N_TILES).fill("idle"));
-      // Termina quando atinge a duração-alvo de TEMPO ATIVO (~7 min) — não por nº fixo de rodadas.
-      if (isTimeUp() || nr >= MAX_ROUNDS) {
-        finish();
-        const avgRt = rtsRef.current.reduce((a, b) => a + b, 0) / Math.max(1, rtsRef.current.length);
-        const fc = correctRef.current, fe = errorsRef.current;
-        const acc = fc / Math.max(1, fc + fe);
-        const dur = elapsedSec();
-        const reached = maxDiffRef.current;
-        const score = calculateExerciseScore("cubo-corsi", acc, avgRt, reached);
-        onComplete({
-          exerciseId: "cubo-corsi", domain: "memory",
-          score, accuracy: acc, reactionTime: avgRt, difficulty: reached, duration: dur,
-          metadata: { correct: fc, errors: fe, rounds: nr, reachedDifficulty: reached },
-        });
+      // Termina quando atinge a duração-alvo de TEMPO ATIVO (8 min) — não por nº fixo de rodadas.
+      if (!podeIniciarNovoDesafio() || nr >= MAX_ROUNDS) {
+        finishGame(nr);
         return;
       }
       setPhase("between");
       timersRef.current.push(setTimeout(() => startRound(nr), 500));
     }, 1800);
     timersRef.current.push(t);
-  }, [isTimeUp, finish, elapsedSec, onComplete, startRound]);
+  }, [finishGame, podeIniciarNovoDesafio, startRound]);
 
   const handleTileTap = useCallback((idx: number) => {
     if (phase !== "input") return;
@@ -392,9 +407,24 @@ export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
     }
   }, [phase, inputSoFar, sequence, round, evaluateSequence]);
 
+  useEffect(() => {
+    if (!atingiuTeto() || doneRef.current) return;
+    if (phase === "result" || phase === "between") {
+      finishGame(round + 1);
+      return;
+    }
+    finishGame(round, registrarDesafioInterrompido(`rodada-${round + 1}`, {
+      phase,
+      sequence: [...sequence],
+      inputSoFar: [...inputSoFar],
+      difficulty: curDiffRef.current,
+    }));
+  }, [atingiuTeto, finishGame, inputSoFar, phase, round, sequence]);
+
   useEffect(() => {
     begin();
-    void startRound(0);
+    if (podeIniciarNovoDesafio()) void startRound(0);
+    else finishGame(0);
     return () => clearAll();
   // O treino começa ao ser montado pelo ExerciseWrapper, após o tutorial compartilhado.
   // eslint-disable-next-line react-hooks/exhaustive-deps
@@ -421,7 +451,7 @@ export function CuboCorsi({ difficulty, theme: _theme, onComplete }: Props) {
       <div style={{ padding: "18px 14px 32px" }}>
 
         {/* Barra de progresso (tempo ativo) */}
-        <ExerciseProgressBar progressPct={progressPct} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
 
         {/* Label */}
         <p style={{
diff --git a/components/exercises/processing/Semaforo.tsx b/components/exercises/processing/Semaforo.tsx
index 026e73dd..f9f9854e 100644
--- a/components/exercises/processing/Semaforo.tsx
+++ b/components/exercises/processing/Semaforo.tsx
@@ -4,9 +4,10 @@ import { useState, useRef, useCallback, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { judgeSemaforo, type SemaforoResponse } from "@/lib/semaforo";
-import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
+import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
+import { registrarDesafioInterrompido } from "@/lib/exercise-block";
 import type { ExerciseResult, Theme } from "@/types";
 
 interface SemaforoProps {
@@ -119,10 +120,11 @@ interface TrialResult {
   omitted: boolean;
 }
 
-const SESSION_MS = 5 * 60 * 1000;   // 5 min (era 7)
-
 export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
-  const { begin, isTimeUp, elapsedSec, finish: finishProgress, progressPct } = useTimedProgress(SESSION_MS);
+  const {
+    begin, elapsedSec, finish: finishProgress, progressPct, emTolerancia,
+    atingiuTeto, podeIniciarNovoDesafio, registroBloco,
+  } = useBlocoDeTreino("semaforo", difficulty);
 
   const [started, setStarted] = useState(false);
   const [phase, setPhase] = useState<Phase>("idle");
@@ -156,9 +158,13 @@ export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
 
   // ─── Finish game ──────────────────────────────────────────────────────────
   const finishGame = useCallback(
-    (finalResults: TrialResult[]) => {
+    (finalResults: TrialResult[], desafioInterrompido?: ReturnType<typeof registrarDesafioInterrompido>) => {
       if (doneRef.current) return;
       doneRef.current = true;
+      [blinkTimer, activeTimer, feedbackTimer].forEach((timer) => {
+        if (timer.current) clearTimeout(timer.current);
+      });
+      const bloco = registroBloco(desafioInterrompido?.id ?? null);
       finishProgress();
 
       const hits = finalResults.filter((r) => r.correct && r.rt !== null);
@@ -184,11 +190,13 @@ export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
             avgRT,
             correct: hits.length,
             omissions: finalResults.filter((r) => r.omitted).length,
+            bloco,
+            ...(desafioInterrompido ? { desafioInterrompido } : {}),
           },
         });
       }, 1200);
     },
-    [difficulty, onComplete, elapsedSec, finishProgress]
+    [difficulty, onComplete, elapsedSec, finishProgress, registroBloco]
   );
 
   // ─── Start a new round ────────────────────────────────────────────────────
@@ -243,16 +251,30 @@ export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
       if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
       feedbackTimer.current = setTimeout(() => {
         setFeedback(null);
-        if (isTimeUp()) {
+        if (!podeIniciarNovoDesafio()) {
           finishGame(newResults);
         } else {
           startRound();
         }
       }, 500);
     },
-    [finishGame, startRound, isTimeUp]
+    [finishGame, startRound, podeIniciarNovoDesafio]
   );
 
+  useEffect(() => {
+    if (!atingiuTeto() || doneRef.current) return;
+    if (phase === "feedback" || phase === "idle") {
+      finishGame(resultsRef.current);
+      return;
+    }
+    const id = `rodada-${Math.max(1, roundCountRef.current)}`;
+    finishGame(resultsRef.current, registrarDesafioInterrompido(id, {
+      fase: phase,
+      rodada: round,
+      respondeu: respondedRef.current,
+    }));
+  }, [atingiuTeto, finishGame, phase, round]);
+
   function onPressAdvance() {
     if (phase !== "active" || respondedRef.current || !round) return;
     respondedRef.current = true;
@@ -323,7 +345,7 @@ export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
             </p>
           </div>
         </div>
-        <ExerciseProgressBar progressPct={progressPct} theme={theme} />
+        <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
       {/* Play area */}
diff --git a/components/exercises/useExerciseEngine.ts b/components/exercises/useExerciseEngine.ts
index a69c4821..5cd310d9 100644
--- a/components/exercises/useExerciseEngine.ts
+++ b/components/exercises/useExerciseEngine.ts
@@ -1,7 +1,20 @@
 "use client";
 
-import { useRef, useState, useEffect, useCallback } from "react";
+import { useRef, useState, useEffect, useCallback, useMemo } from "react";
 import { useExerciseProgress } from "@/components/exercises/ExerciseWrapper";
+import { resolveExerciseDosage } from "@/lib/exercise-dosage";
+import {
+  avancarTempoAtivo,
+  blocoAtingiuTeto,
+  blocoEmTolerancia,
+  blocoPodeIniciarNovoDesafio,
+  comecarBloco,
+  criarEstadoBloco,
+  criarRegistroBloco,
+  progressoTemporalPct,
+  registrarAtividadeBloco,
+} from "@/lib/exercise-block";
+import { gravarDosePersistidaLocal, lerDosePersistidaLocal, limparDosePersistidaLocal } from "@/lib/session-storage";
 
 // ── Engine de progressão padrão dos exercícios ────────────────────────────────
 // Decisões da Kamylla:
@@ -77,3 +90,83 @@ export function useTimedProgress(targetMs: number = DEFAULT_TARGET_MS) {
 
   return { begin, isTimeUp, elapsedSec, finish, progressPct };
 }
+
+/** Bloco temporal configurável. Não substitui useTimedProgress nos exercícios não migrados. */
+export function useBlocoDeTreino(exerciseId: string, difficulty = 1) {
+  const markProgress = useExerciseProgress();
+  const dosage = useMemo(() => resolveExerciseDosage(exerciseId, difficulty), [exerciseId, difficulty]);
+  const stateRef = useRef<ReturnType<typeof criarEstadoBloco> | null>(null);
+  if (stateRef.current === null) {
+    const restored = lerDosePersistidaLocal(exerciseId);
+    stateRef.current = criarEstadoBloco(restored);
+  }
+  const [activeMs, setActiveMs] = useState(stateRef.current.activeMs);
+  const [progressPct, setProgressPct] = useState(
+    progressoTemporalPct(stateRef.current.activeMs, dosage.targetDurationSec * 1000),
+  );
+
+  useEffect(() => {
+    const onActivity = () => {
+      stateRef.current = registrarAtividadeBloco(stateRef.current!, Date.now());
+    };
+    window.addEventListener("pointerdown", onActivity, { passive: true });
+    window.addEventListener("keydown", onActivity);
+    return () => {
+      window.removeEventListener("pointerdown", onActivity);
+      window.removeEventListener("keydown", onActivity);
+    };
+  }, []);
+
+  useEffect(() => {
+    const id = setInterval(() => {
+      const next = avancarTempoAtivo(stateRef.current!, Date.now(), dosage.maxDurationSec * 1000);
+      stateRef.current = next;
+      if (!next.started || next.finished) return;
+      const pct = progressoTemporalPct(next.activeMs, dosage.targetDurationSec * 1000);
+      setActiveMs(next.activeMs);
+      setProgressPct(pct);
+      markProgress(pct);
+      gravarDosePersistidaLocal(exerciseId, next.activeMs);
+    }, 400);
+    return () => clearInterval(id);
+  }, [dosage.maxDurationSec, dosage.targetDurationSec, exerciseId, markProgress]);
+
+  const begin = useCallback(() => {
+    stateRef.current = comecarBloco(stateRef.current!, Date.now());
+  }, []);
+  const emTolerancia = useCallback(
+    () => blocoEmTolerancia(activeMs, dosage),
+    [activeMs, dosage],
+  );
+  const atingiuTeto = useCallback(
+    () => blocoAtingiuTeto(activeMs, dosage),
+    [activeMs, dosage],
+  );
+  const podeIniciarNovoDesafio = useCallback(
+    () => blocoPodeIniciarNovoDesafio(stateRef.current!.activeMs, dosage),
+    [dosage],
+  );
+  const elapsedSec = useCallback(() => Math.round(stateRef.current!.activeMs / 1000), []);
+  const finish = useCallback(() => {
+    stateRef.current = { ...stateRef.current!, finished: true };
+    limparDosePersistidaLocal(exerciseId);
+  }, [exerciseId]);
+  const registroBloco = useCallback(
+    (desafioInterrompidoId: string | null = null) =>
+      criarRegistroBloco(exerciseId, stateRef.current!, dosage, desafioInterrompidoId),
+    [dosage, exerciseId],
+  );
+
+  return {
+    begin,
+    progressPct,
+    emTolerancia,
+    atingiuTeto,
+    podeIniciarNovoDesafio,
+    elapsedSec,
+    finish,
+    registroBloco,
+    targetDurationSec: dosage.targetDurationSec,
+    maxDurationSec: dosage.maxDurationSec,
+  };
+}
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/exercise-block.ts
?? lib/exercise-dosage.test.ts
?? lib/exercise-dosage.ts
?? lib/session-storage.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover dosagem-global ==
