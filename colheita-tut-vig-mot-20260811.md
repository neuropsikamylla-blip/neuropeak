== DIFF do lab tut-vig-mot (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index 461b6c0b..2385f3bd 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -38,13 +38,13 @@ import {
 import {
   certoOuErradoTutorial,
   dualTaskTutorial,
-  motTutorial,
   nbackTutorial,
   semaforoTutorial,
   tempoReacaoTutorial,
-  vigilanciaTutorial,
 } from "@/lib/tutorial/definitions/estimulo-continuo";
 import { focusAgentsTutorial } from "@/lib/tutorial/definitions/focus-agents";
+import { motTutorial } from "@/lib/tutorial/definitions/mot";
+import { vigilanciaTutorial } from "@/lib/tutorial/definitions/vigilancia";
 import type { TutorialDefinition } from "@/lib/tutorial/types";
 import type { TutorialState } from "@/lib/tutorial/state";
 
diff --git a/components/exercises/attention/MOT.tsx b/components/exercises/attention/MOT.tsx
index 21ffda7d..103e8fff 100644
--- a/components/exercises/attention/MOT.tsx
+++ b/components/exercises/attention/MOT.tsx
@@ -5,6 +5,15 @@ import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
 import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar";
+import { MOTBall } from "@/components/exercises/attention/MOTBall";
+import {
+  ASPECT,
+  randomBalls,
+  stepAll,
+  targetsForLevel,
+  trackDuration,
+  type Ball,
+} from "@/lib/mot/scene";
 import type { ExerciseResult, Theme } from "@/types";
 
 interface MOTProps {
@@ -17,105 +26,14 @@ interface MOTProps {
 // A cada 3 rodadas PERFEITAS seguidas sobe 1 nível. Alterna: +1 alvo, +velocidade,
 // +1 alvo, +velocidade... (começa com 2 alvos). Velocidade sobe suave (nada absurdo).
 
-const BALL_RADIUS = 22;  // bolas um pouco menores → mais espaço LIVRE entre elas (não ficam "juntinhas")
 const MAX_W = 1440;      // arena GRANDE no desktop; adapta ao espaço no tablet/celular
-const ASPECT = 0.66;     // altura = largura × 0.66 (arena ampla — bolas se espalham em 2D)
 const RESERVED_H = 150;  // altura reservada p/ header + rótulo + botão; o resto vira arena (era 240 — desperdiçava altura)
 const PAD_X = 72;        // padding lateral acumulado (wrapper + container) descontado da largura da janela
-const MAX_TARGETS = 6;
 // A arena usa COORDENADAS REAIS em px (medidas da tela), sem escala CSS — assim o
 // clamp da física é exatamente a borda visível e a bola nunca ultrapassa o quadro.
 
-function targetsForLevel(level: number): number {
-  return Math.min(MAX_TARGETS, 2 + Math.ceil(level / 2)); // +1 alvo nos níveis ímpares
-}
-function speedStepForLevel(level: number): number {
-  return Math.floor(level / 2);                             // +velocidade nos níveis pares
-}
-function ballSpeed(level: number): number {
-  return Math.min(3.0, 1.25 + speedStepForLevel(level) * 0.28); // px/frame, incremento gentil
-}
-function totalBalls(level: number): number {
-  const k = targetsForLevel(level);
-  return k + Math.min(6, k + 2); // distratores moderados (não lota o quadro)
-}
-function trackDuration(level: number): number {
-  return 3500 + Math.min(1800, level * 140); // acompanha um pouco mais a cada nível
-}
-
-interface Ball {
-  id: number;
-  x: number;
-  y: number;
-  vx: number;
-  vy: number;
-  isTarget: boolean;
-}
-
 type Phase = "memorize" | "track" | "identify";
 
-function randomBalls(level: number, round: number, W: number, H: number): Ball[] {
-  const n = totalBalls(level);
-  const k = targetsForLevel(level);
-  const speed = ballSpeed(level);
-  const R = BALL_RADIUS;
-  const balls: Ball[] = [];
-  const pos: { x: number; y: number }[] = [];
-
-  for (let i = 0; i < n; i++) {
-    let x = R, y = R, ok = false, tries = 0;
-    do {
-      x = R + Math.random() * (W - 2 * R);
-      y = R + Math.random() * (H - 2 * R);
-      ok = pos.every(p => Math.hypot(p.x - x, p.y - y) >= Math.max(R * 3, 78)); // nascem bem separadas, nunca coladas
-      tries++;
-    } while (!ok && tries < 300);
-    pos.push({ x, y });
-
-    const angle = Math.random() * Math.PI * 2;
-    const s = (0.8 + Math.random() * 0.4) * speed;
-    void round;
-    balls.push({ id: i, x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, isTarget: i < k });
-  }
-  return balls;
-}
-
-// Um passo da física para TODAS as bolas: rebate nas paredes (nunca cortam a
-// borda) E colide entre si (nunca param uma atrás/em cima da outra).
-function stepAll(balls: Ball[], W: number, H: number): Ball[] {
-  const R = BALL_RADIUS;
-  const bs = balls.map(b => {
-    let x = b.x + b.vx, y = b.y + b.vy, vx = b.vx, vy = b.vy;
-    if (x - R < 0)     { x = R;     vx = Math.abs(vx); }
-    if (x + R > W)     { x = W - R; vx = -Math.abs(vx); }
-    if (y - R < 0)     { y = R;     vy = Math.abs(vy); }
-    if (y + R > H)     { y = H - R; vy = -Math.abs(vy); }
-    return { ...b, x, y, vx, vy };
-  });
-  // colisão bola-a-bola (separa + troca elástica de velocidade, massas iguais)
-  for (let i = 0; i < bs.length; i++) {
-    for (let j = i + 1; j < bs.length; j++) {
-      const a = bs[i], c = bs[j];
-      const dx = c.x - a.x, dy = c.y - a.y;
-      const dist = Math.hypot(dx, dy) || 0.001;
-      const minD = 2 * R;
-      if (dist < minD) {
-        const nx = dx / dist, ny = dy / dist;
-        const push = (minD - dist) / 2 + 0.5;
-        a.x -= nx * push; a.y -= ny * push;
-        c.x += nx * push; c.y += ny * push;
-        const va = a.vx * nx + a.vy * ny, vc = c.vx * nx + c.vy * ny;
-        const dv = vc - va;
-        a.vx += dv * nx; a.vy += dv * ny;
-        c.vx -= dv * nx; c.vy -= dv * ny;
-        a.x = Math.max(R, Math.min(W - R, a.x)); a.y = Math.max(R, Math.min(H - R, a.y));
-        c.x = Math.max(R, Math.min(W - R, c.x)); c.y = Math.max(R, Math.min(H - R, c.y));
-      }
-    }
-  }
-  return bs;
-}
-
 // ── Main component ─────────────────────────────────────────────────────────
 
 export function MOT({ difficulty, theme, onComplete }: MOTProps) {
@@ -359,41 +277,22 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
         <div ref={stageWrapRef} className="w-full flex justify-center">
         <div className={`relative rounded-2xl overflow-hidden ${pal.area}`}
           style={{ width: dims.w, height: dims.h }}>
-          {balls.map(ball => {
-            const isSelected = selected.has(ball.id);
-            const showGold = phase === "memorize" && ball.isTarget;
-            const showReveal = phase === "identify" && roundScore !== null && ball.isTarget;
-
-            return (
-              <div key={ball.id}
+          {balls.map(ball => (
+              <MOTBall key={ball.id}
                 ref={node => {
                   if (node) ballNodes.current.set(ball.id, node);
                   else ballNodes.current.delete(ball.id);
                 }}
-                style={{
-                  position: "absolute",
-                  // clamp defensivo: mesmo se a arena mudar de tamanho, a base nunca sai do quadro
-                  left: Math.min(Math.max(0, ball.x - BALL_RADIUS), dims.w - BALL_RADIUS * 2),
-                  top: Math.min(Math.max(0, ball.y - BALL_RADIUS), dims.h - BALL_RADIUS * 2),
-                  width: BALL_RADIUS * 2,
-                  height: BALL_RADIUS * 2,
-                  // Durante "track" o transform e controlado pelo rAF (omitido
-                  // aqui para o React nao sobrescrever). Nas demais fases a base
-                  // left/top ja e a posicao real, entao zeramos o transform.
-                  ...(phase === "track" ? {} : { transform: "translate(0px, 0px)" }),
-                  transition: phase === "identify" ? "none" : undefined,
-                }}
-                className={`rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer select-none ${
-                  showReveal ? "bg-green-400 border-green-600" :
-                  showGold ? "bg-yellow-400 border-yellow-300 animate-pulse" :
-                  isSelected ? "bg-blue-400 border-blue-600" :
-                  theme === "GAMIFIED" ? "bg-gray-400 border-gray-500" : "bg-gray-300 border-gray-400"
-                }`}
-                onClick={() => handleBallTap(ball.id)}>
-                {isSelected && phase === "identify" ? "✓" : ""}
-              </div>
-            );
-          })}
+                ball={ball}
+                phase={phase}
+                selected={selected.has(ball.id)}
+                revealTarget={phase === "identify" && roundScore !== null && ball.isTarget}
+                gamified={theme === "GAMIFIED"}
+                arenaWidth={dims.w}
+                arenaHeight={dims.h}
+                onClick={() => handleBallTap(ball.id)}
+              />
+          ))}
         </div>
         </div>
 
diff --git a/components/exercises/attention/Vigilancia.tsx b/components/exercises/attention/Vigilancia.tsx
index 44bff4ad..28f96cc0 100644
--- a/components/exercises/attention/Vigilancia.tsx
+++ b/components/exercises/attention/Vigilancia.tsx
@@ -17,6 +17,7 @@ import type { ExerciseResult, Theme } from "@/types";
 import {
   tempoDoDegrau, gerarCentros, classificarToque, gerarSequenciaPosicoes,
   adaptar, estadoInicial, avaliarBloco, BLOCO_TENTATIVAS, POSICOES,
+  DEGRAU_CONFORTAVEL,
   type AdaptState, type Arranjo, type Tolerancia, type Ponto, type Classificacao,
 } from "@/lib/vigilancia";
 import { NIVEIS, parById, fundoById, imgPipa, imgFundo, TODAS_IMAGENS, type Par } from "@/lib/vigilancia-dados";
@@ -26,8 +27,6 @@ interface Props { difficulty: number; theme: Theme; onComplete: (result: Exercis
 const rnd = (a: number, b: number) => a + Math.random() * (b - a);
 const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
 const nivelDe = (d: number) => Math.max(1, Math.min(NIVEIS.length, Math.round(d)));
-const DEGRAU_CONFORTAVEL = 4; // 1100 ms
-
 type Fase = "fixacao" | "exposicao" | "resposta" | "feedback";
 interface Kite { pos: number; isAlvo: boolean }
 
diff --git a/lib/tutorial/definitions/estimulo-continuo.tsx b/lib/tutorial/definitions/estimulo-continuo.tsx
index d765def1..e600d344 100644
--- a/lib/tutorial/definitions/estimulo-continuo.tsx
+++ b/lib/tutorial/definitions/estimulo-continuo.tsx
@@ -279,46 +279,6 @@ function SemaforoBoard({ stimulus, interactive, pressed, hitIds, onAction }: Pai
   );
 }
 
-interface PipaStimulus extends EstimuloBase {
-  targetPosition: number | null;
-}
-
-function Pipa({ different }: { different: boolean }) {
-  return (
-    <span className="relative block h-16 w-12">
-      <span
-        className={`absolute left-2 top-2 h-9 w-9 rotate-45 border-2 ${
-          different ? "border-indigo-700 bg-indigo-300" : "border-sky-700 bg-sky-300"
-        }`}
-      />
-      <span className="absolute bottom-0 left-6 h-5 w-px rotate-12 bg-slate-500" />
-    </span>
-  );
-}
-
-function VigilanciaBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<PipaStimulus>) {
-  return (
-    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
-      <div className="mb-3 grid grid-cols-3 gap-3">
-        {[0, 1, 2].map((position) => (
-          <button
-            key={position}
-            data-action={position === stimulus.targetPosition ? "kite" : undefined}
-            type="button"
-            onClick={() => interactive && onAction(position === stimulus.targetPosition ? "kite" : "other")}
-            className={`flex min-h-24 items-center justify-center rounded-xl border bg-white ${pressed && position === stimulus.targetPosition ? "scale-95" : ""}`}
-          >
-            <Pipa different={position === stimulus.targetPosition} />
-          </button>
-        ))}
-      </div>
-      <div className="h-6 text-center text-xs font-bold text-emerald-700">
-        {hitIds.has(stimulus.id) ? "Alvo encontrado" : ""}
-      </div>
-    </div>
-  );
-}
-
 interface BalloonStimulus extends EstimuloBase {
   color: "green" | "red";
 }
@@ -419,56 +379,6 @@ function DualTaskBoard({ stimulus, interactive, pressed, hitIds, onAction }: Pai
   );
 }
 
-interface MotStimulus extends EstimuloBase {
-  stage: "memorize" | "track" | "identify";
-  action: string;
-  focusBall: number | null;
-}
-
-const MOT_BALLS = [
-  { id: 0, target: true, start: [12, 18], end: [62, 58] },
-  { id: 1, target: true, start: [68, 16], end: [22, 62] },
-  { id: 2, target: false, start: [18, 64], end: [70, 20] },
-  { id: 3, target: false, start: [70, 65], end: [42, 14] },
-] as const;
-
-function MotBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<MotStimulus>) {
-  return (
-    <div>
-      <div className="mb-2 text-center text-xs font-medium text-slate-600">
-        {stimulus.stage === "memorize" ? "Observe os alvos claros." : stimulus.stage === "track" ? "Acompanhe o movimento." : "Selecione os alvos."}
-      </div>
-      <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50">
-        {MOT_BALLS.map((ball) => {
-          const position = stimulus.stage === "memorize" ? ball.start : ball.end;
-          const action = `ball-${ball.id}`;
-          const selected = [...hitIds].some((id) => id.endsWith(action));
-          return (
-            <button
-              key={ball.id}
-              data-action={action}
-              type="button"
-              onClick={() => interactive && onAction(action)}
-              className={`absolute flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
-                stimulus.stage === "memorize" && ball.target
-                  ? "border-amber-500 bg-amber-300"
-                  : selected ? "border-emerald-600 bg-emerald-300" : "border-slate-500 bg-slate-300"
-              } ${pressed && stimulus.action === action ? "scale-90" : ""}`}
-              style={{
-                left: `${position[0]}%`,
-                top: `${position[1]}%`,
-                transitionDuration: `${RITMO_TUTORIAL_APROVADO.stimulusOnMs}ms`,
-              }}
-            >
-              {selected ? "OK" : ""}
-            </button>
-          );
-        })}
-      </div>
-    </div>
-  );
-}
-
 interface CertoErradoStimulus extends EstimuloBase {
   statement: string;
   answer: "certo" | "errado";
@@ -500,7 +410,6 @@ function CertoOuErradoBoard({ stimulus, interactive, pressed, hitIds, onAction }
 
 const ONE_RESPONSE = 1;
 const TWO_TASK_RESPONSES = 2;
-const MOT_MINIMUM_TARGETS = MOT_BALLS.filter((ball) => ball.target).length;
 
 const semaforoDemo: readonly SemaforoStimulus[] = [
   { id: "semaforo-red", color: "red", isTarget: false },
@@ -535,25 +444,6 @@ export const semaforoTutorial = criarTutorialEstimuloContinuo<SemaforoStimulus>(
   targetSelectorFor: () => '[data-action="advance"]',
 });
 
-const vigilanciaDemo: readonly PipaStimulus[] = [
-  { id: "vigilancia-common", targetPosition: null, isTarget: false },
-  { id: "vigilancia-target", targetPosition: 1, isTarget: true },
-];
-
-export const vigilanciaTutorial = criarTutorialEstimuloContinuo<PipaStimulus>({
-  exerciseId: "vigilancia",
-  version: 2,
-  modo: "continua",
-  guidedInstruction: "Clique quando a pipa alvo aparecer.",
-  retryHint: "Espere a pipa diferente aparecer e clique nela.",
-  smallestValidUnit: ONE_RESPONSE,
-  demonstrationStimuli: vigilanciaDemo,
-  guidedStimuli: vigilanciaDemo,
-  Board: VigilanciaBoard,
-  expectedActionFor: () => "kite",
-  targetSelectorFor: () => '[data-action="kite"]',
-});
-
 const tempoReacaoDemo: readonly BalloonStimulus[] = [
   { id: "balloon-red", color: "red", isTarget: false },
   { id: "balloon-green", color: "green", isTarget: true },
@@ -620,28 +510,6 @@ export const dualTaskTutorial = criarTutorialEstimuloContinuo<DualStimulus>({
   targetSelectorFor: (stimulus) => `[data-action="${stimulus.action}"]`,
 });
 
-const motDemo: readonly MotStimulus[] = [
-  { id: "mot-memorize", stage: "memorize", action: "none", focusBall: null, isTarget: false },
-  { id: "mot-track", stage: "track", action: "none", focusBall: null, isTarget: false },
-  { id: "mot-ball-3", stage: "identify", action: "ball-3", focusBall: 3, isTarget: false },
-  { id: "mot-ball-0", stage: "identify", action: "ball-0", focusBall: 0, isTarget: true },
-  { id: "mot-ball-1", stage: "identify", action: "ball-1", focusBall: 1, isTarget: true },
-];
-
-export const motTutorial = criarTutorialEstimuloContinuo<MotStimulus>({
-  exerciseId: "mot",
-  version: 1,
-  modo: "continua",
-  guidedInstruction: "Clique nos alvos que você seguiu.",
-  retryHint: "Acompanhe os alvos durante o movimento e clique neles ao final.",
-  smallestValidUnit: MOT_MINIMUM_TARGETS,
-  demonstrationStimuli: motDemo,
-  guidedStimuli: motDemo,
-  Board: MotBoard,
-  expectedActionFor: (stimulus) => stimulus.action,
-  targetSelectorFor: (stimulus) => `[data-action="${stimulus.action}"]`,
-});
-
 const certoOuErradoDemo: readonly CertoErradoStimulus[] = [
   {
     id: "certo-demo",
diff --git a/lib/tutorial/estimulo-continuo.test.ts b/lib/tutorial/estimulo-continuo.test.ts
index 04d9d314..636e5f6f 100644
--- a/lib/tutorial/estimulo-continuo.test.ts
+++ b/lib/tutorial/estimulo-continuo.test.ts
@@ -78,11 +78,9 @@ describe("Regra 11 — três modos oficiais", () => {
 describe("Família 4 — estímulo contínuo", () => {
   const continuousDemos = [
     "semaforoDemo",
-    "vigilanciaDemo",
     "tempoReacaoDemo",
     "nbackDemo",
     "dualTaskDemo",
-    "motDemo",
   ];
 
   it.each(continuousDemos)("%s contém alvo e não-alvo", (name) => {
@@ -125,14 +123,12 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(guided).toMatch(/Um alvo não possui timeout/);
   });
 
-  it("usa os sete textos aprovados e não menciona teclado nem toque", () => {
+  it("usa os cinco textos que continuam nesta família e não menciona teclado nem toque", () => {
     const instructions = [
       "Clique em avançar somente quando o sinal abrir.",
-      "Clique quando a pipa alvo aparecer.",
       "Clique assim que o sinal aparecer.",
       "Clique quando a letra for igual à de duas posições atrás.",
       "Responda às duas tarefas conforme elas aparecerem.",
-      "Clique nos alvos que você seguiu.",
       "Clique em certo ou errado conforme a operação.",
     ];
     for (const instruction of instructions) expect(definition()).toContain(instruction);
@@ -158,9 +154,7 @@ describe("Família 4 — estímulo contínuo", () => {
     }
 
 
-    // Classificação dela de 07/ago/2026, por exercício e não por família:
-    //   Explicação  — Semáforo, Tempo de Reação, Certo ou Errado
-    //   Demonstração — N-Back, Dual Task, MOT, Vigilância
+    // Classificação dela de 07/ago/2026 para os exercícios que continuam nesta família.
     const modoDe = (exerciseId: string) => {
       const trecho = definition().slice(definition().indexOf(`exerciseId: "${exerciseId}"`));
       return trecho.slice(0, trecho.indexOf("guidedInstruction")).match(/modo: "(\w+)"/)?.[1];
@@ -172,8 +166,6 @@ describe("Família 4 — estímulo contínuo", () => {
 
     expect(modoDe("nback")).toBe("continua");
     expect(modoDe("dual-task")).toBe("continua");
-    expect(modoDe("mot")).toBe("continua");
-    expect(modoDe("vigilancia")).toBe("continua");
   });
 
   it("registra os sete e preserva os 20 convertidos", () => {
@@ -237,6 +229,8 @@ describe("regra 11 consolidada — na dúvida, Fluxo 1", () => {
       "lib/tutorial/definitions/conjunto-selecao.tsx",
       "lib/tutorial/definitions/estimulo-continuo.tsx",
       "lib/tutorial/definitions/focus-agents.tsx",
+      "lib/tutorial/definitions/mot.tsx",
+      "lib/tutorial/definitions/vigilancia.tsx",
     ];
 
     for (const caminho of definicoes) {
diff --git a/lib/tutorial/pointer-tracking.test.ts b/lib/tutorial/pointer-tracking.test.ts
index c859c099..80865d4c 100644
--- a/lib/tutorial/pointer-tracking.test.ts
+++ b/lib/tutorial/pointer-tracking.test.ts
@@ -72,6 +72,7 @@ describe("DemoPointer com perseguição opcional", () => {
       "sequencia-itens.tsx",
       "sequencia-ordenada.tsx",
       "span-numerico.tsx",
+      "vigilancia.tsx",
     ];
     const definitionsDirectory = resolve(process.cwd(), "lib/tutorial/definitions");
 
diff --git a/lib/tutorial/span-reference.test.ts b/lib/tutorial/span-reference.test.ts
index 4f45ad77..892b3a44 100644
--- a/lib/tutorial/span-reference.test.ts
+++ b/lib/tutorial/span-reference.test.ts
@@ -605,8 +605,10 @@ describe("T1 congelada — 2. sem emoji no framework do tutorial", () => {
     "lib/tutorial/definitions/conjunto-selecao.tsx",
     "lib/tutorial/definitions/estimulo-continuo.tsx",
     "lib/tutorial/definitions/focus-agents.tsx",
+    "lib/tutorial/definitions/mot.tsx",
     "lib/tutorial/definitions/sequencia-ordenada.tsx",
     "lib/tutorial/definitions/span-numerico.tsx",
+    "lib/tutorial/definitions/vigilancia.tsx",
     "lib/tutorial/speech-playback.ts",
     "lib/tutorial/span-playback.ts",
     "lib/tutorial/types.ts",
diff --git a/lib/vigilancia.ts b/lib/vigilancia.ts
index 51c76eb5..25216696 100644
--- a/lib/vigilancia.ts
+++ b/lib/vigilancia.ts
@@ -10,6 +10,7 @@
 
 // ── §17 Escada de exposição (ms) — do mais lento (fácil) ao mais rápido ──────
 export const EXPO_STEPS = [1800, 1600, 1400, 1250, 1100, 960, 840, 730, 630, 540, 460, 390, 330, 280, 240];
+export const DEGRAU_CONFORTAVEL = 4;
 export const clampDegrau = (d: number) => Math.max(0, Math.min(EXPO_STEPS.length - 1, d));
 export const tempoDoDegrau = (d: number) => EXPO_STEPS[clampDegrau(d)];
 
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? components/exercises/attention/MOTBall.tsx
?? lib/mot/
?? lib/tutorial/definitions/mot.tsx
?? lib/tutorial/definitions/vigilancia.tsx
?? lib/tutorial/mot.test.ts
?? lib/tutorial/vigilancia.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover tut-vig-mot ==

== CONTEUDO DOS ARQUIVOS NOVOS ==

----- ARQUIVO NOVO: components/exercises/attention/MOTBall.tsx -----
"use client";

import { forwardRef } from "react";
import { BALL_RADIUS, type Ball } from "@/lib/mot/scene";

export type MOTBallPhase = "memorize" | "track" | "identify";

interface MOTBallProps {
  ball: Ball;
  phase: MOTBallPhase;
  selected: boolean;
  revealTarget: boolean;
  gamified: boolean;
  arenaWidth: number;
  arenaHeight: number;
  onClick: () => void;
}

export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall({
  ball,
  phase,
  selected,
  revealTarget,
  gamified,
  arenaWidth,
  arenaHeight,
  onClick,
}, ref) {
  const showTarget = phase === "memorize" && ball.isTarget;

  return (
    <div
      ref={ref}
      data-mot-ball={ball.id}
      style={{
        position: "absolute",
        left: Math.min(Math.max(0, ball.x - BALL_RADIUS), arenaWidth - BALL_RADIUS * 2),
        top: Math.min(Math.max(0, ball.y - BALL_RADIUS), arenaHeight - BALL_RADIUS * 2),
        width: BALL_RADIUS * 2,
        height: BALL_RADIUS * 2,
        ...(phase === "track" ? {} : { transform: "translate(0px, 0px)" }),
        transition: phase === "identify" ? "none" : undefined,
      }}
      className={`flex cursor-pointer select-none items-center justify-center rounded-full border-2 text-xs font-bold ${
        revealTarget ? "border-green-600 bg-green-400" :
        showTarget ? "animate-pulse border-yellow-300 bg-yellow-400" :
        selected ? "border-blue-600 bg-blue-400" :
        gamified ? "border-gray-500 bg-gray-400" : "border-gray-400 bg-gray-300"
      }`}
      onClick={onClick}
    >
      {selected && phase === "identify" ? "✓" : ""}
    </div>
  );
});

----- ARQUIVO NOVO: lib/mot/ -----
cat: /Users/codexmbair/codex-lab/labs/tut-vig-mot/lib/mot/: Is a directory

----- ARQUIVO NOVO: lib/tutorial/definitions/mot.tsx -----
"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Check } from "lucide-react";
import { MOTBall, type MOTBallPhase } from "@/components/exercises/attention/MOTBall";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import {
  ASPECT,
  randomBalls,
  stepAll,
  targetsForLevel,
  trackDuration,
  type Ball,
} from "@/lib/mot/scene";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

const MIN_LEVEL = 0;
const MEMORIZE_MS = 2000;
const SCENE_HEIGHT = 360;

interface SceneDimensions {
  width: number;
  height: number;
}

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(!isCancelled()), ms);
    if (isCancelled()) {
      window.clearTimeout(timer);
      resolve(false);
    }
  });
}

function MOTArena({
  containerRef,
  dimensions,
  balls,
  phase,
  selected,
  confirmed,
  interactive,
  nodes,
  onBallClick,
  onConfirm,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: SceneDimensions;
  balls: Ball[];
  phase: MOTBallPhase;
  selected: ReadonlySet<number>;
  confirmed: boolean;
  interactive: boolean;
  nodes: MutableRefObject<Map<number, HTMLDivElement>>;
  onBallClick: (ball: Ball) => void;
  onConfirm: () => void;
}) {
  const targetCount = balls.filter((ball) => ball.isTarget).length;
  const phaseLabel = phase === "memorize"
    ? "Memorize os alvos dourados."
    : phase === "track"
      ? "Acompanhe o movimento."
      : "Selecione os alvos e confirme.";

  return (
    <div ref={containerRef} className="relative w-full">
      <span data-demo-pointer-start aria-hidden className="absolute bottom-8 left-8 h-px w-px" />
      <div className={`mb-2 rounded-xl px-4 py-2 text-center text-sm font-bold ${
        phase === "memorize" ? "bg-yellow-50 text-yellow-800" :
        phase === "track" ? "bg-blue-50 text-blue-800" : "bg-green-50 text-green-800"
      }`}>
        {phaseLabel}
      </div>
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50"
        style={{ width: dimensions.width, height: dimensions.height, maxWidth: "100%" }}
      >
        {balls.map((ball) => (
          <MOTBall
            key={ball.id}
            ref={(node) => {
              if (node) nodes.current.set(ball.id, node);
              else nodes.current.delete(ball.id);
            }}
            ball={ball}
            phase={phase}
            selected={selected.has(ball.id)}
            revealTarget={confirmed && ball.isTarget}
            gamified={false}
            arenaWidth={dimensions.width}
            arenaHeight={dimensions.height}
            onClick={() => {
              if (interactive) onBallClick(ball);
            }}
          />
        ))}
      </div>
      {phase === "identify" && !confirmed && (
        <button
          data-mot-confirm
          type="button"
          disabled={selected.size !== targetCount}
          onClick={() => {
            if (interactive && selected.size === targetCount) onConfirm();
          }}
          className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-45"
        >
          {selected.size < targetCount
            ? `Selecione mais ${targetCount - selected.size} bola(s)`
            : "Confirmar"}
        </button>
      )}
      {confirmed && (
        <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white">
          <Check aria-hidden className="h-4 w-4" />
          Perfeito! {targetCount}/{targetCount} alvos
        </div>
      )}
    </div>
  );
}

function createScene(arena: HTMLDivElement): { dimensions: SceneDimensions; balls: Ball[] } {
  const width = arena.clientWidth;
  const height = Math.round(width * ASPECT);
  return {
    dimensions: { width, height },
    balls: randomBalls(MIN_LEVEL, 0, width, height),
  };
}

function animateTracking(
  initialBalls: Ball[],
  dimensions: SceneDimensions,
  nodes: MutableRefObject<Map<number, HTMLDivElement>>,
  isCancelled: () => boolean,
): Promise<Ball[] | null> {
  const base = new Map(initialBalls.map((ball) => [ball.id, { x: ball.x, y: ball.y }]));
  let movingBalls = initialBalls;
  let firstFrame: number | null = null;

  return new Promise((resolve) => {
    function animate(frameTime: number) {
      if (isCancelled()) {
        resolve(null);
        return;
      }
      if (firstFrame === null) firstFrame = frameTime;
      movingBalls = stepAll(movingBalls, dimensions.width, dimensions.height);
      for (const ball of movingBalls) {
        const node = nodes.current.get(ball.id);
        const initial = base.get(ball.id);
        if (node && initial) {
          node.style.transform = `translate(${ball.x - initial.x}px, ${ball.y - initial.y}px)`;
        }
      }
      if (frameTime - firstFrame < trackDuration(MIN_LEVEL)) {
        requestAnimationFrame(animate);
      } else {
        resolve(movingBalls);
      }
    }

    requestAnimationFrame(animate);
  });
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Map<number, HTMLDivElement>>(new Map());
  const onDoneRef = useRef(onDone);
  const [dimensions, setDimensions] = useState<SceneDimensions | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [phase, setPhase] = useState<MOTBallPhase>("memorize");
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
    "locating",
  );
  const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
  onDoneRef.current = onDone;

  useEffect(() => {
    const arena = measureRef.current;
    if (!arena) return;
    const scene = createScene(arena);
    setDimensions(scene.dimensions);
    setBalls(scene.balls);
  }, []);

  useEffect(() => {
    if (!dimensions || balls.length === 0) return;
    let cancelled = false;
    const initialBalls = balls;

    async function run() {
      if (!await wait(MEMORIZE_MS, () => cancelled)) return;
      setPhase("track");
      const finalBalls = await animateTracking(initialBalls, dimensions, nodes, () => cancelled);
      if (!finalBalls || cancelled) return;
      setBalls(finalBalls);
      setPhase("identify");
      if (!await wait(RITMO_TUTORIAL_APROVADO.betweenStimuliMs, () => cancelled)) return;

      for (const target of finalBalls.filter((ball) => ball.isTarget)) {
        setTargetSelector(`[data-mot-ball="${target.id}"]`);
        setPointerPhase("moving");
        if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
        if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
        setPointerPhase("pressing");
        if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
        setSelected((current) => new Set(current).add(target.id));
        setPointerPhase("moving");
        if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;
      }

      setTargetSelector("[data-mot-confirm]");
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
      setConfirmed(true);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.finalPauseMs, () => cancelled)) return;
      onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
    // A cena inicial dispara o roteiro; as posições finais só atualizam a visualização.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  return (
    <div ref={measureRef} className="relative w-full" style={{ minHeight: SCENE_HEIGHT }}>
      {dimensions && (
        <>
          <MOTArena
            containerRef={arenaRef}
            dimensions={dimensions}
            balls={balls}
            phase={phase}
            selected={selected}
            confirmed={confirmed}
            interactive={false}
            nodes={nodes}
            onBallClick={() => {}}
            onConfirm={() => {}}
          />
          <DemoPointer
            containerRef={arenaRef}
            targetSelector={targetSelector}
            phase={pointerPhase}
            moveDurationMs={RITMO_TUTORIAL_APROVADO.pointerMoveMs}
            entryPulseDurationMs={RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs}
            trackTarget
          />
        </>
      )}
    </div>
  );
}

function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Map<number, HTMLDivElement>>(new Map());
  const [dimensions, setDimensions] = useState<SceneDimensions | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [phase, setPhase] = useState<MOTBallPhase>("memorize");
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const answeredRef = useRef(false);

  useEffect(() => {
    const arena = measureRef.current;
    if (!arena) return;
    const scene = createScene(arena);
    setDimensions(scene.dimensions);
    setBalls(scene.balls);
  }, []);

  useEffect(() => {
    if (!dimensions || balls.length === 0) return;
    let cancelled = false;
    const initialBalls = balls;

    async function present() {
      if (!await wait(MEMORIZE_MS, () => cancelled)) return;
      setPhase("track");
      const finalBalls = await animateTracking(initialBalls, dimensions, nodes, () => cancelled);
      if (!finalBalls || cancelled) return;
      setBalls(finalBalls);
      setPhase("identify");
    }

    void present();
    return () => { cancelled = true; };
    // A atualização das posições finais não deve reiniciar as três fases.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions]);

  function handleBallClick(ball: Ball) {
    if (phase !== "identify" || answeredRef.current) return;
    if (!ball.isTarget) {
      answeredRef.current = true;
      onOutcome("incorrect");
      return;
    }
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(ball.id)) next.delete(ball.id);
      else next.add(ball.id);
      return next;
    });
  }

  function handleConfirm() {
    if (phase !== "identify" || answeredRef.current) return;
    const targets = balls.filter((ball) => ball.isTarget);
    const exact = selected.size === targets.length
      && targets.every((target) => selected.has(target.id));
    answeredRef.current = true;
    onOutcome(exact ? "correct" : "incorrect");
  }

  return (
    <div ref={measureRef} className="w-full" style={{ minHeight: SCENE_HEIGHT }}>
      {dimensions && (
        <MOTArena
          containerRef={arenaRef}
          dimensions={dimensions}
          balls={balls}
          phase={phase}
          selected={selected}
          confirmed={false}
          interactive
          nodes={nodes}
          onBallClick={handleBallClick}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

export const motTutorial: TutorialDefinition = {
  exerciseId: "mot",
  version: 1,
  Demonstration,
  GuidedAttempt,
  guidedInstruction: "Clique nos alvos que você acompanhou e confirme.",
  retryHint: "Tente novamente, acompanhe os alvos e clique neles ao final.",
  smallestValidUnit: targetsForLevel(MIN_LEVEL),
};

----- ARQUIVO NOVO: lib/tutorial/definitions/vigilancia.tsx -----
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye } from "lucide-react";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";
import {
  DEGRAU_CONFORTAVEL,
  POSICOES,
  classificarToque,
  gerarCentros,
  tempoDoDegrau,
  type Arranjo,
  type Ponto,
} from "@/lib/vigilancia";
import {
  NIVEIS,
  fundoById,
  imgFundo,
  imgPipa,
  parById,
} from "@/lib/vigilancia-dados";

const SCENE_HEIGHT = 440;
const FIXATION_MS = 750;

type Phase = "fixacao" | "exposicao" | "resposta" | "feedback";

interface TutorialScene {
  width: number;
  height: number;
  centers: Ponto[];
  targetPosition: number;
  arrangement: Arranjo;
  backgroundSource: string;
  targetSource: string;
  distractorSource: string;
}

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(!isCancelled()), ms);
    if (isCancelled()) {
      window.clearTimeout(timer);
      resolve(false);
    }
  });
}

function VigilanciaScene({
  scene,
  phase,
  highlightTarget,
  cursor,
}: {
  scene: TutorialScene;
  phase: Phase;
  highlightTarget: boolean;
  cursor: Ponto | null;
}) {
  const centerX = scene.width / 2;
  const centerY = scene.height / 2;
  const kiteWidth = Math.max(56, Math.round(Math.min(scene.width, scene.height) * 0.13));
  const kiteHeight = Math.round(kiteWidth * 1.5);
  const correctCenter = scene.centers[scene.targetPosition];

  return (
    <>
      {(phase === "fixacao" || phase === "exposicao") && (
        <span
          aria-hidden
          className="absolute z-[5] rounded-full border-2 border-white bg-slate-800"
          style={{ left: centerX - 7, top: centerY - 7, width: 14, height: 14 }}
        />
      )}

      {phase === "exposicao" && POSICOES.map((_, position) => {
        const center = scene.centers[position];
        const isTarget = position === scene.targetPosition;
        return (
          <span
            key={position}
            className="absolute z-[3]"
            style={{
              left: center.x - kiteWidth / 2,
              top: center.y - kiteHeight / 2,
              width: kiteWidth,
              height: kiteHeight,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isTarget ? scene.targetSource : scene.distractorSource}
              alt=""
              draggable={false}
              className={highlightTarget && isTarget
                ? "h-full w-full object-contain drop-shadow-[0_0_10px_rgba(250,204,21,1)]"
                : "h-full w-full object-contain"}
            />
            {highlightTarget && isTarget && (
              <span className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-amber-400 px-2 py-1 text-[11px] font-black text-amber-950 shadow">
                <Eye aria-hidden className="h-3 w-3" />
                Diferente
              </span>
            )}
          </span>
        );
      })}

      {phase === "resposta" && (
        <>
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/55 px-4 py-1.5 text-sm font-bold text-white">
            Onde estava a pipa diferente?
          </div>
          {cursor && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[8]"
              width={scene.width}
              height={scene.height}
            >
              <line
                x1={centerX}
                y1={centerY}
                x2={cursor.x}
                y2={cursor.y}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={1.5}
              />
              <circle
                cx={cursor.x}
                cy={cursor.y}
                r={9}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={2}
              />
            </svg>
          )}
        </>
      )}

      <span
        data-vigilancia-target-region
        aria-hidden
        className="pointer-events-none absolute h-px w-px"
        style={{ left: correctCenter.x, top: correctCenter.y }}
      />

      {phase === "feedback" && (
        <>
          <span
            aria-hidden
            className="absolute z-[6] rounded-full border-[3px] border-green-500 bg-green-500/10"
            style={{
              left: correctCenter.x - kiteWidth * 0.8,
              top: correctCenter.y - kiteHeight * 0.6,
              width: kiteWidth * 1.6,
              height: kiteHeight * 1.2,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.targetSource}
            alt=""
            draggable={false}
            className="absolute z-[7] object-contain"
            style={{
              left: correctCenter.x - kiteWidth / 2,
              top: correctCenter.y - kiteHeight / 2,
              width: kiteWidth,
              height: kiteHeight,
            }}
          />
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-green-600/95 px-5 py-2 text-sm font-bold text-white">
            <Check aria-hidden className="h-4 w-4" />
            Correto!
          </div>
        </>
      )}
    </>
  );
}

function createScene(arena: HTMLDivElement): TutorialScene {
  const level = NIVEIS[0];
  const pair = parById(level.pairId);
  const background = fundoById(level.fundo);
  const width = arena.clientWidth;
  const height = arena.clientHeight;

  return {
    width,
    height,
    centers: gerarCentros(level.arranjo, width, height),
    targetPosition: Math.floor(Math.random() * POSICOES.length),
    arrangement: level.arranjo,
    backgroundSource: imgFundo(background.arquivo),
    targetSource: imgPipa(pair.A.arquivo),
    distractorSource: imgPipa(pair.B.arquivo),
  };
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [phase, setPhase] = useState<Phase>("fixacao");
  const [highlightTarget, setHighlightTarget] = useState(false);
  const [cursor, setCursor] = useState<Ponto | null>(null);
  const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
    "locating",
  );
  const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
  onDoneRef.current = onDone;

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    setScene(createScene(arena));
  }, []);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;
    const currentScene = scene;

    async function run() {
      if (!await wait(FIXATION_MS, () => cancelled)) return;
      setPhase("exposicao");
      setHighlightTarget(true);
      if (!await wait(tempoDoDegrau(DEGRAU_CONFORTAVEL), () => cancelled)) return;
      setHighlightTarget(false);
      setPhase("resposta");
      setCursor(currentScene.centers[currentScene.targetPosition]);
      setTargetSelector("[data-vigilancia-target-region]");
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
      setPhase("feedback");
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.finalPauseMs, () => cancelled)) return;
      onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
  }, [scene]);

  return (
    <div
      ref={arenaRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-cover bg-center"
      style={{
        height: SCENE_HEIGHT,
        backgroundImage: scene ? `url(${scene.backgroundSource})` : undefined,
      }}
    >
      <span data-demo-pointer-start aria-hidden className="absolute bottom-8 left-8 h-px w-px" />
      {scene && (
        <>
          <VigilanciaScene
            scene={scene}
            phase={phase}
            highlightTarget={highlightTarget}
            cursor={cursor}
          />
          <DemoPointer
            containerRef={arenaRef}
            targetSelector={targetSelector}
            phase={pointerPhase}
            moveDurationMs={RITMO_TUTORIAL_APROVADO.pointerMoveMs}
            entryPulseDurationMs={RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs}
          />
        </>
      )}
    </div>
  );
}

function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [phase, setPhase] = useState<Phase>("fixacao");
  const [cursor, setCursor] = useState<Ponto | null>(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    setScene(createScene(arena));
  }, []);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;

    async function presentStimulus() {
      if (!await wait(FIXATION_MS, () => cancelled)) return;
      setPhase("exposicao");
      if (!await wait(tempoDoDegrau(DEGRAU_CONFORTAVEL), () => cancelled)) return;
      setPhase("resposta");
    }

    void presentStimulus();
    return () => { cancelled = true; };
  }, [scene]);

  function pointFromEvent(event: React.PointerEvent<HTMLDivElement>): Ponto | null {
    const arena = arenaRef.current;
    if (!arena) return null;
    const rect = arena.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!scene || phase !== "resposta" || answeredRef.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    answeredRef.current = true;
    const result = classificarToque(
      point,
      scene.centers,
      scene.targetPosition,
      scene.arrangement,
      scene.width,
      scene.height,
      "padrao",
    );
    onOutcome(result.correto ? "correct" : "incorrect");
  }

  return (
    <div
      ref={arenaRef}
      onPointerDown={handlePointerDown}
      onPointerMove={(event) => {
        if (phase === "resposta") setCursor(pointFromEvent(event));
      }}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-cover bg-center"
      style={{
        height: SCENE_HEIGHT,
        backgroundImage: scene ? `url(${scene.backgroundSource})` : undefined,
        cursor: phase === "resposta" ? "crosshair" : "default",
        touchAction: "none",
      }}
    >
      {scene && (
        <VigilanciaScene
          scene={scene}
          phase={phase}
          highlightTarget={false}
          cursor={cursor}
        />
      )}
    </div>
  );
}

export const vigilanciaTutorial: TutorialDefinition = {
  exerciseId: "vigilancia",
  version: 2,
  Demonstration,
  GuidedAttempt,
  guidedInstruction: "Clique na região onde estava a pipa diferente.",
  retryHint: "Tente novamente e clique onde a pipa diferente apareceu.",
  smallestValidUnit: POSICOES.length / POSICOES.length,
};

----- ARQUIVO NOVO: lib/tutorial/mot.test.ts -----
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { targetsForLevel } from "@/lib/mot/scene";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/mot.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("MOT — tutorial com o exercício real", () => {
  it("usa o Fluxo 1 sem declarar modo", () => {
    expect(definition()).not.toMatch(/\bmodo\s*:/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*1\b/);
    expect(TUTORIAL_VERSIONS.mot).toBe(1);
  });

  it("usa clique e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
    expect(definition()).not.toMatch(/teclado/i);
  });

  it("deriva a menor unidade do nível mínimo", () => {
    expect(definition()).toMatch(
      /smallestValidUnit:\s*targetsForLevel\(MIN_LEVEL\)/,
    );
    expect(targetsForLevel(0)).toBe(2);
    expect(definition()).not.toMatch(/smallestValidUnit:\s*2\b/);
  });

  it("gera a cena somente depois do início de um componente", () => {
    const fonte = definition();
    const firstComponent = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const sceneCall = fonte.indexOf("randomBalls(");

    expect(firstComponent).toBeGreaterThan(-1);
    expect(sceneCall).toBeGreaterThan(firstComponent);
  });

  it("usa a geração, a duração e a física reais", () => {
    const fonte = definition();
    expect(fonte).toMatch(/from "@\/lib\/mot\/scene"/);
    for (const piece of ["randomBalls", "stepAll", "trackDuration", "targetsForLevel"]) {
      expect(fonte).toMatch(new RegExp(`\\b${piece}\\b`));
    }
    expect(fonte).toMatch(/requestAnimationFrame/);
  });

  it("reutiliza a bola do exercício e remove o board desenhado à mão", () => {
    expect(definition()).toMatch(/<MOTBall\b/);
    expect(definition()).not.toMatch(/rounded-full|borderRadius|clipPath/);
    expect(source("lib/tutorial/definitions/estimulo-continuo.tsx"))
      .not.toMatch(/function MotBoard/);
  });

  it("não mede a resposta nem pontua a tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de conclusão", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("acompanha os alvos e move todas as bolas com a física real", () => {
    expect(definition()).toMatch(/\btrackTarget\b/);
    expect(definition()).toMatch(/\bstepAll\s*\(/);
  });
});

----- ARQUIVO NOVO: lib/tutorial/vigilancia.test.ts -----
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { POSICOES } from "@/lib/vigilancia";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/vigilancia.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("Vigilância — tutorial com o exercício real", () => {
  it("usa o Fluxo 1 sem modo explicativo", () => {
    expect(definition()).not.toMatch(/modo:\s*"explicativo"/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*2\b/);
    expect(TUTORIAL_VERSIONS.vigilancia).toBe(2);
  });

  it("usa clique e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
    expect(definition()).not.toMatch(/teclado/i);
  });

  it("deriva uma resposta por tentativa das posições da mecânica", () => {
    expect(definition()).toMatch(
      /smallestValidUnit:\s*POSICOES\.length\s*\/\s*POSICOES\.length/,
    );
    expect(POSICOES.length / POSICOES.length).toBe(1);
    expect(definition()).not.toMatch(/smallestValidUnit:\s*1\b/);
  });

  it("gera a cena somente depois do início de um componente", () => {
    const fonte = definition();
    const firstComponent = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const centersCall = fonte.indexOf("gerarCentros(");
    const randomCall = fonte.indexOf("Math.random(");

    expect(firstComponent).toBeGreaterThan(-1);
    expect(centersCall).toBeGreaterThan(firstComponent);
    expect(randomCall).toBeGreaterThan(firstComponent);
  });

  it("usa o motor e as imagens reais da Vigilância", () => {
    const fonte = definition();
    expect(fonte).toMatch(/from "@\/lib\/vigilancia"/);
    expect(fonte).toMatch(/from "@\/lib\/vigilancia-dados"/);
    for (const piece of [
      "gerarCentros",
      "classificarToque",
      "tempoDoDegrau",
      "imgPipa",
      "imgFundo",
    ]) {
      expect(fonte).toMatch(new RegExp(`\\b${piece}\\b`));
    }
  });

  it("não redesenha a pipa e remove o desenho antigo", () => {
    expect(definition()).toMatch(/<img\b/);
    expect(definition()).not.toMatch(/rotate-45|clipPath|function Pipa/);
    expect(source("lib/tutorial/definitions/estimulo-continuo.tsx"))
      .not.toMatch(/function Pipa/);
  });

  it("não mede a resposta nem pontua a tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de conclusão", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("classifica o clique com a mesma função do exercício", () => {
    expect(definition()).toMatch(/\bclassificarToque\s*\(/);
  });
});

== CONTEUDO DE lib/mot (faltou no dump anterior) ==

----- ARQUIVO NOVO: lib/mot/scene.test.ts
lib/mot/scene.ts -----
cat: /Users/codexmbair/codex-lab/labs/tut-vig-mot/lib/mot/scene.test.ts
lib/mot/scene.ts: No such file or directory
