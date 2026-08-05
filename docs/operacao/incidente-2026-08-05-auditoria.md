# Incidente de 05/ago/2026 — auditoria dos registros afetados

> **Diagnóstico e plano. Nada executado.** Nenhuma consulta rodada no banco, nenhuma correção de
> dado. A T1 continua parada.
>
> Hotfix já publicado: **v2.75.1** (`0c0c410`).

## 1. A janela do incidente

| | |
|---|---|
| **Início** | v2.73.0 — commit `831d8eb`, **04/ago/2026 23:46 (-03)** |
| **Fim** | v2.75.1 — commit `0c0c410`, **05/ago/2026 15:51 (-03)** |
| **Duração** | ~16 horas |

Nesse período, toda chamada que tocasse `ExerciseConfig` falhava com 500.

## 2. O que aconteceu com cada dado — pela ordem do código

`app/api/sessions/route.ts` executa nesta ordem:

```
1. prisma.session.create(...)         ← ✅ EXECUTOU: a sessão foi gravada
2. prisma.session.findMany(...)       ← ✅ leitura, sem ExerciseConfig
3. calcula adaptiveResult              ← ✅ calculou
4. prisma.exerciseConfig.upsert(...)  ← ❌ FALHOU AQUI (colunas inexistentes)
5. achievements                        ← ❌ nunca chegou
6. alertas                             ← ❌ nunca chegou
```

| Dado | Estado |
|---|---|
| **`Session`** | ✅ **gravada** — nenhum treino se perdeu |
| **`Session.metadata`** | ✅ gravado, e é a chave da reparação (ver 4.3) |
| `ExerciseConfig.currentDifficulty` | ❌ **congelado** no valor pré-incidente |
| `ExerciseConfig.lastAttemptAt` | ❌ congelado |
| `ExerciseConfig.totalAttempts` | ❌ congelado |
| `ExerciseConfig` inexistente | ❌ **não foi criado** — primeiro treino de um exercício na janela não gerou registro |
| `Achievement` | ❌ conquistas do período não foram concedidas |
| `Alert` | ❌ alertas do período não foram gerados |

⚠️ **Achievements e alertas não estavam na sua lista, mas também falharam** — o código nunca chegou
neles. Registro aqui para a decisão ser completa.

## 3. Consultas de diagnóstico — **somente leitura**

⛔ Nenhuma altera dado. Executar apenas quando ela autorizar.

### 3.1 Sessões gravadas na janela

```sql
SELECT count(*) AS sessoes_na_janela,
       count(DISTINCT "patientId")  AS pacientes,
       count(DISTINCT "exerciseId") AS exercicios
FROM "Session"
WHERE "completedAt" >= '2026-08-04 23:46:00-03'
  AND "completedAt" <  '2026-08-05 15:51:00-03';
```

### 3.2 Pacientes e exercícios afetados, com o que divergiu

```sql
SELECT s."patientId",
       s."exerciseId",
       count(*)                        AS sessoes_na_janela,
       max(s."completedAt")            AS ultima_sessao,
       c."totalAttempts"               AS attempts_registrado,
       c."lastAttemptAt"               AS ultimo_registrado,
       c."currentDifficulty"           AS dificuldade_registrada,
       (c.id IS NULL)                  AS config_inexistente
FROM "Session" s
LEFT JOIN "ExerciseConfig" c
       ON c."patientId" = s."patientId" AND c."exerciseId" = s."exerciseId"
WHERE s."completedAt" >= '2026-08-04 23:46:00-03'
  AND s."completedAt" <  '2026-08-05 15:51:00-03'
GROUP BY s."patientId", s."exerciseId", c.id, c."totalAttempts", c."lastAttemptAt", c."currentDifficulty"
ORDER BY s."patientId", s."exerciseId";
```

**Como ler:** `ultimo_registrado` **anterior** a `ultima_sessao` confirma o congelamento.
`config_inexistente = true` indica exercício estreado na janela, sem registro nenhum.

### 3.3 O que o metadata guardou

```sql
SELECT "exerciseId",
       count(*) AS sessoes,
       count(*) FILTER (WHERE metadata LIKE '%nextLevel%' OR metadata LIKE '%endedLevel%') AS com_nivel_no_metadata
FROM "Session"
WHERE "completedAt" >= '2026-08-04 23:46:00-03'
  AND "completedAt" <  '2026-08-05 15:51:00-03'
GROUP BY "exerciseId" ORDER BY sessoes DESC;
```

## 4. Reconstrução — o que é seguro e o que não é

### 4.1 `totalAttempts` — ✅ reconstruível com segurança

O upsert fazia `{ increment: 1 }` por sessão. O valor correto é o registrado **mais** as sessões da
janela.

```sql
-- DIAGNÓSTICO (não altera nada)
SELECT c.id, c."patientId", c."exerciseId",
       c."totalAttempts"                    AS valor_atual,
       c."totalAttempts" + j.sessoes        AS valor_proposto
FROM "ExerciseConfig" c
JOIN (
  SELECT "patientId", "exerciseId", count(*) AS sessoes FROM "Session"
  WHERE "completedAt" >= '2026-08-04 23:46:00-03' AND "completedAt" < '2026-08-05 15:51:00-03'
  GROUP BY "patientId", "exerciseId"
) j ON j."patientId" = c."patientId" AND j."exerciseId" = c."exerciseId";
```

⚠️ **Só somar, nunca recontar do zero:** `totalAttempts` acumula desde sempre, e recontar apagaria o
histórico anterior à janela.

### 4.2 `lastAttemptAt` — ✅ reconstruível com segurança

É o `max(completedAt)` das sessões daquele par paciente-exercício. Não depende de lógica.

### 4.3 `currentDifficulty` — ⚠️ depende do exercício

O valor gravado **não** é a dificuldade jogada (`Session.difficulty`), e sim a **próxima**, calculada
por um de três caminhos: `calculateDualTaskProgression`, `calculateProgression` (progressionV2) ou
`calculateNewDifficulty` (legado sobre as 20 últimas sessões).

**Boa notícia:** parte dos exercícios grava esse valor no `metadata` da Session — que **foi gravada**:

| Caminho | Grava no metadata? | Reconstrução |
|---|---|---|
| Dupla Tarefa | `endedLevel`, `consolidatedLevel` | ✅ **direta** — ler o metadata da última sessão |
| Agentes Focus | `nextLevel`, `endedLevel` | ✅ **direta** |
| `progressionV2` | varia por exercício | ⚠️ verificar caso a caso (consulta 3.3) |
| Legado | **não grava** | ❌ exigiria replay |

**Para os que não gravaram**, há três opções, em ordem de segurança:

1. **Não mexer.** A progressão adaptativa recalcula sozinha na próxima sessão — o paciente perde no
   máximo um passo de ajuste. **É a opção mais segura, e a que eu recomendo.**
2. **Replay** da lógica sobre o histórico. Determinístico, mas usa o código de **hoje** sobre
   sessões de ontem — se a regra mudou nesse intervalo, o resultado não é o que teria sido.
3. **Usar a última `Session.difficulty`.** ⛔ **Não recomendo:** é a dificuldade **jogada**, não a
   próxima. Congelaria o paciente no nível em que estava, ignorando o acerto ou erro da sessão.

### 4.4 `ExerciseConfig` inexistente

Exercício estreado na janela não tem registro. Criar um com
`currentDifficulty = 1, totalAttempts = <sessões>, lastAttemptAt = <max>` reproduz o que o `create`
teria feito, **exceto** a dificuldade — que teria vindo do cálculo adaptativo.

⚠️ Como o padrão é `1` e o paciente estreou ali, o desvio é pequeno. **Mas é decisão dela.**

### 4.5 Achievements e alertas

Conquistas do período não foram concedidas. `checkAchievements` roda sobre as 20 sessões recentes,
então **a próxima sessão do paciente provavelmente concede as que ficaram para trás** — sem
intervenção. Alertas do cron rodam diariamente e se regeneram.

**Recomendo não tocar nesses dois.**

## 5. Plano de reparação proposto

| Fase | Ação | Risco |
|---|---|---|
| **R0** | rodar as consultas 3.1, 3.2 e 3.3 — **só leitura** | nenhum |
| **R1** | apresentar a ela a lista exata de linhas e valores propostos | nenhum |
| **R2** | **backup** antes de qualquer escrita (nível 2 — é `UPDATE` em massa) | — |
| **R3** | corrigir `lastAttemptAt` e `totalAttempts` — os dois seguros | baixo |
| **R4** | decidir sobre `currentDifficulty`, caso a caso | médio |
| **R5** | conferência pós-correção, comparando com o diagnóstico | — |

⛔ **Nada de R2 em diante sem autorização explícita, linha a linha.**

⚠️ **A reparação é `UPDATE` em massa — nível 2 da política de backup.** Exige backup **e**
restauração de teste antes.

## 6. O que preciso da senhora para seguir

1. Autorização para rodar as **consultas de leitura** (3.1 a 3.3) — não alteram nada;
2. como executá-las: pelo SQL Editor do Supabase, ou prefere outro caminho?

Com os números em mãos, apresento a lista exata de linhas afetadas e os valores propostos, antes de
qualquer escrita.

## 7. O que este documento NÃO faz

Não executa consulta · não altera dado · não toca no banco · não inicia a T1.
