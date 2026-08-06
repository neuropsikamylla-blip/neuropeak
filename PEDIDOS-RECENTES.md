# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## O QUE MUDOU

Único arquivo tocado: **`/Users/kamyllahonorio/neuropeak/PROGRESSO.md`** — só dentro do bloco `## 🚧 EM ANDAMENTO — T1` (linhas 36–136). Nenhum outro arquivo, nenhum gate, nenhum acesso ao banco.

**1. Lista de passos (linhas 36–51):**
- Passos **2, 3, 4 e 5** marcados `[x]`, cada um com o *Pronto* reescrito para o que de fato foi entregue: supressão de "Para que serve no dia a dia" e "Estratégias" na preparação (2); demonstração por áudio reusando `Beads`/`NumberPad` (3); repetição remontando **apenas** a `GuidedAttempt` por chave incremental com sequência nova (4); encadeamento preparação → tutorial → treino no ar mais a fotografia de referência capturada antes do deploy (5).
- Passo **6** permanece `[ ]`, agora com o estado partido: *"Gates e publicação: FEITOS* (todos verdes, **v2.77.0** no ar, smoke não destrutivo executado). **Falta apenas a validação visual e funcional dela**".

**2. Nova subseção `### O que foi entregue (v2.77.0)`** (linhas 59–136), inserida dentro do próprio bloco EM ANDAMENTO, logo após "Estado ao abrir o bloco" e antes de `## ✅ T1.0`. Abre com versão, os três commits (`7a475a4`, `75644d7`, `a14724d`), origem no Codex `gpt-5.6-sol` high, spec `docs/specs/T1-span-direto-tutorial-SPEC.md`, revisão linha a linha do VP e o lab `t1span` removido. Contém seis subseções `####`, no estilo de negrito denso do arquivo:
- **Arquitetura entregue (reutilizável pelos demais)** — `span-playback.ts` como fonte única da cadência (500/850/1000 ms) importada também pelo treino; `definitions/span-numerico.tsx` reusando os componentes reais, guiada fixa em 2 dígitos como piso da mecânica; `TutorialRunner.tsx` (`demo → guiada → feedback → confirmação`); fase `"tutorial"` opcional no `ExerciseWrapper`; `ReadyScreen` do Direto sem antecipar comprimento, Inverso preservado por `reverse &amp;&amp;`.
- **Dois consertos do VP após a colheita** — o `onDone` recriado que faria a voz falar por cima de si mesma (corrigido com ref, com teste) e a armadilha da fase inicial avaliada uma única vez versus `tutorialState` por fetch, com o aviso explícito para exercícios sem tela de instruções.
- **Provas** — gates (`tsc` exit 0, **vitest 535/535** contra 517, `build` exit 0, lint sem warning novo além do pré-existente em `PadroesRotacao.tsx`), isolamento dos outros 33 (só `SpanNumerico.tsx` tocado entre os 48 componentes), deploy (`2.77.0`, buildId `dpl_2nN4Z18YizXY3pKDZy6mGfNRzo5D`) e o smoke não destrutivo com os cinco códigos.
- **Paciente técnico de teste** — script idempotente, código `COGZD3DRU`, 0 `ExerciseConfig`/0 `Session`, PIN não impresso, licença `-1` não decrementada.
- **Fotografia de referência** — os onze números literais, com a instrução de reexecutar com `--comparar` após a validação dela.
- **⏭️ PRÓXIMO PASSO — parado, aguardando ELA** — os oito pontos da validação e a trava explícita do Span Inverso.

## COMO PROVEI

- `git status --porcelain` → exit 0, saída ` M PROGRESSO.md` — nenhum outro arquivo tocado.
- `git diff --stat` → `PROGRESSO.md | 79 ++++`, 1 file changed.
- Releitura do arquivo (linhas 30–61 e 108–143): checkboxes 2–5 em `[x]`, 6 em `[ ]` com o texto novo; subseção fechando em 136 e `## ✅ T1.0` intacto em 138.
- **Alerta que preciso registrar:** eu **não** executei nenhum commit, mas o **hook de checkpoint automático do ambiente** commitou a primeira edição sozinho — `git log --oneline -3` mostra `3ce6448 checkpoint automatico (salvamento de seguranca)` acima de `a14724d`. A segunda edição (a subseção inteira) segue **não commitada** na árvore de trabalho. O VP decide se refaz esse commit com mensagem descritiva (`git reset --soft` é destrutivo de histórico e não toquei nisso).

## O QUE NÃO FIZ

- Não commitei nem dei push (o commit `3ce6448` é do hook automático dela, não meu).
- Não rodei gates (`test`, `build`, `tsc`, `lint`), nem os scripts `paciente-teste-t1.mjs` / `isolamento-tutorial.mjs`, nem nada contra o banco — todos os números vieram do despacho e foram transcritos como recebidos, sem verificação independente.
- Não toquei em `CLAUDE.md`, `ESTADO-DO-PROJETO.md`, memória, docs, código ou configuração.
- Não alterei o texto histórico do bloco ("Estado ao abrir o bloco: nenhum passo iniciado" segue como registro da abertura — a nova subseção o supera; se o VP quiser, esse parágrafo pode ser reescrito).</result>
<usage><subagent_tokens>36375</subagent_tokens><tool_uses>9</tool_uses><duration_ms>132410</duration_ms></usage>
</task-notification>
