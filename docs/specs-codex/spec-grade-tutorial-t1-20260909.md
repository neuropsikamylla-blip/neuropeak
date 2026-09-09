# Spec — Grade Dedutiva: o tutorial entra no framework T1

Data: 2026-09-09
Fecha a pendência registrada em 03/set. Hoje o tutorial 3×3 roda **dentro** do componente e **em
toda sessão**; ela quer aquisição da mecânica **na primeira vez** e, depois disso, treino direto.

## ⛔ Proibições

- ⛔ **NÃO mude a mecânica nem a estrutura da tela.** Ela aprovou ambas em 09/set; há
  `lib/grade/contrato-tela-aprovada.test.ts` com 8 testes. Reprovou algum? **PARE e relate.**
- ⛔ **NÃO invente um tutorial novo.** A regra dura dela de 12/ago
  ([[tutorial-e-o-exercicio-rodando]]) é que **o tutorial É o exercício rodando**. O 3×3 que já
  existe (`PROBLEMA_TUTORIAL`) e as peças reais da tela **são** o tutorial. Isto é **migração**
  para o framework, não autoria.
- ⛔ **NÃO use emoji** — regra congelada do framework.
- ⛔ **NÃO toque na dosagem nem no motor adaptativo** (outras fatias).

## 1. O que existe hoje, e o que está errado

- `lib/tutorial/` tem o framework: `TutorialDefinition` (`types.ts`), o registro
  `TUTORIAIS_POR_EXERCICIO` em `app/(patient)/treino/[exercicio]/page.tsx`, o estado persistido no
  banco (`ExerciseConfig.tutorialCompletedAt/tutorialVersion/tutorialSource`) e
  `tutorialRequired(state, versao)`, que faz o tutorial **reaparecer uma vez** quando a versão sobe.
- Há **10 definições** em `lib/tutorial/definitions/`. Leia pelo menos
  `sequencia-ordenada.tsx` e `vigilancia.tsx` antes de escrever.
- `TUTORIAL_VERSIONS["deductive-grid"]` existe e vale **1** — mas **não há `TutorialDefinition`
  registrada**. É por isso que o tutorial da Grade nunca passou pelo framework.
- No componente, `DeductiveGrid.tsx` começa com `tutorial = true` e roda o 3×3 **sempre**.

## 2. O que fazer

### 2.1 A definição

Crie `lib/tutorial/definitions/grade-dedutiva.tsx` exportando um `TutorialDefinition` para
`deductive-grid`, **versão 2**.

`Demonstration` e `GuidedAttempt` usam **as peças reais da Grade** — a mesma grade, o mesmo menu de
célula, as mesmas pistas riscáveis. Extraia da tela o que for preciso para **componentes
reaproveitáveis**; **não** reimplemente uma grade de mentira. Se a extração exigir mudar a
estrutura da tela, **PARE e relate**.

A demonstração executa **a tarefa inteira** (regra 2 da T1): lê uma pista, abre uma célula, escolhe
um valor, risca a pista, conclui. Use `DemoPointer` como as outras definições fazem.

`instructionText` traz o **verbo do gesto real** da Grade (regra 4 da T1) — aqui é **tocar/clicar**
na célula e escolher na lista.

### 2.2 A versão sobe para 2

`TUTORIAL_VERSIONS["deductive-grid"]: 1 → 2`.

⚠️ Isto é **deliberado e importante**: quem aprendeu a mecânica velha dos `✓`/`✗` **precisa** rever,
porque a mecânica mudou por completo. `tutorialRequired` faz isso sozinho, **uma vez**.

### 2.3 O componente para de rodar o tutorial sozinho

Em `DeductiveGrid.tsx`, remova o estado `tutorial` e o caminho que roda `PROBLEMA_TUTORIAL` no
início. O exercício passa a **começar no primeiro problema real**; quem precisa de tutorial recebe
o do framework **antes**, pelo `ExerciseWrapper`.

⚠️ **`begin()` do relógio continua no primeiro problema REAL** — decisão 18 da auditoria de dosagem:
tutorial não consome dose. Confirme que continua assim.

### 2.4 Registro

Registre a definição em `TUTORIAIS_POR_EXERCICIO`. Há testes que travam a **contagem** de tutoriais
registrados e a lista da guarda de emoji — **atualize-os**, e diga no relatório quais foram.

## 3. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 76 arquivos / 998 testes — não pode cair
```
**NÃO rodar `npm run build`.** Sem `node_modules` no lab você não roda nada: **declare**.

Testes obrigatórios:
- `tutorialRequired` **exige** o tutorial de quem tem versão **1** registrada, e **não exige** de
  quem já tem a **2** — é a prova de que a mudança de mecânica reapresenta o tutorial uma vez;
- rever o tutorial **não** regrava (`completionRecordFor(true, 2) === null`) — regra 8 da T1;
- a definição está registrada e sua `version` **bate** com `TUTORIAL_VERSIONS`;
- o componente **não** contém mais o caminho do tutorial próprio: prove por varredura que
  `PROBLEMA_TUTORIAL` não é mais usado como fase inicial da tela;
- os **8 testes do contrato da tela** continuam passando;
- nenhum emoji na definição nova.

## 4. Relatório

O que extraiu da tela para reaproveitar e por quê; se a extração mexeu na estrutura (e, se mexeu,
por que parou); quais testes de contagem atualizou; e a confirmação de que o relógio só começa no
primeiro problema real.
