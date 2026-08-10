# SPEC — Focus Agentes, tutorial T1: fundação (fatias 1 e 2)

**Data:** 10/ago/2026 · **Executor previsto:** Codex · **Repositório:** clone descartável
**Não commitar.** Quem revisa o diff, aplica no repositório real, prova e commita é o Claude.

Duas tarefas **independentes**. Faça as duas, mas **não misture num único bloco de mudança**: são
áreas diferentes, a prova de cada uma é separada, e elas serão aplicadas em commits separados.

---

## ⚠️ O lab não tem `node_modules`

Você **não conseguirá** rodar `npm test` nem `npx tsc --noEmit` aqui. Isso é esperado.

- **Escreva os testes assim mesmo.** Eles são a entrega, tanto quanto o código.
- **Não afirme que rodou nada.** No ciclo anterior, o relatório dizia "testes passando" sem que
  nada tivesse sido executado. As provas rodam no repositório real, por quem revisa.
- Se precisar conferir alguma coisa, faça por leitura do código e diga o que conferiu e como.

## Como o projeto prova coisas (leia antes de escrever teste)

Não existe `testing-library`, `jsdom` nem `happy-dom` neste projeto. **Nenhum teste renderiza
componente React.** O padrão da casa, já usado em 15 arquivos, é:

1. **Funções puras** testadas diretamente (a maioria).
2. **Leitura do próprio fonte** com `readFileSync` + asserção por regex, quando o que se quer
   travar vive dentro de um componente. Veja `lib/tutorial/estimulo-continuo.test.ts` e
   `lib/tutorial/gravacao-unica.test.ts` — copie o estilo deles.

Consequência prática para esta spec: **tudo o que precisar de prova deve virar função pura**, e o
componente passa a apenas chamá-la. Não escreva teste que precise de DOM.

---

# TAREFA A — o ponteiro da demonstração precisa perseguir um alvo em movimento

## Contexto

`components/exercises/tutorial/DemoPointer.tsx` é a mão que demonstra o gesto nos tutoriais da T1.
Ele é **peça compartilhada dos 34 exercícios** — 19 já convertidos dependem dele exatamente como
está.

Hoje ele mede a posição do alvo **uma vez** (no `useEffect`, quando `targetSelector` muda, e em
`resize`) e anima até lá. Isso basta quando o alvo é estático, que é o caso dos 19.

**O que vem a seguir:** o tutorial do Focus Agentes vai demonstrar sobre uma cena em que os
personagens **derivam devagar** (~24 px/s) — decisão dela em 10/ago, para que o tutorial seja
réplica fiel do treino. Com a medição única, o ponteiro anima até onde o alvo **estava** e clica no
vazio.

## O que fazer

Uma prop **opcional** `trackTarget?: boolean`, default `false`.

- **Sem a prop (ou `false`):** comportamento **idêntico ao de hoje**, incluindo não agendar
  `requestAnimationFrame` nenhum. Os 19 tutoriais aprovados não podem mudar de comportamento — nem
  em um frame.
- **Com `trackTarget`:** o alvo é remedido a cada frame enquanto o seletor estiver ativo, e o
  ponteiro acompanha.

### A duração da animação em modo perseguição

O primeiro deslocamento até o alvo continua usando `moveDurationMs` — é ele que dá a leitura de
"a mão está indo até lá". Depois que o ponteiro chegou, seguir com `moveDurationMs` faria a mão
arrastar-se atrás do alvo com atraso visível. As medições seguintes usam uma duração curta de
seguimento.

Ponha isso numa função pura, não num `if` solto dentro do componente.

### Higiene obrigatória

- Cancelar o `requestAnimationFrame` no unmount **e** ao trocar de `targetSelector`. Sem vazamento.
- Não introduzir `setState` por frame que dispare re-render inútil quando a posição **não mudou**:
  compare antes de atualizar. (Vale a pena: essa cena roda junto com a animação do exercício.)

## O que NÃO tocar

- A aparência do ponteiro: tamanho, halo, ripple, cores, ícone. Nada disso muda.
- A assinatura existente: nenhuma prop atual pode virar obrigatória ou mudar de tipo.
- Nenhum dos 19 tutoriais já convertidos. Você não passa a prop nova em lugar nenhum nesta tarefa.

## Prova de aceite — escreva ANTES de mexer no componente

Módulo novo de funções puras (sugestão de caminho: `lib/tutorial/pointer-tracking.ts`), com teste
próprio:

1. **Centro do alvo relativo ao container.** Dada a caixa do container e a caixa do alvo, a função
   devolve o centro do alvo em coordenadas do container. Prove com números concretos, incluindo um
   caso com container deslocado na tela (container em 100/50, alvo em 150/80 medindo 40×60 →
   `{ x: 70, y: 60 }`).
2. **Duração:** a primeira medição de um alvo devolve `moveDurationMs`; as seguintes devolvem a
   duração de seguimento, que é **estritamente menor** que `moveDurationMs`.
3. **Mudou de posição?** A função que decide se vale atualizar devolve `false` para a mesma posição
   e `true` para posição diferente.

E, no estilo `readFileSync` da casa, sobre `DemoPointer.tsx`:

4. **O rAF é guardado pela prop.** O arquivo contém `requestAnimationFrame`, e toda ocorrência está
   dentro do bloco condicionado a `trackTarget`. Prove de forma que **falhe** se alguém tirar o
   guard — não basta procurar a string `trackTarget` no arquivo inteiro.
5. **O default é `false`.** O arquivo declara o default explicitamente.
6. **Nenhum dos 19 tutoriais passa a prop.** Varra `lib/tutorial/definitions/` e afirme que
   `trackTarget` não aparece lá (nesta fatia ainda não existe tutorial do Focus).

> A regra da casa sobre testes: **teste prova ausência, não só presença.** Um teste que só verifica
> que algo existe passa igual se o guard for removido. Prefira contar ocorrências e comparar
> posições no texto.

---

# TAREFA B — a cena do Focus Agentes vira função pura

## Contexto

`components/exercises/attention/FocusAgents.tsx` é o exercício. A montagem da cena e o passo de
animação vivem **dentro** do componente, misturados a estado do React e a manipulação de DOM:

- `iniciarRodada` (ramo `else`, por volta da linha 379): monta a cena espalhada — grade
  embaralhada, jitter dentro da célula, ângulo e velocidade iniciais de cada personagem.
- `startRaf` → `tick` (ramo `else`, por volta da linha 323): o passo da deriva — soma `vx`/`vy`,
  rebate nas bordas, separa quem se cobre, calcula o "bob" senoidal.
- `separarPersonagens` (linha 185): já é pura, mas mora no componente.

**Nada disso tem um único teste hoje.** E o tutorial vai precisar exatamente dessa cena: se ele
reimplementar a fórmula, passam a existir duas cenas que divergem com o tempo — e a regra dela é
que o tutorial seja **réplica** do exercício, não uma imitação parecida.

## O que fazer

Mover para `lib/focus/scene.ts`, **sem alterar comportamento**:

- as constantes de geometria e velocidade hoje no topo do componente (`CHAR_W`, `CHAR_H`, `MARGIN`,
  `VEL_LEVE`) — o componente passa a **importar** daqui, sem manter cópia;
- o tipo `LiveChar`;
- `separarPersonagens`, como está;
- **`montarCenaEspalhada`** — a lógica do ramo `else` de `iniciarRodada`: recebe os ids dos
  personagens, os ids dos alvos, largura, altura e o índice de velocidade; devolve `LiveChar[]`;
- **`passoDeriva`** — a lógica do ramo `else` do `tick`: recebe a lista, largura e altura, aplica
  um passo de movimento com rebatimento e separação. **Não toca no DOM**: quem aplica `transform`
  continua sendo o componente;
- **`bobOffset(frame, fase)`** — a flutuação senoidal, hoje embutida no `tick`.

### Aleatoriedade injetável — requisito, não enfeite

`montarCenaEspalhada` recebe uma fonte de aleatoriedade opcional (`random: () => number`, default
`Math.random`). Duas razões, ambas concretas:

1. **Sem isso não há teste determinístico** da montagem da cena.
2. O tutorial vai precisar de uma **cena estável**, igual a cada abertura. No ciclo anterior isso
   foi tentado chamando o gerador no topo do módulo — o que quebra no Next, porque o módulo é
   avaliado no servidor **e** no cliente, gerando cenas diferentes e quebrando a hidratação. Com a
   semente injetada, a cena estável sai de dentro do componente, do jeito certo.

### O ramo da queda

Existe um ramo de "queda" (`cai`) no componente, mas ele está **morto**: `const cai = false` é
fixo, com comentário explicando que a queda foi removida. **Não mexa nele nesta tarefa** — nem para
apagar. Remover código morto é decisão dela, e está sendo tratada à parte.

## O que NÃO tocar

- **Nada do comportamento clínico:** progressão, tempo de rodada, omissão, feedback, pontuação,
  `begin()`, cronômetro. Zero. Esta tarefa é refactor, e o exercício tem de continuar
  indistinguível na tela.
- A tela `Tutorial` interna do componente ("Como realizar o exercício") — ela sai na fatia 3, com
  o conteúdo migrado. Nesta tarefa, **deixe como está**.
- `lib/focus/commands.ts`, `progression.ts`, `roster.ts`, `image-loader.ts`.

## Prova de aceite — escreva ANTES

Em `lib/focus/scene.test.ts`, com `random` determinístico (por exemplo, um gerador de sequência
fixa — nunca `Math.random`):

1. **Montagem:** com N ids e uma arena de tamanho conhecido, devolve N personagens; todos dentro
   dos limites (respeitando `MARGIN`, `CHAR_W`, `CHAR_H`); exatamente os ids passados como alvo
   ficam com `isTarget: true`.
2. **Ninguém se cobre:** depois de `separarPersonagens`, nenhum par viola simultaneamente as
   distâncias mínimas horizontal e vertical.
3. **Rebatimento:** um personagem com velocidade negativa em X, colocado na borda esquerda,
   inverte o sinal de `vx` e **não** sai da arena.
4. **A cena não vaza:** aplicando `passoDeriva` 300 vezes seguidas, todos continuam dentro dos
   limites. (Este é o teste que pega erro de sinal, que é o defeito clássico aqui.)
5. **Determinismo:** duas montagens com a mesma semente produzem exatamente a mesma cena; com
   sementes diferentes, cenas diferentes.
6. **Sem cópia da fórmula:** por leitura do fonte, `VEL_LEVE` e a fórmula do bob aparecem em
   `lib/focus/scene.ts` e **não** em `FocusAgents.tsx`.

---

## Regras da casa

- **Não commite.** Não altere `PROGRESSO.md`, `CLAUDE.md` nem qualquer documento de estado.
- Comentário explica **por quê**, nunca o que a linha já diz. Comentário que repete o código é
  ruído e será removido na revisão.
- Interface em pt-BR com acentuação correta; identificadores de código em inglês, seguindo o que já
  existe nesses arquivos (que usam nomes em português — mantenha a coerência local).
- Encontrou contradição entre esta spec e o código? **Pare e relate.** Não escolha sozinho.
- Ao terminar, relate em texto: o que fez em cada tarefa, quais arquivos criou (arquivos novos não
  aparecem no diff), e **o que você não conseguiu verificar**.
