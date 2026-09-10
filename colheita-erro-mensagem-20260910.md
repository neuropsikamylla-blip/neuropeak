== DIFF do lab erro-mensagem (contra a base do bundle) ==
diff --git a/components/exercises/executive/DesafioOrcamento.tsx b/components/exercises/executive/DesafioOrcamento.tsx
index 7e8b6572..aa3d5067 100644
--- a/components/exercises/executive/DesafioOrcamento.tsx
+++ b/components/exercises/executive/DesafioOrcamento.tsx
@@ -187,7 +187,7 @@ function TutStep({ theme, onDone }: { theme: Theme; onDone: () => void }) {
         <span className={`text-xs ${sub}`}>{sel.size} item(s) selecionado(s)</span>
         <span className={`text-xs ${sub}`}>💡 Calcule mentalmente</span>
       </div>
-      {confirmed && !ok && <p className="text-xs text-center text-red-500 font-semibold">Orçamento não respeitado! Tente de novo.</p>}
+      {confirmed && !ok && <p className="text-xs text-center text-red-500 font-semibold">Orçamento excedido.</p>}
       <button onClick={confirm} disabled={sel.size === 0}
         className={`w-full h-11 rounded-xl font-bold text-white transition-all disabled:opacity-40 ${
           theme === "GAMIFIED" ? "bg-cyan-600" : "bg-indigo-600"
@@ -353,7 +353,7 @@ export function DesafioOrcamento({ difficulty, theme, onComplete }: Props) {
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                 <p className="text-5xl mb-2">{lastCorrect ? "✅" : "❌"}</p>
                 <p className={`font-bold text-lg ${lastCorrect ? "text-green-600" : "text-red-500"}`}>
-                  {lastCorrect ? "Orçamento respeitado!" : "Tente de novo na próxima"}
+                  {lastCorrect ? "Orçamento respeitado!" : "Valor fora do orçamento"}
                 </p>
                 <p className={`text-sm mt-1 ${pal.sub}`}>
                   Você gastou: <strong>{fmt(totalRounded)}</strong> · {currentRound.goal.label}
diff --git a/components/exercises/executive/EstacionamentoLogico.tsx b/components/exercises/executive/EstacionamentoLogico.tsx
index fdc552b4..12da5254 100644
--- a/components/exercises/executive/EstacionamentoLogico.tsx
+++ b/components/exercises/executive/EstacionamentoLogico.tsx
@@ -605,12 +605,12 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
     const perfect = extra <= 0;            // resolveu no mínimo
     const oneOver = extra === 1;           // 1 a mais → pode seguir ou refazer
     // 2+ a mais → treino rígido: tem que refazer.
-    const headColor = perfect ? "#2E9E4F" : oneOver ? "#B45309" : "#3A4050";
+    const headColor = "#3A4050";
     return (
       <ExerciseStage width="medio" background="#ECEAE4">
         <div className="w-full max-w-xs text-center">
           <p className="text-2xl font-light mb-8" style={{ color: headColor }}>
-            {perfect ? "Perfeito!" : oneOver ? "Quase perfeito!" : "Quase lá"}
+            Desafio resolvido
           </p>
           <div className="flex justify-center gap-14 mb-8">
             <div>
@@ -659,7 +659,7 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
           ) : (
             <>
               <p className="text-sm mb-5" style={{ color: "#6B7384" }}>
-                Você fez <strong>{extra} movimentos a mais</strong>. Dá para resolver em <strong>{ideal}</strong> — tente de novo!
+                Você fez <strong>{extra} movimentos a mais</strong>. Dá para resolver em <strong>{ideal}</strong> movimentos.
               </p>
               <button
                 onClick={() => loadLevel(currentLevel)}
diff --git a/components/exercises/executive/StroopTask.tsx b/components/exercises/executive/StroopTask.tsx
index 41459d78..1dbc932d 100644
--- a/components/exercises/executive/StroopTask.tsx
+++ b/components/exercises/executive/StroopTask.tsx
@@ -360,13 +360,7 @@ function TutorialStep({
                   border: `1.5px solid ${isCorrect ? "rgba(74,222,128,0.3)" : "rgba(251,113,133,0.3)"}`,
                 }}
               >
-                <p
-                  className="font-bold text-base tracking-wide"
-                  style={{ color: isCorrect ? "#4ade80" : "#fb7185" }}
-                >
-                  {isCorrect ? "✓ Correto" : "✗ Quase lá"}
-                </p>
-                <p className="text-sm mt-1 text-slate-300">
+                <p className="text-sm text-slate-300">
                   {item.rule === "COR" ? (
                     isCorrect ? (
                       <>
@@ -374,7 +368,7 @@ function TutorialStep({
                         <strong style={{ color: item.inkColor.hex }}>
                           {item.inkColor.name}
                         </strong>
-                        . Perfeito!
+                        .
                       </>
                     ) : (
                       <>
@@ -389,7 +383,6 @@ function TutorialStep({
                     <>
                       A palavra escrita era{" "}
                       <strong className="text-white">{item.word.name}</strong>.
-                      Perfeito!
                     </>
                   ) : (
                     <>
diff --git a/components/exercises/processing/IdentificacaoSimbolos.tsx b/components/exercises/processing/IdentificacaoSimbolos.tsx
index 2ef552e1..c30c7b00 100644
--- a/components/exercises/processing/IdentificacaoSimbolos.tsx
+++ b/components/exercises/processing/IdentificacaoSimbolos.tsx
@@ -109,12 +109,14 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
   });
   const [results, setResults] = useState<{ correct: boolean; rt: number; distractors: number }[]>([]);
   const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
+  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
   const trialStart = useRef<number>(Date.now());
 
   function advanceTrial(newTarget: string, dCount: number) {
     setTarget(newTarget);
     setOptions(makeOptions(newTarget, dCount));
     setFeedback(null);
+    setSelectedSymbol(null);
     trialStart.current = Date.now();
   }
 
@@ -122,6 +124,7 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
     if (feedback) return;
     const rt = Date.now() - trialStart.current;
     const isCorrect = symbol === target;
+    setSelectedSymbol(symbol);
     setFeedback(isCorrect ? "correct" : "incorrect");
     const newResults = [...results, { correct: isCorrect, rt, distractors: distractorCount }];
     setResults(newResults);
@@ -205,6 +208,7 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
             let cellStyle = "";
             if (feedback) {
               if (isTargetSym) cellStyle = "bg-green-100 border-green-500 text-green-700";
+              else if (sym === selectedSymbol) cellStyle = "bg-red-100 border-red-500 text-red-700";
               else cellStyle = theme === "GAMIFIED" ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500";
             } else {
               cellStyle = theme === "GAMIFIED"
@@ -228,9 +232,10 @@ export function IdentificacaoSimbolos({ difficulty, theme, onComplete }: Identif
         </div>
 
         {feedback && (
-          <p className={`text-center text-sm font-medium ${feedback === "correct" ? "text-green-500" : "text-red-500"}`}>
-            {feedback === "correct" ? "Correto! ✅" : "Incorreto ❌"}
-          </p>
+          <div className="text-center text-sm font-medium text-gray-600">
+            <p>Era este o símbolo: <strong>{target}</strong></p>
+            <p>Símbolo tocado: <strong>{selectedSymbol}</strong></p>
+          </div>
         )}
       </div>
     </ExerciseStage>
diff --git a/components/exercises/processing/Semaforo.tsx b/components/exercises/processing/Semaforo.tsx
index f9f9854e..7d1c7d88 100644
--- a/components/exercises/processing/Semaforo.tsx
+++ b/components/exercises/processing/Semaforo.tsx
@@ -392,7 +392,7 @@ export function Semaforo({ difficulty, theme, onComplete }: SemaforoProps) {
                       feedback === "correct" ? "text-green-400" : "text-red-400"
                     }`}
                   >
-                    {feedback === "correct" ? "✓ Certo!" : "✗ Errado!"}
+                    {feedback === "correct" ? "✓" : "✗"}
                   </motion.p>
                 )}
               </AnimatePresence>
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover erro-mensagem ==
