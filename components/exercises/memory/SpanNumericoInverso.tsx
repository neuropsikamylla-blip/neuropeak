"use client";

import { SpanNumerico } from "./SpanNumerico";
import type { ExerciseResult, Theme } from "@/types";

interface SpanNumericoInversoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
}

export function SpanNumericoInverso({ difficulty, theme, onComplete }: SpanNumericoInversoProps) {
  return (
    <SpanNumerico
      difficulty={difficulty}
      theme={theme}
      onComplete={onComplete}
      reverse
    />
  );
}
