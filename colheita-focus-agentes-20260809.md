== DIFF do lab focus-agentes (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index 8e5ceda..770347e 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -44,6 +44,7 @@ import {
   tempoReacaoTutorial,
   vigilanciaTutorial,
 } from "@/lib/tutorial/definitions/estimulo-continuo";
+import { focusAgentsTutorial } from "@/lib/tutorial/definitions/focus-agents";
 import type { TutorialDefinition } from "@/lib/tutorial/types";
 import type { TutorialState } from "@/lib/tutorial/state";
 
@@ -73,6 +74,7 @@ const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>> = Ob
   "dual-task": dualTaskTutorial,
   "mot": motTutorial,
   "certo-ou-errado": certoOuErradoTutorial,
+  "focus-agents": focusAgentsTutorial,
 });
 
 function ExerciseLoader() {
@@ -336,7 +338,10 @@ const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
     "Use eliminação: se souber que Bruno=Verde, marque NÃO para Ana e Carla.",
     "Confirme quando tiver certeza de todas as células!",
   ],
-  "focus-agents": [],
+  "focus-agents": [
+    "Um comando indica o personagem que você precisa encontrar.",
+    "Clique no personagem que corresponde ao comando.",
+  ],
   "focus-agents-auditivo": [],
   "cubo-corsi": [
     "Um cubo 3D com 8 blocos aparecerá na tela.",
diff --git a/components/exercises/attention/FocusAgents.tsx b/components/exercises/attention/FocusAgents.tsx
index 9136d84..dc32a87 100644
--- a/components/exercises/attention/FocusAgents.tsx
+++ b/components/exercises/attention/FocusAgents.tsx
@@ -18,8 +18,9 @@ import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar"
 import { playTTS, cancelTTS } from "@/lib/tts";
 import type { ExerciseResult, Theme } from "@/types";
 import { gerarRodada, matches, atributoFaltante, FUNCAO_DA_ETAPA, type FocusRound } from "@/lib/focus/commands";
-import { STEPS, type Step } from "@/lib/focus/progression";
+import { STEPS } from "@/lib/focus/progression";
 import { charById, COR_HEX, FOCUS_CHARS, type Acessorio, type Objeto } from "@/lib/focus/roster";
+import { focusImagePreloader } from "@/lib/focus/image-loader";
 import {
   buildFocusCompletionMetadata,
   resolveFocusStartStep,
@@ -122,59 +123,6 @@ function AnuncioComando({ round, onOk }: { round: FocusRound; onOk: () => void }
   );
 }
 
-// ── Tutorial demonstrativo (grade com o ALVO destacado — como antes) ─────────
-const DEMO = [
-  { id: "azul_fone", alvo: true }, { id: "vermelho_base", alvo: false }, { id: "verde_oculos", alvo: false },
-  { id: "roxo_bone", alvo: false }, { id: "amarelo_coroa", alvo: false }, { id: "laranja_base", alvo: false },
-];
-function Tutorial({ onStart }: { onStart: () => void }) {
-  return (
-    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 py-8 overflow-y-auto"
-      style={{ background: ARENA_BG }}>
-      <h2 className="font-black text-2xl mb-1 text-center" style={{ color: TXT }}>Como jogar</h2>
-      <p className="text-sm mb-4 text-center" style={{ color: TXT_SUAVE }}>Encontre o personagem indicado.</p>
-
-      {/* Comando de exemplo */}
-      <div className="w-full max-w-xs rounded-2xl px-3 py-2.5 flex items-center gap-3 mb-4"
-        style={{ background: "#FFFFFF", border: `1.5px solid ${ARENA_BORDA}` }}>
-        <span className="w-6 h-6 rounded-full border-2" style={{ background: COR_HEX.azul, borderColor: ARENA_BORDA }} />
-        <span className="text-xl">🎧</span>
-        <p className="font-bold text-sm" style={{ color: TXT }}>Toque no azul com fone</p>
-      </div>
-
-      {/* Grade demo — o ALVO fica destacado com ✓ verde */}
-      <div className="w-full max-w-xs grid grid-cols-3 gap-2 mb-5">
-        {DEMO.map((d) => (
-          <div key={d.id} className="relative flex items-end justify-center" style={{ height: 116 }}>
-            {/* eslint-disable-next-line @next/next/no-img-element */}
-            <img src={imgSrc(d.id)} alt="" draggable={false}
-              style={{ width: 68, height: 102, objectFit: "contain",
-                filter: d.alvo ? "drop-shadow(0 0 8px rgba(74,222,128,.95)) drop-shadow(0 0 16px rgba(74,222,128,.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,.5))" }} />
-            {d.alvo && <div className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-black shadow-lg">✓</div>}
-          </div>
-        ))}
-      </div>
-
-      <div className="w-full max-w-xs rounded-2xl px-4 py-3 mb-6 space-y-1.5"
-        style={{ background: "#FFFFFF", border: `1px solid ${ARENA_BORDA}` }}>
-        {[
-          "Leia o comando (cor + acessório) que aparece antes e fica no topo.",
-          "No começo eles ficam espalhados; nos níveis seguintes passam a cair de cima.",
-          "Toque só no que corresponde — com a evolução, aparecem mais personagens e a queda acelera.",
-          "Use o 🔊 para ouvir o comando de novo.",
-        ].map((b, i) => (
-          <p key={i} className="text-xs leading-relaxed" style={{ color: TXT_SUAVE }}>• {b}</p>
-        ))}
-      </div>
-
-      <button onClick={onStart}
-        className="w-full max-w-xs h-12 rounded-full font-bold text-white text-base active:scale-95 transition-transform"
-        style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>Começar! 🚀</button>
-    </div>
-  );
-}
-
-
 // Personagem NÃO pode cobrir personagem: quando o alvo fica atrás de outro, o paciente
 // ou espera passar (o tempo de detecção infla) ou toca no de cima (conta erro) — e o
 // tempo de detecção decide a subida de nível. Empurra pelo eixo de MENOR penetração;
@@ -209,8 +157,8 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   const auditivo = exerciseId === "focus-agents-auditivo";
   const { begin, isTimeUp, elapsedSec, finish, progressPct } = useTimedProgress();
 
-  type Fase = "instrucoes" | "comando" | "jogando" | "feedback";
-  const [fase, setFase] = useState<Fase>("instrucoes");
+  type Fase = "comando" | "jogando" | "feedback";
+  const [fase, setFase] = useState<Fase>("comando");
   const [round, setRound] = useState<FocusRound | null>(null);
   const [chars, setChars] = useState<LiveChar[]>([]);
   const [fb, setFb] = useState<{ ok: boolean; msg: string; alvoUid: string | null } | null>(null);
@@ -234,19 +182,16 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   const doneRef = useRef(false);
   const uidSeq = useRef(0);
   const iniciouRef = useRef(false);
+  const proximaRodadaRef = useRef<{ step: number; round: FocusRound } | null>(null);
 
   const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
   const clearOmissao = () => { if (omissaoRef.current) { clearTimeout(omissaoRef.current); omissaoRef.current = null; } };
   const stopRaf = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
 
-  useEffect(() => () => { stopRaf(); clearTimers(); clearOmissao(); cancelTTS(); }, []);
-
-  // Pré-carrega TODAS as imagens dos personagens já na tela de instruções, populando o
-  // cache do browser — assim cada rodada aparece na hora, sem o delay de carregamento.
   useEffect(() => {
-    const imgs = FOCUS_CHARS.map((c) => { const im = new Image(); im.src = imgSrc(c.id); return im; });
-    return () => { imgs.forEach((im) => { im.onload = null; im.src = ""; }); };
-  }, []);
+    begin();
+    return () => { stopRaf(); clearTimers(); clearOmissao(); cancelTTS(); };
+  }, [begin]);
 
   const falar = useCallback((r: FocusRound) => { playTTS(r.texto.replace(/\*\*/g, "")); }, []);
 
@@ -442,8 +387,17 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   // ANUNCIA o comando, depois solta a queda (§ "mandar antes" + sempre visível)
   const novaRodada = useCallback(() => {
     if (doneRef.current || isTimeUp()) { encerrar(); return; }
-    const step = STEPS[stepRef.current];
-    const r = gerarRodada(step.etapa, step.n, roundRef.current?.texto, step.semelhantes); // não repete o comando anterior
+    const stepIndex = stepRef.current;
+    const step = STEPS[stepIndex];
+    const planejada = proximaRodadaRef.current;
+    const r = planejada?.step === stepIndex
+      ? planejada.round
+      : gerarRodada(step.etapa, step.n, roundRef.current?.texto, step.semelhantes);
+    const proxima = gerarRodada(step.etapa, step.n, r.texto, step.semelhantes);
+    proximaRodadaRef.current = { step: stepIndex, round: proxima };
+    focusImagePreloader.requestMany(r.personagensIds.map(imgSrc), true);
+    focusImagePreloader.requestMany(proxima.personagensIds.map(imgSrc), true);
+    focusImagePreloader.requestMany(FOCUS_CHARS.map((character) => imgSrc(character.id)));
     roundRef.current = r;
     setRound(r);
     setChars([]); charsRef.current = [];
@@ -532,10 +486,6 @@ export function FocusAgents({ difficulty, theme, onComplete, exerciseId = "focus
   }, [fase, novaRodada]);
 
   // ── render ─────────────────────────────────────────────────────────────────
-  if (fase === "instrucoes") {
-    return <Tutorial onStart={() => { begin(); setFase("comando"); }} />;
-  }
-
   return (
     <div className="fixed inset-0 flex flex-col" style={{ background: ARENA_BG }}>
       {/* Só a barra de progresso no topo — SEM o comando visível durante a busca
diff --git a/lib/tutorial/estimulo-continuo.test.ts b/lib/tutorial/estimulo-continuo.test.ts
index 8eb95d0..fe0f605 100644
--- a/lib/tutorial/estimulo-continuo.test.ts
+++ b/lib/tutorial/estimulo-continuo.test.ts
@@ -176,14 +176,14 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(modoDe("vigilancia")).toBe("continua");
   });
 
-  it("registra os sete e chega aos 19 convertidos", () => {
+  it("registra os sete e chega aos 20 convertidos", () => {
     const page = source("app/(patient)/treino/[exercicio]/page.tsx");
     const register = page.slice(
       page.indexOf("const TUTORIAIS_POR_EXERCICIO"),
       page.indexOf("});", page.indexOf("const TUTORIAIS_POR_EXERCICIO")),
     );
     const converted = register.match(/(?:"[a-z-]+"|[a-z]+):\s*[a-zA-Z]+Tutorial/g) ?? [];
-    expect(converted).toHaveLength(19);
+    expect(converted).toHaveLength(20);
     for (const exerciseId of [
       "semaforo",
       "vigilancia",
@@ -192,6 +192,7 @@ describe("Família 4 — estímulo contínuo", () => {
       "dual-task",
       "mot",
       "certo-ou-errado",
+      "focus-agents",
     ]) {
       expect(register).toContain(exerciseId);
     }
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/focus/image-loader.test.ts
?? lib/focus/image-loader.ts
?? lib/tutorial/definitions/focus-agents.tsx
?? lib/tutorial/focus-agents.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover focus-agentes ==
