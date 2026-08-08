"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { RITMO_TUTORIAL_APROVADO } from "@/lib/tutorial/definitions/sequencia-ordenada";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

interface EstimuloBase {
  id: string;
  isTarget: boolean;
}

interface PainelEstimuloProps<T extends EstimuloBase> {
  stimulus: T;
  interactive: boolean;
  pressed: boolean;
  hitIds: ReadonlySet<string>;
  onAction: (action: string) => void;
}

interface FamiliaEstimuloConfig<T extends EstimuloBase> {
  exerciseId: string;
  version: number;
  /** Regra 11: o modo é POR EXERCÍCIO, não por família — inclusive "explicativo". */
  modo: "completa" | "continua" | "explicativo";
  /** Linhas da regra, quando o modo é "explicativo". */
  explicacao?: string[];
  guidedInstruction: string;
  retryHint: string;
  smallestValidUnit: number;
  demonstrationStimuli: readonly T[];
  guidedStimuli: readonly T[];
  Board: ComponentType<PainelEstimuloProps<T>>;
  expectedActionFor: (stimulus: T) => string;
  targetSelectorFor: (stimulus: T) => string;
}

// Único tempo novo da família: torna perceptível que não agir diante do não-alvo é intencional.
const DELIBERATE_WAIT_MS = 1200;
const WAIT_LABEL = "agora não";

function wait(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (isCancelled()) {
      resolve(false);
      return;
    }

    let settled = false;
    const finish = (completed: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(cancelCheck);
      resolve(completed);
    };
    const timeoutId = window.setTimeout(() => finish(!isCancelled()), ms);
    const cancelCheck = window.setInterval(() => {
      if (isCancelled()) finish(false);
    }, 25);
  });
}

function criarDemonstration<T extends EstimuloBase>(config: FamiliaEstimuloConfig<T>) {
  return function Demonstration({ onDone }: { onDone: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onDoneRef = useRef(onDone);
    const [stimulus, setStimulus] = useState<T>(config.demonstrationStimuli[0]);
    const [targetSelector, setTargetSelector] = useState("[data-demo-pointer-start]");
    const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
      "locating",
    );
    const [pressed, setPressed] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [hitIds, setHitIds] = useState<ReadonlySet<string>>(new Set());
    onDoneRef.current = onDone;

    useEffect(() => {
      let cancelled = false;

      async function run() {
        setTargetSelector("[data-demo-pointer-start]");
        setPointerPhase("locating");
        if (!await wait(RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs, () => cancelled)) return;

        for (let index = 0; index < config.demonstrationStimuli.length; index++) {
          const current = config.demonstrationStimuli[index];
          setStimulus(current);
          setPressed(false);
          if (!await wait(RITMO_TUTORIAL_APROVADO.stimulusOnMs, () => cancelled)) return;

          if (current.isTarget) {
            setTargetSelector(config.targetSelectorFor(current));
            setPointerPhase("moving");
            if (!await wait(RITMO_TUTORIAL_APROVADO.pointerMoveMs, () => cancelled)) return;
            if (!await wait(RITMO_TUTORIAL_APROVADO.pointerAimMs, () => cancelled)) return;

            setPointerPhase("pressing");
            setPressed(true);
            if (!await wait(RITMO_TUTORIAL_APROVADO.pointerPressMs, () => cancelled)) return;

            setPressed(false);
            setPointerPhase("moving");
            if (!await wait(RITMO_TUTORIAL_APROVADO.pointerReleaseMs, () => cancelled)) return;
            setHitIds((currentHits) => new Set(currentHits).add(current.id));
          } else {
            // O seletor não muda: o DemoPointer continua visível exatamente onde estava.
            setWaiting(true);
            if (!await wait(DELIBERATE_WAIT_MS, () => cancelled)) return;
            setWaiting(false);
          }

          if (index < config.demonstrationStimuli.length - 1
            && !await wait(RITMO_TUTORIAL_APROVADO.betweenStimuliMs, () => cancelled)) return;
        }

        if (!await wait(RITMO_TUTORIAL_APROVADO.finalPauseMs, () => cancelled)) return;
        onDoneRef.current();
      }

      void run();
      return () => { cancelled = true; };
    }, []);

    return (
      <div ref={containerRef} className="relative pointer-events-none">
        <span
          data-demo-pointer-start
          aria-hidden="true"
          className="absolute bottom-10 left-8 h-px w-px"
        />
        <config.Board
          stimulus={stimulus}
          interactive={false}
          pressed={pressed}
          hitIds={hitIds}
          onAction={() => {}}
        />
        {waiting && (
          <div
            data-wait-label
            className="mt-3 text-center text-xs font-medium tracking-wide text-slate-500"
          >
            {WAIT_LABEL}
          </div>
        )}
        <DemoPointer
          containerRef={containerRef}
          targetSelector={targetSelector}
          phase={pointerPhase}
          moveDurationMs={RITMO_TUTORIAL_APROVADO.pointerMoveMs}
          entryPulseDurationMs={RITMO_TUTORIAL_APROVADO.pointerEntryPulseMs}
        />
      </div>
    );
  };
}

function criarGuidedAttempt<T extends EstimuloBase>(config: FamiliaEstimuloConfig<T>) {
  return function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
    const [index, setIndex] = useState(0);
    const [pressed, setPressed] = useState(false);
    const [hitIds, setHitIds] = useState<ReadonlySet<string>>(new Set());
    const correctActions = useRef(0);
    const stimulus = config.guidedStimuli[index];

    useEffect(() => {
      if (!stimulus || stimulus.isTarget) return;

      // Isto controla somente a apresentação do não-alvo. Um alvo não possui timeout: permanece
      // disponível e aceita a resposta quando ela vier, como exige a regra 6.
      const timer = window.setTimeout(() => {
        setIndex((current) => Math.min(current + 1, config.guidedStimuli.length - 1));
      }, DELIBERATE_WAIT_MS);
      return () => window.clearTimeout(timer);
      // `config` é fixo por definição de tutorial — só o estímulo atual precisa disparar o efeito.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stimulus]);

    if (!stimulus) return null;

    function handleAction(action: string) {
      if (pressed) return;
      if (!stimulus.isTarget || action !== config.expectedActionFor(stimulus)) {
        onOutcome("incorrect");
        return;
      }

      setPressed(true);
      setHitIds((currentHits) => new Set(currentHits).add(stimulus.id));
      correctActions.current += 1;
      if (correctActions.current >= config.smallestValidUnit) {
        onOutcome("correct");
        return;
      }

      setPressed(false);
      setIndex((current) => Math.min(current + 1, config.guidedStimuli.length - 1));
    }

    return (
      <config.Board
        stimulus={stimulus}
        interactive
        pressed={pressed}
        hitIds={hitIds}
        onAction={handleAction}
      />
    );
  };
}

/** Uma única fábrica contém o ritmo, a espera, o cursor e o gesto da Família 4. */
function criarTutorialEstimuloContinuo<T extends EstimuloBase>(
  config: FamiliaEstimuloConfig<T>,
): TutorialDefinition {
  if (config.modo === "continua") {
    const hasTarget = config.demonstrationStimuli.some((stimulus) => stimulus.isTarget);
    const hasNonTarget = config.demonstrationStimuli.some((stimulus) => !stimulus.isTarget);
    if (!hasTarget || !hasNonTarget) {
      throw new Error(`${config.exerciseId}: demonstração contínua exige alvo e não-alvo`);
    }
  }

  return {
    exerciseId: config.exerciseId,
    version: config.version,
    modo: config.modo,
    explicacao: config.explicacao,
    Demonstration: criarDemonstration(config),
    GuidedAttempt: criarGuidedAttempt(config),
    retryHint: config.retryHint,
    guidedInstruction: config.guidedInstruction,
    smallestValidUnit: config.smallestValidUnit,
  };
}

function HitMark({ visible }: { visible: boolean }) {
  return (
    <span
      aria-label={visible ? "acerto" : undefined}
      className={`ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${
        visible ? "border-emerald-600 bg-emerald-100 text-emerald-700" : "border-transparent"
      }`}
    >
      {visible ? "OK" : ""}
    </span>
  );
}

interface SemaforoStimulus extends EstimuloBase {
  color: "red" | "green";
}

function SemaforoBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<SemaforoStimulus>) {
  const colors = ["#ef4444", "#eab308", "#22c55e"];
  const active = stimulus.color === "red" ? 0 : 2;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-24 flex-col items-center gap-2 rounded-2xl bg-slate-900 p-3">
        {colors.map((color, index) => (
          <span
            key={color}
            className="h-12 w-12 rounded-full"
            style={{ background: index === active ? color : "#334155", opacity: index === active ? 1 : 0.25 }}
          />
        ))}
      </div>
      <button
        data-action="advance"
        type="button"
        onClick={() => interactive && onAction("advance")}
        className={`w-full rounded-xl bg-emerald-600 py-3 font-bold text-white ${pressed ? "scale-95" : ""}`}
      >
        AVANÇAR
        <HitMark visible={hitIds.has(stimulus.id)} />
      </button>
    </div>
  );
}

interface PipaStimulus extends EstimuloBase {
  targetPosition: number | null;
}

function Pipa({ different }: { different: boolean }) {
  return (
    <span className="relative block h-16 w-12">
      <span
        className={`absolute left-2 top-2 h-9 w-9 rotate-45 border-2 ${
          different ? "border-indigo-700 bg-indigo-300" : "border-sky-700 bg-sky-300"
        }`}
      />
      <span className="absolute bottom-0 left-6 h-5 w-px rotate-12 bg-slate-500" />
    </span>
  );
}

function VigilanciaBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<PipaStimulus>) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <div className="mb-3 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((position) => (
          <button
            key={position}
            data-action={position === stimulus.targetPosition ? "kite" : undefined}
            type="button"
            onClick={() => interactive && onAction(position === stimulus.targetPosition ? "kite" : "other")}
            className={`flex min-h-24 items-center justify-center rounded-xl border bg-white ${pressed && position === stimulus.targetPosition ? "scale-95" : ""}`}
          >
            <Pipa different={position === stimulus.targetPosition} />
          </button>
        ))}
      </div>
      <div className="h-6 text-center text-xs font-bold text-emerald-700">
        {hitIds.has(stimulus.id) ? "Alvo encontrado" : ""}
      </div>
    </div>
  );
}

interface BalloonStimulus extends EstimuloBase {
  color: "green" | "red";
}

function TempoReacaoBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<BalloonStimulus>) {
  return (
    <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-sky-50">
      <button
        data-action="balloon"
        type="button"
        onClick={() => interactive && onAction("balloon")}
        className={`flex flex-col items-center ${pressed ? "scale-90" : ""}`}
      >
        <span
          className="block h-24 w-20 rounded-[50%_50%_45%_45%] border-2 border-black/10"
          style={{ background: stimulus.color === "green" ? "#16a34a" : "#dc2626" }}
        />
        <span className="h-6 w-px bg-slate-500" />
        <HitMark visible={hitIds.has(stimulus.id)} />
      </button>
    </div>
  );
}

interface NBackStimulus extends EstimuloBase {
  history: readonly string[];
  letter: string;
  priming?: boolean;
}

function NBackBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<NBackStimulus>) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-500">
        {stimulus.history.map((letter, index) => (
          <span key={`${letter}-${index}`} className="rounded-lg border bg-white px-3 py-2">{letter}</span>
        ))}
      </div>
      <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-indigo-400 bg-white text-5xl font-bold text-indigo-800">
        {stimulus.letter}
      </div>
      <p className="mb-3 min-h-5 text-xs text-slate-600">
        {stimulus.priming ? "Observe a letra." : "É igual à de duas posições atrás?"}
      </p>
      <button
        data-action="same"
        type="button"
        onClick={() => interactive && onAction("same")}
        className={`w-full rounded-xl bg-emerald-600 py-3 font-bold text-white ${pressed ? "scale-95" : ""}`}
      >
        IGUAL
        <HitMark visible={hitIds.has(stimulus.id)} />
      </button>
    </div>
  );
}

type ShapeKind = "circle" | "triangle";
interface DualStimulus extends EstimuloBase {
  shape: ShapeKind;
  shapeColor: "green" | "red";
  digit: number;
  previousDigit: number;
  action: "shape" | "digit" | "none";
}

function DualTaskBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<DualStimulus>) {
  const shapeStyle = stimulus.shape === "circle"
    ? { borderRadius: "50%" }
    : { clipPath: "polygon(50% 0, 100% 100%, 0 100%)" };
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        data-action="shape"
        type="button"
        onClick={() => interactive && onAction("shape")}
        className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 ${pressed && stimulus.action === "shape" ? "scale-95" : ""}`}
      >
        <span
          className="mb-3 block h-20 w-20"
          style={{ ...shapeStyle, background: stimulus.shapeColor === "green" ? "#16a34a" : "#dc2626" }}
        />
        <span className="text-xs font-bold text-slate-700">TRIÂNGULO VERDE</span>
        <HitMark visible={hitIds.has(stimulus.id) && stimulus.action === "shape"} />
      </button>
      <button
        data-action="digit"
        type="button"
        onClick={() => interactive && onAction("digit")}
        className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 ${pressed && stimulus.action === "digit" ? "scale-95" : ""}`}
      >
        <span className="mb-1 text-xs text-slate-500">Anterior: {stimulus.previousDigit}</span>
        <span className="mb-3 text-6xl font-bold text-indigo-700">{stimulus.digit}</span>
        <span className="text-xs font-bold text-slate-700">NÚMERO REPETIDO</span>
        <HitMark visible={hitIds.has(stimulus.id) && stimulus.action === "digit"} />
      </button>
    </div>
  );
}

interface MotStimulus extends EstimuloBase {
  stage: "memorize" | "track" | "identify";
  action: string;
  focusBall: number | null;
}

const MOT_BALLS = [
  { id: 0, target: true, start: [12, 18], end: [62, 58] },
  { id: 1, target: true, start: [68, 16], end: [22, 62] },
  { id: 2, target: false, start: [18, 64], end: [70, 20] },
  { id: 3, target: false, start: [70, 65], end: [42, 14] },
] as const;

function MotBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<MotStimulus>) {
  return (
    <div>
      <div className="mb-2 text-center text-xs font-medium text-slate-600">
        {stimulus.stage === "memorize" ? "Observe os alvos claros." : stimulus.stage === "track" ? "Acompanhe o movimento." : "Selecione os alvos."}
      </div>
      <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50">
        {MOT_BALLS.map((ball) => {
          const position = stimulus.stage === "memorize" ? ball.start : ball.end;
          const action = `ball-${ball.id}`;
          const selected = [...hitIds].some((id) => id.endsWith(action));
          return (
            <button
              key={ball.id}
              data-action={action}
              type="button"
              onClick={() => interactive && onAction(action)}
              className={`absolute flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                stimulus.stage === "memorize" && ball.target
                  ? "border-amber-500 bg-amber-300"
                  : selected ? "border-emerald-600 bg-emerald-300" : "border-slate-500 bg-slate-300"
              } ${pressed && stimulus.action === action ? "scale-90" : ""}`}
              style={{
                left: `${position[0]}%`,
                top: `${position[1]}%`,
                transitionDuration: `${RITMO_TUTORIAL_APROVADO.stimulusOnMs}ms`,
              }}
            >
              {selected ? "OK" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CertoErradoStimulus extends EstimuloBase {
  statement: string;
  answer: "certo" | "errado";
}

function CertoOuErradoBoard({ stimulus, interactive, pressed, hitIds, onAction }: PainelEstimuloProps<CertoErradoStimulus>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-4 min-h-16 rounded-xl bg-white p-4 text-center text-sm font-medium text-slate-800">
        {stimulus.statement}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(["certo", "errado"] as const).map((answer) => (
          <button
            key={answer}
            data-action={answer}
            type="button"
            onClick={() => interactive && onAction(answer)}
            className={`rounded-xl py-3 font-bold text-white ${answer === "certo" ? "bg-emerald-600" : "bg-rose-600"} ${pressed && stimulus.answer === answer ? "scale-95" : ""}`}
          >
            {answer.toUpperCase()}
            <HitMark visible={hitIds.has(stimulus.id) && stimulus.answer === answer} />
          </button>
        ))}
      </div>
    </div>
  );
}

const ONE_RESPONSE = 1;
const TWO_TASK_RESPONSES = 2;
const MOT_MINIMUM_TARGETS = MOT_BALLS.filter((ball) => ball.target).length;

const semaforoDemo: readonly SemaforoStimulus[] = [
  { id: "semaforo-red", color: "red", isTarget: false },
  { id: "semaforo-green", color: "green", isTarget: true },
];

export const semaforoTutorial = criarTutorialEstimuloContinuo<SemaforoStimulus>({
  exerciseId: "semaforo",
  version: 1,
  // Validado por ela em 07/ago/2026: a demonstração animada tornou o entendimento MAIS artificial,
  // não menos. A regra do semáforo é simples o bastante para se enunciar — e enunciá-la ensina
  // melhor do que animá-la. Critério: a demonstração aumenta a compreensão? Aqui, não.
  modo: "explicativo",
  explicacao: [
    "Quando aparecer o sinal verde, clique.",
    "Quando aparecer o sinal vermelho, não clique.",
  ],
  guidedInstruction: "Clique em avançar somente quando o sinal abrir.",
  retryHint: "Espere o sinal verde e clique em avançar.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: semaforoDemo,
  guidedStimuli: semaforoDemo,
  Board: SemaforoBoard,
  expectedActionFor: () => "advance",
  targetSelectorFor: () => '[data-action="advance"]',
});

const vigilanciaDemo: readonly PipaStimulus[] = [
  { id: "vigilancia-common", targetPosition: null, isTarget: false },
  { id: "vigilancia-target", targetPosition: 1, isTarget: true },
];

export const vigilanciaTutorial = criarTutorialEstimuloContinuo<PipaStimulus>({
  exerciseId: "vigilancia",
  version: 2,
  modo: "continua",
  guidedInstruction: "Clique quando a pipa alvo aparecer.",
  retryHint: "Espere a pipa diferente aparecer e clique nela.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: vigilanciaDemo,
  guidedStimuli: vigilanciaDemo,
  Board: VigilanciaBoard,
  expectedActionFor: () => "kite",
  targetSelectorFor: () => '[data-action="kite"]',
});

const tempoReacaoDemo: readonly BalloonStimulus[] = [
  { id: "balloon-red", color: "red", isTarget: false },
  { id: "balloon-green", color: "green", isTarget: true },
];

export const tempoReacaoTutorial = criarTutorialEstimuloContinuo<BalloonStimulus>({
  exerciseId: "tempo-reacao",
  version: 1,
  modo: "continua",
  guidedInstruction: "Clique assim que o sinal aparecer.",
  retryHint: "Espere o balão verde e clique nele.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: tempoReacaoDemo,
  guidedStimuli: tempoReacaoDemo,
  Board: TempoReacaoBoard,
  expectedActionFor: () => "balloon",
  targetSelectorFor: () => '[data-action="balloon"]',
});

const nbackDemo: readonly NBackStimulus[] = [
  { id: "nback-prime-a", history: [], letter: "A", priming: true, isTarget: false },
  { id: "nback-prime-b", history: ["A"], letter: "B", priming: true, isTarget: false },
  { id: "nback-different", history: ["A", "B"], letter: "C", isTarget: false },
  { id: "nback-same", history: ["B", "C"], letter: "B", isTarget: true },
];

export const nbackTutorial = criarTutorialEstimuloContinuo<NBackStimulus>({
  exerciseId: "nback",
  version: 1,
  modo: "continua",
  guidedInstruction: "Clique quando a letra for igual à de duas posições atrás.",
  retryHint: "Compare a letra atual com a de duas posições atrás e clique quando forem iguais.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: nbackDemo,
  guidedStimuli: nbackDemo,
  Board: NBackBoard,
  expectedActionFor: () => "same",
  targetSelectorFor: () => '[data-action="same"]',
});

const dualTaskDemo: readonly DualStimulus[] = [
  { id: "dual-wait", shape: "circle", shapeColor: "red", digit: 4, previousDigit: 2, action: "none", isTarget: false },
  { id: "dual-shape", shape: "triangle", shapeColor: "green", digit: 3, previousDigit: 4, action: "shape", isTarget: true },
  { id: "dual-digit", shape: "circle", shapeColor: "red", digit: 3, previousDigit: 3, action: "digit", isTarget: true },
];

export const dualTaskTutorial = criarTutorialEstimuloContinuo<DualStimulus>({
  exerciseId: "dual-task",
  version: 1,
  modo: "continua",
  guidedInstruction: "Responda às duas tarefas conforme elas aparecerem.",
  retryHint: "Divida sua atenção entre as duas tarefas e responda ao alvo de cada painel.",
  smallestValidUnit: TWO_TASK_RESPONSES,
  demonstrationStimuli: dualTaskDemo,
  guidedStimuli: dualTaskDemo,
  Board: DualTaskBoard,
  expectedActionFor: (stimulus) => stimulus.action,
  targetSelectorFor: (stimulus) => `[data-action="${stimulus.action}"]`,
});

const motDemo: readonly MotStimulus[] = [
  { id: "mot-memorize", stage: "memorize", action: "none", focusBall: null, isTarget: false },
  { id: "mot-track", stage: "track", action: "none", focusBall: null, isTarget: false },
  { id: "mot-ball-3", stage: "identify", action: "ball-3", focusBall: 3, isTarget: false },
  { id: "mot-ball-0", stage: "identify", action: "ball-0", focusBall: 0, isTarget: true },
  { id: "mot-ball-1", stage: "identify", action: "ball-1", focusBall: 1, isTarget: true },
];

export const motTutorial = criarTutorialEstimuloContinuo<MotStimulus>({
  exerciseId: "mot",
  version: 1,
  modo: "continua",
  guidedInstruction: "Clique nos alvos que você seguiu.",
  retryHint: "Acompanhe os alvos durante o movimento e clique neles ao final.",
  smallestValidUnit: MOT_MINIMUM_TARGETS,
  demonstrationStimuli: motDemo,
  guidedStimuli: motDemo,
  Board: MotBoard,
  expectedActionFor: (stimulus) => stimulus.action,
  targetSelectorFor: (stimulus) => `[data-action="${stimulus.action}"]`,
});

const certoOuErradoDemo: readonly CertoErradoStimulus[] = [
  {
    id: "certo-demo",
    statement: "Lavar as mãos antes de comer é uma atitude correta.",
    answer: "certo",
    isTarget: true,
  },
];
const certoOuErradoGuided: readonly CertoErradoStimulus[] = [
  {
    id: "errado-guided",
    statement: "Jogar lixo no chão é uma atitude correta.",
    answer: "errado",
    isTarget: true,
  },
];

export const certoOuErradoTutorial = criarTutorialEstimuloContinuo<CertoErradoStimulus>({
  exerciseId: "certo-ou-errado",
  version: 1,
  modo: "completa",
  guidedInstruction: "Clique em certo ou errado conforme a operação.",
  retryHint: "Leia a situação e clique em certo ou errado.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: certoOuErradoDemo,
  guidedStimuli: certoOuErradoGuided,
  Board: CertoOuErradoBoard,
  expectedActionFor: (stimulus) => stimulus.answer,
  targetSelectorFor: (stimulus) => `[data-action="${stimulus.answer}"]`,
});
