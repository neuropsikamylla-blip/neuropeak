# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE NÃO FIZ

- Não commitei nem dei push — a árvore fica com `PROGRESSO.md` modificado, pronto para o VP commitar.
- Não toquei em nenhum outro arquivo (nem `CLAUDE.md`, nem `ESTADO-DO-PROJETO.md`, nem docs).
- Não executei `db push`, SQL, backfill, publicação, `prisma`, `tsc`, `vitest` nem `build` — nada que toque banco ou produção.
- Não alterei o conteúdo dos blocos já existentes do PROGRESSO.md.</result>
<usage><subagent_tokens>28362</subagent_tokens><tool_uses>5</tool_uses><duration_ms>92307</duration_ms></usage>
</task-notification>

## 04/08/2026 21:40
Antes de qualquer prisma db push, vamos criar um procedimento formal de backup do banco.
Confirmamos que o projeto está no Supabase Free, sem backups automáticos nem Point-in-Time Recovery (PITR). Portanto, não podemos presumir que exista uma forma de restauração caso algo dê errado.
Quero que você prepare o procedimento operacional completo, sem executar nada.
Analise e informe:
Qual é a forma mais segura de gerar um backup lógico completo deste banco PostgreSQL (preferencialmente pg_dump ou método oficial do Supabase).
Quais credenciais serão necessárias.
Como localizar essas credenciais dentro do Supabase.
O comando completo para gerar o backup.
Como validar que o backup foi criado corretamente.
Como restaurar integralmente esse backup, caso seja necessário.
Quais limitações esse tipo de backup possui em relação aos backups automáticos do plano Pro.
Se existe algum risco específico por utilizarmos prisma db push em vez de migrations.
Se esse procedimento passa a ser obrigatório antes de qualquer alteração futura de schema.
Não execute nenhum comando.
Não acesse o banco.
Não faça db push.
Apenas produza o documento operacional para validação.

## 04/08/2026 21:45
A análise está aprovada.
Antes de registrar essa política como regra permanente, faça dois ajustes.
1. Justificativa da ferramenta
Não afirme que o pg_dump é superior à Supabase CLI.
A recomendação deve ser baseada em critérios arquitetônicos.
Adote como justificativa:
pg_dump é a ferramenta oficial do PostgreSQL;
independe do fornecedor;
é amplamente documentada;
funciona mesmo que o banco deixe de estar hospedado no Supabase;
fornece um procedimento estável e de longo prazo para o projeto.
Evite desqualificar a Supabase CLI. Apenas explique por que pg_dump será o padrão adotado.
2. Política permanente de backup
Não exigir restauração completa de teste para absolutamente toda alteração de schema.
Diferencie dois cenários.
Alterações aditivas de baixo risco, por exemplo:
novas colunas opcionais;
novos índices;
novos enums;
novas tabelas sem migração de dados.
Nesses casos, exigir obrigatoriamente:
backup lógico imediatamente anterior;
validação da integridade do arquivo gerado.
Alterações destrutivas ou migrações de dados, por exemplo:
DROP;
ALTER COLUMN;
remoção de colunas;
conversão de tipos;
updates em massa;
migração de dados existentes.
Nesses casos, manter obrigatória:
geração do backup;
restauração de teste do backup antes da alteração em produção.
Atualize o procedimento operacional, o RUNBOOK e o CLAUDE.md com essa distinção.
Não executar nenhuma alteração no banco ainda.
