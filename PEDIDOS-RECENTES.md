# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:41
Autorizo executar somente a transação da seção 2.

Escopo autorizado:

BEGIN;

CREATE TYPE "TutorialSource" AS ENUM ('BACKFILL', 'PATIENT');

ALTER TABLE "ExerciseConfig"
  ADD COLUMN "tutorialCompletedAt" TIMESTAMP(3),
  ADD COLUMN "tutorialVersion" INTEGER,
  ADD COLUMN "tutorialSource" "TutorialSource";

COMMIT;

Regras:

- não executar db push;
- não executar backfill ainda;
- não alterar nenhuma outra tabela;
- não alterar constraints, índices, defaults ou FKs;
- não publicar código ainda;
- se qualquer comando falhar, executar ROLLBACK e parar;
- se aparecer qualquer efeito fora de ExerciseConfig, parar imediatamente.

Após a transação, executar apenas as verificações pós-schema previstas:

1. confirmar que o enum existe com apenas BACKFILL e PATIENT;
2. confirmar que as três colunas existem e são opcionais;
3. confirmar que nenhuma outra coluna de ExerciseConfig foi alterada;
4. confirmar que as três CHECK de Session continuam intactas;
5. confirmar difficulty entre 1 e 13;
6. confirmar que FKs, índices e defaults verificados anteriormente continuam presentes;
7. confirmar que as contagens das tabelas não mudaram.

Depois pare e apresente as evidências.

Não executar o backfill até nova autorização explícita.

## 05/08/2026 16:47
Autorizo executar apenas a prévia do backfill da seção 4.

Nesta etapa, executar somente consultas SELECT para informar:

1. quantidade total de ExerciseConfig;
2. quantidade com totalAttempts > 0;
3. quantidade com totalAttempts = 0;
4. quantidade elegível para o backfill:
   - totalAttempts > 0;
   - tutorialCompletedAt IS NULL;
5. quantidade já preenchida nos novos campos;
6. distribuição dos elegíveis por:
   - tutorialCompletedAt que viria de lastAttemptAt;
   - tutorialCompletedAt que precisaria usar createdAt;
7. quantidade de registros que receberiam:
   - tutorialVersion = 1;
   - tutorialSource = BACKFILL;
8. confirmação de que nenhum registro com totalAttempts = 0 seria atingido.

Apresente também uma amostra técnica das linhas elegíveis, sem nomes ou dados pessoais, contendo apenas:

- id técnico;
- patientId;
- exerciseId;
- totalAttempts;
- lastAttemptAt;
- createdAt;
- tutorialCompletedAt proposto;
- tutorialVersion proposto;
- tutorialSource proposto.

Não executar ainda:

- UPDATE;
- backfill;
- alteração no schema.prisma;
- prisma generate;
- restauração da rota;
- publicação.

Depois apresente:

- o número exato de linhas que seriam alteradas;
- o SQL final do backfill;
- as consultas de verificação pós-backfill;
- a estratégia de rollback seletivo usando tutorialSource = BACKFILL.

Pare para minha autorização antes de qualquer escrita.

## 05/08/2026 17:08
Autorizo executar o backfill, mas somente com o SQL completo e com validação dentro da mesma transação.

O filtro deve ser restritivo:

- totalAttempts > 0;
- tutorialCompletedAt IS NULL;
- tutorialVersion IS NULL;
- tutorialSource IS NULL.

Execute em uma sessão transacional controlada:

BEGIN;

WITH atualizados AS (
  UPDATE "ExerciseConfig"
  SET
    "tutorialCompletedAt" = COALESCE("lastAttemptAt", "createdAt"),
    "tutorialVersion" = 1,
    "tutorialSource" = 'BACKFILL'::"TutorialSource"
  WHERE "totalAttempts" > 0
    AND "tutorialCompletedAt" IS NULL
    AND "tutorialVersion" IS NULL
    AND "tutorialSource" IS NULL
  RETURNING
    id,
    "patientId",
    "exerciseId",
    "totalAttempts",
    "currentDifficulty",
    "lastAttemptAt",
    "tutorialCompletedAt",
    "tutorialVersion",
    "tutorialSource"
)
SELECT count(*) AS linhas_alteradas
FROM atualizados;

O resultado obrigatório é:

linhas_alteradas = 16

Antes do COMMIT, ainda dentro da mesma transação, executar as verificações:

1. marcados com tutorialSource = BACKFILL: 16;
2. registros com totalAttempts = 0 e tutorialCompletedAt preenchido: 0;
3. datas diferentes de COALESCE(lastAttemptAt, createdAt): 0;
4. BACKFILL com tutorialVersion diferente de 1: 0;
5. contagem de Session: 33;
6. soma de currentDifficulty idêntica à prévia;
7. soma de totalAttempts idêntica à prévia;
8. max(lastAttemptAt) idêntico à prévia;
9. nenhuma linha com tutorialSource = PATIENT;
10. nenhuma tabela além de ExerciseConfig alterada.

Se o número de linhas não for exatamente 16 ou qualquer verificação divergir:

ROLLBACK;

e parar.

Somente se todas as verificações estiverem conformes:

COMMIT;

Depois do COMMIT, repetir as verificações em uma nova consulta e apresentar as evidências.

Não alterar ainda:

- schema.prisma;
- Prisma Client;
- rota de tutorial;
- código de produção;
- publicação.

Pare após validar o backfill.
