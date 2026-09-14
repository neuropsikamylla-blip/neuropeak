# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

**1. `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — bloco da linha 63 reescrito: `+122 / −35` linhas (bloco antigo de 86 linhas → novo de 173).
- Título: `## 🚧 EM ANDAMENTO` → `## ✅ ENTREGUE — Ordem da História: a revisão completa (14/set/2026)`.
- A1-A4 e B1-B6 marcados `[x]`, com o critério de pronto preservado e a evidência acrescentada em cada um (inclusive as injeções por passo). O "Passo final — verificação dela em produção" ficou `[ ]`, porque é dela. B3/B4/B5 marcados como provados no código, com a verificação visual dela sinalizada como pendente; B6 marcado com a limitação declarada (localStorage = por aparelho).
- Seção "Onde está agora" substituída por "### A entrega": tabela dos 7 commits (com o push `59ec98d9..8c572ed2`), versões 3.27.0 e 3.28.0, tabela de provas (tsc 0; test 92/1171 contra baselines 87/1110 e 90/1143; build 0; lint 0 errors; 61/61 em `lib/ordem-historia`), as 9 injeções, a nota das duas provas do VP corrigidas e não afrouxadas, e os 4 consertos do VP.
- Seção nova "### 🔴 O QUE FALTA — e é dela" com os 4 itens pedidos (verificação visual com a lista do que conferir; classificação clínica das 86 histórias; decisão sobre o T1; `d6`/`x4` do bolo + as 6 famílias repetidas).
- Seção de roteamento mantida, agora com os dois labs e os vereditos (A: 0 consertos; B: 4 consertos do VP).
- Backup: `/Users/kamyllahonorio/neuropeak/PROGRESSO.md.bak-20260914` (coberto por `*.bak-*` no `.gitignore`, linha 62 — não entra em commit).

**2. `/Users/kamyllahonorio/codex-lab/registro-roteamento.md`** — 30 → 31 linhas: linha 26 teve o `(em voo)` substituído pelo veredito ACEITO SEM CONSERTO da Fatia A, e foi inserida a linha 27 com a Fatia B (ACEITO com 4 consertos do VP). Backup: `registro-roteamento.md.bak-20260914`. Esse diretório **não é repositório git**.

## COMO PROVEI

**Tarefa 1 — deploy.** `https://neuropeak.vercel.app/api/version` respondeu **HTTP 404** (`The page could not be found / NOT_FOUND / gru1::qdxm8-...`): não é o domínio do projeto. O domínio real, achado por `grep` no PROGRESSO.md e no ESTADO-DO-PROJETO.md, é **`neuropeak-5jyl.vercel.app`**. Saídas literais de `curl -s https://neuropeak-5jyl.vercel.app/api/version`:

- tentativa 1 — 10:53:12 — `{"version":"3.26.5-dpl_5Bcmamf3GHgp5JBesKKWTGdhQN9c","appVersion":"3.26.5","buildId":"dpl_5Bcmamf3GHgp5JBesKKWTGdhQN9c"}` `[HTTP 200]` exit 0 — **ainda a versão velha**
- tentativa 2 — 10:54:09 — `{"version":"3.28.0-dpl_Az83xaTeY7VyX2kQz7RFiYGtzD4g","appVersion":"3.28.0","buildId":"dpl_Az83xaTeY7VyX2kQz7RFiYGtzD4g"}` `[HTTP 200]` exit 0
- tentativa 3 — 10:54:50 — idêntica à 2
- confirmação manual — 10:54:52 — idêntica à 2

**Conclusão medida: produção está em 3.28.0**, deploy `dpl_Az83xaTeY7VyX2kQz7RFiYGtzD4g`. As tentativas 4-6 foram canceladas por já haver resultado positivo repetido.

**Estado do repositório**, `git status --short`:
```
 M PROGRESSO.md
```
`git diff --stat`:
```
 PROGRESSO.md | 157 ++++++++++++++++++++++++++++++++++++++++++++++-------------
 1 file changed, 122 insertions(+), 35 deletions(-)
```
Integridade da tabela do registro de roteamento conferida por contagem de separadores: linhas 29, 30 e 31 com 8 pipes cada (7 colunas), sem coluna a mais nem a menos. Existência das saídas conferida: `saida-ordem-hist-a-20260914.txt` (435.673 bytes) e `saida-ordem-hist-b-20260914.txt` (852.827 bytes); nenhum diretório `lab-ordem-hist-*` restante.

## O QUE NÃO FIZ

- Não commitei e não dei push — o commit é do VP. O `git status` acima é o estado que ele vai encontrar.
- Não toquei em código: nenhum arquivo fora de `PROGRESSO.md` e `registro-roteamento.md` foi alterado.
- Não reconferi nada do contexto que o VP já verificou (testes, tsc, build, lint, injeções, diffs) — escrevi esses números **como reportados por ele**, não como medição minha. A única coisa que medi eu mesmo foi a versão em produção.
- Não atualizei o cabeçalho do bloco de 12-13/set (`plataforma em 3.26.5 no ar`), que agora está defasado em relação à produção — está fora do escopo do despacho, mas fica registrado como inconsistência viva no arquivo.
- Não apaguei os dois `.bak-20260914`; ficam ao lado dos originais.</result>
<usage><subagent_tokens>61618</subagent_tokens><tool_uses>17</tool_uses><duration_ms>222703</duration_ms></usage>
</task-notification>
