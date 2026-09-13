# Rastreamento com Objetos (MOT) — o que a progressão realmente faz

> Medição de 12/set/2026, feita a pedido dela: *"rastreamento com objetos esta excelente... mas acho
> que a partir de 3 - 4 bolas podemos deixar mais dificil, aumentando a quantidade de distratores,
> as bolas ficando mais distantes nao sei... o que acha?"*
>
> Nada foi alterado no exercício. Este documento é medida, não proposta aprovada.

## 1. O que o motor faz hoje, nível por nível

Fonte: `lib/mot/scene.ts`. Tabela gerada executando as próprias funções do motor, não lendo o código.

| nível | alvos | distratores | total | razão distr/alvo | velocidade | rastreio (ms) | arena | separação inicial |
|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 6 | 8 | **3,00** | 1,25 | 3500 | 75% | 78 px |
| 1 | 3 | 8 | 11 | 2,67 | 1,25 | 3640 | 79% | 78 px |
| 2 | 3 | 8 | 11 | 2,67 | 1,53 | 3780 | 83% | 78 px |
| 3 | 4 | 10 | 14 | 2,50 | 1,53 | 3920 | 88% | 78 px |
| 4 | 4 | 10 | 14 | 2,50 | 1,81 | 4060 | 92% | 78 px |
| 5 | 5 | 12 | 17 | 2,40 | 1,81 | 4200 | 96% | 78 px |
| 6 | 5 | 12 | 17 | 2,40 | 2,09 | 4340 | 100% | 78 px |
| 7 | **6** | **14** | 20 | 2,33 | 2,09 | 4480 | 100% | 78 px |
| 8 | 6 | 14 | 20 | 2,33 | 2,37 | 4620 | 100% | 78 px |
| 10 | 6 | 14 | 20 | 2,33 | 2,65 | 4900 | 100% | 78 px |
| 12 | 6 | 14 | 20 | 2,33 | 2,93 | 5180 | 100% | 78 px |
| **13** | 6 | 14 | 20 | 2,33 | 2,93 | **5300** | 100% | 78 px |
| **14** | 6 | 14 | 20 | 2,33 | **3,00** | 5300 | 100% | 78 px |
| 16 | 6 | 14 | 20 | 2,33 | 3,00 | 5300 | 100% | 78 px |

### Três fatos que saem da tabela

1. **O exercício satura.** Do **nível 7** em diante, alvos, distratores, razão e arena estão todos no
   teto — só velocidade e duração ainda andam. Do **nível 14** em diante **nada muda**: subir de
   nível deixa de significar qualquer coisa. O `handleConfirm` do componente não tem teto de nível
   (`levelRef.current + 1` sem limite), então o paciente continua "subindo" para o mesmo exercício.
   A dificuldade gravada na sessão satura antes, no nível 8 (`min(10, 2 + nível)`).

2. **A razão de distratores CAI conforme sobe** — 3,00 no nível 0 contra 2,33 do nível 7 em diante.
   Proporcionalmente, o campo fica **menos** povoado de distratores nos níveis altos. A intuição
   dela está exata.

3. **A separação inicial nunca aperta**: `Math.max(radius * 3, 78)` é fixo em todos os níveis. As
   bolas nascem tão espalhadas no nível 16 quanto no nível 0.

## 2. A carga real: encontros entre alvo e distrator

Número de bolas não é dificuldade. No rastreamento múltiplo, o que obriga o sistema a sustentar a
identidade de cada alvo é o **encontro próximo** — o momento em que um distrator passa raspando num
alvo e os dois podem ser confundidos. Fora desses momentos, o olho acompanha objeto isolado sem
esforço.

**Método:** 300 rodadas simuladas por nível, rodando o próprio `stepAll` do motor a 60 fps pela
`trackDuration` do nível, em arena de 1100 px (desktop típico). Conta-se uma entrada de encontro
quando a distância entre centros de um alvo e um distrator cai abaixo de **55 px** (2,5 × raio), sem
recontar enquanto os dois seguem juntos.

| nível | alvos | distr. | média | mín | máx | desvio | p10 | p90 | por alvo | área coberta por bolas |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 6 | 1,1 | 0 | 6 | 0,9 | 0 | 2 | 0,5 | 2,7% |
| 1 | 3 | 8 | 1,9 | 0 | 8 | 1,3 | 0 | 3 | 0,6 | 3,3% |
| 3 | 4 | 10 | 3,3 | 0 | 9 | 1,6 | 1 | 5 | 0,8 | 3,5% |
| 5 | 5 | 12 | 5,2 | 0 | 13 | 2,2 | 3 | 8 | 1,0 | 3,5% |
| 7 | 6 | 14 | 8,4 | **2** | **16** | 2,7 | 5 | 12 | 1,4 | 3,8% |
| 8 | 6 | 14 | 9,6 | 3 | 17 | 2,8 | 6 | 13 | 1,6 | 3,8% |
| 10 | 6 | 14 | 11,5 | 3 | 19 | 3,0 | 8 | 15 | 1,9 | 3,8% |
| 12 | 6 | 14 | 13,5 | 4 | 22 | 3,5 | 9 | 18 | 2,2 | 3,8% |
| 14 | 6 | 14 | **13,9** | 4 | 25 | 3,8 | 9 | 20 | 2,3 | 3,8% |
| 16 | 6 | 14 | **13,9** | 4 | 25 | 3,8 | 9 | 20 | 2,3 | 3,8% |

### 2.1 O campo está vazio em todos os níveis

As bolas cobrem de **2,7% a 3,8%** da arena. A arena cresce (75% → 100%) quase na mesma proporção em
que as bolas aumentam, então **a densidade praticamente não muda** — é sempre um campo esparso. É a
confirmação numérica do que ela viu: há espaço de sobra para mais distratores.

### 2.2 O achado que ninguém pediu: a dificuldade da rodada é sorteada

No **nível 7**, a mesma configuração produz de **2 a 16** encontros — fator de **8×** entre a rodada
mais fácil e a mais difícil, com desvio de 2,7 em média 8,4. No nível 14, de 4 a 25.

As trajetórias são aleatórias e **ninguém mede quantos encontros a rodada vai ter**. Consequências:

- duas rodadas do mesmo nível podem ser exercícios de dificuldade muito diferente;
- a **acurácia alimenta a engine adaptativa** — então o nível que o paciente alcança depende em parte
  de sorte de trajetória, não só do desempenho dele;
- ⚠️ **o p10 do nível 7 (5 encontros) é menor que o p90 do nível 3 (5 encontros)**: uma rodada ruim
  do nível alto pode ser mais fácil que uma rodada boa do nível baixo. As faixas se sobrepõem.

Isto **não** foi pedido por ela e não é correção urgente: é um limite do desenho atual, que vale
pesar junto com a decisão sobre distratores.

## 3. Parecer sobre as duas ideias dela

### 3.1 "aumentando a quantidade de distratores" — sim, e os números apoiam

A razão cai com o nível e o campo está a 3,8% de ocupação. Há folga para os distratores crescerem
**mais rápido que os alvos**, em vez de ficarem amarrados a `alvos × 2 + 2`.

### 3.2 "as bolas ficando mais distantes" — aqui eu discordo, e o motivo é clínico

**Afastar as bolas facilita o rastreamento, não dificulta.** Sem encontro próximo não há o que
sustentar: o alvo isolado é acompanhado sem custo. É exatamente o que ela mesma disse em
**12/ago/2026** e que está escrito no motor, no comentário de `arenaScaleForLevel`: *"poucas bolas
numa área enorme ficam distantes umas das outras e o rastreamento perde a dificuldade"*.

O eixo que endurece é o oposto — **aproximar**: mais densidade, encontros mais frequentes, separação
inicial menor nos níveis altos.

> Se o que ela viu foi o campo **parecendo** espalhado demais nos níveis altos, a leitura bate com o
> dado (3,8% de ocupação) e a saída é **mais bolas**, não mais distância.

## 4. Três eixos possíveis, em ordem de efeito — para ela decidir

Nenhum implementado. Ordem por efeito clínico medido, não por facilidade.

1. **Densidade que realmente cresce.** Distratores com razão crescente em vez de fixa, e separação
   inicial que aperta com o nível em vez dos 78 px de sempre. Ataca o campo vazio e é o que ela pediu.
2. **Encontros como parâmetro, não como sorte.** O gerador passaria a produzir a rodada com uma faixa
   -alvo de encontros (rejeitando por simulação prévia a cena que cai fora), fechando a sobreposição
   entre níveis vizinhos. É o eixo mais potente e o que mais protege a métrica que vai ao adaptativo.
3. **Teto honesto.** Ou o nível para de subir onde o exercício para de mudar (hoje, 14), ou ganha
   eixos novos acima disso — por exemplo oclusão temporária, que existe na literatura de MOT e não
   existe aqui.

## 5. Dívida menor encontrada de passagem

Dois comentários do `lib/mot/scene.ts` contradizem o código que documentam:

- `totalBalls`: diz *"Teto em 10"*, o código tem `Math.min(14, ...)`;
- `arenaScaleForLevel`: diz *"Começa em 55%"*, a constante `ARENA_SCALE_MIN` é **0,75**.

Nos dois casos o código é o que roda; o comentário é que envelheceu. Corrigir junto com o que vier.
