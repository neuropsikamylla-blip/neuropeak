# Spec — Grade Dedutiva, Fase 2: modelo lógico e solver

Data: 2026-09-02
Arquivos: **apenas novos**, em `lib/grade/`. **NÃO toque em nenhum componente**, em
`DeductiveGrid.tsx`, nem em qualquer outro exercício.
Fonte: `docs/grade-dedutiva/ESPEC-GRADE-DEDUTIVA-KAMYLLA-20260902.md` (dela, 103 seções) e
`docs/grade-dedutiva/AUDITORIA-GRADE-DEDUTIVA-2026-09-02.md` (o que existe hoje). **Leia os dois.**
Modelo de referência da casa: `lib/torres/` — banco pré-validado, solução provada, metadados por
problema, nada de geração sem validação. Mesma filosofia, outro solver.

---

## 0. O que esta fase entrega, e o que NÃO entrega

**Entrega:** a estrutura do puzzle, os 11 tipos de pista como regra computável, o solver com as
seis capacidades da seção 23 dela, e os testes 1–17 da seção 95.

**NÃO entrega:** interface, banco de problemas, instrumentação, motor adaptativo, relatório. São
as fases 3 a 7 dela, cada uma com fatia própria. **Não antecipe nenhuma.**

## 1. Por que este solver existe

Hoje não há solver: a validação é comparação com um gabarito escrito à mão, as pistas são strings
que o programa nunca lê, e **a unicidade das soluções nunca foi provada**. Tudo o que ela pede —
profundidade inferencial, poder restritivo, detecção de contradição, confirmação prematura —
depende de um motor que entenda as pistas como restrições.

## 2. Modelo

```ts
/** Uma categoria: "Pessoa", "Projeto", "Bebida"… Cada uma tem N valores, N = nº de posições. */
export interface Categoria { id: string; label: string; valores: string[]; }

/** A solução é a atribuição valor → posição, por categoria. */
export type Solucao = Record<string /*categoriaId*/, string[] /*valor na posição i*/>;

export interface Puzzle {
  id: string;
  titulo: string;
  contexto: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  posicoes: number;          // 4 ou 5
  categorias: Categoria[];   // 3 a 6
  pistas: Pista[];
  solucao: Solucao;
  metadata: PuzzleMetadata;
}
```

⚠️ **Invariante:** toda categoria tem exatamente `posicoes` valores, e cada valor ocupa exatamente
uma posição. É a exclusividade 1:1 da seção 31 dela — implícita, nunca precisa virar pista.

## 3. Os 11 tipos de pista (seção 18 dela)

Cada pista é `{ id, tipo, texto, ...operandos }`. `texto` é o que o paciente lê; o resto é o que o
solver executa. **A semântica abaixo é normativa — não improvise.**

Um "item" é o par `{ categoria, valor }`.

| tipo | significado | operandos |
|---|---|---|
| `T1` associação direta | A e B ocupam a MESMA posição | itemA, itemB |
| `T2` exclusão | A e B NÃO ocupam a mesma posição | itemA, itemB |
| `T3` posição absoluta | A está na posição p (1-based) | item, posicao |
| `T4` ordem relativa | pos(A) < pos(B) — "em algum lugar à esquerda" | itemA, itemB |
| `T5` adjacência | \|pos(A) − pos(B)\| = 1 — sem direção | itemA, itemB |
| `T6` direção + adjacência | pos(B) − pos(A) = 1 — "exatamente à esquerda de" | itemA, itemB |
| `T7` entre | pos(A) < pos(C) < pos(B), NESSA ORDEM | itemA, itemC, itemB |
| `T8` associação cruzada | idêntico a T1, mas entre categorias diferentes | itemA, itemB |
| `T9` condicional | SE A e B na mesma posição, ENTÃO C e D na mesma posição | itemA, itemB, itemC, itemD |
| `T10` alternativa exclusiva | exatamente UMA de duas associações é verdadeira | (itemA,itemB), (itemC,itemD) |
| `T11` relação composta | pos(A) < pos(B), com A e B de categorias quaisquer | itemA, itemB |

**Armadilhas que precisam estar certas:**
- `T4` e `T11` são "em algum lugar", **não** adjacente. `T6` é adjacente E direcionado.
- `T7` exige a ordem: A antes de C antes de B. Não é "entre" simétrico.
- `T5` nas pontas: quem está na posição 1 só tem vizinho à direita. **Teste isso** (teste 10 dela).
- `T9` é implicação, não bicondicional: se a premissa é falsa, a pista não diz nada.
- `T10` é XOR: as duas verdadeiras violam, as duas falsas também.

Arquitetura extensível: adicionar um `T12` depois não pode exigir reescrever o solver.

## 4. Solver — as seis capacidades (seção 23 dela)

```ts
export function validarPuzzle(p: Puzzle): string | null;        // erro descritivo ou null
export function encontrarSolucoes(p: Puzzle, limite?: number): Solucao[];
export function contarSolucoes(p: Puzzle, limite: number): number;
export function temSolucaoUnica(p: Puzzle): boolean;
export function admiteSolucao(p: Puzzle, parcial: MarcacaoParcial): boolean;
export function pistasEmConflito(p: Puzzle, parcial: MarcacaoParcial): string[];  // ids
```

`MarcacaoParcial` representa o estado do paciente: por célula (categoria × valor × posição), um de
`impossivel | hipotese | confirmado`. ⚠️ **Só `confirmado` e `impossivel` são restrições lógicas.
`hipotese` NUNCA restringe** — é exploração (seções 7-8 e 35 dela).

### 4.1 Arquitetura obrigatória: propagação, não enumeração

O espaço de busca foi **medido**: 5 posições × 6 categorias = (5!)⁵ ≈ 2,5×10¹⁰; enumerar levaria
**11 minutos** num teste 10–50× mais barato que o real. **Enumeração exaustiva está proibida.**

Use **matriz de possibilidades em bitmask**: para cada (categoria, valor) um inteiro de N bits com
as posições ainda possíveis. Propague até ponto fixo:
- **singleton** — sobrou uma posição para um valor → fixa, e elimina essa posição dos outros
  valores da mesma categoria;
- **hidden single** — uma posição só é possível para um valor da categoria → fixa;
- cada operador T1–T11 reduz as máscaras que puder;
- **transitividade cruzada** — se A e B estão na mesma posição, as máscaras de A e B são a mesma.

Só quando a propagação empacar, **backtracking com MRV** (escolher a variável de menor domínio).

`contarSolucoes(limite)` **aborta na segunda solução** — é o que torna a prova de unicidade barata.

## 5. Traço de derivação — calcular NA AUTORIA, não em runtime

Esta é a decisão que mais economiza no épico inteiro, e vem da auditoria.

Ao validar um puzzle, produza também o **traço**: para cada célula da solução, em que **nível de
propagação** ela ficou forçada e **quais pistas** foram usadas. Isso entrega de graça:
- **profundidade inferencial** por conclusão (seções 20-21 dela: 1, 2, 3, 4+ relações);
- **poder restritivo** de cada pista (seção 43: quantas possibilidades ela elimina no estado
  inicial);
- **classificação essencial / útil / redundante** (seção 68: remover a pista e ver se a unicidade
  sobrevive);
- e torna "confirmação prematura" (seção 34) uma comparação O(1) em runtime, em vez de rodar o
  solver a cada clique do paciente.

```ts
export interface TracoDerivacao {
  porCelula: Record<string, { profundidade: number; pistas: string[] }>;
  poderRestritivo: Record<string /*pistaId*/, number>;
  classificacao: Record<string /*pistaId*/, "essencial" | "util" | "redundante">;
  profundidadeMaxima: number;
  distribuicaoProfundidade: Record<string, number>;
}
export function derivar(p: Puzzle): TracoDerivacao;
```

**"Essencial"** define-se assim: remover a pista faz o puzzle deixar de ter solução única.

## 6. Fora do escopo desta fase, de propósito

**MUS (conjunto mínimo de contradição, seção 33).** Ela própria autorizou adiar: *"se MUS completo
for desproporcional para a primeira versão: implementar inicialmente detecção segura de
inconsistência e conjunto de pistas relevantes, e deixar minimização exata para uma segunda
etapa"*. Nesta fase, `pistasEmConflito` devolve o conjunto **relevante** (as pistas que tocam as
células da contradição), não o mínimo. **Deixe isso explícito no JSDoc da função**, para ninguém
achar que é mínimo.

## 7. Testes obrigatórios — os 17 da seção 95 dela

```
1. puzzle com 0 soluções → validarPuzzle rejeita
2. puzzle com 2+ soluções → temSolucaoUnica false
3. solução única → aceita
4. T1 associação direta      5. T2 exclusão            6. T3 posição absoluta
7. T4 ordem relativa         8. esquerda/direita       9. T5 adjacência
10. T5 nas PONTAS           11. T6 exatamente à esq./dir.  12. T7 entre
13. T7 com ordem            14. T8 associação cruzada  15. T9 condicional
16. T10 alternativa exclusiva  17. exclusividade 1:1
```

Além deles, prove:
- **desempenho:** um puzzle 5 posições × 5 categorias com 15 pistas resolve em **menos de 200 ms**.
  Meça e registre o número — se estourar, a arquitetura está errada e é para PARAR e relatar, não
  para afrouxar o teste;
- **`hipotese` não restringe:** o mesmo estado marcado como hipótese e como confirmado dá
  resultados diferentes em `admiteSolucao` — é a distinção mais importante da espec dela;
- **traço:** num puzzle onde uma conclusão exige duas pistas, `profundidade` é 2, e não 1;
- por **contagem**, não por caso único: percorra uma lista de puzzles e conte quantos passam em
  cada critério.

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # base: 62 arquivos / 861 testes
```
**NÃO rodar `npm run build`** — o dev server dela pode estar no ar na porta 3000.

## 8. Relatório

A representação escolhida e por quê; quais regras de propagação implementou; o tempo medido do
puzzle 5×5; onde a espec dela esbarrou em ambiguidade e que decisão você tomou; e o que ficou
para as fases seguintes.
