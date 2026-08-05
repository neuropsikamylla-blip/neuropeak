-- Backfill do tutorial — NÃO EXECUTAR SEM A ETAPA CONTROLADA DE PRODUÇÃO.
-- Marca como conhecido quem já executou o exercício de verdade.
-- Idempotente. Não altera tentativas, níveis, progresso, datas nem sessões.
-- Grava versão 1. Nos três exercícios que nascem em versão 2, quem já tem histórico
-- verá o tutorial novo uma vez; esse comportamento é intencional.
UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion"     = 1,
    "tutorialSource"      = 'BACKFILL'::"TutorialSource"
WHERE "totalAttempts" > 0
  AND "tutorialCompletedAt" IS NULL;

-- Rollback SÓ do backfill — preserva conclusões reais do paciente.
-- UPDATE "ExerciseConfig"
-- SET "tutorialCompletedAt" = NULL, "tutorialVersion" = NULL, "tutorialSource" = NULL
-- WHERE "tutorialSource" = 'BACKFILL'::"TutorialSource";
