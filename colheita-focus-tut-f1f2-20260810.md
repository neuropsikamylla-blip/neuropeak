== DIFF do lab focus-tut-f1f2 (contra a base do bundle) ==
diff --git a/components/exercises/attention/FocusAgents.tsx b/components/exercises/attention/FocusAgents.tsx
index 89e386a..8730536 100644
--- a/components/exercises/attention/FocusAgents.tsx
+++ b/components/exercises/attention/FocusAgents.tsx
@@ -21,6 +21,16 @@ import { gerarRodada, matches, atributoFaltante, FUNCAO_DA_ETAPA, type FocusRoun
 import { STEPS, type Step } from "@/lib/focus/progression";
 import { charById, COR_HEX, FOCUS_CHARS, type Acessorio, type Objeto } from "@/lib/focus/roster";
 import { focusImagePreloader } from "@/lib/focus/image-loader";
+import {
+  CHAR_H,
+  CHAR_W,
+  MARGIN,
+  bobOffset,
+  montarCenaEspalhada,
+  passoDeriva,
+  separarPersonagens,
+  type LiveChar,
+} from "@/lib/focus/scene";
 import {
   buildFocusCompletionMetadata,
   resolveFocusStartStep,
@@ -53,13 +63,9 @@ const ARENA_BORDA = "#DDE3EC";
 const TXT = "#0f2038";        // texto principal sobre o claro
 const TXT_SUAVE = "#5b6b82";
 
-const CHAR_W = 112;                       // ~30% maior que os 86 de antes (§2)
-const CHAR_H = Math.round(CHAR_W / 0.667); // ≈168 — proporção da arte, não amassa
 const TOUCH_PAD = 10;                     // área de toque um pouco maior (§11)
 
-const VEL_LEVE = [0.4, 0.8, 1.3, 1.9]; // px/frame — deriva; mais movimento conforme a dificuldade sobe
 const VEL_QUEDA = [1.5, 2.2, 3.0, 3.8];    // px/frame — queda do nível 2+ (sobe com a progressão)
-const MARGIN = 6;                          // margem interna da arena (não cola na borda)
 
 const ACC_EMOJI: Record<Acessorio, string> = {
   bone: "🧢", fone: "🎧", oculos: "👓", oculos_escuro: "🕶️", chapeu: "🎩",
@@ -70,10 +76,6 @@ const OBJ_EMOJI: Record<Objeto, string> = {
   bola_basquete: "🏀", bola_futebol: "⚽",
 };
 
-// bx/by = posição-base (render via left/top); x/y = posição viva; vx/vy = deriva leve;
-// ph = fase do "bob" (flutuação suave que dá vida sem deslocar de fato).
-interface LiveChar { uid: string; id: string; isTarget: boolean; hit?: boolean; bx: number; by: number; x: number; y: number; vx: number; vy: number; ph: number; }
-
 const rnd = (a: number, b: number) => a + Math.random() * (b - a);
 const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
 
@@ -178,35 +180,6 @@ function Tutorial({ onStart }: { onStart: () => void }) {
 }
 
 
-// Personagem NÃO pode cobrir personagem: quando o alvo fica atrás de outro, o paciente
-// ou espera passar (o tempo de detecção infla) ou toca no de cima (conta erro) — e o
-// tempo de detecção decide a subida de nível. Empurra pelo eixo de MENOR penetração;
-// na queda só no eixo horizontal, para não bagunçar o ritmo da descida.
-function separarPersonagens(lista: LiveChar[], W: number, H: number, cai: boolean) {
-  const MIN_DX = CHAR_W * 0.80, MIN_DY = CHAR_H * 0.58;
-  for (let i = 0; i < lista.length; i++) {
-    for (let j = i + 1; j < lista.length; j++) {
-      const a = lista[i], b = lista[j];
-      const dx = b.x - a.x, dy = b.y - a.y;
-      const penX = MIN_DX - Math.abs(dx), penY = MIN_DY - Math.abs(dy);
-      if (penX <= 0 || penY <= 0) continue;                   // não se cobrem
-      if (cai || penX / MIN_DX <= penY / MIN_DY) {
-        const s = ((dx >= 0 ? 1 : -1) * Math.max(penX, 1)) / 2;
-        a.x -= s; b.x += s;
-      } else {
-        const s = ((dy >= 0 ? 1 : -1) * penY) / 2;
-        a.y -= s; b.y += s;
-      }
-      a.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, a.x));
-      b.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, b.x));
-      if (!cai) {
-        a.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, a.y));
-        b.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, b.y));
-      }
-    }
-  }
-}
-
 // ── Componente principal ─────────────────────────────────────────────────────
 export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents", settings }: FocusAgentsProps) {
   const auditivo = exerciseId === "focus-agents-auditivo";
@@ -321,19 +294,11 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
           return;
         }
       } else {
-        const maxX = W - CHAR_W - MARGIN, maxY = H - CHAR_H - MARGIN;
-        for (const c of charsRef.current) {
-          c.x += c.vx; c.y += c.vy;
-          if (c.x < MARGIN) { c.x = MARGIN; c.vx = Math.abs(c.vx); }
-          else if (c.x > maxX) { c.x = maxX; c.vx = -Math.abs(c.vx); }
-          if (c.y < MARGIN) { c.y = MARGIN; c.vy = Math.abs(c.vy); }
-          else if (c.y > maxY) { c.y = maxY; c.vy = -Math.abs(c.vy); }
-        }
-        separarPersonagens(charsRef.current, W, H, false);
+        passoDeriva(charsRef.current, W, H);
         for (const c of charsRef.current) {
           const node = nodes.current.get(c.uid);
           if (node) {
-            const bob = Math.sin(f * 0.045 + c.ph) * 3;
+            const bob = bobOffset(f, c.ph);
             node.style.transform = `translate(${c.x - c.bx}px, ${c.y - c.by + bob}px)`;
           }
         }
@@ -352,7 +317,6 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
     const W = dims.current.w, H = dims.current.h;
     const alvoIds = r.alvoIds?.length ? r.alvoIds : [r.alvoId];
     tocadosRef.current = new Set();
-    const n = r.personagensIds.length;
     // SEMPRE espalhado pela tela em 2D (pedido da Kamylla): ativa a busca visual.
     // A queda em linha (concentrada numa faixa) foi removida — a dificuldade sobe
     // por nº de personagens, semelhança dos distratores, velocidade e etapa do comando.
@@ -377,23 +341,7 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
           bx: x, by: y, x, y, vx: 0, vy: vq * rnd(0.92, 1.1), ph: 0 };
       });
     } else {
-      // ESPALHADO: grade embaralhada + deriva leve (1 personagem por célula, com jitter).
-      const vBase = VEL_LEVE[step.vel];
-      // cols/rows balanceados para ESPALHAR em 2D (várias linhas, não uma faixa só)
-      const cols = Math.max(2, Math.round(Math.sqrt(n * (W / Math.max(1, H)) / 1.4)));
-      const rows = Math.max(2, Math.ceil(n / cols));
-      const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n);
-      const cellW = W / cols, cellH = H / rows;
-      live = r.personagensIds.map((id, i) => {
-        const cell = cells[i];
-        const cx = (cell % cols) * cellW, cy = Math.floor(cell / cols) * cellH;
-        const x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, cx + rnd(4, Math.max(6, cellW - CHAR_W - 4))));
-        const y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, cy + rnd(4, Math.max(6, cellH - CHAR_H - 4))));
-        const ang = rnd(0, Math.PI * 2);
-        const sp = vBase * rnd(0.7, 1.2);
-        return { uid: `c${uidSeq.current++}`, id, isTarget: alvoIds.includes(id),
-          bx: x, by: y, x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ph: rnd(0, Math.PI * 2) };
-      });
+      live = montarCenaEspalhada(r.personagensIds, alvoIds, W, H, step.vel);
     }
 
     charsRef.current = live;
diff --git a/components/exercises/tutorial/DemoPointer.tsx b/components/exercises/tutorial/DemoPointer.tsx
index 151d795..b12dcc1 100644
--- a/components/exercises/tutorial/DemoPointer.tsx
+++ b/components/exercises/tutorial/DemoPointer.tsx
@@ -1,8 +1,13 @@
 "use client";
 
-import { useEffect, useState } from "react";
+import { useEffect, useRef, useState } from "react";
 import { motion } from "framer-motion";
 import { MousePointer2 } from "lucide-react";
+import {
+  centerRelativeToContainer,
+  pointerMoveDuration,
+  shouldUpdatePointerPosition,
+} from "@/lib/tutorial/pointer-tracking";
 
 interface DemoPointerProps {
   /** Container que embrulha o alvo; o cursor é posicionado em relação a ele. */
@@ -15,11 +20,13 @@ interface DemoPointerProps {
   moveDurationMs: number;
   /** Duração do pulso inicial de localização, definida pela demonstração. */
   entryPulseDurationMs: number;
+  trackTarget?: boolean;
 }
 
-interface PointerPosition {
+interface PointerState {
   x: number;
   y: number;
+  transitionDurationMs: number;
 }
 
 const POINTER_SIZE = 44;
@@ -33,35 +40,67 @@ export function DemoPointer({
   phase,
   moveDurationMs,
   entryPulseDurationMs,
+  trackTarget = false,
 }: DemoPointerProps) {
-  const [position, setPosition] = useState<PointerPosition | null>(null);
+  const [position, setPosition] = useState<PointerState | null>(null);
+  const positionRef = useRef<PointerState | null>(null);
 
   useEffect(() => {
+    let animationFrameId: number | null = null;
+    let hasMeasuredTarget = false;
+
     function measureTarget() {
       const container = containerRef.current;
       if (!container || !targetSelector) {
-        setPosition(null);
+        if (positionRef.current !== null) {
+          positionRef.current = null;
+          setPosition(null);
+        }
         return;
       }
 
       const target = container.querySelector<HTMLElement>(targetSelector);
       if (!target) {
-        setPosition(null);
+        if (positionRef.current !== null) {
+          positionRef.current = null;
+          setPosition(null);
+        }
         return;
       }
 
       const containerRect = container.getBoundingClientRect();
       const targetRect = target.getBoundingClientRect();
-      setPosition({
-        x: targetRect.left - containerRect.left + targetRect.width / 2,
-        y: targetRect.top - containerRect.top + targetRect.height / 2,
-      });
+      const nextPosition = centerRelativeToContainer(containerRect, targetRect);
+      if (!shouldUpdatePointerPosition(positionRef.current, nextPosition)) {
+        hasMeasuredTarget = true;
+        return;
+      }
+      const nextState = {
+        ...nextPosition,
+        transitionDurationMs: pointerMoveDuration(moveDurationMs, hasMeasuredTarget),
+      };
+      positionRef.current = nextState;
+      setPosition(nextState);
+      hasMeasuredTarget = true;
     }
 
     measureTarget();
     window.addEventListener("resize", measureTarget);
-    return () => window.removeEventListener("resize", measureTarget);
-  }, [containerRef, targetSelector]);
+    if (trackTarget) {
+      if (targetSelector) {
+        const track = () => {
+          measureTarget();
+          animationFrameId = requestAnimationFrame(track);
+        };
+        animationFrameId = requestAnimationFrame(track);
+      }
+    }
+
+    return () => {
+      window.removeEventListener("resize", measureTarget);
+      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
+    };
+  }, [containerRef, moveDurationMs, targetSelector, trackTarget]);
 
   if (!targetSelector || !position) return null;
 
@@ -83,8 +122,8 @@ export function DemoPointer({
         opacity: 1,
       }}
       transition={{
-        x: { duration: moveDurationMs / 1000, ease: "easeInOut" },
-        y: { duration: moveDurationMs / 1000, ease: "easeInOut" },
+        x: { duration: position.transitionDurationMs / 1000, ease: "easeInOut" },
+        y: { duration: position.transitionDurationMs / 1000, ease: "easeInOut" },
         scale: { duration: POINTER_SCALE_TRANSITION_MS / 1000, ease: "easeInOut" },
       }}
     >
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/focus/scene.test.ts
?? lib/focus/scene.ts
?? lib/tutorial/pointer-tracking.test.ts
?? lib/tutorial/pointer-tracking.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover focus-tut-f1f2 ==

== CONTEUDO DOS ARQUIVOS NOVOS (nao vem no diff; anexado na colheita para nao depender do lab) ==

----- ARQUIVO NOVO: lib/focus/scene.ts -----
export const CHAR_W = 112;
export const CHAR_H = Math.round(CHAR_W / 0.667);
export const MARGIN = 6;
export const VEL_LEVE = [0.4, 0.8, 1.3, 1.9];

export interface LiveChar {
  uid: string;
  id: string;
  isTarget: boolean;
  hit?: boolean;
  bx: number;
  by: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
}

type Random = () => number;

const rnd = (random: Random, minimum: number, maximum: number) =>
  minimum + random() * (maximum - minimum);

const shuffle = <T,>(items: T[], random: Random): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export function separarPersonagens(lista: LiveChar[], W: number, H: number, cai: boolean) {
  const MIN_DX = CHAR_W * 0.80;
  const MIN_DY = CHAR_H * 0.58;
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i];
      const b = lista[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const penX = MIN_DX - Math.abs(dx);
      const penY = MIN_DY - Math.abs(dy);
      if (penX <= 0 || penY <= 0) continue;
      if (cai || penX / MIN_DX <= penY / MIN_DY) {
        const s = ((dx >= 0 ? 1 : -1) * Math.max(penX, 1)) / 2;
        a.x -= s;
        b.x += s;
      } else {
        const s = ((dy >= 0 ? 1 : -1) * penY) / 2;
        a.y -= s;
        b.y += s;
      }
      a.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, a.x));
      b.x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN, b.x));
      if (!cai) {
        a.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, a.y));
        b.y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN, b.y));
      }
    }
  }
}

export function montarCenaEspalhada(
  characterIds: string[],
  targetIds: string[],
  W: number,
  H: number,
  velocityIndex: number,
  random: Random = Math.random,
): LiveChar[] {
  const characterCount = characterIds.length;
  const velocityBase = VEL_LEVE[velocityIndex];
  const columns = Math.max(2, Math.round(Math.sqrt(characterCount * (W / Math.max(1, H)) / 1.4)));
  const rows = Math.max(2, Math.ceil(characterCount / columns));
  const cells = shuffle(Array.from({ length: columns * rows }, (_, index) => index), random)
    .slice(0, characterCount);
  const cellWidth = W / columns;
  const cellHeight = H / rows;

  return characterIds.map((id, index) => {
    const cell = cells[index];
    const cellX = (cell % columns) * cellWidth;
    const cellY = Math.floor(cell / columns) * cellHeight;
    const x = Math.max(MARGIN, Math.min(W - CHAR_W - MARGIN,
      cellX + rnd(random, 4, Math.max(6, cellWidth - CHAR_W - 4))));
    const y = Math.max(MARGIN, Math.min(H - CHAR_H - MARGIN,
      cellY + rnd(random, 4, Math.max(6, cellHeight - CHAR_H - 4))));
    const angle = rnd(random, 0, Math.PI * 2);
    const speed = velocityBase * rnd(random, 0.7, 1.2);

    return {
      uid: `c${index}`,
      id,
      isTarget: targetIds.includes(id),
      bx: x,
      by: y,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ph: rnd(random, 0, Math.PI * 2),
    };
  });
}

export function passoDeriva(lista: LiveChar[], W: number, H: number): LiveChar[] {
  const maxX = W - CHAR_W - MARGIN;
  const maxY = H - CHAR_H - MARGIN;
  for (const character of lista) {
    character.x += character.vx;
    character.y += character.vy;
    if (character.x < MARGIN) {
      character.x = MARGIN;
      character.vx = Math.abs(character.vx);
    } else if (character.x > maxX) {
      character.x = maxX;
      character.vx = -Math.abs(character.vx);
    }
    if (character.y < MARGIN) {
      character.y = MARGIN;
      character.vy = Math.abs(character.vy);
    } else if (character.y > maxY) {
      character.y = maxY;
      character.vy = -Math.abs(character.vy);
    }
  }
  separarPersonagens(lista, W, H, false);
  return lista;
}

export function bobOffset(frame: number, fase: number): number {
  return Math.sin(frame * 0.045 + fase) * 3;
}

----- ARQUIVO NOVO: lib/focus/scene.test.ts -----
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHAR_H,
  CHAR_W,
  MARGIN,
  montarCenaEspalhada,
  passoDeriva,
  separarPersonagens,
  type LiveChar,
} from "./scene";

function randomSequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length];
}

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const arena = { width: 720, height: 640 };

function expectInsideArena(chars: LiveChar[]) {
  for (const char of chars) {
    expect(char.x).toBeGreaterThanOrEqual(MARGIN);
    expect(char.x).toBeLessThanOrEqual(arena.width - CHAR_W - MARGIN);
    expect(char.y).toBeGreaterThanOrEqual(MARGIN);
    expect(char.y).toBeLessThanOrEqual(arena.height - CHAR_H - MARGIN);
  }
}

describe("cena espalhada do Focus Agentes", () => {
  it("monta todos os personagens dentro da arena e marca somente os alvos", () => {
    const ids = ["azul_fone", "verde_oculos", "roxo_bone", "amarelo_coroa"];
    const targetIds = ["verde_oculos", "amarelo_coroa"];
    const chars = montarCenaEspalhada(ids, targetIds, arena.width, arena.height, 1,
      randomSequence([0.12, 0.84, 0.37, 0.61, 0.25, 0.73]));

    expect(chars).toHaveLength(ids.length);
    expectInsideArena(chars);
    expect(chars.filter((char) => char.isTarget).map((char) => char.id)).toEqual(targetIds);
  });

  it("separa personagens que se cobririam", () => {
    const chars: LiveChar[] = [
      { uid: "c0", id: "azul_fone", isTarget: false, bx: 100, by: 100, x: 100, y: 100, vx: 0, vy: 0, ph: 0 },
      { uid: "c1", id: "verde_oculos", isTarget: true, bx: 110, by: 110, x: 110, y: 110, vx: 0, vy: 0, ph: 0 },
    ];

    separarPersonagens(chars, arena.width, arena.height, false);

    for (let first = 0; first < chars.length; first++) {
      for (let second = first + 1; second < chars.length; second++) {
        const horizontal = Math.abs(chars[second].x - chars[first].x) < CHAR_W * 0.8;
        const vertical = Math.abs(chars[second].y - chars[first].y) < CHAR_H * 0.58;
        expect(horizontal && vertical).toBe(false);
      }
    }
  });

  it("rebate na borda esquerda sem sair da arena", () => {
    const chars: LiveChar[] = [
      { uid: "c0", id: "azul_fone", isTarget: false, bx: MARGIN, by: 100, x: MARGIN, y: 100, vx: -1, vy: 0, ph: 0 },
    ];

    passoDeriva(chars, arena.width, arena.height);

    expect(chars[0].vx).toBeGreaterThan(0);
    expect(chars[0].x).toBeGreaterThanOrEqual(MARGIN);
  });

  it("mantém a cena dentro da arena depois de 300 passos", () => {
    const chars = montarCenaEspalhada(
      ["azul_fone", "verde_oculos", "roxo_bone", "amarelo_coroa", "laranja_base"],
      ["azul_fone"],
      arena.width,
      arena.height,
      3,
      randomSequence([0.08, 0.93, 0.31, 0.68, 0.45, 0.77]),
    );

    for (let step = 0; step < 300; step++) passoDeriva(chars, arena.width, arena.height);

    expectInsideArena(chars);
  });

  it("é determinística com a mesma semente e varia com outra", () => {
    const ids = ["azul_fone", "verde_oculos", "roxo_bone"];
    const targets = ["verde_oculos"];
    const first = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.11, 0.22, 0.33, 0.44, 0.55, 0.66]));
    const second = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.11, 0.22, 0.33, 0.44, 0.55, 0.66]));
    const differentSeed = montarCenaEspalhada(ids, targets, arena.width, arena.height, 2,
      randomSequence([0.91, 0.82, 0.73, 0.64, 0.55, 0.46]));

    expect(second).toEqual(first);
    expect(differentSeed).not.toEqual(first);
  });

  it("mantém as fórmulas da deriva no módulo da cena", () => {
    const scene = source("lib/focus/scene.ts");
    const exercise = source("components/exercises/attention/FocusAgents.tsx");

    expect(scene).toMatch(/export const VEL_LEVE/);
    expect(scene).toMatch(/Math\.sin\(frame \* 0\.045 \+ fase\) \* 3/);
    expect(exercise).not.toMatch(/\bVEL_LEVE\b/);
    expect(exercise).not.toMatch(/Math\.sin\(f \* 0\.045 \+ c\.ph\) \* 3/);
  });
});

----- ARQUIVO NOVO: lib/tutorial/pointer-tracking.ts -----
export interface PointerRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PointerPosition {
  x: number;
  y: number;
}

const TRACKING_MOVE_DURATION_MS = 120;

export function centerRelativeToContainer(
  container: PointerRect,
  target: PointerRect,
): PointerPosition {
  return {
    x: target.left - container.left + target.width / 2,
    y: target.top - container.top + target.height / 2,
  };
}

export function pointerMoveDuration(moveDurationMs: number, hasMeasuredTarget: boolean): number {
  if (!hasMeasuredTarget) return moveDurationMs;
  return Math.min(TRACKING_MOVE_DURATION_MS, moveDurationMs / 2);
}

export function shouldUpdatePointerPosition(
  current: PointerPosition | null,
  next: PointerPosition,
): boolean {
  return current === null || current.x !== next.x || current.y !== next.y;
}

----- ARQUIVO NOVO: lib/tutorial/pointer-tracking.test.ts -----
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  centerRelativeToContainer,
  pointerMoveDuration,
  shouldUpdatePointerPosition,
} from "./pointer-tracking";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

function closingBrace(sourceText: string, openingBrace: number): number {
  let depth = 0;
  for (let index = openingBrace; index < sourceText.length; index++) {
    if (sourceText[index] === "{") depth++;
    if (sourceText[index] === "}" && --depth === 0) return index;
  }
  throw new Error("Bloco sem fechamento");
}

describe("pointer tracking", () => {
  it("calcula o centro do alvo nas coordenadas do container", () => {
    expect(centerRelativeToContainer(
      { left: 100, top: 50, width: 400, height: 300 },
      { left: 150, top: 80, width: 40, height: 60 },
    )).toEqual({ x: 70, y: 60 });
  });

  it("usa a duração completa na primeira medição e uma menor ao seguir", () => {
    const moveDurationMs = 500;

    expect(pointerMoveDuration(moveDurationMs, false)).toBe(moveDurationMs);
    expect(pointerMoveDuration(moveDurationMs, true)).toBeLessThan(moveDurationMs);
  });

  it("só atualiza quando a posição do ponteiro mudou", () => {
    expect(shouldUpdatePointerPosition({ x: 70, y: 60 }, { x: 70, y: 60 })).toBe(false);
    expect(shouldUpdatePointerPosition({ x: 70, y: 60 }, { x: 71, y: 60 })).toBe(true);
  });
});

describe("DemoPointer com perseguição opcional", () => {
  it("guarda cada requestAnimationFrame no bloco condicionado a trackTarget", () => {
    const pointer = source("components/exercises/tutorial/DemoPointer.tsx");
    const guard = pointer.indexOf("if (trackTarget) {");
    expect(guard).toBeGreaterThanOrEqual(0);

    const openingBrace = pointer.indexOf("{", guard);
    const endOfGuard = closingBrace(pointer, openingBrace);
    const rafOccurrences = [...pointer.matchAll(/requestAnimationFrame/g)].map((match) => match.index ?? -1);

    expect(rafOccurrences.length).toBeGreaterThan(0);
    expect(rafOccurrences.every((index) => index > guard && index < endOfGuard)).toBe(true);
  });

  it("declara trackTarget como false por padrão", () => {
    expect(source("components/exercises/tutorial/DemoPointer.tsx")).toMatch(/trackTarget\s*=\s*false/);
  });

  it("não habilita perseguição nos tutoriais já convertidos", () => {
    const definitionsDirectory = resolve(process.cwd(), "lib/tutorial/definitions");
    const definitions = (readdirSync(definitionsDirectory, { recursive: true }) as string[])
      .map(String)
      .filter((file) => /\.tsx?$/.test(file));

    for (const definition of definitions) {
      expect(readFileSync(resolve(definitionsDirectory, definition), "utf8")).not.toMatch(/trackTarget/);
    }
  });
});
