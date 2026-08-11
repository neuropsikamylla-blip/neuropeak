# SPEC — Focus Agentes, tutorial T1: fatia 3 (a definição e a troca de telas)

**Data:** 11/ago/2026 · **Executor previsto:** Codex · **Repositório:** clone descartável
**Não commitar.** Quem revisa o diff, aplica no repositório real, prova e commita é o Claude.

As fatias 1 e 2 já estão **aplicadas e provadas** no repositório que você recebeu. Você depende
delas: `lib/tutorial/pointer-tracking.ts`, a prop `trackTarget` do `DemoPointer` e
`lib/focus/scene.ts` (com `montarCenaEspalhada`, `passoDeriva`, `bobOffset`).

---

## ⚠️ O lab não tem `node_modules`

Você **não conseguirá** rodar `npm test` nem `npx tsc --noEmit`. Escreva os testes assim mesmo — são
entrega, tanto quanto o código — e **não afirme que rodou nada**. As provas rodam no repositório
real, por quem revisa.

## Como o projeto prova coisas

Não existe `testing-library` nem `jsdom`. **O Vitest roda em `environment: node` e não importa
JSX** — nenhum teste renderiza componente, e arquivos `.tsx` não podem ser importados por teste.
O padrão da casa, em 15 arquivos, é: **funções puras** testadas direto, e **leitura do fonte** com
`readFileSync` + regex para travar o que vive dentro de um componente. Veja
`lib/tutorial/estimulo-continuo.test.ts` e `lib/tutorial/gravacao-unica.test.ts`.

---

## Contexto: o que muda e por quê

Hoje o Focus Agentes tem **tela de instruções própria**, dentro do componente (a função `Tutorial`
em `FocusAgents.tsx`, fase `"instrucoes"`), e **nenhuma** instrução no framework
(`"focus-agents": []` em `app/(patient)/treino/[exercicio]/page.tsx`).

Decisão dela em 10/ago: **a tela interna é substituída pela tela de preparação do framework**, e o
tutorial T1 passa a existir. O fluxo final é o mesmo dos outros 19:

```
preparação (instructions)  →  tutorial T1  →  treino
   [Iniciar treino]
   [Ver tutorial novamente]
```

Isto resolve, de quebra, uma armadilha documentada em `ExerciseWrapper.tsx:60-65`: com
`instructions` vazio, a fase inicial é decidida **antes** de `tutorialState` chegar do fetch, e o
tutorial nunca apareceria. Com instruções, a decisão acontece em `leaveInstructions()`, já com o
estado carregado. **Não altere o `ExerciseWrapper` para resolver isso** — a peça é compartilhada
pelos 34 e o caminho normal já funciona.

---

# TAREFA A — os textos da preparação

Em `app/(patient)/treino/[exercicio]/page.tsx`, o mapa de instruções: `"focus-agents"` e
`"focus-agents-auditivo"` deixam de ser `[]` e recebem **exatamente** estes cinco textos, aprovados
por ela em 11/ago (não reescreva, não reordene, não acrescente):

1. `Antes de cada rodada aparece um comando. Leia com calma e toque em OK.`
2. `O comando some quando a busca começa — guarde-o na memória.`
3. `Encontre o personagem que corresponde e clique nele.`
4. `A rodada tem tempo: se ele acabar antes de você achar, ela passa e vem a próxima.`
5. `Conforme você acerta, aparecem mais personagens e os parecidos aumentam.`

### Por que os textos antigos não podem ser reaproveitados

Os quatro bullets da tela interna descrevem coisas que **não existem no exercício**. Isto é achado
medido, não opinião:

| texto antigo | por que é falso |
|---|---|
| "Leia o comando … que **fica no topo**" | o comando foi removido da tela de busca de propósito, a pedido dela — durante a busca não há nenhuma dica na tela |
| "nos níveis seguintes **passam a cair de cima**" | a queda foi removida; `FocusAgents.tsx` fixa `const cai = false` |
| "com a evolução … **a queda acelera**" | idem |
| "Use o **🔊** para ouvir o comando de novo" | não existe botão de som; o único `playTTS` dispara sozinho, e só no modo auditivo |

---

# TAREFA B — a `TutorialDefinition` do Focus Agentes

Arquivo novo: `lib/tutorial/definitions/focus-agents.tsx`.

> **Por que um arquivo do exercício e não da família.** O Focus é o primeiro da Família 5, e a
> mecânica dele (busca visual numa cena em movimento) não se generaliza de forma óbvia para
> `stroop-task` ou `task-switching`. Uma fábrica de família inventada agora seria abstração sem
> segundo caso. Quando o segundo chegar, generaliza-se com dois exemplos na mão.

## O contrato

`lib/tutorial/types.ts` define `TutorialDefinition`. Preencha:

- `exerciseId: "focus-agents"`
- `version: 2` — **obrigatoriamente 2**, para casar com `TUTORIAL_VERSIONS` em
  `lib/tutorial/versions.ts`, onde o Focus consta como reformulado. Essa versão é o que fica
  gravado no paciente (`tutorialRequired` / `completionRecordFor`); divergir cria bug silencioso de
  "tutorial que reaparece" ou "que nunca reaparece".
- `modo`: **não declare**. O default é `"completa"` — Fluxo 1, demonstração + tentativa guiada.
  ⛔ Não use `"explicativo"`. Justificativa, caso discorde: a pergunta da regra 11 é *a demonstração
  aumenta a compreensão da mecânica?* Aqui aumenta — o paciente precisa ver alguém **varrer** uma
  cena com vários personagens semelhantes e escolher **um**. Ler "clique no que corresponde" não
  ensina a busca.
- `guidedInstruction`: uma frase com o verbo do gesto real, que é **clique**.
  ⛔ Proibido "toque" e "teclado" — o vocabulário é único no projeto e há teste que barra.
- `retryHint`: uma frase, imperativa, sem estratégia cognitiva.
- `smallestValidUnit`: **derive de `STEPS[0].n`** (`lib/focus/progression.ts`), nunca escreva o
  número. Se a escada clínica mudar, o tutorial acompanha sozinho.
- `Demonstration` e `GuidedAttempt`: abaixo.

## A cena, nos dois componentes

Use as peças reais do exercício. **Não reimplemente nada**: cena divergente vira tutorial que
ensina outra coisa.

- comando: `gerarRodada` de `lib/focus/commands.ts`, com `STEPS[0].etapa`, `STEPS[0].n` e
  `STEPS[0].semelhantes` — o degrau em que o paciente de fato começa;
- posições: `montarCenaEspalhada` de `lib/focus/scene.ts`;
- movimento: `passoDeriva` + `bobOffset`, em `requestAnimationFrame`, **igual ao exercício**;
- imagens: mesmo caminho e mesma proporção que `FocusAgents.tsx` usa.

### ⛔ Onde a cena NÃO pode ser gerada

**Nunca no topo do módulo, nem no corpo do render.** `gerarRodada` e `montarCenaEspalhada` usam
aleatoriedade, e no Next o módulo é avaliado no servidor **e** no cliente: cenas diferentes,
hidratação quebrada. Foi um dos três defeitos que reprovaram a tentativa anterior.

**Gere num efeito de montagem**, guardando em estado, e renderize um estado vazio até a cena
existir. Assim só o cliente gera, e o problema não existe.

### A demonstração tem movimento — este é o ponto da fatia

Decisão dela em 10/ago: a demonstração usa **a deriva real** do exercício, não uma cena imóvel.
O tutorial é réplica do treino, e no treino os personagens se movem desde o primeiro degrau
(`VEL_LEVE[0]` = 0,4 px/frame).

Por isso o `DemoPointer` recebe **`trackTarget`**: ele remede o alvo a cada frame e acompanha. Essa
prop existe exatamente para este caso e **nenhum outro tutorial a usa** — há teste travando isso.

O roteiro da demonstração, na ordem:

1. o comando aparece, como aparece no exercício (o cartão "Encontre");
2. a cena entra e **começa a derivar**;
3. o ponteiro localiza, desloca até o alvo **em movimento** e pressiona;
4. o acerto é marcado como o exercício marca;
5. pausa suficiente para o paciente entender o que viu — **regra 6: o tutorial nunca parece
   acelerado**; e então `onDone()`.

⚠️ Um distrator ao menos deve **compartilhar um atributo** com o alvo (o mesmo acessório em outra
cor, por exemplo), para a demonstração mostrar **discriminação** e não acerto óbvio. Se
`gerarRodada` não produzir isso, reamostre — com um limite de tentativas, e aceitando a última se
o limite estourar. **Nunca** entre em laço sem limite.

### A tentativa guiada

Mesma cena e mesmo movimento; agora quem clica é o paciente.

- clicou no alvo → `onOutcome("correct")`;
- clicou noutro → `onOutcome("incorrect")`.

⛔ **Regra 6 — o tutorial ensina, não mede.** Sem relógio, sem contagem de tempo, sem omissão, sem
pontuação. Se o paciente demorar, não acontece nada. Nada aqui grava nada: quem decide o registro é
`completionRecordFor`, no `ExerciseWrapper`, e **nenhum exercício implementa gravação própria** —
há teste (`lib/tutorial/gravacao-unica.test.ts`) que falha se você tentar.

## Registro

Em `app/(patient)/treino/[exercicio]/page.tsx`, acrescente `"focus-agents": focusAgentsTutorial` ao
mapa `TUTORIAIS_POR_EXERCICIO`.

**Só o visual.** `focus-agents-auditivo` **não** entra no mapa nesta fatia: lá o comando é falado, e
um tutorial que mostra o cartão escrito ensinaria a tarefa errada. Ele fica com a preparação (tarefa
A) e sem tutorial, o que é o comportamento atual e não é regressão.

---

# TAREFA C — remover a tela interna do componente

Em `components/exercises/attention/FocusAgents.tsx`:

- remova o componente `Tutorial` e a constante `DEMO`;
- remova a fase `"instrucoes"` do tipo `Fase` e o `if (fase === "instrucoes")` do render;
- a fase inicial passa a ser `"comando"`;
- `begin()` — hoje chamado no `onStart` da tela interna — passa a ser chamado **no mount**.

### Por que `begin()` no mount agora está certo, tendo sido defeito antes

Na tentativa anterior isto foi **rejeitado**, e com razão: o cronômetro passaria a correr enquanto o
paciente lia as instruções **dentro** do componente, contaminando tempo de resposta, que é dado
clínico e decide subida de nível.

Com esta fatia a leitura acontece **fora**: o componente só é montado quando o `ExerciseWrapper`
entra na fase `exercise` — ou seja, depois de "Iniciar treino" e depois do tutorial. Quando ele
monta, o paciente já está começando a treinar. O motivo da rejeição desapareceu **por causa da
mudança de arquitetura**, não por mudança de opinião.

### O que NÃO tocar

⛔ Progressão, escada, tempo de rodada, omissão, feedback, pontuação, metadata, `registra`,
`encerrar`, preload de imagens. **Nada de mecânica clínica.**
⛔ O ramo morto da queda (`const cai = false`). Remover código morto é decisão dela, tratada à parte.
⛔ `lib/focus/commands.ts`, `progression.ts`, `roster.ts`, `scene.ts`, `image-loader.ts`.

---

## Prova de aceite — escreva ANTES

Em `lib/tutorial/focus-agents.test.ts`, no estilo `readFileSync` da casa:

1. **Fluxo 1:** o arquivo da definição **não** contém `modo: "explicativo"` nem `explicacao:`.
2. **Versão coerente:** a definição declara `version: 2` **e** `TUTORIAL_VERSIONS["focus-agents"]`
   vale 2. Este teste precisa falhar se qualquer um dos dois mudar sozinho.
3. **Vocabulário (regra 4):** `guidedInstruction` usa "clique"; o arquivo não casa `/teclado/i`;
   e não usa "toque" como verbo de instrução ao paciente.
4. **Unidade derivada:** `smallestValidUnit` referencia `STEPS`, e o arquivo **não** contém o
   literal correspondente escrito à mão.
5. **A cena não nasce no módulo:** nem `gerarRodada` nem `montarCenaEspalhada` são chamados no topo
   do arquivo — toda chamada está dentro de um componente. Prove por **posição** (a primeira chamada
   ocorre depois do início da primeira `function`), não por presença de alguma palavra.
6. **A demonstração tem movimento:** o arquivo usa `trackTarget` e `passoDeriva`.
7. **Nada de medição (regra 6):** o arquivo não contém `Date.now`, `performance.now`,
   `reactionTime`, `score`, `accuracy` nem `omiss`.
8. **Nada de gravação própria (regra 10):** o arquivo não contém `onTutorialDone`, `fetch(`, nem
   `tutorialCompletedAt`.
9. **A preparação tem os cinco textos:** `page.tsx` contém os cinco, literais, sob `focus-agents` —
   e **não** contém mais nenhum dos quatro textos falsos ("fica no topo", "cair de cima", "queda
   acelera", "🔊").
10. **A tela interna saiu:** `FocusAgents.tsx` não contém mais `"instrucoes"`, nem `function
    Tutorial`, nem `const DEMO`.
11. **`begin()` no lugar certo:** `FocusAgents.tsx` chama `begin()` num efeito de montagem, e o
    componente `Tutorial` não existe mais para chamá-lo.
12. **O registro:** `page.tsx` mapeia `"focus-agents"` para a definição e **não** mapeia
    `"focus-agents-auditivo"`.

Mais: `npm test` verde e `npx tsc --noEmit` limpo — provados por quem revisa, não por você.

---

## Regras da casa

- **Não commite.** Não altere `PROGRESSO.md`, `CLAUDE.md`, `versions.ts` nem documento de estado.
- Comentário explica **por quê**, nunca o que a linha já diz.
- Interface em pt-BR com acentuação correta.
- Encontrou contradição entre esta spec e o código? **Pare e relate.** Não escolha sozinho — na
  rodada anterior, três decisões tomadas em silêncio reprovaram a entrega inteira.
- Ao terminar, relate: o que fez, quais arquivos criou (arquivo novo não aparece no diff) e **o que
  você não conseguiu verificar**.
