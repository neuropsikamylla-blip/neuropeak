== DIFF do lab grade-sessao (contra a base do bundle) ==
diff --git a/components/exercises/executive/DeductiveGrid.tsx b/components/exercises/executive/DeductiveGrid.tsx
index 735930ab..21ebde6d 100644
--- a/components/exercises/executive/DeductiveGrid.tsx
+++ b/components/exercises/executive/DeductiveGrid.tsx
@@ -2,11 +2,13 @@
 
 import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
 import type React from "react";
-import { useEffect, useMemo, useRef, useState } from "react";
+import { useEffect, useRef, useState } from "react";
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
+import { useTimedProgress } from "@/components/exercises/useExerciseEngine";
 import {
+  DURACAO_SESSAO_GRADE_MS,
   PROBLEMA_TUTORIAL,
-  acuraciaDoProblema,
+  agregarSessaoGrade,
   admiteSolucao,
   celulasComValorRepetido,
   chavePosicaoGrade,
@@ -22,7 +24,9 @@ import {
   selecionarProblema,
   verificacaoDisponivel,
   verificacoesPermitidas,
+  type EventoPistaGrade,
   type RegistroAtribuicao,
+  type RegistroProblemaGrade,
   type RegistroVerificacao,
   type QuantidadeVerificacoes,
   type ValorCelula,
@@ -37,17 +41,10 @@ interface DeductiveGridProps {
   onComplete: (result: ExerciseResult) => void;
 }
 
-interface EventoPista {
-  type: "clue_crossed" | "clue_uncrossed";
-  pistaId: string;
-  momento: number;
-  timestamp: number;
-}
-
 interface RegistroProblema {
   atribuicoes: RegistroAtribuicao[];
   verificacoes: RegistroVerificacao[];
-  eventosPista: EventoPista[];
+  eventosPista: EventoPistaGrade[];
   latenciaPrimeiraAcao: number | null;
   totalAcoes: number;
   tentativasConcluirIncorretas: number;
@@ -132,7 +129,7 @@ function celulaComValor(
 }
 
 export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridProps) {
-  const desafio = useMemo(() => selecionarProblema(difficulty), [difficulty]);
+  const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress(DURACAO_SESSAO_GRADE_MS);
   const [tutorial, setTutorial] = useState(true);
   const [puzzle, setPuzzle] = useState<Puzzle>(PROBLEMA_TUTORIAL);
   const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(() => criarGradeVazia(PROBLEMA_TUTORIAL));
@@ -144,6 +141,8 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
   );
   const inicioProblema = useRef(Date.now());
   const registro = useRef<RegistroProblema>(novoRegistroProblema());
+  const problemas = useRef<RegistroProblemaGrade[]>([]);
+  const usados = useRef<string[]>([]);
   const transicao = useRef<ReturnType<typeof setTimeout> | null>(null);
   const pal = paleta(theme);
   const rootBg = fundoDoTema(theme);
@@ -270,43 +269,37 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     setMensagem(mensagemVerificacao(puzzle.nivel, temIncompatibilidade));
   }
 
-  function iniciarDesafio(): void {
-    setTutorial(false);
-    setPuzzle(desafio);
-    setGrade(criarGradeVazia(desafio));
+  function iniciarProblema(proximo: Puzzle): void {
+    setPuzzle(proximo);
+    setGrade(criarGradeVazia(proximo));
     setPistasRiscadas(new Set());
     setMensagem(null);
     setConcluido(false);
-    setVerificacoesRestantes(verificacoesPermitidas(desafio.nivel, false));
+    setVerificacoesRestantes(verificacoesPermitidas(proximo.nivel, false));
     registro.current = novoRegistroProblema();
     inicioProblema.current = Date.now();
   }
 
-  function concluir(): void {
-    if (concluido) return;
-    registrarAcao();
-    if (!gradeEstaCorreta(puzzle, grade)) {
-      registro.current.tentativasConcluirIncorretas += 1;
-      setMensagem("Sua organização ainda contém incompatibilidades. Revise antes de concluir.");
-      return;
-    }
-
-    const tempoTotal = Math.max(0, Date.now() - inicioProblema.current);
-    setConcluido(true);
-    setMensagem("Desafio concluído.");
-
-    if (tutorial) {
-      transicao.current = setTimeout(iniciarDesafio, 700);
-      return;
-    }
+  function iniciarDesafio(): void {
+    const primeiro = selecionarProblema(difficulty, usados.current);
+    setTutorial(false);
+    iniciarProblema(primeiro);
+    begin();
+  }
 
+  function finalizarRegistro(
+    problemaAtual: Puzzle,
+    tempoTotal: number,
+    concluidoNoTempo: boolean
+  ): RegistroProblemaGrade {
     const atribuicoes = registro.current.atribuicoes.map((atribuicao) => ({ ...atribuicao }));
     const verificacoes = registro.current.verificacoes.map((verificacao) => ({ ...verificacao }));
     const eventosPista = registro.current.eventosPista.map((evento) => ({ ...evento }));
     const resumo = resumirAtribuicoes(atribuicoes);
-    const metadata = {
-      puzzleId: puzzle.id,
-      nivel: puzzle.nivel,
+    return {
+      puzzleId: problemaAtual.id,
+      nivel: problemaAtual.nivel,
+      concluido: concluidoNoTempo,
       atribuicoes,
       verificacoes,
       eventosPista,
@@ -317,19 +310,55 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
       tentativasConcluirIncorretas: registro.current.tentativasConcluirIncorretas,
       usosVerificarRaciocinio: registro.current.usosVerificarRaciocinio,
     };
+  }
+
+  function concluir(): void {
+    if (concluido || transicao.current !== null) return;
+    registrarAcao();
+    if (!gradeEstaCorreta(puzzle, grade)) {
+      registro.current.tentativasConcluirIncorretas += 1;
+      setMensagem("Sua organização ainda contém incompatibilidades. Revise antes de concluir.");
+      return;
+    }
 
-    // A acurácia NÃO pode ser 1 fixo: ela alimenta a engine adaptativa e a Grade subiria de
-    // nível para sempre, além de disparar sozinha a conquista de 100%. Ver acuraciaDoProblema.
-    const acuracia = acuraciaDoProblema(registro.current.tentativasConcluirIncorretas);
+    const tempoTotal = Math.max(0, Date.now() - inicioProblema.current);
+    setConcluido(true);
+    setMensagem("Desafio concluído.");
+
+    if (tutorial) {
+      transicao.current = setTimeout(() => {
+        transicao.current = null;
+        iniciarDesafio();
+      }, 700);
+      return;
+    }
+
+    const tempoEsgotado = isTimeUp();
+    // Se o limite foi atingido durante este problema, a pessoa pode terminá-lo sem interrupção,
+    // mas o registro preserva que ele ainda não estava concluído dentro do tempo da sessão.
+    const registroFinal = finalizarRegistro(puzzle, tempoTotal, !tempoEsgotado);
+    const problemasDaSessao = [...problemas.current, registroFinal];
+    problemas.current = problemasDaSessao;
+    usados.current = [...usados.current, puzzle.id];
 
     transicao.current = setTimeout(() => {
+      transicao.current = null;
+      if (!tempoEsgotado) {
+        iniciarProblema(selecionarProblema(difficulty, usados.current));
+        return;
+      }
+
+      finish();
+      // A acurácia NÃO pode ser 1 fixo: ela alimenta a engine adaptativa e a Grade subiria de
+      // nível para sempre, além de disparar sozinha a conquista de 100%. Ver acuraciaDoProblema.
+      const { metadata, acuracia } = agregarSessaoGrade(problemasDaSessao);
       onComplete({
         exerciseId: "deductive-grid",
         domain: "executive",
         score: calculateExerciseScore("deductive-grid", acuracia, undefined, difficulty),
         accuracy: acuracia,
         difficulty,
-        duration: Math.round(tempoTotal / 1000),
+        duration: elapsedSec(),
         metadata,
       });
     }, 700);
diff --git a/lib/grade/banco.ts b/lib/grade/banco.ts
index 22f4f4b9..3c599593 100644
--- a/lib/grade/banco.ts
+++ b/lib/grade/banco.ts
@@ -106,9 +106,8 @@ export function nivelDaDificuldade(difficulty: number): Puzzle["nivel"] {
 /**
  * Escolhe o próximo problema do nível, pulando os já usados.
  *
- * `usados` existe para a sequência dentro da sessão — misto → focalizado → transferência — que
- * é a fatia da dosagem, ainda pendente. Hoje a tela chama sem histórico e recebe o primeiro do
- * nível; quando a sessão passar a encadear problemas, basta passar a lista, sem mudar a tela.
+ * `usados` sustenta a sequência dentro da sessão — misto → focalizado → transferência. A tela
+ * passa os ids já resolvidos para não repetir um problema enquanto ainda houver outro no nível.
  * Esgotados os do nível, recomeça: repetir conteúdo é melhor do que devolver nada.
  */
 export function selecionarProblema(difficulty: number, usados: readonly string[] = []): Puzzle {
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index a094c2ea..24917f81 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -21,6 +21,16 @@ export type {
   RelatorioEstrutural,
 } from "./estrutura";
 export { BANCO_GRADE, PROBLEMA_TUTORIAL, PROBLEMAS_GRADE, selecionarProblema } from "./banco";
+export {
+  DURACAO_SESSAO_GRADE_MS,
+  agregarSessaoGrade,
+} from "./sessao";
+export type {
+  AgregadoSessaoGrade,
+  EventoPistaGrade,
+  MetadataSessaoGrade,
+  RegistroProblemaGrade,
+} from "./sessao";
 export {
   CONFIGURACAO_VERIFICACOES,
   MENSAGEM_COM_INCOMPATIBILIDADE,
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/grade/sessao.test.ts
?? lib/grade/sessao.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-sessao ==
