# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

**1. `/Users/kamyllahonorio/codex-lab/registro-roteamento.md`** — uma linha nova ao final da tabela (linha 22 do arquivo, `#18`). Backup datado ao lado: `registro-roteamento.md.bak-20260903`.

```
21a22
&gt; | 18 | 03/09/2026 | Grade Dedutiva Fase 3 — a interface real (reescrita de DeductiveGrid.tsx sobre o motor lib/grade) | gpt-5.6-sol | high | Amarra o motor lib/grade, o framework de exercício (ExerciseStage/ExerciseWrapper) e as regras clínicas do que a tela deve calar; três fontes de precedência a reconciliar (fronteira 2 da Parte 4: sobe de terra para sol) | (em voo) |
```

Decisão de formato que tomei: **não** usei crases no nome do modelo. As quatro linhas mais recentes (#14 a #17) escrevem `gpt-5.6-sol` sem crase; você havia escrito com crase no despacho. Segui as linhas existentes, como você pediu. Se preferir a crase, é um gesto de um caractere.

**2. `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — só o bloco `EM ANDAMENTO — Grade Dedutiva` (linhas 152-193 antigas → 152-242 novas). `git diff --stat`: **70 insertions, 21 deletions, 1 arquivo**. O diff completo está acima na conversa; os pontos materiais:

- Título passou a `(02-03/set/2026)`.
- O parágrafo "O núcleo" perdeu os quatro estados de marcação e ganhou o aviso de que eles caíram em 03/set.
- F1 → `[x]` com o arquivo e as 656 linhas; a falha de 02/set virou parêntese histórico, não o estado atual.
- F2 → `[x]` com v3.10.0 / `8717f4e`, os 7 arquivos e a contagem de linhas de cada um.
- Item novo `[x]` para as decisões da mecânica (`408af8d`), com as 6 decisões, incluindo a proibição literal de nomear atribuição não determinada de "confirmação prematura".
- F3 → em voo, com lab, modelo, esforço, spec, caminho da saída e o procedimento de colheita cega.
- Seção nova `⚠️ O próximo risco real: a F6 ficou sem os indicadores que a espec pressupunha`, com a citação do gestor de conteúdo e o encargo de rever a seção 48 e submeter a ela.
- Nota 1 das "Duas coisas já sabidas" foi atualizada de "provavelmente atendida, confirmar na auditoria" para "CONFIRMADO pela auditoria (§10)", com as duas ressalvas que a própria auditoria registra (o log do raciocínio não cabe no `metadata` de hoje; o banco de produção não foi verificado). Nota 2 (motor da Torre) ficou intacta.
- "Estado da plataforma" reescrito com os números que eu medi.

Backup: `/Users/kamyllahonorio/neuropeak/PROGRESSO.md.bak-20260903`. Está fora do commit — `.gitignore:62` tem `*.bak-*`, e `git status --short` confirma que só `PROGRESSO.md` (mais os dois arquivos do gancho de pedidos) aparece como modificado.

---

## COMO PROVEI

**Tarefa 1 — evidência literal, sem interpretação:**

```
$ npx tsc --noEmit; echo "EXIT=$?"
EXIT=0
```

```
$ npm run test &gt; &lt;scratch&gt;/test-out.txt 2&gt;&amp;1; echo "EXIT=$?"
EXIT=0

 RUN  v4.1.7 /Users/kamyllahonorio/neuropeak

 Test Files  64 passed (64)
      Tests  888 passed (888)
   Start at  15:53:56
   Duration  14.43s (transform 1.91s, setup 0ms, import 3.23s, tests 22.06s, environment 4ms)
```

(Rodei duas vezes; a primeira, com pipe para `tail`, deu a mesma contagem — 64/888.)

```
$ git log --oneline -3
90d3a9f checkpoint automatico (salvamento de seguranca)
54c778c checkpoint automatico (salvamento de seguranca)
408af8d Grade Dedutiva: decisoes da mecanica fechadas com o gestor de conteudo
EXIT=0

$ git status --short
 M PEDIDOS-LOG.md
 M PEDIDOS-RECENTES.md
EXIT=0

$ grep '"version"' package.json
  "version": "3.10.0",
```

**O baseline da spec BATE.** A spec declarou 64 arquivos / 888 testes; a medição real é **64 arquivos / 888 testes**, exit 0. `tsc` exit 0. `npm run build` não foi rodado, conforme o veto.

**Confirmações que fiz por conta própria antes de escrever no PROGRESSO.md** (não confiei nos números do despacho):

- `wc -l docs/grade-dedutiva/AUDITORIA-GRADE-DEDUTIVA-2026-09-02.md` → **656** linhas. Confere.
- `wc -l lib/grade/*` → `derivacao.ts` 177 · `index.ts` 10 · `motor.ts` 476 · `solver.test.ts` 419 · `solver.ts` 133 · `tipos.ts` 176 · `vp-prova.test.ts` 54 → **1.445 total, 7 arquivos**. Atenção: `derivacao.ts` tem **177** linhas, não 176 — usei o número medido.
- `grep` em `lib/grade/solver.ts` confirma as 6 funções exportadas nomeadas no despacho; `derivacao.ts` exporta `derivar`. Em `motor.ts`, achei `const OPERADORES: Record&lt;TipoPista, OperadorPista&gt;` com o comentário do registro declarativo, `contarBits`/`ehSingleton`/`indiceDoBit` (máscara de bits) e menção explícita a MRV. As três características declaradas existem no código.
- `git log --oneline -- lib/grade docs/grade-dedutiva` → `408af8d`, `8717f4e` (fase 2, v3.10.0), `c8a7205` (auditoria), `c777c5f` (espec). Peguei daí os hashes que escrevi no bloco.
- `ls -la ~/codex-lab/saida-grade-f3-20260903.txt` → existe, 188.655 bytes às 15:53 (crescendo, o Codex está em voo).
- Sobre a §10/abandono: `grep` na auditoria mostra a linha 313 — *"Para 'nunca iniciou × iniciou e abandonou' (seção 85): NÃO precisa de migration"* — e as duas ressalvas nas linhas 336 e 342. Foi o que escrevi na nota 1.
- Limites do bloco conferidos por `grep -n "^## "` antes e depois da edição: cabeçalhos vizinhos (`134` DECISÃO DELA, `244` Jogo das Torres) intactos; total do arquivo 2.937 linhas.
- Registro de roteamento: `diff` contra o backup devolveu exatamente `21a22` — **uma adição, zero alterações em linha antiga**.

---

## O QUE NÃO FIZ

- **Não commitei nada.** As três modificações (`PROGRESSO.md` no repo, mais os dois arquivos do gancho) estão na árvore, esperando você. O `registro-roteamento.md` está em `~/codex-lab`, fora deste repo.
- **Não rodei `npm run build`**, conforme o veto do despacho.
- **Não toquei em `lib/grade/`, em `components/`, nem em nenhum código** — só nos dois arquivos de texto pedidos.
- **Não li nem analisei a saída do Codex** (`saida-grade-f3-20260903.txt`); só verifiquei que o arquivo existe e está crescendo. Leitura de colheita é sua.
- **Não verifiquei o banco de produção** para saber se `ExerciseAttempt` já existe lá — a ressalva ficou registrada no bloco como pendência, do jeito que a auditoria a deixou.
- **Não conferi o conteúdo do `~/codex-lab/lab.sh`** nem executei nada do lab.</result>
<usage><subagent_tokens>51174</subagent_tokens><tool_uses>20</tool_uses><duration_ms>203302</duration_ms></usage>
</task-notification>
