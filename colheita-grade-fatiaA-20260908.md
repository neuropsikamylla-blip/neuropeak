== DIFF do lab grade-fatiaA (contra a base do bundle) ==
diff --git a/lib/grade/banco.ts b/lib/grade/banco.ts
index 6280f066..79ddc6e9 100644
--- a/lib/grade/banco.ts
+++ b/lib/grade/banco.ts
@@ -1,4 +1,4 @@
-import type { Puzzle, PuzzleMetadata } from "./tipos";
+import { pistaSimples, type Puzzle, type PuzzleMetadata } from "./tipos";
 
 function metadata(
   complexity: number,
@@ -32,36 +32,28 @@ export const PROBLEMA_TUTORIAL: Puzzle = {
     { id: "horario", label: "Horário", valores: ["9h", "10h", "11h"] },
   ],
   pistas: [
-    {
-      id: "tutorial-1",
+    pistaSimples("tutorial-1", "Ana ocupa a posição central.", {
       tipo: "T3",
-      texto: "Ana ocupa a posição central.",
       item: { categoria: "apresentador", valor: "Ana" },
       posicao: 2,
-    },
-    {
-      id: "tutorial-2",
+    }),
+    pistaSimples("tutorial-2", "Bruno aparece antes de Carla.", {
       tipo: "T4",
-      texto: "Bruno aparece antes de Carla.",
       itemA: { categoria: "apresentador", valor: "Bruno" },
       itemB: { categoria: "apresentador", valor: "Carla" },
-    },
-    {
-      id: "tutorial-3",
+    }),
+    pistaSimples("tutorial-3", "Brisa fica entre Atlas e Cosmos, nessa ordem.", {
       tipo: "T7",
-      texto: "Brisa fica entre Atlas e Cosmos, nessa ordem.",
       itemA: { categoria: "projeto", valor: "Atlas" },
       itemC: { categoria: "projeto", valor: "Brisa" },
       itemB: { categoria: "projeto", valor: "Cosmos" },
-    },
-    {
-      id: "tutorial-4",
+    }),
+    pistaSimples("tutorial-4", "A apresentação das 10h fica entre as de 9h e 11h, nessa ordem.", {
       tipo: "T7",
-      texto: "A apresentação das 10h fica entre as de 9h e 11h, nessa ordem.",
       itemA: { categoria: "horario", valor: "9h" },
       itemC: { categoria: "horario", valor: "10h" },
       itemB: { categoria: "horario", valor: "11h" },
-    },
+    }),
   ],
   solucao: {
     apresentador: ["Bruno", "Ana", "Carla"],
@@ -91,38 +83,30 @@ const PROBLEMA_BIBLIOTECA: Puzzle = {
     { id: "horario", label: "Horário", valores: ["14h", "15h", "16h", "17h"] },
   ],
   pistas: [
-    {
-      id: "biblioteca-1", tipo: "T7", texto: "Lia chegou entre Caio e Mauro, nessa ordem.",
+    pistaSimples("biblioteca-1", "Lia chegou entre Caio e Mauro, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "visitante", valor: "Caio" }, itemC: { categoria: "visitante", valor: "Lia" }, itemB: { categoria: "visitante", valor: "Mauro" },
-    },
-    {
-      id: "biblioteca-2", tipo: "T7", texto: "Mauro chegou entre Lia e Nina, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-2", "Mauro chegou entre Lia e Nina, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "visitante", valor: "Lia" }, itemC: { categoria: "visitante", valor: "Mauro" }, itemB: { categoria: "visitante", valor: "Nina" },
-    },
-    {
-      id: "biblioteca-3", tipo: "T7", texto: "Leitura fica entre Acervo e Mídia, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-3", "Leitura fica entre Acervo e Mídia, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "sala", valor: "Acervo" }, itemC: { categoria: "sala", valor: "Leitura" }, itemB: { categoria: "sala", valor: "Mídia" },
-    },
-    {
-      id: "biblioteca-4", tipo: "T7", texto: "Mídia fica entre Leitura e Pesquisa, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-4", "Mídia fica entre Leitura e Pesquisa, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "sala", valor: "Leitura" }, itemC: { categoria: "sala", valor: "Mídia" }, itemB: { categoria: "sala", valor: "Pesquisa" },
-    },
-    {
-      id: "biblioteca-5", tipo: "T7", texto: "Arte aparece entre História e Ciência, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-5", "Arte aparece entre História e Ciência, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "tema", valor: "História" }, itemC: { categoria: "tema", valor: "Arte" }, itemB: { categoria: "tema", valor: "Ciência" },
-    },
-    {
-      id: "biblioteca-6", tipo: "T7", texto: "Ciência aparece entre Arte e Viagem, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-6", "Ciência aparece entre Arte e Viagem, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "tema", valor: "Arte" }, itemC: { categoria: "tema", valor: "Ciência" }, itemB: { categoria: "tema", valor: "Viagem" },
-    },
-    {
-      id: "biblioteca-7", tipo: "T7", texto: "15h fica entre 14h e 16h, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-7", "15h fica entre 14h e 16h, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "horario", valor: "14h" }, itemC: { categoria: "horario", valor: "15h" }, itemB: { categoria: "horario", valor: "16h" },
-    },
-    {
-      id: "biblioteca-8", tipo: "T7", texto: "16h fica entre 15h e 17h, nessa ordem.",
+    }),
+    pistaSimples("biblioteca-8", "16h fica entre 15h e 17h, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "horario", valor: "15h" }, itemC: { categoria: "horario", valor: "16h" }, itemB: { categoria: "horario", valor: "17h" },
-    },
+    }),
   ],
   solucao: {
     visitante: ["Caio", "Lia", "Mauro", "Nina"],
@@ -153,49 +137,46 @@ const PROBLEMA_MUSEU: Puzzle = {
     { id: "horario", label: "Horário", valores: ["18h", "19h", "20h", "21h"] },
   ],
   pistas: [
-    {
-      id: "museu-1", tipo: "T8", texto: "A obra Bruma foi conduzida por Hugo.",
+    pistaSimples("museu-1", "A obra Bruma foi conduzida por Hugo.", { tipo: "T8",
       itemA: { categoria: "obra", valor: "Bruma" }, itemB: { categoria: "responsavel", valor: "Hugo" },
-    },
-    {
-      id: "museu-2", tipo: "T8", texto: "A sala Leste recebeu a obra Cais.",
+    }),
+    pistaSimples("museu-2", "A sala Leste recebeu a obra Cais.", { tipo: "T8",
       itemA: { categoria: "sala", valor: "Leste" }, itemB: { categoria: "obra", valor: "Cais" },
-    },
-    {
-      id: "museu-3", tipo: "T3", texto: "Hugo participou da segunda visita.",
+    }),
+    pistaSimples("museu-3", "Hugo participou da segunda visita.", { tipo: "T3",
       item: { categoria: "responsavel", valor: "Hugo" }, posicao: 2,
-    },
-    {
-      id: "museu-4", tipo: "T8", texto: "A obra Aurora ficou na sala Norte.",
+    }),
+    pistaSimples("museu-4", "A obra Aurora ficou na sala Norte.", { tipo: "T8",
       itemA: { categoria: "obra", valor: "Aurora" }, itemB: { categoria: "sala", valor: "Norte" },
-    },
-    {
-      id: "museu-5", tipo: "T8", texto: "A visita das 19h ocorreu na sala Sul.",
+    }),
+    pistaSimples("museu-5", "A visita das 19h ocorreu na sala Sul.", { tipo: "T8",
       itemA: { categoria: "horario", valor: "19h" }, itemB: { categoria: "sala", valor: "Sul" },
-    },
-    {
-      id: "museu-6", tipo: "T7", texto: "Iara participou entre Gabi e João, nessa ordem.",
+    }),
+    pistaSimples("museu-6", "Iara participou entre Gabi e João, nessa ordem.", { tipo: "T7",
       itemA: { categoria: "responsavel", valor: "Gabi" }, itemC: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "responsavel", valor: "João" },
-    },
-    {
-      id: "museu-7", tipo: "T8", texto: "Gabi conduziu a obra Aurora.",
+    }),
+    pistaSimples("museu-7", "Gabi conduziu a obra Aurora.", { tipo: "T8",
       itemA: { categoria: "responsavel", valor: "Gabi" }, itemB: { categoria: "obra", valor: "Aurora" },
-    },
-    {
-      id: "museu-8", tipo: "T8", texto: "A sala Norte recebeu a visita das 18h.",
+    }),
+    pistaSimples("museu-8", "A sala Norte recebeu a visita das 18h.", { tipo: "T8",
       itemA: { categoria: "sala", valor: "Norte" }, itemB: { categoria: "horario", valor: "18h" },
-    },
-    {
-      id: "museu-9", tipo: "T8", texto: "Iara conduziu a obra Cais.",
+    }),
+    pistaSimples("museu-9", "Iara conduziu a obra Cais.", { tipo: "T8",
       itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "obra", valor: "Cais" },
-    },
-    {
-      id: "museu-10", tipo: "T8", texto: "A obra Bruma ficou na sala Sul.",
+    }),
+    pistaSimples("museu-10", "A obra Bruma ficou na sala Sul.", { tipo: "T8",
       itemA: { categoria: "obra", valor: "Bruma" }, itemB: { categoria: "sala", valor: "Sul" },
-    },
-    {
-      id: "museu-11", tipo: "T8", texto: "A visita das 20h ocorreu na sala Leste.",
+    }),
+    pistaSimples("museu-11", "A visita das 20h ocorreu na sala Leste.", { tipo: "T8",
       itemA: { categoria: "horario", valor: "20h" }, itemB: { categoria: "sala", valor: "Leste" },
+    }),
+    {
+      id: "museu-12",
+      texto: "Iara não conduziu a obra Duna nem esteve na sala Oeste.",
+      restricoes: [
+        { id: "museu-12#1", tipo: "T2", itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "obra", valor: "Duna" } },
+        { id: "museu-12#2", tipo: "T2", itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "sala", valor: "Oeste" } },
+      ],
     },
   ],
   solucao: {
diff --git a/lib/grade/bench-5x6.test.ts b/lib/grade/bench-5x6.test.ts
index d140a91f..b939f83f 100644
--- a/lib/grade/bench-5x6.test.ts
+++ b/lib/grade/bench-5x6.test.ts
@@ -1,7 +1,7 @@
 import { describe, it } from "vitest";
 import { temSolucaoUnica, validarPuzzle } from "./solver";
 import { estadoDaAtribuicao, paraMarcacaoParcial } from "./interacao";
-import type { Pista, Puzzle } from "./tipos";
+import { pistaSimples, type Pista, type Puzzle } from "./tipos";
 
 const POSICOES = 5;
 const CATS = ["pessoa", "cor", "fruta", "cidade", "animal", "esporte"];
@@ -35,16 +35,14 @@ function montar5x6(): Puzzle {
   const candidatas: Pista[] = [];
   for (let p = 0; p < POSICOES; p += 1) {
     for (let c = 1; c < CATS.length; c += 1) {
-      candidatas.push({
-        id: `t1-${p}-${c}`, tipo: "T1", texto: "assoc",
+      candidatas.push(pistaSimples(`t1-${p}-${c}`, "assoc", { tipo: "T1",
         itemA: { categoria: CATS[0], valor: solucao[CATS[0]][p] },
         itemB: { categoria: CATS[c], valor: solucao[CATS[c]][p] },
-      } as Pista);
+      }));
     }
-    candidatas.push({
-      id: `t3-${p}`, tipo: "T3", texto: "pos",
+    candidatas.push(pistaSimples(`t3-${p}`, "pos", { tipo: "T3",
       item: { categoria: CATS[0], valor: solucao[CATS[0]][p] }, posicao: p + 1,
-    } as Pista);
+    }));
   }
 
   const base = (pistas: Pista[]): Puzzle => ({
diff --git a/lib/grade/derivacao.ts b/lib/grade/derivacao.ts
index 2114d64f..885a9a84 100644
--- a/lib/grade/derivacao.ts
+++ b/lib/grade/derivacao.ts
@@ -78,6 +78,8 @@ export function derivar(puzzle: Puzzle): TracoDerivacao {
   const contextoCompleto = criarContexto(puzzle);
   const porVariavel = new Map<number, { profundidade: number; pistas: string[] }>();
 
+  // A pessoa lê e risca pistas, não restrições: profundidade e classificação
+  // descrevem o que ela manipula, mesmo quando uma pista agrupa restrições.
   for (let profundidade = 1; profundidade <= Math.min(3, puzzle.pistas.length); profundidade += 1) {
     for (const grupo of combinacoes(puzzle.pistas, profundidade)) {
       const dominios = dominiosPropagados(puzzle, grupo);
diff --git a/lib/grade/estrutura.test.ts b/lib/grade/estrutura.test.ts
index 9088ba25..b9690866 100644
--- a/lib/grade/estrutura.test.ts
+++ b/lib/grade/estrutura.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from "vitest";
-import type { Pista, Puzzle } from "./tipos";
+import { pistaSimples, type Pista, type Puzzle } from "./tipos";
 import { avaliarEstrutura } from "./estrutura";
 
 function criarPuzzle(
@@ -13,20 +13,14 @@ function criarPuzzle(
     valores: naOrdemDeclarada ? [`${id}1`, `${id}2`, `${id}3`] : [`${id}2`, `${id}1`, `${id}3`],
   }));
   const ancoras: Pista[] = categoriasIds.flatMap((categoria) => [
-    {
-      id: `${categoria}-1`,
-      tipo: "T3",
-      texto: `${categoria}1 está na primeira posição.`,
+    pistaSimples(`${categoria}-1`, `${categoria}1 está na primeira posição.`, { tipo: "T3",
       item: { categoria, valor: `${categoria}1` },
       posicao: 1,
-    },
-    {
-      id: `${categoria}-2`,
-      tipo: "T3",
-      texto: `${categoria}2 está na segunda posição.`,
+    }),
+    pistaSimples(`${categoria}-2`, `${categoria}2 está na segunda posição.`, { tipo: "T3",
       item: { categoria, valor: `${categoria}2` },
       posicao: 2,
-    },
+    }),
   ]);
   return {
     id: `sintetico-${categoriasIds.join("-")}`,
@@ -52,13 +46,10 @@ function criarPuzzle(
 }
 
 function associacao(id: string, categoriaA: string, categoriaB: string): Pista {
-  return {
-    id,
-    tipo: "T1",
-    texto: `${categoriaA}1 está com ${categoriaB}1.`,
+  return pistaSimples(id, `${categoriaA}1 está com ${categoriaB}1.`, { tipo: "T1",
     itemA: { categoria: categoriaA, valor: `${categoriaA}1` },
     itemB: { categoria: categoriaB, valor: `${categoriaB}1` },
-  };
+  });
 }
 
 describe("validação estrutural da Grade Dedutiva", () => {
@@ -79,21 +70,15 @@ describe("validação estrutural da Grade Dedutiva", () => {
   });
 
   it("não cria aresta para pista intracategoria e cria três para pista de três categorias", () => {
-    const pistaInterna: Pista = {
-      id: "interna",
-      tipo: "T4",
-      texto: "a1 vem antes de a2.",
+    const pistaInterna = pistaSimples("interna", "a1 vem antes de a2.", { tipo: "T4",
       itemA: { categoria: "a", valor: "a1" },
       itemB: { categoria: "a", valor: "a2" },
-    };
-    const pistaTripla: Pista = {
-      id: "tripla",
-      tipo: "T7",
-      texto: "b2 fica entre a1 e c3.",
+    });
+    const pistaTripla = pistaSimples("tripla", "b2 fica entre a1 e c3.", { tipo: "T7",
       itemA: { categoria: "a", valor: "a1" },
       itemC: { categoria: "b", valor: "b2" },
       itemB: { categoria: "c", valor: "c3" },
-    };
+    });
     const relatorio = avaliarEstrutura(criarPuzzle(["a", "b", "c"], [pistaInterna, pistaTripla]));
 
     expect(relatorio.pistasIntracategoria).toBe(7);
diff --git a/lib/grade/estrutura.ts b/lib/grade/estrutura.ts
index 3a79fd9d..aabfd593 100644
--- a/lib/grade/estrutura.ts
+++ b/lib/grade/estrutura.ts
@@ -87,7 +87,7 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
       .sort((a, b) => (ordemCategorias.get(a) ?? 0) - (ordemCategorias.get(b) ?? 0));
     if (categorias.length <= 1) {
       pistasIntracategoria += 1;
-      if (pista.tipo === "T3") pistasAncora += 1;
+      if (pista.restricoes.some((restricao) => restricao.tipo === "T3")) pistasAncora += 1;
       continue;
     }
 
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index efa40780..2068dcec 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -4,6 +4,7 @@ export {
   contarSolucoes,
   encontrarSolucoes,
   pistasEmConflito,
+  restricoesViolando,
   temSolucaoUnica,
   validarPuzzle,
 } from "./solver";
diff --git a/lib/grade/motor.ts b/lib/grade/motor.ts
index 9e4ffca7..c0a27097 100644
--- a/lib/grade/motor.ts
+++ b/lib/grade/motor.ts
@@ -4,23 +4,24 @@ import {
   type MarcacaoParcial,
   type Pista,
   type Puzzle,
+  type Restricao,
   type Solucao,
   type TipoPista,
 } from "./tipos";
 
-interface OperadorPista {
+interface OperadorRestricao {
   quantidadeOperandos: number;
-  itens: (pista: Pista) => readonly Item[];
-  satisfaz: (posicoes: readonly number[], pista: Pista) => boolean;
+  itens: (restricao: Restricao) => readonly Item[];
+  satisfaz: (posicoes: readonly number[], restricao: Restricao) => boolean;
 }
 
-function itensAB(pista: Pista): readonly Item[] {
-  return "itemA" in pista && "itemB" in pista ? [pista.itemA, pista.itemB] : [];
+function itensAB(restricao: Restricao): readonly Item[] {
+  return "itemA" in restricao && "itemB" in restricao ? [restricao.itemA, restricao.itemB] : [];
 }
 
-function itensABCD(pista: Pista): readonly Item[] {
-  return "itemA" in pista && "itemB" in pista && "itemC" in pista && "itemD" in pista
-    ? [pista.itemA, pista.itemB, pista.itemC, pista.itemD]
+function itensABCD(restricao: Restricao): readonly Item[] {
+  return "itemA" in restricao && "itemB" in restricao && "itemC" in restricao && "itemD" in restricao
+    ? [restricao.itemA, restricao.itemB, restricao.itemC, restricao.itemD]
     : [];
 }
 
@@ -29,21 +30,21 @@ function itensABCD(pista: Pista): readonly Item[] {
  * domínios e predicados; um operador futuro entra neste registro sem alterar
  * a busca, a exclusividade ou o MRV.
  */
-const OPERADORES: Record<TipoPista, OperadorPista> = {
+export const OPERADORES: Record<TipoPista, OperadorRestricao> = {
   T1: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a === b },
   T2: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a !== b },
   T3: {
     quantidadeOperandos: 1,
-    itens: (pista) => (pista.tipo === "T3" ? [pista.item] : []),
-    satisfaz: ([posicao], pista) => pista.tipo === "T3" && posicao === pista.posicao - 1,
+    itens: (restricao) => (restricao.tipo === "T3" ? [restricao.item] : []),
+    satisfaz: ([posicao], restricao) => restricao.tipo === "T3" && posicao === restricao.posicao - 1,
   },
   T4: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a < b },
   T5: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => Math.abs(a - b) === 1 },
   T6: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => b - a === 1 },
   T7: {
     quantidadeOperandos: 3,
-    itens: (pista) =>
-      pista.tipo === "T7" ? [pista.itemA, pista.itemC, pista.itemB] : [],
+    itens: (restricao) =>
+      restricao.tipo === "T7" ? [restricao.itemA, restricao.itemC, restricao.itemB] : [],
     satisfaz: ([a, c, b]) => a < c && c < b,
   },
   T8: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a === b },
@@ -66,10 +67,12 @@ export interface VariavelCompilada {
   valor: string;
 }
 
-export interface PistaCompilada {
-  pista: Pista;
+export interface RestricaoCompilada {
+  /** A pessoa manipula a pista; o solver avalia a restrição dela. */
+  pistaId: string;
+  restricao: Restricao;
   variaveis: readonly number[];
-  operador: OperadorPista;
+  operador: OperadorRestricao;
 }
 
 export interface ContextoSolver {
@@ -79,7 +82,7 @@ export interface ContextoSolver {
   variaveis: readonly VariavelCompilada[];
   variaveisPorCategoria: readonly (readonly number[])[];
   indiceItens: ReadonlyMap<string, ReadonlyMap<string, number>>;
-  pistas: readonly PistaCompilada[];
+  restricoes: readonly RestricaoCompilada[];
 }
 
 export interface ResultadoPropagacao {
@@ -109,16 +112,16 @@ function textoNaoVazio(valor: unknown): valor is string {
   return typeof valor === "string" && valor.trim().length > 0;
 }
 
-function erroItem(puzzle: Puzzle, item: Item, pistaId: string): string | null {
+function erroItem(puzzle: Puzzle, item: Item, restricaoId: string): string | null {
   if (item === null || typeof item !== "object") {
-    return `A pista ${pistaId} contém um item inválido.`;
+    return `A restrição ${restricaoId} contém um item inválido.`;
   }
   const categoria = puzzle.categorias.find((c) => c.id === item.categoria);
   if (categoria === undefined) {
-    return `A pista ${pistaId} referencia a categoria inexistente "${item.categoria}".`;
+    return `A restrição ${restricaoId} referencia a categoria inexistente "${item.categoria}".`;
   }
   if (!categoria.valores.includes(item.valor)) {
-    return `A pista ${pistaId} referencia o valor inexistente "${item.valor}" na categoria "${item.categoria}".`;
+    return `A restrição ${restricaoId} referencia o valor inexistente "${item.valor}" na categoria "${item.categoria}".`;
   }
   return null;
 }
@@ -138,6 +141,17 @@ export function validarEstruturaPuzzle(puzzle: Puzzle): string | null {
   if (!Number.isInteger(puzzle.posicoes) || puzzle.posicoes < 3 || puzzle.posicoes > 5) {
     return `O puzzle ${puzzle.id} deve ter de 3 a 5 posições; recebido: ${puzzle.posicoes}.`;
   }
+  if (puzzle.rotulosPosicao !== undefined) {
+    if (!Array.isArray(puzzle.rotulosPosicao) || puzzle.rotulosPosicao.length !== puzzle.posicoes) {
+      return `Os rótulos de posição do puzzle ${puzzle.id} devem ter exatamente ${puzzle.posicoes} valores.`;
+    }
+    if (puzzle.rotulosPosicao.some((rotulo) => !textoNaoVazio(rotulo))) {
+      return `Os rótulos de posição do puzzle ${puzzle.id} contêm rótulo vazio ou inválido.`;
+    }
+    if (new Set(puzzle.rotulosPosicao).size !== puzzle.rotulosPosicao.length) {
+      return `Os rótulos de posição do puzzle ${puzzle.id} contêm rótulos repetidos.`;
+    }
+  }
   if (!Array.isArray(puzzle.categorias) || puzzle.categorias.length < 3 || puzzle.categorias.length > 6) {
     return `O puzzle ${puzzle.id} deve ter entre 3 e 6 categorias.`;
   }
@@ -161,25 +175,34 @@ export function validarEstruturaPuzzle(puzzle: Puzzle): string | null {
 
   if (!Array.isArray(puzzle.pistas)) return `As pistas do puzzle ${puzzle.id} devem ser uma lista.`;
   const idsPistas = new Set<string>();
+  const idsRestricoes = new Set<string>();
   for (const pista of puzzle.pistas) {
     if (!textoNaoVazio(pista?.id)) return `O puzzle ${puzzle.id} contém pista sem id válido.`;
     if (idsPistas.has(pista.id)) return `A pista "${pista.id}" aparece mais de uma vez.`;
     idsPistas.add(pista.id);
     if (!textoNaoVazio(pista.texto)) return `A pista ${pista.id} deve ter texto não vazio.`;
-    if (!TIPOS_PISTA.includes(pista.tipo)) return `A pista ${pista.id} tem tipo desconhecido: ${pista.tipo}.`;
-
-    const operador = OPERADORES[pista.tipo];
-    const itens = operador.itens(pista);
-    if (itens.length !== operador.quantidadeOperandos) return `A pista ${pista.id} não contém todos os operandos de ${pista.tipo}.`;
-    for (const item of itens) {
-      const erro = erroItem(puzzle, item, pista.id);
-      if (erro !== null) return erro;
+    if (!Array.isArray(pista.restricoes) || pista.restricoes.length === 0) {
+      return `A pista ${pista.id} deve conter ao menos uma restrição.`;
     }
-    if (pista.tipo === "T3" && (!Number.isInteger(pista.posicao) || pista.posicao < 1 || pista.posicao > puzzle.posicoes)) {
-      return `A pista ${pista.id} usa posição inválida: ${pista.posicao}.`;
-    }
-    if (pista.tipo === "T8" && pista.itemA.categoria === pista.itemB.categoria) {
-      return `A pista ${pista.id} do tipo T8 deve cruzar categorias diferentes.`;
+    for (const restricao of pista.restricoes) {
+      if (!textoNaoVazio(restricao?.id)) return `A pista ${pista.id} contém restrição sem id válido.`;
+      if (idsRestricoes.has(restricao.id)) return `A restrição "${restricao.id}" aparece mais de uma vez.`;
+      idsRestricoes.add(restricao.id);
+      if (!TIPOS_PISTA.includes(restricao.tipo)) return `A restrição ${restricao.id} tem tipo desconhecido: ${restricao.tipo}.`;
+
+      const operador = OPERADORES[restricao.tipo];
+      const itens = operador.itens(restricao);
+      if (itens.length !== operador.quantidadeOperandos) return `A restrição ${restricao.id} não contém todos os operandos de ${restricao.tipo}.`;
+      for (const item of itens) {
+        const erro = erroItem(puzzle, item, restricao.id);
+        if (erro !== null) return erro;
+      }
+      if (restricao.tipo === "T3" && (!Number.isInteger(restricao.posicao) || restricao.posicao < 1 || restricao.posicao > puzzle.posicoes)) {
+        return `A restrição ${restricao.id} usa posição inválida: ${restricao.posicao}.`;
+      }
+      if (restricao.tipo === "T8" && restricao.itemA.categoria === restricao.itemB.categoria) {
+        return `A restrição ${restricao.id} do tipo T8 deve cruzar categorias diferentes.`;
+      }
     }
   }
 
@@ -223,15 +246,15 @@ export function criarContexto(puzzle: Puzzle, pistas: readonly Pista[] = puzzle.
     indiceItens.set(categoria.id, porValor);
   });
 
-  const compiladas = pistas.map((pista): PistaCompilada => {
-    const operador = OPERADORES[pista.tipo];
-    const indices = operador.itens(pista).map((item) => {
+  const compiladas = pistas.flatMap((pista) => pista.restricoes.map((restricao): RestricaoCompilada => {
+    const operador = OPERADORES[restricao.tipo];
+    const indices = operador.itens(restricao).map((item) => {
       const indice = indiceItens.get(item.categoria)?.get(item.valor);
-      if (indice === undefined) throw new Error(`Item inválido ao compilar a pista ${pista.id}.`);
+      if (indice === undefined) throw new Error(`Item inválido ao compilar a restrição ${restricao.id}.`);
       return indice;
     });
-    return { pista, variaveis: indices, operador };
-  });
+    return { pistaId: pista.id, restricao, variaveis: indices, operador };
+  }));
 
   return {
     puzzle,
@@ -240,7 +263,7 @@ export function criarContexto(puzzle: Puzzle, pistas: readonly Pista[] = puzzle.
     variaveis,
     variaveisPorCategoria,
     indiceItens,
-    pistas: compiladas,
+    restricoes: compiladas,
   };
 }
 
@@ -278,10 +301,10 @@ function propagarExclusividade(dominios: number[], contexto: ContextoSolver): Re
   return { consistente: true, alterou };
 }
 
-function propagarPista(
+function propagarRestricao(
   dominios: number[],
   contexto: ContextoSolver,
-  compilada: PistaCompilada
+  compilada: RestricaoCompilada
 ): ResultadoPropagacao {
   const unicas: number[] = [];
   const paraUnica: number[] = [];
@@ -300,7 +323,7 @@ function propagarPista(
   const visitar = (profundidade: number): void => {
     if (profundidade === unicas.length) {
       const posicoesOperandos = paraUnica.map((indice) => atribuicao[indice]);
-      if (!compilada.operador.satisfaz(posicoesOperandos, compilada.pista)) return;
+      if (!compilada.operador.satisfaz(posicoesOperandos, compilada.restricao)) return;
       atribuicao.forEach((posicao, indice) => {
         suportes[indice] |= 1 << posicao;
       });
@@ -343,7 +366,7 @@ function propagarPista(
   return { consistente: true, alterou };
 }
 
-/** Propaga exclusividade e todas as pistas até o ponto fixo. */
+/** Propaga exclusividade e todas as restrições até o ponto fixo. */
 export function propagarDominios(dominios: number[], contexto: ContextoSolver): ResultadoPropagacao {
   let alterouAlguma = false;
 
@@ -353,8 +376,8 @@ export function propagarDominios(dominios: number[], contexto: ContextoSolver):
     if (!exclusividade.consistente) return { consistente: false, alterou: alterouAlguma || exclusividade.alterou };
     alterouRodada ||= exclusividade.alterou;
 
-    for (const pista of contexto.pistas) {
-      const resultado = propagarPista(dominios, contexto, pista);
+    for (const restricao of contexto.restricoes) {
+      const resultado = propagarRestricao(dominios, contexto, restricao);
       if (!resultado.consistente) return { consistente: false, alterou: true };
       alterouRodada ||= resultado.alterou;
     }
@@ -459,10 +482,14 @@ export function posicaoDoItem(solucao: Solucao, item: Item): number {
   return solucao[item.categoria]?.indexOf(item.valor) ?? -1;
 }
 
+export function restricaoSatisfeita(restricao: Restricao, solucao: Solucao): boolean {
+  const operador = OPERADORES[restricao.tipo];
+  const posicoes = operador.itens(restricao).map((item) => posicaoDoItem(solucao, item));
+  return posicoes.every((posicao) => posicao >= 0) && operador.satisfaz(posicoes, restricao);
+}
+
 export function pistaSatisfeita(pista: Pista, solucao: Solucao): boolean {
-  const operador = OPERADORES[pista.tipo];
-  const posicoes = operador.itens(pista).map((item) => posicaoDoItem(solucao, item));
-  return posicoes.every((posicao) => posicao >= 0) && operador.satisfaz(posicoes, pista);
+  return pista.restricoes.every((restricao) => restricaoSatisfeita(restricao, solucao));
 }
 
 export function solucoesIguais(a: Solucao, b: Solucao, puzzle: Puzzle): boolean {
@@ -472,5 +499,9 @@ export function solucoesIguais(a: Solucao, b: Solucao, puzzle: Puzzle): boolean
 }
 
 export function itensDaPista(pista: Pista): readonly Item[] {
-  return OPERADORES[pista.tipo].itens(pista);
+  return pista.restricoes.flatMap((restricao) => itensDaRestricao(restricao));
+}
+
+export function itensDaRestricao(restricao: Restricao): readonly Item[] {
+  return OPERADORES[restricao.tipo].itens(restricao);
 }
diff --git a/lib/grade/solver.test.ts b/lib/grade/solver.test.ts
index 8763ecbe..939db5c7 100644
--- a/lib/grade/solver.test.ts
+++ b/lib/grade/solver.test.ts
@@ -7,16 +7,30 @@ import {
   derivar,
   encontrarSolucoes,
   pistasEmConflito,
+  pistaSimples,
+  PROBLEMAS_GRADE,
+  restricoesViolando,
   temSolucaoUnica,
+  validarEstruturaPuzzle,
   validarPuzzle,
   type Categoria,
   type MarcacaoParcial,
   type Pista,
   type Puzzle,
   type PuzzleMetadata,
+  type Restricao,
   type Solucao,
 } from "./index";
 
+type SemId<T> = T extends unknown ? Omit<T, "id"> : never;
+type PistaAtomicaDeTeste = SemId<Restricao> & { id: string; texto: string };
+
+function comoPista(pista: Pista | PistaAtomicaDeTeste): Pista {
+  if ("restricoes" in pista) return pista;
+  const { id, texto, ...restricao } = pista;
+  return { id, texto, restricoes: [{ ...restricao, id: `${id}#1` } as Restricao] };
+}
+
 const CATEGORIAS_BASE: Categoria[] = [
   { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bia", "Caio", "Davi"] },
   { id: "projeto", label: "Projeto", valores: ["Atlas", "Brisa", "Cosmos", "Delta"] },
@@ -41,7 +55,7 @@ function metadata(): PuzzleMetadata {
   };
 }
 
-function puzzleBase(id: string, pistas: Pista[], solucao: Solucao = SOLUCAO_BASE): Puzzle {
+function puzzleBase(id: string, pistas: readonly (Pista | PistaAtomicaDeTeste)[], solucao: Solucao = SOLUCAO_BASE): Puzzle {
   return {
     id,
     titulo: `Puzzle ${id}`,
@@ -52,7 +66,7 @@ function puzzleBase(id: string, pistas: Pista[], solucao: Solucao = SOLUCAO_BASE
       ...categoria,
       valores: [...categoria.valores],
     })),
-    pistas,
+    pistas: pistas.map(comoPista),
     solucao: Object.fromEntries(Object.entries(solucao).map(([idCategoria, valores]) => [idCategoria, [...valores]])),
     metadata: metadata(),
   };
@@ -67,7 +81,7 @@ function marca(
   return { categoria, valor, posicao, estado };
 }
 
-function pistaT3(id: string, categoria: string, valor: string, posicao: number): Pista {
+function pistaT3(id: string, categoria: string, valor: string, posicao: number): PistaAtomicaDeTeste {
   return { id, tipo: "T3", texto: `${valor} está na posição ${posicao}.`, item: { categoria, valor }, posicao };
 }
 
@@ -83,7 +97,7 @@ function puzzleAmbiguo(): Puzzle {
 }
 
 function puzzleUnico(): Puzzle {
-  const pistas: Pista[] = [];
+  const pistas: PistaAtomicaDeTeste[] = [];
   for (const categoria of CATEGORIAS_BASE) {
     categoria.valores.slice(0, 3).forEach((valor, indice) => {
       pistas.push(pistaT3(`u-${categoria.id}-${indice + 1}`, categoria.id, valor, indice + 1));
@@ -94,7 +108,7 @@ function puzzleUnico(): Puzzle {
 
 interface CasoOperador {
   nome: string;
-  pista: Pista;
+  pista: PistaAtomicaDeTeste;
   permitida: MarcacaoParcial;
   proibida: MarcacaoParcial;
 }
@@ -168,7 +182,7 @@ const CASOS_OPERADORES: CasoOperador[] = [
   },
 ];
 
-function caso(tipo: Pista["tipo"]): CasoOperador {
+function caso(tipo: Restricao["tipo"]): CasoOperador {
   const encontrado = CASOS_OPERADORES.find((candidato) => candidato.pista.tipo === tipo);
   if (encontrado === undefined) throw new Error(`Caso ausente para ${tipo}.`);
   return encontrado;
@@ -181,7 +195,7 @@ function puzzleDesempenho(): Puzzle {
     label: id.toUpperCase(),
     valores: [1, 2, 3, 4, 5].map((numero) => `${id}${numero}`),
   }));
-  const pistas: Pista[] = [];
+  const pistas: PistaAtomicaDeTeste[] = [];
   for (const id of ids) {
     pistas.push({
       id: `${id}-ordem-1`, tipo: "T7", texto: `${id}1, ${id}2 e ${id}3 estão nessa ordem.`,
@@ -211,7 +225,7 @@ function puzzleDesempenho(): Puzzle {
     nivel: 5,
     posicoes: 5,
     categorias,
-    pistas,
+    pistas: pistas.map(comoPista),
     solucao: Object.fromEntries(categorias.map((categoria) => [categoria.id, [...categoria.valores]])),
     metadata: metadata(),
   };
@@ -223,7 +237,7 @@ function puzzleTraco(): Puzzle {
     { id: "x", label: "Projeto", valores: ["x1", "x2", "x3", "x4"] },
     { id: "d", label: "Bebida", valores: ["d1", "d2", "d3", "d4"] },
   ];
-  const pistas: Pista[] = [
+  const pistas: PistaAtomicaDeTeste[] = [
     { id: "tr-1", tipo: "T1", texto: "p1 está com x1.", itemA: { categoria: "p", valor: "p1" }, itemB: { categoria: "x", valor: "x1" } },
     pistaT3("tr-2", "x", "x1", 1),
     { id: "tr-3", tipo: "T6", texto: "p2 vem antes de p3.", itemA: { categoria: "p", valor: "p2" }, itemB: { categoria: "p", valor: "p3" } },
@@ -242,7 +256,7 @@ function puzzleTraco(): Puzzle {
     nivel: 2,
     posicoes: 4,
     categorias,
-    pistas,
+    pistas: pistas.map(comoPista),
     solucao: Object.fromEntries(categorias.map((categoria) => [categoria.id, [...categoria.valores]])),
     metadata: metadata(),
   };
@@ -417,3 +431,107 @@ describe("provas adicionais da Fase 2", () => {
     expect(resultados.filter((resultado) => !resultado.proibida)).toHaveLength(CASOS_OPERADORES.length);
   });
 });
+
+describe("pistas compostas e rótulos de posição", () => {
+  it("a pista composta do museu preserva a solução única", () => {
+    const museu = PROBLEMAS_GRADE.find((puzzle) => puzzle.id === "museu-mostra-noturna");
+
+    expect(museu).toBeDefined();
+    expect(temSolucaoUnica(museu!)).toBe(true);
+  });
+
+  it("uma pista composta restringe como duas pistas simples equivalentes", () => {
+    const ancoras = CATEGORIAS_BASE.flatMap((categoria) =>
+      categoria.valores.slice(0, 3).map((valor, indice) => pistaT3(`a-${categoria.id}-${indice}`, categoria.id, valor, indice + 1))
+    );
+    const separadas = [
+      ...ancoras.filter((pista) => pista.id !== "a-pessoa-0" && pista.id !== "a-pessoa-1"),
+      pistaT3("pessoa-1", "pessoa", "Ana", 1),
+      pistaT3("pessoa-2", "pessoa", "Bia", 2),
+    ];
+    const composta: Pista = {
+      id: "pessoas-fixas",
+      texto: "Ana e Bia ocupam, respectivamente, as duas primeiras posições.",
+      restricoes: [
+        { id: "pessoas-fixas#1", tipo: "T3", item: { categoria: "pessoa", valor: "Ana" }, posicao: 1 },
+        { id: "pessoas-fixas#2", tipo: "T3", item: { categoria: "pessoa", valor: "Bia" }, posicao: 2 },
+      ],
+    };
+    const agrupadas = [...ancoras.filter((pista) => pista.id !== "a-pessoa-0" && pista.id !== "a-pessoa-1"), composta];
+
+    expect(contarSolucoes(puzzleBase("separadas", separadas), 2)).toBe(1);
+    expect(contarSolucoes(puzzleBase("agrupadas", agrupadas), 2)).toBe(1);
+  });
+
+  it("registra exatamente a restrição composta diretamente violada", () => {
+    const composta: Pista = {
+      id: "exclusoes",
+      texto: "Ana não está com Atlas nem Bia com Brisa.",
+      restricoes: [
+        { id: "exclusoes#1", tipo: "T2", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } },
+        { id: "exclusoes#2", tipo: "T2", itemA: { categoria: "pessoa", valor: "Bia" }, itemB: { categoria: "projeto", valor: "Brisa" } },
+      ],
+    };
+    const puzzle = puzzleBase("violacao-exata", [composta]);
+
+    expect(restricoesViolando(puzzle, [
+      marca("pessoa", "Ana", 1), marca("projeto", "Atlas", 1),
+      marca("pessoa", "Bia", 1), marca("projeto", "Brisa", 2),
+    ])).toEqual([{ pistaId: "exclusoes", restricaoId: "exclusoes#1" }]);
+  });
+
+  it("não registra restrição com operandos ainda não determinados, mesmo com contradição latente", () => {
+    const puzzle = puzzleBase("latente", [
+      {
+        id: "exclusao", texto: "Ana não está com Atlas.",
+        restricoes: [{ id: "exclusao#1", tipo: "T2", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "projeto", valor: "Atlas" } }],
+      },
+      pistaT3("atlas-primeiro", "projeto", "Atlas", 1),
+    ]);
+    const parcial = [marca("pessoa", "Ana", 1)];
+
+    expect(admiteSolucao(puzzle, parcial)).toBe(false);
+    expect(restricoesViolando(puzzle, parcial)).toEqual([]);
+  });
+
+  it("pistaSimples preserva texto e gera id determinístico da restrição", () => {
+    const pista = pistaSimples("simples", "Ana está na primeira posição.", {
+      tipo: "T3", item: { categoria: "pessoa", valor: "Ana" }, posicao: 1,
+    });
+
+    expect(pista.texto).toBe("Ana está na primeira posição.");
+    expect(pista.restricoes).toEqual([
+      { id: "simples#1", tipo: "T3", item: { categoria: "pessoa", valor: "Ana" }, posicao: 1 },
+    ]);
+  });
+
+  it("rejeita pista vazia, ids de restrição repetidos e rótulos de posição inválidos", () => {
+    const semRestricao = puzzleBase("sem-restricao", [{ id: "vazia", texto: "Sem regra.", restricoes: [] }]);
+    const idsRepetidos = puzzleBase("ids-repetidos", [
+      { id: "a", texto: "A.", restricoes: [{ id: "r", tipo: "T3", item: { categoria: "pessoa", valor: "Ana" }, posicao: 1 }] },
+      { id: "b", texto: "B.", restricoes: [{ id: "r", tipo: "T3", item: { categoria: "pessoa", valor: "Bia" }, posicao: 2 }] },
+    ]);
+
+    expect(validarEstruturaPuzzle(semRestricao)).toMatch(/ao menos uma restrição/);
+    expect(validarEstruturaPuzzle(idsRepetidos)).toMatch(/restrição "r" aparece mais de uma vez/);
+    expect(validarEstruturaPuzzle({ ...puzzleUnico(), rotulosPosicao: ["A", "B"] })).toMatch(/exatamente 4 valores/);
+    expect(validarEstruturaPuzzle({ ...puzzleUnico(), rotulosPosicao: ["A", "A", "C", "D"] })).toMatch(/rótulos repetidos/);
+  });
+
+  it("derivar classifica uma pista composta como uma única entrada", () => {
+    const composta: Pista = {
+      id: "composta-derivacao",
+      texto: "Iara não está com Duna nem na sala Oeste.",
+      restricoes: [
+        { id: "composta-derivacao#1", tipo: "T2", itemA: { categoria: "p", valor: "p1" }, itemB: { categoria: "x", valor: "x2" } },
+        { id: "composta-derivacao#2", tipo: "T2", itemA: { categoria: "p", valor: "p1" }, itemB: { categoria: "d", valor: "d2" } },
+      ],
+    };
+    const puzzle = { ...puzzleTraco(), pistas: [...puzzleTraco().pistas, composta] };
+    const traco = derivar(puzzle);
+
+    expect(traco.classificacao["composta-derivacao"]).toBeDefined();
+    expect(Object.keys(traco.classificacao)).toHaveLength(puzzle.pistas.length);
+    expect(traco.classificacao["composta-derivacao#1"]).toBeUndefined();
+  });
+});
diff --git a/lib/grade/solver.ts b/lib/grade/solver.ts
index c3b37bf6..a60cb0f7 100644
--- a/lib/grade/solver.ts
+++ b/lib/grade/solver.ts
@@ -4,7 +4,9 @@ import {
   criarContexto,
   dominiosIniciais,
   itensDaPista,
+  itensDaRestricao,
   pistaSatisfeita,
+  restricaoSatisfeita,
   solucoesIguais,
   validarEstruturaPuzzle,
 } from "./motor";
@@ -69,6 +71,47 @@ export function admiteSolucao(puzzle: Puzzle, parcial: MarcacaoParcial): boolean
   return resultado.erro === null && resultado.solucoes.length > 0;
 }
 
+/**
+ * Registro de processo apenas: nunca deve alimentar a tela ou revelar ao
+ * paciente qual pista/restrição falhou. Só registra violações que já podem
+ * ser verificadas diretamente porque todos os operandos foram confirmados.
+ */
+export function restricoesViolando(
+  puzzle: Puzzle,
+  parcial: MarcacaoParcial
+): { pistaId: string; restricaoId: string }[] {
+  if (validarEstruturaPuzzle(puzzle) !== null || !Array.isArray(parcial)) return [];
+
+  const posicoesPorItem = new Map<string, number[]>();
+  for (const marcacao of parcial) {
+    if (marcacao?.estado !== "confirmado") continue;
+    const chave = chaveItem(marcacao.categoria, marcacao.valor);
+    const posicoes = posicoesPorItem.get(chave) ?? [];
+    posicoes.push(marcacao.posicao);
+    posicoesPorItem.set(chave, posicoes);
+  }
+
+  const resultado: { pistaId: string; restricaoId: string }[] = [];
+  for (const pista of puzzle.pistas) {
+    for (const restricao of pista.restricoes) {
+      const posicoes = itensDaRestricao(restricao).map((item) => posicoesPorItem.get(chaveItem(item.categoria, item.valor)));
+      if (posicoes.some((posicoesDoItem) => posicoesDoItem === undefined || posicoesDoItem.length !== 1)) continue;
+
+      const solucaoParcial: Record<string, string[]> = {};
+      itensDaRestricao(restricao).forEach((item, indice) => {
+        const posicao = posicoes[indice]![0] - 1;
+        const valores = solucaoParcial[item.categoria] ?? [];
+        valores[posicao] = item.valor;
+        solucaoParcial[item.categoria] = valores;
+      });
+      if (!restricaoSatisfeita(restricao, solucaoParcial)) {
+        resultado.push({ pistaId: pista.id, restricaoId: restricao.id });
+      }
+    }
+  }
+  return resultado;
+}
+
 function chaveItem(categoria: string, valor: string): string {
   return JSON.stringify([categoria, valor]);
 }
diff --git a/lib/grade/tipos.ts b/lib/grade/tipos.ts
index 17af829a..6ae11aca 100644
--- a/lib/grade/tipos.ts
+++ b/lib/grade/tipos.ts
@@ -29,50 +29,49 @@ export const TIPOS_PISTA = [
 
 export type TipoPista = (typeof TIPOS_PISTA)[number];
 
-interface PistaBase {
+interface RestricaoBase {
   id: string;
   tipo: TipoPista;
-  texto: string;
 }
 
-export interface PistaT1 extends PistaBase {
+export interface RestricaoT1 extends RestricaoBase {
   tipo: "T1";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT2 extends PistaBase {
+export interface RestricaoT2 extends RestricaoBase {
   tipo: "T2";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT3 extends PistaBase {
+export interface RestricaoT3 extends RestricaoBase {
   tipo: "T3";
   item: Item;
   /** Posição apresentada ao paciente, portanto 1-based. */
   posicao: number;
 }
 
-export interface PistaT4 extends PistaBase {
+export interface RestricaoT4 extends RestricaoBase {
   tipo: "T4";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT5 extends PistaBase {
+export interface RestricaoT5 extends RestricaoBase {
   tipo: "T5";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT6 extends PistaBase {
+export interface RestricaoT6 extends RestricaoBase {
   tipo: "T6";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT7 extends PistaBase {
+export interface RestricaoT7 extends RestricaoBase {
   tipo: "T7";
   /** A semântica é, nesta ordem, pos(A) < pos(C) < pos(B). */
   itemA: Item;
@@ -80,13 +79,13 @@ export interface PistaT7 extends PistaBase {
   itemB: Item;
 }
 
-export interface PistaT8 extends PistaBase {
+export interface RestricaoT8 extends RestricaoBase {
   tipo: "T8";
   itemA: Item;
   itemB: Item;
 }
 
-export interface PistaT9 extends PistaBase {
+export interface RestricaoT9 extends RestricaoBase {
   tipo: "T9";
   itemA: Item;
   itemB: Item;
@@ -94,7 +93,7 @@ export interface PistaT9 extends PistaBase {
   itemD: Item;
 }
 
-export interface PistaT10 extends PistaBase {
+export interface RestricaoT10 extends RestricaoBase {
   tipo: "T10";
   /** Primeira associação do XOR: A ocupa a mesma posição que B. */
   itemA: Item;
@@ -104,24 +103,45 @@ export interface PistaT10 extends PistaBase {
   itemD: Item;
 }
 
-export interface PistaT11 extends PistaBase {
+export interface RestricaoT11 extends RestricaoBase {
   tipo: "T11";
   itemA: Item;
   itemB: Item;
 }
 
-export type Pista =
-  | PistaT1
-  | PistaT2
-  | PistaT3
-  | PistaT4
-  | PistaT5
-  | PistaT6
-  | PistaT7
-  | PistaT8
-  | PistaT9
-  | PistaT10
-  | PistaT11;
+/** Uma restrição atômica: o que o solver avalia. */
+export type Restricao =
+  | RestricaoT1
+  | RestricaoT2
+  | RestricaoT3
+  | RestricaoT4
+  | RestricaoT5
+  | RestricaoT6
+  | RestricaoT7
+  | RestricaoT8
+  | RestricaoT9
+  | RestricaoT10
+  | RestricaoT11;
+
+/** O que o paciente lê: uma pista pode agrupar uma ou mais restrições. */
+export interface Pista {
+  id: string;
+  texto: string;
+  restricoes: readonly Restricao[];
+}
+
+/** Cria a forma comum de uma pista que contém somente uma restrição. */
+type RestricaoSemId<T extends Restricao = Restricao> = T extends unknown ? Omit<T, "id"> : never;
+
+export function pistaSimples(id: string, texto: string, restricao: Omit<Restricao, "id">): Pista;
+export function pistaSimples(
+  id: string,
+  texto: string,
+  restricao: RestricaoSemId
+): Pista;
+export function pistaSimples(id: string, texto: string, restricao: RestricaoSemId): Pista {
+  return { id, texto, restricoes: [{ ...restricao, id: `${id}#1` } as Restricao] };
+}
 
 /** Metadados de autoria previstos na seção 25 da especificação-fonte. */
 export interface PuzzleMetadata {
@@ -140,6 +160,8 @@ export interface Puzzle {
   contexto: string;
   nivel: 1 | 2 | 3 | 4 | 5;
   posicoes: number;
+  /** Rótulos das colunas. Ausente = "Posição 1", "Posição 2"… A engine só conhece 0..N-1. */
+  rotulosPosicao?: readonly string[];
   categorias: Categoria[];
   pistas: Pista[];
   solucao: Solucao;
diff --git a/lib/grade/vp-prova.test.ts b/lib/grade/vp-prova.test.ts
index 741e5480..2812be95 100644
--- a/lib/grade/vp-prova.test.ts
+++ b/lib/grade/vp-prova.test.ts
@@ -1,5 +1,6 @@
 import { describe, expect, it } from "vitest";
 import { temSolucaoUnica, contarSolucoes, admiteSolucao } from "./index";
+import { pistaSimples } from "./tipos";
 
 const cats = [
   { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bruno", "Carla"] },
@@ -11,12 +12,12 @@ const base = (pistas: any[]): any => ({
   solucao: { pessoa: ["Ana", "Bruno", "Carla"], cor: ["Azul", "Verde", "Rosa"], fruta: ["Maçã", "Uva", "Pera"] }, metadata: {},
 });
 const T3 = (id: string, valor: string, posicao: number): any =>
-  ({ id, tipo: "T3", texto: id, item: { categoria: "pessoa", valor }, posicao });
+  pistaSimples(id, id, { tipo: "T3", item: { categoria: "pessoa", valor }, posicao });
 const T1 = (id: string, p: string, c: string): any =>
-  ({ id, tipo: "T1", texto: id, itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "cor", valor: c } });
+  pistaSimples(id, id, { tipo: "T1", itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "cor", valor: c } });
 
 const T1f = (id: string, p: string, f: string): any =>
-  ({ id, tipo: "T1", texto: id, itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "fruta", valor: f } });
+  pistaSimples(id, id, { tipo: "T1", itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "fruta", valor: f } });
 
 /** Amarra as três categorias: solução única de verdade. */
 const UNICO: any[] = [
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
(nenhum)
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-fatiaA ==
