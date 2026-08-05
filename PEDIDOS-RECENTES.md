# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 21:14
Não execute ainda o db push nem o backfill no banco de produção.

Implemente a Fase T1 com:

- alteração do schema;
- rota específica;
- contratos e lógica pura;
- catálogo de versões;
- PreparationScreen;
- SQL de backfill documentado;
- testes.

Nesta etapa, execute apenas verificações que não alterem produção:

- prisma validate;
- prisma generate;
- TypeScript;
- suíte completa;
- build;
- testes unitários da lógica de backfill com dados simulados;
- revisão do diff.

Não aplique schema no banco.
Não execute SQL no banco.
Não publique.

Quero primeiro validar todo o código da T1.

Depois criaremos uma etapa separada e controlada para aplicação em produção, com:

1. backup confirmado;
2. verificação do estado atual do banco;
3. aplicação apenas dos dois campos opcionais;
4. reaplicação das três CHECK de Session;
5. conferência das constraints;
6. execução separada do backfill;
7. contagem antes e depois;
8. prova de que totalAttempts = 0 ficou intacto;
9. prova de que lastAttemptAt, currentDifficulty, totalAttempts e sessões não mudaram;
10. smoke test da leitura e da rota.

Também revise a estratégia de rollback.

Não considerar como rollback seguro simplesmente remover as colunas via db push.

O SQL:

UPDATE "ExerciseConfig"
SET "tutorialCompletedAt" = NULL,
    "tutorialVersion" = NULL
WHERE "tutorialCompletedAt" IS NOT NULL;

não é aceitável como rollback genérico depois que o sistema estiver em uso, porque apagaria também conclusões reais de tutorial feitas após a implantação.

Proponha uma estratégia segura para distinguir:

- registros preenchidos pelo backfill;
- registros concluídos realmente pelo paciente após a publicação.

Pode prosseguir agora somente com a implementação da T1 sem tocar no banco de produção.

## 04/08/2026 21:16
<task-notification>
<task-id>bffbdxmrc</task-id>
<tool-use-id>toolu_01LpbwQikac8rCs2pTYFLFMS</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bffbdxmrc.output</output-file>
<status>completed</status>
<summary>Background command "Vigiar o disparo" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 21:24
Pode concluir a implementação da T1 sem tocar no banco de produção.

Apenas corrija a modelagem de tutorialSource antes da entrega:

- não utilizar String livre;
- criar enum explícito, por exemplo:
  BACKFILL
  PATIENT;
- tutorialSource permanece opcional;
- o backfill grava BACKFILL;
- a conclusão real pela rota grava PATIENT;
- se um registro originalmente preenchido pelo backfill for posteriormente concluído pelo paciente, a origem deve mudar para PATIENT.

O rollback do backfill só poderá limpar registros cuja origem ainda seja BACKFILL.

Sobre o backup do Supabase: não presuma que existe. Na futura etapa de produção, primeiro verifique e apresente evidência concreta de:

- qual mecanismo de backup está disponível;
- quando foi gerado o último backup;
- se ele inclui o banco relevante;
- como seria feita a restauração;
- se há necessidade de exportação lógica adicional antes do db push.

Não executar nenhuma ação no banco agora.

Conclua a T1 com prisma validate, prisma generate, TypeScript, suíte completa, build e revisão do diff. Depois pare para minha validação.
