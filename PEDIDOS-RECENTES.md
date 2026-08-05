# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:37
Sim. Prepare o roteiro completo usando SQL manual e não use prisma db push.

A decisão é:

- não corrigir agora todas as divergências antigas entre o banco e o schema.prisma;
- não tocar em nenhuma tabela além de ExerciseConfig;
- não remover, alterar ou recriar FKs, índices, defaults ou constraints existentes;
- aplicar apenas a estrutura necessária para a T1.

O SQL pretendido é exclusivamente:

CREATE TYPE "TutorialSource" AS ENUM ('BACKFILL', 'PATIENT');

ALTER TABLE "ExerciseConfig"
  ADD COLUMN "tutorialCompletedAt" TIMESTAMP(3),
  ADD COLUMN "tutorialVersion" INTEGER,
  ADD COLUMN "tutorialSource" "TutorialSource";

Não executar ainda.

Antes, apresente o roteiro final contendo:

1. CONSULTAS PRÉVIAS

Confirmar que:

- o tipo TutorialSource ainda não existe;
- as três colunas ainda não existem;
- as três CHECK de Session continuam presentes;
- a CHECK de difficulty aceita valores entre 1 e 13;
- as FKs e índices identificados no diff continuam existentes;
- as contagens das tabelas relevantes continuam iguais às do backup validado.

2. TRANSAÇÃO DE SCHEMA

Preparar o SQL dentro de uma transação explícita:

BEGIN;

CREATE TYPE ...

ALTER TABLE ...

COMMIT;

Se qualquer comando falhar, executar ROLLBACK e parar.

Não usar db push.

Não executar outras alterações de schema na mesma transação.

3. VERIFICAÇÃO APÓS O SCHEMA

Confirmar:

- enum criado com apenas BACKFILL e PATIENT;
- três colunas criadas como opcionais;
- nenhuma outra coluna alterada;
- nenhuma FK removida;
- nenhum índice removido;
- nenhum default alterado;
- as três CHECK de Session continuam presentes;
- difficulty continua 1–13;
- contagens de Patient, Session, ExerciseConfig e TrainingPlan permanecem iguais.

Como o SQL manual não toca Session, não reaplicar as CHECK automaticamente. Apenas verificar que continuam intactas.

4. BACKFILL SEPARADO

O backfill deve ocorrer em outra etapa e outra transação, nunca junto da criação das colunas.

Antes de executá-lo, apresentar:

- quantidade exata de linhas elegíveis;
- quantidade com totalAttempts > 0;
- quantidade com totalAttempts = 0;
- quantidade já preenchida;
- SQL exato;
- resultado esperado.

O backfill deve gravar:

- tutorialCompletedAt = COALESCE(lastAttemptAt, createdAt);
- tutorialVersion = 1;
- tutorialSource = BACKFILL;

Somente quando:

- totalAttempts > 0;
- tutorialCompletedAt IS NULL.

Após executar, comprovar:

- totalAttempts = 0 permaneceu intacto;
- currentDifficulty não mudou;
- lastAttemptAt não mudou;
- totalAttempts não mudou;
- Sessions não mudaram;
- apenas os três campos novos foram preenchidos.

5. ORDEM ENTRE BANCO E CÓDIGO

A ordem obrigatória será:

1. aplicar e validar as colunas no banco;
2. executar e validar o backfill;
3. somente depois recolocar no schema.prisma:
   - TutorialSource;
   - tutorialCompletedAt;
   - tutorialVersion;
   - tutorialSource;
4. restaurar a rota de tutorial;
5. rodar prisma generate;
6. rodar prisma validate;
7. rodar TypeScript;
8. rodar a suíte completa;
9. rodar build;
10. publicar;
11. realizar smoke test.

Nunca publicar novamente um Prisma Client que espere colunas ainda inexistentes no banco.

6. INTERRUPÇÃO

Parar imediatamente se:

- o tipo ou alguma coluna já existir de forma inesperada;
- alguma constraint estiver ausente antes da alteração;
- qualquer contagem mudar depois da criação das colunas;
- aparecer erro fora de ExerciseConfig;
- qualquer SQL tentar alterar outra tabela;
- o backfill atingir quantidade diferente da prevista.

7. DÍVIDA DE SCHEMA

Registrar separadamente que existem divergências antigas entre banco e schema.prisma.

Não corrigir essas divergências durante a T1.

Criar apenas um registro futuro de auditoria de schema, sem iniciar agora.

Depois de apresentar todo o roteiro e os SQLs exatos, pare. Não execute nada até minha autorização explícita.

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
