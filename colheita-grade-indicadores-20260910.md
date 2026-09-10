== DIFF do lab grade-indicadores (contra a base do bundle) ==
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index 24917f81..0844d6f0 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -25,6 +25,15 @@ export {
   DURACAO_SESSAO_GRADE_MS,
   agregarSessaoGrade,
 } from "./sessao";
+export {
+  autonomiaDeMonitoramento,
+  calcularIndicadores,
+  exploracaoAntesDaDeterminacao,
+  metodoDeLeitura,
+  persistenciaEmContradicao,
+  resolucao,
+} from "./indicadores";
+export type { IndicadoresGrade, OrdemDaPistaTrabalhada } from "./indicadores";
 export type {
   AgregadoSessaoGrade,
   EventoPistaGrade,
diff --git a/lib/grade/sessao.test.ts b/lib/grade/sessao.test.ts
index 13554b28..6cf060c6 100644
--- a/lib/grade/sessao.test.ts
+++ b/lib/grade/sessao.test.ts
@@ -116,6 +116,30 @@ describe("agregado da sessão da Grade Dedutiva", () => {
     expect(Number.isNaN(resultado.acuracia)).toBe(false);
     expect(resultado.acuracia).toBeGreaterThanOrEqual(0);
   });
+
+  it("grava os indicadores no metadata sem substituir os registros brutos", () => {
+    const original = registro("tutorial-feira-cientifica", { concluido: false });
+    const resultado = agregarSessaoGrade([original]);
+
+    expect(resultado.metadata.problemas).toEqual([original]);
+    expect(resultado.metadata.indicadores).toEqual({
+      resolucao: 0,
+      exploracaoAntesDaDeterminacao: {
+        atribuicoesAntesDeDeterminacaoPorAtribuicoes: null,
+        atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: null,
+      },
+      persistenciaEmContradicao: null,
+      autonomiaDeMonitoramento: {
+        verificacoesUsadasPorCota: 0,
+        verificacoesInconsistentesCorrigidasDepois: 0,
+      },
+      metodoDeLeitura: {
+        pistasRiscadasPorPistasDoProblema: 0,
+        pistasDesmarcadasDepois: 0,
+        ordemDasPistasTrabalhadas: [],
+      },
+    });
+  });
 });
 
 describe("dosagem e sequência da Grade Dedutiva", () => {
diff --git a/lib/grade/sessao.ts b/lib/grade/sessao.ts
index 54320b78..247de043 100644
--- a/lib/grade/sessao.ts
+++ b/lib/grade/sessao.ts
@@ -1,4 +1,5 @@
 import { acuraciaDoProblema, type RegistroAtribuicao, type RegistroVerificacao } from "./interacao";
+import { calcularIndicadores, type IndicadoresGrade } from "./indicadores";
 import type { Puzzle } from "./tipos";
 
 /**
@@ -47,6 +48,7 @@ export type MetadataSessaoGrade = {
   dessasMantidas: number;
   dessasRevisadas: number;
   atribuicoesComEstadoJaContraditorio: number;
+  indicadores?: IndicadoresGrade;
 };
 
 export interface AgregadoSessaoGrade {
@@ -79,15 +81,20 @@ export function agregarSessaoGrade(
       0
     ) / concluidos.length;
 
+  const metadataSemIndicadores: MetadataSessaoGrade = {
+    problemas,
+    problemasResolvidos: concluidos.length,
+    tempoTotal: somar("tempoTotal"),
+    atribuicoesAntesDeDeterminacao: somar("atribuicoesAntesDeDeterminacao"),
+    dessasMantidas: somar("dessasMantidas"),
+    dessasRevisadas: somar("dessasRevisadas"),
+    atribuicoesComEstadoJaContraditorio: somar("atribuicoesComEstadoJaContraditorio"),
+  };
+
   return {
     metadata: {
-      problemas,
-      problemasResolvidos: concluidos.length,
-      tempoTotal: somar("tempoTotal"),
-      atribuicoesAntesDeDeterminacao: somar("atribuicoesAntesDeDeterminacao"),
-      dessasMantidas: somar("dessasMantidas"),
-      dessasRevisadas: somar("dessasRevisadas"),
-      atribuicoesComEstadoJaContraditorio: somar("atribuicoesComEstadoJaContraditorio"),
+      ...metadataSemIndicadores,
+      indicadores: calcularIndicadores(metadataSemIndicadores),
     },
     acuracia,
   };
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/grade/indicadores.test.ts
?? lib/grade/indicadores.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-indicadores ==
