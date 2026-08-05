# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

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

## 04/08/2026 21:57
A política está aprovada.
Peço apenas um refinamento na classificação de risco.
Não classifique genericamente "enum" como alteração de baixo risco.
A classificação deve considerar o impacto real da alteração, e não apenas o tipo do objeto.
Exemplos:
Nível 1 (aditivo)
nova coluna opcional;
novo índice;
nova tabela;
novo enum ainda não utilizado;
nova coluna utilizando um enum recém-criado, sem conversão de dados existentes.
Nível 2 (estrutural ou migração)
alteração de enum existente;
conversão de coluna existente para enum;
alteração de tipo de coluna;
DROP;
ALTER COLUMN;
remoção de colunas;
UPDATE ou DELETE em massa;
qualquer migração de dados existentes.
A regra permanente deve continuar baseada na leitura do SQL gerado (prisma migrate diff --script) e, principalmente, no impacto efetivo da alteração.
O objetivo é evitar que, no futuro, alguém interprete "enum = baixo risco" como uma regra geral quando isso só é verdadeiro para enums novos e sem migração de dados.
Depois desse ajuste, considero a política operacional consolidada.
