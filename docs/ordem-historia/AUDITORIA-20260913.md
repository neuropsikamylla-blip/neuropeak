# Auditoria — "Ordem da História", antes de tocar em qualquer coisa

> Resposta à seção 1 da espec dela (`ESPEC-REVISAO-KAMYLLA-20260913.md`), feita em 13/set/2026.
> **Nenhuma linha de código ou de dado foi alterada.** Tudo aqui é medida.
>
> Arquivos auditados: `components/exercises/executive/OrdemHistoria.tsx` (595 linhas),
> `data/historias.ts` (152), `lib/adaptive.ts` (`calculateStoryTrailProgression`),
> `lib/story-trail-report.ts`, e as **486 imagens** de `public/exercises/historias/`.

---

## 0. As três descobertas que mudam a leitura da espec

**Antes de qualquer detalhe, três coisas que o pedido dela pressupõe e o código não sustenta:**

1. **Não existe `correctOrder` em lugar nenhum.** A estrutura de uma história é
   `{ id, diff, n, a }` — nada de gabarito. A ordem correta é **implícita na numeração dos
   arquivos**: `1.png` é a primeira cena, `2.png` a segunda, e assim por diante. Isso significa que
   "corrigir um gabarito" = **renomear arquivos** ou introduzir um campo de ordem que hoje não existe.
2. **Não existe segunda tentativa no modo "Ordem da História".** O paciente confirma uma vez, vê o
   feedback por 1,9 s (acerto) ou 3,2 s (erro), e o exercício **avança para outra história**. As
   seções 9 a 12 da espec descrevem um fluxo de retentativa que **não está implementado**. O
   `MAX_ATTEMPTS = 3` existe, mas só vale para o desafio "Descubra o que falta".
3. **Dois gabaritos estão errados, e um deles é exatamente o que ela apontou.** Ver seção 3.

---

## 1. Inventário do banco

### 1.1 Histórias de ordenação — 86 no total

| faixa interna | ids | quantas | cenas por história | arquivos |
|---|---|---|---|---|
| `faceis` | `f1`–`f20` | **20** | 4 | `1.png`–`4.png` |
| `media` | `m1`–`m22` | **22** | 5 | `1.png`–`5.png` |
| `dificil` | `d1`–`d22` | **22** | 6 | `1.png`–`6.png` |
| `muito-dificil` | `x1`–`x22` | **22** | 8 | `1.png`–`8.png` |

O `n` declarado em `data/historias.ts` **bate com os arquivos em disco** em todas as 86 (conferido
arquivo por arquivo). O campo `a` é a proporção da imagem, usada para o cartão não distorcer.

### 1.2 Os outros dois modos

- **Encontre o Intruso** — `HISTORIAS_INTRUSO`, **20** histórias, campo `intruder`;
- **Descubra o que falta** — `HISTORIAS_DESCUBRA`, **20** histórias, 7 cenas fixas + 3 opções, com o
  campo `correct` apontando a opção certa.

### 1.3 Como a cena é identificada

```ts
interface Card { id: string; order: number; }   // order = índice correto (0-based)
// a imagem exibida é histPanelSrc(storyId, card.order + 1)
```

**`order` é a identidade da cena** (qual painel ela é) e não muda quando o cartão se move. O número
que aparece no canto do cartão **não é a cena: é a posição** (`posNum`, 1-based, calculado pela ordem
atual do array).

---

## 2. A correção está certa — e isto era o principal a verificar

A pergunta dela era se a correção compara **cena escolhida + posição atual** com a **posição correta
daquela cena**, sem confundir id, índice de array e número visual.

```ts
// no cartão:
const correctPos = posNum != null && card.order === posNum - 1;
// no envio:
const posCorrect = cards.filter((c, i) => c.order === i).length;
```

**Compara exatamente o que deveria.** `card.order` é a cena, `i` é a posição no array, e `posNum - 1`
é a mesma posição em base 0. Não há uso do `id` (`"c0"`, `"c1"`…) em nenhuma comparação, e o número
desenhado no cartão é derivado da posição, nunca da cena.

✅ **Conclusão: o motor de correção não tem defeito.** O erro que ela viu no cinema vem do **dado**.

---

## 3. Gabaritos inconsistentes — varredura das 86 histórias

Todas as 486 imagens foram inspecionadas visualmente, em mosaicos por faixa.

### 3.1 🔴 `f12` — a história do cinema. É o caso que ela relatou.

| arquivo | o que mostra |
|---|---|
| `1.png` | comprando o ingresso na bilheteria (placa "INGRESSOS", atendente entregando) |
| `2.png` | comprando pipoca no balcão ("PIPOCA · COMBO · SUCO") |
| `3.png` | assistindo ao filme na sala escura, com pipoca no colo |
| `4.png` | **pai e filho na calçada, diante da fachada iluminada "CINEMA", o menino erguendo o ingresso INTACTO** |

**O gabarito vigente é 1 → 2 → 3 → 4**, o que coloca *estar na porta do cinema com o ingresso na mão*
**depois** de assistir ao filme.

A leitura dela — ingresso → chegar ao cinema → pipoca → filme — corresponde a **1 → 4 → 2 → 3**. Ao
montar assim, só o primeiro cartão cai na posição que o gabarito considera certa; os outros três ficam
laranja. **É exatamente o "feedback parcial de erro" que ela descreveu.**

⚠️ **Como ela pediu, não afirmo que o gabarito está errado sem registrar a leitura alternativa:**
`4.png` poderia ser "saindo do cinema, guardando o ingresso de lembrança". Contra essa leitura pesam
duas evidências da própria imagem: **o ingresso está inteiro, não picotado**, e a expressão e a
iluminação são de chegada. **A leitura dela é a mais provável, mas a decisão é dela.**

### 3.2 🔴 `d20` — o herbário. Gabarito inconsistente, e este não é ambíguo.

| arquivo | o que mostra |
|---|---|
| `1.png` | colando folhas na cartolina, com cola ao lado — **montagem** |
| `2.png` | **colhendo folhas no parque, com cesta** — o início óbvio |
| `3.png` | escrevendo os nomes ("FOLHA DE IPÊ", "DE JATOBÁ"…) — etiquetagem |
| `4.png` | prensando as folhas numa prensa de madeira |
| `5.png` | apresentando "MEU HERBÁRIO" à turma — o fim óbvio |
| `6.png` | **separando as folhas na mesa, com a cesta da colheita ao lado** |

O gabarito vigente (1→6) começa pela **montagem** e termina pela **separação das folhas recém
colhidas**. A sequência coerente seria algo como **2 → 6 → 4 → 1 → 3 → 5**.

### 3.3 ⚠️ `d6` e `x4` — o bolo. Duas leituras, nenhuma alteração automática.

Nas duas, a narrativa mostra o bolo **queimando** (fumaça, forma escura) e, na cena final, **a família
comendo bolo**. Ou o bolo escuro é de chocolate e nunca queimou, ou houve um segundo bolo que a
história não mostra. **Sinalizo sem propor mudança** — depende de ler as imagens como ela as
concebeu.

### 3.4 🔴 `d2` e `d8` são a MESMA história

Seis cenas idênticas (passeio da escola ao teatro: aviso no mural → autorização assinada → ônibus →
fachada do teatro → a peça → comentando na saída). São duas entradas no banco para o mesmo conteúdo,
o que dobra a chance de repetição percebida dentro da mesma faixa.

### 3.5 ⚠️ Famílias repetidas entre faixas

Seis narrativas aparecem em mais de um tamanho: viagem (`f1`/`d1`/`x1`), vulcão (`d3`/`x2`), cachorro
perdido (`d5`/`x3`), bolo (`d6`/`x4`), porta-retrato (`d7`/`x8`), futebol (`d11`/`x7`) e teatro
(`d2`=`d8`/`x9`). Não é erro — é a mesma história contada com mais etapas —, **mas o paciente que
progredir vai reencontrar enredos que já conhece**, o que reduz a demanda de inferência que ela quer
na seção 4.

### 3.6 ✅ As outras 78 histórias

Numeração **coerente com a narrativa** em todas. Nenhuma outra inconsistência estrutural encontrada.

---

## 4. Randomização (seção 8 dela) — medida, 20.000 sorteios por tamanho

O embaralhamento é Fisher-Yates com uma única guarda: repete enquanto o **primeiro** cartão for a cena
1 (até 12 tentativas).

| cenas | já vem correta | **1 troca resolve** | 2 trocas | 3+ | cenas já no lugar (média) |
|---|---|---|---|---|---|
| 4 | **0,0%** | **16,5%** | 50,1% | 33,5% | 0,66 |
| 5 | 0,0% | 4,3% | 25,6% | 70,1% | 0,75 |
| 6 | 0,0% | 0,8% | 8,6% | 90,6% | 0,81 |
| 8 | 0,0% | 0,0% | 0,4% | 99,6% | 0,86 |

- ✅ **"História aparecer já correta por acaso" não acontece** — a guarda existente resolve.
- 🔴 **"Resolvido por uma troca óbvia de duas cenas"**: acontece em **1 de cada 6** partidas nas
  histórias de 4 cenas, que são justamente as iniciais. A queixa dela está quantificada.
- ⚠️ **"Duas execuções consecutivas começarem praticamente iguais"**: não há nenhuma memória da ordem
  sorteada anteriormente — cada partida sorteia do zero, então nada impede duas aberturas parecidas.

---

## 5. Progressão, persistência e barra

- **Nível:** vem de fora, no `difficulty` (1–12), calculado server-side por
  `calculateStoryTrailProgression` em `lib/adaptive.ts`. ✅ **Já é a infraestrutura global** que a
  seção 15 dela pede para reutilizar — não há sistema isolado aqui.
- **Regra vigente** (nível ≤ 9): `< 45%` desce 2 · `< 65%` desce 1 · `≥ 85%` sobe 1 · entre 65 e 85
  mantém. Nos níveis 10 e 11, `≥ 80%` desbloqueia Intruso e Descubra.
- **Nível → faixa de história:** 1–2 = 4 cenas · 3–5 = 5 · 6–8 = 6 · 9–10 = 8 · 11 = Intruso ·
  12 = Descubra.
- **Barra:** `useBlocoDeTreino("ordem-historia", difficulty)` → `ExerciseProgressBar`. ✅ É a barra
  **global por tempo** da plataforma, sem porcentagem — idêntica aos outros 34.
- **Acurácia registrada:** `posCorrect / n` por rodada — proporção de cenas na posição certa.
- **Não repetir histórias recentes:** existe (`recentRef`, 60 ids), ⚠️ mas vive num `useRef` —
  **perde tudo ao recarregar a página ou ao abrir a próxima sessão**. Não há `localStorage` nem
  gravação no banco, diferente do Estacionamento (que usa `np-parking-recent`).

---

## 6. Registro de tentativas, erros e acertos

Já gravados hoje, no metadata da sessão: `posCorrect`/`posWrong` acumulados, `swaps` (número de
arrastes), `intruderHits`, `faltaHits`, `hintsUsed`, `retries`, tempo por rodada (`rts`) e **tempo até
a primeira interação** (`firstResp`).

⚠️ **O que a seção 10 dela pede e NÃO existe:** a distinção entre "resolveu de primeira" e "resolveu
após feedback" — porque, como dito em 0.2, **não há segunda tentativa no modo ordem**. `retries` e
`attempts` só se movem nos modos Intruso e Descubra.

---

## 7. Interface — o que a espec pede e onde está no código

| seção | item | estado hoje |
|---|---|---|
| 3 | linha `Nível 1 · 4 cenas · fácil` | **existe**, montada na linha 463; e também na tela de abertura (450) |
| 6 | rótulo fácil/média/difícil | `DIFF_LABEL`, usado nos dois lugares acima |
| 7 | arrastar pelo cartão inteiro | ✅ **já funciona** — ver a correção de 14/set abaixo. O `⠿` é decorativo, e é ELE que engana |
| 7 | toque no celular | `TouchSensor` com `delay: 160ms`, `tolerance: 8` |
| 17 | layout | grade central `margin: 0 auto`; o botão fica depois dos cartões, no fluxo |
| 19 | instrução | já é curta: *"Arraste as cenas para a ordem certa — do começo ao fim."* |
| 20 | tutorial | 🔴 a tela de abertura (`phase === "ready"`) aparece **em toda sessão**. O exercício **não usa** o gate `/api/exercise-tutorial` que o projeto já tem e que outros exercícios usam |

---

## 8. O que falta no banco para a progressão da seção 4

Ela pediu, se o banco não bastar, o número de histórias faltantes. **O banco basta em quantidade** —
86 histórias para 4 faixas. O que falta **não é volume, é classificação**:

1. **Não há nenhum dado de demanda cognitiva.** A única variável que define dificuldade hoje é o
   **número de cenas**. Nenhum dos dez critérios da seção 4 (proximidade semântica, clareza do
   desfecho, causalidade a inferir, semelhança entre cenas consecutivas…) existe como campo.
2. **Não há o tipo de raciocínio da seção 14** (procedural, temporal, causal, objetivo/desfecho).
3. As **famílias repetidas** (3.5) e a **duplicata `d2`/`d8`** (3.4) reduzem a variedade real.

Uma classificação das 86 por demanda cognitiva e por tipo é trabalho de **conteúdo clínico**, não de
código — e é dela, ou de quem ela indicar. O código pode receber os campos assim que existirem.

---

## 9. Perguntas que preciso que ela responda antes de eu implementar

Ela pediu explicitamente para não decidir sozinho em três pontos. São estes:

1. **`f12` (cinema) e `d20` (herbário):** confirmo a releitura das cenas e corrijo a ordem? A correção
   exige **renomear arquivos** ou criar um campo de ordem no dado — e eu recomendo o campo, porque
   renomear quebra qualquer cache do navegador do paciente e não deixa rastro do que mudou.
2. **Segunda tentativa (seções 9–12):** hoje **não existe**. Construir o fluxo de retentativa é uma
   mudança de mecânica, não um ajuste. Confirmo que é para construir?
3. **Travar os cartões já corretos** durante a segunda tentativa (seção 11): ela pediu para ser
   avisada antes, e aviso — **isso muda a demanda da tarefa**. Com os corretos travados, a segunda
   tentativa vira um problema menor e mais fácil; sem travar, ela exige revisar tudo de novo.


---

## ⚠️ CORREÇÃO DESTA AUDITORIA — 14/set/2026

**A linha da seção 7 da tabela acima estava errada, e o VP a corrigiu depois de reler o código.**

O que eu havia escrito: *"o `listeners` do dnd-kit fica só na alça de pontinhos; o resto do cartão
não arrasta"*. **É falso.** Em `components/exercises/executive/OrdemHistoria.tsx:127`, os listeners
são aplicados ao **container inteiro do cartão**:

```tsx
<div ref={setNodeRef} style={style} {...attributes} {...(phase === "playing" ? listeners : {})}>
```

E o `⠿` da linha 165 é um `<span aria-hidden>` **sem listener nenhum** — é desenho, não alça.

**Consequência para a espec dela:** o pedido da seção 7 (*"não depender exclusivamente daquele
pequeno ícone de pontinhos; o cartão inteiro deve poder ser usado para movimentação"*) **já está
atendido na mecânica**. O problema é de **comunicação visual**: o ícone de alça comunica ao paciente
que só ali se arrasta, quando o cartão todo arrasta. O conserto, portanto, não é mexer no dnd-kit —
é resolver o que o ícone diz e melhorar o retorno visual do arraste (as outras alíneas da seção 7,
que continuam pendentes de verdade: o cartão subir ao ser segurado, o destino ficar evidente, o
encaixe ao soltar).

**Como o erro passou:** a auditoria leu o `⠿` como alça por ele parecer uma, em vez de conferir onde
os listeners estavam ligados. Medida e leitura não são a mesma coisa — e só a medida vale.
