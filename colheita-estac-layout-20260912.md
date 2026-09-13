== DIFF do lab estac-layout (contra a base do bundle) ==
diff --git a/components/exercises/executive/EstacionamentoLogico.tsx b/components/exercises/executive/EstacionamentoLogico.tsx
index 7bd29ba2..fe242942 100644
--- a/components/exercises/executive/EstacionamentoLogico.tsx
+++ b/components/exercises/executive/EstacionamentoLogico.tsx
@@ -7,6 +7,10 @@ import { ExerciseProgressBar } from "@/components/exercises/ExerciseProgressBar"
 import { ExerciseStage } from "@/components/exercises/ExerciseStage";
 import { assignCarImages, ALL_CAR_IMAGES } from "@/lib/parking-cars";
 import { PARKING_LEVELS, PLAY_LEVELS } from "@/lib/parking-levels";
+import {
+  BORDER, CORRIDOR, FUNDO_POR_PERIODO, medidasDoTabuleiro, periodoDoDia,
+  tamanhoDaCelula, VEU_POR_PERIODO,
+} from "@/lib/parking-layout";
 import type { Level } from "@/types/parking";
 import type { ExerciseResult, Theme } from "@/types";
 
@@ -48,11 +52,7 @@ function stepDiff(cur: number, dir: 1 | -1): number {
 
 // ── Layout constants ──────────────────────────────────────────────────────────
 const GRID     = 6;
-const BORDER   = 11;   // curb thickness px (meio-fio amarelo/preto)
-const PARKING_BG = "/exercises/Carros/parking-bg.jpg"; // foto do estacionamento (fundo)
 const EXIT_ROW = 2;    // target car row (0-indexed, from bottom)
-const CORRIDOR = 26;   // exit corridor width px (outside board)
-const GAME_BACKGROUND = `#23262e linear-gradient(rgba(8,10,16,0.28), rgba(8,10,16,0.4)), url(${PARKING_BG}) center / cover`;
 
 // ── Types ─────────────────────────────────────────────────────────────────────
 interface Car {
@@ -266,8 +266,8 @@ function CarImage({
 }
 
 // ── Parking lot SVG board ─────────────────────────────────────────────────────
-function BoardSVG({ cellPx }: { cellPx: number }) {
-  const S   = GRID * cellPx;
+function BoardSVG({ cellPx, grid }: { cellPx: number; grid: number }) {
+  const S   = grid * cellPx;
   const B   = BORDER;
   const T   = S + B * 2;
   const TW  = T + CORRIDOR;     // total SVG width (board + exit corridor)
@@ -311,13 +311,13 @@ function BoardSVG({ cellPx }: { cellPx: number }) {
       <rect x={B} y={B} width={S} height={S} rx={7} fill="rgba(33,41,62,0.82)" />
 
       {/* Grade do exercício — linhas bem sutis */}
-      {Array.from({ length: GRID - 1 }).map((_, i) => (
+      {Array.from({ length: grid - 1 }).map((_, i) => (
         <line key={`v${i}`}
           x1={B + (i+1)*cellPx} y1={B + 2} x2={B + (i+1)*cellPx} y2={T - B - 2}
           stroke="rgba(255,255,255,0.10)" strokeWidth={1.2}
         />
       ))}
-      {Array.from({ length: GRID - 1 }).map((_, i) => (
+      {Array.from({ length: grid - 1 }).map((_, i) => (
         <line key={`h${i}`}
           x1={B + 2} y1={B + (i+1)*cellPx} x2={T - B - 2} y2={B + (i+1)*cellPx}
           stroke="rgba(255,255,255,0.08)" strokeWidth={1.2}
@@ -360,21 +360,7 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
 
   const [cellPx, setCellPx] = useState(52);
   const wrapRef = useRef<HTMLDivElement>(null);
-
-  useLayoutEffect(() => {
-    function compute() {
-      const w = wrapRef.current?.offsetWidth ?? window.innerWidth;
-      // Reserve: 2×12px side padding + 2×BORDER + CORRIDOR
-      const available = w - 24 - BORDER * 2 - CORRIDOR;
-      setCellPx(Math.min(Math.max(Math.floor(available / GRID), 44), 70));
-    }
-    compute();
-    window.addEventListener("resize", compute);
-    return () => window.removeEventListener("resize", compute);
-  }, []);
-
-  const boardInner = GRID * cellPx;
-  const boardTotal = boardInner + BORDER * 2;
+  const boardWrapRef = useRef<HTMLDivElement>(null);
 
   // Pré-carrega todas as imagens dos carros no mount (evita atraso/piscar ao
   // trocar de fase). 38 PNGs leves (~74KB) → cache do navegador.
@@ -395,6 +381,9 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
   const recentRef   = useRef<string[]>(loadRecentIds()); // ids de fases já jogadas (inclui sessões anteriores)
 
   const [currentLevel, setCurrentLevel] = useState<Level>(initRef.current.level);
+  // O campo prepara o layout para grids maiores; a lógica do puzzle segue 6×6.
+  const gridDaFase = currentLevel.grid ?? GRID;
+  const [periodo] = useState(() => periodoDoDia(new Date().getHours()));
   const [cars, setCars]         = useState<Car[]>(() => initRef.current!.level.cars.map(c => ({ ...c })));
   const carsRef = useRef(cars); carsRef.current = cars;         // estado atual p/ colisão no arraste
   const [moves, setMoves]       = useState(0);
@@ -415,6 +404,30 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
   const dragRef  = useRef<DragState | null>(null);
   const startedRef = useRef(false);
 
+  useLayoutEffect(() => {
+    const compute = () => {
+      const conteudo = wrapRef.current;
+      const tabuleiro = boardWrapRef.current;
+      const largura = (conteudo?.clientWidth ?? window.innerWidth) - CORRIDOR;
+      // Mede o cromo que realmente está visível (instrução, progresso e banners),
+      // para reservar ao tabuleiro só a altura que sobra no viewport.
+      const cromo = conteudo && tabuleiro
+        ? conteudo.getBoundingClientRect().height - tabuleiro.getBoundingClientRect().height
+        : 0;
+      const altura = window.innerHeight - cromo;
+      const proximo = tamanhoDaCelula(gridDaFase, { largura, altura });
+      setCellPx((anterior) => anterior === proximo ? anterior : proximo);
+    };
+
+    compute();
+    window.addEventListener("resize", compute);
+    return () => window.removeEventListener("resize", compute);
+  }, [gridDaFase, hint, tutorial, currentLevel]);
+
+  const { interno: boardInner, total: boardTotal } = medidasDoTabuleiro(gridDaFase, cellPx);
+  const [veuInicio, veuFim] = VEU_POR_PERIODO[periodo];
+  const gameBackground = `#23262e linear-gradient(${veuInicio}, ${veuFim}), url(${FUNDO_POR_PERIODO[periodo]}) center / cover no-repeat`;
+
   useEffect(() => { if (!startedRef.current) { startedRef.current = true; begin(); } }, [begin]);
 
   // Erros SEGUIDOS = solves não-perfeitos em sequência. Após 4, o resultado oferece "Ver dica".
@@ -561,12 +574,12 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
   const onPtrMove = useCallback((e: React.PointerEvent, car: Car) => {
     const d = dragRef.current;
     if (!d || d.carId !== car.id || !boardRef.current) return;
-    const cpx = boardRef.current.getBoundingClientRect().width / GRID;
+    const cpx = boardRef.current.getBoundingClientRect().width / gridDaFase;
     const px  = d.axis === "horizontal" ? e.clientX : e.clientY;
     const raw = d.startPos + (px - d.startPx) / cpx;
     d.currentPos = Math.max(d.min, Math.min(d.max, raw));
     setDragPrev({ id: car.id, pos: d.currentPos });
-  }, []);
+  }, [gridDaFase]);
 
   const onPtrUp = useCallback((e: React.PointerEvent, car: Car) => {
     const d = dragRef.current;
@@ -580,16 +593,16 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
   // ── Tutorial concluído ────────────────────────────────────────────────────
   if (won && tutorial) {
     return (
-      <ExerciseStage width="medio" background="#ECEAE4">
-        <div className="w-full max-w-xs text-center">
-          <p className="text-2xl font-light mb-3" style={{ color: "#2E9E4F" }}>Tutorial concluído</p>
-          <p className="text-sm mb-8" style={{ color: "#6B7384" }}>
+      <ExerciseStage width="medio" background={gameBackground}>
+        <div className="w-full max-w-sm mx-auto text-center">
+          <p className="text-2xl font-light mb-3" style={{ color: "#D8FFE0", textShadow: "0 2px 5px rgba(0,0,0,0.8)" }}>Tutorial concluído</p>
+          <p className="text-sm mb-8" style={{ color: "#F1F3F8", textShadow: "0 2px 5px rgba(0,0,0,0.8)" }}>
             Você liberou o carro vermelho! É sempre assim: mova os outros carros para abrir o caminho e leve o vermelho até a saída.
           </p>
           <button
             onClick={startRealGame}
             className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide text-white"
-            style={{ background: "#2C3444" }}
+            style={{ background: "#2C3444", boxShadow: "0 2px 6px rgba(0,0,0,0.65)" }}
           >
             Começar
           </button>
@@ -700,20 +713,21 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
 
   // ── Game screen ───────────────────────────────────────────────────────────
   return (
-    <ExerciseStage width="medio" background={GAME_BACKGROUND}>
+    <ExerciseStage width="medio" background={gameBackground}>
       <div
       ref={wrapRef}
-      className="w-full flex flex-col items-center"
+      className="w-full mx-auto flex flex-col items-center"
       style={{
         // Sem seleção de texto/realce ao arrastar (evita o tabuleiro "ficar azul").
         userSelect: "none",
         WebkitUserSelect: "none",
         WebkitTapHighlightColor: "transparent",
+        gap: 10,
       }}
     >
       {/* Instruction — centered, above the board */}
       <p style={{
-        marginTop: 22, marginBottom: 12,
+        margin: 0,
         fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
         textShadow: "0 1px 4px rgba(0,0,0,0.6)",
         textAlign: "center",
@@ -723,7 +737,7 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
       </p>
 
       {/* Barra de progresso (pelo tempo, ~11 min, em saltos de 10%) */}
-      <div style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 14 }}>
+      <div style={{ width: "min(100%, 340px)", display: "flex", alignItems: "center", gap: 8 }}>
         <ExerciseProgressBar progressPct={progressPct} theme={theme} emTolerancia={emTolerancia()} />
       </div>
 
@@ -731,7 +745,7 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
       {!tutorial && hint && (
         <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#7A4B00",
           background: "rgba(252,211,77,0.92)", borderRadius: 10, padding: "7px 14px",
-          margin: "10px auto 0", maxWidth: 340, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
+          margin: 0, maxWidth: 340, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
           💡 {hintMsg}
         </p>
       )}
@@ -740,15 +754,18 @@ export function EstacionamentoLogico({ difficulty, theme, onComplete }: Props) {
       {cellRule && !won && (
         <p style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#B45309",
           background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.25)",
-          borderRadius: 10, padding: "7px 12px", margin: "0 auto", maxWidth: 340 }}>
+          borderRadius: 10, padding: "7px 12px", margin: 0, maxWidth: 340 }}>
           Nível avançado: cada quadradinho percorrido conta como um movimento.
         </p>
       )}
 
       {/* Board — fills available width */}
-      <div style={{ display: "flex", justifyContent: "center", paddingLeft: 12, paddingRight: 12 }}>
+      <div
+        ref={boardWrapRef}
+        style={{ display: "flex", justifyContent: "center", paddingLeft: CORRIDOR, boxSizing: "content-box" }}
+      >
         <div style={{ position: "relative", width: boardTotal + CORRIDOR, height: boardTotal, flexShrink: 0 }}>
-          <BoardSVG cellPx={cellPx} />
+          <BoardSVG cellPx={cellPx} grid={gridDaFase} />
 
           {/* Vehicle grid */}
           <div
diff --git a/types/parking.ts b/types/parking.ts
index e67fcc12..d15a2288 100644
--- a/types/parking.ts
+++ b/types/parking.ts
@@ -10,6 +10,8 @@ export interface ParkingCar {
 export interface Level {
   /** Identificador estável da fase (ex.: "n3-07") — usado para não repetir entre sessões. */
   id?: string;
+  /** Lado visual do grid. A lógica atual permanece limitada a 6×6. */
+  grid?: number;
   idealMoves: number;
   cars: ParkingCar[];
 }
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/parking-layout.test.ts
?? lib/parking-layout.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover estac-layout ==
