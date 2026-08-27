# Tarefa: os 8 últimos arquivos ao palco (Lote F)

Projeto NeuroPeak. TypeScript strict, Tailwind 3, Vitest 4. Comentários em português.
**Não commite nada.** Quem revisa, aplica e commita é o Claude.

## Leia antes

- `docs/auditoria-layout/PADRAO-PALCO-SPEC.md`
- `components/exercises/ExerciseStage.tsx` — tem `background` e `backgroundClassName`.
- Exemplos aprovados: `attention/CacaItemBarato.tsx`, `memory/LetrasSequencia.tsx` (várias
  telas, um palco em cada), `processing/Semaforo.tsx` (fundo dinâmico).
- `lib/layout/palco.test.ts` — **não quebre nada.**

## Regra que decide caso a caso

Um container **`fixed inset-0` NÃO É defeito** — sai do fluxo, não soma altura ao wrapper, e
já é tela cheia por desenho. **Deixe como está.** Só migre containers com `min-h-screen`.

`InformacaoEmFoco.tsx:99` é `fixed inset-0` (um modal) — **não tocar**. As linhas 185, 340 e
356 são `min-h-screen` — essas sim.

## Parte 1 — os 6 diretos

| arquivo | largura | telas com `min-h-screen` | fundo |
|---|---|---|---|
| `attention/InformacaoEmFoco.tsx` | `amplo` | 185, 340, 356 | `s.bg` → `backgroundClassName` |
| `executive/CompraMultifuncional.tsx` | `amplo` | 557, 604 | `rootBg` → `background` |
| `executive/DesafioCidade.tsx` | `amplo` | 1 | `palRootBg(theme)` → `background` |
| `executive/EstacionamentoLogico.tsx` | `medio` | 581, 608, 703 | `#ECEAE4` nas duas primeiras; ver a terceira no código |
| `attention/Vigilancia.tsx` | `medio` | 1 | var `bg` → `backgroundClassName` |
| `social/InvestigadoresSociais.tsx` | `medio` | 228, 273 | `rootBg` → `background` |

Cada tela com `min-h-screen` ganha **seu próprio palco**, com a mesma largura. Remova do raiz
o que o palco faz (`min-h-screen`, `overflow-y-auto`, `mx-auto`, `flex items-center
justify-center`, padding de tela, `max-w-*` **de container**). `max-w-*` de elemento interno
fica. **Nenhuma cor muda.**

`Vigilancia` e `EstacionamentoLogico` medem o próprio elemento (`arenaRef.clientWidth`,
`wrapRef.offsetWidth`) — isso continua funcionando dentro do palco e **não deve ser mexido**.

## Parte 2 — os 2 que medem a JANELA (cuidado redobrado)

Estes calculam tamanho a partir de `window.innerWidth`. Dentro do palco a janela deixa de ser
a medida certa: o palco é mais estreito que ela, e o conteúdo passa a estourar.

### `attention/MOT.tsx` (palco `amplo`)

Linha ~99: `const availW = Math.min(MAX_W, window.innerWidth - PAD_X);`

`MAX_W` é 1440 e o palco amplo dá 1280 menos o padding — a arena passaria a estourar.
Troque a medida da LARGURA para o container real, que já existe como `contentRef`:

```ts
const availW = Math.min(MAX_W, contentRef.current?.clientWidth ?? window.innerWidth - PAD_X);
```

**A ALTURA continua vindo de `window.innerHeight`** — a arena precisa caber na tela, e essa
conta não muda. Não mexa no cálculo do `cromo`, em `ASPECT`, em `ARENA_SCALE_MIN`, na física,
nem no `hasMeasured`. **O sorteio da rodada 0 tem de continuar esperando a medição assentada**
(há teste travando isso; se ele falhar, você quebrou algo).

### `executive/Labirinto.tsx` (palco `amplo`)

Linha ~693: `const containerPx = Math.min(windowWidth - 24, 600);`

Troque `windowWidth` pela largura do container do palco (meça com um `ref` no elemento que
envolve o tabuleiro, como os outros exercícios fazem). **Mantenha o teto de 600** — mudar o
tamanho do labirinto é decisão dela, não desta tarefa.

## Teste

Estenda a lista de `"mantém os exercícios migrados centralizados no palco"` com os 8, cada um
com sua largura. **Some um teste para o MOT e o Labirinto** provando que a largura não vem
mais de `window.innerWidth` — e escreva-o de modo que ele falhe se alguém reintroduzir a
medição da janela na largura. Verifique isso antes de entregar.

## Prova de aceite

```
npx tsc --noEmit  ·  npm run test  ·  npm run build
```

Sem `node_modules` no clone, **diga isso**. Nunca reporte um comando como aprovado sem ter
visto a saída — na tarefa anterior isso aconteceu e um teste quebrado passou despercebido.

## Fora de escopo

`ExerciseWrapper.tsx` (o `min-h-screen` dele FICA — é o dono da altura); `focus-agents`,
`AntesDepois`, `OrdemHistoria`, `RestauranteOrdem`, `DesafioSupermercado` (todos `fixed
inset-0`, já corretos); e tudo que já foi migrado nos lotes A, D1 e E.
