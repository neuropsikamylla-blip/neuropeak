# SPEC — Demonstração completa do Span Direto (estilo Cogmed)

> Corrige defeito achado na validação visual de 05/ago/2026: a demonstração reproduz o **estímulo**,
> mas não demonstra **como responder**. Ela precisa executar a tarefa **inteira**.

## 0. Regras inegociáveis

⛔ **NÃO** converter o Span Inverso nem qualquer outro exercício.
⛔ **NÃO** alterar a mecânica clínica, a progressão ou qualquer métrica.
⛔ **NÃO** criar `Session`. **NÃO** tocar `currentDifficulty`, `totalAttempts`, `lastAttemptAt`,
pontuação ou acurácia.
⛔ **NÃO** exibir a sequência escrita durante a escuta. Os números só aparecem por serem parte do
teclado real.
⛔ **NÃO** tocar no banco. **NÃO** publicar.

## 1. O fluxo exigido, passo a passo

```
1. o sistema fala 2
2. o sistema fala 3
3. o teclado fica disponível
4. uma seta/cursor se desloca até o número 2 e simula o clique
5. depois se desloca até o número 3 e simula o clique
6. só após os dois cliques a demonstração termina
7. aparece "Agora é sua vez"
8. começa a tentativa guiada, com sequência NOVA
```

O número de dígitos **não é fixo**: é `smallestValidUnit`, já derivado de `digitsForLevel(MIN_LEVEL)`.
O exemplo usa 2 porque hoje é esse o valor — o código não pode presumi-lo.

## 2. Requisitos visuais

| requisito | como cumprir |
|---|---|
| mesmo teclado do exercício real | reusar `NumberPad` de `SpanNumerico.tsx`; **não** duplicar |
| seta discreta, clara e animada | cursor absoluto sobre o teclado, movido com `framer-motion` |
| feedback do clique **idêntico ao treino** | o treino usa `active:scale-95`; ver §3.1 |
| números nunca escritos na escuta | já garantido: `Beads` + tecla acesa |
| resposta executada automaticamente | a demonstração clica sozinha |
| guiada respondida pelo paciente | inalterada |

## 3. Alterações necessárias

### 3.1 `NumberPad` (`components/exercises/memory/SpanNumerico.tsx`) — duas props OPCIONAIS

O feedback de clique do treino é a classe CSS `active:scale-95`, que **só dispara com toque real** —
não há como acioná-la por código. Para o clique demonstrado ficar idêntico, o teclado precisa aceitar
uma tecla pressionada programaticamente:

```ts
export function NumberPad({ interactive, flashKey, onKey, pressedKey = -1 }: {
  interactive: boolean; flashKey: number; onKey: (n: number) => void;
  /** Tecla exibida como pressionada por código — reproduz o mesmo efeito de `active:scale-95`. */
  pressedKey?: number;
})
```

- Quando `pressedKey === n`, aplicar **`transform: scale(0.95)`** ao botão — exatamente o que
  `active:scale-95` produz — preservando a transição de 150 ms que já existe.
- Acrescentar **`data-digit={n}`** a cada botão, para que o cursor localize a tecla sem depender da
  ordem do DOM.
- ⚠️ Ambas são **opcionais e sem efeito quando ausentes**: o treino não pode mudar em nada.
  `pressedKey` e `lit` são independentes e podem coexistir.

### 3.2 Cursor — novo, em `components/exercises/tutorial/DemoPointer.tsx`

Componente reutilizável (outros exercícios de clique vão precisar dele):

```ts
interface DemoPointerProps {
  /** Container que embrulha o alvo; o cursor é posicionado em relação a ele. */
  containerRef: React.RefObject<HTMLElement>;
  /** Seletor CSS do alvo atual, ou null para esconder o cursor. */
  targetSelector: string | null;
  /** Estado do gesto: aproximando ou pressionando. */
  phase: "moving" | "pressing";
}
```

- Mede o alvo com `getBoundingClientRect()` do elemento e do container, e posiciona o cursor no
  **centro** do alvo.
- Anima o deslocamento com `framer-motion` (~450 ms, `easeInOut`). Em `"pressing"`, encolhe
  levemente, sinalizando o toque.
- Ícone: `MousePointer2` do `lucide-react` — discreto, coerente com o resto da interface.
  ⛔ **Sem emoji** (decisão congelada 2).
- `pointer-events: none` e `aria-hidden`: é adorno visual, nunca intercepta clique.
- Recalcular no `resize`, para não descolar da tecla quando a tela muda.

### 3.3 `Demonstration` (`lib/tutorial/definitions/span-numerico.tsx`) — reescrever

Máquina de estados:

```
"listening"  → toca a sequência com playDigitSequence (bolinhas preenchem, tecla acende)
"answering"  → zera as bolinhas; para CADA dígito da sequência:
                 a) cursor vai até `[data-digit="<n>"]`   (~450 ms, phase "moving")
                 b) phase "pressing" + pressedKey = n     (~180 ms)  ← o clique
                 c) solta (pressedKey = -1) e a bolinha correspondente preenche
                 d) pequena pausa antes do próximo
"done"       → só depois do ÚLTIMO clique, chama onDone()
```

- O teclado fica **visível e aparentemente disponível** na fase de resposta, mas `interactive={false}`:
  quem clica é a demonstração, não o paciente.
- Envolver o `SpanBoard` num container com `ref` e `position: relative`, e montar o `DemoPointer`
  dentro dele.
- Cancelamento: o `useEffect` já usa a bandeira `cancelled`; toda espera deve respeitá-la, para que
  desmontar no meio não deixe animação nem áudio órfãos.
- **Manter o padrão do ref para `onDone`** (`onDoneRef.current()`, efeito com `[]`) — foi conserto
  de um defeito real; regredir isso faz a voz falar por cima de si mesma.

### 3.4 O que NÃO muda

`GuidedAttempt` continua exatamente como está: sequência nova, respondida pelo paciente, sem cursor.
`TutorialRunner` já mostra "Agora é sua vez" ao entrar na fase guiada — passos 7 e 8 já atendidos.

## 4. Testes obrigatórios

Vitest com `environment: node` — **não importar `.tsx`**; usar verificação estática do fonte.

1. `NumberPad` aceita `pressedKey` opcional com padrão `-1` e emite `data-digit`.
2. `pressedKey === n` produz `scale(0.95)` — o mesmo valor de `active:scale-95`.
3. Sem as props novas, o `NumberPad` renderiza como antes (nenhuma mudança para o treino).
4. `DemoPointer` não contém emoji, é `aria-hidden` e usa `pointer-events: none`.
5. A demonstração percorre **todos** os dígitos antes de `onDone` — nada de terminar no primeiro.
6. A demonstração usa `smallestValidUnit`/`SMALLEST_VALID_UNIT`, nunca um literal.
7. O efeito continua com `onDoneRef.current()` e array de dependências vazio.
8. `Demonstration` mantém `interactive={false}` na fase de resposta.
9. Nenhum termo clínico proibido (`onComplete`, `score`, `accuracy`, `useTimedProgress`, `lib/adaptive`).
10. Toda a suíte continua verde — **549/549 é o piso**.

## 5. Gates

`prisma validate` · `prisma generate` · `npx tsc --noEmit` · `npm run test` · `npm run build` · `lint`
sem warning novo.

⛔ **Não publicar.** Ela quer ver o fluxo visual descrito e validar antes.
