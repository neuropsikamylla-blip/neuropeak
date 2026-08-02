# Focus Agentes — comandos novos e escada do MODO ÚNICO (spec de tarefa)

Decisão de produto: `docs/FOCUS-AGENTES-MODO-UNICO.md` (ler antes).
Alvo desta tarefa: **`lib/focus/commands.ts`** e o `STEPS` de
**`components/exercises/attention/FocusAgents.tsx`**. Não tocar em mais nada.

## Estado atual (medido em 02/ago, HEAD 1a6af69)

- `lib/focus/commands.ts` gera **um alvo por rodada**: `FocusRound` tem `alvoId: string` e
  `criterio: Criterio`. As etapas são `1|2|3|4|5` (`Etapa`), montadas em `criterioDaEtapa`.
- `montaCena` já valida **alvo único** (nenhum distrator satisfaz o critério) e, a partir da
  etapa 3, garante ao menos um distrator semelhante.
- `FocusAgents.tsx:60-64` tem `STEPS: { etapa, n, vel }[]` com 13 passos.
- A etapa 4 (lateralidade) **deixa de ser degrau próprio** e vira variação dentro dos passos de
  cor+acessório.

## O que fazer

### 1. `Etapa` passa a ter 6 valores semânticos

Trocar `1|2|3|4|5` por um tipo nomeado — mais legível e é o que o relatório vai ler:

```ts
export type Etapa = "cor" | "acessorio" | "corAcessorio" | "doisAlvos" | "mudancaRegra" | "inibicao";
```

Mapa de compatibilidade: o que hoje é etapa 1 vira `"cor"`/`"acessorio"`, etapa 2 e 3 viram
`"corAcessorio"` (a 3 é a mesma coisa com cena mais difícil — isso passa a ser parâmetro da cena,
não etapa), etapa 4 (lateralidade) some como etapa, etapa 5 vira `"inibicao"`.

`FocusRound` ganha:

```ts
distratoresSemelhantes: boolean;   // era o que a etapa 3 fazia
```

### 2. DOIS ALVOS (`"doisAlvos"`)

`FocusRound` passa a ter **`alvoIds: string[]`** (1 ou 2 ids). Manter `alvoId` como o primeiro
elemento, para não quebrar quem já lê (`FocusAgents.tsx` usa `round.alvoId`).

Regras — adaptadas da Chuva removida (`buildCommand`, commit `bdcbc00`), que resolvia isto bem:

- 2 critérios **distintos**, cada um com **exatamente um** alvo na cena;
- **sem sobreposição**: o alvo A não pode satisfazer o critério B, nem vice-versa;
- nenhum distrator satisfaz qualquer um dos dois critérios;
- texto curto, unindo os fragmentos com " e o ":
  `"Toque no azul de boné e o vermelho de gorro"`;
- se não houver combinação válida em 60 tentativas, **cai para 1 alvo** (fallback gracioso, nunca
  devolve rodada inválida).

### 3. MUDANÇA DE REGRA (`"mudancaRegra"`)

A rodada nasce com um critério e o comando se **corrige** antes de o paciente responder:

```ts
criterioAbandonado: Criterio;   // o primeiro critério, que NÃO vale mais
```

- Texto: `"Ache o agente azul… não, o amarelo"` (o gerador monta as duas partes).
- O **critério válido é o segundo**. O primeiro entra na cena como armadilha: **tem que existir
  exatamente um agente** que satisfaz o critério abandonado (senão a correção não treina nada).
- Alvo único para o critério válido, como sempre.
- Os dois critérios devem ser do mesmo tipo (cor→cor, ou acessório→acessório): a correção é de
  VALOR, não de atributo.

### 4. Escada nova em `FocusAgents.tsx`

```ts
const STEPS: Step[] = [
  { etapa: "cor",           n: 7,  vel: 0, semelhantes: false },
  { etapa: "cor",           n: 8,  vel: 0, semelhantes: false },
  { etapa: "acessorio",     n: 8,  vel: 0, semelhantes: false },
  { etapa: "corAcessorio",  n: 8,  vel: 1, semelhantes: false },
  { etapa: "corAcessorio",  n: 9,  vel: 1, semelhantes: false },
  { etapa: "corAcessorio",  n: 10, vel: 1, semelhantes: true  },
  { etapa: "doisAlvos",     n: 9,  vel: 1, semelhantes: false },
  { etapa: "doisAlvos",     n: 10, vel: 2, semelhantes: true  },
  { etapa: "mudancaRegra",  n: 9,  vel: 1, semelhantes: false },
  { etapa: "mudancaRegra",  n: 10, vel: 2, semelhantes: true  },
  { etapa: "inibicao",      n: 10, vel: 2, semelhantes: false },
  { etapa: "inibicao",      n: 11, vel: 3, semelhantes: true  },
  { etapa: "inibicao",      n: 12, vel: 3, semelhantes: true  },
];
```

`Step` ganha `semelhantes: boolean`, repassado a `gerarRodada`. Continuam 13 passos — o teto
(`FOCUS_MAX_LEVEL` = 13) não muda.

### 5. Função cognitiva de cada etapa (o relatório vai usar)

Exportar de `lib/focus/commands.ts`:

```ts
export type FuncaoCognitiva = "seletiva" | "memoriaTrabalho" | "flexibilidade" | "inibicao";
export const FUNCAO_DA_ETAPA: Record<Etapa, FuncaoCognitiva> = {
  cor: "seletiva", acessorio: "seletiva", corAcessorio: "seletiva",
  doisAlvos: "memoriaTrabalho", mudancaRegra: "flexibilidade", inibicao: "inibicao",
};
```

## O que NÃO fazer

- Não mexer em `lib/focus/roster.ts`, `lib/focus/progression.ts`, `lib/focus-report.ts` nem na
  página do terapeuta (é o passo seguinte, do VP).
- Não mexer no visual do componente (fundo/cores) — outro passo.
- Não remover a validação de alvo único nem o distrator semelhante já existentes.
- Não introduzir pontuação, peso de tipo de comando ou gamificação.

## Prova de aceite (escrever ANTES em `lib/focus/commands.test.ts`)

Manter os testes existentes passando (adaptando só os nomes de etapa) e acrescentar:

1. **Alvo único, todas as etapas:** para cada etapa e para `n` de 7 a 12, 200 rodadas — exatamente
   `alvoIds.length` personagens da cena satisfazem o critério válido.
2. **Dois alvos sem sobreposição:** em `"doisAlvos"`, 200 rodadas — `alvoIds.length === 2`, os dois
   ids são distintos, o alvo A não satisfaz o critério B e o B não satisfaz o A.
3. **Dois alvos: nenhum distrator** satisfaz qualquer um dos dois critérios.
4. **Mudança de regra:** em `"mudancaRegra"`, 200 rodadas — existe `criterioAbandonado`, existe
   **exatamente um** agente na cena que o satisfaz, e esse agente **não** é o alvo válido.
5. **Texto da correção** contém "não" (a frase se corrige de verdade).
6. **Inibição continua negativa:** em `"inibicao"`, `negativo === true` em pelo menos 80% das
   rodadas (como hoje).
7. **Escada:** `STEPS.length === 13`; entre dois passos consecutivos muda **no máximo uma** entre
   `etapa`, `n` e `vel` (uma variável nova por passo) — este teste vai no arquivo de teste do
   componente ou num teste novo de `lib/focus`, exportando `STEPS` se necessário.
8. **Fallback:** forçando um `n` pequeno (7) em `"doisAlvos"`, a rodada devolvida continua válida
   (1 ou 2 alvos), nunca `null` nem com alvo ambíguo.

## Provas a rodar

```
npx tsc --noEmit      # exit 0
npx vitest run        # tudo verde
```

Não commitar: entregar o diff no worktree (o VP revisa linha a linha, aplica, prova e commita).
