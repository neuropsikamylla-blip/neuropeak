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

---

# A TENTATIVA DE 23/set — o que descobri e por que revertí

Apliquei a correção proposta e **revertí**. Vale registrar o que a tentativa ensinou.

## 🔴 Achado novo: o gargalo não é o peso, é a LIBERAÇÃO

`operacoesDoNivel()` decide o que cada nível pode sortear:

```ts
const operacoes: Operacao[] = ["buscaDireta", "comparacao"];
if (n >= 2) operacoes.push("doisCriterios");
if (n >= 3) operacoes.push("filtroComparacao");   // ← só a partir do 3
if (n >= 4) operacoes.push("exclusao");           // ← só a partir do 4
if (n >= 7) operacoes.push("tresCriterios");
```

**Mexer só na tabela de pesos não resolveria nada:** `filtroComparacao` pode ter o peso que for no
nível 1, que ela nem entra na lista de permitidas. É preciso mudar as duas coisas juntas.

## A proposta, pronta para aplicar

**Liberação:** `filtroComparacao` desce de 3 → **1**; `exclusao` de 4 → **3**.

**Pesos** (a coluna da direita é quanto sobra de UMA etapa):

| nível | buscaDireta | comparacao | filtroComparacao | doisCriterios | exclusao | tresCriterios | uma etapa |
|---|---|---|---|---|---|---|---|
| 1 | 40 | 30 | 30 | 0 | 0 | 0 | **70%** (era 100%) |
| 2 | 20 | 15 | 25 | 40 | 0 | 0 | **35%** (era 62%) |
| 3 | 15 | 13 | 24 | 33 | 15 | 0 | 28% |
| 4 | 12 | 11 | 22 | 32 | 23 | 0 | 23% |
| 5 | 10 | 10 | 20 | 30 | 30 | 0 | 20% |
| 6 | 8 | 9 | 19 | 29 | 35 | 0 | 17% |
| 7 | 6 | 7 | 16 | 25 | 30 | 16 | 13% |
| 8 | 5 | 5 | 14 | 22 | 32 | 22 | 10% |

O nível 1 continua o mais fácil — é onde se aprende a mecânica —, mas deixa de ser só uma coisa.

## ⚠️ Por que revertí: cinco provas caem, e elas guardam a C2 e a C5

Com a mudança aplicada (`tsc` limpo), reprovaram:

1. `tipo, operação, níveis e pesos obedecem ao contrato da C5`
2. `o tipo e a operação são liberados somente a partir do nível 3`
3. `o nível 2 apresenta pelo menos três operações e inclui dois critérios`
4. `50.000 sorteios encadeados batem nos alvos vividos dos níveis 1, 5 e 8`
5. `duas seguidas são raras com fator 0,15, três aceitas são impossíveis e o controle 1,0 reprova`

As quatro primeiras são **atualização de números** — o contrato mudou por decisão dela, e o teste
precisa acompanhar. **A quinta é outra coisa:** é a prova da não-repetição (C2), com controle
negativo, e falhou por margem estreita (`controle nível 8: teórico 0.224, obteve 0.189`). Recalibrar
esse número sem refazer a conta é como afrouxar a prova sem perceber — exatamente o defeito contra o
qual ela existe.

**Fazer isso direito exige:** recalcular os alvos teóricos da C2 e da C5 para a distribuição nova,
atualizar os cinco testes com as contas refeitas, e rodar o controle negativo de novo. É trabalho de
janela inteira, não de encaixe no fim.

## E continua pendente a segunda metade do conserto

A anti-repetição por **(operação + atributo) com memória de 3 rodadas**. Hoje `sortearOperacao`
recebe só `anterior?: Operacao` — mudar isso altera a assinatura e o chamador. Foi o que produziu
"Qual produto vence primeiro?" duas vezes no teste dela.
