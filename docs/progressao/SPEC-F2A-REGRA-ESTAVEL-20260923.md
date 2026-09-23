# Fase 2, fatia A — a regra de progressão com MEMÓRIA

> Spec para o Codex. Base: `docs/progressao/AUDITORIA-MOTORES-20260923.md`.
> ⚠️ **Esta fatia NÃO migra exercício nenhum.** Constrói e prova a regra. A migração é a fatia B.
> **Você NÃO commita.**

## Por que uma regra nova, e não a migração que o cronograma previa

A auditoria simulou os dois motores existentes sobre sequências realistas e achou que **o motor
"clínico" não é estritamente melhor que o legado** — em 3 de 8 casos ele decide **pior**:

| caso | legado (média de 5) | clínico (só a sessão atual) |
|---|---|---|
| um dia ruim isolado (0,35 hoje; 0,88-0,92 antes) | mantém | **desce 2** |
| oscilante (0,95 / 0,40 alternando) | mantém | **sobe** |
| desabou hoje, histórico bom | mantém | **desce 2** |

**A raiz:** o clínico não tem memória (olha 1 sessão); o legado tem memória mas faz média, e média
não distingue tendência de ruído.

**Decisões dela, 23/set/2026:**
1. *"Uma sessão ruim isolada não deve mudar o nível"* → **descer exige duas ruins seguidas**.
2. *"Duas seguidas boas para subir"* → evita subir por sorte e resolve o paciente oscilante.

---

## 1. A regra

```ts
export interface StableProgressionInput {
  /** acurácia da sessão que acabou */
  accAtual: number;
  /** acurácia da sessão anterior do MESMO exercício; null na primeira */
  accAnterior: number | null;
  /** maior nível já executado com ≥80% */
  consolidado: number;
}

export function calculateStableProgression(
  currentLevel: number,
  m: StableProgressionInput,
  maxLevel?: number,   // default 10
): ProgressionResult;
```

**Limiares** — os mesmos que já existem no projeto, para não inventar régua nova:
`boa ≥ 0,85` · `ruim < 0,65` · `muito ruim < 0,45` · `consolida ≥ 0,80`.

**As regras, em ordem de avaliação:**

| condição | decisão |
|---|---|
| `accAnterior` é `null` (primeira sessão do exercício) | **mantém** — sem histórico não há tendência |
| atual **e** anterior **muito ruins** (< 0,45) | **desce 2** |
| atual **e** anterior **ruins** (< 0,65) | **desce 1** |
| atual **e** anterior **boas** (≥ 0,85) e `lvl < maxLevel` | **sobe 1** |
| qualquer outro caso | **mantém** |

**A proteção do consolidado, que hoje não existe:**

> Nunca descer **abaixo** do `consolidado` por uma queda de duas sessões. Só abaixo dele quando as
> **três** últimas forem ruins — e nesse caso desce **para** o consolidado menos 1, não mais.

O `consolidado` sai como hoje: `accAtual ≥ 0,80 ? max(consolidado, lvl) : consolidado`.

⚠️ **Como a regra precisa das três últimas para essa proteção**, `accAnterior` vira um array:
troque por **`accsAnteriores: number[]`** — as anteriores da mais recente para a mais antiga, no
máximo 3. `[]` na primeira sessão. **Declare no relatório** se preferiu outra forma e por quê.

## 2. O que NÃO fazer nesta fatia

- ❌ **não migrar exercício nenhum** — nem um. A migração é a fatia B, um por vez, com medição;
- ❌ **não alterar** `calculateNewDifficulty`, `calculateProgression`, `calculateStoryTrailProgression`,
  `calculateDualTaskProgression` nem `calculateFocusProgression` — todas continuam exatamente como
  estão, servindo quem já as usa;
- ❌ **não mexer** em `app/api/sessions/route.ts`;
- ❌ não tocar em componente, catálogo, dose, interface ou outro exercício.

A função nova nasce **ao lado**, sem chamador. É proposital.

## 3. Testes obrigatórios

Em `lib/adaptive-estavel.test.ts` (arquivo novo):

1. **🔴 OS OITO CASOS DA AUDITORIA**, com o comportamento esperado da regra nova. Reimplemente no
   teste os dois motores antigos (ou importe-os) e monte uma **tabela de três colunas** — legado ×
   clínico × estável — afirmando o valor de cada um. É este teste que documenta *por que* a regra
   existe:

| caso | accs (mais recente primeiro) | nível | esperado da regra nova |
|---|---|---|---|
| melhora consistente | 0,90 · 0,88 · 0,86 | 4 | **sobe → 5** |
| um dia ruim isolado | 0,35 · 0,92 · 0,90 | 6 | **mantém 6** |
| piora consistente | 0,40 · 0,45 · 0,50 | 6 | **desce → 4** (duas muito ruins) |
| oscilante | 0,95 · 0,40 · 0,95 | 5 | **mantém 5** |
| estável na faixa boa | 0,75 · 0,78 · 0,72 | 5 | **mantém 5** |
| primeira sessão ótima | 0,95 (sem anterior) | 3 | **mantém 3** |
| duas ótimas | 0,95 · 0,93 | 3 | **sobe → 4** |
| desabou hoje, histórico bom | 0,20 · 0,90 · 0,88 | 7 | **mantém 7** |

2. **A proteção do consolidado morde:** paciente no nível 7 com consolidado 6 e duas sessões ruins
   → desce para 6, **não abaixo**. Com três ruins → desce para 5.
3. **Não sobe acima do teto** nem desce abaixo de 1, em 50 iterações de cada extremo.
4. **Monotonia do consolidado:** ele nunca diminui, em nenhuma sequência.
5. **Prova de simetria:** uma sequência de 20 sessões boas leva do 1 ao teto; 20 ruins levam ao piso;
   e a sequência alternada boa/ruim **não move o nível** em 20 sessões. Esta última é o teste do
   paciente oscilante, que é o caso clínico que motivou a regra.
6. **A função nova não tem chamador ainda:** prove por leitura de código que
   `calculateStableProgression` não é importada por nenhum componente nem pela rota de sessões.
   É a prova de que esta fatia não mudou o comportamento de ninguém.

## Critério de pronto

1. `calculateStableProgression` pura, exportada, em `lib/adaptive-estavel.ts` (arquivo novo).
2. Os 6 testes, com a tabela de três colunas do item 1.
3. Nenhum motor existente alterado; nenhum chamador novo.
4. `RELATORIO-CODEX.md` com a tabela comparativa medida e qualquer divergência.
