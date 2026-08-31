# Spec — Jogo das Torres: botão Reiniciar, 2 por puzzle

Data: 2026-08-31
Arquivo ÚNICO: `components/exercises/executive/TorreHanoi.tsx`
Origem: pedido dela em 31/ago/2026.

---

## 1. O pedido, nas palavras dela

> *"acho que podemos colocar reiniciar 2x (caso a pessoa perceba que errou o movimento no
> inicio e nao quiser fazer todos os movimentos para realizar o certo)... mas tudo isso sera
> contabilizado que ele teve de reiniciar"*

e, sobre o custo:

> *"não! acho que podemos deixar... mas o tempo vai correndo normal"*

Isto é: o botão **não** fica indisponível depois de certo ponto do puzzle. O custo do reinício é o
**tempo**, que continua correndo — a sessão tem 11 min (`useTimedProgress`, linha 231), então quem
reinicia resolve menos puzzles. Não invente penalidade além dessa.

## 2. O que existe hoje

- O puzzle conta como acerto **só** se resolvido no número mínimo de movimentos:
  `const isOptimal = newMoves <= optimal` (linha ~298).
- Acerto ótimo sobe um disco; não-ótimo fica no mesmo (`nextDiscs`, linha ~305).
- `puzzleResults` guarda `{ correct: boolean; discs: number }`; o metadata leva
  `{ puzzles, maxDiscs, correct }` (linha ~324).
- `startNewPuzzle(nextDiscs)` (linha ~258) já faz exatamente o que um reinício precisa fazer,
  menos trocar o número de discos.
- Não existe botão de reiniciar nem de desfazer.

## 3. O comportamento a construir

### 3.1 O botão

Um botão **"Reiniciar"** visível durante o puzzle (não quando `won` está ativo), com o número de
usos restantes ao lado — por exemplo `Reiniciar (2)`. Quando os 2 usos acabam, o botão fica
**desabilitado**, com aparência de desabilitado, e **não some** — sumir esconderia do paciente que
o recurso existia e acabou.

Posição: junto do bloco de indicadores "Movimentos / Mínimo" (render ~365) ou logo abaixo das
torres. Escolha o que ficar mais limpo e **relate onde pôs**. Estilo sóbrio, coerente com o resto
da tela (fundo branco, borda fina, cantos arredondados); não use vermelho — não é um alerta.

### 3.2 O que o reinício faz

Volta o tabuleiro ao estado inicial **do mesmo puzzle**: `setPegs(initialPegs(discCount))`,
`setSelected(null)`, `setMoves(0)`, `setWon(false)`. É o corpo de `startNewPuzzle`, mas com o
`discCount` atual e **sem tocar em `puzzleStart.current`** — o tempo daquele puzzle segue contando
desde a primeira tentativa, que é a verdade do que ele gastou.

**Não mexa em nada do cronômetro da sessão.** Nem pausar, nem descontar, nem reiniciar. É a
decisão dela: o tempo corre normal.

### 3.3 O custo no resultado

O contador de reinícios é **por puzzle**, e zera a cada puzzle novo.

`isOptimal` passa a exigir também que não tenha havido reinício:

```ts
const isOptimal = newMoves <= optimal && restartsNestePuzzle === 0;
```

**Por quê:** os movimentos zeram no reinício, então sem esta condição recomeçar sempre que
errasse o primeiro movimento viraria a estratégia dominante, e o exercício deixaria de medir
planejamento. Com ela, o reinício tem preço claro — que é o que ela pediu ao dizer que
"será contabilizado que ele teve de reiniciar".

Como `isOptimal` já governa a subida de nível (`nextDiscs`), nada mais precisa mudar ali: puzzle
com reinício não sobe o número de discos. **Não crie outra penalidade.**

### 3.4 O registro — reinício NÃO é erro

Esta é a parte que não pode ser simplificada. Perceber o próprio engano e recomeçar é
**monitoramento**, uma função executiva legítima; é clinicamente diferente de seguir no automático
até o fim sem notar nada. Os dois terminam sem o mínimo de movimentos, mas a terapeuta precisa
poder distinguir um do outro no acompanhamento.

- `puzzleResults` passa a guardar `{ correct: boolean; discs: number; restarts: number }`.
- O `metadata` do `onComplete` ganha **duas** chaves novas, sem alterar as existentes:
  - `restarts`: total de reinícios na sessão (soma de `restarts` de todos os puzzles);
  - `puzzlesComReinicio`: quantos puzzles tiveram ao menos um reinício.
- `accuracy`, `correct`, `puzzles`, `maxDiscs` e `calculateExerciseScore` continuam calculados
  **exatamente como hoje**.

### 3.5 A tela ao resolver

Nada a fazer: quem resolve com reinício cai no ramo `!lastWasOptimal`, que já mostra "Resolvido!"
e a contagem de movimentos. **Não acrescente texto** sobre o reinício ali — o app não carimba. A
informação vive no dado, para a terapeuta.

## 4. O que NÃO pode mudar

- `optimalMoves`, `initialPegs`, `initialDiscs`, `MAX_DISCS`, a regra de movimento (disco maior
  não pousa sobre menor), a sessão de 11 min, `calculateExerciseScore`.
- A fórmula de `accuracy` e o formato do `onComplete` (só entram as duas chaves novas).
- O fluxo de vitória e o `setTimeout` de 2500 ms que emenda o próximo puzzle.

## 5. Prova de aceite

Como o julgamento tem regra nova, ela **precisa de teste** — e o Vitest deste projeto roda sem
JSX, então extraia o que for testável para um `.ts` em `lib/` (por exemplo
`lib/torre-hanoi.ts`, com algo como
`julgarPuzzle({ moves, optimal, restarts }): { optimal: boolean }`), use-o no componente e
cubra em `lib/torre-hanoi.test.ts`. O modelo desta casa é `lib/semaforo.ts` + `lib/semaforo.test.ts`
(commit `10a5050`) — **leia antes**.

Os testes precisam provar, no mínimo:
- mínimo de movimentos e zero reinício → ótimo;
- mínimo de movimentos **com** 1 ou 2 reinícios → **não** ótimo (é a regra nova; nomeie o teste
  de forma que sobreviva a quem não conhece esta conversa);
- acima do mínimo, com ou sem reinício → não ótimo;
- contar as combinações, não verificar só uma — teste que só olha um caso não prova ausência.

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # todos passam (base: 56 arquivos / 762 testes)
```

**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

## 6. Relatório

Onde pôs o botão e por quê; como ficou o estado do contador; a saída literal de `tsc` e dos
testes; e qualquer ponto em que a regra nova ameaçou mexer na progressão — se ameaçou, pare e
relate em vez de decidir.
