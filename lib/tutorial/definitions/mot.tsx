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
    // Capturado aqui porque uma declaração de função não herda o estreitamento de tipo do
    // escopo que a cerca: dentro de `run`/`present` o compilador ainda vê `dimensions` como
    // possivelmente nula. Foi o mesmo erro que o build pegou no tutorial do Focus.
    const dims = dimensions;

    async function run() {
      if (!await wait(MEMORIZE_MS, () => cancelled)) return;
      setPhase("track");
      const finalBalls = await animateTracking(initialBalls, dims, nodes, () => cancelled);
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
    // Capturado aqui porque uma declaração de função não herda o estreitamento de tipo do
    // escopo que a cerca: dentro de `run`/`present` o compilador ainda vê `dimensions` como
    // possivelmente nula. Foi o mesmo erro que o build pegou no tutorial do Focus.
    const dims = dimensions;

    async function present() {
      if (!await wait(MEMORIZE_MS, () => cancelled)) return;
      setPhase("track");
      const finalBalls = await animateTracking(initialBalls, dims, nodes, () => cancelled);
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
