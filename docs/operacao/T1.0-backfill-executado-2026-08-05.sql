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
