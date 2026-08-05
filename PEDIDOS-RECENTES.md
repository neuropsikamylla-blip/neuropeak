# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 04/08/2026 21:26
<task-notification>
<task-id>bf148lt2j</task-id>
<tool-use-id>toolu_01P6vWLJVjMkFRdvBPTG1bMv</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bf148lt2j.output</output-file>
<status>completed</status>
<summary>Background command "Disparar a Fase T1 isolado" completed (exit code 0)</summary>
</task-notification>
