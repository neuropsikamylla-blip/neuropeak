# Spec — Semáforo: não responder deixa de ser acerto

Data: 2026-08-31
Arquivos a alterar: `components/exercises/processing/Semaforo.tsx` (+ 2 arquivos NOVOS, abaixo)
Origem: auditoria `docs/auditoria-aviso-omissao/AUDITORIA-AVISO-OMISSAO-2026-08-31.md`, achado B2.

---

## 1. O defeito, com os números medidos

No Semáforo o paciente tem **dois botões**: AVANÇAR e PARAR. É escolha forçada — as duas
respostas são ativas, nenhuma delas é "ficar parado".

Hoje, quando o tempo da rodada esgota sem toque (`Semaforo.tsx:206`):

```
handleResponse(false, newRound);   // ← o MESMO caminho do botão PARAR (linha 254)
```

e o julgamento é (`Semaforo.tsx:223`):

```
const correct = pressedAdvance === shouldAdvance;
```

Logo, com o alvo VERMELHO (`shouldAdvance === false`), a omissão produz
`correct = (false === false) = true`. **Não fazer nada é contado como ACERTO**, e a tela
ainda mostra "✓ Certo!".

Distribuição de cores (`randomLightColor`, linha 36): **45% verde, 45% vermelho, 10% amarelo**
→ 55% das rodadas são "não avançar". **Um paciente que não toca em nada acerta 55% da sessão.**

Pior: em `handleResponse`, `rt: correct ? rt : null` — como a omissão vira "acerto", ela entra
no `avgRT` **com o tempo cheio do timeout**, inflando o tempo médio de reação.

Isso não é cosmético. `accuracy` e `avgRT` vão para `calculateExerciseScore`, para a engine
adaptativa (que decide o próximo nível) e para o acompanhamento da terapeuta.

---

## 2. A decisão clínica (já tomada — implemente, não rediscuta)

1. **Não responder no tempo é ERRO**, nunca acerto. Numa tarefa de escolha forçada com dois
   botões, a ausência de resposta não é uma das respostas.
2. **A omissão é registrada em separado**, para a terapeuta distinguir "errou o botão" de
   "não respondeu". Vai no `metadata` como `omissions`.
3. **A omissão NÃO recebe carimbo na tela.** Regra dela, fechada em 31/ago/2026:
   *"nao precisa avisar é treino"* — o app não comenta o que o paciente deixou de fazer. Hoje
   a omissão pisca o fundo e escreve "✓ Certo!" ou "✗ Errado!"; passa a **não mostrar nada**.
   O feedback de quem TOCOU (certo ou errado) **fica exatamente como está**.
4. **O RITMO NÃO MUDA.** A rodada seguinte continua entrando no mesmo intervalo de 500 ms de
   hoje, com ou sem carimbo. Se o ritmo mudar, o exercício mudou de dificuldade sem ninguém
   pedir.

---

## 3. Arquivo NOVO 1 — `lib/semaforo.ts`

O julgamento sai de dentro do componente e vira função pura, para poder ser testado. O Vitest
deste projeto roda **sem suporte a JSX**, então a função PRECISA morar num `.ts` em `lib/`,
nunca num `.tsx`.

```ts
export type SemaforoResponse = "advance" | "stop" | "none";

export interface SemaforoJudgement {
  correct: boolean;
  omitted: boolean;
}

/**
 * Julga UMA rodada do Semáforo.
 *
 * `targetIsGreen` é o sinal de seguir (verde). Vermelho e amarelo pedem PARAR.
 * `response` "none" é a ausência de resposta — que NUNCA é acerto: o exercício tem dois
 * botões, e não tocar não é uma das opções. Antes de 31/ago/2026 a omissão percorria o mesmo
 * caminho do botão PARAR e virava acerto em 55% das rodadas.
 */
export function judgeSemaforo(targetIsGreen: boolean, response: SemaforoResponse): SemaforoJudgement;
```

Regra de verdade a implementar:

| `targetIsGreen` | `response` | `correct` | `omitted` |
|---|---|---|---|
| true  | "advance" | **true**  | false |
| true  | "stop"    | false     | false |
| true  | "none"    | **false** | **true** |
| false | "advance" | false     | false |
| false | "stop"    | **true**  | false |
| false | "none"    | **false** | **true** |

## 4. Arquivo NOVO 2 — `lib/semaforo.test.ts`

Cobrir a tabela inteira (6 linhas) e, além disso, **provar a regressão pelo nome**:

- um teste chamado explicitamente algo como
  `"omissao com sinal vermelho NAO conta como acerto (regressao de 31/ago/2026)"`;
- um teste que percorre as três cores possíveis (`green`, `red`, `yellow`) com
  `response: "none"` e afirma que **nenhuma** produz `correct: true`;
- um teste que afirma que `omitted` é `true` **somente** quando `response === "none"` — conte
  as ocorrências, não verifique só uma.

## 5. Alterações em `Semaforo.tsx`

1. Importar `judgeSemaforo` e `type SemaforoResponse` de `@/lib/semaforo`.
2. Trocar a assinatura de `handleResponse` de `(pressedAdvance: boolean, ...)` para
   `(response: SemaforoResponse, ...)`. As três chamadas passam a ser:
   - linha ~209 (timeout): `handleResponse("none", newRound)`
   - linha ~248 (`onPressAdvance`): `handleResponse("advance", round)`
   - linha ~254 (`onPressStop`): `handleResponse("stop", round)`
3. Dentro de `handleResponse`, o julgamento vem da função pura:
   ```ts
   const { correct, omitted } = judgeSemaforo(isGoSignal(currentRound.targetColor), response);
   ```
   `isGoSignal` continua onde está.
4. O registro da tentativa ganha o campo: `{ correct, rt: correct ? rt : null, omitted }`.
   Ajuste o tipo do `useState`/`useRef` de `results` para incluir `omitted: boolean`.
   `rt: correct ? rt : null` **fica como está** — e agora, como a omissão nunca é `correct`,
   ela deixa sozinha de contaminar o `avgRT`.
5. **Feedback:** `setFeedback(correct ? "correct" : "wrong")` passa a rodar **apenas quando
   houve resposta**. Na omissão, `setFeedback(null)`. O `setPhase("feedback")` e o
   `setTimeout(..., 500)` que emenda a rodada seguinte **continuam iguais nos dois casos** —
   é o que preserva o ritmo (item 2.4).
6. **`finishGame`:** o `metadata` passa de
   `{ trials: finalResults.length, avgRT, correct: hits.length }`
   para
   `{ trials: finalResults.length, avgRT, correct: hits.length, omissions: finalResults.filter(r => r.omitted).length }`.
   **`accuracy` NÃO muda de fórmula** — continua `acertos / total`. O que muda é que a omissão
   deixou de entrar em `acertos`.

## 6. O que NÃO pode mudar

- `randomLightColor`, `randomDistractorColor`, `isGoSignal`, `lightOnMs`, `SESSION_MS`,
  `BLINK_DURATION`, a troca de posição dos botões (`swapped`), a lógica dos distratores e
  qualquer temporização.
- A fórmula de `accuracy` e a chamada `calculateExerciseScore("semaforo", ...)`.
- O feedback de quem TOCOU: "✓ Certo!" / "✗ Errado!" e o flash de fundo ficam idênticos.
- O `exerciseId`, o domínio e o formato do `onComplete` (só entra a chave nova no metadata).

## 7. Prova de aceite

```
npx tsc --noEmit          # exit 0
npm run test              # todos passam, incluindo os novos de lib/semaforo.test.ts
```

NÃO rodar `npm run build` — o dev server dela está no ar e os dois disputam o `.next`.

Confira também e relate:
- `grep -n "pressedAdvance" components/exercises/processing/Semaforo.tsx` → **zero linhas**
  (o booleano ambíguo desapareceu; era ele que fazia a omissão passar por PARAR).
- `grep -rn "judgeSemaforo" components lib` → a função é usada no componente e no teste.

## 8. Relatório final

Diga o que mudou por arquivo, cole a saída literal de `tsc` e dos testes (com a contagem
total), e registre qualquer ponto em que a spec esbarrou em algo que você preferiu não mexer.
