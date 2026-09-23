# C7 — por que ainda está repetitivo (23/set/2026)

Ela testou em produção e reprovou: *"nesse estilo INSUPORTAVEL de chato... que tentamos melhorar
teria de alternar está chato real"*. E: *"esse repetiu a mesma pergunta"*.

## O que ela viu, em 6 atividades

| # | pergunta | operação | veredito dela |
|---|---|---|---|
| 1 | Qual produto vence primeiro? | `comparacao` | chato |
| 2 | Qual produto é do tipo defumado? | `buscaDireta` | chato |
| 3 | Qual produto tem o maior preço? | `comparacao` | chato |
| 4 | Qual produto tem pelo menos 150 g e custa até R$ 18,50? | `doisCriterios` | — |
| 5 | Qual produto vence primeiro? | `comparacao` | **repetida** |
| 6 | Qual produto tem 400 g? | `buscaDireta` | chato |
| ✅ | **Entre os produtos que não contêm glúten, qual vence primeiro?** | `filtroComparacao` | **"esse já foi melhor"** |

## 🔴 Defeito 1 — os níveis baixos são quase só operação de UMA etapa

Medido direto de `PESOS_OPERACAO_POR_NIVEL`:

| nível | uma etapa (`buscaDireta` + `comparacao`) |
|---|---|
| **1** | **100,0%** |
| **2** | **62,0%** |
| 3 | 46,8% |
| 4 | 41,4% |
| 5 | 37,6% |
| 6 | 33,9% |
| 7 | 27,1% |
| 8 | 23,1% |

O que existe em cada nível baixo:

- **nível 1:** `buscaDireta` 67% · `comparacao` 33% — e nada mais
- **nível 2:** `buscaDireta` 31% · `comparacao` 31% · `doisCriterios` 38%
- **nível 3:** entra `filtroComparacao`, com 15%

**`filtroComparacao` — exatamente a que ela aprovou — vale 0% nos níveis 1 e 2.**

### Por que isso explica a queixa dela

Uma etapa = ler a pergunta, olhar UMA linha nos três cards, escolher. É a mesma mecânica sempre,
só muda o rótulo da linha. Foi a queixa original dela em 15/set (*"ainda estou basicamente fazendo
ler pergunta → olhar a mesma linha nos 3 cards → escolher"*) e continua valendo nos níveis baixos.

`filtroComparacao` quebra isso porque **a resposta não está em nenhuma linha**: é preciso restringir
o conjunto primeiro (quem não contém glúten) e só então comparar dentro do que sobrou.

## 🔴 Defeito 2 — a anti-repetição é curta demais e cega ao atributo

`sortearOperacao` enfraquece por ×0,15 **somente a operação imediatamente anterior**. Duas
consequências, as duas visíveis no teste dela:

1. **Memória de 1 passo:** `comparacao` na 1ª, outra coisa na 2ª, `comparacao` de novo na 3ª — com
   peso cheio, porque já não era "a anterior".
2. **Cega ao atributo:** a operação pode mudar e a pergunta continuar sendo sobre validade. Pior,
   a MESMA operação com o MESMO atributo (`comparacao` + validade) reaparece como se fosse nova —
   foi o que gerou "Qual produto vence primeiro?" duas vezes.

## O conserto proposto

1. **Redistribuir os níveis 1 e 2:** trazer `filtroComparacao` e `exclusao` para baixo e rebaixar
   `buscaDireta` a papel de aquecimento. Meta: **no máximo ~35% de uma etapa já no nível 2**, e
   nunca 100% em nível nenhum.
2. **Anti-repetição por (operação + atributo), com memória de 3 rodadas** — em vez de 1 rodada e só
   operação. Não basta trocar de operação se a pergunta continua caindo em validade.

⚠️ Ao mexer nos pesos, refazer a prova da C2 (não-repetição) e da C5 (progressão), que dependem
dessa tabela.

## O que NÃO é o problema

A arte, os produtos e o layout: ela não reclamou de nada disso. O material do C6 (12 imagens de
cardápio, cinema e viagem) está pronto e não é afetado por este diagnóstico.
