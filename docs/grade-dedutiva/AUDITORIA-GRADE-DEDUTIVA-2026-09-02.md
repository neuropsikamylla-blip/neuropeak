# Auditoria técnica — Grade Dedutiva (`deductive-grid`)

> **Fase F1 da espec** de 02/set/2026 (`ESPEC-GRADE-DEDUTIVA-KAMYLLA-20260902.md`, 103 seções).
> Leitura apenas: nenhum arquivo de código foi alterado, nenhuma migration foi executada,
> nenhum commit foi feito nesta auditoria.
> Toda afirmação abaixo vem do código real, com `arquivo:linha`. Onde não foi possível
> determinar, está escrito **não determinado** com o que faltaria.
>
> Data: 02/set/2026 · Base: branch `main`, commit `588d9c9`.

---

## 1. Como a Grade Dedutiva está modelada hoje

**Modelo:** um único atributo por puzzle. Não é um *logic grid puzzle* — é uma
**bijeção pessoa → valor** em uma só categoria.

`components/exercises/executive/DeductiveGrid.tsx:20-28`:

```ts
interface Puzzle {
  title: string;
  people: string[];
  attribute: string;
  values: string[];
  clues: string[];                     // texto puro, sem semântica
  solution: Record<string, string>;    // person → value
  difficulty: 1 | 2 | 3 | 4;
}
```

Consequências estruturais, todas verificáveis no arquivo:

- **Uma categoria só.** `attribute` é singular e `values` é uma lista só
  (`DeductiveGrid.tsx:23-24`). Não existe conceito de posição, de segunda categoria nem de
  relação cruzada. A espec pede N posições × múltiplas categorias (seções 3–5) — isso **não
  existe** hoje em nenhuma forma.
- **Pistas são strings opacas.** `clues: string[]` (`DeductiveGrid.tsx:25`) e a renderização
  é literal (`DeductiveGrid.tsx:644-646`). Não há `type`, `operands`, `constraint`,
  `skillTags`, `difficulty` nem `restrictivePower` — a espec pede tudo isso na seção 19.
  **Nenhuma pista é computável.**
- **Três estados de célula, não quatro.** `type CellState = "empty" | "yes" | "no"`
  (`DeductiveGrid.tsx:392`). Não existe `?` (hipótese) — o estado que a espec das seções 7–8
  trata como central, para separar hipótese falsa de conclusão falsa.
- **Ciclo de clique:** `empty → yes → no → empty` (`DeductiveGrid.tsx:508-511`), com dica
  fixa em tela "Toque: 1x = ✓ (SIM), 2x = ✗ (NÃO), 3x = apaga" (`DeductiveGrid.tsx:722`).
- **Regra 1:1 parcial e automática:** ao marcar `yes`, os demais `yes` da **mesma linha**
  viram `no` (`DeductiveGrid.tsx:515-521`). O software faz a dedução pelo paciente naquela
  direção; e a exclusividade por **coluna** (dois nomes no mesmo valor) não é impedida nem
  detectada.
- **Layout:** `ExerciseStage width="medio"` (`DeductiveGrid.tsx:630`), tabela HTML com célula
  `w-11 h-11` (3×3) ou `w-9 h-9` (4×4) (`DeductiveGrid.tsx:625-626`), `overflow-x-auto`
  (`DeductiveGrid.tsx:650`). É exatamente o "card minúsculo numa tela enorme" que a seção 12
  proíbe.
- **Feedback imediato de erro:** ao confirmar errado, a célula marcada e a célula da solução
  ficam laranja (`DeductiveGrid.tsx:540-541,547`) e aparece "⚠️ Algumas células estão erradas"
  (`DeductiveGrid.tsx:691-695`). Isso **entrega a posição do erro** e viola diretamente as
  seções 14–15 (o monitoramento passa a ser do software) — e, ao acender a célula da
  solução, chega perto de entregar a resposta.
- **Gamificação presente:** "✅ Correto! Excelente raciocínio!"
  (`DeductiveGrid.tsx:699-707`) e o emoji 🔍 no título (`DeductiveGrid.tsx:636`). As
  seções 10–11 e 70 pedem o oposto.

## 2. Arquivos que participam

| Papel | Arquivo | Evidência |
|---|---|---|
| Componente (tudo: dados + UI + tutorial + scoring) | `components/exercises/executive/DeductiveGrid.tsx` (727 linhas) | arquivo inteiro |
| Banco de puzzles | **dentro do próprio componente**, `const PUZZLES` | `DeductiveGrid.tsx:30-379` |
| Seleção por dificuldade | **dentro do componente**, `getPuzzlePool` | `DeductiveGrid.tsx:381-390` |
| Tutorial (legado, embutido) | `TutStep1` + `DeductiveGridTutorial` | `DeductiveGrid.tsx:396-462` |
| Rota / switch | `app/(patient)/treino/[exercicio]/page.tsx:768` | `case "deductive-grid": return <DeductiveGrid {...props} />;` |
| Lazy import | `app/(patient)/treino/[exercicio]/page.tsx:112` | `dynamic(... DeductiveGrid ...)` |
| Instruções da tela de abertura | `app/(patient)/treino/[exercicio]/page.tsx:326-331` | 4 linhas de texto |
| Barra de progresso própria | `HIDE_PROGRESS_WIDGET` inclui `deductive-grid` | `app/(patient)/treino/[exercicio]/page.tsx:780` |
| Definição do exercício | `types/index.ts:402-409` | nome "Grade Dedutiva", domínio `executive`, 7 min, ícone 🔍 |
| Taxonomia | `lib/domain-taxonomy.ts:34` | subdomínio `logico` — "Raciocínio Lógico" |
| Metadados de carga | `lib/exercise-meta.ts:44` | `{ type: "espacial", difficulty: "dificil", secondary: ["Resolução de Problemas"] }` |
| Ícone | `lib/exercise-icons.ts:40` | lista de ícones 3D |
| Versão de tutorial | `lib/tutorial/versions.ts:23` | `"deductive-grid": 1` |
| Tela de revisão de layout (dev) | `app/revisar-layout/page.tsx:33,75,117` | atalho para inspeção visual |
| Arquitetura clínica (docs, descritivos) | `docs/clinical-architecture/cognitive-matrix.json:1561`, `docs/clinical-architecture/associated-profiles.json:383`, `docs/prescription-architecture/prescription-parameters.json:1916` | — |

**Testes:** **não existe nenhum teste do exercício**. Todas as ocorrências de
`deductive-grid` em arquivos `.test.ts` o usam apenas como *id de exemplo* em testes de
outros módulos:

- `lib/exercise-retirement.test.ts:41` — lista de ids canônicos vivos.
- `lib/layout/palco.test.ts:46,171` — obriga o arquivo a usar `ExerciseStage width="medio"`.
- `lib/prescription/*.test.ts` (`assistant-clinical`, `presentation-phase1`,
  `presentation-finalization`, `interpreter`, `alert-taxonomy`) — id usado para montar planos
  fictícios.

Ou seja: **zero cobertura de lógica dedutiva, de validação de solução e de progressão.**

**Armadilha encontrada:** `lib/tutorial/versions.ts:23` declara versão de tutorial para
`deductive-grid`, mas o exercício **não está** no registro
`TUTORIAIS_POR_EXERCICIO` (`app/(patient)/treino/[exercicio]/page.tsx:56-76`). Logo
`tutorialAtual` é `undefined` (`page.tsx:462`) e o framework T1 nunca roda: quem roda é o
tutorial legado interno do componente (`DeductiveGrid.tsx:453-462`), que não grava nada, não
tem versão e não é o exercício rodando. Isso conflita com a regra dela de
"tutorial É o exercício rodando".

## 3. Como os problemas são armazenados — banco ou runtime?

**Nenhum dos dois no sentido pleno: é um array literal hard-coded dentro do componente
React.** `const PUZZLES: Puzzle[]` em `DeductiveGrid.tsx:30-379`.

- **Não há banco de dados.** `grep` por `deductive-grid` em `prisma/schema.prisma` retorna
  vazio; não existe tabela, coluna nem seed. Os únicos registros no Postgres são linhas
  genéricas de `Session` e, desde 01/set, de `ExerciseAttempt`.
- **Não há geração em runtime.** Nada é sorteado exceto a **ordem** do pool:
  `getPuzzlePool(difficulty).sort(() => Math.random() - 0.5)` (`DeductiveGrid.tsx:469`).
  Nota técnica: esse `sort` com comparador aleatório é um embaralhamento enviesado (não é
  Fisher-Yates), mas como o efeito é só a ordem de apresentação, o impacto clínico é baixo.
- **Contagem real:** 27 puzzles — 7 de `difficulty:1`, 7 de `2`, 8 de `3`, 5 de `4`
  (contados em `DeductiveGrid.tsx:32-378`). Formatos: 3×1 categoria (21 puzzles) e
  4×1 categoria (5 puzzles).
- **Ciclagem:** `pool.current[puzzleIdx % pool.current.length]` (`DeductiveGrid.tsx:482`) —
  quando o pool acaba, ele **repete** dentro da mesma sessão, sem controle de repetição.
- **Não há metadata alguma por puzzle** além de `difficulty: 1|2|3|4`. Nada de
  `inferenceDepthDistribution`, `skillWeights`, `clueTypeDistribution`,
  `validatedUniqueSolution` (seção 25).

## 4. Como a solução é validada — solver ou gabarito?

**Gabarito fixo, comparação literal. Não existe solver, nem nada parecido.**

`DeductiveGrid.tsx:527-549`:

```ts
for (const person of currentPuzzle.people) {
  const selected = currentPuzzle.values.find(v => grid[`${person}|${v}`] === "yes");
  if (selected !== currentPuzzle.solution[person]) { ... correct = false; }
}
```

Consequências, todas verificáveis:

- **As pistas nunca são lidas pelo programa.** São strings exibidas
  (`DeductiveGrid.tsx:644-646`). Nada garante que o texto da pista corresponda à `solution`
  escrita à mão logo abaixo dele.
- **Unicidade da solução nunca foi provada.** Não há contagem de soluções, não há teste.
  A afirmação "cada puzzle tem uma solução" hoje é **DESCONHECIDA** — depende de o autor ter
  acertado à mão em 27 casos.
- **Exemplo concreto de fragilidade:** `DeductiveGrid.tsx:96-107` ("Esportes") tem 3 pistas;
  `DeductiveGrid.tsx:129-140` ("Cidades") tem 3 pistas. Não há mecanismo que impeça alguém
  de acrescentar amanhã um puzzle ambíguo — nada quebraria, nenhum teste falharia.
- **A marcação `no` do paciente é ignorada na validação.** Só a existência de um `yes` por
  linha conta (`DeductiveGrid.tsx:529-532` e `:537-538`). Quem marcar tudo `no` e um `yes`
  certo por linha passa.
- **Não há verificação de consistência parcial**, nem detecção de contradição, nem noção de
  pista em conflito. Os itens 23–33 da espec não têm **nenhuma** contrapartida no código.

## 5. Dificuldade e progressão — qual caminho de `lib/adaptive.ts`?

**Resposta direta: o caminho LEGADO `calculateNewDifficulty`.**

Prova por eliminação, em `app/api/sessions/route.ts`:

- `linha 68` — o ramo da Dupla Tarefa exige `data.exerciseId === "dual-task"`. Não é o caso.
- `linha 94` — o ramo da trilha exige `exerciseId === "ordem-historia"`. Não é o caso.
- `linha 115` — o ramo genérico exige `meta.progressionV2 === true && typeof meta.accTotal === "number"`.
  O `metadata` da Grade Dedutiva é `{ puzzlesSolved, totalErrors }` (`DeductiveGrid.tsx:572`):
  **não tem `progressionV2` nem `accTotal`**. `grep -rn "progressionV2"` confirma que
  `DeductiveGrid.tsx` não aparece na lista.
- `linha 147` — ramo do Focus Agentes, por id. Não é o caso.
- Logo `dualProg` e `genericProg` ficam `null` e cai no `else` de
  `app/api/sessions/route.ts:180-188`: `calculateNewDifficulty(data.difficulty, recentSessions, data.exerciseId)`.

O que `calculateNewDifficulty` faz (`lib/adaptive.ts:8-52`): pega as **20 últimas sessões do
paciente em qualquer exercício** (`app/api/sessions/route.ts:173-177`), filtra por
`exerciseId`, fica com no máximo 5, e:

- menos de 2 sessões → mantém (`lib/adaptive.ts:19-25`);
- média de acurácia > 0,85 e dificuldade < 10 → **+1**, teto 10 (`lib/adaptive.ts:29-36`);
- média < 0,60 e dificuldade > 1 → **−1** (`lib/adaptive.ts:38-45`);
- entre 0,60 e 0,85 → mantém (`lib/adaptive.ts:47-51`).

**Armadilha do filtro em duas etapas:** o `take: 20` é sobre **todas** as sessões do paciente.
Se o paciente treinar vários exercícios, as sessões da Grade Dedutiva podem sair da janela
de 20 e o resultado vira "sessões insuficientes → mantém". Ou seja, a progressão dela
**pode parar de existir** dependendo do plano de treino. Isso não é específico da Grade
Dedutiva, mas afeta-a hoje.

**Dificuldade → conteúdo** (`DeductiveGrid.tsx:381-390`): `d ≤ 1` → puzzles 1–2;
`d ≤ 3` → só 2; `d ≤ 5` → 2 e 3; `d ≤ 7` → só 3; `d ≤ 9` → 3 e 4; `d ≥ 10` → só 4.
São **10 degraus mapeados em 4 baldes**, todos 3×1 ou 4×1 categoria. A escada de 5 níveis da
seção 63 (4×3 → 5×6, profundidade 1→4+) não tem correspondência.

**Nível consolidado:** não existe para este exercício — `consolidatedLevel` só é gravado nos
três ramos novos (`app/api/sessions/route.ts:91, 112, 140`).

## 6. Dados salvos — chaves exatas do `metadata`

`DeductiveGrid.tsx:565-573`:

```ts
onComplete({
  exerciseId: "deductive-grid",
  domain: "executive",
  score,            // calculateExerciseScore("deductive-grid", accuracy, undefined, difficulty)
  accuracy,         // Math.max(0, 1 - totalErrors / (nextTotal * 2))
  difficulty,       // a mesma que entrou; nunca muda dentro da sessão
  duration,         // elapsedSec()
  metadata: { puzzlesSolved: nextTotal, totalErrors },
});
```

**O `metadata` tem exatamente duas chaves: `puzzlesSolved` e `totalErrors`.** Mais nada.

Observações com peso clínico:

- **`accuracy` é uma fórmula improvisada**, não uma proporção de acertos:
  `1 - totalErrors / (puzzles * 2)` (`DeductiveGrid.tsx:562`). Duas tentativas erradas de
  confirmação em um puzzle zeram a acurácia daquele puzzle; três derrubam a média global.
  Não representa "proporção de relações corretas" nem nada auditável.
- **`totalErrors` conta cliques em "Confirmar" com resultado errado**
  (`DeductiveGrid.tsx:546-549`), não erros lógicos. Um paciente que raciocina certo e erra um
  clique gera o mesmo dado que um que não entendeu nada.
- **A sessão só é gravada se o último puzzle for concluído CORRETAMENTE.** O `onComplete` está
  dentro do bloco de sucesso (`DeductiveGrid.tsx:553-580`): a checagem `isTimeUp()` só é
  avaliada depois de um acerto (`DeductiveGrid.tsx:558`). Se o tempo acabar e o paciente
  estiver no meio de um puzzle, **nada é enviado** enquanto ele não acertar mais um. Isso é um
  buraco real de registro, e explica por que "abandono" precisa da `ExerciseAttempt`.
- **Nenhum registro por ação, por pista, por tipo de erro ou por tempo intermediário.**
  A espec (seções 44–45, 86) pede ~20 campos por ação. Hoje: 2 campos por sessão inteira.

## 7. Relatório do lado do terapeuta

**Não existe nada específico para a Grade Dedutiva. Só o genérico.**

- `app/api/reports/route.ts` monta o PDF a partir de `calculateDomainScore(sessions)`
  (`app/api/reports/route.ts:194`) e imprime, na tabela de sessões, apenas o `exerciseId` cru
  (`app/api/reports/route.ts:292`). O `metadata` só é lido para saber se a sessão foi
  abandonada (`app/api/reports/route.ts:190-191`) — `puzzlesSolved` e `totalErrors`
  **nunca são lidos por ninguém**.
- Busca por componentes de terapeuta que citem o exercício:
  `grep -rln "deductive|Grade Dedutiva" app/(therapist)/ components/therapist/ components/reports/ app/api/reports/` → **vazio**.
  O único componente por exercício em `components/therapist/` é `CaminhosMetaConfig.tsx`
  (do `antes-depois`).
- Ou seja, o terapeuta vê hoje: o exercício no catálogo/plano, e no histórico as colunas
  genéricas (score, acurácia, dificuldade, duração). Todo o relatório de processo das seções
  72–79 é **construção do zero**.

## 8. O que pode ser reaproveitado

**Da Grade Dedutiva atual — pouco, e nada do núcleo:**

1. O **ponto de entrada**: `case "deductive-grid"` (`page.tsx:768`), o lazy import
   (`page.tsx:112`), a definição em `types/index.ts:402-409` e a taxonomia
   (`lib/domain-taxonomy.ts:34`). O id se mantém, o histórico de sessões antigas continua
   ligado.
2. O **contrato de saída** `ExerciseResult` → `POST /api/sessions` → `Session` +
   `ExerciseConfig` (`app/api/sessions/route.ts:159-204`). Continua servindo para score,
   acurácia, dificuldade e duração.
3. `ExerciseStage` e `ExerciseProgressBar` (`DeductiveGrid.tsx:6-9`) — mas a largura terá de
   deixar de ser `"medio"`, e há um teste que trava isso hoje
   (`lib/layout/palco.test.ts:46`): mudar a largura **quebra esse teste**, que precisará ser
   atualizado no mesmo passo.
4. `useTimedProgress` (`DeductiveGrid.tsx:467`) — sessão por tempo (~7 min) é exatamente o que
   a seção 82 pede ("sem número fixo, se a plataforma já controla a duração").
5. Os 27 puzzles servem como **matéria-prima do tutorial 3×3** (seção 6) — e só. Como
   exercício real, a própria espec (seção 2) os declara simples demais.

**De outros módulos da casa — muito, e é o mais valioso:**

6. **`lib/torres/` é o precedente direto** e deve ser copiado como padrão arquitetural:
   - `lib/torres/banco.ts:95-104` — **banco fechado, validado no carregamento do módulo**:
     `preValidar` roda a busca e **lança erro** se o problema não fecha; `BANCO` é
     `Object.freeze(DEFINICOES.map(preValidar))`. É literalmente o
     "nunca liberar puzzle não validado" da seção 65, já funcionando.
   - `lib/torres/minimo.ts` — BFS com reconstrução de caminho; molde para o solver.
   - `lib/torres/selecao.ts:51-77` — `proximoProblema(fase, jaUsados, ultimosTipos, aleatorio, banco)`
     com **aleatoriedade injetada** (teste determinístico), não-repetição e
     anti-previsibilidade. Serve quase sem mudança para escolher o próximo puzzle.
   - `lib/torres/selecao.ts:12-37` — `faseDaDificuldade` / `dificuldadeDaFase`: o par de
     conversão que resolve o bug de "gravou uma coisa, leu outra". A Grade Dedutiva vai
     precisar do mesmo par (nível 1–5 ↔ dificuldade 1–10).
   - Separação em arquivos pequenos com `.test.ts` ao lado (5 pares em `lib/torres/`).
7. **`ExerciseAttempt` + `/api/attempts`** (`prisma/schema.prisma:195-208`,
   `app/api/attempts/route.ts`) — já resolve "nunca iniciou × iniciou e abandonou". Ver §10.
8. **Framework de tutorial T1** (`lib/tutorial/definitions/*.tsx`, `lib/tutorial/state.ts`,
   `lib/tutorial/versions.ts`) — pronto, com versionamento e gravação; a Grade Dedutiva ainda
   não usa.
9. **Engine de progressão genérica** `calculateProgression` (`lib/adaptive.ts:90-129`) e o
   ramo `progressionV2` (`app/api/sessions/route.ts:115-142`) — a porta de entrada legítima
   para o nível macro. Ver §13.
10. `calculateExerciseScore` (`lib/scoring.ts`) — mantém o 0–100 que alimenta
    `calculateDomainScore` e o PDF.

## 9. O que precisa ser substituído

| Peça atual | Evidência | Por quê |
|---|---|---|
| Modelo `Puzzle` de categoria única | `DeductiveGrid.tsx:20-28` | A espec exige N posições × M categorias (3–5, 63) |
| `clues: string[]` | `DeductiveGrid.tsx:25` | Pistas precisam ser **computáveis** com `{id,text,type,operands,constraint,skillTags,difficulty,restrictivePower}` (19) |
| `CellState` de 3 estados | `DeductiveGrid.tsx:392` | Falta `?` hipótese (7–8) |
| Auto-dedução ao marcar `yes` | `DeductiveGrid.tsx:515-521` | O software deduz pelo paciente; e não cobre exclusividade por coluna |
| Validação por gabarito | `DeductiveGrid.tsx:527-549` | Precisa de CSP: validar, contar, provar unicidade, testar parcial, achar contradição (23–33) |
| Feedback de erro por célula | `DeductiveGrid.tsx:540-541,547, 691-695` | Viola frontalmente 14–15 (monitoramento tem de ser do paciente) |
| `accuracy = 1 - err/(n*2)` | `DeductiveGrid.tsx:562` | Número sem significado clínico; a espec quer indicadores, não escore improvisado (40–43) |
| `metadata: {puzzlesSolved,totalErrors}` | `DeductiveGrid.tsx:572` | Insuficiente para reconstruir o raciocínio (44–45, 86) |
| Tutorial legado interno | `DeductiveGrid.tsx:396-462` | Não é o exercício rodando; fora do framework T1; hoje só faz "clique 3 vezes" |
| `getPuzzlePool` por 4 baldes | `DeductiveGrid.tsx:381-390` | Precisa de seleção por vetor de habilidades e por carga (61–63) |
| Layout `width="medio"` + tabela apertada | `DeductiveGrid.tsx:630, 624-626` | Seções 12–13, 90–93 (desktop lado a lado, mobile sem zoom) |
| Emoji + "Excelente raciocínio!" | `DeductiveGrid.tsx:636, 699-707` | Seções 10–11, 70 (adulto, pouco gamificado, feedback mínimo) |
| Caminho legado `calculateNewDifficulty` | `app/api/sessions/route.ts:180-188` | Ver §13 |
| Ausência total de testes | — | Seções 95–98 exigem 44 testes |

## 10. Supabase — veredito

**Para "nunca iniciou × iniciou e abandonou" (seção 85): NÃO precisa de migration. Já está
resolvido.**

Prova:

- `prisma/schema.prisma:195-208` — `model ExerciseAttempt { id, patientId, exerciseId,
  status ("INICIADO"|"CONCLUIDO"|"INTERROMPIDO"), difficulty, startedAt, endedAt, metadata }`,
  com índices `[patientId, exerciseId]` e `[status]`.
- `app/api/attempts/route.ts:41-54` (POST abre a tentativa) e `:55-70` (PATCH fecha).
- `components/exercises/ExerciseWrapper.tsx:122-147` — `abrirTentativa` / `fecharTentativa`,
  chamadas em `:163` (ao sair das instruções, quando não há tutorial), `:186` (ao terminar o
  tutorial) e `:150` (ao concluir).
- **Vale para a Grade Dedutiva?** Sim. O exercício passa pelo `ExerciseWrapper`
  (`app/(patient)/treino/[exercicio]/page.tsx:783-799`) e tem 4 instruções
  (`page.tsx:326-331`), então entra pela fase `instructions` e a tentativa é aberta em
  `leaveInstructions()` (`ExerciseWrapper.tsx:159-165`). O abandono é **inferido**: `INICIADO`
  que nunca virou `CONCLUIDO` (comentário em `app/api/attempts/route.ts:9-20`).
- O campo `ExerciseAttempt.metadata` é `String?` **sem limite no banco**; a rota hoje limita a
  8000 caracteres no Zod (`app/api/attempts/route.ts:30`). Esse limite é de aplicação,
  ajustável sem migration.

**O que ainda NÃO existe e é onde a decisão de migration realmente cai:** a seção 44 pede um
**registro por ação** (~20 campos por ação, dezenas a centenas de ações por puzzle). Isso não
cabe nem no `Session.metadata` nem, com folga, no `ExerciseAttempt.metadata` atual. Ver §12 —
lá está a estimativa de tamanho e as três opções, sendo que **duas delas não exigem
migration**. Conforme a instrução dela: **nesta auditoria não se propõe nem se executa
migration**; a decisão fica para uma etapa própria, com backup nível 1 ou 2 conforme
`docs/operacao/backup-procedimento.md`.

**Ressalva honesta:** não foi verificado no banco de produção se a tabela `ExerciseAttempt`
realmente existe lá (o schema Prisma diz que sim, mas `db push` é manual). **Não determinado**
— faltaria uma consulta ao Postgres de produção, que esta auditoria não fez por ser leitura de
código apenas.

## 11. Arquitetura recomendada para o solver

### 11.1 Espaço de busca — medido, não estimado

Modelo da espec no pior caso da seção 63 (nível 5): **5 posições × 6 categorias**, cada
categoria com 5 elementos em bijeção com as posições.

- Se uma das 6 categorias for a própria posição (1..5), sobram 5 categorias livres:
  **(5!)^5 = 24.883.200.000** atribuições completas (≈ 2,49 × 10¹⁰).
- Se as 6 forem categorias de atributo além da posição:
  **(5!)^6 = 2.985.984.000.000** (≈ 2,99 × 10¹²).
- Tamanho da representação: 15 pares de categorias × 25 células = **375 células** par-a-par
  (ou 125 se a grade for só posição × 5 atributos).

**Enumeração exaustiva é inviável — e isto foi medido, não suposto.** Benchmark em Node
(mesma máquina, laço puro com um teste de restrição de apenas 3 comparações):

```
$ node bench.js
112.447.667 atribuições em 3.001s => 37.470.066/s
(5!)^5 levaria 11.1 min; (5!)^6 levaria 22.1 h
```
(exit code 0; script em `scratchpad/bench.js`, fora do repositório)

E esses 11 minutos são o **piso otimista**: o teste real precisa avaliar ~16–22 pistas por
candidato, não 3 comparações — de 10 a 50 vezes mais caro. Ou seja, **horas a dias por
puzzle**, para uma operação que o exercício precisa fazer **a cada ação do paciente**
(testar se a marcação parcial ainda admite solução, seção 23). Exaustivo está fora de
discussão.

### 11.2 A arquitetura: propagação de restrições + busca com poda

Recomendo **CSP com matriz de possibilidades em bitmask + propagação até o ponto fixo +
backtracking com MRV**, no molde de `lib/torres/` (motor puro em `lib/`, sem React, com
teste ao lado).

**Representação.** Para cada categoria `c` e elemento `e`, um inteiro de 5 bits com as
posições ainda possíveis: `dom[c][e] ∈ [0, 31]`. Marcar `×` é limpar um bit; `✓` é reduzir o
domínio a um bit. Todo o estado do puzzle cabe em ~30 inteiros — barato de copiar, barato de
comparar, trivial de serializar.

**Propagação (o que faz o custo desabar).** Aplicar até estabilizar:
1. *singleton*: domínio com um bit → fixa a posição e limpa esse bit dos outros elementos da
   mesma categoria;
2. *hidden single*: uma posição só possível para um elemento da categoria → fixa;
3. propagação de cada pista pelo seu operador (T1…T11), reescrita como redução de domínio;
4. transitividade entre categorias: se `A=e₁` implica posição `p` e `B=e₂` está na posição
   `p`, propaga a associação cruzada.

**Busca.** Só quando a propagação empaca: escolher o elemento de **menor domínio** (MRV),
ramificar por posição, propagar, recursar. Em puzzles bem construídos de 5×6 a busca costuma
não passar de 2–4 níveis de profundidade, e o custo por puzzle cai de 10¹⁰ para a ordem de
10³–10⁴ nós.

**API mínima do motor** (arquivo `lib/grade-dedutiva/solver.ts`, motor puro, sem React):

| Função | Uso | Onde roda |
|---|---|---|
| `resolver(puzzle, limite)` → `Solucao[]` | núcleo; para assim que junta `limite` soluções | autoria + runtime |
| `contarSolucoes(puzzle, limite=2)` | unicidade: `=== 1` aceita, `0` inconsistente, `≥2` ambíguo (seção 24) | autoria (e teste) |
| `ehUnico(puzzle)` | açúcar de `contarSolucoes(puzzle,2) === 1` | validação do banco |
| `admiteSolucao(puzzle, marcasDoPaciente)` | as marcas `✓`/`×` entram como restrições unárias; `contarSolucoes(...,1) > 0` | runtime, a cada ação |
| `fecho(puzzle, marcasEntailed)` | só propagação, sem busca; devolve o que está **forçado** | runtime |
| `pistasEmConflito(puzzle, marcas)` | conjunto mínimo de pistas que torna a marcação impossível | runtime |

**Unicidade custa pouco:** `contarSolucoes` com limite 2 **aborta na segunda solução** — não
precisa enumerar tudo para provar ambiguidade.

**Conjunto mínimo de contradição (MUS, seções 32–33).** Com 16–22 pistas, use
**QuickXplain / eliminação por deleção**: tenta remover cada pista e verifica se a
inconsistência persiste; o que sobra é minimal. Custo: O(n) a O(n log n) chamadas do solver
— com o solver na casa dos milissegundos, são dezenas de milissegundos. **É viável já na
primeira versão**, ao contrário do que a espec previa como possível corte. Recomendo
implementar completo e, se o tempo medido passar de ~150 ms, degradar para
"conjunto relevante não-minimal" com uma bandeira no registro (`mus: "minimal" | "relevante"`),
para o relatório nunca afirmar minimalidade que não teve.

### 11.3 A decisão que economiza mais: **traço de derivação calculado na autoria**

A operação cara de runtime não é resolver — é responder, a cada clique, "essa célula já
estava determinada?" (confirmação prematura, seção 34) e "qual a profundidade inferencial
disso?" (seções 20–22).

Recomendo calcular isso **uma vez, na autoria**, e guardar no puzzle:

- rodar a propagação em rodadas; cada célula recebe o **nível** em que passou a estar forçada
  (`derivationLevel`) e o **conjunto de pistas** usadas naquela derivação (`justification`);
- daí saem, de graça: `inferenceDepth` por célula, o `inferenceDepthDistribution` do puzzle
  (seção 25), o `restrictivePower` de cada pista (quantas células ela sozinha elimina no
  estado inicial, seção 43) e a classificação essencial/útil/redundante (seção 68 — pista
  é redundante se o puzzle continua único sem ela);
- se a propagação sozinha **não** resolver o puzzle, ele exige análise por casos: marcar isso
  na metadata e reservar para os níveis altos.

Com esse traço em mãos, "confirmação prematura" vira uma comparação O(1) em runtime, e
`admiteSolucao` só é chamado quando o paciente cria algo inconsistente.

### 11.4 Onde cada coisa roda

- **Autoria/validação (offline, custo irrelevante):** gerador → solver → unicidade → remoção
  de redundância → traço de derivação → metadata. Nunca no caminho do paciente (seção 66).
- **Carregamento do módulo (como `lib/torres/banco.ts:95-104`):** revalidar unicidade de todo
  o banco e **lançar erro** se algum puzzle falhar. Isso transforma "o banco está validado" de
  promessa em **invariante do build**, e é o padrão que a casa já usa.
  Se o custo de revalidar 20 puzzles 5×6 no boot pesar, validar no **teste** (que roda no CI)
  e no boot só conferir um hash — mas então o teste passa a ser obrigatório.
- **Runtime (browser, orçamento de ~50 ms por ação):** `admiteSolucao` e `pistasEmConflito`,
  ambos com o estado já propagado do puzzle em cache.

## 12. Arquitetura para o log do caminho do raciocínio

### 12.1 Volume — estimado com os números da própria espec

Grade 5×6 = **375 células**. Cada célula tem 4 estados, e o paciente costuma revisitar.
Estimativa conservadora: **150–400 ações por puzzle**; sessão de ~7 min com 2–5 puzzles →
**400 a 1.500 ações por sessão**.

Os ~20 campos da seção 44, em JSON com chaves por extenso, dão ~250–350 bytes por ação.
Em formato colunar compacto (cabeçalho com a ordem dos campos + linhas como arrays, códigos
numéricos para estados e tags), caem para ~60–100 bytes.

| Formato | 400 ações | 1.000 ações | 1.500 ações |
|---|---|---|---|
| JSON verboso (~300 B/ação) | ~117 KB | ~293 KB | ~440 KB |
| Colunar compacto (~80 B/ação) | ~31 KB | ~78 KB | ~117 KB |

No Postgres, coluna `text` acima de ~2 KB é comprimida automaticamente (TOAST/pglz); em JSON
repetitivo a compressão fica tipicamente entre 3× e 5×, então o **armazenado** cai para a
faixa de **10–40 KB por sessão**. O que **não** encolhe é o custo de trafegar e de fazer
`JSON.parse` do lado do servidor.

### 12.2 As três opções, e por que a escolha não é livre

**(A) Tudo em `Session.metadata`** — `prisma/schema.prisma:91` (`metadata String?`).
Não exige migration, mas **contamina o caminho quente**: `app/api/sessions/route.ts:74-79`,
`:98-103` e `:119-124` fazem `JSON.parse` do `metadata` da **sessão anterior** para ler o
`consolidatedLevel`; e `app/api/reports/route.ts:190-191` faz `JSON.parse` de **todas** as
sessões só para checar `abandoned`. Enfiar 300 KB ali significa parsear 300 KB a cada nova
sessão e a cada PDF. Some-se que `sessionSchema` aceita `z.record(z.unknown())` sem teto
(`app/api/sessions/route.ts:19`) — hoje nada barra um corpo de meio megabyte.
**Rejeitado para o log bruto.**

**(B) `ExerciseAttempt.metadata`** — `prisma/schema.prisma:204` (`metadata String?`, `text`
no Postgres, **sem limite de tamanho no banco**). **Não exige migration.** O único teto é de
aplicação: `z.string().max(8000)` em `app/api/attempts/route.ts:30` — código, não schema.
O escopo casa perfeitamente: a tentativa **é** a execução, aberta no início
(`ExerciseWrapper.tsx:163`) e fechada no fim (`:150`). Custo: nada mais lê essa coluna hoje,
então o log não atrapalha nenhum caminho quente.
Risco: o PATCH é único, no fim (`app/api/attempts/route.ts:55-70`) — se a aba fechar, o log
se perde. Mitigação sem migration: PATCH **ao fim de cada puzzle**, acumulando.

**(C) Tabela nova (`DeductiveAction`, uma linha por ação)** — é a forma relacional correta e
a única que permite agregação por SQL no relatório. Custo: **migration** (ela mandou PARAR),
mais 400–1.500 linhas por sessão por paciente, ou seja milhões de linhas em poucos meses, num
Supabase Free **sem backup automático e sem PITR**.

### 12.3 Recomendação: dois níveis, **zero migration agora**

1. **Agregado clínico (~2–4 KB) em `Session.metadata`** — é o que o relatório lê e o que a
   progressão usa: contagens por operação lógica, por profundidade inferencial, contradições
   criadas/resolvidas, autocorreções (espontânea × pós-verificação × pós-conclusão),
   hipóteses criadas/rejeitadas, confirmações revertidas, verificações pedidas, latência até a
   primeira ação. Fica pequeno, cabe no caminho quente e sobrevive a tudo.
2. **Log bruto por ação, colunar compacto, em `ExerciseAttempt.metadata`** — a reconstrução do
   caminho do raciocínio (seção 44), com PATCH ao fim de cada puzzle. Elevar o
   `max(8000)` de `app/api/attempts/route.ts:30` para algo como 400.000 caracteres **é
   mudança de código, não de banco** — mas é mudança em peça compartilhada por todos os
   exercícios e precisa de decisão explícita dela.
3. **Só depois, se o relatório exigir consulta por ação em SQL**, propor a tabela
   `DeductiveAction` numa etapa própria, com o procedimento de
   `docs/operacao/backup-procedimento.md`. Como é tabela nova, seria **nível 1** (backup +
   validação do arquivo) — mas isso é decisão dela, não desta auditoria.

**Formato sugerido do log** (o que reduz de 300 B para 80 B por ação):

```jsonc
{ "v": 1, "puzzleId": "GD-L4-03",
  "campos": ["t","cat","val","pos","de","para","flags","conflito","prof"],
  "acoes": [[1420,2,3,1,0,2,0,null,null],
            [2010,2,3,1,2,3,5,[2,5,9],3]] }
```
`t` = ms desde o início (o intervalo entre ações se calcula, não se armazena); `de`/`para` =
estados 0..3; `flags` = bitmask das tags comportamentais; `conflito` = ids das pistas em
contradição; `prof` = profundidade inferencial. O `actionIndex` é o índice do array.
**Nenhuma informação da seção 44 se perde** — só os nomes das chaves, que ela mesma autorizou
mudar ("os nomes podem mudar; a informação não").

## 13. Encaixe do motor adaptativo sem duplicar decisão

Hoje há **uma única variável de nível por exercício**:
`ExerciseConfig.currentDifficulty`, escrita no `upsert` de
`app/api/sessions/route.ts:190-204`, e lida na abertura do exercício. Toda duplicação nasce de
duas peças quererem escrever nessa mesma variável.

**Regra de separação (a que evita o conflito):**

> **A engine central decide o NÍVEL. O motor da Grade Dedutiva decide QUAL PUZZLE dentro do
> nível.** Uma variável, um dono.

**Camada macro — a plataforma, sem tocar em `app/api/sessions/route.ts`.**
Hoje a Grade Dedutiva cai no legado `calculateNewDifficulty` (§5). Basta o `onComplete`
passar a enviar `progressionV2: true` e `accTotal` no `metadata` para o exercício entrar
sozinho no ramo genérico de `app/api/sessions/route.ts:115-142`, que usa
`calculateProgression` (`lib/adaptive.ts:90-129`) e ganha `consolidatedLevel`,
`progressionAction` e `progressionReason` de graça. **Nenhuma linha da rota muda.**
Duas condições:

- `accTotal` precisa ser um número defensável e documentado — proponho *proporção de desafios
  concluídos corretamente na primeira tentativa de CONCLUIR*, não a fórmula improvisada de
  hoje (`DeductiveGrid.tsx:562`);
- a rota fixa `maxLevel = 10` para quem não é `desafio-supermercado`
  (`app/api/sessions/route.ts:128`), e o Zod aceita 1..13 (`:18`), casando com a CHECK do
  banco. A escada da espec tem **5 níveis** (seção 63) → é obrigatório um par de conversão
  **nível 1–5 ↔ dificuldade 1–10**, no molde exato de
  `lib/torres/selecao.ts:12-37` (`faseDaDificuldade` / `dificuldadeDaFase`). O comentário em
  `lib/torres/selecao.ts:24-35` documenta o bug que a ausência desse par causou na Torre:
  gravava-se uma grandeza e lia-se outra, e o paciente voltava fases. **Não repetir.**

**Camada micro — dentro da sessão, invisível e sem escrever nível.**
O motor das seções 46–60 (padrão específico → focalizado → transferência; sobrecarga global →
reduzir carga) opera **escolhendo o próximo puzzle**, não mexendo em `difficulty`. Ele recebe
o nível macro e um alvo, e pede ao seletor (molde de `lib/torres/selecao.ts:51-77`, com
aleatório injetado) um puzzle daquele nível com o vetor de habilidades desejado:

- sem padrão → puzzle misto do nível;
- padrão específico → puzzle do mesmo nível com maior peso na operação-alvo (seção 54:
  continua puzzle completo, não é tarefa simples);
- sobrecarga global → puzzle do **mesmo nível** com vetor de carga menor (menos categorias,
  menor profundidade) — a redução é de **carga**, não de nível (seção 51);
- após 1–2 focalizados → obrigatoriamente um misto de transferência (seções 59–60).

Se a sobrecarga **persistir entre sessões**, isso aparece sozinho no `accTotal` e é a engine
central que baixa o nível. Assim as duas camadas nunca discordam: uma observa a sessão, a
outra observa a série de sessões.

**Estado entre sessões.** O que a camada micro precisa lembrar (último alvo focalizado,
quantos focalizados consecutivos, puzzles já usados) cabe no agregado de `Session.metadata`
(§12.3, item 1), lido no início da sessão seguinte — exatamente como
`app/api/sessions/route.ts:74-79` já faz para o `consolidatedLevel`. **Sem tabela nova.**

**O que NÃO fazer:** um segundo `upsert` de `ExerciseConfig` a partir do componente, ou gravar
o nível do exercício no `localStorage`. Ambos criam a segunda fonte de verdade que a
plataforma já pagou caro para não ter (`CLAUDE.md`: "fonte da verdade = banco").

---

## Tabela final — reaproveitar × substituir × construir do zero

| Peça | Situação hoje (evidência) | Veredito |
|---|---|---|
| Id `deductive-grid`, definição, taxonomia, ícone | `types/index.ts:402-409`; `lib/domain-taxonomy.ts:34`; `lib/exercise-icons.ts:40` | **Reaproveitar** |
| Rota, lazy import e `case` no switch | `app/(patient)/treino/[exercicio]/page.tsx:112,768` | **Reaproveitar** |
| `ExerciseWrapper` → `onComplete` → `POST /api/sessions` → `Session` + `ExerciseConfig` | `app/api/sessions/route.ts:159-204` | **Reaproveitar** |
| `ExerciseAttempt` + `/api/attempts` (nunca iniciou × abandonou) | `prisma/schema.prisma:195-208`; `app/api/attempts/route.ts`; `ExerciseWrapper.tsx:124-165` | **Reaproveitar — atende a seção 85 sem migration** |
| `useTimedProgress` (sessão por tempo ~7 min) | `DeductiveGrid.tsx:467`; `useExerciseEngine.ts` | **Reaproveitar** |
| `calculateExerciseScore` / `calculateDomainScore` | `lib/scoring.ts`; `app/api/reports/route.ts:194` | **Reaproveitar** |
| Padrão `lib/torres/` (banco validado no import, BFS, seleção com aleatório injetado, par fase↔dificuldade) | `lib/torres/banco.ts:95-104`; `minimo.ts`; `selecao.ts:12-77` | **Reaproveitar como molde** |
| Ramo genérico `progressionV2` → `calculateProgression` | `app/api/sessions/route.ts:115-142`; `lib/adaptive.ts:90-129` | **Reaproveitar (aderir a ele)** |
| Framework de tutorial T1 | `lib/tutorial/definitions/*`, `state.ts`, `versions.ts:23` | **Reaproveitar (o exercício ainda não usa)** |
| `ExerciseStage` / `ExerciseProgressBar` | `DeductiveGrid.tsx:6-9,629` | **Reaproveitar, com `width` maior** — atenção: `lib/layout/palco.test.ts:46` trava `"medio"` e terá de ser atualizado |
| Os 27 puzzles atuais | `DeductiveGrid.tsx:30-379` | **Substituir** — servem no máximo como base do tutorial 3×3 (seção 6) |
| Modelo `Puzzle` de categoria única | `DeductiveGrid.tsx:20-28` | **Substituir** por N posições × M categorias |
| `clues: string[]` (texto opaco) | `DeductiveGrid.tsx:25,644-646` | **Substituir** por pista computável T1–T11 (seção 19) |
| `CellState` de 3 estados | `DeductiveGrid.tsx:392,508-511` | **Substituir** por 4 estados com `?` |
| Auto-dedução ao marcar `yes` | `DeductiveGrid.tsx:515-521` | **Substituir** — o software não deduz pelo paciente |
| Validação por gabarito | `DeductiveGrid.tsx:527-549` | **Substituir** pelo solver |
| Feedback imediato de erro por célula | `DeductiveGrid.tsx:540-541,547,691-695` | **Substituir** — viola as seções 14–15 |
| `accuracy = 1 - err/(n*2)` | `DeductiveGrid.tsx:562` | **Substituir** por métrica documentada |
| `metadata: {puzzlesSolved,totalErrors}` | `DeductiveGrid.tsx:572` | **Substituir** pelo agregado clínico |
| `getPuzzlePool` (4 baldes) | `DeductiveGrid.tsx:381-390` | **Substituir** por seleção por vetor de habilidades |
| Tutorial legado interno | `DeductiveGrid.tsx:396-462` | **Substituir** por tutorial T1 que É o exercício rodando |
| Progressão pelo legado `calculateNewDifficulty` | `app/api/sessions/route.ts:180-188`; `lib/adaptive.ts:8-52` | **Substituir** pela adesão ao `progressionV2` |
| Solver CSP (validar/contar/unicidade/parcial/MUS) | não existe | **Construir do zero** — `lib/grade-dedutiva/solver.ts` |
| Modelo de pistas T1–T11 (texto + restrição) | não existe | **Construir do zero** |
| Traço de derivação (profundidade, justificativa, poder restritivo) | não existe | **Construir do zero** (autoria) |
| Banco de 12–20 puzzles validados + metadata | não existe | **Construir do zero** — `lib/grade-dedutiva/banco.ts` |
| Gerador de autoria (dev-only) | não existe | **Construir do zero** |
| Instrumentação por ação (log do raciocínio) | não existe | **Construir do zero** |
| Classificação de erro A–F e MUS | não existe | **Construir do zero** |
| Motor adaptativo micro (focalizado/transferência/carga) | não existe | **Construir do zero** |
| Relatório de processo do terapeuta | inexistente; PDF só mostra `exerciseId` cru (`app/api/reports/route.ts:292`) | **Construir do zero** |
| Interface desktop/mobile das seções 10–13 e 90–93 | `DeductiveGrid.tsx:630-724` | **Construir do zero** |
| Os 44 testes das seções 95–98 | zero testes do exercício | **Construir do zero** |

---

## Pontos que exigem decisão dela antes da F2

1. **Elevar o `z.string().max(8000)` de `app/api/attempts/route.ts:30`** — peça compartilhada
   por todos os exercícios. Sem isso, o log bruto não cabe.
2. **`lib/layout/palco.test.ts:46`** trava `width="medio"` para a Grade Dedutiva. O layout
   lado a lado da seção 12 exige mudar isso — é alterar um teste existente, então precisa ser
   pedido, não feito por conta.
3. **`sessionSchema` aceita `metadata` sem teto** (`app/api/sessions/route.ts:19`). Se o
   agregado clínico crescer, convém um limite explícito — mas mexer nisso afeta todos os
   exercícios.
4. **A tabela `DeductiveAction`**, se e quando o relatório exigir SQL por ação. Nesta
   auditoria **não** se propõe migration.

## Limites desta auditoria

- **Não foi verificado o banco de produção.** Se `ExerciseAttempt` já existe no Postgres da
  Vercel/Supabase é **não determinado** — o schema Prisma diz que sim, mas `db push` é manual
  (`CLAUDE.md`). Faltaria uma consulta ao banco, fora do escopo de "leitura de código".
- **Não foi rodado `npm run build` nem `npm run test`**, por instrução (dev server podia estar
  na porta 3000). O único comando executado foi o benchmark de enumeração, num script fora do
  repositório.
- **Não foi medido** o tempo real do solver proposto: ele ainda não existe. Os números da §11
  são do espaço de busca (exatos) e do limite superior da enumeração exaustiva (medido); o
  ganho da propagação é a razão pela qual a arquitetura é essa, mas só será número depois da F2.
