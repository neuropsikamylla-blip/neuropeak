# Lote 2 — conferência (23/set/2026)

22 pranchas em `public/exercises/historias-novas/PARA-CORTAR/`.

## ✅ O que está pronto (19 pranchas)

**Todas com a ordem de leitura (esquerda→direita, cima→baixo) já correta.** O formato novo resolveu
tudo de uma vez: **sem enunciado, sem plaquinhas motivacionais e sem número no quadro** — não há o
que apagar no corte, e o gabarito não vai junto.

### As 3 refeitas, com o defeito corrigido

| prancha | o defeito | como ficou |
|---|---|---|
| **bicicleta sem rodinhas** (8) | cenas 5-7 iguais, só a expressão mudava | o pai **segura → soltou e está atrás → sumiu do quadro** |
| **ponte de palitos** (8) | a ponte aparecia colorida antes da cena de pintar | a pintura foi retirada; a ponte fica natural o tempo todo |
| **compostagem** (6) | "Ajude us crianças" | sem texto nenhum na prancha |

### As 5 fáceis refeitas (4 cenas)
banho no cachorro · sanduíche · avião de papel · quebra-cabeça · castelo de areia

O **banho no cachorro** ficou inequívoco: o gerador pôs lama na primeira cena, então a sequência é
enlameado → molhado → ensaboado → seco.

### As 11 de reposição
pneu furado · pintar a parede · cadeira velha · massinha · cachecol de tricô · lavar a roupa ·
cabana de lençóis · joelho ralado (difícil, 6) · mudança de casa (muito difícil, 8) ·
**coelho** e **iogurte caseiro** (difícil, 6 — as duas substituições do feijão)

Destaques: a **cadeira** e a **parede** trazem a cena de meia-pintura, que é a pista mais forte que
existe. O **coelho** acrescenta um objeto por cena, e nenhum sai depois.

---

## 🔴 Três pendências

### 1. O coelho veio duplicado

`02_montar_espaco_seguro_para_coelho.png` e `Imagem do Codex ... 16_32_29.png` são a mesma prancha
em duas gerações. Distância medida: **0,147** — o par mais parecido entre pranchas distintas do lote
anterior era 0,335. **Basta apagar uma das duas.**

### 2. A limonada não veio

Das 6 fáceis pedidas, chegaram 5. Falta **"Lia faz limonada"** (fácil, 4 cenas):

1. Sobre a mesa: limões inteiros, jarra vazia, açucareiro e um copo vazio.
2. Espreme os limões no espremedor; o suco se acumula.
3. Mexe a jarra cheia com uma colher comprida.
4. Bebe o copo de limonada, a jarra cheia ao lado.

### 3. `02_arrumar_computador` tem ambiguidade — recomendo não usar

Dois pares de cenas quase idênticas:

- **cenas 1 e 4:** as duas mostram a tela escura com a roda de carregamento. O que muda é o
  enquadramento e a postura do menino, não o estado do mundo.
- **cenas 5 e 6:** as duas mostram a área de trabalho ligada e ele usando o computador.

É o mesmo defeito que tirou `m1` do sorteio e que a bicicleta acabou de corrigir. **A causa é o
enredo, não o desenho:** consertar um computador travado quase não produz estado visível — a tela
muda pouco e nada no mundo se transforma. Refazer provavelmente cairia no mesmo.

**Recomendação: descartar o enredo.** Se quiser um substituto difícil de 6 cenas com o mesmo espírito
doméstico, os que funcionam são os que deixam rastro físico.

### ⚠️ E uma decisão pendente: "arrumar o quarto" × `f3`

A fácil `Imagem do Codex ... 16_09_17-8.png` (arrumar o quarto: separar, guardar roupa, livros e
brinquedos, fazer a cama) se sobrepõe à **`f3`**, já no banco ("Pedro quer guardar os brinquedos" —
quarto bagunçado → recolhe → guarda na caixa → quarto limpo).

Mesmo cenário, mesma ideia. A nova é melhor (mais etapas distintas). **Sugiro: a nova entra e `f3`
sai** — mas é decisão dela.

---

# Informação em Foco — material COMPLETO ✅

| contexto | imagens | a spec pedia |
|---|---|---|
| cardápio | 4 | 2 |
| cinema | 4 | 2 |
| viagem | 4 | 2 |

**O dobro do necessário.** Nenhuma duplicata: a menor distância entre duas imagens do mesmo contexto
é 0,266 (cardápio), bem acima do limiar.

Conferidos o quadro de cinema e o painel de viagem contra a spec:

- **6 linhas** cada, como pedido;
- **cinco atributos** além do nome — cinema: horário, sala, duração, classificação, idioma; viagem:
  saída, duração, plataforma, companhia, preço;
- fundo escuro com letras claras, legível sem esforço;
- **nada de marca real**: "Cine Grandes Histórias", "Rota Azul", "Via Sul", "Litoral Mais" e os
  títulos dos filmes são todos inventados. Cidades reais, que a spec permite.

**Pronto para a implementação do C6.**
