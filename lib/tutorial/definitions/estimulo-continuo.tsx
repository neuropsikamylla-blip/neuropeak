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
  // Corrigido em 09/ago/2026, na validação dela. O texto anterior dizia "clique" e "não clique",
  // mas o exercício tem DOIS botões e sempre se responde em algum — e omitia o amarelo, que sai em
  // 10% dos sinais (`Semaforo.tsx`, sorteio: verde 45%, vermelho 45%, amarelo 10%). O paciente
  // podia encontrar no treino uma cor que o tutorial nunca lhe apresentou.
  // "Clique" é o verbo único destes textos: os sete aprovados usam ele, e um teste barra os
  // sinônimos ligados a tela ou a teclas, para o vocabulário não variar entre exercícios.
  // (Este comentário evita de propósito as palavras barradas: a checagem varre o arquivo todo.)
  explicacao: [
    "Quando o sinal abrir em verde, clique em AVANÇAR.",
    "Quando estiver vermelho ou amarelo, clique em PARAR.",
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

const tempoReacaoDemo: readonly BalloonStimulus[] = [
  { id: "balloon-red", color: "red", isTarget: false },
  { id: "balloon-green", color: "green", isTarget: true },
];

export const tempoReacaoTutorial = criarTutorialEstimuloContinuo<BalloonStimulus>({
  exerciseId: "tempo-reacao",
  version: 1,
  // Classificação dela (07/ago/2026): a regra é tão simples quanto a do Semáforo — a demonstração
  // não aumenta a compreensão, então explicação e treino.
  modo: "explicativo",
  explicacao: [
    "Quando o sinal aparecer, clique o mais rápido possível.",
    "Antes do sinal, não clique.",
  ],
  guidedInstruction: "Clique assim que o sinal aparecer.",
  retryHint: "Espere o balão verde e clique nele.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: tempoReacaoDemo,
  guidedStimuli: tempoReacaoDemo,
  Board: TempoReacaoBoard,
  expectedActionFor: () => "balloon",
  targetSelectorFor: () => '[data-action="balloon"]',
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
  // Classificação dela (07/ago/2026): a mecânica é auto-evidente na tela; ver a resposta ser dada
  // não acrescenta compreensão.
  modo: "explicativo",
  explicacao: [
    "Veja a operação que aparecer na tela.",
    "Clique em CERTO se o resultado estiver correto.",
    "Clique em ERRADO se o resultado estiver incorreto.",
  ],
  guidedInstruction: "Clique em certo ou errado conforme a operação.",
  retryHint: "Leia a situação e clique em certo ou errado.",
  smallestValidUnit: ONE_RESPONSE,
  demonstrationStimuli: certoOuErradoDemo,
  guidedStimuli: certoOuErradoGuided,
  Board: CertoOuErradoBoard,
  expectedActionFor: (stimulus) => stimulus.answer,
  targetSelectorFor: (stimulus) => `[data-action="${stimulus.answer}"]`,
});
