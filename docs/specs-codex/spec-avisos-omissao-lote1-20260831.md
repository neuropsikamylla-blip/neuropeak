# Spec — Lote 1: tirar o aviso de omissão de 4 pontos (Focus ×2, Busca Rápida, Tempo de Reação)

Data: 2026-08-31
Origem: `docs/auditoria-aviso-omissao/AUDITORIA-AVISO-OMISSAO-2026-08-31.md`, achados A1, A2, A5, B1.
Modelo já executado desta mudança: commit `dee21e1` (Dupla Tarefa) e `10a5050` (Semáforo). **Leia os dois antes de começar.**

---

## 0. A regra e as três invariantes

Regra dela, fechada em 31/ago/2026: *"nao precisa avisar é treino"* — **o app não comenta o que o
paciente deixou de fazer.** Some o carimbo da NÃO-ação. O feedback de quem TOCOU fica intacto.

Três invariantes que valem para todos os itens abaixo:

1. **O RITMO NÃO MUDA.** Toda pausa que hoje existe para exibir o aviso **continua existindo com a
   mesma duração**. Se a pausa encolher, o exercício muda de dificuldade sem ninguém ter pedido.
   Isto é mais importante que "a tela parada parecer estranha" — não invente encurtamento.
2. **A MEDIDA NUNCA SE PERDE.** Sai o carimbo, nunca o dado. Onde a omissão já é registrada, o
   registro fica idêntico. Onde NÃO é registrada hoje (item D), você a acrescenta.
3. **Nenhuma temporização, geração de estímulo, fórmula de acurácia ou chamada de
   `calculateExerciseScore` pode mudar.**

---

## A · `components/exercises/attention/FocusAgents.tsx:240` — modo QUEDA

Hoje, quando o alvo sai por baixo sem toque:

```tsx
registra(false, null, true);
setFb({ ok: false, msg: "Passou! Toque mais rápido.", alvoUid: null });
setFase("feedback");
timers.current.push(setTimeout(proximaRef.current, 1250));
```

A faixa vermelha "✗ Passou! Toque mais rápido." é **dupla falta**: carimba a não-ação e ainda dá
ordem de estratégia, que é dica depois da instrução.

**Faça:** trocar o `setFb({...})` por **`setFb(null)`**. Nada mais nessa linha.
`registra(false, null, true)` fica (é o `omissions` do metadata). `setFase("feedback")` fica e o
**1250 ms fica**.

Confira, lendo o render (por volta da linha 468): a faixa está sob `fase === "feedback" && fb &&`,
então com `fb === null` ela não renderiza. Confirme isso no código; se não for verdade, PARE e relate.

## B · `components/exercises/attention/FocusAgents.tsx:323` — modo ESPALHADO

Hoje:

```tsx
registra(false, null, true);
setFb({ ok: false, msg: "Acabou o tempo!", alvoUid: charsRef.current.find(...)?.uid ?? null });
setFase("feedback");
timers.current.push(setTimeout(proximaRef.current, 1450));
```

Aqui a violação é **tripla**: a faixa carimba; o `alvoUid` faz o alvo não-tocado ser **ampliado**
(`big`, render ~linha 460); e todos os outros personagens são **escurecidos** (`dim`, ~461). O app
entrega de graça a resposta que o paciente não achou.

**Faça:** trocar o `setFb({...})` por **`setFb(null)`**. Isso resolve os três de uma vez, porque
`big` depende de `fb?.alvoUid === lc.uid` e `dim` de `!!fb` — verifique essa cadeia no render e
confirme no relatório. `registra(false, null, true)` fica; **1450 ms fica**.

## C · `components/exercises/processing/CorridaContraOTempo.tsx` — Busca Rápida

**Este é o único com meio-termo, leia com atenção.** O painel `phase === "roundfb"` (render ~398)
mostra "N/M encontrados" + toques impulsivos, por 1100 ms. Ele tem **duas origens**:

- `endRound()` chamado pelo `setInterval` quando `timeLeft` chega a 0 (~linha 245) → **AVISO
  PASSIVO**, o painel existe para dizer quantos alvos ele **não** achou. **Sai.**
- `endRound()` chamado quando `hitsRef.current >= totalRef.current` (~linha 263), isto é, ele
  **coletou tudo** → **FEEDBACK DE AÇÃO**. **Fica exatamente como está.**

**Faça:** dar a `endRound` um parâmetro que diga a origem (por exemplo
`endRound(porTempo: boolean)`, com as duas chamadas existentes passando o valor certo, e qualquer
outra chamada que você encontrar passando o valor que corresponda à verdade — procure todas com
`grep -n "endRound("`). Quando `porTempo === true`, **o painel não é exibido**.

⚠️ **A pausa de 1100 ms permanece nos dois casos** — a rodada seguinte entra no mesmo tempo. Se a
supressão do painel fizer a transição ficar imediata, você mudou o ritmo: não é isso que se quer.
Se para manter o intervalo for preciso uma fase intermediária sem conteúdo, faça — e explique no
relatório.

O agregado `agg.current` e o `omitted` que vai ao metadata (~linha 429) **não mudam**.

## D · `components/exercises/processing/TempoReacao.tsx:233` — Tempo de Reação

Hoje, em `handleBalloonExit`, quando o balão VERDE sai sem ser tocado:

```tsx
setMissFlash(true);
setTimeout(() => setMissFlash(false), 350);
recordResult(false, null);
```

`missFlash` pinta **a tela inteira de vermelho** (`!bg-red-200`, ~linha 253). E note: é o **mesmo**
flash usado quando o paciente estoura o balão ERRADO (~linha 227). Hoje "errei o alvo" e "deixei
passar" são visualmente idênticos.

**Faça duas coisas:**

1. **Sai o flash da omissão.** Remova `setMissFlash(true)` e o `setTimeout` que o desliga **apenas
   dentro de `handleBalloonExit`**. O flash do toque errado (~227) **fica intocado** — é feedback
   de ação, e a partir de agora ele passa a significar só uma coisa, o que é um ganho.
2. **Passa a existir medida de omissão.** Hoje `recordResult(false, null)` é chamado igual nos dois
   casos e o metadata só leva `trials`, `avgRT` e `correct` (~linha 157): **a omissão não é medida.**
   Se sair o aviso sem isto, a informação some do app inteiro — o que a invariante 2 proíbe.
   Acrescente um terceiro parâmetro opcional a `recordResult` (por exemplo
   `omitted: boolean = false`), passe `true` só na saída do balão-alvo, guarde no resultado da
   tentativa e some no metadata como **`omissions`**, do mesmo jeito que o Semáforo passou a fazer
   em `10a5050`. Não mexa em `accuracy` nem em `avgRT`.

---

## E · Prova de aceite

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # todos passam (a base é 56 arquivos / 762 testes)
```

**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000 e os dois disputam o `.next`.

Confira e cole no relatório:
- `grep -n "Toque mais rápido\|Acabou o tempo" components/exercises/attention/FocusAgents.tsx`
  → **zero linhas**.
- `grep -n "setMissFlash" components/exercises/processing/TempoReacao.tsx` → deve sobrar
  **somente** o par do toque errado; diga quantas ocorrências restaram e em que função cada uma está.
- `grep -n "endRound(" components/exercises/processing/CorridaContraOTempo.tsx` → toda chamada
  passando a origem.
- `grep -rn "omissions" components/exercises/processing/TempoReacao.tsx` → a chave nova no metadata.

## F · Relatório

Item por item (A, B, C, D): o que mudou, e a confirmação de que a pausa correspondente continua com
a mesma duração. Diga explicitamente se em algum ponto a spec esbarrou em algo que você preferiu não
mexer — e não mexa, relate.
