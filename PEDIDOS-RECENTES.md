# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

**1. `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — 66 linhas acrescentadas, 0 removidas.

Não existia bloco "EM ANDAMENTO" da T1.0 no arquivo (verificado por `grep -n "EM ANDAMENTO\|T1\.0"`): os três blocos "EM ANDAMENTO" presentes são históricos de outras entregas, e o único registro da T1.0 era o parágrafo "TUDO PARADO, aguardando evidência de backup" (linhas 178-188), que descrevia o estado anterior. Registrei então uma seção nova no topo, na posição cronológica que o arquivo usa (mais recente primeiro), imediatamente antes da seção do incidente de 05/ago, no mesmo estilo (`## EMOJI TÍTULO (data)` + subseções `###` + negrito denso + datas absolutas):

`## 🗄️ T1.0 — BANCO ALTERADO E BACKFILL CONCLUÍDO (05/ago/2026) — CÓDIGO AINDA NÃO`, com:
- as **duas transações** (seção 2 do roteiro: enum `TutorialSource` BACKFILL(1)/PATIENT(2) + três colunas nuláveis sem default; e o backfill com o filtro dos quatro critérios), contexto de backup validado e o registro de que **não houve `db push`**;
- o **resultado sintetizado**: 16 de 82 linhas, 66 intocadas com `totalAttempts = 0`, distribuição 12/4, todas as datas de `lastAttemptAt`, menor `totalAttempts` = 1; **12/12 verificações conformes repetidas em nova conexão**, com os invariantes clínicos citados em linha corrida (33 Session, soma 117, soma 34, `max(lastAttemptAt)` 03/08/2026 16:47:52.308, 82 ExerciseConfig) e as demais tabelas 4/1/5/8/25/1 — a tabela original **não** foi copiada;
- a **lição de método** com as duas tentativas abortadas (dobra de expressão constante no planner; `CREATE TEMP TABLE ... ON COMMIT DROP` fora do `BEGIN`), ambas com ROLLBACK e zero dado alterado, fechando com a regra: trava dentro de transação nunca pode ser expressão constante;
- o **estado atual** explícito: banco tem enum e campos, `schema.prisma` **não** tem e segue na forma travada por `lib/schema-banco-alinhado.test.ts` (hotfix de 05/ago) — assimetria deliberada e oposta à que causou o incidente; nada publicado;
- o **próximo passo NÃO autorizado por ela**, em 5 itens numerados: schema → rota preservada em `docs/t1-pausada/exercise-tutorial-route.ts.txt` → `CAMPOS_NO_BANCO` no teste → `prisma generate` / `prisma validate` / `npx tsc --noEmit` / `npm run test` / `npm run build` → publicar e smoke test.

**2. `/Users/kamyllahonorio/neuropeak/docs/operacao/T1.0-backfill-executado-2026-08-05.sql`** — 62 linhas de comentário acrescentadas no topo, 0 removidas, 0 alteradas.

Cabeçalho em comentários SQL, antes do `\set ON_ERROR_STOP on`, com os blocos: aviso de que é registro histórico e não deve ser reexecutado (o filtro é idempotente e devolveria 0, abortando na primeira trava); O QUE FEZ (finalidade clínica, filtro dos quatro critérios, valores gravados); QUANDO/ONDE (05/ago/2026, produção Supabase, conexão direta 5432, backup validado, precedido da transação de schema do roteiro); RESULTADO (16 de 82, 12/12 conformes em nova conexão); POR QUE AS TRAVAS SÃO `1/(CASE ...)` (divergência ⇒ divisão por zero ⇒ ROLLBACK automático, sem depender de alguém ler a saída; e a explicação de por que a forma constante `ELSE (1/0)` não funciona); POR QUE OS LITERAIS (117, 34, 33, 82 e as contagens das demais tabelas são a fotografia medida imediatamente antes — comparar o banco com ele mesmo dentro da transação não provaria nada; e a tabela temporária que guardava essa fotografia não sobrevivia à transação).

## COMO PROVEI

- Integridade do SQL executável: `diff &lt;(git show HEAD:docs/operacao/T1.0-backfill-executado-2026-08-05.sql) &lt;(tail -n +63 docs/operacao/T1.0-backfill-executado-2026-08-05.sql)` → **exit 0**, byte a byte idêntico da linha 63 em diante.
- `git diff --numstat` → `66 0 PROGRESSO.md` e `62 0 docs/operacao/T1.0-backfill-executado-2026-08-05.sql` — **zero deleções nos dois arquivos**.
- `git status --short` → apenas esses dois arquivos modificados. (Os `PEDIDOS-*.md` que apareciam sujos no início já haviam sido recolhidos pelo checkpoint automático `3bc14ba`; o arquivo SQL, que estava `??` no snapshot inicial, já está versionado em HEAD.)

## O QUE NÃO FIZ

- **Não commitei e não dei push** — commit é do VP.
- **Não executei nada no banco**, nem consulta de leitura; todos os números do relatório vieram do despacho.
- **Não alterei o SQL em si**, nem espaçamento — só acrescentei comentários no topo.
- **Não toquei** em `prisma/schema.prisma`, `lib/schema-banco-alinhado.test.ts`, `docs/t1-pausada/` nem em qualquer outro arquivo.
- **Não rodei** `npm run test`, `tsc` ou `build`: a mudança é exclusivamente de documentação e não afeta código; portanto o status desses gates permanece o da última medição registrada, não uma verificação minha desta sessão.
- Não editei o parágrafo antigo "TUDO PARADO, aguardando evidência de backup" (linhas 178-188) — é registro histórico do estado de 04/ago e a seção nova o supera explicitamente. Se o VP preferir uma nota de superação ali, é um ajuste de uma linha.</result>
<usage><subagent_tokens>46806</subagent_tokens><tool_uses>13</tool_uses><duration_ms>154064</duration_ms></usage>
</task-notification>
