== DIFF do lab grade-tutorial (contra a base do bundle) ==
diff --git a/app/(patient)/treino/[exercicio]/page.tsx b/app/(patient)/treino/[exercicio]/page.tsx
index af3fa0b5..98faf109 100644
--- a/app/(patient)/treino/[exercicio]/page.tsx
+++ b/app/(patient)/treino/[exercicio]/page.tsx
@@ -45,6 +45,7 @@ import {
 import { focusAgentsTutorial } from "@/lib/tutorial/definitions/focus-agents";
 import { motTutorial } from "@/lib/tutorial/definitions/mot";
 import { vigilanciaTutorial } from "@/lib/tutorial/definitions/vigilancia";
+import { gradeDedutivaTutorial } from "@/lib/tutorial/definitions/grade-dedutiva";
 import type { TutorialDefinition } from "@/lib/tutorial/types";
 import type { TutorialState } from "@/lib/tutorial/state";
 
@@ -74,6 +75,7 @@ const TUTORIAIS_POR_EXERCICIO: Readonly<Record<string, TutorialDefinition>> = Ob
   "mot": motTutorial,
   "certo-ou-errado": certoOuErradoTutorial,
   "focus-agents": focusAgentsTutorial,
+  "deductive-grid": gradeDedutivaTutorial,
 });
 
 function ExerciseLoader() {
diff --git a/components/exercises/executive/DeductiveGrid.tsx b/components/exercises/executive/DeductiveGrid.tsx
index 21ebde6d..35937435 100644
--- a/components/exercises/executive/DeductiveGrid.tsx
+++ b/components/exercises/executive/DeductiveGrid.tsx
@@ -116,7 +116,263 @@ function paleta(theme: Theme) {
   };
 }
 
-function celulaComValor(
+type PaletaGrade = ReturnType<typeof paleta>;
+
+/** A cota pertence somente às peças compartilhadas do tutorial, nunca à fase inicial do treino. */
+export const VERIFICACOES_TUTORIAL_GRADE = verificacoesPermitidas(PROBLEMA_TUTORIAL.nivel, true);
+
+export function alvoCelulaGrade(categoria: string, posicao: number): string {
+  return `grade-cell-${categoria}-${posicao}`;
+}
+
+export function alvoOpcaoGrade(categoria: string, posicao: number, valor: string): string {
+  return `grade-option-${categoria}-${posicao}-${encodeURIComponent(valor)}`;
+}
+
+interface GradeDedutivaBoardProps {
+  puzzle: Puzzle;
+  grade: Record<string, ValorCelula[]>;
+  pistasRiscadas: ReadonlySet<string>;
+  mensagem: string | null;
+  concluido: boolean;
+  verificacoesRestantes: QuantidadeVerificacoes;
+  theme: Theme;
+  rotuloCabecalho: string;
+  instrucaoTutorial?: string;
+  onAtribuir: (categoria: string, posicao: number, valor: string) => void;
+  onLimpar: (categoria: string, posicao: number) => void;
+  alternarPista: (pistaId: string) => void;
+  onVerificar: () => void;
+  onConcluir: () => void;
+  menuAberto?: string | null;
+  onMenuAbertoChange?: (menu: string | null) => void;
+  portalContainer?: HTMLElement | null;
+  ponteiroSobreMenu?: boolean;
+}
+
+/**
+ * Peças reais da Grade. O treino e o tutorial compartilham esta mesma árvore de cabeçalho,
+ * pistas, células, menus e ações; os atributos `data-grade-*` apenas dão alvos ao DemoPointer.
+ */
+export function GradeDedutivaBoard({
+  puzzle,
+  grade,
+  pistasRiscadas,
+  mensagem,
+  concluido,
+  verificacoesRestantes,
+  theme,
+  rotuloCabecalho,
+  instrucaoTutorial,
+  onAtribuir,
+  onLimpar,
+  alternarPista,
+  onVerificar,
+  onConcluir,
+  menuAberto,
+  onMenuAbertoChange,
+  portalContainer,
+  ponteiroSobreMenu = false,
+}: GradeDedutivaBoardProps) {
+  const pal: PaletaGrade = paleta(theme);
+  const duplicadas = celulasComValorRepetido(grade);
+
+  return (
+    <main className="mx-auto w-full max-w-full overflow-x-hidden py-1 sm:py-3">
+      <section className={`overflow-hidden rounded-2xl border shadow-sm ${pal.painel}`}>
+        <header className={`border-b px-4 py-4 sm:px-6 ${pal.divisoria}`}>
+          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${pal.textoSuave}`}>
+            {rotuloCabecalho}
+          </p>
+          <h1 className={`mt-1 text-xl font-semibold sm:text-2xl ${pal.titulo}`}>{puzzle.titulo}</h1>
+          <p className={`mt-2 max-w-3xl text-sm leading-6 ${pal.texto}`}>{puzzle.contexto}</p>
+          {instrucaoTutorial && (
+            <p className={`mt-2 text-sm leading-6 ${pal.texto}`}>{instrucaoTutorial}</p>
+          )}
+        </header>
+
+        <div className="space-y-5 p-4 sm:p-6">
+          <section aria-labelledby="titulo-pistas">
+            <div className="mb-3 flex items-baseline justify-between gap-3">
+              <h2 id="titulo-pistas" className={`text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
+                Pistas
+              </h2>
+              <span className={`text-xs ${pal.textoSuave}`}>Toque para riscar ou restaurar</span>
+            </div>
+            <ol className="columns-1 gap-x-7 sm:columns-2">
+              {puzzle.pistas.map((pista, indice) => {
+                const riscada = pistasRiscadas.has(pista.id);
+                return (
+                  <li key={pista.id} className="mb-2 break-inside-avoid">
+                    <button
+                      type="button"
+                      data-grade-clue={pista.id}
+                      aria-pressed={riscada}
+                      onClick={() => alternarPista(pista.id)}
+                      className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-black/5 ${pal.texto} ${riscada ? "line-through opacity-50" : ""}`}
+                    >
+                      <span className="mr-2 font-semibold tabular-nums">{indice + 1}.</span>
+                      {pista.texto}
+                    </button>
+                  </li>
+                );
+              })}
+            </ol>
+          </section>
+
+          <section aria-labelledby="titulo-grade" className="min-w-0">
+            <h2 id="titulo-grade" className={`mb-3 text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
+              Organização
+            </h2>
+            <div
+              className={`max-w-full overflow-x-auto overscroll-x-contain rounded-xl border ${pal.divisoria} ${pal.superficie}`}
+              tabIndex={0}
+              aria-label="Grade com rolagem horizontal quando necessária"
+            >
+              <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0">
+                <colgroup>
+                  <col className="w-[140px]" />
+                  {Array.from({ length: puzzle.posicoes }, (_, indice) => <col key={indice} className="w-[105px]" />)}
+                </colgroup>
+                <thead>
+                  <tr>
+                    <th className={`sticky left-0 z-20 border-b border-r px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.rotulo}`}>
+                      Categoria
+                    </th>
+                    {Array.from({ length: puzzle.posicoes }, (_, indice) => (
+                      <th key={indice} className={`border-b px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.textoSuave}`}>
+                        {puzzle.rotulosPosicao?.[indice] ?? `Posição ${indice + 1}`}
+                      </th>
+                    ))}
+                  </tr>
+                </thead>
+                <tbody>
+                  {puzzle.categorias.map((categoria, indiceCategoria) => (
+                    <tr key={categoria.id}>
+                      <th
+                        scope="row"
+                        className={`sticky left-0 z-10 border-r px-3 py-3 text-left text-sm font-semibold ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria} ${pal.rotulo}`}
+                      >
+                        {categoria.label}
+                      </th>
+                      {Array.from({ length: puzzle.posicoes }, (_, indicePosicao) => {
+                        const posicao = indicePosicao + 1;
+                        const valorAtual = grade[categoria.id][indicePosicao];
+                        const duplicada = duplicadas.has(chavePosicaoGrade(categoria.id, posicao));
+                        const menuId = alvoCelulaGrade(categoria.id, posicao);
+                        return (
+                          <td
+                            key={posicao}
+                            className={`px-2 py-2 ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria}`}
+                          >
+                            <DropdownMenu.Root
+                              open={menuAberto === undefined ? undefined : menuAberto === menuId}
+                              onOpenChange={(aberto) => onMenuAbertoChange?.(aberto ? menuId : null)}
+                            >
+                              <DropdownMenu.Trigger asChild>
+                                <button
+                                  type="button"
+                                  data-grade-cell={menuId}
+                                  disabled={concluido}
+                                  title={duplicada ? "Este item já está sendo usado em outra posição." : undefined}
+                                  aria-label={`${categoria.label}, posição ${posicao}: ${valorAtual ?? "vazia"}`}
+                                  className={`min-h-12 w-full rounded-lg border px-2 py-2 text-sm font-medium transition-colors disabled:cursor-default ${
+                                    duplicada
+                                      ? "border-amber-400 bg-amber-50 text-amber-950"
+                                      : valorAtual !== null
+                                        ? "border-sky-500 bg-sky-50 text-sky-950"
+                                        : pal.celula
+                                  }`}
+                                >
+                                  {valorAtual ?? "Selecionar"}
+                                </button>
+                              </DropdownMenu.Trigger>
+                              <DropdownMenu.Portal container={portalContainer ?? undefined}>
+                                <DropdownMenu.Content
+                                  sideOffset={6}
+                                  collisionPadding={12}
+                                  className={`${ponteiroSobreMenu ? "z-10" : "z-50"} min-w-[210px] max-h-[min(320px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl`}
+                                >
+                                  <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
+                                    {categoria.label}
+                                  </DropdownMenu.Label>
+                                  {categoria.valores.map((valor) => {
+                                    const atual = valorAtual === valor;
+                                    const usadaEmOutraPosicao = grade[categoria.id].some(
+                                      (usado, outroIndice) => usado === valor && outroIndice !== indicePosicao
+                                    );
+                                    return (
+                                      <DropdownMenu.Item
+                                        key={valor}
+                                        data-grade-option={alvoOpcaoGrade(categoria.id, posicao, valor)}
+                                        onSelect={() => onAtribuir(categoria.id, posicao, valor)}
+                                        className={`cursor-pointer select-none rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100 ${
+                                          atual ? "bg-sky-50 font-semibold text-sky-950" : ""
+                                        } ${usadaEmOutraPosicao ? "line-through text-slate-400" : ""}`}
+                                      >
+                                        {valor}
+                                      </DropdownMenu.Item>
+                                    );
+                                  })}
+                                  {valorAtual !== null && (
+                                    <>
+                                      <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
+                                      <DropdownMenu.Item
+                                        onSelect={() => onLimpar(categoria.id, posicao)}
+                                        className="cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none data-[highlighted]:bg-slate-100"
+                                      >
+                                        Limpar
+                                      </DropdownMenu.Item>
+                                    </>
+                                  )}
+                                </DropdownMenu.Content>
+                              </DropdownMenu.Portal>
+                            </DropdownMenu.Root>
+                          </td>
+                        );
+                      })}
+                    </tr>
+                  ))}
+                </tbody>
+              </table>
+            </div>
+          </section>
+
+          {mensagem !== null && (
+            <p role="status" aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${pal.mensagem}`}>
+              {mensagem}
+            </p>
+          )}
+
+          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
+            {verificacaoDisponivel(verificacoesRestantes) && (
+              <button
+                type="button"
+                onClick={onVerificar}
+                disabled={concluido}
+                className={`min-h-11 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${pal.secundaria}`}
+              >
+                Verificar raciocínio
+                {verificacoesRestantes === "livre" ? "" : ` · ${verificacoesRestantes}`}
+              </button>
+            )}
+            <button
+              type="button"
+              data-grade-conclude
+              onClick={onConcluir}
+              disabled={concluido}
+              className={`min-h-11 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${pal.primaria}`}
+            >
+              Concluir
+            </button>
+          </div>
+        </div>
+      </section>
+    </main>
+  );
+}
+
+export function celulaComValor(
   grade: Record<string, ValorCelula[]>,
   categoria: string,
   posicao: number,
@@ -130,29 +386,29 @@ function celulaComValor(
 
 export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridProps) {
   const { begin, isTimeUp, elapsedSec, finish } = useTimedProgress(DURACAO_SESSAO_GRADE_MS);
-  const [tutorial, setTutorial] = useState(true);
-  const [puzzle, setPuzzle] = useState<Puzzle>(PROBLEMA_TUTORIAL);
-  const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(() => criarGradeVazia(PROBLEMA_TUTORIAL));
+  const [puzzle, setPuzzle] = useState<Puzzle>(() => selecionarProblema(difficulty));
+  const [grade, setGrade] = useState<Record<string, ValorCelula[]>>(() => criarGradeVazia(puzzle));
   const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
   const [mensagem, setMensagem] = useState<string | null>(null);
   const [concluido, setConcluido] = useState(false);
   const [verificacoesRestantes, setVerificacoesRestantes] = useState<QuantidadeVerificacoes>(() =>
-    verificacoesPermitidas(PROBLEMA_TUTORIAL.nivel, true)
+    verificacoesPermitidas(puzzle.nivel, false)
   );
   const inicioProblema = useRef(Date.now());
   const registro = useRef<RegistroProblema>(novoRegistroProblema());
   const problemas = useRef<RegistroProblemaGrade[]>([]);
   const usados = useRef<string[]>([]);
   const transicao = useRef<ReturnType<typeof setTimeout> | null>(null);
-  const pal = paleta(theme);
   const rootBg = fundoDoTema(theme);
 
+  useEffect(() => {
+    begin();
+  }, [begin]);
+
   useEffect(() => () => {
     if (transicao.current !== null) clearTimeout(transicao.current);
   }, []);
 
-  const duplicadas = celulasComValorRepetido(grade);
-
   function registrarAcao(): number {
     const momento = Math.max(0, Date.now() - inicioProblema.current);
     registro.current.totalAcoes += 1;
@@ -280,13 +536,6 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     inicioProblema.current = Date.now();
   }
 
-  function iniciarDesafio(): void {
-    const primeiro = selecionarProblema(difficulty, usados.current);
-    setTutorial(false);
-    iniciarProblema(primeiro);
-    begin();
-  }
-
   function finalizarRegistro(
     problemaAtual: Puzzle,
     tempoTotal: number,
@@ -325,14 +574,6 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     setConcluido(true);
     setMensagem("Desafio concluído.");
 
-    if (tutorial) {
-      transicao.current = setTimeout(() => {
-        transicao.current = null;
-        iniciarDesafio();
-      }, 700);
-      return;
-    }
-
     const tempoEsgotado = isTimeUp();
     // Se o limite foi atingido durante este problema, a pessoa pode terminá-lo sem interrupção,
     // mas o registro preserva que ele ainda não estava concluído dentro do tempo da sessão.
@@ -366,191 +607,21 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
 
   return (
     <ExerciseStage width="medio" background={rootBg.background as string}>
-      <main className="mx-auto w-full max-w-full overflow-x-hidden py-1 sm:py-3">
-        <section className={`overflow-hidden rounded-2xl border shadow-sm ${pal.painel}`}>
-          <header className={`border-b px-4 py-4 sm:px-6 ${pal.divisoria}`}>
-            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${pal.textoSuave}`}>
-              {tutorial ? "Tutorial" : "Desafio de lógica"}
-            </p>
-            <h1 className={`mt-1 text-xl font-semibold sm:text-2xl ${pal.titulo}`}>{puzzle.titulo}</h1>
-            <p className={`mt-2 max-w-3xl text-sm leading-6 ${pal.texto}`}>{puzzle.contexto}</p>
-            {tutorial && (
-              <p className={`mt-2 text-sm leading-6 ${pal.texto}`}>
-                Toque em uma célula e escolha um valor. Você pode trocar a escolha a qualquer momento.
-              </p>
-            )}
-          </header>
-
-          <div className="space-y-5 p-4 sm:p-6">
-            <section aria-labelledby="titulo-pistas">
-              <div className="mb-3 flex items-baseline justify-between gap-3">
-                <h2 id="titulo-pistas" className={`text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
-                  Pistas
-                </h2>
-                <span className={`text-xs ${pal.textoSuave}`}>Toque para riscar ou restaurar</span>
-              </div>
-              <ol className="columns-1 gap-x-7 sm:columns-2">
-                {puzzle.pistas.map((pista, indice) => {
-                  const riscada = pistasRiscadas.has(pista.id);
-                  return (
-                    <li key={pista.id} className="mb-2 break-inside-avoid">
-                      <button
-                        type="button"
-                        aria-pressed={riscada}
-                        onClick={() => alternarPista(pista.id)}
-                        className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-black/5 ${pal.texto} ${riscada ? "line-through opacity-50" : ""}`}
-                      >
-                        <span className="mr-2 font-semibold tabular-nums">{indice + 1}.</span>
-                        {pista.texto}
-                      </button>
-                    </li>
-                  );
-                })}
-              </ol>
-            </section>
-
-            <section aria-labelledby="titulo-grade" className="min-w-0">
-              <h2 id="titulo-grade" className={`mb-3 text-sm font-semibold uppercase tracking-[0.12em] ${pal.titulo}`}>
-                Organização
-              </h2>
-              <div
-                className={`max-w-full overflow-x-auto overscroll-x-contain rounded-xl border ${pal.divisoria} ${pal.superficie}`}
-                tabIndex={0}
-                aria-label="Grade com rolagem horizontal quando necessária"
-              >
-                <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0">
-                  <colgroup>
-                    <col className="w-[140px]" />
-                    {Array.from({ length: puzzle.posicoes }, (_, indice) => <col key={indice} className="w-[105px]" />)}
-                  </colgroup>
-                  <thead>
-                    <tr>
-                      <th className={`sticky left-0 z-20 border-b border-r px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.rotulo}`}>
-                        Categoria
-                      </th>
-                      {Array.from({ length: puzzle.posicoes }, (_, indice) => (
-                        <th key={indice} className={`border-b px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide ${pal.divisoria} ${pal.textoSuave}`}>
-                          {puzzle.rotulosPosicao?.[indice] ?? `Posição ${indice + 1}`}
-                        </th>
-                      ))}
-                    </tr>
-                  </thead>
-                  <tbody>
-                    {puzzle.categorias.map((categoria, indiceCategoria) => (
-                      <tr key={categoria.id}>
-                        <th
-                          scope="row"
-                          className={`sticky left-0 z-10 border-r px-3 py-3 text-left text-sm font-semibold ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria} ${pal.rotulo}`}
-                        >
-                          {categoria.label}
-                        </th>
-                        {Array.from({ length: puzzle.posicoes }, (_, indicePosicao) => {
-                          const posicao = indicePosicao + 1;
-                          const valorAtual = grade[categoria.id][indicePosicao];
-                          const duplicada = duplicadas.has(chavePosicaoGrade(categoria.id, posicao));
-                          return (
-                            <td
-                              key={posicao}
-                              className={`px-2 py-2 ${indiceCategoria < puzzle.categorias.length - 1 ? "border-b" : ""} ${pal.divisoria}`}
-                            >
-                              <DropdownMenu.Root>
-                                <DropdownMenu.Trigger asChild>
-                                  <button
-                                    type="button"
-                                    disabled={concluido}
-                                    title={duplicada ? "Este item já está sendo usado em outra posição." : undefined}
-                                    aria-label={`${categoria.label}, posição ${posicao}: ${valorAtual ?? "vazia"}`}
-                                    className={`min-h-12 w-full rounded-lg border px-2 py-2 text-sm font-medium transition-colors disabled:cursor-default ${
-                                      duplicada
-                                        ? "border-amber-400 bg-amber-50 text-amber-950"
-                                        : valorAtual !== null
-                                          ? "border-sky-500 bg-sky-50 text-sky-950"
-                                          : pal.celula
-                                    }`}
-                                  >
-                                    {valorAtual ?? "Selecionar"}
-                                  </button>
-                                </DropdownMenu.Trigger>
-                                <DropdownMenu.Portal>
-                                  <DropdownMenu.Content
-                                    sideOffset={6}
-                                    collisionPadding={12}
-                                    className="z-50 min-w-[210px] max-h-[min(320px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl"
-                                  >
-                                    <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
-                                      {categoria.label}
-                                    </DropdownMenu.Label>
-                                    {categoria.valores.map((valor) => {
-                                      const atual = valorAtual === valor;
-                                      const usadaEmOutraPosicao = grade[categoria.id].some(
-                                        (usado, outroIndice) => usado === valor && outroIndice !== indicePosicao
-                                      );
-                                      return (
-                                        <DropdownMenu.Item
-                                          key={valor}
-                                          onSelect={() => atribuir(categoria.id, posicao, valor)}
-                                          className={`cursor-pointer select-none rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100 ${
-                                            atual ? "bg-sky-50 font-semibold text-sky-950" : ""
-                                          } ${usadaEmOutraPosicao ? "line-through text-slate-400" : ""}`}
-                                        >
-                                          {valor}
-                                        </DropdownMenu.Item>
-                                      );
-                                    })}
-                                    {valorAtual !== null && (
-                                      <>
-                                        <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
-                                        <DropdownMenu.Item
-                                          onSelect={() => limpar(categoria.id, posicao)}
-                                          className="cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none data-[highlighted]:bg-slate-100"
-                                        >
-                                          Limpar
-                                        </DropdownMenu.Item>
-                                      </>
-                                    )}
-                                  </DropdownMenu.Content>
-                                </DropdownMenu.Portal>
-                              </DropdownMenu.Root>
-                            </td>
-                          );
-                        })}
-                      </tr>
-                    ))}
-                  </tbody>
-                </table>
-              </div>
-            </section>
-
-            {mensagem !== null && (
-              <p role="status" aria-live="polite" className={`rounded-lg border px-4 py-3 text-sm ${pal.mensagem}`}>
-                {mensagem}
-              </p>
-            )}
-
-            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
-              {verificacaoDisponivel(verificacoesRestantes) && (
-                <button
-                  type="button"
-                  onClick={verificar}
-                  disabled={concluido}
-                  className={`min-h-11 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${pal.secundaria}`}
-                >
-                  Verificar raciocínio
-                  {verificacoesRestantes === "livre" ? "" : ` · ${verificacoesRestantes}`}
-                </button>
-              )}
-              <button
-                type="button"
-                onClick={concluir}
-                disabled={concluido}
-                className={`min-h-11 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${pal.primaria}`}
-              >
-                Concluir
-              </button>
-            </div>
-          </div>
-        </section>
-      </main>
+      <GradeDedutivaBoard
+        puzzle={puzzle}
+        grade={grade}
+        pistasRiscadas={pistasRiscadas}
+        mensagem={mensagem}
+        concluido={concluido}
+        verificacoesRestantes={verificacoesRestantes}
+        theme={theme}
+        rotuloCabecalho="Desafio de lógica"
+        onAtribuir={atribuir}
+        onLimpar={limpar}
+        alternarPista={alternarPista}
+        onVerificar={verificar}
+        onConcluir={concluir}
+      />
     </ExerciseStage>
   );
 }
diff --git a/lib/tutorial/estimulo-continuo.test.ts b/lib/tutorial/estimulo-continuo.test.ts
index 65e5ad02..dd25e782 100644
--- a/lib/tutorial/estimulo-continuo.test.ts
+++ b/lib/tutorial/estimulo-continuo.test.ts
@@ -165,14 +165,14 @@ describe("Família 4 — estímulo contínuo", () => {
     expect(modoDe("dual-task")).toBe("continua");
   });
 
-  it("registra os seis e preserva os 19 convertidos", () => {
+  it("registra os seis e preserva os 20 convertidos", () => {
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
@@ -224,6 +224,7 @@ describe("regra 11 consolidada — na dúvida, Fluxo 1", () => {
       "lib/tutorial/definitions/conjunto-selecao.tsx",
       "lib/tutorial/definitions/estimulo-continuo.tsx",
       "lib/tutorial/definitions/focus-agents.tsx",
+      "lib/tutorial/definitions/grade-dedutiva.tsx",
       "lib/tutorial/definitions/mot.tsx",
       "lib/tutorial/definitions/vigilancia.tsx",
     ];
diff --git a/lib/tutorial/span-reference.test.ts b/lib/tutorial/span-reference.test.ts
index a0c17eef..8ea71b0e 100644
--- a/lib/tutorial/span-reference.test.ts
+++ b/lib/tutorial/span-reference.test.ts
@@ -362,6 +362,7 @@ describe("o Span Inverso continua na fábrica compartilhada", () => {
     expect(convertidos.sort()).toEqual([
       "certo-ou-errado",
       "cubo-corsi",
+      "deductive-grid",
       "desafio-supermercado",
       "dual-task",
       "focus-agents",
@@ -604,6 +605,7 @@ describe("T1 congelada — 2. sem emoji no framework do tutorial", () => {
     "lib/tutorial/definitions/conjunto-selecao.tsx",
     "lib/tutorial/definitions/estimulo-continuo.tsx",
     "lib/tutorial/definitions/focus-agents.tsx",
+    "lib/tutorial/definitions/grade-dedutiva.tsx",
     "lib/tutorial/definitions/mot.tsx",
     "lib/tutorial/definitions/sequencia-ordenada.tsx",
     "lib/tutorial/definitions/span-numerico.tsx",
diff --git a/lib/tutorial/state.test.ts b/lib/tutorial/state.test.ts
index b322156b..f2ea88f0 100644
--- a/lib/tutorial/state.test.ts
+++ b/lib/tutorial/state.test.ts
@@ -120,7 +120,7 @@ describe("regra 8 — conclusão grava, revisão não", () => {
 
   it("revisão não produz tutorialCompletedAt", () => {
     // Sem registro não há requisição, e sem requisição a coluna não é tocada.
-    expect(completionRecordFor(true, 1)).toBeNull();
+    expect(completionRecordFor(true, 2)).toBeNull();
   });
 
   it("revisão não produz tutorialVersion", () => {
diff --git a/lib/tutorial/versions.test.ts b/lib/tutorial/versions.test.ts
index faf06fa7..5451fdcf 100644
--- a/lib/tutorial/versions.test.ts
+++ b/lib/tutorial/versions.test.ts
@@ -12,8 +12,13 @@ describe("catálogo de versões de tutorial", () => {
     expect(versionedIds).toEqual(canonicalIds);
   });
 
-  it("mantém os três reformulados em 2 e todos os demais em 1", () => {
-    const reformulated = new Set(["vigilancia", "focus-agents", "informacao-em-foco"]);
+  it("mantém os quatro reformulados em 2 e todos os demais em 1", () => {
+    const reformulated = new Set([
+      "vigilancia",
+      "focus-agents",
+      "informacao-em-foco",
+      "deductive-grid",
+    ]);
 
     for (const [exerciseId, version] of Object.entries(TUTORIAL_VERSIONS)) {
       expect(version, exerciseId).toBe(reformulated.has(exerciseId) ? 2 : 1);
diff --git a/lib/tutorial/versions.ts b/lib/tutorial/versions.ts
index 88943833..c7cb11c9 100644
--- a/lib/tutorial/versions.ts
+++ b/lib/tutorial/versions.ts
@@ -20,7 +20,7 @@ export const TUTORIAL_VERSIONS: Readonly<Record<string, number>> = Object.freeze
   "ordem-historia": 1,
   "compra-multifuncional": 1,
   "task-switching": 1,
-  "deductive-grid": 1,
+  "deductive-grid": 2,
   "letras-sequencia": 1,
   "sequencia-itens": 1,
   "padroes-rotacao": 1,
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? SPEC-DA-TAREFA.md
?? lib/tutorial/definitions/grade-dedutiva.tsx
?? lib/tutorial/grade-dedutiva.test.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-tutorial ==
