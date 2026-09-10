== DIFF do lab grade-relatorio (contra a base do bundle) ==
diff --git a/app/api/reports/route.ts b/app/api/reports/route.ts
index 45844215..71fdc5ab 100644
--- a/app/api/reports/route.ts
+++ b/app/api/reports/route.ts
@@ -16,6 +16,7 @@ import { calculateDomainScore, generateRecommendations } from "@/lib/scoring";
 import { summarizeStoryTrail } from "@/lib/story-trail-report";
 import { summarizeFocusAgents, focusModeLabel } from "@/lib/focus-report";
 import { summarizeCaminhosMeta, caminhosModoLabel } from "@/lib/caminhos-report";
+import { gradeRazaoLabel, summarizeGradeDedutiva } from "@/lib/grade-report";
 import { formatDate, calculateAge } from "@/lib/utils";
 import { DOMAIN_LABELS } from "@/types";
 import type { SessionData } from "@/types";
@@ -187,6 +188,7 @@ export const GET = withApiHandler(async (req: NextRequest) => {
   const trail = summarizeStoryTrail(sessionRows);   // resumo da trilha (separa as incompletas)
   const focus = summarizeFocusAgents(sessionRows);  // resumo do Focus Agentes
   const caminhos = summarizeCaminhosMeta(sessionRows);  // resumo do Caminhos para a Meta
+  const grade = summarizeGradeDedutiva(sessionRows);
   const isAbandoned = (s: { metadata?: string | null }) => {
     try { return (JSON.parse(s.metadata || "{}") as { abandoned?: boolean }).abandoned === true; } catch { return false; }
   };
@@ -199,6 +201,7 @@ export const GET = withApiHandler(async (req: NextRequest) => {
   const trailNo = trail ? _sec++ : 0;
   const focusNo = focus ? _sec++ : 0;
   const caminhosNo = caminhos ? _sec++ : 0;
+  const gradeNo = grade ? _sec++ : 0;
   const recNo = _sec;
 
   const stagePlain = trail ? trail.stageLabel.replace(/^[^A-Za-zÀ-ÿ]+/, "") : "";
@@ -242,6 +245,19 @@ export const GET = withApiHandler(async (req: NextRequest) => {
     ...caminhos.observations.map((o, i) => createElement(Text, { style: styles.recommendations, key: `cmo${i}` }, `• ${o}`)),
   ] : [];
 
+  const gradeSection = grade ? [
+    createElement(Text, { style: styles.sectionTitle, key: "gd" }, `${gradeNo}. Grade Dedutiva`),
+    createElement(View, { style: styles.row, key: "gd1" }, createElement(Text, { style: styles.label }, "Problemas resolvidos:"), createElement(Text, { style: styles.value }, gradeRazaoLabel(grade.problemasResolvidos, grade.totalProblemas))),
+    createElement(View, { style: styles.row, key: "gd2" }, createElement(Text, { style: styles.label }, "Organização construída antes de a relação estar determinada:"), createElement(Text, { style: styles.value }, grade.totalAtribuicoes === 0 ? "—" : `${gradeRazaoLabel(grade.atribuicoesAntesDeDeterminacao, grade.totalAtribuicoes)} · ${grade.atribuicoesMantidas} mantidas × ${grade.atribuicoesRevisadas} revisadas`)),
+    createElement(View, { style: styles.row, key: "gd3" }, createElement(Text, { style: styles.label }, "Escolhas mantidas com a organização já incompatível:"), createElement(Text, { style: styles.value }, gradeRazaoLabel(grade.escolhasComOrganizacaoIncompativel, grade.totalAtribuicoes))),
+    createElement(View, { style: styles.row, key: "gd4" }, createElement(Text, { style: styles.label }, "Verificações usadas · seguidas de correção:"), createElement(Text, { style: styles.value }, grade.cotaDeVerificacoes === null || grade.cotaDeVerificacoes === 0 ? "—" : `${gradeRazaoLabel(grade.verificacoesUsadas, grade.cotaDeVerificacoes)} · ${grade.verificacoesSeguidasDeCorrecao} ${grade.verificacoesSeguidasDeCorrecao === 1 ? "seguida" : "seguidas"} de correção`)),
+    createElement(View, { style: styles.row, key: "gd5" }, createElement(Text, { style: styles.label }, "Pistas trabalhadas · retomadas depois:"), createElement(Text, { style: styles.value }, grade.totalPistas === null || grade.totalPistas === 0 ? "—" : `${gradeRazaoLabel(grade.pistasTrabalhadas, grade.totalPistas)} · ${grade.pistasRetomadas} ${grade.pistasRetomadas === 1 ? "retomada" : "retomadas"} depois`)),
+    createElement(View, { style: styles.row, key: "gd6" }, createElement(Text, { style: styles.label }, "Tempo médio por problema:"), createElement(Text, { style: styles.value }, grade.meanTimeS === null ? "—" : `${grade.meanTimeS}s`)),
+    createElement(View, { style: styles.row, key: "gd7" }, createElement(Text, { style: styles.label }, "Evolução no próprio histórico:"), createElement(Text, { style: styles.value }, grade.trend === "subiu" ? "Subiu" : grade.trend === "regrediu" ? "Regrediu" : "Manteve")),
+    createElement(Text, { style: { ...styles.label, marginTop: 6 }, key: "gd8" }, "Observações descritivas:"),
+    ...grade.observations.map((observation, index) => createElement(Text, { style: styles.recommendations, key: `gdo${index}` }, `• ${observation}`)),
+  ] : [];
+
   const doc = createElement(Document, {},
     createElement(Page, { size: "A4", style: styles.page },
       createElement(View, { style: styles.header },
@@ -298,6 +314,7 @@ export const GET = withApiHandler(async (req: NextRequest) => {
       ...trailSection,
       ...focusSection,
       ...caminhosSection,
+      ...gradeSection,
 
       createElement(Text, { style: styles.sectionTitle }, `${recNo}. Recomendações`),
       createElement(Text, { style: styles.recommendations }, recommendations),
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/grade-report.test.ts
?? lib/grade-report.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-relatorio ==
