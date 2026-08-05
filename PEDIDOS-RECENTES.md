# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

- `wc -l PROGRESSO.md` (antes) → **1428 linhas**; `git log --oneline -3` → exit 0, confirmou os três hashes do despacho no topo: `dba3321`, `04e0f24`, `4999292`.
- `ls` dos artefatos citados → exit 0: existem `app/api/exercise-tutorial/route.ts`, `components/exercises/PreparationScreen.tsx`, `docs/scripts/backfill-tutorial.sql`, `docs/exercicios/{01,02,03}*.md`, `docs/operacao/T1-plano-implantacao.md` e `lib/tutorial/{types.ts,state.ts,versions.ts}` (+ três arquivos de teste: `contracts.test.ts`, `state.test.ts`, `versions.test.ts`).
- `git status --porcelain` → exit 0, saída única `M PROGRESSO.md`. `git diff --stat` → `1 file changed, 88 insertions(+)`, **zero deleções**.
- Posição do bloco: a edição ancorou no título `## ⏱️ DURAÇÃO CONTÍNUA...` (antiga linha 6), o que garante inserção antes de todos os blocos existentes.

**Não reverifiquei os fatos técnicos do despacho** (contagem 471/471, ausência de `onComplete`, os quatro guardas estáticos, o teto 1-13). Foram transcritos como reportados pelo VP; o status de verificação independente deles é **DESCONHECIDO** neste despacho.

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
