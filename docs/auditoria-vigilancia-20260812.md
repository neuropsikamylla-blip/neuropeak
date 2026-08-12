# Vigilância — como o exercício funciona hoje (auditoria de 12/ago/2026)

> Levantado direto do código: `lib/vigilancia.ts` (motor), `lib/vigilancia-dados.ts` (estímulos),
> `components/exercises/attention/Vigilancia.tsx` (fluxo). Descrição do que **existe**, não do que
> foi planejado.

## 1. A tarefa, em uma frase

Oito pipas aparecem ao mesmo tempo, em volta de um ponto central. **Sete são idênticas e uma é
diferente.** Elas somem, e o paciente clica **na região onde a diferente estava**. O modelo do alvo
**nunca é reapresentado** — ele precisa perceber sozinho qual destoa.

## 2. O ciclo de uma tentativa

| fase | o que acontece | duração |
|---|---|---|
| Fixação | ponto escuro no centro da tela | 750 ms |
| Exposição | as 8 pipas aparecem juntas sobre o fundo | **variável** (ver §4) |
| Resposta | as pipas somem; pergunta "Onde estava a pipa diferente?" com linha-guia do cursor | sem limite |
| Feedback | destaca a região correta e reapresenta a pipa diferente naquela posição | curta |

**Blocos de 12 tentativas**, contínuos, sem pausa entre eles.

## 3. Onde as pipas ficam — as 8 posições

Sempre as mesmas oito, num anel ao redor do centro: superior, superior-direita, direita,
inferior-direita, inferior, inferior-esquerda, esquerda, superior-esquerda.

A posição do alvo é **contrabalanceada**: cada ciclo de 8 tentativas usa as 8 posições, embaralhadas,
e nunca repete a mesma posição na emenda entre ciclos. Não há sorteio livre — em 12 tentativas cada
região aparece de forma equilibrada.

**Três arranjos** mudam o raio do anel (fração da menor dimensão da tela):

| arranjo | raio | efeito |
|---|---|---|
| compacto | 22% | pipas mais juntas, exige discriminação fina de posição |
| expandido | 35% | pipas mais afastadas |
| irregular | 35% + deslocamento leve | mesmas regiões, posições levemente irregulares |

### Como o clique é julgado

Não é por acerto exato: vence **a região mais próxima do clique**. Depois o sistema classifica em
*exata*, *correta aproximada*, *adjacente* ou *distante* — usando hoje a tolerância `padrão` (raio
"exato" = 42% do raio do anel). As tolerâncias `ampla` (55%) e `precisa` (30%) existem no motor mas
**não são usadas**.

## 4. A velocidade — 15 degraus de exposição

```
1800 · 1600 · 1400 · 1250 · 1100 · 960 · 840 · 730 · 630 · 540 · 460 · 390 · 330 · 280 · 240  (ms)
```

Todo bloco **começa no degrau 5 (1100 ms)** e se move dentro do bloco:

- **2 acertos seguidos** → acelera um degrau (e consolida o degrau atual como "estável")
- **2 erros seguidos** → desacelera um degrau
- **3 erros seguidos** → volta direto ao último degrau estável

⚠️ **Ponto importante para a sua revisão:** a velocidade **não é herdada** entre blocos. Sobe de
nível, o cronômetro volta para 1100 ms. Quem sobe de verdade é só o nível visual.

## 5. Os pares de pipas — o que existe

Cada par tem duas variantes (A e B). **Qual delas é o alvo alterna a cada bloco** (bloco ímpar = A,
bloco par = B), para o paciente não decorar uma figura.

| par | nome | o que diferencia | dificuldade visual | estado |
|---|---|---|---|---|
| P01 | Ameixa suave | cor do corpo (claro × escuro) | 2 | ❌ **desativado** — você achou fácil demais |
| P04 | Verde sálvia | cor do corpo | 1 | ativo |
| P03 | Terracota | cor do corpo | 3 | ativo |
| P07 | Verde musgo | cor do corpo | 4 | ativo |
| P02 | Azul ardósia | cor do corpo | 5 | ativo |
| P08 | Vinho | cor do corpo | 6 | ativo |
| P05 | Verde — laços | **quantidade de laços** (2 × 3) | 4 | ativo |
| P06 | Faixa diagonal | **orientação da faixa** (esquerda × direita) | 4 | ativo |

**Seis dos oito pares diferem só por tom de cor** (claro × escuro da mesma cor). Só dois usam outro
atributo: quantidade de laços e orientação da faixa.

A ordem de dificuldade dos pares de cor foi **medida por ΔE Lab** (distância de cor perceptual), não
estimada: P04 = 22,8 · P03 = 14,3 · P07 = 13,8 · P02 = 13,0 · P08 = 11,3. Quanto menor o ΔE, mais
parecidas as duas pipas, mais difícil.

## 6. Os fundos

Quatro, com complexidade crescente: BG01 (1) · BG02 (2) · BG03 (3) · BG04 (4).

## 7. A escada de 10 níveis — a progressão atual

**Sempre 8 pipas, em todos os níveis.** O que muda é o par, o arranjo e o fundo:

| nível | par (o que diferencia) | arranjo | fundo |
|---|---|---|---|
| 1 | P04 verde sálvia (ΔE 22,8 — mais fácil) | compacto | BG01 |
| 2 | P04 verde sálvia | **expandido** | BG01 |
| 3 | P03 terracota (ΔE 14,3) | expandido | **BG02** |
| 4 | P07 verde musgo (ΔE 13,8) | expandido | BG02 |
| 5 | P02 azul ardósia (ΔE 13,0) | expandido | BG02 |
| 6 | P08 vinho (ΔE 11,3 — mais difícil) | expandido | **BG03** |
| 7 | P08 vinho | **irregular** | BG03 |
| 8 | P08 vinho | irregular | **BG04** |
| 9 | **P05 laços** (2 × 3) | **compacto** | BG04 |
| 10 | **P06 faixa diagonal** | irregular | BG04 |

Regra de desenho usada: a semelhança das pipas **nunca retrocede** — do nível 7 em diante o par já
está no mais difícil, e quem endurece é o arranjo e o fundo.

### Como se sobe de nível

Ao fim de cada bloco de 12: **10 ou mais acertos → sobe**; 8 ou 9 → mantém; 7 ou menos → reforça
(repete o nível). O nível inicial vem da dificuldade salva do paciente.

## 8. O que ISSO treina — e o que está registrado

Registrado hoje no sistema: domínio **Atenção**, com secundários *Atenção Sustentada* e *Tempo de
Reação*. O embasamento cita a literatura de CPT (Parasuraman, Robertson & Garavan).

**Minha leitura do que a tarefa de fato exige, para você conferir:**

1. **Atenção sustentada** — sim, claramente. Blocos contínuos de 12, sem pausa, exposições curtas e
   repetitivas.
2. **Atenção seletiva / discriminação perceptual** — sim, e é o núcleo: achar 1 item que destoa
   entre 7 idênticos, com diferença cada vez menor (ΔE decrescente) e fundo cada vez mais poluído.
3. **Memória visuoespacial de curtíssimo prazo** — ⚠️ **este não está registrado, e é forte.** A
   pipa **some antes da resposta**: o paciente precisa reter *onde* ela estava para só então
   apontar. Não é uma tarefa de detecção pura; tem um componente de retenção espacial embutido.

O item 3 talvez mereça entrar na descrição clínica — ou ser reduzido de propósito, se você quiser a
tarefa mais "pura" de vigilância.

## 9. Pontos que limitam a progressão hoje

Levantados para a sua decisão, sem proposta ainda:

1. **A quantidade de pipas nunca muda** — são 8 do nível 1 ao 10.
2. **A velocidade não acumula entre níveis:** todo bloco recomeça em 1100 ms, mesmo no nível 10. Dos
   15 degraus, os mais rápidos (240–460 ms) só são alcançados dentro de um bloco muito bem-sucedido,
   e o ganho se perde no bloco seguinte.
3. **Seis dos oito pares variam pelo mesmo atributo** (tom de cor). A escada de discriminação é
   quase toda unidimensional.
4. **O par mais difícil chega no nível 6**, e dos níveis 7 ao 10 a discriminação da figura não
   aumenta — só o arranjo e o fundo.
5. **Não há distrator variável:** as 7 pipas não-alvo são sempre idênticas entre si. Uma variação
   controlada entre distratores aumentaria a carga de busca.
6. **A tolerância nunca aperta:** `precisa` (30%) existe no motor e nunca é usada.
7. **Não há intervalo variável nem tentativa sem alvo** — o alvo está presente em 100% das
   tentativas, o que difere do CPT clássico, em que a taxa de alvos é baixa e é justamente isso que
   produz a queda de vigilância ao longo do tempo.
