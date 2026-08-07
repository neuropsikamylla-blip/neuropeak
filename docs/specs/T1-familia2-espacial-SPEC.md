# SPEC — Família 2: sequência espacial → reproduzir tocando

> Família **NOVA**. Converter os quatro e parar para ela validar **`matriz-espacial`** como
> representante. Regras: `docs/T1-REGRAS-GLOBAIS.md` (as dez).

## 0. Inegociável

⛔ **NÃO** alterar mecânica clínica, progressão, dificuldade, pontuação ou métricas.
⛔ **NÃO** melhorar os exercícios — só preparação, demonstração e guiada.
⛔ **NÃO** gravar tutorial fora do caminho único (regra 10).
⛔ **NÃO** criar um segundo Runner ou Pointer (regra 7). **NÃO** usar emoji.
⛔ **NÃO** liberar estímulo visual por tempo decorrido (regra 3, corrigida em 07/ago).

## 1. Exercícios e mecânica medida

| exercício | fases | resposta |
|---|---|---|
| `matriz-espacial` | `showing·recall·feedback` | `handleCellClick(idx)` na grade |
| `matriz-espacial-inversa` | delega (25 linhas) | mesma grade, ordem invertida |
| `cubo-corsi` | `tutorial·watch·input·result·between` | clique em cubo 3D |
| `padroes-rotacao` | `tutorial·ready·show·rotating·delay·input·feedback` | grade, resposta **rotacionada** |

**Roteiro comum:** posições acendem em sequência → o paciente reproduz tocando.
**Difere da Família 1** por não haver painel fixo: o alvo é a própria grade.

## 2. Fábrica única — `lib/tutorial/definitions/sequencia-espacial.tsx`

Uma só para os quatro. Reusar ao máximo `criarTutorialSequenciaOrdenada`: se a fábrica da Família 1
já servir com outro `Board` e outro `targetSelectorFor`, **use-a** em vez de criar outra. Só crie
uma fábrica nova se a apresentação espacial exigir algo que a existente não expresse — e, nesse
caso, extraia o que for comum, sem duplicar ritmo, gesto ou cursor.

### 2.1 Transformação da resposta

`matriz-espacial-inversa` responde na ordem invertida e `padroes-rotacao` responde na posição
rotacionada. Ambas são **transformações da resposta esperada**, como o `reverse` do Span:
parametrize com uma função `transformarResposta(sequencia) => sequencia`, em vez de um booleano por
caso. A demonstração deve clicar **na resposta transformada** — é justamente o que ela precisa
ensinar.

⚠️ A rotação usada pela demonstração tem de ser a **mesma** que o exercício aplica. Importe-a do
componente; não reimplemente.

### 2.2 Alvos

Cada grade expõe `data-cell="<índice>"` (ou equivalente) para o `DemoPointer` localizar, e uma prop
opcional `pressedCell` que reproduz por código o mesmo feedback do toque real. **Opcionais e sem
efeito quando ausentes** — o treino não muda.

⚠️ `cubo-corsi` é 3D: confirme que `getBoundingClientRect` devolve a posição correta do cubo em
perspectiva. Se o cursor não puder apontar com precisão, **registre em
`docs/T1-INCOMPATIBILIDADES.md` e pare** — não invente aproximação.

## 3. Textos (regras 1, 4 e 5)

| exercício | `guidedInstruction` |
|---|---|
| `matriz-espacial` | Observe as posições e clique nelas na mesma ordem. |
| `matriz-espacial-inversa` | Observe as posições e clique nelas na ordem inversa. |
| `cubo-corsi` | Observe os cubos e clique neles na mesma ordem. |
| `padroes-rotacao` | Observe o padrão e clique nas posições após a rotação. |

Demonstração e encerramento usam os padrões do framework — não sobrescrever.

## 4. Registro

Acrescentar os quatro a `TUTORIAIS_POR_EXERCICIO` e ao teste que trava seu conteúdo.

## 5. Testes obrigatórios

1. Uma fábrica só para os quatro; nenhum tem componente de tutorial próprio.
2. As constantes de ritmo continuam **só** na fábrica — zero duplicação.
3. A transformação da resposta é parametrizada, não copiada por exercício.
4. A demonstração clica na resposta **transformada** (invertida / rotacionada).
5. As grades aceitam `pressedCell` opcional e emitem `data-cell`; sem as props, o treino renderiza
   como antes.
6. `guidedInstruction` de cada um usa **clique** e não menciona teclado nem toque.
7. O registro cobre os 8 convertidos até aqui.
8. `gravacao-unica.test.ts` verde.
9. A regra 3 continua travada: nenhum `announce` dentro de `setTimeout`.
10. Suíte inteira verde — **626/626 é o piso**.

## 6. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` ·
`lint` sem warning novo.
