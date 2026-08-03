# Especificação de implementação futura — arquitetura de prescrição

## Objetivo e limites

Esta especificação orienta uma fase futura; não autoriza implementação agora. Ela cobre prescrição
por exercício, cálculo de composição e alertas consultivos. Os quatro estados operacionais são
`ABAIXO_DO_ESPERADO`, `DENTRO_DO_ESPERADO`, `ATENÇÃO` e `EXCESSO_IMPORTANTE`; não são limites
clínicos. Todos os 18 alertas têm `blocksSave = false`.

## Arquivos e pontos de alteração levantados

| Caminho | O que muda | Não pode quebrar |
|---|---|---|
| `types/index.ts` | `estimatedMinutes` fixo dá lugar ao consumo de uma política de duração por exercício; manter o campo legado enquanto houver consumidor. | IDs, catálogo atual, planos e sessões antigas. |
| `components/plano/PlanBuilderSidebar.tsx` | Trocar o `reduce` de `estimatedMinutes` por `SessionComposition.estimatedRealMinutes`; restringir duração a 20/30/40 e frequência ao contrato; exibir alertas sem desabilitar salvar. | Reordenação, remoção, configurações e botão de salvar. |
| `components/plano/ExerciseCard.tsx` | Substituir `~{minutes} min` por faixa derivada e incluir controles de dose por modelo, além de “Tentativas” dos spans. | Nível inicial, `SpanSettings`, Focus, Ordem da História e Caminhos para a Meta. |
| `components/plano/ExerciseRow.tsx` | Exibir faixa/política informativa, em vez da duração fixa de catálogo. | Seleção e layout responsivo da biblioteca. |
| `app/(therapist)/pacientes/[id]/plano/page.tsx` | Ler, editar e salvar `SessionPrescription`; recalcular composição a cada mudança. | Ordem, aliases, níveis e abertura de plano antigo. |
| `lib/exercise-plan.ts` | Evoluir do array legado (`string` ou `{ id, settings }`) para envelope versionado, preservando leitor, aliases e configurações legadas. | Plano antigo abre, roda e salva sem perda. |
| `app/api/patients/[id]/route.ts` | Aceitar ambas as versões, validar valores estruturais e preservar payload legado no salvamento. | Autorização, transação de plano ativo e `ExerciseConfig`. |
| `prisma/schema.prisma` | Planejar migração compatível para o envelope e o desfecho seguro em `Session.metadata`, apenas quando banco for autorizado. | Registros existentes e histórico de sessões. |
| `app/(patient)/treino/[exercicio]/page.tsx` | Consumir prescrição normalizada e encaminhar desfecho seguro ao registro. | Roteamento, execução de plano antigo e exercícios não planejados. |
| `components/exercises/ExerciseWrapper.tsx` e exercícios `PLANNING_WINDOW` | Criar encerramento seguro após margem, sem regra adaptativa individual. | Movimentos, tempo, tentativas, outras métricas e conclusão normal. |
| `app/api/sessions/route.ts` | Persistir o encerramento seguro e pular progressão automática nesse caso. | Sessões antigas, conquistas e progressão de desafios concluídos. |
| `lib/adaptive.ts` | Não mudar critérios individuais; somente receber o desvio geral de preservação de progresso. | Níveis consolidados e nenhuma redução de nível. |

Criar também um módulo puro, por exemplo `lib/prescription-composition.ts`, para resolver definições,
doses, faixas, conflitos e alertas. Ele não depende de React, banco ou API e é a única fonte do
cálculo compartilhada por interface e servidor.

## Estruturas finais e persistência

```ts
type MinutesRange = readonly [minimum: number, maximum: number];
type SessionTargetMinutes = 20 | 30 | 40;
type WeeklyFrequency = 1 | 2 | 3 | 4 | 5;
type Severity = "info" | "attention";
type PlanWarningCode =
  | "SESSION_BELOW_TARGET" | "SESSION_ABOVE_TARGET" | "SESSION_RANGE_PARTIAL"
  | "SESSION_SAFE_MAX_EXCEEDED" | "LOAD_AT_CAP" | "LOAD_OVER_CAP"
  | "HIGH_FATIGUE_COUNT" | "HIGH_FATIGUE_POSITION" | "HIGH_FATIGUE_ADJACENT"
  | "HIGH_INTERFERENCE_ADJACENT" | "AUDITORY_ONLY_ADJACENT"
  | "COGNITIVE_CONCENTRATION" | "PLANNING_WINDOW_COUNT"
  | "PLANNING_WINDOW_ADJACENT" | "OPEN_POSITION_NOT_ELIGIBLE"
  | "CLOSE_POSITION_NOT_ELIGIBLE" | "OUTSIDE_BEST_POSITION"
  | "DECLARED_BAD_COMBINATION";
type DurationState =
  | "ABAIXO_DO_ESPERADO"
  | "DENTRO_DO_ESPERADO"
  | "ATENÇÃO"
  | "EXCESSO_IMPORTANTE";
type ExecutionModel =
  | "CONTINUOUS_TIMED"
  | "CLOSED_PROTOCOL"
  | "PLANNING_WINDOW"
  | "FIXED_HIGH_FATIGUE";
type PresentationMode = "visual" | "visual+audio" | "audioOnly";
type EffectiveChannel = "visual" | "auditory";

interface ExerciseDefinition {
  exerciseId: string;
  definitionVersion: string;
  officialName: string;
  executionModel: ExecutionModel;
  durationPolicy: Readonly<Record<string, MinutesRange>>;
  baselineCognitiveLoad: 1 | 2 | 3;
  loadModifiers: readonly { dimension: string; effect: string }[];
  fatigue: "BAIXA" | "MODERADA" | "ALTA";
  interference: "BAIXA" | "MODERADA" | "ALTA";
  mechanicalPrimary: string;
  associatedCognitiveProfiles: readonly string[];
  intrinsicChannels: readonly EffectiveChannel[];
  supportedPresentationModes: readonly PresentationMode[];
  sessionEligibility: {
    canOpen: boolean;
    canClose: boolean;
    preferredPositions: readonly ("OPEN" | "MIDDLE" | "CLOSE")[];
    preferredPositionNote: string;
    badCombinationExerciseIds: readonly string[];
  };
  parameterSchema: Readonly<Record<string, unknown>>;
}
interface ExercisePrescription {
  exerciseId: string;
  order: number;
  dose: Readonly<Record<string, unknown>>;
  startLevel?: number;
  presentationMode?: PresentationMode;
  clinicalParameters: Readonly<Record<string, unknown>>;
}
interface SessionPrescription {
  schemaVersion: 1;
  patientId: string;
  targetMinutes: SessionTargetMinutes;
  weeklyFrequency: WeeklyFrequency;
  exercises: readonly ExercisePrescription[];
}
interface PlanWarning {
  code: PlanWarningCode;
  severity: Severity;
  message: string;
  exerciseIds: readonly string[];
  blocksSave: false;
}
interface CompositionConflict {
  ruleCode: PlanWarningCode;
  exerciseIds: readonly string[];
  observed: Readonly<Record<string, unknown>>;
  expected: Readonly<Record<string, unknown>>;
}
interface SessionComposition {
  estimatedRealMinutes: MinutesRange;
  durationState: DurationState;
  prescribedMinutes: MinutesRange;
  operationalMarginMinutes: MinutesRange;
  baselineLoadTotal: number;
  distribution: Readonly<Record<string, unknown>>;
  conflicts: readonly CompositionConflict[];
  warnings: readonly PlanWarning[];
  calculatedFromDefinitionVersion: string;
}
interface PlanningChallengeClosure {
  planningChallengeIncomplete: true;
  elapsedMinutes: number;
  movements: number;
  attempts: number;
  metrics: Readonly<Record<string, unknown>>;
  progressionProtected: true;
}
```

| Estrutura | Persistido? | Regra |
|---|---|---|
| `ExerciseDefinition` | Sim, catálogo versionado controlado pelo produto. | Não contém paciente, progresso ou decisão clínica individual. |
| `SessionPrescription` e `ExercisePrescription` | Sim, no envelope novo do plano. | Leitor do formato legado permanece obrigatório. |
| `SessionComposition`, distribuição, conflitos, `durationState` e `PlanWarning` | Não como fonte de verdade. | Derivados e recalculados; cache opcional é descartável e versionado. |
| `PlanningChallengeClosure` | Sim, na sessão/metadata quando ocorrer. | Preserva métricas e proteção de progresso; não é erro. |

## Regra geral: desafio de planejamento não concluído

Em `PLANNING_WINDOW`, não iniciar novo desafio depois do tempo-base. A margem de 3 min é teto de
segurança, não obrigação de manter o paciente até ela. Se o desafio não terminar, encerrar com
segurança e persistir `PlanningChallengeClosure`, mantendo tempo, movimentos, tentativas e todas as
demais métricas produzidas.

Não é erro automático, não recebe penalização automática, não reduz nível e não bloqueia subida. A
API deve pular integralmente a progressão automática para esse registro, preservando o progresso
adaptativo. Esta é política geral: é **proibido** nesta etapa criar critério adaptativo individual
para qualquer exercício de planejamento. Critérios futuros só poderão ser definidos por exercício em
trabalho posterior aprovado.

## Contrato dos 18 alertas

Todos têm `blocksSave = false`. `piso`, `teto` e `máximo` são da duração escolhida, e
`tempoRealMin`/`tempoRealMax` já incluem modalidade, transições e margens.

| Código | Disparo verificável | Severidade | `blocksSave` | Mensagem |
|---|---|---|---|---|
| `SESSION_BELOW_TARGET` | `tempoRealMax < piso`. | atenção | false | Sessão **X–Y min**, abaixo do esperado **A–B min**. |
| `SESSION_ABOVE_TARGET` | `tempoRealMax > teto && tempoRealMax <= máximo`. | atenção | false | Estimativa em **atenção** acima de **B min**; máximo **L min**. |
| `SESSION_RANGE_PARTIAL` | Faixa intersecta a esperada e um extremo fica fora. | informativa | false | Alcança o esperado, mas pode terminar fora de **A–B min**. |
| `SESSION_SAFE_MAX_EXCEEDED` | `tempoRealMax > máximo`. | atenção | false | Extremo superior em **excesso importante** acima de **L min**. |
| `LOAD_AT_CAP` | `baselineLoadTotal === tetoCarga`. | informativa | false | Carga basal **C** na referência **T**; revise os eixos. |
| `LOAD_OVER_CAP` | `baselineLoadTotal > tetoCarga`. | atenção | false | Carga basal **C** acima da referência **T**; revise os eixos. |
| `HIGH_FATIGUE_COUNT` | Fadiga alta maior que 1/2/2 para 20/30/40. | atenção | false | Há **Q** altas; máximo recomendado **T**. |
| `HIGH_FATIGUE_POSITION` | Último exercício tem fadiga alta. | atenção | false | **{exercício}** fecha apesar de fadiga alta. |
| `HIGH_FATIGUE_ADJACENT` | Algum par consecutivo tem fadiga alta. | atenção | false | **{A}** e **{B}** sem atividade intermediária. |
| `HIGH_INTERFERENCE_ADJACENT` | Algum par consecutivo tem interferência alta. | atenção | false | **{A}** e **{B}** têm interferência alta em sequência. |
| `AUDITORY_ONLY_ADJACENT` | Dois `isAuditorySequenceExercise` consecutivos são verdadeiros. | atenção | false | **{A}** e **{B}** formam sequência auditiva sem outro canal. |
| `COGNITIVE_CONCENTRATION` | Para `n >= 3`, mesmo principal em `ceil(2n/3)` ou processo na assinatura dos `n`. | atenção | false | Composição concentrada em **{processo}**: **{evidência}**. |
| `PLANNING_WINDOW_COUNT` | `PLANNING_WINDOW` maior que 1/2/2 para 20/30/40. | atenção | false | Há **Q** janelas; teto **T**. |
| `PLANNING_WINDOW_ADJACENT` | Algum par consecutivo é `PLANNING_WINDOW`. | atenção | false | **{A}** e **{B}** consecutivos; considere `CONTINUOUS_TIMED` ou `CLOSED_PROTOCOL`. |
| `OPEN_POSITION_NOT_ELIGIBLE` | Primeiro exercício com `canOpen = false`. | atenção | false | **{exercício}** está na abertura não elegível. |
| `CLOSE_POSITION_NOT_ELIGIBLE` | Último exercício com `canClose = false`. | atenção | false | **{exercício}** está no fechamento não elegível. |
| `OUTSIDE_BEST_POSITION` | Posição elegível fora da zona normalizada preferida. | informativa | false | **{exercício}** pode ocupar a posição, mas prefere **{posição}**. |
| `DECLARED_BAD_COMBINATION` | Par de `badCombinations` presente; deduplicar pares simétricos. | atenção | false | **{A}** e **{B}**: **{razão}**. |

`SESSION_RANGE_PARTIAL` pode coexistir com atenção ou excesso. Os tetos de carga 7/10/13 são
heurística pura, não validade, invalidez, autorização, proibição ou segurança garantida. A leitura
conjunta considera carga basal, fadiga, interferência, sequência, modalidade, modelo, concentração
de tarefas semelhantes e planejamento consecutivo; somas iguais podem gerar alertas distintos.

## Ordem técnica recomendada

| Fase | Entrega | Risco | Testar antes de seguir | Reversível? |
|---|---|---|---|---|
| 1. Núcleo de leitura | Tipos, definição versionada e calculador puro com 18 alertas, sem persistência/UI. | baixo | Fronteiras 18/22/24, 27/33/36 e 36/44/48; 18 alertas; `blocksSave = false`; parser legado. | Sim. |
| 2. Exibição consultiva | Sidebar, linha e card mostram faixa, estado e alertas, ainda lendo legado. | médio | Salvar com cada alerta; reordenação e configurações existentes. | Sim. |
| 3. Prescrição compatível | Envelope versionado e validação de API com leitura/escrita das duas versões. | alto | Abrir, rodar e salvar planos antigos sem perda; round-trip novo; autorização. | Parcial, com leitor legado. |
| 4. Controles do terapeuta | Dose por modelo, duração 20/30/40 e frequência contratada; cálculo cliente/servidor igual. | médio | Doses válidas e alertas nunca bloqueiam salvar. | Sim. |
| 5. Encerramento seguro | `PLANNING_WINDOW` envia e persiste métricas protegidas ao terminar a margem. | alto | Conclusão normal; não concluído preserva métricas, não inicia novo desafio e não altera nível. | Parcial, pois o histórico permanece. |
| 6. Proteção no servidor | Sessão protegida pula progressão; demais caminhos continuam intactos. | alto | Regressão de `lib/adaptive.ts`, API, conquistas e prova de que ninguém é rebaixado. | Sim para código, sem reprocessar histórico. |

Compatibilidade é requisito transversal: plano antigo deve abrir, rodar e salvar sem perder
configuração; sessão antiga continua legível; nenhum paciente pode ser rebaixado. Começar por leitura
e cálculo, deixando para o fim o que muda a experiência do paciente.

## O que a implementação não faz

- carga dinâmica;
- engine de sugestão;
- IA;
- prescrição automática;
- alteração de exercício;
- alteração de progressão, exceto a preservação geral obrigatória no encerramento seguro de desafio
  de planejamento não concluído.
