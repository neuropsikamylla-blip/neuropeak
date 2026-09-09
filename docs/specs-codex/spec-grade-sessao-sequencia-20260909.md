# Spec — Grade Dedutiva: sessão por tempo e sequência de problemas

Data: 2026-09-09
Fecha a pendência da dosagem, auditada em 03/set
(`docs/grade-dedutiva/PROPOSTA-DOSAGEM-TUTORIAL-SOLVER-20260903.md`, seção 1).

Hoje a Grade faz tutorial → **um** problema → fim. O framework da plataforma é sessão por
**tempo ativo**, e ela quer a sequência *misto → focalizado → transferência* quando houver tempo.

## ⛔ Proibições

- **NÃO altere a ESTRUTURA da tela.** Ela aprovou o layout em 09/set e há
  `lib/grade/contrato-tela-aprovada.test.ts` com 7 testes. Se algum reprovar, **PARE e relate**.
- **NÃO acrescente elemento visual novo** — nem barra, nem cronômetro, nem contador de problemas.
  O `useTimedProgress` entra só como **relógio**; o progresso já é reportado ao wrapper pelo hook.
- **NÃO mexa no tutorial** (é a próxima fatia) nem no motor adaptativo (a de depois).

## 1. O relógio

`useTimedProgress` (`components/exercises/useExerciseEngine.ts`) conta **tempo ATIVO**: pausa após
15 s sem toque. Use-o com **11 minutos**, o mesmo valor que ela escolheu para a Torre — tarefa de
planejamento não cabe nos 7 padrão.

⚠️ Deixe o valor numa **constante nomeada e comentada** em `lib/grade/`, com a nota de que é
proposta do VP e que ela pode recalibrar.

Chame `begin()` quando o **primeiro problema real** começa — não no tutorial.

## 2. A sequência

O precedente exato é `TorreHanoi.tsx`. Ao concluir um problema **corretamente**:

- `isTimeUp()` **falso** → carrega o **próximo**: `selecionarProblema(difficulty, usados)`, onde
  `usados` são os ids já resolvidos **nesta sessão**. Zera grade, pistas riscadas, mensagem, cota de
  verificação e o registro **daquele** problema. O cronômetro **não** zera.
- `isTimeUp()` **verdadeiro** → `finish()` e **um único** `onComplete` com o acumulado.

⚠️ A cota de verificação é **por problema** (decisão dela): recomeça a cada problema novo.

⚠️ Entre um problema e outro, mostre a mesma mensagem de conclusão que já existe
(*"Desafio concluído."*) e siga. **Sem** contagem, **sem** "problema 2 de 5", **sem** elogio.

## 3. O que vai no `onComplete`

Um `ExerciseResult` **por sessão**, não por problema.

- `metadata.problemas`: lista com o registro **completo de cada problema** — o que hoje já é
  gravado (atribuições, eventos de pista, verificações, latência, ações, tempo, tentativas de
  concluir incorretas), acrescido do `puzzleId` e do `nivel`.
- `metadata` agregado da sessão: total de problemas resolvidos, tempo total, e a **soma** dos
  agregados descritivos que já existem (`atribuicoesAntesDeDeterminacao`, `dessasMantidas`,
  `dessasRevisadas`, `atribuicoesComEstadoJaContraditorio`).
- `accuracy`: a **média** de `acuraciaDoProblema(...)` dos problemas resolvidos.
  ⚠️ Mantenha o comentário que já existe explicando que essa fórmula é **provisória** e alimenta
  `lib/adaptive.ts` — o `1` fixo já quebrou a Torre e quase quebrou esta.
- `difficulty` continua o que veio por prop.

Extraia o cálculo do agregado para **função pura testável** em `lib/grade/` — a tela não faz conta.

## 4. Sessão que acaba no meio de um problema

O tempo pode esgotar com um problema **em andamento e não resolvido**.

Regra: o problema em andamento **entra no registro** marcado como `concluido: false`, e **não**
entra na média de acurácia — quem não terminou não errou. O paciente **não** é interrompido no meio:
o tempo é checado **ao concluir** um problema, nunca durante. Se ele abandonar a página, a tabela
`ExerciseAttempt` já cobre isso.

## 5. Provas

```
npx tsc --noEmit          # exit 0
npm run test              # base: 74 arquivos / 990 testes — não pode cair
```
**NÃO rodar `npm run build`.**

Testes obrigatórios, em funções puras (sem JSX):
- o agregado da sessão soma certo com 1, 2 e 3 problemas, e `mantidas + revisadas` continua
  fechando com o total;
- a acurácia da sessão é a **média** dos problemas, e um problema **não concluído** não entra
  nem no numerador nem no denominador;
- sessão com **nenhum** problema concluído não produz `NaN` nem acurácia negativa;
- `selecionarProblema` com a lista de usados devolve sempre um problema **novo** enquanto houver;
- a constante dos 11 minutos existe, é exportada e está comentada como proposta recalibrável;
- os **7 testes do contrato da tela continuam passando** — declare isso no relatório.

## 6. Relatório

O que virou função pura e por quê; como tratou o problema inacabado no fim do tempo; e a
confirmação, item a item, de que nenhum elemento visual novo apareceu na tela.
