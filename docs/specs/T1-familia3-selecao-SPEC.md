# SPEC — Família 3: memorizar conjunto → selecionar (sem ordem)

> **Decisão arquitetural já tomada: NÃO criar fábrica nova.** A `criarTutorialSequenciaOrdenada` é
> ordem-dependente num único ponto — a comparação posicional da resposta. Um parâmetro resolve.
> Regras: `docs/T1-REGRAS-GLOBAIS.md` (as dez).

## 0. Inegociável — instrução dela, verbatim

Manter **exatamente** o framework aprovado. **NÃO alterar:** identidade visual · ritmo · transições ·
textos · cursor · demonstração completa · tentativa guiada · encerramento · botão "Ver tutorial
novamente" · regras de isolamento clínico.

**Adaptar apenas a mecânica específica** de cada exercício.

⛔ **NÃO** alterar mecânica clínica, progressão, dificuldade, pontuação ou métricas.
⛔ **NÃO** melhorar os exercícios. **NÃO** gravar tutorial fora do caminho único (regra 10).
⛔ **NÃO** criar segundo Runner/Pointer (regra 7). **NÃO** usar emoji.
⛔ **NÃO** liberar estímulo visual por tempo decorrido (regra 3).

## 1. A única mudança na fábrica

`lib/tutorial/definitions/sequencia-ordenada.tsx`, hoje:

```ts
const isCorrect = expected.every((value, index) => value === next[index]);
```

Acrescentar ao `FamiliaSequenciaConfig<T>` **um** parâmetro opcional:

```ts
/**
 * Como comparar a resposta dada com a esperada. O padrão é POSICIONAL — a resposta certa é a
 * mesma sequência, na mesma ordem. Famílias em que a resposta não tem ordem (seleção de um
 * conjunto) fornecem sua própria comparação.
 */
compararResposta?: (esperada: T[], dada: T[]) => boolean;
```

Com o padrão preservando **exatamente** o comportamento atual:

```ts
const comparar = config.compararResposta
  ?? ((esperada, dada) => esperada.every((valor, i) => valor === dada[i]));
```

⚠️ **As Famílias 1 e 2 não podem mudar em nada.** A suíte atual delas é a prova: se algum teste do
Span, das letras, dos itens, da matriz, do Corsi ou da rotação falhar, a mudança está errada.

## 2. Exercícios e mecânica medida

| exercício | fases | resposta |
|---|---|---|
| `desafio-supermercado` | — | `toggle` + `Set` — seleciona itens da lista |
| `lista-distracao` | `ready·memorize·distract·recall·feedback` | `includes` — recorda os itens da lista |
| `jogo-memoria` | `memorize·playing·feedback` | `includes` — vira duas cartas que formam par |
| `restaurante-ordem` | `ready·salao·update·bancada·feedback` | `Set` + `sort()` — seleciona os pedidos |

**Roteiro comum:** apresenta um conjunto → o paciente **seleciona** (sem ordem).

### 2.1 Comparações

- **supermercado, lista, restaurante:** conjunto igual, ordem irrelevante —
  `(esp, dada) => esp.length === dada.length && esp.every(i => dada.includes(i))`.
- **jogo-memoria:** a unidade de resposta é um **par**. A comparação ignora a esperada e verifica
  que as duas escolhas casam entre si. Documente isso no código — é o caso menos óbvio.

### 2.2 Demonstração

Já funciona: ela percorre `respostaEsperada` clicando cada item. Numa seleção sem ordem, isso é
"o cursor clica os itens corretos, um a um" — que é exatamente o que precisa ensinar.

⚠️ A ordem em que a demonstração clica é indiferente ao acerto, **mas deve parecer natural** — de
cima para baixo, esquerda para a direita, seguindo a leitura da tela.

## 3. Alvos e feedback de pressão

Cada superfície expõe `data-cell` (ou `data-choice`) e a prop opcional `pressedCell`/`pressedChoice`,
como as famílias anteriores. **Opcionais e sem efeito quando ausentes** — o treino não muda.

## 4. Textos (regras 1, 4 e 5)

| exercício | `guidedInstruction` |
|---|---|
| `desafio-supermercado` | Observe os produtos e clique nos que estavam na lista. |
| `lista-distracao` | Observe os itens e clique nos que você memorizou. |
| `jogo-memoria` | Clique em duas cartas para encontrar um par. |
| `restaurante-ordem` | Observe os pedidos e clique nos que foram feitos. |

Demonstração e encerramento usam os padrões do framework — não sobrescrever.

## 5. Registro

Acrescentar os quatro a `TUTORIAIS_POR_EXERCICIO` e ao teste que trava seu conteúdo (**12 no
total** depois deste lote).

## 6. Testes obrigatórios

1. `compararResposta` é opcional e o **padrão continua posicional** — teste direto da função.
2. Seleção sem ordem: a mesma resposta em ordem diferente é aceita.
3. Seleção sem ordem: conjunto errado é recusado, mesmo com o tamanho certo.
4. `jogo-memoria`: duas cartas do mesmo par acertam; de pares diferentes erram.
5. **Nenhuma fábrica nova** — os quatro usam `criarTutorialSequenciaOrdenada`.
6. As constantes de ritmo continuam **só** na fábrica.
7. `guidedInstruction` usa **clique** e não menciona teclado nem toque.
8. O registro cobre os 12 convertidos.
9. `gravacao-unica.test.ts` verde; regra 3 travada.
10. **Todos os testes das Famílias 1 e 2 continuam verdes** — prova de que nada mudou para elas.
11. Suíte inteira verde — **637/637 é o piso**.

## 7. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` ·
`lint` sem warning novo.

## 8. Se algo não couber

Registre em `docs/T1-INCOMPATIBILIDADES.md`, explique e **pare**. Não improvise.
