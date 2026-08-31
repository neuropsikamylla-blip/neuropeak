# Spec — Compra Multifuncional: o cronômetro para de responder pelo paciente

Data: 2026-08-31
Arquivo principal: `components/exercises/executive/CompraMultifuncional.tsx`
Origem: `docs/auditoria-aviso-omissao/AUDITORIA-AVISO-OMISSAO-2026-08-31.md`, achado A4.
Modelos já executados desta família: commits `dee21e1`, `10a5050`, `43b42b3`. **Leia `43b42b3` e
`10a5050` antes de começar** — este caso é o mais delicado dos seis, e os dois mostram o padrão.

---

## 0. As duas regras dela em jogo

1. *"nao precisa avisar é treino"* (31/ago/2026) — **o app não comenta o que o paciente deixou de
   fazer.**
2. **Depois da instrução, nenhuma dica** (01/ago/2026) — o app não entrega a resposta.

O timeout de hoje viola as duas ao mesmo tempo, e ainda faz uma terceira coisa pior.

## 1. O defeito

Em `onTimeUp()` (linha ~267), quando o cronômetro da etapa zera:

```tsx
firstTryRef.current = false;
if (etapa.dados.modo === "numeric") {
  const ok = stateRef.current.answer !== "" && verificarNumerica(etapa.dados, Number(stateRef.current.answer));
  setCorrect(ok);
  setRevealed(feedbackNumerica(etapa.dados, ok, 3));   // ← 3 = nível de dica MÁXIMO
} else {
  const ids = [...stateRef.current.selected];
  const ok = verificarSelecao(etapa.dados, ids).correto;
  setCorrect(ok);
  setRevealed(feedbackSelecao(etapa.dados, ids, 4));   // ← 4 = nível de dica MÁXIMO
}
setDone(true);
```

Três problemas, em ordem de gravidade:

1. **O app CONFIRMA uma resposta que o paciente não deu.** Se ele não digitou nada, o código ainda
   assim avalia e decide `correct`. Ele não submeteu nada — não há o que julgar.
2. **O app entrega a resposta.** `feedbackNumerica(..., 3)` produz a conta resolvida, do tipo
   *"A conta é 12 + 7 = R$ 19,00."* (ver `lib/compra-missoes.ts:588-589`), no painel âmbar
   "💡 Veja a conta" (render ~402-419).
3. **A omissão é indistinguível do erro no dado.** Só se grava `firstTry: boolean` em
   `sessionResultsRef` (linha ~531): quem não respondeu e quem errou entram idênticos como `false`.

## 2. O que fazer

### 2.1 O timeout deixa de julgar

`onTimeUp()` passa a: **não avaliar, não confirmar, não revelar.** Sem `verificarNumerica`, sem
`verificarSelecao`, sem `setCorrect`, sem `setRevealed` — ou `setRevealed(null)`, o que for mais
limpo no fluxo do componente. A etapa termina como **não respondida**.

`firstTryRef.current = false` **continua** — para o agregado de "acertou de primeira", a etapa não
foi acertada de primeira, e isso não muda.

⚠️ **Atenção ao caso em que ele DIGITOU mas não confirmou.** Trate igual: o tempo esgotou sem
confirmação, logo não houve resposta submetida. Não avalie o rascunho — julgar o que ele não
enviou é exatamente o defeito 1. Se você achar que isso merece tratamento diferente, **não invente:
relate e deixe como esta spec manda.**

### 2.2 A omissão passa a ser medida

Como no Semáforo (`10a5050`) e no Tempo de Reação (`43b42b3`): sai o carimbo, **nunca** a medida —
e aqui a medida não existe ainda, então você a cria.

`sessionResultsRef` hoje guarda `boolean`. Passe a guardar um objeto por etapa, por exemplo
`{ firstTry: boolean; omitted: boolean }`, e ajuste `handleEtapaDone` (linha ~530) e todo consumidor
que você encontrar com `grep -n "sessionResultsRef\|missionResultsRef"`. O `metadata` de
`finishSession` (linha ~522) ganha **`omissions`** — a contagem de etapas encerradas por tempo sem
resposta. **`acertosPrimeira`, `etapas`, `nivelAlcancado`, `tema` e `foco` continuam calculados
exatamente como hoje.**

Se `missionResultsRef` alimenta a progressão/adaptação, ela **não pode mudar de comportamento**: o
que era `false` continua valendo `false` para a adaptação. A informação nova é adicional, não
substitutiva. Confirme isso lendo os consumidores e diga no relatório o que encontrou.

### 2.3 O fluxo depois do tempo

`setDone(true)` continua, e o botão de avançar que já existe para `done` (render ~422, comentário
"só aparece se o tempo esgotou sem acerto") continua sendo a saída. O paciente clica e segue.

**NÃO** faça a etapa avançar sozinha no timeout — seria uma mudança de fluxo que ninguém pediu.
Se o painel de feedback sumir e a tela ficar com um vazio estranho onde ele estava, **não preencha
com texto**: ajuste só o espaçamento e **relate**, que a decisão visual é dela.

## 3. O que NÃO pode mudar

- `lib/compra-missoes.ts` — **nenhuma linha**. `feedbackNumerica`, `feedbackSelecao`,
  `verificarNumerica` e `verificarSelecao` continuam existindo e sendo usados no caminho de quem
  **confirma** (`confirmar()`), que é feedback de ação e fica **idêntico**.
- Os cronômetros (45 s numéricas, 60 s seleção), `etapa.temCronometro`, a geração das missões, a
  escada de dificuldade, `calculateExerciseScore`.
- O caminho de acerto (avança sozinho, sem botão) e o de erro com retry antes do tempo.

## 4. Prova de aceite

```
npx tsc --noEmit          # exit 0, capture o exit code SEM pipe
npm run test              # todos passam (base: 56 arquivos / 762 testes; compra-missoes tem suíte própria)
```

**NÃO rodar `npm run build`** — o dev server dela está no ar na porta 3000.

Cole no relatório:
- `git diff --stat` → `lib/compra-missoes.ts` **não pode aparecer**.
- `grep -n "feedbackNumerica\|feedbackSelecao" components/exercises/executive/CompraMultifuncional.tsx`
  → nenhuma das duas dentro de `onTimeUp`; ambas ainda presentes no caminho de `confirmar()`.
- `grep -rn "omissions" components/exercises/executive/CompraMultifuncional.tsx` → a chave nova.
- A lista de todos os consumidores de `sessionResultsRef`/`missionResultsRef` que você tocou.

## 5. Relatório

O que mudou e por quê, o que encontrou nos consumidores dos dois refs, e **qualquer ponto em que
mexer no timeout ameaçou mudar a adaptação** — se ameaçou, pare ali e relate em vez de decidir.
