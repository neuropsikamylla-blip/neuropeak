# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:39
Autorizo executar somente as consultas prévias da seção 1.

Todas devem ser estritamente SELECT.

Não executar ainda:

- CREATE TYPE;
- ALTER TABLE;
- UPDATE;
- BEGIN/COMMIT relacionados à alteração;
- backfill;
- alteração no schema.prisma;
- publicação.

Antes da execução, faça dois ajustes no critério operacional:

1. As contagens atuais não precisam obrigatoriamente ser idênticas às contagens do backup de 16:32.

O backup representa o estado do banco naquele horário. Caso tenha ocorrido uso legítimo depois disso, as contagens podem ter aumentado.

Portanto:

- apresente as contagens do backup;
- apresente as contagens atuais;
- explique qualquer diferença;
- trate apenas redução inesperada ou inconsistência estrutural como sinal de parada.

2. O backup de 16:32 não deve ser descrito como ponto de retorno sem ressalva.

Uma restauração integral desse arquivo apagaria qualquer dado criado depois das 16:32.

Antes da alteração efetiva do schema, confirme se houve novas gravações desde o backup.

Se houve, gere e valide um novo pg_dump imediatamente anterior à alteração.

Agora execute somente as consultas prévias e apresente:

- existência do enum;
- existência das três colunas;
- CHECKs atuais de Session;
- limite de difficulty;
- FKs;
- índices;
- defaults relevantes;
- contagens atuais;
- timestamp da Session mais recente;
- timestamp da alteração mais recente em TrainingPlan e ExerciseConfig, quando disponível.

Depois pare para minha validação.

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
