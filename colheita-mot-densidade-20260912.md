== DIFF do lab mot-densidade (contra a base do bundle) ==
diff --git a/components/exercises/attention/MOT.tsx b/components/exercises/attention/MOT.tsx
index 553a230b..070e6e3a 100644
--- a/components/exercises/attention/MOT.tsx
+++ b/components/exercises/attention/MOT.tsx
@@ -1,6 +1,6 @@
 "use client";
 
-import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
+import { useState, useEffect, useRef, useCallback, useLayoutEffect, type MouseEvent as ReactMouseEvent } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { calculateExerciseScore } from "@/lib/scoring";
 import { useBlocoDeTreino } from "@/components/exercises/useExerciseEngine";
@@ -10,9 +10,12 @@ import { MOTBall } from "@/components/exercises/attention/MOTBall";
 import {
   ASPECT,
   arenaScaleForLevel,
+  ballRadius,
+  bolaNoPonto,
   randomBalls,
   stepAll,
   targetsForLevel,
+  totalBalls,
   trackDuration,
   type Ball,
 } from "@/lib/mot/scene";
@@ -92,6 +95,8 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
   // bola dentro do quadro visível, e usar o teto faria a bola sumir na área que não está desenhada.
   const escala = arenaScaleForLevel(level);
   const arena = { w: Math.round(dims.w * escala), h: Math.round(dims.h * escala) };
+  const raio = ballRadius(arena.w);
+  const totalNaArena = totalBalls(level, arena.w, arena.h);
   const arenaRef = useRef(arena);
   arenaRef.current = arena;
   useLayoutEffect(() => {
@@ -155,7 +160,12 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
 
       function animate() {
         // Avanca a fisica no ref (paredes + colisao entre bolas) sem render.
-        ballsRef.current = stepAll(ballsRef.current, arenaRef.current.w, arenaRef.current.h);
+        ballsRef.current = stepAll(
+          ballsRef.current,
+          arenaRef.current.w,
+          arenaRef.current.h,
+          ballRadius(arenaRef.current.w),
+        );
         for (const ball of ballsRef.current) {
           const node = ballNodes.current.get(ball.id);
           const b0 = base.get(ball.id);
@@ -198,6 +208,17 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
     });
   }
 
+  function handleArenaTap(event: ReactMouseEvent<HTMLDivElement>) {
+    const rect = event.currentTarget.getBoundingClientRect();
+    const id = bolaNoPonto(
+      balls,
+      event.clientX - rect.left,
+      event.clientY - rect.top,
+      arena.w,
+    );
+    if (id !== null) handleBallTap(id);
+  }
+
   function handleConfirm() {
     if (phase !== "identify") return;
     const targets = balls.filter(b => b.isTarget).map(b => b.id);
@@ -297,7 +318,9 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
         {/* Ball area — coordenadas REAIS em px (sem escala CSS); a bola nunca passa da borda */}
         <div ref={stageWrapRef} className="w-full flex justify-center">
         <div className={`relative rounded-2xl overflow-hidden ${pal.area}`}
-          style={{ width: arena.w, height: arena.h }}>
+          style={{ width: arena.w, height: arena.h }}
+          aria-label={`Arena com ${totalNaArena} bolas`}
+          onClick={handleArenaTap}>
           {balls.map(ball => (
               <MOTBall key={ball.id}
                 ref={node => {
@@ -311,7 +334,7 @@ export function MOT({ difficulty, theme, onComplete }: MOTProps) {
                 gamified={theme === "GAMIFIED"}
                 arenaWidth={arena.w}
                 arenaHeight={arena.h}
-                onClick={() => handleBallTap(ball.id)}
+                raio={raio}
               />
           ))}
         </div>
diff --git a/components/exercises/attention/MOTBall.tsx b/components/exercises/attention/MOTBall.tsx
index 8c56c7f9..3218b71a 100644
--- a/components/exercises/attention/MOTBall.tsx
+++ b/components/exercises/attention/MOTBall.tsx
@@ -1,7 +1,7 @@
 "use client";
 
 import { forwardRef } from "react";
-import { BALL_RADIUS, type Ball } from "@/lib/mot/scene";
+import { type Ball } from "@/lib/mot/scene";
 
 export type MOTBallPhase = "memorize" | "track" | "identify";
 
@@ -13,7 +13,7 @@ interface MOTBallProps {
   gamified: boolean;
   arenaWidth: number;
   arenaHeight: number;
-  onClick: () => void;
+  raio: number;
 }
 
 export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall({
@@ -24,7 +24,7 @@ export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall
   gamified,
   arenaWidth,
   arenaHeight,
-  onClick,
+  raio,
 }, ref) {
   const showTarget = phase === "memorize" && ball.isTarget;
 
@@ -34,10 +34,10 @@ export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall
       data-mot-ball={ball.id}
       style={{
         position: "absolute",
-        left: Math.min(Math.max(0, ball.x - BALL_RADIUS), arenaWidth - BALL_RADIUS * 2),
-        top: Math.min(Math.max(0, ball.y - BALL_RADIUS), arenaHeight - BALL_RADIUS * 2),
-        width: BALL_RADIUS * 2,
-        height: BALL_RADIUS * 2,
+        left: Math.min(Math.max(0, ball.x - raio), arenaWidth - raio * 2),
+        top: Math.min(Math.max(0, ball.y - raio), arenaHeight - raio * 2),
+        width: raio * 2,
+        height: raio * 2,
         ...(phase === "track" ? {} : { transform: "translate(0px, 0px)" }),
         transition: phase === "identify" ? "none" : undefined,
       }}
@@ -47,7 +47,6 @@ export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall
         selected ? "border-blue-600 bg-blue-400" :
         gamified ? "border-gray-500 bg-gray-400" : "border-gray-400 bg-gray-300"
       }`}
-      onClick={onClick}
     >
       {selected && phase === "identify" ? "✓" : ""}
     </div>
diff --git a/lib/mot/scene.test.ts b/lib/mot/scene.test.ts
index c3877ca4..cd3b2411 100644
--- a/lib/mot/scene.test.ts
+++ b/lib/mot/scene.test.ts
@@ -4,11 +4,22 @@ import { describe, expect, it } from "vitest";
 import {
   ARENA_SCALE_MIN,
   BALL_RADIUS,
+  BALL_RADIUS_MIN,
+  RAZAO_DISTRATORES_TETO,
   arenaScaleForLevel,
+  ballRadius,
+  ballSpeed,
+  ballTouchRadius,
+  bolaNoPonto,
+  capacidadeDaArena,
   randomBalls,
+  razaoDeDistratores,
+  speedStepForLevel,
   stepAll,
   targetsForLevel,
   totalBalls,
+  totalBallsDesejado,
+  trackDuration,
   type Ball,
 } from "./scene";
 
@@ -24,149 +35,170 @@ function source(file: string): string {
   return readFileSync(resolve(process.cwd(), file), "utf8");
 }
 
-const arena = { width: 720, height: 480 };
-const minimumLevel = 0;
-
-function expectInsideArena(balls: Ball[]) {
+function expectInsideArena(balls: Ball[], width: number, height: number, radius: number) {
   for (const ball of balls) {
-    expect(ball.x).toBeGreaterThanOrEqual(BALL_RADIUS);
-    expect(ball.x).toBeLessThanOrEqual(arena.width - BALL_RADIUS);
-    expect(ball.y).toBeGreaterThanOrEqual(BALL_RADIUS);
-    expect(ball.y).toBeLessThanOrEqual(arena.height - BALL_RADIUS);
+    expect(ball.x).toBeGreaterThanOrEqual(radius);
+    expect(ball.x).toBeLessThanOrEqual(width - radius);
+    expect(ball.y).toBeGreaterThanOrEqual(radius);
+    expect(ball.y).toBeLessThanOrEqual(height - radius);
   }
 }
 
-describe("cena do MOT", () => {
-  it("gera o total e os alvos do nível dentro da arena", () => {
-    const balls = randomBalls(
-      minimumLevel,
-      0,
-      arena.width,
-      arena.height,
-      seededRandom(21),
-    );
-
-    expect(balls).toHaveLength(totalBalls(minimumLevel));
-    expect(balls.filter((ball) => ball.isTarget)).toHaveLength(
-      targetsForLevel(minimumLevel),
-    );
-    expectInsideArena(balls);
-  });
+function expectNoOverlaps(balls: Ball[], radius: number) {
+  for (let first = 0; first < balls.length; first++) {
+    for (let second = first + 1; second < balls.length; second++) {
+      expect(Math.hypot(
+        balls[second].x - balls[first].x,
+        balls[second].y - balls[first].y,
+      )).toBeGreaterThanOrEqual(radius * 2);
+    }
+  }
+}
 
-  it("gera todas as bolas separadas pela distância mínima", () => {
-    const balls = randomBalls(
-      minimumLevel,
-      0,
-      arena.width,
-      arena.height,
-      seededRandom(37),
-    );
-    const minimumDistance = Math.max(BALL_RADIUS * 3, 78);
-
-    for (let first = 0; first < balls.length; first++) {
-      for (let second = first + 1; second < balls.length; second++) {
-        expect(Math.hypot(
-          balls[second].x - balls[first].x,
-          balls[second].y - balls[first].y,
-        )).toBeGreaterThanOrEqual(minimumDistance);
-      }
+function legacyPositionsAt320(random: () => number): { x: number; y: number }[] {
+  const positions: { x: number; y: number }[] = [];
+  const radius = 22;
+  const separation = Math.max(radius * 3, 78);
+  for (let index = 0; index < 20; index++) {
+    let x = radius;
+    let y = radius;
+    let separated = false;
+    let tries = 0;
+    do {
+      x = radius + random() * (320 - 2 * radius);
+      y = radius + random() * (211 - 2 * radius);
+      separated = positions.every((position) => Math.hypot(position.x - x, position.y - y)
+        >= separation);
+      tries++;
+    } while (!separated && tries < 300);
+    positions.push({ x, y });
+  }
+  return positions;
+}
+
+describe("cena do MOT", () => {
+  it("mantém o raio do desktop e o reduz proporcionalmente em telas pequenas", () => {
+    expect(ballRadius(600)).toBe(22);
+    expect(ballRadius(1100)).toBe(22);
+    expect(ballRadius(1440)).toBe(22);
+    expect(ballRadius(320)).toBe(15);
+
+    for (let width = 320; width <= 1440; width++) {
+      expect(ballRadius(width)).toBeGreaterThanOrEqual(BALL_RADIUS_MIN);
+      expect(ballRadius(width)).toBeLessThanOrEqual(BALL_RADIUS);
+      if (width > 320) expect(ballRadius(width)).toBeGreaterThanOrEqual(ballRadius(width - 1));
     }
   });
 
-  it("rebate na parede e mantém a bola dentro do quadro", () => {
+  it("resolve o toque pela bola mais próxima, inclusive empates", () => {
     const balls: Ball[] = [
-      {
-        id: 0,
-        x: BALL_RADIUS,
-        y: 120,
-        vx: -2,
-        vy: 0,
-        isTarget: true,
-      },
+      { id: 7, x: 100, y: 100, vx: 0, vy: 0, isTarget: true },
+      { id: 3, x: 120, y: 100, vx: 0, vy: 0, isTarget: false },
     ];
 
-    const next = stepAll(balls, arena.width, arena.height);
-
-    expect(next[0].vx).toBeGreaterThan(0);
-    expectInsideArena(next);
+    for (let width = 320; width <= 1440; width++) {
+      expect(ballTouchRadius(width)).toBeGreaterThanOrEqual(22);
+    }
+    expect(bolaNoPonto(balls, 117, 100, 320)).toBe(3);
+    expect(bolaNoPonto(balls, 110, 100, 320)).toBe(3);
+    expect(bolaNoPonto(balls, 200, 100, 320)).toBeNull();
   });
 
-  it("separa duas bolas sobrepostas", () => {
-    const balls: Ball[] = [
-      { id: 0, x: 200, y: 200, vx: 0, vy: 0, isTarget: true },
-      { id: 1, x: 210, y: 200, vx: 0, vy: 0, isTarget: false },
-    ];
-
-    const next = stepAll(balls, arena.width, arena.height);
+  it("a densidade de distratores cresce sem endurecer o nível inicial", () => {
+    expect(totalBallsDesejado(0)).toBe(8);
+    let reachedCeiling = false;
+    for (let level = 0; level <= 40; level++) {
+      const ratio = razaoDeDistratores(level);
+      expect(ratio).toBeLessThanOrEqual(RAZAO_DISTRATORES_TETO);
+      if (level > 0) {
+        expect(ratio).toBeGreaterThanOrEqual(razaoDeDistratores(level - 1));
+        if (!reachedCeiling) expect(ratio).toBeGreaterThan(razaoDeDistratores(level - 1));
+      }
+      reachedCeiling ||= ratio === RAZAO_DISTRATORES_TETO;
+      if (level > 0) expect(totalBallsDesejado(level)).toBeGreaterThanOrEqual(totalBallsDesejado(level - 1));
+    }
+  });
 
-    expect(Math.hypot(next[1].x - next[0].x, next[1].y - next[0].y))
-      .toBeGreaterThanOrEqual(BALL_RADIUS * 2);
+  it("não nasce sobreposta nas arenas e níveis de aceite", () => {
+    for (const width of [320, 393, 600, 768, 1100, 1440]) {
+      const height = Math.round(width * 0.66);
+      const radius = ballRadius(width);
+      for (const level of [0, 3, 5, 7, 10, 14, 16]) {
+        for (let round = 0; round < 40; round++) {
+          const balls = randomBalls(level, round, width, height, seededRandom(width * 1000 + level * 100 + round));
+          expectNoOverlaps(balls, radius);
+        }
+      }
+    }
   });
 
-  it("não deixa nenhuma bola vazar após 300 passos", () => {
-    let balls = randomBalls(4, 0, arena.width, arena.height, seededRandom(83));
+  it("documenta o defeito anterior: 320 px no nível 7 nascia com sobreposições", () => {
+    const oldTotal = targetsForLevel(7) + Math.min(14, targetsForLevel(7) * 2 + 2);
+    const oldCapacityAt320 = 15;
+    expect(oldTotal).toBe(20);
+    expect(oldTotal).toBeGreaterThan(oldCapacityAt320);
+
+    // Medição de produção: cerca de 16,6 pares sobrepostos. Esta reprodução da regra anterior
+    // demonstra por que a garantia acima precisa existir: após 300 tentativas, a posição era
+    // adicionada mesmo sem separação suficiente.
+    const positions = legacyPositionsAt320(seededRandom(320007));
+    const overlappingPairs = positions.flatMap((position, first) => positions.slice(first + 1)
+      .filter((other) => Math.hypot(other.x - position.x, other.y - position.y) < 44));
+    expect(overlappingPairs.length).toBeGreaterThan(0);
+  });
 
-    for (let step = 0; step < 300; step++) {
-      balls = stepAll(balls, arena.width, arena.height);
+  it("respeita a capacidade e sempre preserva ao menos um distrator", () => {
+    for (const width of [320, 393, 600, 768, 1100, 1440]) {
+      const height = Math.round(width * 0.66);
+      for (const level of [0, 3, 5, 7, 10, 14, 16]) {
+        const count = totalBalls(level, width, height);
+        expect(count).toBeLessThanOrEqual(capacidadeDaArena(width, height, ballRadius(width)));
+        expect(count).toBeGreaterThanOrEqual(targetsForLevel(level) + 1);
+        expect(randomBalls(level, 0, width, height, seededRandom(width + level))
+          .filter((ball) => ball.isTarget)).toHaveLength(targetsForLevel(level));
+      }
     }
-
-    expectInsideArena(balls);
   });
 
-  it("é determinística para a mesma semente e varia para sementes diferentes", () => {
-    const first = randomBalls(2, 1, arena.width, arena.height, seededRandom(5));
-    const second = randomBalls(2, 1, arena.width, arena.height, seededRandom(5));
-    const different = randomBalls(2, 1, arena.width, arena.height, seededRandom(6));
+  it("mantém as regras congeladas em todos os níveis verificados", () => {
+    const targets = [2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
+    const speedSteps = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10];
+    const speeds = [1.25, 1.25, 1.53, 1.53, 1.81, 1.81, 2.09, 2.09, 2.37, 2.37, 2.65, 2.65, 2.93, 2.93, 3, 3, 3, 3, 3, 3, 3];
+    const durations = [3500, 3640, 3780, 3920, 4060, 4200, 4340, 4480, 4620, 4760, 4900, 5040, 5180, 5300, 5300, 5300, 5300, 5300, 5300, 5300, 5300];
+    const scales = [0.75, 0.7916666666666666, 0.8333333333333334, 0.875, 0.9166666666666666, 0.9583333333333334, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
+
+    for (let level = 0; level <= 20; level++) {
+      expect(targetsForLevel(level)).toBe(targets[level]);
+      expect(speedStepForLevel(level)).toBe(speedSteps[level]);
+      expect(ballSpeed(level)).toBe(speeds[level]);
+      expect(trackDuration(level)).toBe(durations[level]);
+      expect(arenaScaleForLevel(level)).toBe(scales[level]);
+    }
+    expect(ARENA_SCALE_MIN).toBe(0.75);
+  });
 
-    expect(second).toEqual(first);
-    expect(different).not.toEqual(first);
+  it("mantém a física dentro das bordas para raios pequeno e pleno", () => {
+    for (const [width, height, radius] of [[320, 211, 15], [720, 480, 22]] as const) {
+      let balls = randomBalls(4, 0, width, height, seededRandom(width));
+      for (let step = 0; step < 600; step++) balls = stepAll(balls, width, height, radius);
+      expectInsideArena(balls, width, height, radius);
+    }
   });
 
-  it("mantém as fórmulas no módulo puro, sem cópia no componente", () => {
+  it("mantém as fórmulas no módulo puro e usa dimensões reais no componente", () => {
     const scene = source("lib/mot/scene.ts");
     const exercise = source("components/exercises/attention/MOT.tsx");
+    const ball = source("components/exercises/attention/MOTBall.tsx");
 
     for (const exportedName of [
-      "BALL_RADIUS",
-      "ASPECT",
-      "MAX_TARGETS",
-      "targetsForLevel",
-      "speedStepForLevel",
-      "ballSpeed",
-      "totalBalls",
-      "trackDuration",
-      "randomBalls",
-      "stepAll",
+      "BALL_RADIUS", "ASPECT", "MAX_TARGETS", "targetsForLevel", "speedStepForLevel",
+      "ballSpeed", "totalBalls", "trackDuration", "randomBalls", "stepAll",
     ]) {
       expect(scene).toMatch(new RegExp(`export (?:const|function) ${exportedName}\\b`));
     }
-    expect(exercise).not.toMatch(/function targetsForLevel|function speedStepForLevel/);
-    expect(exercise).not.toMatch(/function randomBalls|function stepAll/);
-    expect(exercise).not.toMatch(/const BALL_RADIUS|const ASPECT|const MAX_TARGETS/);
-  });
-});
-
-describe("a área cresce com o nível", () => {
-  it("começa reduzida, chega ao máximo e nunca passa dele", () => {
-    // Regra dela (12/ago): pouca bola, espaço menor; mais bolas, mais espaço. Área grande com
-    // poucas bolas deixa o rastreamento fácil demais — o olho segue objetos isolados sem esforço.
-    expect(arenaScaleForLevel(0)).toBe(ARENA_SCALE_MIN);
-    expect(arenaScaleForLevel(10)).toBe(1);
-    expect(arenaScaleForLevel(99)).toBe(1);
-    expect(arenaScaleForLevel(-5)).toBe(ARENA_SCALE_MIN);
-  });
-
-  it("é monotônica: nível maior nunca dá área menor", () => {
-    for (let level = 0; level < 12; level++) {
-      expect(arenaScaleForLevel(level + 1)).toBeGreaterThanOrEqual(arenaScaleForLevel(level));
-    }
-  });
-
-  it("área e quantidade crescem juntas — nenhuma das duas sozinha", () => {
-    // Se um dia alguém fizer a área crescer sem a quantidade (ou vice-versa), a carga desanda: é
-    // exatamente o estado que ela viu na tela, com 6 bolas espalhadas num quadro enorme.
-    const areaSobe = arenaScaleForLevel(8) > arenaScaleForLevel(0);
-    const bolasSobem = totalBalls(8) > totalBalls(0);
-    expect(areaSobe && bolasSobem).toBe(true);
+    expect(exercise).toMatch(/totalBalls\(level, arena\.w, arena\.h\)/);
+    expect(exercise).not.toMatch(/totalBalls\(level\)/);
+    expect(ball).not.toMatch(/import\s*\{[^}]*BALL_RADIUS/);
+    expect(ball).not.toMatch(/onClick=/);
   });
 });
diff --git a/lib/mot/scene.ts b/lib/mot/scene.ts
index 994586aa..d2b3fd1c 100644
--- a/lib/mot/scene.ts
+++ b/lib/mot/scene.ts
@@ -1,6 +1,30 @@
 export const BALL_RADIUS = 22;
+export const BALL_RADIUS_MIN = 15;
+export const ARENA_W_RAIO_PLENO = 600;
+export const ARENA_W_RAIO_MIN = 320;
+export const RAIO_TOQUE_MIN = 22;
 export const ASPECT = 0.66;
 export const MAX_TARGETS = 6;
+export const RAZAO_DISTRATORES_BASE = 3.0;
+export const RAZAO_DISTRATORES_PASSO = 0.15;
+export const RAZAO_DISTRATORES_TETO = 4.8;
+export const SEP_PISO_EM_RAIOS = 2.1;
+export const FATOR_CAPACIDADE = 0.45;
+export const SEP_INICIAL_DE = 3.5;
+export const SEP_INICIAL_ATE = 2.6;
+export const SEP_INICIAL_PLENO_EM = 12;
+export const FATOR_OCUPACAO = 0.65;
+
+export function ballRadius(arenaWidth: number): number {
+  if (arenaWidth >= ARENA_W_RAIO_PLENO) return BALL_RADIUS;
+  const t = Math.max(0, Math.min(1,
+    (arenaWidth - ARENA_W_RAIO_MIN) / (ARENA_W_RAIO_PLENO - ARENA_W_RAIO_MIN)));
+  return Math.round(BALL_RADIUS_MIN + t * (BALL_RADIUS - BALL_RADIUS_MIN));
+}
+
+export function ballTouchRadius(arenaWidth: number): number {
+  return Math.max(RAIO_TOQUE_MIN, ballRadius(arenaWidth));
+}
 
 export function targetsForLevel(level: number): number {
   return Math.min(MAX_TARGETS, 2 + Math.ceil(level / 2));
@@ -14,12 +38,46 @@ export function ballSpeed(level: number): number {
   return Math.min(3.0, 1.25 + speedStepForLevel(level) * 0.28);
 }
 
-export function totalBalls(level: number): number {
+export function razaoDeDistratores(level: number): number {
+  return Math.min(RAZAO_DISTRATORES_TETO,
+    RAZAO_DISTRATORES_BASE + RAZAO_DISTRATORES_PASSO * Math.max(0, level));
+}
+
+/** Total desejado pelo nível, antes do limite físico da arena. */
+export function totalBallsDesejado(level: number): number {
   const targets = targetsForLevel(level);
   // Distratores: eram no máximo 6 e o quadro ficava vazio demais. Ela pediu em 28/ago/2026
   // "o retângulo pode ser maior, ter mais bolas para gerar confusão" — a carga do MOT vem da
-  // densidade de distratores, não só do número de alvos. Teto em 10.
-  return targets + Math.min(14, targets * 2 + 2);
+  // densidade de distratores, não só do número de alvos. A razão cresce até o teto de 4,8.
+  return targets + Math.round(targets * razaoDeDistratores(level));
+}
+
+/** Quantas bolas cabem respeitando a separação mínima de nascimento. */
+export function capacidadeDaArena(width: number, height: number, raio: number): number {
+  const sep = SEP_PISO_EM_RAIOS * raio;
+  return Math.max(3, Math.floor(FATOR_CAPACIDADE * (width * height) / (sep * sep)));
+}
+
+/** Total efetivo, limitado pela capacidade física quando a arena é informada. */
+export function totalBalls(level: number, arenaWidth?: number, arenaHeight?: number): number {
+  const desejado = totalBallsDesejado(level);
+  if (arenaWidth == null || arenaHeight == null) return desejado;
+  const cap = capacidadeDaArena(arenaWidth, arenaHeight, ballRadius(arenaWidth));
+  return Math.max(targetsForLevel(level) + 1, Math.min(desejado, cap));
+}
+
+/** Separação desejada pelo nível, em pixels. */
+export function separacaoDesejada(level: number, raio: number): number {
+  const t = Math.max(0, Math.min(1, Math.max(0, level) / SEP_INICIAL_PLENO_EM));
+  return (SEP_INICIAL_DE + (SEP_INICIAL_ATE - SEP_INICIAL_DE) * t) * raio;
+}
+
+/** Separação usada pelo gerador, sem jamais cair abaixo do piso de segurança. */
+export function separacaoEfetiva(
+  level: number, raio: number, quantidadeDeBolas: number, width: number, height: number,
+): number {
+  const porBola = FATOR_OCUPACAO * Math.sqrt((width * height) / Math.max(1, quantidadeDeBolas));
+  return Math.max(SEP_PISO_EM_RAIOS * raio, Math.min(separacaoDesejada(level, raio), porBola));
 }
 
 export function trackDuration(level: number): number {
@@ -35,6 +93,28 @@ export interface Ball {
   isTarget: boolean;
 }
 
+/** A malha é uma salvaguarda determinística se as tentativas aleatórias saturarem. */
+function gridPositions(count: number, width: number, height: number, radius: number, separation: number) {
+  const innerWidth = width - 2 * radius;
+  const innerHeight = height - 2 * radius;
+  const maxColumns = Math.max(1, Math.floor(innerWidth / separation) + 1);
+  const maxRows = Math.max(1, Math.floor(innerHeight / separation) + 1);
+  const preferredColumns = Math.ceil(Math.sqrt(count * innerWidth / innerHeight));
+  const columns = Math.min(maxColumns, Math.max(Math.ceil(count / maxRows), preferredColumns));
+  const rows = Math.ceil(count / columns);
+  const positions: { x: number; y: number }[] = [];
+
+  for (let index = 0; index < count; index++) {
+    const column = index % columns;
+    const row = Math.floor(index / columns);
+    positions.push({
+      x: radius + (columns === 1 ? innerWidth / 2 : column * innerWidth / (columns - 1)),
+      y: radius + (rows === 1 ? innerHeight / 2 : row * innerHeight / (rows - 1)),
+    });
+  }
+  return positions;
+}
+
 export function randomBalls(
   level: number,
   round: number,
@@ -42,12 +122,12 @@ export function randomBalls(
   height: number,
   random: () => number = Math.random,
 ): Ball[] {
-  const count = totalBalls(level);
+  const radius = ballRadius(width);
+  const count = totalBalls(level, width, height);
   const targetCount = targetsForLevel(level);
   const speed = ballSpeed(level);
-  const radius = BALL_RADIUS;
-  const balls: Ball[] = [];
   const positions: { x: number; y: number }[] = [];
+  const separation = separacaoEfetiva(level, radius, count, width, height);
 
   for (let index = 0; index < count; index++) {
     let x = radius;
@@ -58,28 +138,39 @@ export function randomBalls(
       x = radius + random() * (width - 2 * radius);
       y = radius + random() * (height - 2 * radius);
       separated = positions.every((position) => Math.hypot(position.x - x, position.y - y)
-        >= Math.max(radius * 3, 78));
+        >= separation);
       tries++;
     } while (!separated && tries < 300);
+    if (!separated) return gridPositions(count, width, height, radius, separation).map((position, id) => {
+      const angle = random() * Math.PI * 2;
+      const actualSpeed = (0.8 + random() * 0.4) * speed;
+      void round;
+      return {
+        id,
+        ...position,
+        vx: Math.cos(angle) * actualSpeed,
+        vy: Math.sin(angle) * actualSpeed,
+        isTarget: id < targetCount,
+      };
+    });
     positions.push({ x, y });
+  }
 
+  return positions.map((position, id) => {
     const angle = random() * Math.PI * 2;
     const actualSpeed = (0.8 + random() * 0.4) * speed;
     void round;
-    balls.push({
-      id: index,
-      x,
-      y,
+    return {
+      id,
+      ...position,
       vx: Math.cos(angle) * actualSpeed,
       vy: Math.sin(angle) * actualSpeed,
-      isTarget: index < targetCount,
-    });
-  }
-  return balls;
+      isTarget: id < targetCount,
+    };
+  });
 }
 
-export function stepAll(balls: Ball[], width: number, height: number): Ball[] {
-  const radius = BALL_RADIUS;
+export function stepAll(balls: Ball[], width: number, height: number, radius: number): Ball[] {
   const next = balls.map((ball) => {
     let x = ball.x + ball.vx;
     let y = ball.y + ball.vy;
@@ -137,6 +228,25 @@ export function stepAll(balls: Ball[], width: number, height: number): Ball[] {
   return next;
 }
 
+/** Índice da bola tocada; o centro mais próximo vence e o menor id desempata. */
+export function bolaNoPonto(
+  balls: readonly Ball[], x: number, y: number, arenaWidth: number,
+): number | null {
+  const touchRadius = ballTouchRadius(arenaWidth);
+  let closestId: number | null = null;
+  let closestDistance = Number.POSITIVE_INFINITY;
+
+  for (const ball of balls) {
+    const distance = Math.hypot(ball.x - x, ball.y - y);
+    if (distance <= touchRadius && (distance < closestDistance
+      || (distance === closestDistance && (closestId === null || ball.id < closestId)))) {
+      closestId = ball.id;
+      closestDistance = distance;
+    }
+  }
+  return closestId;
+}
+
 /**
  * Fração da arena disponível que o nível usa.
  *
@@ -149,7 +259,7 @@ export function stepAll(balls: Ball[], width: number, height: number): Ball[] {
  * de duas coisas ao mesmo tempo, e elas precisam crescer juntas: **quantidade** (já em
  * `totalBalls`) e **área a varrer**. Área grande com poucas bolas é espaço vazio, não é treino.
  *
- * Começa em 55% e chega a 100% — nunca passa disso, porque o teto é o que cabe na tela do paciente.
+ * Começa em 75% e chega a 100% — nunca passa disso, porque o teto é o que cabe na tela do paciente.
  */
 export const ARENA_SCALE_MIN = 0.75;
 const ARENA_SCALE_FULL_LEVEL = 6;
diff --git a/lib/tutorial/definitions/mot.tsx b/lib/tutorial/definitions/mot.tsx
index b2f2dd7e..23a8d1e8 100644
--- a/lib/tutorial/definitions/mot.tsx
+++ b/lib/tutorial/definitions/mot.tsx
@@ -1,11 +1,13 @@
 "use client";
 
-import { useEffect, useRef, useState, type MutableRefObject } from "react";
+import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type MutableRefObject } from "react";
 import { Check } from "lucide-react";
 import { MOTBall, type MOTBallPhase } from "@/components/exercises/attention/MOTBall";
 import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
 import {
   ASPECT,
+  ballRadius,
+  bolaNoPonto,
   randomBalls,
   stepAll,
   targetsForLevel,
@@ -58,6 +60,7 @@ function MOTArena({
   onConfirm: () => void;
 }) {
   const targetCount = balls.filter((ball) => ball.isTarget).length;
+  const raio = ballRadius(dimensions.width);
   const phaseLabel = phase === "memorize"
     ? "Memorize os alvos dourados."
     : phase === "track"
@@ -76,6 +79,18 @@ function MOTArena({
       <div
         className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50"
         style={{ width: dimensions.width, height: dimensions.height, maxWidth: "100%" }}
+        onClick={(event: ReactMouseEvent<HTMLDivElement>) => {
+          if (!interactive) return;
+          const rect = event.currentTarget.getBoundingClientRect();
+          const id = bolaNoPonto(
+            balls,
+            event.clientX - rect.left,
+            event.clientY - rect.top,
+            dimensions.width,
+          );
+          const ball = balls.find((current) => current.id === id);
+          if (ball) onBallClick(ball);
+        }}
       >
         {balls.map((ball) => (
           <MOTBall
@@ -91,9 +106,7 @@ function MOTArena({
             gamified={false}
             arenaWidth={dimensions.width}
             arenaHeight={dimensions.height}
-            onClick={() => {
-              if (interactive) onBallClick(ball);
-            }}
+            raio={raio}
           />
         ))}
       </div>
@@ -148,7 +161,12 @@ function animateTracking(
         return;
       }
       if (firstFrame === null) firstFrame = frameTime;
-      movingBalls = stepAll(movingBalls, dimensions.width, dimensions.height);
+      movingBalls = stepAll(
+        movingBalls,
+        dimensions.width,
+        dimensions.height,
+        ballRadius(dimensions.width),
+      );
       for (const ball of movingBalls) {
         const node = nodes.current.get(ball.id);
         const initial = base.get(ball.id);
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover mot-densidade ==
