# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 05/08/2026 16:30
Incidente encerrado e validado.

Produção está funcionando na v2.75.1, não houve sessões afetadas e não há reparação de dados a executar.

Pode retomar oficialmente a T1 do framework de tutorial.

Comece pelo T1.0, seguindo o procedimento operacional já aprovado:

1. instalar as ferramentas PostgreSQL necessárias;
2. gerar um pg_dump completo em formato custom;
3. validar a integridade do arquivo;
4. restaurar o backup em ambiente de teste, porque o backfill é alteração de nível 2;
5. conferir as contagens;
6. apresentar as evidências antes de qualquer alteração no banco de produção.

Não executar db push, backfill ou publicação antes de concluir e apresentar a validação do backup.

Depois da minha validação, seguimos para a implantação controlada da fundação da T1.

## 05/08/2026 16:35
Backup validado e aprovado.

Pode seguir para a próxima etapa da T1.0, ainda de forma controlada.

Primeiro execute apenas:

prisma migrate diff --script

Quero ver o SQL exato que será aplicado ao banco antes de qualquer alteração.

O resultado esperado é exclusivamente:

- criação do enum TutorialSource;
- adição de tutorialCompletedAt como coluna opcional;
- adição de tutorialVersion como coluna opcional;
- adição de tutorialSource como coluna opcional.

Pare imediatamente se aparecer qualquer:

- DROP;
- ALTER COLUMN;
- mudança de tipo;
- NOT NULL em coluna existente;
- remoção de constraint;
- alteração em tabela diferente de ExerciseConfig;
- qualquer operação não prevista.

Depois de apresentar o diff, não execute ainda o db push.

Também apresente, antes da aplicação:

1. o SQL exato para reaplicar as três CHECK de Session;
2. confirmação de que difficulty será 1–13;
3. consultas para verificar as constraints antes e depois;
4. ordem exata:
   - aplicar schema;
   - reaplicar CHECK;
   - validar constraints;
   - executar backfill separadamente;
5. plano de interrupção caso alguma etapa falhe.

Não iniciar conversão de exercícios.
Não publicar ainda.
Pare após apresentar o diff e o roteiro final de implantação.

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
