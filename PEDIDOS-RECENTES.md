# As 3 ultimas especificacoes dela (automatico; a mais nova por ultimo)
# Na retomada: ler as 3, conectar com PROGRESSO.md e git, declarar e seguir.

## 🎓 FASE T1 DO FRAMEWORK DE TUTORIAL CONCLUÍDA EM CÓDIGO (04/ago/2026) — NADA NO BANCO, NADA PUBLICADO

**Commits:** implementação = `4999292` · plano operacional = `04e0f24` · correção do CLAUDE.md = `dba3321`.
**Documentos:** `docs/exercicios/01`, `02`, `03` e `docs/operacao/T1-plano-implantacao.md`.

### Contexto — nova etapa do projeto

Ela abriu a revisão dos exercícios **um por um**, começando pelo **tutorial e pela experiência inicial**. A
análise inicial (`29ed4aa`) encontrou que **19 exercícios abrem com `showTutorial` em `useState(true)`** e que
**não existe nenhuma memória de "já viu"** no projeto: um paciente que treina **3× por semana durante 6 meses**
refaz o mesmo tutorial **72 vezes por exercício**.

### O que a T1 entregou em código (`4999292`)

- **`ExerciseConfig`** ganhou três campos: **`tutorialCompletedAt` `DateTime?`**, **`tutorialVersion` `Int?`** e
  **`tutorialSource`**, este último um **enum Prisma `TutorialSource`** com valores **`BACKFILL`** e **`PATIENT`**;
- **rota nova `app/api/exercise-tutorial/route.ts`**, **isolada de `/api/sessions`**;
- **`lib/tutorial/`** com **`types.ts`** (contrato), **`state.ts`** (`tutorialRequired` e `backfillDecision`,
  **lógica pura**) e **`versions.ts`** (catálogo dos 34);
- **`components/exercises/PreparationScreen.tsx`** criada e **ainda NÃO usada**;
- **`docs/scripts/backfill-tutorial.sql`** documentado, **não executado**.

### Por que o enum — decisão dela, modelagem fechada

Ela decidiu **manter enum Prisma**, e **não `String` nem união só no TypeScript**, porque **`tutorialSource`
distingue dado inferido pelo backfill de conclusão real do paciente** e **controla o rollback seletivo**. O VP
alertou que **enum cria tipo nativo no PostgreSQL** e que o **projeto não usa nenhum enum hoje** (`role` e
`theme` são `String`); ela respondeu que o **tipo órfão numa futura remoção é custo aceitável** e mandou
**não reabrir a modelagem**.

### Isolamento clínico garantido POR CONSTRUÇÃO, não por disciplina

O contrato **não tem `onComplete` em lugar nenhum**, **`GuidedOutcome` é apenas `"correct" | "incorrect"`** —
**sem score, tempo ou acurácia** — e **`lib/tutorial` não importa `useTimedProgress`, `useExerciseProgress` nem
`lib/adaptive`**. **Quatro guardas estáticos** fiscalizam isso no fonte. Verificado: a rota menciona
**`session.create`, `currentDifficulty`, `lastAttemptAt`, `totalAttempts`, `achievement` ou `alert` ZERO vezes**.

### Provas — nenhuma tocou o banco

`prisma validate` exit 0 · `prisma generate` exit 0 · `npx tsc --noEmit` exit 0 · `npx vitest run` **471/471**
(eram **453** → **+18**) · `npm run build` exit 0. **Simulação da lógica de backfill com dados:** quem treinou é
marcado com a data de **`lastAttemptAt`**; **sem `lastAttemptAt` usa `createdAt`**; **`totalAttempts = 0` não é
tocado**; **já concluído não é tocado** (idempotente).

### 🧪 Lição de método — nunca medir exit code depois de pipe

O primeiro **`prisma validate` deu exit 1** e o VP **quase reportou como falha de schema**. **Não era:** faltava
**`DIRECT_URL`** no shell e, além disso, o **exit code medido era o do `tail`, não o do `prisma`**, porque o
comando estava **atrás de um pipe**. Refeito **sem pipe** e com **variável fictícia** (validate não abre
conexão): **schema válido**. **REGRA: nunca medir exit code depois de pipe.**

### 🚨 Achado crítico de documentação, já corrigido em `dba3321`

O **`CLAUDE.md` dizia que a CHECK de `Session.difficulty` é 1-10**. O valor **correto é 1-13** desde
**02/08/2026** (**SCHEMA-02 do RUNBOOK**), porque **Supermercado e Ordem da História chegam a 12** e o **Focus
tem 13 passos**. Quem seguisse o `CLAUDE.md` ao **reaplicar as CHECK depois de um `db push`** recriaria o **teto
em 10**, e o **`POST /api/sessions` passaria a falhar para todo paciente acima do nível 10, PERDENDO o treino**.
**O RUNBOOK avisava; o `CLAUDE.md` contradizia.**

### Plano operacional aprovado por ela (`04e0f24`) — 14 itens com critérios de aceite

Pontos que ela mandou **manter como referência correta**: **CHECK de `difficulty` entre 1 e 13**; **banco antes
do código**; **reaplicação imediata das três CHECK após o `db push`**; e **parada obrigatória se
`prisma migrate diff` mostrar qualquer `DROP` ou `ALTER COLUMN` inesperado**.

**RISCO IDENTIFICADO NO PLANO:** entre o **`db push`** e a **reaplicação das CHECK** existe uma **janela em que o
banco fica SEM as travas de dado clínico**. A janela deve ser a **mais curta possível** e **nenhum paciente pode
estar treinando durante ela**.

### ⏸️ ESTADO ATUAL — TUDO PARADO, aguardando evidência de backup

Ela vai verificar **no painel do Supabase**: **plano do projeto**, **existência de backups automáticos**, **data
e horário do último backup**, **disponibilidade de restauração** e **existência de PITR**. Até ela trazer essa
evidência, está **PROIBIDO**: **`db push`**, **SQL no banco**, **publicação**, **backfill** e **conversão dos
pilotos**. O **VP não verifica backup sozinho** porque isso exigiria **usar credencial para inspecionar
infraestrutura sem autorização dela**.

**PRÓXIMO PASSO:** aguardando a evidência de backup. Quando chegar, **executar o roteiro passo a passo com
validação entre cada etapa**. Depois disso vem a **Fase T2**, com os **dois pilotos aprovados**: **Conecta
Números** e **Span Numérico Auditivo Direto**.

### 📌 Fases seguintes registradas, NÃO INICIADAS

**T2** (framework + 2 pilotos) · **T3** (converter os demais em lotes; **15 exercícios não têm tutorial nenhum**
e **5 têm tutorial próprio fora do contrato**, entre eles **Vigilância**, cujo **tutorial carrega decisão
clínica**) · **T4** (tela de resultado e comunicação de evolução).
```

## COMO PROVEI

- `wc -l PROGRESSO.md` (antes) → **1428 linhas**; `git log --oneline -3` → exit 0, confirmou os três hashes do despacho no topo: `dba3321`, `04e0f24`, `4999292`.
- `ls` dos artefatos citados → exit 0: existem `app/api/exercise-tutorial/route.ts`, `components/exercises/PreparationScreen.tsx`, `docs/scripts/backfill-tutorial.sql`, `docs/exercicios/{01,02,03}*.md`, `docs/operacao/T1-plano-implantacao.md` e `lib/tutorial/{types.ts,state.ts,versions.ts}` (+ três arquivos de teste: `contracts.test.ts`, `state.test.ts`, `versions.test.ts`).
- `git status --porcelain` → exit 0, saída única `M PROGRESSO.md`. `git diff --stat` → `1 file changed, 88 insertions(+)`, **zero deleções**.
- Posição do bloco: a edição ancorou no título `## ⏱️ DURAÇÃO CONTÍNUA...` (antiga linha 6), o que garante inserção antes de todos os blocos existentes.

**Não reverifiquei os fatos técnicos do despacho** (contagem 471/471, ausência de `onComplete`, os quatro guardas estáticos, o teto 1-13). Foram transcritos como reportados pelo VP; o status de verificação independente deles é **DESCONHECIDO** neste despacho.

## O QUE NÃO FIZ

- Não commitei nem dei push — a árvore fica com `PROGRESSO.md` modificado, pronto para o VP commitar.
- Não toquei em nenhum outro arquivo (nem `CLAUDE.md`, nem `ESTADO-DO-PROJETO.md`, nem docs).
- Não executei `db push`, SQL, backfill, publicação, `prisma`, `tsc`, `vitest` nem `build` — nada que toque banco ou produção.
- Não alterei o conteúdo dos blocos já existentes do PROGRESSO.md.</result>
<usage><subagent_tokens>28362</subagent_tokens><tool_uses>5</tool_uses><duration_ms>92307</duration_ms></usage>
</task-notification>
