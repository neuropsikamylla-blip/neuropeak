# SPEC — Família 1: `letras-sequencia` e `sequencia-itens`

> Família 1 (**sequência apresentada → reproduzir na ordem**) já foi **aprovada** por ela através do
> Span. Estes dois têm as mesmas fases (`ready·show·input·feedback`) e a mesma mecânica de tutorial,
> então **não há nova validação**: converter e seguir.
>
> Regras obrigatórias: `docs/T1-REGRAS-GLOBAIS.md` (as dez). Famílias:
> `docs/T1-FAMILIAS-DE-MECANICA.md`.

## 0. Inegociável

⛔ **NÃO** alterar mecânica clínica, progressão, dificuldade, pontuação ou métricas.
⛔ **NÃO** aproveitar para melhorias nos exercícios — só preparação, demonstração e guiada.
⛔ **NÃO** criar `Session`. **NÃO** tocar no banco.
⛔ **NÃO** gravar tutorial fora do caminho único (regra 10) — `lib/tutorial/gravacao-unica.test.ts`
   falha se tentar.
⛔ **NÃO** usar emoji. **NÃO** criar um segundo Runner ou Pointer (regra 7).

## 1. A diferença técnica desta conversão

O Span usa arquivos `.m4a` e sincroniza no evento `playing`. **Estes dois usam
`window.speechSynthesis`** (`speak()` local em cada componente, linhas ~40 e ~48).

A regra 3 continua valendo integralmente: **o visual acompanha a voz e nunca a antecipa.** Com voz
sintetizada, o sinal equivalente ao `playing` é **`utterance.onstart`**.

### 1.1 `lib/tutorial/speech-playback.ts` — NOVO

Análogo a `span-playback.ts`, para voz sintetizada:

```ts
export interface SpeechPlaybackHooks {
  onItemStart: (texto: string, index: number) => void;   // chamado em utterance.onstart
  onItemEnd: (texto: string, index: number) => void;
  isCancelled: () => boolean;
}
export const SPEECH_INITIAL_DELAY_MS = 500;
export function speechGapMs(sequenceLength: number): number;   // mesma curva do Span: >=6 → 1000
export async function speakSequence(itens: string[], hooks: SpeechPlaybackHooks): Promise<void>;
```

- **`onItemStart` DENTRO de `utterance.onstart`** — nunca antes de `speechSynthesis.speak()`.
  Reintroduzir o aviso antes da fala repete o defeito já corrigido no Span.
- `onend` encerra; `onerror` **também chama `onItemStart`** antes de encerrar, para que a falha de
  voz degrade em vez de deixar o paciente sem estímulo nenhum.
- Cancelamento respeitado em toda espera; `speechSynthesis.cancel()` ao abortar.
- ⚠️ Alguns navegadores não disparam `onstart` de forma confiável. Use uma **guarda**: se em 1200 ms
  o `onstart` não vier, considere iniciado (o estímulo visual precisa acontecer).

## 2. Generalizar a fábrica (regra 7)

`lib/tutorial/definitions/span-numerico.tsx` tem hoje `criarTutorialSpan`, presa ao `NumberPad`.
Extrair a parte comum para uma fábrica da **família**, em
`lib/tutorial/definitions/sequencia-ordenada.tsx`:

```ts
interface FamiliaSequenciaConfig<T> {
  exerciseId: string;
  version: number;
  guidedInstruction: string;
  smallestValidUnit: number;
  /** Itens da demonstração e gerador da sequência da guiada. */
  demonstrationItems: T[];
  createGuidedSequence: () => T[];
  /** Como apresentar (áudio pré-gravado no Span; voz sintetizada aqui). */
  present: (itens: T[], hooks: ...) => Promise<void>;
  /** O painel de resposta REAL do exercício, com o alvo marcado por data-attribute. */
  Board: ComponentType<BoardProps<T>>;
  /** Seletor CSS do alvo, para o DemoPointer encontrar. */
  targetSelectorFor: (item: T) => string;
  reverse?: boolean;
}
```

O **ritmo** (as oito constantes já calibradas), a **ordem do gesto** (deslocar, mirar, pressionar,
soltar, preencher) e o **cursor** ficam na fábrica — idênticos para toda a família. **Nada disso
pode ser reescrito por exercício.**

O Span passa a usar essa fábrica; `spanNumericoTutorial` e `spanNumericoInversoTutorial` continuam
exportados com o mesmo comportamento. **A suíte atual é a prova de que nada mudou para ele.**

## 3. Os painéis de resposta

Cada exercício expõe seu painel para reuso, como o `NumberPad` já faz:

- **`LetrasSequencia`** (`components/exercises/memory/LetrasSequencia.tsx`): o painel de letras e
  sílabas (botões em ~283). Exportar e acrescentar **`data-choice={valor}`** e a prop opcional
  **`pressedChoice`** (mesmo papel do `pressedKey`: reproduzir `active:scale-95` por código).
- **`SequenciaItens`** (`components/exercises/memory/SequenciaItens.tsx`): idem para os itens
  ilustrados (botões em ~254), com `data-choice` e `pressedChoice`.

⚠️ Ambas as props são **opcionais e sem efeito quando ausentes** — o treino não pode mudar em nada.

## 4. Textos (regras 1, 4 e 5)

| exercício | `guidedInstruction` |
|---|---|
| `letras-sequencia` | Ouça a sequência e clique nas letras na mesma ordem. |
| `sequencia-itens` | Ouça a sequência e clique nos itens na mesma ordem. |

Demonstração e encerramento usam os padrões do framework — **não** sobrescrever.

## 5. Registro

Acrescentar ao `TUTORIAIS_POR_EXERCICIO` em `app/(patient)/treino/[exercicio]/page.tsx`:

```ts
"letras-sequencia": letrasSequenciaTutorial,
"sequencia-itens": sequenciaItensTutorial,
```

E ao teste que trava o conteúdo do registro (`span-reference.test.ts`), que hoje espera exatamente
os dois do Span.

## 6. Testes obrigatórios

1. `speechGapMs`: 850 até 5 itens, 1000 a partir de 6 — mesma curva do Span.
2. `speakSequence` chama `onItemStart` **dentro de `onstart`**, nunca antes de `speak()`
   (mesma verificação de posição usada em `span-playback`).
3. Guarda de `onstart` presente, com o limite de 1200 ms.
4. Falha de voz ainda produz o estímulo visual.
5. Os painéis aceitam `pressedChoice` opcional e emitem `data-choice`; sem as props, o treino
   renderiza como antes.
6. A fábrica da família é **uma só**: nenhum dos dois exercícios tem componente de tutorial próprio.
7. As oito constantes de ritmo vivem na fábrica, não duplicadas por exercício.
8. `guidedInstruction` de cada um usa o verbo **clique** e não menciona teclado nem toque.
9. O registro cobre exatamente: `span-numerico`, `span-numerico-inverso`, `letras-sequencia`,
   `sequencia-itens`.
10. `gravacao-unica.test.ts` continua verde — nenhum dos novos participa da gravação.
11. Suíte inteira verde — **603/603 é o piso**.

## 7. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` ·
`lint` sem warning novo nos arquivos tocados.

## 8. Se algo não couber

Se a apresentação por voz sintetizada não permitir cumprir a regra 3 sem exceção, **não invente
solução**: registre em `docs/T1-INCOMPATIBILIDADES.md`, explique e pare.
