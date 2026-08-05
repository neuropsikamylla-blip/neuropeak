-- =====================================================================
-- T1.0 — IMPLANTAÇÃO DA FUNDAÇÃO DO TUTORIAL
-- Roteiro de execução manual. NADA FOI EXECUTADO.
-- =====================================================================
--
-- ⛔ NÃO USAR `prisma db push`.
--    O `migrate diff` revelou que o db push faria, além do pretendido:
--      · DROP de 2 foreign keys (LicenseCode, PasswordResetToken)
--      · DROP do índice idx_prt_token
--      · DROP DEFAULT em updatedAt de 5 tabelas
--      · DROP DEFAULT no id de TherapeuticSession  ← quebraria todo INSERT
--      · SET NOT NULL em User.crpStatus e User.crpAcceptedTerms
--      · mudanças de tipo em 4 tabelas
--      · RENAME do índice ExerciseConfig_pid_eid_key
--    Isso é dívida antiga entre banco e schema, não parte da T1. Ver seção 7.
--
-- Backup validado: ~/backups-neuropeak/neuropeak-20260805-163204.dump
--   pg_restore --list exit 0 · restauração de teste local · 8/8 contagens idênticas.
--
-- Conexão: DIRECT_URL (porta 5432). NUNCA a porta 6543 (transaction pooler).
-- =====================================================================


-- =====================================================================
-- 1. CONSULTAS PRÉVIAS — somente leitura, executar TODAS antes de seguir
-- =====================================================================

-- 1.1 O tipo TutorialSource NÃO deve existir ainda. Esperado: 0 linhas.
SELECT typname FROM pg_type WHERE typname = 'TutorialSource';

-- 1.2 As três colunas NÃO devem existir ainda. Esperado: 0 linhas.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ExerciseConfig'
  AND column_name IN ('tutorialCompletedAt', 'tutorialVersion', 'tutorialSource');

-- 1.3 As três CHECK de Session devem estar presentes. Esperado: 3 linhas.
--     ⚠️ session_difficulty_range TEM de aceitar 1–13, não 1–10.
SELECT conname, pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = '"Session"'::regclass AND contype = 'c'
ORDER BY conname;

-- 1.4 As FKs e o índice que o db push removeria devem continuar existindo.
--     Esperado: 3 linhas (2 FKs + 1 índice).
SELECT 'FK' AS tipo, conname AS nome FROM pg_constraint
WHERE conname IN ('LicenseCode_usedByTherapistId_fkey', 'PasswordResetToken_userId_fkey')
UNION ALL
SELECT 'INDEX', indexname FROM pg_indexes
WHERE indexname IN ('idx_prt_token', 'ExerciseConfig_pid_eid_key');

-- 1.5 Contagens — devem bater com o backup validado de 05/ago 16:32.
--     Esperado: Patient 4 · Session 33 · ExerciseConfig 82 · TrainingPlan 25
SELECT 'Patient' AS tabela, count(*) AS n FROM "Patient"
UNION ALL SELECT 'Session',        count(*) FROM "Session"
UNION ALL SELECT 'ExerciseConfig', count(*) FROM "ExerciseConfig"
UNION ALL SELECT 'TrainingPlan',   count(*) FROM "TrainingPlan"
ORDER BY tabela;

-- ⛔ PARAR se: o tipo já existir · alguma coluna já existir · faltar CHECK ·
--    difficulty não for 1–13 · faltar FK ou índice · contagem divergir.


-- =====================================================================
-- 2. TRANSAÇÃO DE SCHEMA — o único DDL da T1
-- =====================================================================
-- Executar como bloco único. Se qualquer comando falhar, ROLLBACK e parar.
-- Não acrescentar nenhuma outra alteração a esta transação.

BEGIN;

CREATE TYPE "TutorialSource" AS ENUM ('BACKFILL', 'PATIENT');

ALTER TABLE "ExerciseConfig"
  ADD COLUMN "tutorialCompletedAt" TIMESTAMP(3),
  ADD COLUMN "tutorialVersion"     INTEGER,
  ADD COLUMN "tutorialSource"      "TutorialSource";

COMMIT;

-- Em caso de erro:  ROLLBACK;  e parar. Nada terá sido alterado.
--
-- ⚠️ As três colunas nascem NULL em todas as 82 linhas. Nenhum dado existente
--    é lido, reescrito ou movido. Nenhuma outra tabela é tocada.


-- =====================================================================
-- 3. VERIFICAÇÃO APÓS O SCHEMA — antes de qualquer backfill
-- =====================================================================

-- 3.1 Enum criado com exatamente dois valores, nesta ordem.
SELECT e.enumlabel, e.enumsortorder
FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname = 'TutorialSource' ORDER BY e.enumsortorder;
-- Esperado: BACKFILL (1), PATIENT (2)

-- 3.2 As três colunas existem e são OPCIONAIS.
SELECT column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ExerciseConfig'
  AND column_name IN ('tutorialCompletedAt', 'tutorialVersion', 'tutorialSource')
ORDER BY column_name;
-- Esperado: is_nullable = YES nas três · column_default = NULL nas três

-- 3.3 Nenhuma outra coluna de ExerciseConfig mudou. Esperado: 9 linhas originais + 3 novas.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ExerciseConfig' ORDER BY ordinal_position;

-- 3.4 FKs e índice intactos. Esperado: as mesmas 3 linhas da consulta 1.4.
SELECT 'FK' AS tipo, conname AS nome FROM pg_constraint
WHERE conname IN ('LicenseCode_usedByTherapistId_fkey', 'PasswordResetToken_userId_fkey')
UNION ALL
SELECT 'INDEX', indexname FROM pg_indexes
WHERE indexname IN ('idx_prt_token', 'ExerciseConfig_pid_eid_key');

-- 3.5 As três CHECK de Session continuam presentes e difficulty continua 1–13.
--     ⚠️ O SQL manual NÃO toca em Session, então as CHECK não precisam ser
--        reaplicadas — apenas confirmadas.
SELECT conname, pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = '"Session"'::regclass AND contype = 'c' ORDER BY conname;

-- 3.6 Defaults de updatedAt preservados nas tabelas que o db push alteraria.
SELECT table_name, column_name, column_default
FROM information_schema.columns
WHERE column_name IN ('updatedAt', 'id')
  AND table_name IN ('ExerciseConfig','Patient','TrainingPlan','User','TherapeuticSession')
ORDER BY table_name, column_name;

-- 3.7 Contagens inalteradas. Esperado: idênticas à consulta 1.5.
SELECT 'Patient' AS tabela, count(*) AS n FROM "Patient"
UNION ALL SELECT 'Session',        count(*) FROM "Session"
UNION ALL SELECT 'ExerciseConfig', count(*) FROM "ExerciseConfig"
UNION ALL SELECT 'TrainingPlan',   count(*) FROM "TrainingPlan"
ORDER BY tabela;

-- ⛔ PARAR se qualquer contagem mudou, qualquer FK ou índice sumiu,
--    qualquer default foi alterado, ou alguma CHECK desapareceu.


-- =====================================================================
-- 4. BACKFILL — etapa SEPARADA, transação SEPARADA
-- =====================================================================
-- ⛔ Nunca na mesma transação da seção 2.

-- 4.1 PRÉVIA — quantas linhas serão tocadas. Executar ANTES do UPDATE.
SELECT count(*)                                              AS total_configs,
       count(*) FILTER (WHERE "totalAttempts" > 0)           AS elegiveis,
       count(*) FILTER (WHERE "totalAttempts" = 0)           AS nao_elegiveis,
       count(*) FILTER (WHERE "tutorialCompletedAt" IS NOT NULL) AS ja_preenchidos
FROM "ExerciseConfig";
-- Esperado: total_configs = 82 · ja_preenchidos = 0
-- ANOTAR o valor de `elegiveis`: o UPDATE deve afetar exatamente esse número.

-- 4.2 O UPDATE.
BEGIN;

UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion"     = 1,
    "tutorialSource"      = 'BACKFILL'::"TutorialSource"
WHERE "totalAttempts" > 0
  AND "tutorialCompletedAt" IS NULL;

-- ⚠️ Conferir o número de linhas afetadas ANTES do COMMIT.
--    Se diferir de `elegiveis` da consulta 4.1:  ROLLBACK;  e parar.

COMMIT;

-- 4.3 COMPROVAÇÃO — nada além dos três campos novos mudou.
SELECT count(*)                                                 AS total,
       count(*) FILTER (WHERE "tutorialSource" = 'BACKFILL')    AS marcados,
       count(*) FILTER (WHERE "totalAttempts" = 0
                          AND "tutorialCompletedAt" IS NOT NULL) AS erro_marcou_sem_execucao,
       count(*) FILTER (WHERE "tutorialCompletedAt" IS NOT NULL
                          AND "tutorialCompletedAt" <> COALESCE("lastAttemptAt","createdAt")) AS erro_data_errada
FROM "ExerciseConfig";
-- Esperado: marcados = elegiveis · erro_marcou_sem_execucao = 0 · erro_data_errada = 0

-- 4.4 Contagens e campos clínicos intactos.
SELECT 'ExerciseConfig' AS tabela, count(*) AS n,
       sum("currentDifficulty") AS soma_dificuldade,
       sum("totalAttempts")     AS soma_tentativas,
       max("lastAttemptAt")     AS ultimo_treino
FROM "ExerciseConfig"
UNION ALL
SELECT 'Session', count(*), NULL, NULL, max("completedAt") FROM "Session";
-- Esperado: idêntico ao medido antes do backfill.
-- Referência do backup: ExerciseConfig 82 · Session 33 · último treino 2026-08-03 16:47 UTC

-- 4.5 ROLLBACK SELETIVO do backfill, se necessário.
--     Preserva conclusões reais do paciente (tutorialSource = 'PATIENT').
-- UPDATE "ExerciseConfig"
-- SET "tutorialCompletedAt" = NULL, "tutorialVersion" = NULL, "tutorialSource" = NULL
-- WHERE "tutorialSource" = 'BACKFILL'::"TutorialSource";


-- =====================================================================
-- 5. ORDEM ENTRE BANCO E CÓDIGO — obrigatória
-- =====================================================================
--   1. aplicar e validar as colunas (seções 2 e 3)
--   2. executar e validar o backfill (seção 4)
--   3. só então recolocar no schema.prisma: enum TutorialSource +
--      tutorialCompletedAt + tutorialVersion + tutorialSource
--   4. restaurar a rota de docs/t1-pausada/exercise-tutorial-route.ts.txt
--      para app/api/exercise-tutorial/route.ts
--   5. atualizar lib/schema-banco-alinhado.test.ts (CAMPOS_NO_BANCO + os
--      dois testes que hoje exigem AUSÊNCIA dos campos)
--   6. npx prisma generate
--   7. npx prisma validate
--   8. npx tsc --noEmit
--   9. npx vitest run
--  10. npm run build
--  11. bump de versão + publicar
--  12. smoke test: GET /api/patients/[id]?config=true retorna 200
--
-- ⛔ NUNCA publicar um Prisma Client que espere colunas ainda inexistentes.
--    Foi exatamente isso que derrubou a produção em 05/ago.


-- =====================================================================
-- 6. INTERRUPÇÃO — parar imediatamente se:
-- =====================================================================
--   · o tipo TutorialSource já existir na consulta 1.1
--   · qualquer das três colunas já existir na consulta 1.2
--   · faltar alguma das três CHECK de Session
--   · session_difficulty_range não for 1–13
--   · faltar qualquer FK ou índice da consulta 1.4
--   · qualquer contagem divergir entre 1.5 e 3.7
--   · aparecer erro mencionando tabela diferente de ExerciseConfig
--   · o backfill afetar número diferente de `elegiveis`
--
-- Em qualquer desses casos: ROLLBACK se houver transação aberta, e parar.
-- O backup de 05/ago 16:32 é o ponto de retorno.


-- =====================================================================
-- 7. DÍVIDA DE SCHEMA — registrada, NÃO corrigida agora
-- =====================================================================
-- O `migrate diff` revelou divergências antigas entre banco e schema.prisma,
-- em 6 tabelas além de ExerciseConfig. Vieram de estruturas aplicadas por SQL
-- direto no Supabase (FKs e CHECK de 30/05, ver RUNBOOK SCHEMA-01) enquanto o
-- schema seguiu outro caminho.
--
-- Divergências conhecidas:
--   · FKs LicenseCode_usedByTherapistId_fkey e PasswordResetToken_userId_fkey
--     existem no banco e o Prisma quer recriá-las
--   · índice idx_prt_token existe no banco e não no schema
--   · índice ExerciseConfig_pid_eid_key tem nome diferente do que o Prisma gera
--   · defaults de updatedAt e de TherapeuticSession.id existem no banco
--   · User.crpStatus e User.crpAcceptedTerms são nullable no banco
--   · tipos temporais divergem em LicenseCode, PasswordResetToken,
--     TherapeuticSession e User
--
-- ⛔ NÃO corrigir durante a T1. Cada item precisa de análise própria: alguns
--    são dívida do schema, outros são proteção deliberada aplicada à mão.
--    Fica registrado como auditoria futura, a iniciar só com decisão dela.
