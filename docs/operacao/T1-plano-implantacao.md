# Fase T1 — plano operacional de implantação

> **NADA EXECUTADO.** Este documento é o roteiro. Nenhum `db push`, nenhum SQL, nenhuma publicação.
> Base: código da T1 aprovado em `4999292`.

⛔ **Este plano não deve ser executado até ela autorizar, item por item.**

## 0. Estado de partida

- **Código T1 commitado e provado** (`4999292`): `prisma validate` 0 · `generate` 0 · `tsc` 0 ·
  471/471 · `build` 0.
- **Banco de produção intocado.** Os três campos e o enum existem **só** no `schema.prisma` local.
- **Produção roda v2.72.0**, cujo código **não conhece** os campos novos.

## 1. Verificação do mecanismo de backup — **ação dela, evidência obrigatória**

⚠️ **Eu não verifiquei e não posso verificar sozinho.** O backup do Supabase se confirma no painel
web (autenticado) ou via API com credencial de projeto. Não vou usar credencial para inspecionar
infraestrutura sem ela mandar.

**O que precisa ser apresentado antes de qualquer alteração:**

| # | Evidência | Onde obter |
|---|---|---|
| 1 | Plano do projeto e **política de backup** que ele inclui | Supabase → Project Settings → General |
| 2 | **Data e hora do último backup** | Supabase → Database → Backups |
| 3 | Se o backup cobre **este** projeto (`neuropeak`), não outro | mesma tela |
| 4 | **Como restaurar** e quanto tempo leva | Supabase → Database → Backups → Restore |
| 5 | Se há **PITR** (point-in-time recovery) ativo | Project Settings → Add-ons |

⚠️ **No plano gratuito do Supabase, backups automáticos podem não existir ou ter retenção curta.**
Se for o caso, o item 3 abaixo deixa de ser opcional e vira **pré-requisito**.

## 2. Evidência do último backup recuperável

**Critério de aceite para prosseguir:** existe backup com data **conhecida**, **posterior** à última
sessão clínica registrada, e com procedimento de restauração **conhecido**.

Sem isso, **não prosseguir** para o passo 4.

## 3. Exportação lógica adicional — recomendada, obrigatória se o item 2 falhar

Dump lógico local, antes de tocar no schema:

```bash
# Requer a connection string direta (DIRECT_URL). NÃO colar a senha no chat nem em arquivo versionado.
pg_dump "$DIRECT_URL" --format=custom --no-owner --no-acl \
  --file="backup-neuropeak-$(date +%Y%m%d-%H%M).dump"

# Conferir que o arquivo não está vazio e lista as tabelas esperadas:
pg_restore --list "backup-neuropeak-AAAAMMDD-HHMM.dump" | grep -E "ExerciseConfig|Session|Patient" | head
```

⚠️ **O arquivo contém dado clínico de paciente.** Guardar fora do repositório, em local controlado,
e apagar quando não for mais necessário. **Nunca** commitar.

**Alternativa mínima**, se `pg_dump` não estiver disponível — exportar só o que a T1 toca:

```sql
COPY (SELECT * FROM "ExerciseConfig") TO STDOUT WITH CSV HEADER;
```

## 4. Aplicar os três campos e o enum

```bash
# 4.1 — Ver o que o Prisma pretende fazer, SEM aplicar:
npx prisma migrate diff \
  --from-url "$DIRECT_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

⚠️ **Ler a saída inteira antes de continuar.** O esperado é **exatamente**:

- `CREATE TYPE "TutorialSource" AS ENUM ('BACKFILL', 'PATIENT');`
- `ALTER TABLE "ExerciseConfig" ADD COLUMN "tutorialCompletedAt" TIMESTAMP(3);`
- `ALTER TABLE "ExerciseConfig" ADD COLUMN "tutorialVersion" INTEGER;`
- `ALTER TABLE "ExerciseConfig" ADD COLUMN "tutorialSource" "TutorialSource";`

⛔ **Se aparecer qualquer `DROP`, `ALTER COLUMN` ou menção a outra tabela — PARAR.** Significa que o
schema local divergiu do banco por outro motivo, e aplicar destruiria algo.

```bash
# 4.2 — Aplicar (só depois de 4.1 conferido):
npx prisma db push
```

⚠️ **`db push` pode remover as três CHECK de `Session`** — elas não estão no schema. Por isso o
passo 5 é **obrigatório logo em seguida**, na mesma janela.

## 5. Reaplicar as três CHECK de `Session`

⚠️ **O teto de `difficulty` é 13, NÃO 10.** Foi ampliado em 02/08/2026 (SCHEMA-02). Reaplicar com 10
quebra Supermercado (11–12), Ordem da História (11–12) e Agentes Focus (13), e faz o
`POST /api/sessions` **perder a sessão do paciente** por violação de CHECK.

```sql
-- Confere que nada existente ficaria fora do range (tem de dar 0 nas três):
SELECT
  (SELECT count(*) FROM "Session" WHERE score < 0 OR score > 100)      AS score_fora,
  (SELECT count(*) FROM "Session" WHERE accuracy < 0 OR accuracy > 1)  AS accuracy_fora,
  (SELECT count(*) FROM "Session" WHERE difficulty < 1 OR difficulty > 13) AS difficulty_fora;

ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS session_score_range;
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS session_accuracy_range;
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS session_difficulty_range;

ALTER TABLE "Session" ADD CONSTRAINT session_score_range      CHECK (score >= 0 AND score <= 100);
ALTER TABLE "Session" ADD CONSTRAINT session_accuracy_range   CHECK (accuracy >= 0 AND accuracy <= 1);
ALTER TABLE "Session" ADD CONSTRAINT session_difficulty_range CHECK (difficulty >= 1 AND difficulty <= 13);
```

## 6. Conferir constraints — antes e depois

Rodar **antes do passo 4** e **depois do passo 5**, e comparar as duas saídas:

```sql
SELECT conname, pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid IN ('"Session"'::regclass, '"ExerciseConfig"'::regclass)
ORDER BY conname;
```

**Critério de aceite:** a saída depois contém **tudo** que havia antes, mais nada a menos. As três
CHECK de `Session` presentes, com `difficulty <= 13`.

## 7. Contagens prévias do backfill

Rodar **antes** do passo 8 e guardar a saída:

```sql
SELECT
  count(*)                                            AS total_configs,
  count(*) FILTER (WHERE "totalAttempts" > 0)         AS com_execucao,
  count(*) FILTER (WHERE "totalAttempts" = 0)         AS sem_execucao,
  count(*) FILTER (WHERE "tutorialCompletedAt" IS NOT NULL) AS ja_preenchidos
FROM "ExerciseConfig";
```

**Esperado antes do backfill:** `ja_preenchidos = 0`.
**Previsão:** o backfill deve marcar exatamente `com_execucao` linhas.

## 8. Backfill — execução separada

⛔ **Nunca junto do passo 4.** Schema e dado são operações distintas, com verificação entre elas.

```sql
UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion"     = 1,
    "tutorialSource"      = 'BACKFILL'::"TutorialSource"
WHERE "totalAttempts" > 0
  AND "tutorialCompletedAt" IS NULL;
```

**Critério de aceite:** linhas afetadas **==** `com_execucao` do passo 7. Repetir a consulta 7 e
confirmar que `ja_preenchidos` agora é igual a `com_execucao`.

## 9. Rollback seletivo — só o backfill

```sql
UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = NULL,
    "tutorialVersion"     = NULL,
    "tutorialSource"      = NULL
WHERE "tutorialSource" = 'BACKFILL'::"TutorialSource";
```

⚠️ **Preserva integralmente** quem tem `tutorialSource = 'PATIENT'` — conclusões reais do paciente
não são tocadas. É por isso que o enum existe.

## 10. Provar que nada clínico mudou

Rodar **antes do passo 4** e **depois do passo 8**, comparando:

```sql
SELECT
  count(*)                        AS linhas,
  sum("currentDifficulty")        AS soma_dificuldade,
  sum("totalAttempts")            AS soma_tentativas,
  max("lastAttemptAt")            AS ultimo_treino,
  count(*) FILTER (WHERE "lastAttemptAt" IS NULL) AS sem_ultimo_treino
FROM "ExerciseConfig";

SELECT count(*) AS total_sessoes, max("completedAt") AS ultima_sessao FROM "Session";
```

**Critério de aceite: todos os valores idênticos antes e depois.** Qualquer divergência → parar e
investigar antes de publicar.

## 11. Smoke test da leitura

Com o código T1 **ainda não publicado**, o banco já tem os campos. Verificar que a leitura atual não
quebrou:

```sql
SELECT "exerciseId", "currentDifficulty", "totalAttempts",
       "tutorialCompletedAt", "tutorialVersion", "tutorialSource"
FROM "ExerciseConfig" LIMIT 5;
```

E, em produção (v2.72.0, que ainda não conhece os campos): abrir a tela de treino de um paciente e
confirmar que **carrega normalmente**. Campos extras num include booleano são ignorados por quem não
os usa — mas isso se confirma olhando, não supondo.

## 12. Smoke test da rota — só depois de publicar o código

```bash
# Autenticado como PACIENTE. Antes, guardar o estado:
#   SELECT "currentDifficulty","totalAttempts","lastAttemptAt" FROM "ExerciseConfig"
#   WHERE "patientId"='<id>' AND "exerciseId"='trilha-visual';

curl -X POST https://neuropeak-5jyl.vercel.app/api/exercise-tutorial \
  -H "Content-Type: application/json" \
  -b "<cookie de sessão do paciente>" \
  -d '{"exerciseId":"trilha-visual","version":1}'
```

**Critério de aceite:** `tutorialCompletedAt` e `tutorialVersion` preenchidos, `tutorialSource =
'PATIENT'`, e **`currentDifficulty`, `totalAttempts` e `lastAttemptAt` idênticos ao estado anterior**.

## 13. Ordem exata — banco antes do código

```
1. Backup verificado (itens 1–3)
2. Constraints ANTES (item 6) + contagens ANTES (itens 7 e 10)
3. migrate diff --script  → conferir a saída
4. db push
5. Reaplicar as 3 CHECK
6. Constraints DEPOIS (item 6) → comparar
7. Backfill (item 8)
8. Contagens DEPOIS (itens 7 e 10) → comparar
9. Smoke test de leitura (item 11)
10. ─── só agora ─── publicar o código: bump + push na main
11. Smoke test da rota (item 12)
```

**Por que o banco vem primeiro:** os campos são **opcionais**. Um banco com colunas que o código
ainda não usa é inofensivo. O inverso — código que grava em coluna inexistente — **quebra em
produção**. A ordem só admite esta direção.

## 14. Se uma etapa falhar no meio

| Falha em | Estado | Ação |
|---|---|---|
| **1–3** (backup) | banco intocado | **Parar.** Sem backup, não se prossegue. |
| **3.1** (`migrate diff` mostra DROP) | banco intocado | **Parar** e investigar a divergência de schema. |
| **4** (`db push`) | parcial possível | Rodar item 6 e ver o que existe. Colunas são aditivas — o mais provável é nada ter mudado. **Não publicar.** |
| **5** (CHECK) | ⚠️ **crítico** | O banco pode estar **sem** as CHECK. Reaplicar imediatamente. Se falhar por dado fora do range, corrigir o dado (Passo 2 do RUNBOOK) e reaplicar. **Não publicar até as três existirem.** |
| **7–8** (backfill) | dados parciais | Rodar o rollback seletivo (item 9) e recomeçar. É idempotente: o `IS NULL` protege. |
| **10** (publicação) | banco pronto, código velho | Inofensivo — o banco tem colunas ociosas. Republicar quando quiser. |
| **12** (smoke da rota) | código no ar | Se a rota tocar campo clínico: **reverter o código** (`git revert` + push). O banco fica; os dados gravados errados se corrigem pelo item 9. |

⚠️ **O ponto de não-retorno é o passo 5.** Entre o `db push` e a reaplicação das CHECK, o banco fica
**sem as travas** que impedem sessão com dado inválido. Essa janela deve ser a mais curta possível, e
**nenhum paciente deve estar treinando** durante ela.

**Recomendação:** executar em horário sem uso, e confirmar com ela antes qual é esse horário.

## 15. O que este plano NÃO faz

Não executa nada · não publica · não converte os pilotos · não altera código.
