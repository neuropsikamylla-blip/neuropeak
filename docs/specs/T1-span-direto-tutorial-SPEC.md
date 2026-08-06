# SPEC — Tutorial da T1 no Span Numérico Auditivo Direto

> Exercício de referência da T1. O que for construído aqui será reutilizado por todos os demais.
> Base: `docs/T1-SPAN-DIRETO-EXERCICIO-DE-REFERENCIA.md` e o bloco EM ANDAMENTO do `PROGRESSO.md`.

## 0. Regras inegociáveis

⛔ **NÃO** converter o Span Inverso nem qualquer outro exercício.
⛔ **NÃO** alterar a mecânica clínica nem a progressão do Span.
⛔ **NÃO** criar `Session` durante o tutorial.
⛔ **NÃO** alterar `currentDifficulty`, `totalAttempts`, `lastAttemptAt`, pontuação, acurácia ou
qualquer métrica clínica.
⛔ **NÃO** exibir os números escritos durante a apresentação auditiva.
⛔ **NÃO** tocar no banco (sem `db push`, sem SQL, sem backfill).

## 1. O fluxo obrigatório

```
PREPARAÇÃO  →  DEMONSTRAÇÃO  →  TENTATIVA GUIADA  →  FEEDBACK
                                       ↑                  │
                                       └── erro: repete ───┤ (só a guiada)
                                                           │
                                          acerto/seguir ───→  CONFIRMAÇÃO  →  TREINO CLÍNICO
```

- **Preparação:** só o essencial para interagir. **Nunca** estratégia cognitiva. **Não se chama
  tutorial.**
- **Demonstração:** mecânica **real** de áudio — mesmo arquivo, mesma cadência, mesma tecla acesa.
- **Tentativa guiada:** o paciente responde de verdade, em dificuldade **abaixo da clínica**.
- **Feedback:** acerto ou erro. No erro, repete **apenas a tentativa guiada** — nunca a demonstração.
- **Confirmação de conclusão:** encerra o tutorial e grava `tutorialSource = PATIENT`.
- **Segunda abertura:** pula o tutorial automaticamente.

## 2. Mecânica real do Span (medida em `components/exercises/memory/SpanNumerico.tsx`)

| peça | linha | valor |
|---|---|---|
| Áudio | 219 | `new Audio("/exercises/audio/numeros/${d}.m4a")` |
| Pausa inicial | 213 | 500 ms |
| Intervalo entre dígitos | 211 | 850 ms; **1000 ms** quando a sequência tem ≥ 6 dígitos |
| Durante a fala | 216-217 | `setActiveBead(i)` + `setFlashKey(seq[i])` — a **tecla acende** |
| Número escrito | — | **nunca aparece**; só bolinhas (`Beads`) e tecla acesa (`NumberPad`) |
| Entrada | 331 | `handleKey`, valida ao completar `digits` |
| Níveis | 52 | `digitsForLevel(lv) = lv + 1` → N1 = **2 dígitos**, `MAX_LEVEL = 9` |
| Nível clínico | 58 | `levelFromDifficulty(d) = clamp(ceil(max(1,d) × 0,7))` |
| Único `onComplete` | 311 | só quando as tentativas prescritas terminam |

### Dificuldade da tentativa guiada — decisão registrada

A guiada usa **nível 1 = 2 dígitos**, fixo. É o piso da mecânica real: estritamente **abaixo** do
clínico para qualquer paciente com `difficulty ≥ 2`, e **igual** ao piso para quem está começando.
Não existe valor menor que ainda demonstre uma sequência. **Não inventar mecânica de 1 dígito.**

## 3. Arquitetura a construir — reutilizável pelos demais

### 3.1 `lib/tutorial/span-playback.ts` — NOVO

Fonte **única** da cadência do Span, para que tutorial e treino **nunca divirjam**:

```ts
export const SPAN_AUDIO_SRC = (d: number) => `/exercises/audio/numeros/${d}.m4a`;
export const SPAN_INITIAL_DELAY_MS = 500;
export function spanGapMs(sequenceLength: number): number; // ≥6 → 1000, senão 850
```

Mais uma função de reprodução reutilizável, **sem estado de React**:

```ts
export interface PlaybackHooks {
  onDigitStart: (digit: number, index: number) => void;
  onDigitEnd:   (digit: number, index: number) => void;
  isCancelled:  () => boolean;   // aborta se o componente desmontar ou a rodada mudar
}
export async function playDigitSequence(seq: number[], hooks: PlaybackHooks): Promise<void>;
```

**`SpanNumerico.tsx` passa a importar `SPAN_AUDIO_SRC`, `SPAN_INITIAL_DELAY_MS` e `spanGapMs`** em
lugar dos literais das linhas 211-219. **O comportamento observável deve permanecer idêntico** — é
substituição de constante por importação, não mudança de lógica. Não alterar a estrutura de
`playSequence` além disso.

### 3.2 `components/exercises/tutorial/TutorialRunner.tsx` — NOVO

Consome um `TutorialDefinition` (`lib/tutorial/types.ts`, já existente) e implementa a máquina:

```
"demo" → "guided" → "feedback" → (erro → "guided" | acerto → "confirm") → onFinish()
```

- Renderiza `definition.Demonstration` com `onDone` → vai a `"guided"`.
- Renderiza `definition.GuidedAttempt` com `onOutcome` → vai a `"feedback"`.
- Em `"feedback"` com `"incorrect"`: mostra `definition.retryHint` e um botão que volta a
  `"guided"` — **remontando apenas a tentativa guiada** (usar `key` incremental para reiniciar o
  estado interno). **Nunca** voltar à demonstração.
- Em `"feedback"` com `"correct"`: botão que vai a `"confirm"`.
- `"confirm"`: encerramento explícito do tutorial; ao confirmar, chama `onFinish()`.
- **Proibido** neste componente e nos filhos: `onComplete`, `score`, `accuracy`, `reactionTime`,
  `useTimedProgress`, `useExerciseProgress`, qualquer import de `lib/adaptive`.
- Visual coerente com `PreparationScreen` (temas CLINICAL / COLORFUL / GAMIFIED).

### 3.3 `lib/tutorial/definitions/span-numerico.tsx` — NOVO

`TutorialDefinition` para `span-numerico`, versão **1** (já em `TUTORIAL_VERSIONS`).

- **`Demonstration`**: toca uma sequência de **2 dígitos** com `playDigitSequence`, exibindo bolinhas
  e tecla acesa como no treino, e em seguida **mostra sozinha** a resposta sendo digitada, para o
  paciente ver o que se espera. Ao terminar, `onDone()`.
- **`GuidedAttempt`**: toca **2 dígitos** e habilita o teclado. Ao completar a entrada, compara com a
  sequência e chama `onOutcome("correct" | "incorrect")`. **Sem pontuação, sem cronômetro, sem
  acumular tentativa.**
- **`retryHint`**: frase clínica curta, sem estratégia cognitiva.
- Reusar `NumberPad` e `Beads` de `SpanNumerico.tsx` — **exportá-los** de lá (acrescentar `export`;
  são componentes puros de apresentação, mudança de zero risco). **Não duplicar** esses componentes.

### 3.4 `components/exercises/ExerciseWrapper.tsx` — ALTERAR

Fase nova entre a preparação e o treino:

```ts
type Phase = "instructions" | "tutorial" | "exercise" | "results";
```

Props novas, **todas opcionais** (os outros 33 exercícios seguem funcionando sem elas):

```ts
tutorial?: TutorialDefinition;
tutorialState?: { completedAt: Date | null; completedVersion: number | null };
onTutorialDone?: () => void;   // dispara o POST; o wrapper não conhece a API
```

Regra de transição: ao sair de `"instructions"`, se `tutorial` existir **e**
`tutorialRequired(tutorialState, tutorial.version)` for `true`, ir para `"tutorial"`; senão, direto
para `"exercise"`. Ao encerrar o tutorial, chamar `onTutorialDone()` e ir para `"exercise"`.

Se `tutorialState` ainda não carregou (`undefined`), **não exibir o tutorial** — nunca mostrar por
falta de dado. Melhor pular indevidamente do que repetir para quem já fez.

### 3.5 `app/(patient)/treino/[exercicio]/page.tsx` — ALTERAR

- Ao ler `exerciseConfigs` (linha ~456), capturar também `tutorialCompletedAt` e `tutorialVersion`
  (o `include` booleano já os devolve — **não** alterar a API).
- Passar `tutorial`, `tutorialState` e `onTutorialDone` ao `ExerciseWrapper` **apenas quando
  `exerciseId === "span-numerico"`**. Nenhum outro exercício nesta etapa.
- `onTutorialDone` faz `POST /api/exercise-tutorial` com `{ exerciseId, version }`. Falha de rede
  **não** pode travar o paciente: registrar e seguir para o treino.

### 3.6 A preparação deixa de se chamar tutorial

`ReadyScreen` (`SpanNumerico.tsx:423`) é a preparação atual. Garantir que ela:
- traga só o essencial para interagir;
- **não** use a palavra "tutorial";
- **não** ensine estratégia cognitiva (nada de "agrupe", "repita mentalmente", "associe").

## 4. Testes obrigatórios

Em `lib/tutorial/` e `components/`, no padrão do repositório (Vitest, `environment: node` — testes
de componente **não** podem importar `.tsx`; usar verificação estática do fonte quando necessário).

1. `spanGapMs`: 850 até 5 dígitos, 1000 a partir de 6.
2. `SpanNumerico.tsx` importa a cadência de `span-playback` e **não** contém mais os literais
   `850`/`1000`/`/exercises/audio/numeros/` soltos.
3. `TutorialRunner.tsx` **não** menciona `onComplete`, `score`, `accuracy`, `reactionTime`,
   `useTimedProgress`, `useExerciseProgress` nem `lib/adaptive`.
4. `definitions/span-numerico.tsx` idem, e usa **2 dígitos** na guiada.
5. A definição **não** renderiza dígito como texto durante a fase de escuta.
6. `ExerciseWrapper`: com `tutorialState` já concluído na versão corrente, a fase `"tutorial"` é
   pulada (teste da regra `tutorialRequired`, que já é função pura).
7. `page.tsx` passa `tutorial` **somente** para `span-numerico`.
8. Os testes existentes continuam passando — **517/517 é o piso**.

## 5. Gates antes de publicar

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build`.

Depois: prova de isolamento clínico comparando o banco **antes e depois** de concluir um tutorial —
`currentDifficulty`, `totalAttempts`, `lastAttemptAt`, contagem de `Session` **inalterados**, e o
registro daquele par passando de `BACKFILL` a `PATIENT`.

## 6. Fora de escopo

Converter outro exercício · alterar mecânica ou progressão · mexer no banco · publicar sem a
validação visual dela.
