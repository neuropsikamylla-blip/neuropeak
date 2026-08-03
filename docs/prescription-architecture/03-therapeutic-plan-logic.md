# Lógica conceitual do plano terapêutico

## Responsabilidades

O terapeuta monta e confirma o plano. O sistema transforma essa prescrição em medidas descritivas e
alertas determinísticos; ele não propõe “o melhor plano”, não pontua exercícios e não decide pelo
terapeuta.

### O que o terapeuta escolhe

- frequência semanal inteira de **1 a 5**;
- duração-alvo da sessão: **20, 30 ou 40 minutos**;
- exercícios e ordem de execução;
- protocolo, dose, nível inicial quando aplicável, modalidade somente onde prevista e demais
  parâmetros clínicos de cada exercício, sempre dentro das faixas do lote 1.

O nível inicial prescrito continua separado do progresso já alcançado pelo paciente. A escolha de uma
modalidade da tarefa também continua separada de leitura assistiva.

### O que o sistema calcula

#### Tempo real estimado

O sistema deriva a duração de cada prescrição a partir da dose e da modalidade escolhidas, soma as
faixas e acrescenta a margem operacional do documento 02:

```text
prescribedMinutes = soma das faixas de duração após modalidade
operationalMargin = transições + fechamento das unidades em curso
estimatedRealMinutes = prescribedMinutes + operationalMargin
```

Os três valores são faixas mínima–máxima. O sistema preserva os decimais no cálculo e compara
`estimatedRealMinutes` com a faixa-alvo e o limite seguro da duração escolhida.

#### Carga da sessão

Nesta fase, o valor numérico é apenas:

```text
baselineLoadTotal = Σ ExerciseDefinition.baselineCognitiveLoad
```

O cálculo consome a definição global identificada por `exerciseId`, nunca um valor enviado livremente
pela interface. Os modificadores afetados pelos parâmetros prescritos são coletados como evidências
qualitativas (`appliedLoadModifiers`), sem pesos e sem alterar `baselineLoadTotal`. Uma futura fórmula
dinâmica poderá consumir essas evidências, mas ela não é definida aqui.

Os valores 7, 10 e 13 usados na composição são referências heurísticas de atenção. O total basal não
autoriza, proíbe ou descreve sozinho uma sessão: deve ser lido junto de fadiga, interferência, modelo
de execução, modalidade e planejamento.

#### Distribuição

O sistema agrega quantidade de exercícios e faixa de minutos prescritos por:

- domínio principal de catálogo;
- modelo de execução;
- canal efetivo da prescrição.

Para canal, `visual` conta como visual, `audioOnly` conta como auditivo e `visual+audio` conta uma vez
em cada canal. Os dois spans contam como auditivos por mecânica; o realce visual sincronizado não os
reclassifica como modalidade configurável. Percentuais, quando exibidos, usam minutos prescritos como
denominador e não constituem pontuação.

#### Alertas e conflitos

Os alertas são exatamente os disparos do documento 02, sempre com severidade `info` ou `attention` e
`blocksSave = false`. Um conflito é a evidência estruturada que originou o alerta, por exemplo:

- um par de interferência alta adjacente;
- uma combinação presente em `badCombinations`;
- quantidade ou posição de fadiga alta fora da regra;
- faixa de sessão curta, longa ou acima do limite seguro;
- concentração de processo cognitivo.

Conflito não é um estado de invalidez do registro: é um fato calculado para o terapeuta considerar.

#### Balanceamento semanal

A frequência multiplica exposição, não a carga basal de uma execução individual. Para uma mesma
composição repetida `f` vezes:

```text
weeklyEstimatedMinutes       = estimatedRealMinutes × f
weeklyBaselineLoadExposure   = baselineLoadTotal × f
weeklyHighFatigueExposures   = count(fatigue = HIGH) × f
weeklyHighInterferenceExposures = count(interference = HIGH) × f
weeklyDistribution           = sessionDistribution × f
```

Assim, dois exercícios de fadiga alta em uma sessão de frequência 5 produzem **10 exposições
semanais**; na frequência 1, produzem **2**. O sistema exibe os dois números, sem declarar equivalência
clínica e sem transformar exposição em diagnóstico.

Enquanto não houver limiar clínico semanal aprovado, a projeção é descritiva: ela não cria um novo
“excesso” por conta própria. Alertas da sessão são preservados e podem receber o contexto “repete-se
`f` vezes por semana”, sem multiplicar ocorrências idênticas na lista.

## Fluxo de cálculo

1. Validar estruturalmente que frequência, duração-alvo, exercício, dose e parâmetros pertencem às
   faixas permitidas.
2. Resolver cada `ExercisePrescription` contra sua `ExerciseDefinition` global.
3. Calcular duração após modalidade, margem, carga basal, evidências de modificadores e distribuição.
4. Aplicar as regras determinísticas do documento 02 e materializar conflitos e alertas.
5. Projetar os mesmos agregados pela frequência semanal.
6. Exibir a composição e permitir que o terapeuta salve com ou sem alertas.

Validação estrutural de valores fora do contrato é diferente de alerta clínico de composição. Este
documento especifica os alertas de composição; não redefine persistência nem interface.

## Estruturas conceituais em TypeScript

Os tipos abaixo documentam fronteiras; não são uma implementação.

```ts
type MinutesRange = readonly [minimum: number, maximum: number];
type SessionTargetMinutes = 20 | 30 | 40;
type WeeklyFrequency = 1 | 2 | 3 | 4 | 5;
type Severity = "info" | "attention";

type ExecutionModel =
  | "CONTINUOUS_TIMED"
  | "CLOSED_PROTOCOL"
  | "PLANNING_WINDOW"
  | "FIXED_HIGH_FATIGUE";

type PresentationMode = "visual" | "visual+audio" | "audioOnly";
type EffectiveChannel = "visual" | "auditory";

/** Definição global e versionada; nunca contém decisão para um paciente. */
interface ExerciseDefinition {
  exerciseId: string;
  officialName: string;
  catalogDomain: string;
  mechanicalPrimary: string;
  associatedCognitiveProfiles: readonly string[];
  executionModel: ExecutionModel;
  baselineCognitiveLoad: 1 | 2 | 3;
  loadModifiers: readonly {
    dimension: string;
    effect: string;
  }[];
  fatigue: "BAIXA" | "MODERADA" | "ALTA";
  interference: "BAIXA" | "MODERADA" | "ALTA";
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

type PrescribedDose =
  | { kind: "protocol"; protocol: "BRIEF" | "STANDARD" | "EXTENDED"; unitCount: number }
  | { kind: "timed"; prescribedMinutes: number }
  | { kind: "planningWindow"; maximumMinutes: number }
  | { kind: "fixedExposure"; minutes: number };

/** Escolhas do terapeuta para um paciente; não replica carga nem perfil global. */
interface ExercisePrescription {
  exerciseId: string;
  order: number;
  dose: PrescribedDose;
  startLevel?: number;
  presentationMode?: PresentationMode;
  clinicalParameters: Readonly<Record<string, unknown>>;
}

/** Prescrição da sessão; os totais calculados não são gravados como escolhas. */
interface SessionPrescription {
  patientId: string;
  targetMinutes: SessionTargetMinutes;
  weeklyFrequency: WeeklyFrequency;
  exercises: readonly ExercisePrescription[];
}

interface DistributionSlice {
  key: string;
  exerciseCount: number;
  prescribedMinutes: MinutesRange;
}

interface CompositionConflict {
  ruleCode: PlanWarning["code"];
  exerciseIds: readonly string[];
  observed: Readonly<Record<string, unknown>>;
  expected: Readonly<Record<string, unknown>>;
}

interface ExerciseComposition {
  exerciseId: string;
  order: number;
  prescribedMinutes: MinutesRange;
  operationalClosingMarginMinutes: MinutesRange;
  baselineLoad: 1 | 2 | 3;
  appliedLoadModifiers: readonly {
    dimension: string;
    evidence: string;
  }[];
  effectiveChannels: readonly EffectiveChannel[];
}

/** Resultado recalculável; nunca é fonte para definição ou prescrição. */
interface SessionComposition {
  exercises: readonly ExerciseComposition[];
  prescribedMinutes: MinutesRange;
  operationalMarginMinutes: MinutesRange;
  estimatedRealMinutes: MinutesRange;
  targetRangeMinutes: MinutesRange;
  safeMaximumMinutes: number;
  load: {
    baselineTotal: number;
    ceiling: number;
    appliedLoadModifiers: readonly {
      exerciseId: string;
      dimension: string;
      evidence: string;
    }[];
  };
  distribution: {
    byPrimaryDomain: readonly DistributionSlice[];
    byExecutionModel: readonly DistributionSlice[];
    byEffectiveChannel: readonly DistributionSlice[];
  };
  conflicts: readonly CompositionConflict[];
  warnings: readonly PlanWarning[];
  calculatedFromDefinitionVersion: string;
}

type PlanWarningCode =
  | "SESSION_BELOW_TARGET"
  | "SESSION_ABOVE_TARGET"
  | "SESSION_RANGE_PARTIAL"
  | "SESSION_SAFE_MAX_EXCEEDED"
  | "LOAD_AT_CAP"
  | "LOAD_OVER_CAP"
  | "HIGH_FATIGUE_COUNT"
  | "HIGH_FATIGUE_POSITION"
  | "HIGH_FATIGUE_ADJACENT"
  | "HIGH_INTERFERENCE_ADJACENT"
  | "AUDITORY_ONLY_ADJACENT"
  | "COGNITIVE_CONCENTRATION"
  | "PLANNING_WINDOW_COUNT"
  | "PLANNING_WINDOW_ADJACENT"
  | "OPEN_POSITION_NOT_ELIGIBLE"
  | "CLOSE_POSITION_NOT_ELIGIBLE"
  | "OUTSIDE_BEST_POSITION"
  | "DECLARED_BAD_COMBINATION";

/** Mensagem derivada; nunca bloqueia a decisão do terapeuta. */
interface PlanWarning {
  code: PlanWarningCode;
  severity: Severity;
  message: string;
  exerciseIds: readonly string[];
  conflictIndex: number;
  blocksSave: false;
}

/** Visão semanal: prescrição + composição calculada + projeção de exposição. */
interface WeeklyPlan {
  session: SessionPrescription;
  composition: SessionComposition;
  projection: {
    sessionCount: WeeklyFrequency;
    estimatedMinutes: MinutesRange;
    baselineLoadExposure: number;
    highFatigueExposures: number;
    highInterferenceExposures: number;
    distributionByPrimaryDomain: readonly DistributionSlice[];
    distributionByExecutionModel: readonly DistributionSlice[];
    distributionByEffectiveChannel: readonly DistributionSlice[];
  };
}
```

## Separações obrigatórias

| Camada | Contém | Não contém |
|---|---|---|
| `ExerciseDefinition` | Nome, parâmetros permitidos, mecânica, perfis, carga basal e elegibilidade globais. | Paciente, ordem, dose escolhida ou progresso. |
| `ExercisePrescription` | Escolhas clínicas de um exercício para um paciente. | Cópia editável de perfil, carga basal ou estimativa fixa do catálogo. |
| `SessionPrescription` | Duração-alvo, frequência e sequência prescrita. | Totais tratados como decisão manual. |
| `SessionComposition` | Faixas, carga, distribuição, conflitos e alertas recalculados. | Decisão clínica ou alteração automática da prescrição. |
| `PlanWarning` | Regra disparada, evidência, mensagem e severidade. | Bloqueio, ranking ou substituição sugerida. |
| `WeeklyPlan` | Sessão e projeção multiplicada pela frequência. | Suposição de que exposições semanais são equivalentes entre pacientes. |

Essa separação refina o modelo de `docs/auditoria-plano-terapeutico/06-modelo-de-dados.md`: mantém
definição global, prescrição, progresso e execução independentes e acrescenta uma camada explícita de
composição calculada. Progresso do paciente e execução realizada continuam fora destes cinco tipos;
tempo real realizado nunca sobrescreve a estimativa prescrita.

Os campos derivados que o documento 06 colocava junto de `ExercisePrescription` e
`SessionPrescription` não desaparecem: correspondem a `ExerciseComposition` e `SessionComposition`
neste refinamento. Se uma futura persistência os materializar junto da prescrição, continuam sendo
somente cache recalculável, identificado por `calculatedFromDefinitionVersion`, e nunca entrada
editável do terapeuta.
