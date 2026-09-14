# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

**1. `/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — `+131 / −9` linhas (`git diff --numstat`), tudo dentro do bloco já existente `## ✅ ENTREGUE — Ordem da História…` (nenhum bloco novo, nada apagado):
- título passou a "…a revisão completa, **fatias A, B e C** (14/set/2026)"; a frase de abertura e o "O plano, fatiado em duas" ajustados para três fatias;
- nova seção `### O que ELA achou testando` — os dois defeitos nas palavras dela (f5 com a prova da roupa, `ord: [2,1,3,4]`, v3.28.1/`0353188e`; e a progressão travada, com a citação *"eu acertei umas 5 histórias e ela permaneceu com 4 desenhos"*), mais a lição em citação destacada sobre a auditoria ter julgado **enredo** e não **continuidade**;
- **Fatia C** dentro dessa seção, com checklist no mesmo padrão: reuso de `nextLevelPerTrial` (seção 15 da espec dela), tabela dos três vereditos (+1 / −1 / mantém), limites 1–10 só no modo ordem, 2 acertos para sair das 4 cenas, `difficulty` = máximo alcançado, os três campos novos de `metadata`, `lib/adaptive.ts` intocado, nível invisível, e a armadilha do pré-carregamento (`startRound` com `tier` antigo, `pendingRef` invalidado na troca de faixa) — mais o parágrafo do **d13** (v3.29.1/`5849286c`, `ord: [3,1,2,4,5,6]`) com a ressalva de que 1 e 2 ficaram como estavam por serem só leitura;
- nova seção `### ⚠️ Falha da própria prova do VP` (teto `1, 10` → `1, 12` passando quando devia falhar; o desbloqueio indevido do Intruso/Descubra sem a régua de 80%; correção lendo a linha do componente; a segunda falha da regex no parêntese aninhado);
- nova seção `### Revarredura por continuidade — estado` com a tabela dos números (86 catálogo, 85 sorteáveis, 54 conferidas, 31 faltando, achados f5/d13, ambíguas m21 e d6, 4 gabaritos corrigidos) e a regra dela de 14/set (as 83 de uma vez, corrigir só com prova visual dura, listar as de leitura);
- tabela de commits ganhou 4 linhas (`0353188e`, `b590330e`, `2bee2dec`, `5849286c`); provas atualizadas para **93 arquivos / 1202 testes** e **92/92** em `lib/ordem-historia` (com as baselines antigas preservadas na coluna); injeção da Fatia C acrescentada; produção ganhou a leitura de **3.29.1** com o buildId `dpl_2jmKfBhdJYcLCQHwkkfH6sbC5psc`, sem apagar a leitura anterior de 3.28.0;
- seção 🔴 ganhou os itens **5** (verificação visual dela: 2 acertos de primeira → 4 para 5 desenhos), **6** (m21 e d6 aguardando decisão dela) e **7** (31 histórias restantes da revarredura);
- `### Roteamento (regra 8)` do bloco ganhou o parágrafo da Fatia C;
- também atualizei o cabeçalho do bloco de 12-13/set, que dizia "(hoje está em 3.28.0)" → **3.29.1** — era o único ponto do arquivo que ficaria mentindo sobre a versão atual. Se o VP preferir intocado, é reverter essa linha.

**2. `/Users/kamyllahonorio/codex-lab/registro-roteamento.md`** — **1 linha** acrescentada (linha 32, id `#28`), no formato das anteriores (7 colunas, conferido por contagem de campos = 9 igual às linhas 29–31): Fatia C, 14/09/2026, `gpt-5.6-sol`, high, **ACEITO SEM CONSERTO**, com a armadilha do pré-carregamento que a spec avisou e ele tratou, e a falha do teto 10/12 registrada explicitamente como **da prova do VP, não da entrega dele**.

**Backups datados** (antes de escrever, ambos): `/Users/kamyllahonorio/neuropeak/PROGRESSO.md.bak-20260914` e `/Users/kamyllahonorio/codex-lab/registro-roteamento.md.bak-20260914`.

## COMO PROVEI

**TAREFA 1 — `git -C /Users/kamyllahonorio/neuropeak log --oneline -12`, exit 0, saída literal:**

```
d541bc08 checkpoint automatico (salvamento de seguranca)
5849286c Ordem da Historia: d13 (bale) tinha o ensaio numerado no meio da apresentacao (v3.29.1)
63a8219b checkpoint automatico (salvamento de seguranca)
2bee2dec Ordem da Historia: a dificuldade sobe DENTRO da sessao (v3.29.0)
b590330e Espec da Fatia C: a dificuldade sobe dentro da sessao
0353188e Ordem da Historia: f5 (rotina de dormir) tinha o gabarito errado (v3.28.1)
127f144e checkpoint automatico (salvamento de seguranca)
9bfae4c6 checkpoint automatico (salvamento de seguranca)
1096dba3 PROGRESSO: Ordem da Historia ENTREGUE, 3.28.0 medida em producao
7cbc7d8d checkpoint automatico (salvamento de seguranca)
8c572ed2 package-lock: versao 3.28.0
a040176e Ordem da Historia: a segunda tentativa, e a nota que nao infla (v3.28.0)
```

Os três commits citados **existem**: `0353188e` (v3.28.1), `2bee2dec` (v3.29.0), `5849286c` (v3.29.1) — mais `b590330e`, a spec da Fatia C. `git status --short` no início: exatamente ` M PEDIDOS-LOG.md` e ` M PEDIDOS-RECENTES.md`, árvore limpa fora deles, exit 0.

Cada edição do PROGRESSO.md foi feita por substituição de texto exato com `assert` de ocorrência única — qualquer âncora ausente ou ambígua abortaria o script sem gravar; ele gravou e reportou 270.504 → 279.299 bytes. Estrutura conferida depois por `grep -n "^### "`: as quatro seções novas aparecem na ordem esperada (156, 217, 233) antes de `### A entrega` (250) e antes de `### 🔴 O QUE FALTA` (310). `grep "fatiado em duas\|As duas fatias"` retorna vazio — não sobrou texto contradizendo as três fatias.

**`git status --short` final (no repositório do NeuroPeak):**
```
 M PROGRESSO.md
```
⚠️ Dois fatos que o VP precisa saber: (a) `PEDIDOS-LOG.md` e `PEDIDOS-RECENTES.md` sumiram do status porque o **hook de checkpoint automático commitou sozinho** durante meu trabalho (`dadd683f checkpoint automatico`, acima de `d541bc08`) — não fui eu, e não toquei nesses arquivos; (b) o backup não aparece no status porque `.gitignore:62` tem `*.bak-*` (`git check-ignore -v` confirma). O `registro-roteamento.md` fica fora deste repositório, então não aparece em `git status` algum daqui.

## O QUE NÃO FIZ

- **Não commitei nada** e não dei push — `PROGRESSO.md` está modificado e não commitado, à espera do VP. (Atenção: o hook de checkpoint automático pode commitá-lo por conta própria a qualquer resposta.)
- **Não toquei em código** — nenhum arquivo fora de `PROGRESSO.md` e `registro-roteamento.md`.
- **Não reconferi nada além da TAREFA 1**: não rodei `tsc`, `test`, `build`, `lint`, não medi `/api/version`, não abri as imagens de f5/d13 nem recontei o catálogo. Todos os números do item 5, as provas do item 7 e a leitura de produção do item 8 foram **transcritos do despacho**, não medidos por mim — status DESCONHECIDO pelo meu lado.
- Não apaguei nem reescrevi nenhum registro anterior do bloco (a leitura de 3.28.0 e as baselines antigas de teste continuam lá).
- Não removi os arquivos `.bak-20260914`.</result>
<usage><subagent_tokens>57751</subagent_tokens><tool_uses>17</tool_uses><duration_ms>264111</duration_ms></usage>
</task-notification>
