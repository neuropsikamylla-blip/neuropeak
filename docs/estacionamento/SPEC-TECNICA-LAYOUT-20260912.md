# Spec técnica — layout do Estacionamento: área adaptativa, centralização e fundo dia/noite

> Deriva de `docs/estacionamento/ESPEC-LAYOUT-ESTACIONAMENTO-KAMYLLA-20260912.md`, que é a fonte da
> verdade e deve ser lida antes desta. Onde as duas divergirem, vale a dela.
>
> Decisão dela em 12/set, depois da análise: **layout adaptativo agora; as fases de grid maior são
> tarefa própria, depois.**

## 0. PROIBIDO — a fronteira desta tarefa

A instrução dela é explícita: *"Não alterar regras, lógica do jogo, movimentação dos carros,
colisões, geração dos desafios ou critérios de progressão."* Concretamente, **não tocar**:

1. `occupancy`, `canMove`, `isWin`, `slideRange`, as três funções de BFS e `commitMove`.
2. `lib/parking-levels.ts`, `lib/parking-cars.ts` e o banco de fases.
3. `useBlocoDeTreino`, a dosagem, a progressão (`stepDiff`, `pickLevel`, `orderedLevels`) e a
   `cellRule` dos níveis avançados.
4. O tutorial em si (passos, dicas, `tutorialHint`) — **exceto** a tela final "Tutorial concluído",
   que a seção 5 dela manda centralizar.
5. Cores, sombras, meio-fio, corredor de saída, imagens dos carros — a aparência das peças fica.

### 0.1 ⚠️ A armadilha central: `GRID` é lógica em 14 dos 20 usos

`const GRID = 6` (linha 50) é usado em **20 lugares**. A maioria é **lógica**: ocupação (71, 76),
limites de movimento (85, 87, 91, 94, 98), vitória (106), `slideRange` (117, 119, 121, 125, 127) e
contagem de movimento (530).

**Parametrizar `GRID` nesses lugares é violar a fronteira da seção 0.** Esta tarefa mexe **somente**
nos usos de LAYOUT: linhas **270** (`S = GRID * cellPx`), **314** e **320** (linhas da grade no SVG),
**369** (cálculo da célula), **376** (`boardInner`) e **564** (`cpx` do arrasto).

O desenho exigido:

```ts
// Lado do grid desta fase. Hoje TODAS as fases são 6×6 e este valor é 6 —
// o campo existe para o layout já nascer pronto para as fases de grid maior.
const gridDaFase = level.grid ?? GRID;
```

`Level` (em `types/parking.ts`) ganha `grid?: number`. Nenhuma fase do banco declara o campo, então
`gridDaFase === 6` em 100% das fases de hoje e **nada muda de comportamento**.

**Travessão obrigatório (teste):** enquanto a lógica usar `GRID` fixo, uma fase com grid diferente
quebraria o jogo silenciosamente. O teste deve **exigir que toda fase do banco tenha `grid`
ausente ou igual a 6**, com mensagem dizendo que a lógica precisa ser migrada antes. Esse teste é o
que avisa no dia em que alguém adicionar uma fase 8×8.

## 1. Tamanho da célula e da área jogável

### Estado atual, medido

```ts
const available = w - 24 - BORDER * 2 - CORRIDOR;          // só offsetWidth
setCellPx(Math.min(Math.max(Math.floor(available / GRID), 44), 70));
```

- célula travada entre **44 e 70 px** → área interna de **264 a 420 px**, e nada além;
- **a altura do viewport nunca entra na conta** — não há uma referência a `innerHeight` no arquivo,
  e ela pediu explicitamente *"aproveitar corretamente a altura disponível do viewport"*;
- o palco é `width="medio"` (960 px), então no desktop sobra mais da metade vazia.

### O que fazer — função PURA e testável

Em `lib/parking-layout.ts` (arquivo novo), para poder ser provada sem navegador:

```ts
export const CELL_IDEAL = 76;   // tamanho de conforto do carro; era 70 no teto antigo
export const CELL_MIN   = 34;   // piso: abaixo disto o carro fica pequeno para o dedo
export const BORDER     = 11;   // meio-fio (já existe no componente; passa a viver aqui)
export const CORRIDOR   = 26;   // corredor de saída, à direita do tabuleiro

export interface EspacoDisponivel { largura: number; altura: number; }

/**
 * Lado da célula, em px. A prioridade é a DELA, nesta ordem:
 *   1. a área cresce com o grid da fase;
 *   2. o carro preserva o tamanho visual (a célula fica em CELL_IDEAL sempre que couber);
 *   3. só encolhe — moderadamente, até CELL_MIN — quando o espaço não permite.
 */
export function tamanhoDaCelula(grid: number, espaco: EspacoDisponivel): number;

/** Medidas derivadas: nada de `transform: scale`, tudo largura e altura reais. */
export function medidasDoTabuleiro(grid: number, cellPx: number): {
  interno: number;        // grid * cellPx
  total: number;          // interno + BORDER * 2
  larguraComCorredor: number;  // total + CORRIDOR
};
```

Regras que `tamanhoDaCelula` tem de cumprir:

1. o resultado é **inteiro**, nunca acima de `CELL_IDEAL`, nunca abaixo de `CELL_MIN`;
2. considera **largura E altura**: `min((largura - BORDER*2 - CORRIDOR) / grid, (altura - BORDER*2) / grid)`;
3. com espaço de sobra devolve exatamente `CELL_IDEAL` — o carro não engorda porque a tela é grande;
4. com espaço apertado devolve o maior valor que **cabe**, e só bate no piso quando nem isso cabe;
5. é **monotônica não-crescente em `grid`**: grid maior, com o mesmo espaço, nunca devolve célula maior.

⚠️ **Consequência a declarar, não a esconder:** com o grid 6×6 de hoje a área vai de 420 px (teto
antigo) para **456 px** — ganho de 8,5%, modesto de propósito. Aumentar mais **engordaria o carro**,
contra a prioridade 2 dela. O salto de área que a spec dela descreve vem do **grid maior**, que é a
tarefa seguinte.

### Altura disponível

O componente precisa medir a altura que sobra para o tabuleiro: altura do viewport menos o que o
cromo ocupa (instrução, barra de progresso, banners de dica e da regra avançada, respiros). **Medir,
não supor** — o padrão já usado no MOT (`components/exercises/attention/MOT.tsx`), que mede o cromo
real com `getBoundingClientRect` e recalcula no `resize`. Copiar a abordagem, não o código.

## 2. Centralização (seção 4 dela)

### Os dois desalinhamentos, com causa identificada

1. **Tabuleiro 13 px à esquerda do centro.** Linha 745: `width: boardTotal + CORRIDOR`. O corredor de
   saída fica à direita e o conjunto inteiro é centralizado — então o **tabuleiro** sai do centro pela
   metade do corredor. Corrigir compensando o corredor, de modo que **o tabuleiro** (não o conjunto)
   fique centrado: um `paddingLeft: CORRIDOR` no container do par, ou margem simétrica equivalente.
   O corredor continua desenhado onde está; muda só o centro de referência.
2. A instrução usa `marginTop: 22` fixo e a barra tem `maxWidth: 320` com `paddingLeft/Right: 14`,
   enquanto o tabuleiro tem `paddingLeft/Right: 12` — três referências diferentes de largura no mesmo
   bloco.

### O que fazer

Um **wrapper único** (`flex flex-col items-center`, com `mx-auto`) contendo, nesta ordem: instrução →
barra de progresso → banners → tabuleiro. Sem `position: absolute` para posicionar elementos do
bloco. O bloco inteiro centraliza horizontalmente e usa a altura disponível, como ela desenhou:

```
             instrução
         barra de progresso

          [ ÁREA DO JOGO ]
```

`ExerciseStage` já faz `flex items-center justify-center` no eixo vertical, e **ele não deve ser
alterado** — é peça compartilhada por 35 exercícios.

## 3. Fundo dia/noite (seções 2 e 3 dela)

### Função pura, em `lib/parking-layout.ts`

```ts
export const DAY_START_HOUR = 6;     // 06:00 → dia
export const NIGHT_START_HOUR = 18;  // 18:00 → noite

export type PeriodoDoDia = "dia" | "noite";

/** Período a partir da hora local (0–23). Determinado uma vez, ao montar a tela —
 *  ela foi explícita: "não precisa atualizar continuamente a cada minuto". */
export function periodoDoDia(hora: number): PeriodoDoDia;
```

`hora` entra como parâmetro (não lido de dentro da função) justamente para ser testável sem mexer no
relógio do sistema. O componente chama `periodoDoDia(new Date().getHours())` **uma vez**, em estado
inicial — não em cada render, e sem timer.

### Arquivos

```ts
export const FUNDO_POR_PERIODO: Record<PeriodoDoDia, string> = {
  dia:   "/exercises/Carros/fundo-dia.webp",
  noite: "/exercises/Carros/fundo-noite.webp",
};
```

Os dois arquivos **já existem** (1400×933, WebP). ⚠️ **São provisórios, gerados a partir do
`parking-bg.jpg`**: o de dia é a foto atual convertida, e o de noite é a mesma foto com luminância
reduzida e viés frio. Servem para a mecânica do horário poder ser vista e provada; **a arte final é
dela e substitui os dois arquivos pelo mesmo nome.** Não alterar o `parking-bg.jpg`, que fica como
histórico.

### O véu por período — isto não é estética

O fundo hoje leva um gradiente escuro por cima, para os carros se destacarem:

```ts
const GAME_BACKGROUND = `#23262e linear-gradient(rgba(8,10,16,0.28), rgba(8,10,16,0.4)), url(...)`;
```

Num fundo de **noite**, esse mesmo véu escurece o que já é escuro e os carros perdem separação do
cenário. O véu passa a ser **por período**, em constante:

```ts
export const VEU_POR_PERIODO: Record<PeriodoDoDia, [string, string]> = {
  dia:   ["rgba(8,10,16,0.28)", "rgba(8,10,16,0.40)"],   // exatamente o de hoje
  noite: ["rgba(8,10,16,0.10)", "rgba(8,10,16,0.18)"],   // o fundo já é escuro
};
```

O valor do dia é **idêntico ao de hoje**, para que nada mude no cenário que ela conhece.

### Responsividade (seção 3 dela)

`background-size: cover`, `background-position: center`, `background-repeat: no-repeat` — os três
valores iguais nos dois períodos, e o fundo **não** determina o tamanho da área jogável. Ela pediu
atenção ao corte lateral no celular: usar `center` mantém o eixo do cenário, o que é o comportamento
correto para uma composição centrada.

## 4. Tela "Tutorial concluído" (seção 5 dela)

**Causa exata, linha 583:**

```tsx
<div className="w-full max-w-xs text-center">
```

`max-w-xs` limita a 320 px **sem `mx-auto`** — dentro de um palco de 960 px o bloco encosta na
esquerda. O `text-center` centraliza o texto *dentro* da caixa estreita, e é por isso que parece
"texto centralizado, tudo à esquerda".

O que fazer:

1. `mx-auto` no bloco (e subir o limite para algo como `max-w-sm`, que acomoda o texto sem esticar);
2. centralizar também no eixo vertical dentro da área disponível;
3. trocar o `background="#ECEAE4"` pelo **fundo do período**, como ela pediu — *"mantendo continuidade
   visual com o exercício"*. Com fundo fotográfico atrás, o texto precisa do mesmo tratamento de
   legibilidade que a instrução do jogo já tem (`textShadow`) ou de um cartão translúcido; escolher um
   dos dois e aplicar aos três elementos (título, texto, botão).

⚠️ A tela de **abertura** e a de **conclusão de fase** também usam `background="#ECEAE4"`. Ela não
pediu para mudá-las, então **ficam como estão** — a seção 5 fala só da tela final do tutorial.

## 5. Prova de aceite

Escrita antes da implementação, em `lib/parking-layout.test.ts`. Provar ausência, não só presença.

1. **`periodoDoDia`**: 0, 3, 5 → noite; 6, 12, 17 → dia; 18, 21, 23 → noite. As fronteiras derivadas
   das constantes, não de números soltos: mudar `NIGHT_START_HOUR` para 19 move o limite, e o teste
   deve continuar válido.
2. **`tamanhoDaCelula`**: devolve `CELL_IDEAL` com espaço de sobra; nunca passa de `CELL_IDEAL`; nunca
   cai abaixo de `CELL_MIN`; é inteiro; é monotônica não-crescente em `grid`; e para uma lista de
   viewports reais (320×568, 393×852, 768×1024, 1280×800, 1512×982) o tabuleiro resultante **cabe**
   em largura e altura — `medidasDoTabuleiro(...).larguraComCorredor <= largura` disponível.
3. **A área cresce com o grid**: com o mesmo espaço amplo, `medidasDoTabuleiro(7, …).interno >
   medidasDoTabuleiro(6, …).interno` e `8 > 7`. É o item 1 da spec dela, provado.
4. **O banco é todo 6×6** — o travessão da seção 0.1: toda fase de `PARKING_LEVELS` tem `grid`
   ausente ou 6, com mensagem explicando que a lógica usa `GRID` fixo.
5. **Nenhuma regressão de contagem**: `PARKING_LEVELS` continua com 10 níveis × 40 fases, e o máximo
   de carros por fase continua 10 — prova de que a geração não foi tocada.
6. **Prova de ausência no fonte** de `EstacionamentoLogico.tsx`:
   - nenhum `transform: scale` (ela proibiu explicitamente);
   - nenhum `max-w-xs` sem `mx-auto` na tela de tutorial concluído;
   - a lógica **não** usa `gridDaFase`: as funções `occupancy`, `canMove`, `isWin` e `slideRange`
     continuam referenciando `GRID` — se `gridDaFase` aparecer dentro delas, é violação da seção 0;
   - `#ECEAE4` não aparece mais na tela de tutorial concluído (passou a usar o fundo do período).
7. **Congelado**: `idealMoves` de uma amostra de fases, a `cellRule` (dificuldade ≥ 15) e o
   `EXIT_ROW` continuam com os mesmos valores.

## 6. Arquivos

- `lib/parking-layout.ts` — **novo**: constantes, `periodoDoDia`, `tamanhoDaCelula`,
  `medidasDoTabuleiro`, `FUNDO_POR_PERIODO`, `VEU_POR_PERIODO`.
- `lib/parking-layout.test.ts` — **novo**: a prova de aceite da seção 5.
- `types/parking.ts` — `Level` ganha `grid?: number`.
- `components/exercises/executive/EstacionamentoLogico.tsx` — consome o módulo novo; wrapper único
  centralizado; altura do viewport na conta; fundo e véu por período; tela de tutorial concluído.

## 7. Fora desta fatia, registrado

1. **Fases com grid maior** (7×7, 8×8, até ~20 carros) — é geração de desafio validada por BFS, com
   espec dela antes. É o que de fato entrega o *"fase muito complexa"* da spec dela.
2. **A arte final dos dois fundos**, que é dela; os arquivos de hoje são provisórios.
3. As telas de **abertura** e de **fase concluída** seguem com fundo sólido, porque ela não pediu.
