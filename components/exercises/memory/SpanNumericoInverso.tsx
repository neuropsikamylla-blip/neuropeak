"use client";

import { SpanNumerico } from "./SpanNumerico";
import type { ExerciseResult, Theme } from "@/types";

interface SpanNumericoInversoProps {
  difficulty: number;
  theme: Theme;
  onComplete: (result: ExerciseResult) => void;
  settings?: Record<string, unknown>;
}

export function SpanNumericoInverso({ difficulty, theme, onComplete, settings }: SpanNumericoInversoProps) {
  return (
    <SpanNumerico
      difficulty={difficulty}
      theme={theme}
      onComplete={onComplete}
      settings={settings}
      reverse
    />
  );
}
