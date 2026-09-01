# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## COMO PROVEI

Conferência dos fatos, antes de escrever:

```
git log --oneline -1  →  45e91f5 Painel de tentativas: o abandono fica visivel para ela — v3.6.0
node -p require('./package.json').version  →  3.6.0
```
Os **18 hashes** citados existem e as mensagens batem com as versões (37a47fa v2.98.2 · 23ac56a v2.98.3 · db66428 v2.98.4 · dee21e1 v2.98.5 · 0d8ae6e auditoria · 10a5050 v2.99.0 · 43b42b3 v2.99.1 · b1f42af v2.99.2 · a777c5b v2.99.3 · 9d42f8e · c4dad50 · 9da4544 v3.1.0 · c76c940 v3.1.1 · 70b5311 v3.2.0 · 54739df v3.3.0 · de456f5 v3.4.0 · 88b60fd v3.5.0 · 45e91f5 v3.6.0).

Existência e conteúdo:
- `lib/torres/` — 9 arquivos (`estado`, `minimo`, `banco`, `selecao`, `tipos` + 4 de teste); `app/api/attempts/route.ts` presente; `lib/semaforo.ts` + `lib/semaforo.test.ts` (**3 `it(`**, coerente com "3 testes quebram por injeção"); `model ExerciseAttempt` em `prisma/schema.prisma:195`; backup `~/neuropeak-backups/neuropeak-20260901-003324.dump` = **320.320 bytes (313 KB)**.
- Banco de problemas: **40 entradas**, distribuição `discos: 3 → 5 · 4 → 18 · 5 → 12 · 6 → 5`, nenhum com 7 ou 8; os cinco de 6 discos (`C6-01, C6-02, D6-01, D6-02, E6-01`) estão **todos na fase 6**.
- Prova da BFS: `lib/torres/minimo.test.ts` tem `it.each` com `[1,1][2,3][3,7][4,15][5,31][6,63]` — "BFS devolve 2^n − 1", de 1 a 6 discos.
- `lib/adaptive.ts:154` é exatamente `if (accuracy &gt;= 0.80 &amp;&amp; lvl &lt; maxLevel)`; `TorreHanoi.tsx:548` calcula `const accuracy = eficientes / Math.max(1, resultados.length)`.

Provas rodadas (exit code capturado sem pipe):
```
npx tsc --noEmit ; echo EXIT_TSC=$?      →  EXIT_TSC=0
npm run test &gt; log 2&gt;&amp;1 ; echo EXIT=$?   →  EXIT_TEST=0
   Test Files  62 passed (62)
        Tests  844 passed (844)
     Duration  14.71s
```
`npm run build` **não foi rodado**, conforme instruído (dev server na porta 3000).

Commits não publicados:
```
11:22:10 -03  git log --oneline origin/main..HEAD | wc -l  →  84
11:26:06 -03  (mesma medição)                              →  85
```
Integridade do que não podia ser tocado:
```
diff &lt;(sed -n '106,$p' PROGRESSO.md_original) &lt;(sed -n '209,$p' novo)  →  exit 0, sem saída
diff &lt;(head -5 original) &lt;(head -5 novo)                               →  exit 0, sem saída
```
`git diff --stat` final:
```
 PROGRESSO.md | 137 ++++++++++++++++++++++++++++++++++++++++++++++++++++-------
 1 file changed, 121 insertions(+), 16 deletions(-)
```
`git status --porcelain`: ` M PROGRESSO.md` e `?? PROGRESSO.md.bak-20260901`.

## O QUE NÃO FIZ

- **Não commitei e não publiquei** — nem o PROGRESSO.md nem o `.bak`.
- **Não rodei `npm run build`**.
- **Não toquei** nos outros três blocos "EM ANDAMENTO" nem em nenhuma outra linha do arquivo.
- **Duas observações onde a realidade se moveu ou merece nuance** (registradas no texto, não maquiadas):
  1. **A contagem virou 85 durante a tarefa.** O checkpoint automático commitou sozinho (`db27a91 checkpoint automatico`) entre 11:22 e 11:26. Escrevi as duas medições com as respectivas horas — 84 às 11:22, 85 às 11:26 — em vez de fingir um número estável. A faixa "v2.90 → v3.6.0" confere: o commit não publicado mais antigo (`e281113`) carrega `package.json` em 2.90.0, e o primeiro bump da série é `30b7370 … — v2.90.1`.
  2. **`lib/adaptive.ts:154` está dentro de `calculateFocusProgression`**, não da genérica `calculateProgression`. A linha e o limiar `&gt;= 0.80` são exatamente os que você citou, e o próprio comentário em `TorreHanoi.tsx:539` aponta para ela — então mantive a referência como estava, mas registro aqui que a função nomeada nesse ponto do arquivo é a do Focus.
- Não verifiquei visualmente nada em navegador (fora do escopo e é justamente a pendência dela).</result>
<usage><subagent_tokens>54512</subagent_tokens><tool_uses>25</tool_uses><duration_ms>303233</duration_ms></usage>
</task-notification>

## 01/09/2026 11:28
[Image #7] [Image #8] essa barra ... subindo e descendo (azul) nao entendi e nada a ver esse nome auxiliar e destino (acho que no maximo destino) foi isso que pedi das torres?
