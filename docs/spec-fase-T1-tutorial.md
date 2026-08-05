# IMPLEMENTAÇÃO — FASE T1: fundação do framework de tutorial

Base: v2.72.0, commit `773ad4f`. Decisões em `docs/exercicios/03-fase-T1-proposta.md` e
`02-tutorial-framework-decisoes.md`.

Não commitar.

## ⛔ PROIBIÇÃO ABSOLUTA — banco de produção

**NÃO executar `prisma db push`. NÃO executar SQL no banco. NÃO publicar.**

Permitido apenas: `prisma validate` · `prisma generate` · `tsc` · `vitest` · `build`.

O SQL de backfill é **arquivo documentado**, não execução.

## PROIBIÇÕES DE ESCOPO

**Não converter nenhum exercício.** Conecta Números e Span **não** são tocados — são a Fase T2.

**Não alterar:** exercícios · progressão · `lib/adaptive.ts` · `/api/sessions` · páginas do paciente ·
interface existente · **`package.json`** · **`vitest.config.ts`**.

**Não instalar dependências.** Os **453 testes atuais** não podem quebrar.

## Arquivos permitidos

- **alterar** `prisma/schema.prisma`
- **criar** `app/api/exercise-tutorial/route.ts`
- **criar** `lib/tutorial/types.ts` · `state.ts` · `versions.ts` + testes
- **criar** `components/exercises/PreparationScreen.tsx`
- **criar** `docs/scripts/backfill-tutorial.sql`

⚠️ **`app/api/patients/[id]/route.ts` NÃO precisa mudar:** `exerciseConfigs: includeConfig` é include
booleano e já traz todos os campos. **Verificar e confirmar na entrega**, sem alterar.

Se precisar tocar em algo fora da lista, **parar e explicar**.

## 1. Schema — três campos

```prisma
model ExerciseConfig {
  // ... campos existentes, intocados ...

  /// Quando o tutorial deste exercício foi concluído. `null` = nunca.
  tutorialCompletedAt DateTime?
  /// Versão concluída, comparada com TUTORIAL_VERSIONS[exerciseId].
  tutorialVersion     Int?
  /// Origem: "BACKFILL" (inferido do histórico) ou "PATIENT" (concluiu de fato).
  /// Existe para o rollback do backfill não apagar conclusões reais.
  tutorialSource      String?
}
```

**Nenhum campo existente muda.** Sem índice novo, sem tabela nova.

## 2. `lib/tutorial/state.ts` — lógica pura

```ts
export interface TutorialState {
  completedAt: Date | null;
  completedVersion: number | null;
}

export function tutorialRequired(state: TutorialState, requiredVersion: number): boolean;
```

Regras, **exatamente**:

| Estado | Resultado |
|---|---|
| `completedAt === null` | **true** |
| `completedVersion === null` mas `completedAt` preenchido | **true** (dado inconsistente → conservador) |
| `completedVersion < requiredVersion` | **true** |
| `completedVersion === requiredVersion` | false |
| `completedVersion > requiredVersion` (rollback de versão) | **false** — não forçar tutorial à toa |

Pura, sem React, sem I/O — testável em `environment: "node"`.

## 3. `lib/tutorial/versions.ts`

```ts
export const TUTORIAL_VERSIONS: Readonly<Record<string, number>> = { /* 34 ids */ };
```

**Todos em `1`, exceto três em `2`** — mecânica reescrita, decisão dela:
`vigilancia` · `focus-agents` · `informacao-em-foco`.

Os 34 ids vêm de `docs/architecture/CANONICAL_EXERCISES.md` / `lib/prescription/catalog.ts`. **Não
inventar id.** Exportar também `tutorialVersionFor(exerciseId): number | undefined`, que devolve
`undefined` para id desconhecido — **nunca lança**.

## 4. `lib/tutorial/types.ts` — o contrato que impede dano clínico

```ts
export type GuidedOutcome = "correct" | "incorrect";

export interface GuidedAttemptProps {
  onOutcome: (outcome: GuidedOutcome) => void;
}

export interface TutorialDefinition {
  exerciseId: string;
  version: number;
  Demonstration: React.ComponentType<{ onDone: () => void }>;
  GuidedAttempt: React.ComponentType<GuidedAttemptProps>;
  retryHint: string;
}
```

⚠️ **A garantia é o que o contrato NÃO tem.** Nenhum `onComplete`; `GuidedOutcome` sem score, tempo
ou acurácia. **Não acrescentar nada disso.**

⚠️ **`lib/tutorial/` não pode importar** `useTimedProgress`, `useExerciseProgress` nem nada de
`lib/adaptive`.

## 5. `app/api/exercise-tutorial/route.ts`

`POST` com corpo `{ exerciseId: string; version: number }`, validado por **Zod**.

- autentica com `getServerSession` — o middleware **não cobre `/api`**;
- **só o próprio paciente** grava o próprio estado (ownership por `session.user.patientId`);
- `exerciseId` fora dos 34 → **400**, sem criar linha;
- `upsert` em `ExerciseConfig` por `[patientId, exerciseId]`, gravando **somente**
  `tutorialCompletedAt = now()`, `tutorialVersion = version`, `tutorialSource = "PATIENT"`;
- idempotente: repetir a chamada não muda mais nada.

⛔ **A rota NÃO PODE tocar:** `Session` · `currentDifficulty` · `lastAttemptAt` · `totalAttempts` ·
progressão · achievements · alertas · métricas · histórico · dose.

⚠️ **`lastAttemptAt` é crítico:** a tela de treino o usa para bloquear o exercício no mesmo dia
(`blockedToday`). Tocá-lo impediria o paciente de treinar depois de ver o tutorial.

⚠️ No `create` do upsert, **não** definir `currentDifficulty` nem `totalAttempts` — deixar o
`@default` agir.

## 6. `components/exercises/PreparationScreen.tsx`

Props: `title` · `levelLabel?: string` · `onStart` · `onHowItWorks`.

Mostra **só**: nome do exercício · nível quando houver · **[Começar]** · **[Como funciona]**.

⛔ **Proibido exibir:** quantidade de dígitos ou de itens da próxima unidade · tamanho previsto ·
qualquer pista sobre a unidade que virá · recorde · carga · fadiga · protocolo · métricas do
terapeuta.

Decisão dela: *"5 dígitos"* saiu do jogo por dar pista indevida, e **não volta aqui**. Por isso a
prop é `levelLabel`, montado por quem chama — o componente **não** deriva texto de dificuldade.

Respeitar os três temas (CLINICAL, COLORFUL, GAMIFIED), como o resto.

⚠️ **Criar, não usar.** Nenhum exercício a consome nesta fase.

## 7. `docs/scripts/backfill-tutorial.sql`

Arquivo **documentado, não executado**:

```sql
-- Backfill do tutorial — NÃO EXECUTAR SEM A ETAPA CONTROLADA DE PRODUÇÃO.
-- Marca como conhecido quem já executou o exercício de verdade.
-- Idempotente. Não altera tentativas, níveis, progresso, datas nem sessões.
UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion"     = 1,
    "tutorialSource"      = 'BACKFILL'
WHERE "totalAttempts" > 0
  AND "tutorialCompletedAt" IS NULL;

-- Rollback SÓ do backfill — preserva conclusões reais do paciente.
-- UPDATE "ExerciseConfig"
-- SET "tutorialCompletedAt" = NULL, "tutorialVersion" = NULL, "tutorialSource" = NULL
-- WHERE "tutorialSource" = 'BACKFILL';
```

Comentar no arquivo: **grava versão 1**, então nos três exercícios que nascem em versão 2 o paciente
com histórico verá o tutorial novo **uma vez** — intencional.

## 8. Lógica de backfill testável

Como o SQL não roda em teste, extrair a **decisão** para função pura em `lib/tutorial/state.ts`:

```ts
export interface BackfillCandidate {
  totalAttempts: number;
  tutorialCompletedAt: Date | null;
  lastAttemptAt: Date | null;
  createdAt: Date;
}
export interface BackfillResult {
  tutorialCompletedAt: Date;
  tutorialVersion: number;
  tutorialSource: "BACKFILL";
}
/** Devolve null quando a linha NÃO deve ser tocada. */
export function backfillDecision(row: BackfillCandidate): BackfillResult | null;
```

Deve espelhar o SQL **exatamente**: só `totalAttempts > 0` e `tutorialCompletedAt === null`; data =
`lastAttemptAt ?? createdAt`; versão 1; origem `"BACKFILL"`.

## 9. Testes

**Puros:**

1. as 5 regras de `tutorialRequired` da seção 2;
2. `TUTORIAL_VERSIONS` cobre os 34 ids canônicos e nenhum id fora deles;
3. os três reformulados estão em 2; os demais em 1;
4. toda versão é inteiro ≥ 1;
5. `tutorialVersionFor` devolve `undefined` para id desconhecido, sem lançar;
6. `backfillDecision`: `totalAttempts > 0` e sem conclusão → marca;
7. `totalAttempts === 0` → **null** (não toca);
8. já concluído → **null** (idempotente);
9. usa `lastAttemptAt` quando existe; `createdAt` quando não;
10. sempre devolve `tutorialSource: "BACKFILL"`.

**Estáticos, no estilo do `save-button-guard`** — leem o fonte e falham:

11. `lib/tutorial/` **não** importa `useTimedProgress`, `useExerciseProgress` nem `lib/adaptive`;
12. `types.ts` **não** contém `onComplete`, `score`, `accuracy` nem `reactionTime`;
13. `exercise-tutorial/route.ts` **não** menciona `session.create`, `currentDifficulty`,
    `lastAttemptAt`, `totalAttempts`, `achievement` nem `alert`;
14. `PreparationScreen.tsx` **não** contém "dígitos", "recorde", "carga", "fadiga" nem "protocolo".

## 10. Provas permitidas

```
npx prisma validate    # exit 0
npx prisma generate    # exit 0
npx tsc --noEmit       # exit 0
npx vitest run         # 453 + novos, TODOS passando
npm run build          # exit 0
```

⛔ **`prisma db push` é proibido.**

## Entrega

Arquivos criados e alterados · diff resumido · confirmação de que
`app/api/patients/[id]/route.ts` **não** precisou mudar e por quê · nº de testes novos · saída de
`prisma validate` e `generate` · confirmação de que **nada foi executado no banco**. Não commitar.
