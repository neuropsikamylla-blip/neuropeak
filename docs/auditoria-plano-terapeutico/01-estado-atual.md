# 01 — Estado atual do sistema de planos (auditoria, 02/ago/2026)

> Levantado lendo o código em `HEAD 13067d4`. Nada foi alterado.

## Onde a tela vive

| Peça | Arquivo | Linhas |
|---|---|---|
| Página do plano | `app/(therapist)/pacientes/[id]/plano/page.tsx` | 259 |
| Coluna direita ("Plano em construção") | `components/plano/PlanBuilderSidebar.tsx` | 145 |
| Card de exercício com os ajustes | `components/plano/ExerciseCard.tsx` | 225 |
| Linha da biblioteca | `components/plano/ExerciseRow.tsx` | 74 |
| Catálogo / navegação | `DomainSelector` · `DomainTabs` · `SubdomainTabs` · `ExerciseSearch` · `ExerciseTable` · `ExerciseTags` · `DistributionChart` | ~460 |

Estado é **local à página** (`useState`), sem store/contexto: `selectedExercises`,
`exerciseLevels`, `exerciseSettings`, `spanSettings`, `sessionDuration`, `frequency`.
Persistência por `fetch` para a API de plano; leitura no `useEffect` inicial.

## Duração da sessão

`PlanBuilderSidebar.tsx:55-59` — **campo numérico livre**:

```tsx
<input type="number" min={10} max={90} value={sessionDuration} … />
```

⚠️ **Divergência com o pedido:** não existem as opções **20 / 30 / 40**. É qualquer inteiro entre
10 e 90, digitado. O valor é guardado e enviado no plano, mas **não participa de nenhum cálculo,
alerta ou validação** — nada compara a soma dos exercícios com ele.

## Frequência semanal

`PlanBuilderSidebar.tsx:62-64` — **campo numérico livre** `min={1} max={7}`, default `3`
(`plano/page.tsx:38`). Não existem as opções 1–5; 6 e 7 são aceitos. Também não alimenta cálculo
nenhum — é dado de prescrição, guardado e exibido.

## Duração exibida por exercício (o "~7 min")

**Origem: literal em `types/index.ts`**, dentro de `EXERCISE_DEFINITIONS`, campo
`estimatedMinutes`. Não vem de configuração, de tentativas, do exercício nem de medição:

- Nas definições técnicas: **38 registros com `7`**, dois com `8`, um com `9`. O catálogo clínico
  válido continua com 34 exercícios; registros de compatibilidade não entram nessa contagem.

Exibição: `ExerciseRow.tsx:43` (`{estimatedMinutes} min`) e `:55` (`~{estimatedMinutes} min`).

## Total da sessão

`PlanBuilderSidebar.tsx:38`:

```ts
const totalMinutes = items.reduce((sum, ex) => sum + (ex.estimatedMinutes ?? 0), 0);
```

Ou seja: **total = nº de exercícios × 7** (na prática). Não usa a configuração de cada exercício,
não usa a duração real medida, não considera transições e **não é comparado com `sessionDuration`**.
Não há alerta de sessão curta nem de sessão excessiva.

## Tentativas

O controle de **10 / 15 / 20 / 30** existe **só para os spans**:

- Interface: `ExerciseCard.tsx:190-197`, dentro do ramo `!isSpan ? … : (…)` — aparece apenas quando
  `isSpan` é verdadeiro.
- Quem é span: `plano/page.tsx:21` → `SPAN_IDS = ["span-numerico", "span-numerico-inverso"]`.
- Efeito real: `SpanNumerico.tsx:298` → `const done = newAttempts.length >= cfg.trials;` — é o que
  encerra o exercício. Default `trials: 15`, `allowReplay: true` (`SpanNumerico.tsx:22-23`).

**Os outros 32 exercícios clínicos não têm dose por tentativas** — encerram por tempo (`useTimedProgress`,
sessão-alvo de tempo ATIVO). Ver o inventário no documento 02.

## Repetição de áudio

Mesma família: `ExerciseCard.tsx:199-204`, `allowReplay` (Sim/Não), só para os spans. Hoje é
booleano sem limite de repetições, sem contagem e **sem qualquer efeito na progressão** — repetir
não é registrado como ajuda.

## Níveis

- **Prescrição:** `ExerciseCard` tem "Nível inicial" — para o Focus, rótulo "(1–5)" com cinco
  pastilhas; para os demais, `level` de 1 a 10 (`plano/page.tsx`, `exerciseLevels`).
- **Progresso real:** `ExerciseConfig.currentDifficulty` no banco (por paciente e exercício),
  calculado server-side em `POST /api/sessions` por `lib/adaptive.ts` — quatro caminhos
  (`calculateProgression` genérica com `maxLevel`, `calculateFocusProgression` com
  `maxLevel = FOCUS_MAX_LEVEL = 13`, `calculateStoryTrailProgression`, `calculateNewDifficulty` legado).
- **Inconsistência de escala:** o rótulo do card diz 1–10 (e 1–5 no Focus), mas há exercícios com
  teto 12 (Supermercado, trilha da História) e 13 (Focus). O banco aceita 1–13 desde v2.65.3
  (CHECK `session_difficulty_range` + `sessionSchema.max(13)`).

## Retomada

Não existe tela de "continuar ou recomeçar" para o paciente — o exercício lê a dificuldade vinda do
banco. No Focus, `resolveFocusStartStep(settings?.startLevel, difficulty)` prioriza o nível
persistido e usa a conversão por `difficulty` só para sessões antigas
(`lib/focus/progression.ts`). **O princípio já é o desejado**; o que falta é uniformidade entre
exercícios e clareza sobre quando o "nível inicial" prescrito sobrescreve o progresso.

## Inconsistências encontradas (resumo)

1. `estimatedMinutes` fixo em 7 para quase todos → total do plano irreal.
2. Duração e frequência são campos livres, não as faixas clínicas descritas (20/30/40 e 1–5).
3. `sessionDuration` não é confrontado com o total — nenhum alerta.
4. Dose por tentativas sobrevive só nos spans; o resto já é por tempo (a hipótese de trabalho
   assumia o contrário).
5. Escala de nível divergente entre card (1–10 / 1–5), motor (10, 12, 13) e banco (13).
6. `allowReplay` sem limite, sem registro e sem efeito na progressão — repetir áudio muda o
   construto medido e hoje é invisível.
7. Não há noção de carga cognitiva em lugar nenhum do código.
