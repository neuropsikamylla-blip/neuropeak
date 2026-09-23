# Conferência das pranchas novas — Ordem da História

Pedido dela (23/set/2026): *"ordem da historia la coloquei novas lembra? então antes verifica se
tudo esta ok e tire o que esta duplicado"*.

## O que existe na pasta

`public/exercises/historias-novas/` guarda **165 pranchas de duas safras**:

| pasta | jun/2026 | set/2026 (novas dela) |
|---|---|---|
| faceis | 18 | **11** |
| media | 20 | **10** |
| dificil | 18 | **16** |
| muito-dificil | 22 | **10** |
| intruso | 20 | 0 |
| descubra | 20 | 0 |
| **total** | **118** | **47** |

## Achado 1 — as 118 de junho já foram consumidas (PROVADO por pixel)

Todas as pastas cortadas em `public/exercises/historias/` datam de 15/jun/2026, e o catálogo já
cadastra 126 histórias (20 f · 22 m · 22 d · 22 x · 20 i · 20 q).

Prova: um rastreador compara cada cena cortada contra as pranchas de junho, deslizando a cena sobre
a prancha e medindo o erro médio de pixel.

| cena | erro do 1º lugar | erro do 2º lugar | separação |
|---|---|---|---|
| f1/1.png | 10,00 | 46,59 | 4,7× |
| f1/3.png | 16,69 | 48,27 | 2,9× |
| f7/2.png | 17,27 | 41,70 | 2,4× |
| f15/1.png | 12,43 | 41,18 | 3,3× |

E `f1/1.png` e `f1/3.png` — duas cenas da MESMA história — apontam para a MESMA prancha. Isso não
acontece por acaso.

**Conclusão:** as 118 pranchas de junho são matéria-prima já cortada. O app usa as cenas; as
pranchas inteiras seguem no deploy sem função.

## Achado 2 — nenhuma duplicata de arquivo, nenhuma quase-exata

- `md5` das 165: **zero** grupos de conteúdo idêntico.
- Comparação todas-contra-todas por miniatura normalizada (125 pranchas de ordenar):
  distância mínima **0,335**, mediana **0,806**, máxima 1,082.

Não há salto entre o par mais próximo e o resto — o 0,335 é semelhança de estilo e paleta, não a
mesma história. **Repetição, se houver, é de tema, e só a leitura acha.**

## Achado 3 — a numeração impressa não segue uma regra única

| prancha | tema | numeração impressa | posição na folha | ordem correta |
|---|---|---|---|---|
| F01 | Caio dá banho no cachorro | 1,2,3,4 (em ordem) | igual à numeração | **2 → 1 → 4 → 3** ⚠️ |
| F02 | Sofia faz salada de frutas | 2,4,1,3 | embaralhada | 1 → 2 → 3 → 4 |
| F03 | Pedro guarda os brinquedos | 3,1,4,2 | embaralhada | 1 → 2 → 3 → 4 |
| F04 | Rafa empina uma pipa | 4,2,1,3 | embaralhada | 1 → 2 → 3 → 4 |
| F05 | Ícaro lava a bicicleta | 1,3,4,2 | embaralhada | 1 → 2 → 3 → 4 |

**O padrão das novas:** o número impresso É a ordem correta; o que está embaralhado é a POSIÇÃO do
quadro na folha. Cortar na ordem de leitura (esquerda→direita, cima→baixo) importaria gabarito
errado — é preciso cortar seguindo o número impresso.

⚠️ **F01 é a exceção** e precisa da decisão dela: a numeração está em ordem de leitura, mas a
narrativa não fecha (o quadro 1 é o cachorro já ensaboado; o 2 é a bacia ainda vazia com o shampoo
na mão). Pela continuidade — não se seca um cachorro ensaboado — a ordem é 2 → 1 → 4 → 3.

---

# A VARREDURA COMPLETA — o que o cruzamento achou

Método: recortar a faixa do enunciado das 165 pranchas e ler todas de uma vez; depois rastrear cada
história do catálogo de volta à prancha que a gerou, por correspondência de pixel.

O rastreamento se valida sozinho: **`d2` e `d8` caem na mesma prancha com erro IDÊNTICO (24,54)** —
e `d8` já era conhecida como duplicata de `d2`. O método reencontrou sozinho o que já sabíamos.

## 🔴 Achado grave — duplicatas DENTRO do catálogo em produção

As pranchas de junho repetiam enredos entre as pastas `dificil` e `muito-dificil`. Como todas foram
cortadas e cadastradas, **o catálogo carrega histórias repetidas desde junho** — só `d8` tinha sido
pega.

### Mesmo enredo, MESMO nível (o caso grave)

| par | enredo | situação |
|---|---|---|
| **x11 ↔ x20** | Enzo na feira de troca de livros | ✅ **corrigido nesta sessão** |

Verificado imagem a imagem: mesmo menino ruivo de camiseta listrada, mesma sacola, mesmo banner
"FEIRA DE TROCA DE LIVROS", as 8 cenas na mesma sequência. Duas gerações do mesmo roteiro, ambas
sorteáveis no mesmo nível. `x20` recebeu `duplicataDe: "x11"`.

### Mesmo enredo, níveis diferentes (decisão dela)

| par | enredo | cenas |
|---|---|---|
| f1 ↔ d1 | João planejando uma viagem | 4 × 6 |
| d3 ↔ x2 | Lucas na feira de ciências | 6 × 8 |
| d5 ↔ x3 | O cachorro da Sofia fugiu | 6 × 8 |
| d6 ↔ x4 | Maria quase queimou o bolo | 6 × 8 |
| d7 ↔ x8 | Clara faz um presente à mão | 6 × 8 |
| d9 ↔ x1 | A família vai acampar | 6 × 8 |
| d11 ↔ x7 | Gabriel no campeonato de futebol | 6 × 8 |
| d2 (↔ d8) ↔ x9 | A turma vai ao teatro | 6 × 8 — `d8` já fora |

**`d9` × `x1` conferido cena a cena:** lista → previsão do tempo → porta-malas → placa do camping →
montar a barraca → fogueira. `x1` é `d9` com duas cenas a mais no fim (estrelas, café da manhã). As
famílias são desenhadas diferente; o roteiro é o mesmo.

**Por que isso importa clinicamente:** quem já ordenou o enredo no nível difícil reconhece a
sequência no muito-difícil. A segunda exposição mede memória do enredo, não raciocínio sequencial —
e a acurácia sobe por um motivo que não é ganho de habilidade.

**Recomendação:** tirar do sorteio a versão de nível MAIS BAIXO (a `d`) e manter a `x`. Duas razões:
a `x` é o recurso mais escasso (nem todo paciente chega lá), e o nível difícil tem reposição farta —
ela trouxe 16 pranchas novas difíceis contra 10 muito-difíceis. **Não executado: a decisão é dela.**

## As 47 pranchas novas — 17 repetem enredo que já existe

| prancha nova | já existe como |
|---|---|
| Ícaro lava a bicicleta (fácil) | `m5` Miguel lava a bicicleta |
| Lia faz limonada (fácil) | `m18` Yasmin prepara limonada · `x10` empresa de limonada |
| Nina monta quebra-cabeça (fácil) | `m13` Luísa e o quebra-cabeça gigante |
| Rafa empina uma pipa (fácil) | `x21` Hugo e o avô fazem uma pipa |
| Bia aprende patins (média) | `x17` Lívia aprende patins |
| Hugo monta robô de sucata (média) | `x13` Noah monta robô de sucata |
| Sara faz um terrário (média) | `x22` Mei monta um terrário |
| Noah visita a biblioteca (média) | `x6` Pedro pega um livro na biblioteca |
| Mateo visita o planetário (difícil) | `x19` Caio visita o planetário |
| Noah monta casinha de passarinho (difícil) | `x14` Mila monta casinha para pássaros |
| Leo monta um aquário (difícil) | `x16` Ravi monta um aquário · `m9` Caio visita o aquário |
| Helena aprende a nadar (difícil) | `f17` Igor aprende a nadar |
| Camila faz vaso de cerâmica (difícil) | `f14` Helena na oficina de cerâmica |
| Ravi cuida de um gatinho (difícil) | `x12` Yasmin cuida de um gatinho resgatado |
| Gustavo monta teatro de fantoches (difícil) | `x18` a turma apresenta teatro de fantoches |
| A turma faz compostagem (difícil) | `m6` a turma faz reciclagem na escola |
| A turma faz feira de trocas (muito difícil) | `x11` Enzo na feira de troca de livros |

**Isso não é defeito automático.** Refazer "aprender a nadar" em nível difícil, com 6 cenas em vez
de 4, é conteúdo legítimo — desde que a versão antiga saia quando a nova entrar. O que não pode é
ficarem as duas.

**As 30 restantes são enredos inéditos** e entram sem conflito.

## A regra de corte das pranchas novas

Conferidas as 11 fáceis, quadro a quadro. O padrão é firme:

- **Números embaralhados na folha** → o número impresso É a ordem correta (F02 a F06).
- **Números em ordem de leitura 1,2,3,4** → o número é só rótulo; a ordem tem de ser deduzida
  (F01, F07 a F11).

| prancha | tema | ordem correta |
|---|---|---|
| F01 | Caio dá banho no cachorro | 2 → 1 → 4 → 3 |
| F02 | Sofia faz salada de frutas | 1 → 2 → 3 → 4 |
| F03 | Pedro guarda os brinquedos | 1 → 2 → 3 → 4 |
| F04 | Rafa empina uma pipa | 1 → 2 → 3 → 4 |
| F05 | Ícaro lava a bicicleta | 1 → 2 → 3 → 4 |
| F06 | Melissa monta torre de blocos | 1 → 2 → 3 → 4 |
| F07 | Bruno faz um sanduíche | 3 → 1 → 4 → 2 |
| F08 | Lia faz limonada | 2 → 4 → 1 → 3 |
| F09 | Marina faz avião de papel | 3 → 1 → 4 → 2 |
| F10 | Nina monta quebra-cabeça | 4 → 1 → 3 → 2 |
| F11 | Mateus faz castelo de areia | 3 → 2 → 4 → 1 |

✅ **F11 valida o método:** o achado anterior já registrava que no castelo de areia a ordem real é
3 → 2 → 4 → 1. Cheguei ao mesmo resultado sem consultar o registro.

**Faltam conferir as 36 pranchas de média, difícil e muito-difícil** — mesmo método, quadro a quadro.

## Sobre o peso

As **118 pranchas de junho (~330 MB)** são matéria-prima já cortada: o app usa as cenas, não as
pranchas. Sair de `public/` alivia o deploy sem tocar em exercício nenhum. Tratado na pendência do
peso — nada movido aqui, porque esses arquivos não estão no git e um erro de destino seria
irreversível.

---

# CONFERÊNCIA COMPLETA DAS INÉDITAS — 39 de 47 prontas para cortar

As 8 que faltam (D02 planetário, D05 casinha, D06 aquário, D07 nadar, D09 cerâmica, D10 gatinho,
D12 fantoches, X08 feira de trocas) **repetem enredo ainda no banco** e dependem da decisão dela.

## A regra de corte, por faixa

| faixa | quantas | numeração impressa |
|---|---|---|
| fáceis | 11 | ⚠️ **5 batem, 6 NÃO** — precisam de `ord` |
| médias | 10 | ✅ todas batem |
| difíceis | 9 inéditas | ✅ todas batem |
| muito-difíceis | 9 inéditas | ✅ todas batem |

**O problema está só nas fáceis.** Ali, quando os números saem em ordem de leitura (1,2,3,4), eles
são apenas rótulo e a ordem real é outra. Da média para cima, o número é o gabarito.

### As 6 fáceis que precisam de `ord`

| prancha | tema | ordem correta |
|---|---|---|
| F01 | Caio dá banho no cachorro | 2 → 1 → 4 → 3 |
| F07 | Bruno faz um sanduíche | 3 → 1 → 4 → 2 |
| F08 | Lia faz limonada | 2 → 4 → 1 → 3 |
| F09 | Marina faz avião de papel | 3 → 1 → 4 → 2 |
| F10 | Nina monta quebra-cabeça | 4 → 1 → 3 → 2 |
| F11 | Mateus faz castelo de areia | 3 → 2 → 4 → 1 |

## Lista das inéditas conferidas

**Médias (10, todas 1→5):** biscoitos decorados · biblioteca · patins · pizza caseira · museu dos
dinossauros · robô de sucata · piquenique no parque · padaria · trem de trilhos · terrário.

**Difíceis (9, todas 1→6):** cupcakes · skate · picolés de frutas · trilha ecológica · aula de judô ·
plantar morangos · pão caseiro · compostagem na escola · viveiro de borboletas.

**Muito-difíceis (9, todas 1→8):** bicicleta sem rodinhas · geleia de morango · teatro de sombras ·
torneio de xadrez · ponte de palitos · telescópio · almofada de estrela · carrinho a balão · sushi.

---

# 🔴 Problemas encontrados — 5 pranchas pedem atenção

## X05 — Ponte de palitos: continuidade quebrada

Cena 4: ponte em madeira natural. Cena 5: ponte **já com as diagonais coloridas**, sendo testada com
o carrinho. Cena 6: ela **pintando** a ponte.

A ponte ganha cor antes da cena que mostra a pintura. Um paciente atento pode — com razão — colocar
a 6 antes da 5. **Recomendação: refazer**, ou trocar a 5 por uma versão com a ponte ainda natural.

## X01 — Bicicleta sem rodinhas: três cenas quase iguais

As cenas 5, 6 e 7 mostram a mesma menina pedalando no mesmo cenário. O que muda é só a **expressão
facial** (tensa → sorrindo → relaxada de olhos fechados).

É o mesmo defeito que tirou `m1` do sorteio ("cenas 3 e 4 são as duas 'andando na chuva', sem pista
de qual vem antes"). Pior: exige leitura de expressão facial, que não é o que o exercício treina e
que parte dos pacientes não faz bem. **Recomendação: refazer as cenas 5-7** com marcos visíveis —
por exemplo, o pai cada vez mais longe ao fundo, ou a distância percorrida no caminho.

## D11 — Aula de judô: ordem por conhecimento, não por pista

Entre "cair no tatame" (4) e "treinar em dupla" (5) não há pista visual. Quem sabe como uma aula de
judô se estrutura acerta; quem não sabe, chuta. **Aceitável, mas é a mais fraca das difíceis.**

## X04 — Torneio de xadrez: três cenas de tabuleiro

As cenas 4, 5 e 6 são "jogando". Há pistas (a placa "1" na mesa da 4, o brilho da jogada decisiva na
6), mas são sutis. **Passa, com ressalva.**

## D15 — Compostagem: erro de português no enunciado

Está escrito **"Ajude us crianças"** — deveria ser **"as crianças"**. Precisa refazer só a faixa do
título, ou gerar de novo.

---

# ✅ A melhor da série: X06, telescópio

Vale registrar como modelo do que pedir. As cenas 5 e 6 são as duas "olhando no telescópio" — o tipo
de par que costuma dar ambiguidade. Mas a cena 7 mostra o caderno de anotações com **"A LUA"** e
**"SATURNO"** escritos nessa ordem: a própria prancha carrega a pista que resolve a sequência.

**É esse o padrão a pedir ao gerador:** quando duas cenas forem parecidas, que alguma terceira cena
registre qual veio antes.
