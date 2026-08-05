-- =====================================================================
-- Incidente de 05/ago/2026 — CONSULTAS DE DIAGNÓSTICO
-- =====================================================================
--
-- SOMENTE LEITURA. Nenhum UPDATE, INSERT, DELETE, ALTER, CREATE ou DROP.
-- Executar no SQL Editor do Supabase.
--
-- Janela do incidente (v2.73.0 → v2.75.1):
--   Brasília (-03):  04/08/2026 23:46  →  05/08/2026 15:51
--   UTC (no banco):  05/08/2026 02:46  →  05/08/2026 18:51
--
-- O Prisma mapeia DateTime para timestamp(3) SEM fuso e grava em UTC,
-- por isso as consultas usam os valores em UTC.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Volume: quantas sessões, quantos pacientes, quantos exercícios
-- ---------------------------------------------------------------------
SELECT count(*)                     AS sessoes_na_janela,
       count(DISTINCT "patientId")  AS pacientes_afetados,
       count(DISTINCT "exerciseId") AS exercicios_afetados,
       min("completedAt")           AS primeira,
       max("completedAt")           AS ultima
FROM "Session"
WHERE "completedAt" >= TIMESTAMP '2026-08-05 02:46:00'
  AND "completedAt" <  TIMESTAMP '2026-08-05 18:51:00';


-- ---------------------------------------------------------------------
-- 2. Estado atual do ExerciseConfig × valores candidatos à reparação
--
--    attempts_atual  = valor real do banco (NULL quando a config não existe)
--    attempts_base   = o mesmo, com NULL tratado como 0, para leitura
--    attempts_proposto = base + sessões da janela
--
--    COALESCE é indispensável: sem ele, NULL + count(*) devolveria NULL
--    justamente nas linhas sem config — as que mais precisam de reparo.
-- ---------------------------------------------------------------------
SELECT s."patientId",
       s."exerciseId",
       count(*)                                        AS sessoes_na_janela,
       c."totalAttempts"                               AS attempts_atual,
       COALESCE(c."totalAttempts", 0)                  AS attempts_base,
       COALESCE(c."totalAttempts", 0) + count(*)       AS attempts_proposto,
       c."lastAttemptAt"                               AS ultimo_atual,
       max(s."completedAt")                            AS ultimo_proposto,
       c."currentDifficulty"                           AS dificuldade_atual,
       (c.id IS NULL)                                  AS config_ausente
FROM "Session" s
LEFT JOIN "ExerciseConfig" c
       ON c."patientId"  = s."patientId"
      AND c."exerciseId" = s."exerciseId"
WHERE s."completedAt" >= TIMESTAMP '2026-08-05 02:46:00'
  AND s."completedAt" <  TIMESTAMP '2026-08-05 18:51:00'
GROUP BY s."patientId", s."exerciseId",
         c.id, c."totalAttempts", c."lastAttemptAt", c."currentDifficulty"
ORDER BY s."patientId", s."exerciseId";


-- ---------------------------------------------------------------------
-- 3. Nível recuperável do metadata, na última sessão de cada par
--
--    meta.endedLevel recebe o nextLevel da progressão nos quatro caminhos
--    que gravam metadata (sessions/route.ts: 90, 111, 139, 153) — é o mesmo
--    valor que teria ido para currentDifficulty. Onde existe, a reconstrução
--    é exata. Onde não existe (caminho legado), não há reconstrução.
--
--    A extração usa expressão regular em vez de metadata::jsonb: um único
--    registro com JSON malformado derrubaria a consulta inteira com o cast.
-- ---------------------------------------------------------------------
WITH ranqueada AS (
  SELECT "patientId",
         "exerciseId",
         "completedAt",
         metadata,
         ROW_NUMBER() OVER (
           PARTITION BY "patientId", "exerciseId"
           ORDER BY "completedAt" DESC
         ) AS posicao
  FROM "Session"
  WHERE "completedAt" >= TIMESTAMP '2026-08-05 02:46:00'
    AND "completedAt" <  TIMESTAMP '2026-08-05 18:51:00'
)
SELECT "patientId",
       "exerciseId",
       "completedAt"                                          AS ultima_sessao,
       substring(metadata from '"endedLevel"\s*:\s*([0-9]+)') AS nivel_recuperavel,
       CASE WHEN metadata ~ '"endedLevel"\s*:\s*[0-9]+'
            THEN 'reconstrucao exata'
            ELSE 'nao reconstruir automaticamente'
       END                                                    AS veredito
FROM ranqueada
WHERE posicao = 1
ORDER BY "exerciseId", "patientId";
