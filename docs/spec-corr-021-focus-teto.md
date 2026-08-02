# CORR-021 — Focus Agentes: teto da progressão vira PARÂMETRO (spec de tarefa)

## Contexto (medido em 02/ago/2026, HEAD d88df5d)

O Focus Agentes tem **13 passos** persistidos (`lib/focus/progression.ts`: `LAST_FOCUS_STEP = 12`,
nível = passo + 1 → 1..13). O banco e o `sessionSchema` já aceitam difficulty até 13 (v2.65.3).

Mas a progressão ENTRE sessões trava em 9:

- `lib/adaptive.ts:149` — `const lvl = Math.min(9, Math.max(1, Math.round(level)));`
- `lib/adaptive.ts:151` — `if (accuracy >= 0.80 && lvl < 9)`

Efeito no paciente: quem chega aos passos 10–13 tem o nível rebaixado para 9 ao salvar a sessão, e
os quatro últimos passos **nunca se consolidam**.

Segundo problema, no mesmo conserto: `focusDetectTargetMs` (`lib/adaptive.ts:137-141`) tem régua de
**10** valores e satura em 1500 ms. Do nível 10 ao 13 o alvo de velocidade seria idêntico, então o
critério duplo (precisão + ritmo) deixa de discriminar exatamente na faixa alta.

## O que fazer

### 1. Teto como parâmetro (modelo: `calculateProgression`)

`calculateProgression` já faz isso — `lib/adaptive.ts:93`: `maxLevel: number = 10`, e o Supermercado
passa 12. **Seguir o mesmo padrão**, sem criar constante solta nova:

```ts
export function calculateFocusProgression(
  level: number,
  accuracy: number,
  detectMedianMs?: number | null,
  maxLevel: number = FOCUS_MAX_LEVEL,
): { nextLevel: number; action: "increase" | "maintain" | "decrease"; reason: string }
```

- `FOCUS_MAX_LEVEL` deve ser **exportado de `lib/focus/progression.ts`** (fonte única do teto, já é
  quem define `LAST_FOCUS_STEP`): `export const FOCUS_MAX_LEVEL = LAST_FOCUS_STEP + 1;` (= 13).
- Dentro da função, trocar os dois `9` por `maxLevel`.
- `lib/adaptive.ts` importa esse valor de `lib/focus/progression.ts`. Conferir que não cria ciclo de
  import (hoje `progression.ts` não importa `adaptive.ts` — manter assim).

### 2. Régua de detecção até 13

`FOCUS_DETECT_TARGET_MS` passa a ter 13 valores. Os 10 primeiros **não mudam** (calibração já
aprovada pela Kamylla: 3500 · 3300 · 3050 · 2800 · 2600 · 2400 · 2200 · 2000 · 1750 · 1500).
Acrescentar, com desaceleração (a curva não pode virar exigência irreal de tempo de reação):

```
nível 11 = 1400 · nível 12 = 1300 · nível 13 = 1200
```

Marcar em comentário que 11–13 são **calibração provisória, a confirmar com a Kamylla**.
O clamp passa a usar o tamanho do array, não o literal 10.

## O que NÃO fazer

- Não mudar as regras de subir/descer (≥80% sobe, <55% desce, critério duplo com o tempo-alvo).
- Não mexer nos 10 primeiros valores da régua.
- Não mexer em `lib/focus/progression.ts` além de exportar `FOCUS_MAX_LEVEL`.
- Não tocar no componente `FocusRain.tsx` nem em `app/api/sessions/route.ts`.
- Não criar constante duplicada de teto em `adaptive.ts`.

## Prova de aceite (escrever ANTES em `lib/adaptive.test.ts`)

Acrescentar ao `describe` do Focus, sem alterar os testes existentes:

1. `calculateFocusProgression(9, 0.9, 1000).nextLevel === 10` — o antigo teto deixa de travar.
2. `calculateFocusProgression(12, 0.9, 1000).nextLevel === 13` — sobe até o último passo.
3. `calculateFocusProgression(13, 0.9, 1000)` → `action === "maintain"` e `nextLevel === 13` — não
   passa de 13.
4. `calculateFocusProgression(13, 0.3).nextLevel === 12` — ainda desce de 13.
5. Com teto explícito menor: `calculateFocusProgression(9, 0.9, 1000, 9).nextLevel === 9`
   (parâmetro respeitado, como no modelo `maxLevel`).
6. Régua: `focusDetectTargetMs(11) === 1400`, `focusDetectTargetMs(13) === 1200`,
   `focusDetectTargetMs(99) === 1200` (clamp no fim do array) e os antigos seguem:
   `focusDetectTargetMs(1) === 3500`, `focusDetectTargetMs(10) === 1500`.
7. Nível alto continua sujeito ao critério duplo: `calculateFocusProgression(11, 0.9, 5000)` →
   `action === "maintain"` (preciso porém lento não sobe).

## Provas a rodar no lab

```
npx tsc --noEmit      # exit 0
npx vitest run        # tudo passando; 231 testes + os novos deste conserto
```

Não commitar: entregar o diff no worktree (o VP revisa linha a linha, aplica e commita).
