== DIFF do lab grade-gerador (contra a base do bundle) ==
diff --git a/lib/grade/banco.ts b/lib/grade/banco.ts
index 79ddc6e9..e582f446 100644
--- a/lib/grade/banco.ts
+++ b/lib/grade/banco.ts
@@ -1,4 +1,7 @@
 import { pistaSimples, type Puzzle, type PuzzleMetadata } from "./tipos";
+import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
+
+export { PROBLEMAS_NIVEL_2 };
 
 function metadata(
   complexity: number,
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/grade/gerador.test.ts
?? lib/grade/gerador.ts
?? lib/grade/gerar-banco.test.ts
?? lib/grade/gramatica.test.ts
?? lib/grade/gramatica.ts
?? lib/grade/problemas/
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-gerador ==
