== DIFF do lab focus-tut-f3 (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index 8e5ceda..461b6c0 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -44,6 +44,7 @@ import {
   tempoReacaoTutorial,
   vigilanciaTutorial,
 } from "@/lib/tutorial/definitions/estimulo-continuo";
+import { focusAgentsTutorial } from "@/lib/tutorial/definitions/focus-agents";
 import type { TutorialDefinition } from "@/lib/tutorial/types";
 import type { TutorialState } from "@/lib/tutorial/state";
 
@@ -73,6 +74,7 @@ const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>> = Ob
   "dual-task": dualTaskTutorial,
   "mot": motTutorial,
   "certo-ou-errado": certoOuErradoTutorial,
+  "focus-agents": focusAgentsTutorial,
 });
 
 function ExerciseLoader() {
@@ -336,8 +338,20 @@ const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
     "Use eliminação: se souber que Bruno=Verde, marque NÃO para Ana e Carla.",
     "Confirme quando tiver certeza de todas as células!",
   ],
-  "focus-agents": [],
-  "focus-agents-auditivo": [],
+  "focus-agents": [
+    "Antes de cada rodada aparece um comando. Leia com calma e toque em OK.",
+    "O comando some quando a busca começa — guarde-o na memória.",
+    "Encontre o personagem que corresponde e clique nele.",
+    "A rodada tem tempo: se ele acabar antes de você achar, ela passa e vem a próxima.",
+    "Conforme você acerta, aparecem mais personagens e os parecidos aumentam.",
+  ],
+  "focus-agents-auditivo": [
+    "Antes de cada rodada aparece um comando. Leia com calma e toque em OK.",
+    "O comando some quando a busca começa — guarde-o na memória.",
+    "Encontre o personagem que corresponde e clique nele.",
+    "A rodada tem tempo: se ele acabar antes de você achar, ela passa e vem a próxima.",
+    "Conforme você acerta, aparecem mais personagens e os parecidos aumentam.",
+  ],
   "cubo-corsi": [
     "Um cubo 3D com 8 blocos aparecerá na tela.",
     "Alguns blocos vão acender em sequência — observe bem a ordem!",
diff --git a/components/exercises/attention/FocusAgents.tsx b/components/exercises/attention/FocusAgents.tsx
index bd8cd79..16b72e1 100644
--- a/components/exercises/attention/FocusAgents.tsx
+++ b/components/exercises/attention/FocusAgents.tsx
@@ -5,9 +5,9 @@
 // FOCUS-AGENTES-REFORMULACAO-SPEC.md. Fundação em lib/focus/*.
 //  • personagens ESPALHADOS pela tela (grade 2D, nunca em linha), com DERIVA LEVE
 //    que dá sensação de vida; rebatem na borda (não escapam); mais personagens sobe com a dificuldade
-//  • comando é ANUNCIADO antes de cada rodada E fica visível no topo
+//  • comando é ANUNCIADO antes de cada rodada e some durante a busca
 //  • etapas 1–5 por escada de 1 variável/passo · adaptativo por BLOCO de 8
-//  • imagens em proporção 2:3 (não amassam) · tutorial demonstrativo
+//  • imagens em proporção 2:3 (não amassam) · tutorial demonstrativo no framework
 // ─────────────────────────────────────────────────────────────────────────────
 
 import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
@@ -125,68 +125,13 @@ function AnuncioComando({ round, onOk }: { round: FocusRound; onOk: () => void }
   );
 }
 
-// ── Tutorial demonstrativo (grade com o ALVO destacado — como antes) ─────────
-const DEMO = [
-  { id: "azul_fone", alvo: true }, { id: "vermelho_base", alvo: false }, { id: "verde_oculos", alvo: false },
-  { id: "roxo_bone", alvo: false }, { id: "amarelo_coroa", alvo: false }, { id: "laranja_base", alvo: false },
-];
-function Tutorial({ onStart }: { onStart: () => void }) {
-  return (
-    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
-      style={{ background: ARENA_BG }}>
-      {/* "Como realizar o exercício", e não "Como jogar": decisão dela em 10/ago/2026. É uma
-          atividade clínica, e o nome da tela precisa dizer isso ao paciente. */}
-      <h2 className="font-black text-2xl mb-1 text-center" style={{ color: TXT }}>Como realizar o exercício</h2>
-      <p className="text-sm mb-4 text-center" style={{ color: TXT_SUAVE }}>Encontre o personagem indicado.</p>
-
-      {/* Comando de exemplo */}
-      <div className="w-full max-w-xs rounded-2xl px-3 py-2.5 flex items-center gap-3 mb-4"
-        style={{ background: "#FFFFFF", border: `1.5px solid ${ARENA_BORDA}` }}>
-        <span className="w-6 h-6 rounded-full border-2" style={{ background: COR_HEX.azul, borderColor: ARENA_BORDA }} />
-        <span className="text-xl">🎧</span>
-        <p className="font-bold text-sm" style={{ color: TXT }}>Toque no azul com fone</p>
-      </div>
-
-      {/* Grade demo — o ALVO fica destacado com ✓ verde */}
-      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-5">
-        {DEMO.map((d) => (
-          <div key={d.id} className="relative flex items-end justify-center" style={{ height: 116 }}>
-            {/* eslint-disable-next-line @next/next/no-img-element */}
-            <img src={imgSrc(d.id)} alt="" draggable={false}
-              style={{ width: 68, height: 102, objectFit: "contain",
-                filter: d.alvo ? "drop-shadow(0 0 8px rgba(74,222,128,.95)) drop-shadow(0 0 16px rgba(74,222,128,.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,.5))" }} />
-            {d.alvo && <div className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>}
-          </div>
-        ))}
-      </div>
-
-      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-1.5"
-        style={{ background: "#FFFFFF", border: `1px solid ${ARENA_BORDA}` }}>
-        {[
-          "Leia o comando (cor + acessório) que aparece antes e fica no topo.",
-          "No começo eles ficam espalhados; nos níveis seguintes passam a cair de cima.",
-          "Toque só no que corresponde — com a evolução, aparecem mais personagens e a queda acelera.",
-          "Use o 🔊 para ouvir o comando de novo.",
-        ].map((b, i) => (
-          <p key={i} className="text-xs leading-relaxed" style={{ color: TXT_SUAVE }}>• {b}</p>
-        ))}
-      </div>
-
-      <button onClick={onStart}
-        className="w-full max-w-xs h-12 rounded-full font-bold text-white text-base active:scale-95 transition-transform"
-        style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Começar! 🚀</button>
-    </div>
-  );
-}
-
-
 // ── Componente principal ─────────────────────────────────────────────────────
 export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus-agents", settings }: FocusAgentsProps) {
   const auditivo = exerciseId === "focus-agents-auditivo";
   const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
 
-  type Fase = "instrucoes" | "comando" | "jogando" | "feedback";
-  const [fase, setFase] = useState<Fase>("instrucoes");
+  type Fase = "comando" | "jogando" | "feedback";
+  const [fase, setFase] = useState<Fase>("comando");
   const [round, setRound] = useState<FocusRound | null>(null);
   const [chars, setChars] = useState<LiveChar[]>([]);
   const [fb, setFb] = useState<{ ok: boolean; msg: string; alvoUid: string | null } | null>(null);
@@ -215,9 +160,13 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   const clearOmissao = () => { if (omissaoRef.current) { clearTimeout(omissaoRef.current); omissaoRef.current = null; } };
   const stopRaf = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
 
+  useEffect(() => {
+    begin();
+  }, [begin]);
+
   useEffect(() => () => { stopRaf(); clearTimers(); clearOmissao(); cancelTTS(); }, []);
 
-  // Pré-carrega o roster já na tela de instruções, para cada rodada aparecer sem espera.
+  // Pré-carrega o roster na montagem, para cada rodada aparecer sem espera.
   //
   // Antes isto disparava as 144 imagens de uma vez. O navegador abre ~6 conexões por host, então
   // as outras 138 entravam em fila e chegavam em ondas — ela viu personagens surgindo aos poucos,
@@ -496,10 +445,6 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   }, [fase, novaRodada]);
 
   // ── render ─────────────────────────────────────────────────────────────────
-  if (fase === "instrucoes") {
-    return <Tutorial onStart={() => { begin(); setFase("comando"); }} />;
-  }
-
   return (
     <div className="fixed inset-0 flex flex-col" style={{ background: ARENA_BG }}>
       {/* Só a barra de progresso no topo — SEM o comando visível durante a busca
diff --git a/lib/tutorial/estimulo-continuo.test.ts b/lib/tutorial/estimulo-continuo.test.ts
index 8eb95d0..04d9d31 100644
--- a/lib/tutorial/estimulo-continuo.test.ts
+++ b/lib/tutorial/estimulo-continuo.test.ts
@@ -176,14 +176,14 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(modoDe("vigilancia")).toBe("continua");
   });
 
-  it("registra os sete e chega aos 19 convertidos", () => {
+  it("registra os sete e preserva os 20 convertidos", () => {
     const page = source("app/(patient)/treino/[exercicio]/page.tsx");
     const register = page.slice(
       page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
       page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
     );
     const converted = register.match(/(?:"[a-z-]+"|[a-z]+):\s*[a-zA-Z]+Tutorial/g) ?? [];
-    expect(converted).toHaveLength(19);
+    expect(converted).toHaveLength(20);
     for (const exerciseId of [
       "semaforo",
       "vigilancia",
@@ -236,6 +236,7 @@ describe("regra 11 consolidada — na dúvida, Fluxo 1", () => {
       "lib/tutorial/definitions/sequencia-espacial.tsx",
       "lib/tutorial/definitions/conjunto-selecao.tsx",
       "lib/tutorial/definitions/estimulo-continuo.tsx",
+      "lib/tutorial/definitions/focus-agents.tsx",
     ];
 
     for (const caminho of definicoes) {
diff --git a/lib/tutorial/span-reference.test.ts b/lib/tutorial/span-reference.test.ts
index a3c835b..4b73923 100644
--- a/lib/tutorial/span-reference.test.ts
+++ b/lib/tutorial/span-reference.test.ts
@@ -364,6 +364,7 @@ describe("o Span Inverso continua na fábrica compartilhada", () => {
       "cubo-corsi",
       "desafio-supermercado",
       "dual-task",
+      "focus-agents",
       "jogo-memoria",
       "letras-sequencia",
       "lista-distracao",
@@ -603,6 +604,7 @@ describe("T1 congelada — 2. sem emoji no framework do tutorial", () => {
     "lib/tutorial/definitions/sequencia-espacial.tsx",
     "lib/tutorial/definitions/conjunto-selecao.tsx",
     "lib/tutorial/definitions/estimulo-continuo.tsx",
+    "lib/tutorial/definitions/focus-agents.tsx",
     "lib/tutorial/definitions/sequencia-ordenada.tsx",
     "lib/tutorial/definitions/span-numerico.tsx",
     "lib/tutorial/speech-playback.ts",
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/tutorial/definitions/focus-agents.tsx
?? lib/tutorial/focus-agents.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover focus-tut-f3 ==

== CONTEUDO DOS ARQUIVOS NOVOS ==

----- ARQUIVO NOVO: lib/tutorial/definitions/focus-agents.tsx
lib/tutorial/focus-agents.test.ts -----
cat: /Users/codexmbair/codex-lab/labs/focus-tut-f3/lib/tutorial/definitions/focus-agents.tsx
lib/tutorial/focus-agents.test.ts: No such file or directory

== CONTEUDO DOS ARQUIVOS NOVOS (refeito) ==

----- ARQUIVO NOVO: lib/tutorial/definitions/focus-agents.tsx -----
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye } from "lucide-react";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { gerarRodada, type FocusRound } from "@/lib/focus/commands";
import { STEPS } from "@/lib/focus/progression";
import { charById, COR_HEX, type FocusChar } from "@/lib/focus/roster";
import {
  CHAR_H,
  CHAR_W,
  bobOffset,
  montarCenaEspalhada,
  passoDeriva,
  type LiveChar,
} from "@/lib/focus/scene";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

const IMG_BASE = "/exercises/agentes-personagens";
const IMG_VERSION = "?v=2";
const SCENE_HEIGHT = 480;
const MAX_SCENE_ATTEMPTS = 20;
const COMMAND_PAUSE_MS = 1800;
const SCENE_ENTRY_PAUSE_MS = 500;

interface TutorialScene {
  round: FocusRound;
  characters: LiveChar[];
  width: number;
  height: number;
}

function imageSource(id: string): string {
  return `${IMG_BASE}/${id}.png${IMG_VERSION}`;
}

function sharesAttribute(target: FocusChar, distractor: FocusChar): boolean {
  return target.cor === distractor.cor
    || target.acessorios.some((accessory) => distractor.acessorios.includes(accessory))
    || (!!target.objeto && target.objeto === distractor.objeto);
}

function hasSimilarDistractor(round: FocusRound): boolean {
  const target = charById(round.alvoId);
  if (!target) return false;

  return round.personagensIds.some((id) => {
    if (id === round.alvoId) return false;
    const distractor = charById(id);
    return !!distractor && sharesAttribute(target, distractor);
  });
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

function CommandCard({ round, onConfirm }: { round: FocusRound; onConfirm?: () => void }) {
  const parts = round.texto.split("**");

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-3xl border border-[#DDE3EC] bg-white px-6 py-6 text-center shadow-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#5b6b82]">
          <Eye aria-hidden className="mr-1 inline h-4 w-4" />
          Encontre
        </p>
        {round.amostraCor && (
          <span
            aria-hidden
            className="mx-auto mb-2 block h-8 w-8 rounded-full border-2 border-[#DDE3EC]"
            style={{ background: COR_HEX[round.amostraCor] }}
          />
        )}
        <p className="text-lg font-black leading-snug text-[#0f2038]">
          {parts.map((part, index) => index % 2 === 1
            ? <span key={index} className="text-red-400">{part}</span>
            : <span key={index}>{part}</span>)}
        </p>
        <p className="mt-3 text-xs text-[#5b6b82]">
          Guarde bem — depois de começar, o alvo não fica na tela.
        </p>
        <button
          type="button"
          disabled={!onConfirm}
          onClick={onConfirm}
          className="mt-4 h-11 rounded-full bg-sky-600 px-10 text-base font-black text-white disabled:opacity-100"
        >
          OK
        </button>
      </div>
    </div>
  );
}

function MovingCharacters({
  characters,
  width,
  height,
  interactive,
  hitId,
  onSelect,
}: {
  characters: LiveChar[];
  width: number;
  height: number;
  interactive: boolean;
  hitId: string | null;
  onSelect: (character: LiveChar) => void;
}) {
  const charactersRef = useRef(characters);
  const nodes = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    charactersRef.current = characters;
    let frame = 0;
    let animationFrameId: number | null = null;

    const tick = () => {
      frame += 1;
      passoDeriva(charactersRef.current, width, height);
      for (const character of charactersRef.current) {
        const node = nodes.current.get(character.uid);
        if (!node) continue;
        const bob = bobOffset(frame, character.ph);
        node.style.transform = `translate(${character.x - character.bx}px, ${character.y - character.by + bob}px)`;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, [characters, height, width]);

  return (
    <>
      {characters.map((character) => (
        <button
          key={character.uid}
          ref={(node) => {
            if (node) nodes.current.set(character.uid, node);
            else nodes.current.delete(character.uid);
          }}
          type="button"
          data-focus-character={character.uid}
          aria-label="personagem"
          aria-disabled={!interactive}
          onPointerDown={() => {
            if (interactive) onSelect(character);
          }}
          className="absolute border-0 bg-transparent p-[10px]"
          style={{
            left: character.bx - 10,
            top: character.by - 10,
            width: CHAR_W + 20,
            height: CHAR_H + 20,
            cursor: interactive ? "pointer" : "default",
            touchAction: "manipulation",
            zIndex: hitId === character.id ? 20 : 10,
            boxShadow: hitId === character.id ? "0 0 0 4px #22c55e" : undefined,
            borderRadius: hitId === character.id ? 16 : undefined,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSource(character.id)}
            alt=""
            draggable={false}
            decoding="async"
            style={{
              width: CHAR_W,
              height: CHAR_H,
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
              filter: "drop-shadow(0 3px 6px rgba(0,0,0,.45))",
            }}
          />
        </button>
      ))}
      <span
        data-demo-pointer-start
        aria-hidden
        className="absolute bottom-8 left-8 h-px w-px"
      />
    </>
  );
}

function CorrectFeedback({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[90%] -translate-x-1/2 items-center gap-1 rounded-xl bg-green-600/95 px-4 py-2 text-center text-sm font-bold text-white">
      <Check aria-hidden className="h-4 w-4" />
      Correto!
    </div>
  );
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [showScene, setShowScene] = useState(false);
  const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
    "locating",
  );
  const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
  const [correct, setCorrect] = useState(false);
  onDoneRef.current = onDone;

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const width = arena.clientWidth;
    const height = arena.clientHeight;
    let round = gerarRodada(
      STEPS[0].etapa,
      STEPS[0].n,
      undefined,
      STEPS[0].semelhantes,
    );
    for (let attempt = 1; attempt < MAX_SCENE_ATTEMPTS && !hasSimilarDistractor(round); attempt++) {
      round = gerarRodada(
        STEPS[0].etapa,
        STEPS[0].n,
        undefined,
        STEPS[0].semelhantes,
      );
    }
    const characters = montarCenaEspalhada(
      round.personagensIds,
      [round.alvoId],
      width,
      height,
      STEPS[0].vel,
    );
    setScene({ round, characters, width, height });
  }, []);

  useEffect(() => {
    if (!scene) return;
    let cancelled = false;

    async function run() {
      if (!await wait(COMMAND_PAUSE_MS, () => cancelled)) return;
      setShowScene(true);
      if (!await wait(SCENE_ENTRY_PAUSE_MS, () => cancelled)) return;
      const target = scene.characters.find((character) => character.id === scene.round.alvoId);
      if (!target) return;
      setTargetSelector(`[data-focus-character="${target.uid}"]`);
      setPointerPhase("moving");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;
      setPointerPhase("pressing");
      if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;
      setCorrect(true);
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
      className="relative w-full overflow-hidden rounded-2xl border border-[#DDE3EC] bg-white"
      style={{ height: SCENE_HEIGHT }}
    >
      {scene && !showScene && <CommandCard round={scene.round} />}
      {scene && showScene && (
        <>
          <MovingCharacters
            characters={scene.characters}
            width={scene.width}
            height={scene.height}
            interactive={false}
            hitId={correct ? scene.round.alvoId : null}
            onSelect={() => {}}
          />
          <CorrectFeedback visible={correct} />
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
  const arenaRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<TutorialScene | null>(null);
  const [showScene, setShowScene] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const width = arena.clientWidth;
    const height = arena.clientHeight;
    let round = gerarRodada(
      STEPS[0].etapa,
      STEPS[0].n,
      undefined,
      STEPS[0].semelhantes,
    );
    for (let attempt = 1; attempt < MAX_SCENE_ATTEMPTS && !hasSimilarDistractor(round); attempt++) {
      round = gerarRodada(
        STEPS[0].etapa,
        STEPS[0].n,
        undefined,
        STEPS[0].semelhantes,
      );
    }
    const characters = montarCenaEspalhada(
      round.personagensIds,
      [round.alvoId],
      width,
      height,
      STEPS[0].vel,
    );
    setScene({ round, characters, width, height });
  }, []);

  function handleSelect(character: LiveChar) {
    if (!scene || answered) return;
    const isCorrect = character.id === scene.round.alvoId;
    setAnswered(true);
    setSelectedId(character.id);
    onOutcome(isCorrect ? "correct" : "incorrect");
  }

  return (
    <div
      ref={arenaRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#DDE3EC] bg-white"
      style={{ height: SCENE_HEIGHT }}
    >
      {scene && !showScene && (
        <CommandCard round={scene.round} onConfirm={() => setShowScene(true)} />
      )}
      {scene && showScene && (
        <>
          <MovingCharacters
            characters={scene.characters}
            width={scene.width}
            height={scene.height}
            interactive={!answered}
            hitId={selectedId === scene.round.alvoId ? selectedId : null}
            onSelect={handleSelect}
          />
          <CorrectFeedback visible={selectedId === scene.round.alvoId} />
        </>
      )}
    </div>
  );
}

export const focusAgentsTutorial: TutorialDefinition = {
  exerciseId: "focus-agents",
  version: 2,
  Demonstration,
  GuidedAttempt,
  guidedInstruction: "Clique no personagem que corresponde ao comando.",
  retryHint: "Tente novamente e clique no personagem indicado.",
  smallestValidUnit: STEPS[0].n,
};

----- ARQUIVO NOVO: lib/tutorial/focus-agents.test.ts -----
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STEPS } from "@/lib/focus/progression";
import { TUTORIAL_VERSIONS } from "@/lib/tutorial/versions";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

const definition = () => source("lib/tutorial/definitions/focus-agents.tsx");
const exercise = () => source("components/exercises/attention/FocusAgents.tsx");
const page = () => source("app/(patient)/treino/[exercicio]/page.tsx");

function definitionField(field: string): string {
  const match = definition().match(new RegExp(`${field}:\\s*"([^"]+)"`));
  expect(match, `campo ${field} ausente`).not.toBeNull();
  return match![1];
}

describe("Focus Agentes — tutorial T1", () => {
  it("usa o Fluxo 1, sem modo explicativo", () => {
    expect(definition()).not.toMatch(/modo:\s*"explicativo"/);
    expect(definition()).not.toMatch(/\bexplicacao\s*:/);
  });

  it("mantém a versão da definição coerente com o registro global", () => {
    expect(definition()).toMatch(/version:\s*2\b/);
    expect(TUTORIAL_VERSIONS["focus-agents"]).toBe(2);
  });

  it("usa o verbo real do gesto e não orienta toque ou teclado", () => {
    expect(definitionField("guidedInstruction")).toMatch(/\bclique\b/i);
    expect(definition()).not.toMatch(/teclado/i);
    expect(definitionField("guidedInstruction")).not.toMatch(/\btoque\b/i);
  });

  it("deriva a menor unidade do primeiro degrau clínico", () => {
    expect(definition()).toMatch(/smallestValidUnit:\s*STEPS\[0\]\.n/);
    expect(definition()).not.toMatch(
      new RegExp(`smallestValidUnit:\\s*${STEPS[0].n}\\b`),
    );
  });

  it("gera a cena somente depois do início do primeiro componente", () => {
    const fonte = definition();
    const firstFunction = fonte.search(/\bfunction\s+[A-Z]\w*\s*\(/);
    const firstRoundCall = fonte.indexOf("gerarRodada(");
    const firstSceneCall = fonte.indexOf("montarCenaEspalhada(");

    expect(firstFunction).toBeGreaterThan(-1);
    expect(firstRoundCall).toBeGreaterThan(firstFunction);
    expect(firstSceneCall).toBeGreaterThan(firstFunction);
    expect(fonte).toMatch(/attempt < MAX_SCENE_ATTEMPTS && !hasSimilarDistractor\(round\)/);
  });

  it("move a cena na demonstração e acompanha o alvo", () => {
    expect(definition()).toMatch(/\bpassoDeriva\b/);
    expect(definition()).toMatch(/\btrackTarget\b/);
  });

  it("não mede desempenho na tentativa guiada", () => {
    expect(definition()).not.toMatch(
      /Date\.now|performance\.now|reactionTime|score|accuracy|omiss/i,
    );
  });

  it("não cria um segundo caminho de gravação", () => {
    expect(definition()).not.toMatch(/onTutorialDone|fetch\(|tutorialCompletedAt/);
  });

  it("usa exatamente os cinco textos aprovados na preparação dos dois modos", () => {
    const textos = [
      "Antes de cada rodada aparece um comando. Leia com calma e toque em OK.",
      "O comando some quando a busca começa — guarde-o na memória.",
      "Encontre o personagem que corresponde e clique nele.",
      "A rodada tem tempo: se ele acabar antes de você achar, ela passa e vem a próxima.",
      "Conforme você acerta, aparecem mais personagens e os parecidos aumentam.",
    ];
    const fonte = page();
    const focusStart = fonte.indexOf('"focus-agents": [');
    const audioStart = fonte.indexOf('"focus-agents-auditivo": [');
    const focusBlock = fonte.slice(focusStart, audioStart);
    const audioBlock = fonte.slice(audioStart, fonte.indexOf("],", audioStart) + 2);

    for (const block of [focusBlock, audioBlock]) {
      for (const texto of textos) expect(block).toContain(texto);
      const bullets = block.match(/^\s+".*",$/gm) ?? [];
      expect(bullets).toHaveLength(5);
    }
    expect(`${focusBlock}\n${audioBlock}\n${exercise()}`).not.toMatch(
      /fica no topo|cair de cima|queda acelera|Use o 🔊/,
    );
  });

  it("remove a tela interna de instruções", () => {
    expect(exercise()).not.toMatch(/"instrucoes"|function Tutorial|const DEMO/);
  });

  it("inicia o cronômetro num efeito de montagem", () => {
    expect(exercise()).toMatch(/useEffect\(\(\) => \{\s*begin\(\);\s*\}, \[begin\]\)/);
    expect(exercise()).not.toMatch(/function Tutorial/);
  });

  it("registra somente o modo visual", () => {
    const fonte = page();
    const start = fonte.indexOf("const TUTORIAIS_POR_EXERCICIO");
    const register = fonte.slice(start, fonte.indexOf("});", start));

    expect(register).toMatch(/"focus-agents":\s*focusAgentsTutorial/);
    expect(register).not.toMatch(/"focus-agents-auditivo"\s*:/);
  });
});
