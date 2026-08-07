"use client";

import {
  LETTERS,
  LETRAS_SEQUENCIA_MIN_LEVEL,
  LETRAS_TUTORIAL_CHOICES,
  LetrasSequenciaBoard,
  letrasSequenciaItemsForLevel,
} from "@/components/exercises/memory/LetrasSequencia";
import { criarTutorialSequenciaOrdenada } from "@/lib/tutorial/definitions/sequencia-ordenada";
import { speakSequence } from "@/lib/tutorial/speech-playback";

const SMALLEST_VALID_UNIT = letrasSequenciaItemsForLevel(LETRAS_SEQUENCIA_MIN_LEVEL);
const DEMONSTRATION_ITEMS = LETTERS.slice(0, SMALLEST_VALID_UNIT);

function createGuidedSequence(): string[] {
  const available = [...LETRAS_TUTORIAL_CHOICES];
  for (let index = available.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [available[index], available[target]] = [available[target], available[index]];
  }
  return available.slice(0, SMALLEST_VALID_UNIT);
}

export const letrasSequenciaTutorial = criarTutorialSequenciaOrdenada({
  exerciseId: "letras-sequencia",
  version: 1,
  guidedInstruction: "Ouça a sequência e clique nas letras na mesma ordem.",
  smallestValidUnit: SMALLEST_VALID_UNIT,
  demonstrationItems: DEMONSTRATION_ITEMS,
  createGuidedSequence,
  present: speakSequence,
  Board: LetrasSequenciaBoard,
  targetSelectorFor: (item) => `[data-choice="${item}"]`,
});
