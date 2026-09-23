# Fase 2, fatia B — ligar a regra estável, com opt-in por exercício

> Spec para o Codex. Base: `AUDITORIA-MOTORES-20260923.md` e `SPEC-F2A-REGRA-ESTAVEL-20260923.md`.
> A regra `calculateStableProgression` já existe, provada e **sem chamador** (v3.38.0).
> **Você NÃO commita.**

## O risco desta fatia, e como ela o contorna

Medido: **22 exercícios** caem hoje no `calculateNewDifficulty` legado, e o ponto de entrada é **um
só** — o fallback em `app/api/sessions/route.ts`. Trocar essa linha migraria os 22 **de uma vez**,
que é exatamente o que o cronograma proíbe.

**Portanto: opt-in explícito por exercício.** Uma lista nomeada decide quem usa a regra nova; quem
não está nela continua no legado, sem nenhuma mudança.

## 1. A lista

```ts
/** Exercícios já migrados para a progressão com memória (Fase 2). Cresce aos poucos:
 *  cada entrada nova é uma decisão, não um efeito colateral. Quem não está aqui
 *  continua no motor legado, intocado. */
export const PROGRESSAO_ESTAVEL: ReadonlySet<string> = new Set([
  "mot",
  "informacao-em-foco",
  "estacionamento-logico",
  "cubo-corsi",
]);
```

**Por que estes quatro primeiro:** são os que ela usou e observou recentemente — MOT (duração do
rastreamento), Informação em Foco (reformulação inteira), Estacionamento (layout) e Cubo Corsi (o
modelo de progressão dentro da sessão). **Ela consegue julgar se a mudança faz sentido**, o que não
valeria para um exercício que ela não abre há meses.

Coloque a lista em `lib/adaptive-estavel.ts`, junto da regra.

## 2. Onde ligar

Em `app/api/sessions/route.ts`, **antes** do fallback legado, acrescente um ramo:

```
… dualProg ? … : genericProg ? …
: PROGRESSAO_ESTAVEL.has(data.exerciseId) ? <regra estável>
: calculateNewDifficulty(…)   ← intocado, para todos os demais
```

**Os dados que a regra precisa, e de onde vêm:**

- `accAtual` = `data.accuracy` da sessão que acabou;
- `accsAnteriores` = as **3 últimas** acurácias **deste exercício**, da mais recente para a mais
  antiga. ⚠️ **`recentSessions` já é buscado logo abaixo** (as 20 últimas, com `accuracy` e
  `exerciseId`) — **reaproveite**, filtrando por `exerciseId` e ordenando por `completedAt` desc.
  Não faça uma consulta nova.
- `consolidado` = do `metadata.consolidatedLevel` da última sessão **deste exercício**, como os
  ramos do Dual Task e da Ordem da História já fazem. Sem valor anterior, use `data.difficulty`.

⚠️ **Cuidado com a ordem das operações:** hoje `recentSessions` é buscado **depois** do bloco que
calcula `genericProg`. Se precisar antecipar a busca, **antecipe** — mas confira que nenhum dos
ramos existentes muda de comportamento por isso. É o tipo de mexida que quebra em silêncio.

Grave no metadata, como os outros ramos: `endedLevel`, `consolidatedLevel`, `progressionAction`,
`progressionReason`.

## 3. O que NÃO muda

- ❌ o nível **atual** de nenhum paciente — a regra decide a **próxima** sessão, não reescreve o
  `currentDifficulty` já gravado;
- ❌ `calculateNewDifficulty` e os outros três motores: **intocados**;
- ❌ nenhum componente de exercício;
- ❌ a dose, a interface, o catálogo.

## 4. Testes obrigatórios

Em `lib/adaptive-estavel.test.ts` e/ou arquivo novo:

1. **A lista é explícita e pequena:** `PROGRESSAO_ESTAVEL` tem exatamente os 4 ids acima, e **todos
   existem** em `EXERCISE_DEFINITIONS`. Um id com erro de digitação cairia no legado em silêncio —
   este teste é o que impede.
2. **🔴 Quem NÃO está na lista continua no legado.** Para 3 exercícios de fora (ex.: `torre-hanoi`,
   `semaforo`, `stroop-task`), prove por leitura do código da rota que o caminho deles é
   `calculateNewDifficulty`. Prova por posição, não por presença.
3. **O caminho dos dados:** dado um `recentSessions` montado à mão com sessões de **dois**
   exercícios misturados, prove que `accsAnteriores` sai só com as do exercício certo, **na ordem
   certa** (mais recente primeiro), e no máximo 3. Extraia essa montagem como função pura para
   poder testá-la — não a deixe embutida na rota.
4. **Sem histórico:** primeira sessão do exercício → `accsAnteriores` vazio → a regra **mantém** o
   nível. É o caminho mais provável de erro em produção.
5. **Os quatro motores antigos continuam intactos:** prove por leitura que as assinaturas e os
   corpos de `calculateNewDifficulty`, `calculateProgression`, `calculateStoryTrailProgression` e
   `calculateDualTaskProgression` não mudaram.
6. Toda a suíte existente passando.

## Critério de pronto

1. `PROGRESSAO_ESTAVEL` com os 4, e o ramo na rota.
2. A montagem de `accsAnteriores` como função pura e testada.
3. Os 6 testes, com a prova por posição do item 2.
4. `RELATORIO-CODEX.md` dizendo se precisou antecipar a busca de `recentSessions` e o que conferiu
   para garantir que os ramos existentes não mudaram.
