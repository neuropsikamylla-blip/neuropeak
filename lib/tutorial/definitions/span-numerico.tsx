"use client";

import { useEffect, useRef, useState } from "react";
import {
  Beads,
  MIN_LEVEL,
  NumberPad,
  digitsForLevel,
} from "@/components/exercises/memory/SpanNumerico";
import { playDigitSequence } from "@/lib/tutorial/span-playback";
import type { GuidedAttemptProps, TutorialDefinition } from "@/lib/tutorial/types";

/**
 * A menor unidade válida da mecânica do Span, PERGUNTADA à própria escada clínica — não escrita
 * à mão. Hoje resolve para 2 dígitos (nível 1); se a escada mudar, isto muda junto, e a tentativa
 * guiada continua sendo o menor degrau em que a tarefa ainda é a tarefa.
 */
const SMALLEST_VALID_UNIT = digitsForLevel(MIN_LEVEL);
const AUTO_ENTRY_DELAY_MS = 450;

/** Sequência da demonstração: a menor unidade, com dígitos distintos e estáveis a cada exibição. */
const DEMONSTRATION_SEQUENCE = Array.from({ length: SMALLEST_VALID_UNIT }, (_, i) => 3 + i * 4);

function createGuidedSequence(): number[] {
  const sequence: number[] = [];
  while (sequence.length < SMALLEST_VALID_UNIT) {
    const candidate = 1 + Math.floor(Math.random() * 9);
    // Sem repetir o anterior: dígito repetido em seguida confunde a escuta sem treinar nada.
    if (candidate !== sequence[sequence.length - 1]) sequence.push(candidate);
  }
  return sequence;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function SpanBoard({
  total,
  filled,
  active,
  flashKey,
  interactive,
  onKey,
}: {
  total: number;
  filled: number;
  active: number;
  flashKey: number;
  interactive: boolean;
  onKey: (digit: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#EAF2F9] p-5">
      <Beads total={total} filled={filled} active={active} />
      <NumberPad interactive={interactive} flashKey={flashKey} onKey={onKey} />
    </div>
  );
}

function Demonstration({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(-1);
  const [flashKey, setFlashKey] = useState(-1);
  const [filled, setFilled] = useState(0);

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

      setFilled(0);
      for (let index = 0; index < DEMONSTRATION_SEQUENCE.length; index++) {
        if (cancelled) return;
        setFlashKey(DEMONSTRATION_SEQUENCE[index]);
        setFilled(index + 1);
        await wait(AUTO_ENTRY_DELAY_MS);
        setFlashKey(-1);
        await wait(AUTO_ENTRY_DELAY_MS);
      }

      if (!cancelled) onDoneRef.current();
    }

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <SpanBoard
      total={DEMONSTRATION_SEQUENCE.length}
      filled={filled}
      active={active}
      flashKey={flashKey}
      interactive={false}
      onKey={() => {}}
    />
  );
}

function GuidedAttempt({ onOutcome }: GuidedAttemptProps) {
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
      const expected = sequenceRef.current;
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
}

export const spanNumericoTutorial: TutorialDefinition = {
  exerciseId: "span-numerico",
  version: 1,
  Demonstration,
  GuidedAttempt,
  retryHint: "Ouça novamente e responda quando o teclado estiver disponível.",
  smallestValidUnit: SMALLEST_VALID_UNIT,
};
