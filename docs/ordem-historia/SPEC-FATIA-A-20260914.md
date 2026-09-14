# Ordem da História — FATIA A: o dado, os gabaritos e o embaralhamento

> Spec para o Codex. Decisões já tomadas pela Kamylla em 14/set/2026 e pelo VP.
> Base: `docs/ordem-historia/AUDITORIA-20260913.md` (leia antes de começar — ele mede o estado atual).
> **Você NÃO commita.** Deixe o trabalho no diff. Revisão, prova e commit são do VP.

## Contexto mínimo

`components/exercises/executive/OrdemHistoria.tsx` é um exercício de ordenação temporal.
O paciente recebe as cenas de uma história embaralhadas e as arrasta até a ordem certa.

**Hoje não existe gabarito no dado.** A ordem correta é implícita na numeração dos arquivos:
`/exercises/historias/<id>/1.png` é a 1ª cena, `2.png` a 2ª, e assim por diante. O cartão carrega
`{ id, order }`, onde `order` é o índice correto 0-based, e a imagem exibida é
`histPanelSrc(storyId, card.order + 1)`.

A correção compara `card.order === i` (posição no array) — **e isso está certo, não mexa nisso.**

## O que esta fatia entrega

Quatro coisas, nesta ordem. Nada além disso.

---

### 1. Campo de ordem no dado, e a correção de duas histórias

Duas histórias têm a numeração dos arquivos em desacordo com a narrativa das imagens. A decisão dela:
**corrigir por campo no dado, NUNCA renomeando arquivo** — renomear quebra o cache do navegador do
paciente e não deixa rastro no diff.

Em `data/historias.ts`, acrescente à interface `HistoriaDef` um campo **opcional**:

```ts
export interface HistoriaDef {
  id: string; diff: HistDiff; n: number; a: number;
  /** Ordem narrativa correta, quando difere da numeração dos arquivos.
   *  ord[k] = número do ARQUIVO (1-based) que deve ocupar a posição k (0-based).
   *  Ausente = a numeração dos arquivos já é a ordem certa (o caso das outras 84). */
  ord?: number[];
}
```

Aplique em **exatamente duas** histórias, com estes valores:

| id | história | `ord` | leitura |
|---|---|---|---|
| `f12` | cinema | `[1, 4, 2, 3]` | comprar ingresso → chegar ao cinema → comprar pipoca → assistir ao filme |
| `d20` | herbário | `[2, 6, 4, 1, 3, 5]` | colher folhas → separar na mesa → prensar → colar na cartolina → escrever os nomes → apresentar |

**Nenhuma outra história recebe `ord`.** Não invente correções: as outras 84 foram auditadas e a
numeração bate com a narrativa.

#### Como o componente passa a usar isso

O cartão ganha um terceiro campo, que é **só a imagem**:

```ts
interface Card {
  id: string;
  order: number;   // posição correta (0-based) — CONTINUA sendo o que a correção compara
  panel: number;   // número do ARQUIVO a exibir (1-based)
}
```

Na montagem da rodada, `panel` sai de `ord` quando existe, e da numeração natural quando não:
`panel = story.ord ? story.ord[k] : k + 1`, para cada posição correta `k`.

Troque `histPanelSrc(storyId, card.order + 1)` por `histPanelSrc(storyId, card.panel)` no
`<img>` do `SortableScene`. **O `preloadUrls` também precisa carregar os painéis certos** — hoje ele
pré-carrega `1..n`, que continua correto (o conjunto de arquivos é o mesmo), mas confira.

⚠️ **A comparação da correção NÃO muda:** continua `card.order === i`. Só a imagem que cada cartão
mostra passa a respeitar `ord`. Se você precisar alterar qualquer linha da correção, PARE e relate —
é sinal de que o desenho acima está errado.

#### Exporte uma função pura e testável

Em `data/historias.ts` (ou em `lib/` se lhe parecer melhor lugar — justifique), exporte:

```ts
/** Painéis na ordem narrativa correta. painelDaPosicao(story)[k] = arquivo da posição k. */
export function painelDaPosicao(story: { n: number; ord?: number[] }): number[];
```

Ela deve: devolver `[1..n]` quando não há `ord`; devolver `ord` quando há; e **validar** que `ord`
é uma permutação completa de `1..n` (sem repetição, sem buraco, comprimento certo) — se não for,
caia para `[1..n]` e não quebre a sessão do paciente.

---

### 2. `d8` sai do sorteio (é duplicata de `d2`)

A auditoria provou que `d2` e `d8` são **a mesma história** (passeio da escola ao teatro, seis cenas
idênticas). Duas entradas para o mesmo conteúdo dobram a chance de repetição percebida.

**Não apague os arquivos e não apague a entrada do banco.** Marque-a:

```ts
/** Conteúdo duplicado de outra história; fica no banco por histórico, fora do sorteio. */
duplicataDe?: string;
```

`d8` recebe `duplicataDe: "d2"`, e o sorteio de histórias passa a **ignorar toda história que tenha
`duplicataDe`**. Faça o filtro no ponto onde o pool é montado, não espalhado.

---

### 3. Embaralhamento que não se resolve com uma troca

A auditoria mediu (20.000 sorteios por tamanho): nas histórias de 4 cenas — justamente as iniciais —
**16,5% das partidas se resolvem trocando dois cartões de lugar**. A guarda atual só impede que a
primeira cena caia na primeira posição.

Ela pediu: *"A randomização deve produzir uma ordem realmente desorganizada, mas sem alterar a
resposta correta. Não quero randomização artificialmente impossível ou frustrante. Apenas garantir
variedade."*

**Critério fechado pelo VP — implemente exatamente este:**

Uma permutação inicial é **aceitável** quando exige **no mínimo 2 trocas** para ser resolvida.
O mínimo de trocas de uma permutação é `n - (número de ciclos)`. Isso exclui, de uma vez:
- a ordem já correta (0 trocas);
- qualquer transposição simples (1 troca) — que é a queixa dela.

Além disso:
- **não repetir a abertura anterior da mesma história**: guarde a última permutação sorteada por
  história e rejeite uma permutação idêntica a ela;
- limite de tentativas para não travar: sorteie até 40 vezes; se nada passar (não deve acontecer),
  use a última sorteada com no mínimo 2 trocas, e só em último caso a última sorteada.

**Extraia isso como função pura, fora do componente**, em `lib/ordem-historia/embaralhar.ts`:

```ts
/** Mínimo de trocas para levar `perm` à identidade. perm[i] = índice correto do cartão na posição i. */
export function minimoDeTrocas(perm: number[]): number;

/** Embaralha 0..n-1 garantindo minimoDeTrocas >= 2 e diferença da permutação anterior.
 *  `rng` injetável para o teste ser determinístico (default: Math.random). */
export function embaralharCenas(n: number, anterior?: number[], rng?: () => number): number[];
```

O componente passa a chamar `embaralharCenas`. **A função `shuffle` genérica continua existindo**
para os outros usos (opções A/B/C do "Descubra o que falta") — não a remova.

⚠️ O modo **"Encontre o Intruso"** usa 8 cartões em que um (`order === 7`) é a cena intrusa e **não
pertence à sequência**. Para ele, o critério de 2 trocas se aplica às **7 cenas da história**, não às
8. Se isso complicar demais, **mantenha o embaralhamento antigo no modo intruso** e aplique o novo
só no modo ordem — mas diga qual caminho tomou e por quê.

#### Testes obrigatórios desta parte

Crie `lib/ordem-historia/embaralhar.test.ts` com, no mínimo:

1. `minimoDeTrocas([0,1,2,3])` = 0; `minimoDeTrocas([1,0,2,3])` = 1; `minimoDeTrocas([1,2,0,3])` = 2;
   `minimoDeTrocas([3,2,1,0])` = 2 (dois ciclos de 2); `minimoDeTrocas([1,2,3,0])` = 3.
2. **Prova por volume, não por amostra:** para n = 4, 5, 6 e 8, rode `embaralharCenas` 5.000 vezes
   com um `rng` semeado (LCG determinístico escrito no próprio teste) e afirme que **em 100% das
   execuções** `minimoDeTrocas >= 2`. Este teste é o que prova a ausência do defeito — conte, não
   inspecione uma amostra.
3. O resultado é sempre uma permutação completa de `0..n-1` (nenhum índice perdido ou repetido).
4. Passando `anterior`, o retorno nunca é igual a `anterior` (rode 500 vezes).
5. A função **não altera** a resposta correta: ela devolve só a ORDEM de apresentação; a identidade
   de cada cena (`order`) não muda.

---

### 4. A linha técnica sai da interface

Seção 3 e 6 da espec dela, literal: *"Remover completamente essa linha da interface. Não quero
apresentar ao paciente: número do nível; quantidade de cenas; 'fácil', 'médio' ou 'difícil'."*

São **dois** lugares no `OrdemHistoria.tsx`:

- **`headerSub`** no modo ordem: hoje `` `Nível ${startLevel} · ${nPanels} cenas · ${DIFF_LABEL[tier]}` ``.
  No modo ordem, o subtítulo **desaparece** (não vire string vazia ocupando altura — não renderize o
  elemento). Nos modos intruso e falta, os subtítulos atuais permanecem: eles descrevem a tarefa, não
  o nível.
- **A tela de abertura** (`phase === "ready"`): a frase
  `` `Começa no nível ${startLevel} (${PANELS[tier]} cenas · ${DIFF_LABEL[tier]}) — onde parou.` ``
  some. No modo ordem, troque por uma frase sem número e sem rótulo — use exatamente:
  **"As cenas aparecem fora de ordem. Monte a história do começo ao fim."**
  A frase dos modos desbloqueados ("Você dominou a Ordem da História! Hora dos desafios.") fica.

`DIFF_LABEL` pode **continuar existindo** se ainda for usado internamente; se ficar órfão, remova-o
para não deixar lixo. `tier` e `startLevel` continuam existindo — eles governam a seleção de
histórias, só não aparecem mais na tela.

**Escreva um teste que prova a ausência**, em `lib/ordem-historia/interface.test.ts`: leia o arquivo
`components/exercises/executive/OrdemHistoria.tsx` como texto e afirme que ele **não contém** os
literais `"Nível "`, `" cenas · "`, `"Começa no nível"`, nem `DIFF_LABEL[tier]`. Teste de presença
não serve aqui: o defeito é a coisa aparecer, então a prova é a contagem de ocorrências ser zero.

---

## Fronteiras — o que esta fatia NÃO faz

Não comece nada disto. É a Fatia B, já especificada, e misturar impede a revisão:

- ❌ **segunda tentativa** depois do "Confirmar Ordem" (hoje não existe; será construída depois);
- ❌ arrastar pelo cartão inteiro, animações de drag, encaixe;
- ❌ tela de conclusão, layout do botão, estados do botão;
- ❌ tutorial de primeira utilização;
- ❌ classificação das 86 histórias por demanda cognitiva (é trabalho clínico, dela);
- ❌ qualquer alteração em `lib/adaptive.ts`, na barra de progresso ou no `metadata` da sessão;
- ❌ gerar, recortar, mover ou renomear **qualquer imagem**;
- ❌ tocar nos modos "Encontre o Intruso" e "Descubra o que falta" além do exigido no item 3.

## Regras da casa

- **Você não commita.** Nem `git add`. Deixe tudo no diff — o VP revisa linha a linha e commita.
- **Não instale nada.** Este clone não tem `node_modules`: `tsc`, `vitest` e `npm` **não rodam aqui**.
  Isso é limitação conhecida do ambiente, não falha sua. **Não finja ter rodado teste.** Se puder
  provar algo com `node` puro, prove e cole a saída literal. Se não puder, escreva "não consegui
  provar no lab" e siga. As provas são do VP, no repositório real.
- Interface 100% pt-BR, com acentuação correta. Identificadores em inglês ou português, seguindo o
  arquivo que você está editando.
- Comentário só onde explica um PORQUÊ que o código não conta sozinho. Não narre o óbvio.
- Se qualquer item acima divergir do que você encontrar no código, **PARE e relate** em vez de
  adivinhar. Relatar divergência é entrega bem-sucedida; adivinhar não.

## Critério de pronto

1. `data/historias.ts` com `ord` em `f12` e `d20`, `duplicataDe` em `d8`, e `painelDaPosicao` exportada.
2. `lib/ordem-historia/embaralhar.ts` + `embaralhar.test.ts` com a prova por volume (5.000 execuções).
3. `lib/ordem-historia/interface.test.ts` provando a ausência dos literais.
4. `OrdemHistoria.tsx` usando `panel` na imagem, `embaralharCenas` no sorteio, `d8` fora do pool, e
   sem a linha técnica nos dois lugares.
5. Um `RELATORIO-CODEX.md` na raiz do clone dizendo: o que fez, o que decidiu no ponto do intruso
   (item 3), o que **não** conseguiu provar, e qualquer divergência encontrada.
