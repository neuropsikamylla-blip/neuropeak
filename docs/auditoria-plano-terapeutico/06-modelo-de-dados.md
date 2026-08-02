# 06 — Modelo de dados proposto (conceitual, não implementado)

> A separação que o modelo atual não faz: **definição global** do exercício ≠ **prescrição** para um
> paciente ≠ **progresso** do paciente ≠ **execução** de uma sessão. Hoje `estimatedMinutes` mistura
> a primeira com a segunda, e `settings` mistura a segunda com a terceira.

## Definição global (uma por exercício, versionada no código)

```ts
export type ExerciseExecutionModel =
  | "continuous"        // A — rodadas curtas independentes
  | "problem"           // B — resolução/planejamento
  | "fixedDose"         // C — fechado/alta fadiga
  | "block";            // D — bloco/protocolo

export type CognitiveDomain =
  | "memory" | "attention" | "executive" | "processing" | "functional" | "social";

/** Como a duração se comporta — depende do modelo de execução. */
export type ExerciseDurationPolicy =
  | { kind: "configurableMinutes"; min: number; default: number; max: number }   // A
  | { kind: "maxWindowMinutes"; default: number; max: number }                   // B
  | { kind: "fixedMinutes"; minutes: number }                                    // C
  | { kind: "blocks"; min: number; default: number; max: number;                 // D
      estimatedMinutesPerBlock: [number, number] };

/** Como a sessão do exercício termina — explícito, para não sobrar loop. */
export type ExerciseCompletionPolicy =
  | { on: "timeUp"; finishCurrentRound: true }        // A
  | { on: "timeUp"; startNoNewChallenge: true }       // B — conclui o desafio em curso
  | { on: "fixedTime" }                               // C
  | { on: "blocksCompleted" };                        // D

export interface CognitiveLoadProfile {
  base: 1 | 2 | 3;                       // carga basal (doc 04)
  axes: {                                // os eixos que geraram a basal — auditável
    interference: 0 | 1 | 2; workingMemory: 0 | 1 | 2; attention: 0 | 1 | 2;
    speed: 0 | 1 | 2; planning: 0 | 1 | 2; inhibition: 0 | 1 | 2; instructions: 0 | 1 | 2;
  };
  channels: { visual: boolean; auditory: boolean; motor: "low" | "medium" | "high" };
  fatigueRisk: "low" | "medium" | "high";
  avoidAdjacentTo?: string[];            // ids que não devem vir logo antes/depois
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  domain: CognitiveDomain;
  secondaryDomains: CognitiveDomain[];
  executionModel: ExerciseExecutionModel;
  durationPolicy: ExerciseDurationPolicy;
  completionPolicy: ExerciseCompletionPolicy;
  load: CognitiveLoadProfile;
  maxLevel: number;                      // 10 · 12 · 13 — hoje implícito e divergente
  supportsAudio: boolean;
  settingsSchema?: Record<string, unknown>;   // o que ESTE exercício aceita como prescrição
}
```

## Prescrição (o terapeuta, para um paciente)

```ts
export interface ExercisePrescription {
  exerciseId: string;
  order: number;
  /** Só um destes, conforme a durationPolicy — nunca os dois. */
  prescribedMinutes?: number;
  prescribedBlocks?: number;
  /** Ponto de partida definido pelo terapeuta. Ausente = usa o progresso do paciente. */
  startLevel?: number;
  settings?: Record<string, unknown>;    // validado contra settingsSchema
  estimatedLoad: number;                 // derivado: basal + modificadores (doc 04)
  estimatedMinutes: [number, number];    // faixa mín-máx desta prescrição
}

export interface SessionPrescription {
  patientId: string;
  targetMinutes: 20 | 30 | 40;
  weeklyFrequency: 1 | 2 | 3 | 4 | 5;
  exercises: ExercisePrescription[];
  /** derivados, recalculados ao salvar */
  totalEstimatedMinutes: [number, number];
  operationalMarginMinutes: number;      // transições + rodada/desafio que extrapola
  totalLoad: number;
  warnings: PlanWarning[];               // nunca bloqueiam
}

export interface PlanWarning {
  code: "adjacentHighLoad" | "adjacentAuditory" | "sameDomainStreak"
      | "sessionTooShort" | "sessionTooLong" | "loadTooHigh";
  message: string;
  exerciseIds: string[];
  severity: "info" | "attention";
}
```

## Progresso do paciente (independente da prescrição)

```ts
export interface PatientExerciseProgress {
  patientId: string;
  exerciseId: string;
  currentLevel: number;
  lastStableLevel: number;          // para onde volta depois de intervalo longo
  highestLevel: number;
  updatedAt: Date;
  /** Redefinição pelo terapeuta é EVENTO, não sobrescrita silenciosa. */
  resets: { at: Date; by: string; fromLevel: number; toLevel: number; reason?: string }[];
}
```

Mapeia para o `ExerciseConfig` que já existe (`@@unique[patientId, exerciseId]`) — hoje só com
`currentDifficulty`. `lastStableLevel`, `highestLevel` e `resets` são campos novos.

## Execução (uma sessão realizada)

```ts
export interface ExerciseExecution {
  sessionId: string;
  exerciseId: string;
  startedAt: Date; endedAt: Date;
  levelAtStart: number; levelAtEnd: number;
  plannedMinutes?: number; plannedBlocks?: number;
  actualSeconds: number;
  endedBy: "timeUp" | "blocksCompleted" | "patientStopped" | "sessionEnded";
  /** Modelo B tem métricas próprias — hoje não são registradas. */
  problemMetrics?: {
    challengesStarted: number; challengesCompleted: number;
    moves: number; efficiency: number;      // movimentos ÷ ótimo
    planningMs: number; executionMs: number; abandons: number;
  };
  accuracy: number;
  metadata: Record<string, unknown>;
}
```

## O que NÃO pode se misturar (a regra que o modelo atual quebra)

| Não misturar | Por quê |
|---|---|
| `ExerciseDefinition.durationPolicy.default` × `ExercisePrescription.prescribedMinutes` | um é recomendação global, o outro é decisão clínica para um paciente |
| `startLevel` (prescrição) × `currentLevel` (progresso) | hoje o card sugere que o terapeuta "define o nível", e o paciente na verdade retoma do banco |
| `estimatedMinutes` (definição) × duração real da execução | é a origem do total irreal de hoje |
| `settings` do exercício × configuração da sessão | duração da sessão é da sessão, não do exercício |
