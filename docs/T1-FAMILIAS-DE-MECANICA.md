# T1 — famílias de mecânica de tutorial

> Modelo de execução definido por ela em **07/ago/2026**: valida-se **uma vez por família**. Ela
> aprova **um representante**; a família inteira fica aprovada e a conversão segue sem paradas.
>
> ⚠️ **A validade desse modelo depende inteiramente de as famílias serem homogêneas.** Agrupar por
> gesto genérico ("clica") faria a senhora aprovar um representante que não representa os demais.
> Por isso o critério aqui é a **mecânica de tutorial**: o que a demonstração precisa demonstrar e
> como a tentativa guiada é respondida.

## Critério de família

Dois exercícios estão na mesma família quando **a demonstração e a tentativa guiada são o mesmo
roteiro**, mudando apenas o conteúdo. Se a demonstração precisa de um gesto diferente (arrastar em
vez de clicar) ou de uma estrutura diferente (escolher entre alternativas em vez de reproduzir uma
sequência), é **outra família**.

Levantado por varredura das fases (`type Phase`) e da forma de resposta de cada componente.

---

## Família 1 — Sequência apresentada → reproduzir na ordem ✅ APROVADA

**Roteiro:** apresenta uma sequência (áudio e/ou visual) → o paciente reproduz clicando na ordem.
**Demonstração:** toca a sequência, o cursor clica cada item na ordem correta.

| exercício | estado | observação |
|---|---|---|
| `span-numerico` | ✅ referência | painel numérico 1-9 |
| `span-numerico-inverso` | ✅ convertido | mesma fábrica, ordem invertida |
| `letras-sequencia` | ⏳ a converter | fases idênticas; estímulo é letra/sílaba |
| `sequencia-itens` | ⏳ a converter | fases idênticas; estímulo é item ilustrado |

> Os dois pendentes têm **exatamente** `ready·show·input·feedback`, como o Span, e áudio próprio.
> Pela regra dela, **não exigem nova validação** — a família já está aprovada. O que a fábrica
> precisa ganhar é o **painel de resposta** como parâmetro, já que o do Span é o numérico.

---

## Família 2 — Sequência espacial → reproduzir tocando as células

**Roteiro:** células/posições acendem em sequência → o paciente reproduz tocando.
**Difere da Família 1** por não haver painel fixo: o alvo é a própria grade.

`matriz-espacial` · `matriz-espacial-inversa` · `cubo-corsi` · `padroes-rotacao`

## Família 3 — Memorizar conjunto → selecionar depois

**Roteiro:** apresenta um conjunto → o paciente **seleciona** os itens certos (sem ordem).
**Difere da 1 e 2** porque a resposta não tem ordem — é seleção, não reprodução.

`desafio-supermercado` · `lista-distracao` · `jogo-memoria` · `restaurante-ordem`

## Família 4 — Estímulo contínuo → responder no momento certo

**Roteiro:** o estímulo aparece ao longo do tempo → o paciente responde quando a condição ocorre.
**Difere das anteriores** porque a demonstração precisa mostrar *quando* agir, não *o quê*.

`vigilancia` · `nback` · `tempo-reacao` · `semaforo` · `certo-ou-errado` · `mot` · `dual-task`

## Família 5 — Escolha entre alternativas

**Roteiro:** apresenta a questão → o paciente escolhe uma alternativa.

`stroop-task` · `task-switching` · `identificacao-simbolos` · `deductive-grid` ·
`informacao-em-foco` · `corrida-tempo` · `trilha-visual` · `focus-agents`

## Família 6 — Arrastar e posicionar ⚠️ RISCO ARQUITETURAL

**Roteiro:** o paciente move um elemento até um destino.

`ordem-historia` · `torre-hanoi` · `labirinto` · `estacionamento-logico`

> ⚠️ **O `DemoPointer` demonstra clique, não arrasto.** Esta família exige um gesto novo —
> pressiona, move **mantendo pressionado**, solta no destino. É a primeira candidata real a
> exceção arquitetural, e será registrada em `docs/T1-INCOMPATIBILIDADES.md` antes de qualquer
> mudança no padrão global.

## Família 7 — Composição e entrada numérica

`compra-multifuncional` · `antes-depois` (Caminhos para a Meta) · `investigadores-sociais`

---

## Regra de parada

Só se para quando:

1. surgir **incompatibilidade arquitetural**;
2. algum exercício exigir **exceção ao framework**;
3. aparecer uma **família nova** ainda não validada.

Se a família usa exatamente o comportamento já aprovado, converte-se **toda ela** sem aprovações
intermediárias.

## Ordem de execução

1. **Família 1** — terminar (`letras-sequencia`, `sequencia-itens`) — *sem nova validação*
2. **Família 2** — converter todas → validar 1 representante
3. **Família 3** — converter todas → validar 1 representante
4. **Família 4** — converter todas → validar 1 representante
5. **Família 5** — converter todas → validar 1 representante
6. **Família 6** — ⚠️ registrar a incompatibilidade e **perguntar antes**
7. **Família 7** — converter todas → validar 1 representante
