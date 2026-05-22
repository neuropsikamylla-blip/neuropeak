"use client";

import { MatrizEspacial } from "./MatrizEspacial";
import type { ExerciseResult, Theme } from "@/types";

interface MatrizEspacialInversaProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

export function MatrizEspacialInversa({ difficulty, theme, onComplete }: MatrizEspacialInversaProps) {
  function handleComplete(result: ExerciseResult) {
    onComplete({ ...result, exerciseId: "matriz-espacial-inversa" });
  }

  return (
    <MatrizEspacial
      difficulty={difficulty}
      theme={theme}
      onComplete={handleComplete}
      alwaysReverse={true}
    />
  );
}
