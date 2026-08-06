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
  /**
   * A menor unidade válida da mecânica clínica DESTE exercício — a carga em que a tarefa ainda
   * existe como tarefa, um degrau abaixo do qual ela deixaria de ser o exercício.
   *
   * Deve ser **derivada da própria mecânica**, nunca escrita como número solto: no Span é
   * `digitsForLevel(MIN_LEVEL)`; noutro exercício será a menor grade, o menor conjunto de alvos,
   * o menor número de passos. Assim, se a escada clínica mudar, a tentativa guiada acompanha
   * sozinha — e nenhuma conversão futura precisa escolher um valor à mão.
   */
  smallestValidUnit: number;
}
