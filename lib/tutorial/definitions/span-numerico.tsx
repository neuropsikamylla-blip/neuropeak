"use client";

import {
  Beads,
  MIN_LEVEL,
  NumberPad,
  digitsForLevel,
} from "@/components/exercises/memory/SpanNumerico";
import {
  criarTutorialSequenciaOrdenada,
  type BoardProps,
} from "@/lib/tutorial/definitions/sequencia-ordenada";
import { playDigitSequence } from "@/lib/tutorial/span-playback";

/** A menor unidade válida vem da própria escada clínica do Span. */
const SMALLEST_VALID_UNIT = digitsForLevel(MIN_LEVEL);

/** Sequência estável e distinta usada pela demonstração aprovada. */
const DEMONSTRATION_SEQUENCE = Array.from(
  { length: SMALLEST_VALID_UNIT },
  (_, index) => ((index + 1) % 9) + 1,
);

function createGuidedSequence(): number[] {
  const sequence: number[] = [];
  while (sequence.length < SMALLEST_VALID_UNIT) {
    const candidate = 1 + Math.floor(Math.random() * 9);
    if (candidate !== sequence[sequence.length - 1]) sequence.push(candidate);
  }
  return sequence;
}

function SpanBoard({
  total,
  filled,
  activeIndex,
  activeChoice,
  interactive,
  onChoice,
  pressedChoice,
  highlightedIndex,
}: BoardProps<number>) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-[#EAF2F9] p-5">
      <Beads
        total={total}
        filled={filled}
        active={activeIndex}
        highlighted={highlightedIndex}
      />
      <NumberPad
        interactive={interactive}
        flashKey={activeChoice ?? -1}
        onKey={onChoice}
        pressedKey={pressedChoice}
      />
    </div>
  );
}

function presentSpan(itens: number[], hooks: {
  onItemStart: (item: number, index: number) => void;
  onItemEnd: (item: number, index: number) => void;
  isCancelled: () => boolean;
}): Promise<void> {
  return playDigitSequence(itens, {
    isCancelled: hooks.isCancelled,
    onDigitStart: hooks.onItemStart,
    onDigitEnd: hooks.onItemEnd,
  });
}

function criarTutorialSpan({
  exerciseId,
  transformarResposta,
  guidedInstruction,
}: {
  exerciseId: string;
  transformarResposta?: (sequencia: number[]) => number[];
  guidedInstruction: string;
}) {
  return criarTutorialSequenciaOrdenada({
    exerciseId,
    version: 1,
    guidedInstruction,
    retryHint: "Ouça novamente e responda quando os números ficarem disponíveis.",
    smallestValidUnit: SMALLEST_VALID_UNIT,
    demonstrationItems: DEMONSTRATION_SEQUENCE,
    createGuidedSequence,
    present: presentSpan,
    Board: SpanBoard,
    targetSelectorFor: (digit) => `[data-digit="${digit}"]`,
    transformarResposta,
  });
}

export const spanNumericoTutorial = criarTutorialSpan({
  exerciseId: "span-numerico",
  guidedInstruction: "Ouça a sequência e clique nos números na mesma ordem.",
});

export const spanNumericoInversoTutorial = criarTutorialSpan({
  exerciseId: "span-numerico-inverso",
  transformarResposta: (sequencia) => sequencia.reverse(),
  guidedInstruction: "Ouça a sequência e clique nos números na ordem inversa.",
});
