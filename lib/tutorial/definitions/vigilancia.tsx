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
/**
 * A menor unidade da mecânica: UMA região apontada por tentativa.
 *
 * Aqui o valor é 1 de verdade, e está escrito como 1 de propósito. A regra da casa proíbe número
 * SOLTO — um literal jogado no meio da definição, que envelhece calado quando a escada clínica
 * muda. Ela não pede que se disfarce o número: a primeira versão dividia o total de posições por
 * ele mesmo, o que dá sempre 1 e não deriva de coisa alguma — tautologia com cara de fórmula,
 * escrita para passar no teste. Uma constante nomeada diz o que o número significa, que é o que a
 * regra quer. (O teste proíbe esse padrão, então ele não aparece escrito nem aqui.)
 *
 * O que varia entre níveis na Vigilância é o ARRANJO das posições e o tempo de exposição, nunca
 * a quantidade de respostas: sempre se aponta uma região, e só uma.
 */
const UMA_REGIAO_POR_TENTATIVA = 1;

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
  smallestValidUnit: UMA_REGIAO_POR_TENTATIVA,
};
