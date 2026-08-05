# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 04/08/2026 21:26
<task-notification>
<task-id>bf148lt2j</task-id>
<tool-use-id>toolu_01P6vWLJVjMkFRdvBPTG1bMv</tool-use-id>
<output-file>/private/tmp/claude-501/-Users-kamyllahonorio-neuropeak/3e6ecf11-e4e5-471f-bbf9-4595faa53598/tasks/bf148lt2j.output</output-file>
<status>completed</status>
<summary>Background command "Disparar a Fase T1 isolado" completed (exit code 0)</summary>
</task-notification>

## 04/08/2026 21:33
A Fase T1 está tecnicamente aprovada.

Decisão sobre tutorialSource:

Manter o enum Prisma:

- BACKFILL
- PATIENT

Não substituir por String ou union apenas no TypeScript.

Neste caso, a integridade no banco é importante porque tutorialSource será utilizada para distinguir dados inferidos pelo backfill de conclusões reais do paciente e poderá controlar um rollback seletivo.

O possível tipo PostgreSQL órfão em uma futura remoção é um custo técnico aceitável e não deve ser tratado como motivo para perder essa garantia.

Não reabrir essa modelagem.

Agora não publique e não aplique nada ao banco ainda.

Prepare apenas a etapa controlada de implantação da T1, sem executá-la, contendo:

1. verificação concreta do mecanismo de backup disponível;
2. evidência do último backup recuperável;
3. plano de exportação lógica adicional, caso necessário;
4. comandos exatos para aplicar os três campos opcionais e o enum;
5. comandos exatos para reaplicar as três CHECK de Session;
6. consultas para verificar todas as constraints antes e depois;
7. contagens prévias do backfill:
   - total de ExerciseConfig;
   - totalAttempts > 0;
   - totalAttempts = 0;
   - já preenchidos;
8. SQL exato do backfill;
9. SQL seletivo de rollback somente para tutorialSource = BACKFILL;
10. consultas que comprovem que não mudaram:
    - currentDifficulty;
    - lastAttemptAt;
    - totalAttempts;
    - sessões;
11. smoke test da leitura dos novos campos;
12. smoke test da rota sem alteração de dados clínicos;
13. ordem exata de publicação do código em relação à alteração do banco;
14. estratégia caso uma etapa falhe no meio.

Não executar db push.
Não executar SQL.
Não publicar.
Não converter os pilotos.

Pare após apresentar o plano operacional completo.

## 04/08/2026 21:37
O plano operacional está aprovado, mas não execute ainda nenhuma alteração.

Primeiro precisamos confirmar o backup do banco.

Vou verificar no painel do Supabase:

- plano atual do projeto;
- existência de backups automáticos;
- data e horário do último backup;
- disponibilidade de restauração;
- existência de PITR.

Até eu trazer essas informações:

- não execute db push;
- não execute SQL;
- não publique;
- não faça backfill;
- não converta os pilotos.

Também mantenha como referência correta:

- CHECK de difficulty entre 1 e 13;
- banco antes do código;
- reaplicação imediata das três CHECK após o db push;
- parada obrigatória se o prisma migrate diff mostrar qualquer DROP ou ALTER COLUMN inesperado.

Quando eu enviar a evidência do backup, seguimos o roteiro passo a passo, com validação entre cada etapa.
