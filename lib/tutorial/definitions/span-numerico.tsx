"use client";

import { useEffect, useRef, useState } from "react";
import {
  Beads,
  MIN_LEVEL,
  NumberPad,
  digitsForLevel,
} from "@/components/exercises/memory/SpanNumerico";
import { DemoPointer } from "@/components/exercises/tutorial/DemoPointer";
import { playDigitSequence } from "@/lib/tutorial/span-playback";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

/**
 * A menor unidade válida da mecânica do Span, PERGUNTADA à própria escada clínica — não escrita
 * à mão. Hoje resolve para 2 dígitos (nível 1); se a escada mudar, isto muda junto, e a tentativa
 * guiada continua sendo o menor degrau em que a tarefa ainda é a tarefa.
 */
const SMALLEST_VALID_UNIT = digitsForLevel(MIN_LEVEL);
const POST_LISTENING_PAUSE_MS = 1000;
const POINTER_ENTRY_PULSE_MS = 500;
const POINTER_MOVE_MS = 650;
const POINTER_AIM_MS = 220;
const POINTER_PRESS_MS = 420;
const POINTER_RELEASE_MS = 260;
const BETWEEN_DIGITS_MS = 520;
const FINAL_PAUSE_MS = 800;

/** Sequência da demonstração: a menor unidade, com dígitos distintos e estáveis a cada exibição. */
const DEMONSTRATION_SEQUENCE = Array.from(
  { length: SMALLEST_VALID_UNIT },
  (_, index) => ((index + 1) % 9) + 1,
);

function createGuidedSequence(): number[] {
  const sequence: number[] = [];
  while (sequence.length < SMALLEST_VALID_UNIT) {
    const candidate = 1 + Math.floor(Math.random() * 9);
    // Sem repetir o anterior: dígito repetido em seguida confunde a escuta sem treinar nada.
    if (candidate !== sequence[sequence.length - 1]) sequence.push(candidate);
  }
  return sequence;
}

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

function SpanBoard({
  total,
  filled,
  active,
  flashKey,
  interactive,
  onKey,
  pressedKey,
  highlightedBead,
}: {
  total: number;
  filled: number;
  active: number;
  flashKey: number;
  interactive: boolean;
  onKey: (digit: number) => void;
  pressedKey?: number;
  highlightedBead?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#EAF2F9] p-5">
      <Beads total={total} filled={filled} active={active} highlighted={highlightedBead} />
      <NumberPad
        interactive={interactive}
        flashKey={flashKey}
        onKey={onKey}
        pressedKey={pressedKey}
      />
    </div>
  );
}

/**
 * Ordem em que a resposta deve ser dada. No Inverso, de trás para a frente — é a única diferença
 * de mecânica entre os dois exercícios, e por isso a única coisa que a fábrica parametriza.
 */
function respostaEsperada(sequencia: number[], reverse: boolean): number[] {
  return reverse ? [...sequencia].reverse() : sequencia;
}

function criarDemonstration(reverse: boolean) {
  return function Demonstration({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [demonstrationPhase, setDemonstrationPhase] = useState<"listening" | "answering" | "done">(
    "listening",
  );
  const [pointerPhase, setPointerPhase] = useState<"locating" | "moving" | "pressing">(
    "locating",
  );
  const [targetSelector, setTargetSelector] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState(-1);
  const [active, setActive] = useState(-1);
  const [flashKey, setFlashKey] = useState(-1);
  const [filled, setFilled] = useState(0);
  const [highlightedBead, setHighlightedBead] = useState(-1);

  // O efeito roda UMA vez e nunca reage a onDone. Se dependesse dele, um callback recriado pelo
  // pai reiniciaria a demonstração do zero — com a voz falando por cima de si mesma. O ref mantém
  // o callback sempre atual sem virar dependência.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await playDigitSequence(DEMONSTRATION_SEQUENCE, {
        isCancelled: () => cancelled,
        onDigitStart: (digit, index) => {
          setActive(index);
          setFlashKey(digit);
        },
        onDigitEnd: (_digit, index) => {
          setActive(-1);
          setFlashKey(-1);
          setFilled(index + 1);
        },
      });
      if (cancelled) return;

      setDemonstrationPhase("answering");
      setFilled(0);
      // A demonstração responde na ordem REAL do exercício: no Inverso, do último ao primeiro.
      const ordemDaResposta = respostaEsperada(DEMONSTRATION_SEQUENCE, reverse);
      if (!await wait(POST_LISTENING_PAUSE_MS, () => cancelled)) return;

      setTargetSelector("[data-demo-pointer-start]");
      setPointerPhase("locating");
      if (!await wait(POINTER_ENTRY_PULSE_MS, () => cancelled)) return;

      for (let index = 0; index < ordemDaResposta.length; index++) {
        if (cancelled) return;
        const digit = ordemDaResposta[index];

        setTargetSelector(`[data-digit="${digit}"]`);
        setPointerPhase("moving");
        if (!await wait(POINTER_MOVE_MS, () => cancelled)) return;
        if (!await wait(POINTER_AIM_MS, () => cancelled)) return;

        setPointerPhase("pressing");
        setPressedKey(digit);
        if (!await wait(POINTER_PRESS_MS, () => cancelled)) return;

        setPressedKey(-1);
        setPointerPhase("moving");
        if (!await wait(POINTER_RELEASE_MS, () => cancelled)) return;

        setFilled(index + 1);
        setHighlightedBead(index);
        if (!await wait(BETWEEN_DIGITS_MS, () => cancelled)) return;
        setHighlightedBead(-1);
      }

      if (!await wait(FINAL_PAUSE_MS, () => cancelled)) return;
      setDemonstrationPhase("done");
      onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${demonstrationPhase === "answering" ? "pointer-events-none" : ""}`}
    >
      <span
        data-demo-pointer-start
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-12 h-px w-px"
      />
      <SpanBoard
        total={DEMONSTRATION_SEQUENCE.length}
        filled={filled}
        active={active}
        flashKey={flashKey}
        interactive={false}
        onKey={() => {}}
        pressedKey={pressedKey}
        highlightedBead={highlightedBead}
      />
      <DemoPointer
        containerRef={containerRef}
        targetSelector={demonstrationPhase === "answering" ? targetSelector : null}
        phase={pointerPhase}
        moveDurationMs={POINTER_MOVE_MS}
        entryPulseDurationMs={POINTER_ENTRY_PULSE_MS}
      />
    </div>
  );
  };
}

function criarGuidedAttempt(reverse: boolean) {
  return function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
  const sequenceRef = useRef<number[]>(createGuidedSequence());
  const enteredRef = useRef<number[]>([]);
  const [listening, setListening] = useState(true);
  const [active, setActive] = useState(-1);
  const [flashKey, setFlashKey] = useState(-1);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sequence = sequenceRef.current;

    async function run() {
      await playDigitSequence(sequence, {
        isCancelled: () => cancelled,
        onDigitStart: (digit, index) => {
          setActive(index);
          setFlashKey(digit);
        },
        onDigitEnd: (_digit, index) => {
          setActive(-1);
          setFlashKey(-1);
          setFilled(index + 1);
        },
      });
      if (!cancelled) {
        setFilled(0);
        setListening(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, []);

  function handleKey(digit: number) {
    if (listening || enteredRef.current.length >= SMALLEST_VALID_UNIT) return;

    const next = [...enteredRef.current, digit];
    enteredRef.current = next;
    setFilled(next.length);

    if (next.length === SMALLEST_VALID_UNIT) {
      // No Inverso, a resposta correta é a sequência de trás para a frente.
      const expected = respostaEsperada(sequenceRef.current, reverse);
      const isCorrect = expected.every((value, index) => value === next[index]);
      onOutcome(isCorrect ? "correct" : "incorrect");
    }
  }

  return (
    <SpanBoard
      total={SMALLEST_VALID_UNIT}
      filled={filled}
      active={active}
      flashKey={flashKey}
      interactive={!listening}
      onKey={handleKey}
    />
  );
  };
}

/**
 * Fábrica das definições da família Span.
 *
 * Direto e Inverso compartilham TODA a apresentação — mesmo áudio, mesma cadência, mesmo painel
 * de números, mesmo cursor, mesmo ritmo. A única diferença é a ordem da resposta, e é só isso que se
 * parametriza. É este o padrão que os lotes seguintes devem seguir: uma fábrica por família de
 * mecânica, nunca um arquivo copiado por exercício (regra 7).
 */
function criarTutorialSpan({
  exerciseId,
  reverse,
  guidedInstruction,
}: {
  exerciseId: string;
  reverse: boolean;
  guidedInstruction: string;
}): TutorialDefinition {
  return {
    exerciseId,
    version: 1,
    Demonstration: criarDemonstration(reverse),
    GuidedAttempt: criarGuidedAttempt(reverse),
    retryHint: "Ouça novamente e responda quando os números ficarem disponíveis.",
    guidedInstruction,
    smallestValidUnit: SMALLEST_VALID_UNIT,
  };
}

export const spanNumericoTutorial = criarTutorialSpan({
  exerciseId: "span-numerico",
  reverse: false,
  guidedInstruction: "Ouça a sequência e clique nos números na mesma ordem.",
});

export const spanNumericoInversoTutorial = criarTutorialSpan({
  exerciseId: "span-numerico-inverso",
  reverse: true,
  guidedInstruction: "Ouça a sequência e clique nos números na ordem inversa.",
});
