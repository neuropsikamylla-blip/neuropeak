-- =====================================================================
-- T1.0 — BACKFILL DO TUTORIAL · REGISTRO DO QUE FOI EXECUTADO
-- =====================================================================
--
-- ⚠️ ESTE ARQUIVO É REGISTRO HISTÓRICO, NÃO É PARA REEXECUTAR.
--    É a cópia LITERAL do script que rodou em produção. O SQL abaixo não
--    deve ser alterado: se precisar de outro backfill, escreva outro
--    arquivo. Reexecutar este aqui aborta na primeira trava (o filtro é
--    idempotente e devolveria 0 linhas, não 16).
--
-- O QUE FEZ
--    Marcou como "tutorial já concluído" os registros de "ExerciseConfig"
--    em que o paciente COMPROVADAMENTE já treinou, para que ninguém que já
--    usa a plataforma seja obrigado a rever o tutorial quando o framework
--    entrar. Filtro restritivo de quatro critérios: totalAttempts > 0 E os
--    três campos de tutorial IS NULL (portanto não toca em quem nunca
--    treinou nem em quem já tinha o tutorial registrado).
--    Valores gravados:
--      tutorialCompletedAt = COALESCE(lastAttemptAt, createdAt)
--      tutorialVersion     = 1
--      tutorialSource      = 'BACKFILL'
--
-- QUANDO / ONDE
--    Executado em 05/ago/2026, sobre o banco de PRODUÇÃO (Supabase),
--    pela conexão DIRETA (DIRECT_URL, porta 5432 — nunca a 6543).
--    Precedido do backup validado
--    ~/backups-neuropeak/neuropeak-20260805-163204.dump
--    (pg_restore --list exit 0 + restauração de teste, 8/8 contagens
--    idênticas) e da transação de schema da seção 2 do roteiro
--    (docs/operacao/T1.0-roteiro-implantacao.sql), que criou o enum
--    TutorialSource e as três colunas nuláveis em "ExerciseConfig".
--
-- RESULTADO
--    16 linhas alteradas, de 82 em "ExerciseConfig". As outras 66 têm
--    totalAttempts = 0 e ficaram intocadas. As 16 datas vieram todas de
--    lastAttemptAt. Após o COMMIT, as 12 verificações foram repetidas em
--    nova conexão: 12/12 conformes.
--
-- POR QUE AS TRAVAS SÃO 1/(CASE ... )
--    Cada verificação divide 1 pelo resultado de um CASE que vale 1 quando
--    o valor MEDIDO bate com o esperado e 0 quando não bate. Divergência =>
--    divisão por zero => erro => a transação inteira aborta e nada é
--    commitado. A validação é, portanto, automática: não depende de alguém
--    ler a saída na tela.
--    O divisor PRECISA depender de um valor medido. Uma trava constante do
--    tipo CASE WHEN <ok> THEN 'OK' ELSE (1/0)::text END NÃO funciona: o
--    PostgreSQL dobra expressões constantes em tempo de planejamento e o
--    1/0 explode antes de o CASE decidir, mesmo com a condição verdadeira.
--    (Foi o que abortou a 1ª tentativa; a 2ª abortou por outro motivo —
--    CREATE TEMP TABLE ... ON COMMIT DROP fora do BEGIN, dropada pelo
--    autocommit. Ambas com ROLLBACK e zero dado alterado.)
--
-- POR QUE OS LITERAIS (117, 34, 33, 82 e as contagens das demais tabelas)
--    São a FOTOGRAFIA do banco medida imediatamente antes deste backfill,
--    escrita aqui como número fixo de propósito. Comparar o banco com ele
--    mesmo dentro da transação não provaria nada; comparar com um valor
--    apurado antes prova que o UPDATE não tocou em soma de dificuldade,
--    em tentativas, em sessões nem na contagem de nenhuma outra tabela.
--    A 3ª tentativa passou a usar literais justamente porque a tabela
--    temporária que guardava essa fotografia não sobrevivia à transação.
-- =====================================================================

\set ON_ERROR_STOP on

BEGIN;

-- ── O BACKFILL — filtro restritivo dos quatro critérios ─────────────────────
-- A trava do próprio UPDATE: 16 linhas exatas, ou a transação morre aqui.
WITH atualizados AS (
  UPDATE "ExerciseConfig"
  SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
      "tutorialVersion"     = 1,
      "tutorialSource"      = 'BACKFILL'::"TutorialSource"
  WHERE "totalAttempts" > 0
    AND "tutorialCompletedAt" IS NULL
    AND "tutorialVersion"     IS NULL
    AND "tutorialSource"      IS NULL
  RETURNING id
)
SELECT count(*)                                        AS linhas_alteradas,
       1/(CASE WHEN count(*) = 16 THEN 1 ELSE 0 END)   AS trava_deve_ser_16
FROM atualizados;

-- ── VERIFICAÇÕES ────────────────────────────────────────────────────────────
-- O divisor depende do valor MEDIDO, então só é avaliado em execução.
-- Divergência => divisão por zero => transação abortada, nada commitado.

SELECT '1. marcados BACKFILL = 16' AS verificacao,
       count(*) FILTER (WHERE "tutorialSource"='BACKFILL') AS medido,
       1/(CASE WHEN count(*) FILTER (WHERE "tutorialSource"='BACKFILL') = 16 THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '2. totalAttempts=0 com data preenchida = 0' AS verificacao,
       count(*) FILTER (WHERE "totalAttempts"=0 AND "tutorialCompletedAt" IS NOT NULL) AS medido,
       1/(CASE WHEN count(*) FILTER (WHERE "totalAttempts"=0 AND "tutorialCompletedAt" IS NOT NULL) = 0 THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '3. datas <> COALESCE(lastAttemptAt, createdAt) = 0' AS verificacao,
       count(*) FILTER (WHERE "tutorialCompletedAt" IS NOT NULL
              AND "tutorialCompletedAt" <> COALESCE("lastAttemptAt","createdAt")) AS medido,
       1/(CASE WHEN count(*) FILTER (WHERE "tutorialCompletedAt" IS NOT NULL
              AND "tutorialCompletedAt" <> COALESCE("lastAttemptAt","createdAt")) = 0 THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '4. BACKFILL com tutorialVersion <> 1 = 0' AS verificacao,
       count(*) FILTER (WHERE "tutorialSource"='BACKFILL' AND "tutorialVersion" IS DISTINCT FROM 1) AS medido,
       1/(CASE WHEN count(*) FILTER (WHERE "tutorialSource"='BACKFILL' AND "tutorialVersion" IS DISTINCT FROM 1) = 0 THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '5. contagem de Session = 33' AS verificacao, count(*) AS medido,
       1/(CASE WHEN count(*) = 33 THEN 1 ELSE 0 END) AS ok FROM "Session";

SELECT '6. soma currentDifficulty = 117' AS verificacao, sum("currentDifficulty") AS medido,
       1/(CASE WHEN sum("currentDifficulty") = 117 THEN 1 ELSE 0 END) AS ok FROM "ExerciseConfig";

SELECT '7. soma totalAttempts = 34' AS verificacao, sum("totalAttempts") AS medido,
       1/(CASE WHEN sum("totalAttempts") = 34 THEN 1 ELSE 0 END) AS ok FROM "ExerciseConfig";

SELECT '8. max lastAttemptAt inalterado' AS verificacao, max("lastAttemptAt") AS medido,
       1/(CASE WHEN max("lastAttemptAt") = TIMESTAMP '2026-08-03 16:47:52.308' THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '9. nenhuma linha PATIENT' AS verificacao,
       count(*) FILTER (WHERE "tutorialSource"='PATIENT') AS medido,
       1/(CASE WHEN count(*) FILTER (WHERE "tutorialSource"='PATIENT') = 0 THEN 1 ELSE 0 END) AS ok
FROM "ExerciseConfig";

SELECT '10a. ExerciseConfig segue com 82 linhas' AS verificacao, count(*) AS medido,
       1/(CASE WHEN count(*) = 82 THEN 1 ELSE 0 END) AS ok FROM "ExerciseConfig";

-- 10b: nenhuma OUTRA tabela mudou de contagem (literais medidos antes do backfill).
SELECT '10b. demais tabelas intactas' AS verificacao,
       1/(CASE WHEN (SELECT count(*) FROM "Session")            = 33
                AND (SELECT count(*) FROM "Patient")            = 4
                AND (SELECT count(*) FROM "User")               = 1
                AND (SELECT count(*) FROM "Achievement")        = 5
                AND (SELECT count(*) FROM "Alert")              = 8
                AND (SELECT count(*) FROM "TrainingPlan")       = 25
                AND (SELECT count(*) FROM "TherapeuticSession") = 1
           THEN 1 ELSE 0 END) AS ok;

COMMIT;
