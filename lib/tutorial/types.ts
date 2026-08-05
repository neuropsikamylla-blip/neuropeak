import type { ComponentType } from "react";

export type GuidedOutcome = "correct" | "incorrect";

export interface GuidedAttemptProps {
  onOutcome: (outcome: GuidedOutcome) => void;
}

export interface TutorialDefinition {
  exerciseId: string;
  version: number;
  Demonstration: ComponentType<{ onDone: () => void }>;
  GuidedAttempt: ComponentType<GuidedAttemptProps>;
  retryHint: string;
}
