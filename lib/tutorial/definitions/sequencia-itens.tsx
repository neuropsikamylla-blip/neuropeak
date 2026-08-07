"use client";

import {
  ITEMS,
  SEQUENCIA_ITENS_MIN_LEVEL,
  SEQUENCIA_ITENS_TUTORIAL_CHOICES,
  SequenciaItensBoard,
  sequenciaItensForLevel,
  type Item,
} from "@/components/exercises/memory/SequenciaItens";
import {
  criarTutorialSequenciaOrdenada,
  type SequencePresentationHooks,
} from "@/lib/tutorial/definitions/sequencia-ordenada";
import { speakSequence } from "@/lib/tutorial/speech-playback";

const SMALLEST_VALID_UNIT = sequenciaItensForLevel(SEQUENCIA_ITENS_MIN_LEVEL);
const DEMONSTRATION_ITEMS = ITEMS.slice(0, SMALLEST_VALID_UNIT);

function createGuidedSequence(): Item[] {
  const available = [...SEQUENCIA_ITENS_TUTORIAL_CHOICES];
  for (let index = available.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [available[index], available[target]] = [available[target], available[index]];
  }
  return available.slice(0, SMALLEST_VALID_UNIT);
}

function presentItems(
  itens: Item[],
  hooks: SequencePresentationHooks<Item>,
): Promise<void> {
  return speakSequence(itens.map((item) => item.n), {
    isCancelled: hooks.isCancelled,
    onItemStart: (_texto, index) => hooks.onItemStart(itens[index], index),
    onItemEnd: (_texto, index) => hooks.onItemEnd(itens[index], index),
  });
}

export const sequenciaItensTutorial = criarTutorialSequenciaOrdenada({
  exerciseId: "sequencia-itens",
  version: 1,
  guidedInstruction: "Ouça a sequência e clique nos itens na mesma ordem.",
  smallestValidUnit: SMALLEST_VALID_UNIT,
  demonstrationItems: DEMONSTRATION_ITEMS,
  createGuidedSequence,
  present: presentItems,
  Board: SequenciaItensBoard,
  targetSelectorFor: (item) => `[data-choice="${item.n}"]`,
});
