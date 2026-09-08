== DIFF do lab grade-fatiaB (contra a base do bundle) ==
diff --git a/lib/grade/estrutura.test.ts b/lib/grade/estrutura.test.ts
index b9690866..0d505739 100644
--- a/lib/grade/estrutura.test.ts
+++ b/lib/grade/estrutura.test.ts
@@ -1,6 +1,38 @@
 import { describe, expect, it } from "vitest";
-import { pistaSimples, type Pista, type Puzzle } from "./tipos";
+import { PROBLEMA_TUTORIAL, PROBLEMAS_GRADE } from "./banco";
 import { avaliarEstrutura } from "./estrutura";
+import { contarBits, criarContexto, dominiosIniciais, propagarDominios } from "./motor";
+import { pistaSimples, type Categoria, type Pista, type Puzzle, type Solucao } from "./tipos";
+
+function metadata(): Puzzle["metadata"] {
+  return {
+    complexity: 1,
+    inferenceDepthDistribution: {},
+    skillWeights: {},
+    dominantOperations: [],
+    clueTypeDistribution: {},
+    expectedDifficulty: 1,
+    validatedUniqueSolution: true,
+  };
+}
+
+function puzzleMedicao(
+  categorias: Categoria[],
+  pistas: Pista[],
+  solucao: Solucao
+): Puzzle {
+  return {
+    id: "sintetico-medicao",
+    titulo: "Puzzle sintético",
+    contexto: "Construído exclusivamente para testar a ferramenta estrutural.",
+    nivel: 2,
+    posicoes: categorias[0].valores.length,
+    categorias,
+    pistas,
+    solucao,
+    metadata: metadata(),
+  };
+}
 
 function criarPuzzle(
   categoriasIds: readonly string[],
@@ -22,27 +54,11 @@ function criarPuzzle(
       posicao: 2,
     }),
   ]);
-  return {
-    id: `sintetico-${categoriasIds.join("-")}`,
-    titulo: "Puzzle sintético",
-    contexto: "Construído exclusivamente para testar a ferramenta estrutural.",
-    nivel: 2,
-    posicoes: 3,
+  return puzzleMedicao(
     categorias,
-    pistas: [...ancoras, ...pistasExtras],
-    solucao: Object.fromEntries(
-      categoriasIds.map((id) => [id, [`${id}1`, `${id}2`, `${id}3`]])
-    ),
-    metadata: {
-      complexity: 1,
-      inferenceDepthDistribution: {},
-      skillWeights: {},
-      dominantOperations: [],
-      clueTypeDistribution: {},
-      expectedDifficulty: 1,
-      validatedUniqueSolution: true,
-    },
-  };
+    [...ancoras, ...pistasExtras],
+    Object.fromEntries(categoriasIds.map((id) => [id, [`${id}1`, `${id}2`, `${id}3`]]))
+  );
 }
 
 function associacao(id: string, categoriaA: string, categoriaB: string): Pista {
@@ -52,8 +68,8 @@ function associacao(id: string, categoriaA: string, categoriaB: string): Pista {
   });
 }
 
-describe("validação estrutural da Grade Dedutiva", () => {
-  it("aprova grafo conectado e reprova grafo com dois componentes", () => {
+describe("grafo estrutural da Grade Dedutiva", () => {
+  it("mede grafo conectado e grafo com dois componentes", () => {
     const conectado = criarPuzzle(["a", "b", "c"], [
       associacao("ab", "a", "b"),
       associacao("bc", "b", "c"),
@@ -63,13 +79,78 @@ describe("validação estrutural da Grade Dedutiva", () => {
       associacao("cd", "c", "d"),
     ]);
 
-    expect(avaliarEstrutura(conectado).aprovado).toBe(true);
+    expect(avaliarEstrutura(conectado).componentes).toHaveLength(1);
     const relatorioDesconectado = avaliarEstrutura(desconectado);
     expect(relatorioDesconectado.aprovado).toBe(false);
     expect(relatorioDesconectado.componentes).toHaveLength(2);
   });
 
-  it("não cria aresta para pista intracategoria e cria três para pista de três categorias", () => {
+  it("prova a correção: dois triângulos ligados por uma aresta têm grau mínimo 2, mas uma ponte", () => {
+    // Triângulo a-b-c, triângulo d-e-f e somente c-d ligando os dois blocos.
+    const duasTriades = criarPuzzle(["a", "b", "c", "d", "e", "f"], [
+      associacao("ab", "a", "b"),
+      associacao("bc", "b", "c"),
+      associacao("ac", "a", "c"),
+      associacao("de", "d", "e"),
+      associacao("ef", "e", "f"),
+      associacao("df", "d", "f"),
+      associacao("cd-ponte", "c", "d"),
+    ]);
+
+    const relatorio = avaliarEstrutura(duasTriades);
+    expect(relatorio.componentes).toHaveLength(1);
+    expect(Object.values(relatorio.grauPorCategoria).every((grau) => grau >= 2)).toBe(true);
+    expect(relatorio.pontes).toBe(1);
+    expect(relatorio.motivos).toContain("O grafo de categorias possui 1 ponte.");
+    expect(relatorio.aprovado).toBe(false);
+  });
+
+  it("não encontra pontes em um ciclo de quatro categorias", () => {
+    const ciclo = criarPuzzle(["a", "b", "c", "d"], [
+      associacao("ab", "a", "b"),
+      associacao("bc", "b", "c"),
+      associacao("cd", "c", "d"),
+      associacao("ad", "a", "d"),
+    ]);
+
+    const relatorio = avaliarEstrutura(ciclo);
+    expect(relatorio.componentes).toHaveLength(1);
+    expect(relatorio.grauPorCategoria).toEqual({ a: 2, b: 2, c: 2, d: 2 });
+    expect(relatorio.pontes).toBe(0);
+    expect(relatorio.motivos.some((motivo) => motivo.includes("ponte"))).toBe(false);
+  });
+
+  it("aprova integralmente uma estrutura sintética que cumpre a régua", () => {
+    const puzzle = puzzleMedicao(
+      [
+        { id: "pessoa", label: "Pessoa", valores: ["Beto", "Ana", "Caio"] },
+        { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
+        { id: "fruta", label: "Fruta", valores: ["Pera", "Uva", "Maçã"] },
+      ],
+      [
+        pistaSimples("ana-verde", "Ana escolheu verde.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "cor", valor: "Verde" } }),
+        pistaSimples("beto-azul", "Beto escolheu azul.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "cor", valor: "Azul" } }),
+        pistaSimples("ana-uva", "Ana escolheu uva.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "fruta", valor: "Uva" } }),
+        pistaSimples("beto-pera", "Beto escolheu pera.", { tipo: "T1", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "fruta", valor: "Pera" } }),
+        pistaSimples("verde-uva", "Verde está com uva.", { tipo: "T1", itemA: { categoria: "cor", valor: "Verde" }, itemB: { categoria: "fruta", valor: "Uva" } }),
+        pistaSimples("ana-antes-azul", "Ana vem antes de azul.", { tipo: "T11", itemA: { categoria: "pessoa", valor: "Ana" }, itemB: { categoria: "cor", valor: "Azul" } }),
+        pistaSimples("beto-antes-maca", "Beto vem antes de maçã.", { tipo: "T11", itemA: { categoria: "pessoa", valor: "Beto" }, itemB: { categoria: "fruta", valor: "Maçã" } }),
+      ],
+      {
+        pessoa: ["Ana", "Beto", "Caio"],
+        cor: ["Verde", "Azul", "Rosa"],
+        fruta: ["Uva", "Pera", "Maçã"],
+      }
+    );
+
+    const relatorio = avaliarEstrutura(puzzle);
+    expect(relatorio.aprovado).toBe(true);
+    expect(relatorio.motivos).toEqual([]);
+    expect(relatorio.grauPorCategoria).toEqual({ pessoa: 2, cor: 2, fruta: 2 });
+    expect(relatorio.pontes).toBe(0);
+  });
+
+  it("não cria aresta para restrição intra e cria três para restrição de três categorias", () => {
     const pistaInterna = pistaSimples("interna", "a1 vem antes de a2.", { tipo: "T4",
       itemA: { categoria: "a", valor: "a1" },
       itemB: { categoria: "a", valor: "a2" },
@@ -84,58 +165,236 @@ describe("validação estrutural da Grade Dedutiva", () => {
     expect(relatorio.pistasIntracategoria).toBe(7);
     expect(relatorio.pistasAncora).toBe(6);
     expect(relatorio.pistasCrossCategory).toBe(1);
+    expect(relatorio.restricoesIntracategoria).toBe(7);
+    expect(relatorio.restricoesCrossCategory).toBe(1);
     expect(relatorio.arestas).toEqual([
       { categoriaA: "a", categoriaB: "b" },
       { categoriaA: "a", categoriaB: "c" },
       { categoriaA: "b", categoriaB: "c" },
     ]);
   });
+});
+
+describe("contagens por pista e por restrição", () => {
+  it("uma pista composta pode somar 1 intra + 1 cross, mas continua sendo 1 pista cross", () => {
+    const composta: Pista = {
+      id: "composta",
+      texto: "a1 vem antes de a2, e b1 está com c1.",
+      restricoes: [
+        { id: "composta#1", tipo: "T4", itemA: { categoria: "a", valor: "a1" }, itemB: { categoria: "a", valor: "a2" } },
+        { id: "composta#2", tipo: "T1", itemA: { categoria: "b", valor: "b1" }, itemB: { categoria: "c", valor: "c1" } },
+      ],
+    };
+    const relatorio = avaliarEstrutura(puzzleMedicao(
+      [
+        { id: "a", label: "A", valores: ["a1", "a2", "a3"] },
+        { id: "b", label: "B", valores: ["b1", "b2", "b3"] },
+        { id: "c", label: "C", valores: ["c1", "c2", "c3"] },
+      ],
+      [composta],
+      { a: ["a1", "a2", "a3"], b: ["b1", "b2", "b3"], c: ["c1", "c2", "c3"] }
+    ));
+
+    expect(relatorio.restricoesIntracategoria).toBe(1);
+    expect(relatorio.restricoesCrossCategory).toBe(1);
+    expect(relatorio.pistasIntracategoria).toBe(0);
+    expect(relatorio.pistasCrossCategory).toBe(1);
+  });
 
-  it("reprova quando todas as categorias seguem a ordem declarada", () => {
-    const puzzle = criarPuzzle(["a", "b", "c"], [
+  it("reprova quando restrições cross não predominam sobre as intra", () => {
+    const relatorio = avaliarEstrutura(criarPuzzle(["a", "b", "c"], [
       associacao("ab", "a", "b"),
       associacao("bc", "b", "c"),
-    ], true);
+    ]));
+
+    expect(relatorio.restricoesCrossCategory).toBe(2);
+    expect(relatorio.restricoesIntracategoria).toBe(6);
+    expect(relatorio.motivos).toContain(
+      "As restrições cross-category (2) não predominam sobre as intracategoria (6)."
+    );
+  });
+});
+
+describe("categorias redundantes ao eixo de posições", () => {
+  function comCategoriaTestada(valores: string[], solucaoTestada: string[]): Puzzle {
+    return puzzleMedicao(
+      [
+        { id: "testada", label: "Testada", valores },
+        { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bia", "Caio", "Davi"] },
+        { id: "cor", label: "Cor", valores: ["Azul", "Rosa", "Verde", "Lilás"] },
+      ],
+      [],
+      {
+        testada: solucaoTestada,
+        pessoa: ["Ana", "Bia", "Caio", "Davi"],
+        cor: ["Azul", "Rosa", "Verde", "Lilás"],
+      }
+    );
+  }
+
+  it("reprova horários em ordem crescente", () => {
+    const relatorio = avaliarEstrutura(comCategoriaTestada(
+      ["14h", "15h", "16h", "17h"],
+      ["14h", "15h", "16h", "17h"]
+    ));
+
+    expect(relatorio.categoriasIsomorfasAoEixo).toEqual(["testada"]);
+    expect(relatorio.motivos).toContain("Categorias isomorfas ao eixo de posições: Testada.");
+  });
+
+  it("não dispara para os mesmos horários fora de ordem", () => {
+    const relatorio = avaliarEstrutura(comCategoriaTestada(
+      ["14h", "15h", "16h", "17h"],
+      ["15h", "14h", "17h", "16h"]
+    ));
+
+    expect(relatorio.categoriasIsomorfasAoEixo).toEqual([]);
+  });
+
+  it("nunca interpreta nomes não sequenciais como eixo", () => {
+    const relatorio = avaliarEstrutura(comCategoriaTestada(
+      ["Ana", "Bia", "Caio", "Davi"],
+      ["Ana", "Bia", "Caio", "Davi"]
+    ));
+
+    expect(relatorio.categoriasIsomorfasAoEixo).toEqual([]);
+  });
+});
+
+describe("categoria resolvível de forma independente", () => {
+  const categorias: Categoria[] = [
+    { id: "a", label: "A", valores: ["a1", "a2", "a3"] },
+    { id: "b", label: "B", valores: ["b1", "b2", "b3"] },
+    { id: "c", label: "C", valores: ["c1", "c2", "c3"] },
+  ];
+  const solucao = { a: ["a1", "a2", "a3"], b: ["b1", "b2", "b3"], c: ["c1", "c2", "c3"] };
+
+  it("reprova categoria inteiramente forçada por restrições intra", () => {
+    const relatorio = avaliarEstrutura(puzzleMedicao(categorias, [
+      pistaSimples("a-1", "a1 está na primeira posição.", { tipo: "T3", item: { categoria: "a", valor: "a1" }, posicao: 1 }),
+      pistaSimples("a-2", "a2 está na segunda posição.", { tipo: "T3", item: { categoria: "a", valor: "a2" }, posicao: 2 }),
+    ], solucao));
+
+    expect(relatorio.categoriasResolviveisSozinhas).toEqual(["a"]);
+    expect(relatorio.motivos).toContain("Categorias resolvíveis apenas com restrições próprias: A.");
+  });
+
+  it("não marca a categoria que depende de uma restrição cross para fechar", () => {
+    const puzzle = puzzleMedicao(categorias, [
+      pistaSimples("a-1", "a1 está na primeira posição.", { tipo: "T3", item: { categoria: "a", valor: "a1" }, posicao: 1 }),
+      pistaSimples("b-2", "b2 está na segunda posição.", { tipo: "T3", item: { categoria: "b", valor: "b2" }, posicao: 2 }),
+      pistaSimples("a2-b2", "a2 está com b2.", { tipo: "T1", itemA: { categoria: "a", valor: "a2" }, itemB: { categoria: "b", valor: "b2" } }),
+    ], solucao);
+    const contextoCompleto = criarContexto(puzzle);
+    const dominiosCompletos = dominiosIniciais(contextoCompleto);
+    propagarDominios(dominiosCompletos, contextoCompleto);
     const relatorio = avaliarEstrutura(puzzle);
 
-    expect(relatorio.categoriasNaOrdemDeclarada).toBe(3);
-    expect(relatorio.aprovado).toBe(false);
+    expect(contextoCompleto.variaveisPorCategoria[0].every(
+      (indice) => contarBits(dominiosCompletos[indice]) === 1
+    )).toBe(true);
+    expect(relatorio.categoriasResolviveisSozinhas).not.toContain("a");
   });
+});
 
-  it("isenta o tutorial das reprovações sem deixar de calcular as medidas", () => {
-    const tutorial = criarPuzzle(["a", "b", "c", "d"], [
-      associacao("ab", "a", "b"),
-      associacao("cd", "c", "d"),
-    ], true);
-    const relatorio = avaliarEstrutura(tutorial, true);
+describe("cobertura essencial e ordem declarada", () => {
+  it("exige pista essencial em todas as categorias", () => {
+    const base = criarPuzzle(["a", "b", "c"], []);
+    const duplicadas = base.pistas.map((pista, indice): Pista => ({
+      ...pista,
+      id: `duplicada-${indice}`,
+      restricoes: pista.restricoes.map((restricao) => ({
+        ...restricao,
+        id: `duplicada-${indice}#1`,
+      })),
+    }));
+    const relatorio = avaliarEstrutura({ ...base, pistas: [...base.pistas, ...duplicadas] });
+
+    expect(relatorio.categoriasSemPistaEssencial).toEqual(["a", "b", "c"]);
+    expect(relatorio.motivos).toContain("Categorias sem cobertura por pista essencial: A, B, C.");
+  });
+
+  it("aceita no máximo uma categoria e reprova a partir de duas na ordem declarada", () => {
+    const uma = criarPuzzle(["a", "b", "c"], []);
+    uma.categorias[0].valores = ["a1", "a2", "a3"];
+    const duas = criarPuzzle(["a", "b", "c"], []);
+    duas.categorias[0].valores = ["a1", "a2", "a3"];
+    duas.categorias[1].valores = ["b1", "b2", "b3"];
+
+    expect(avaliarEstrutura(uma).categoriasNaOrdemDeclarada).toBe(1);
+    const relatorioDuas = avaliarEstrutura(duas);
+    expect(relatorioDuas.categoriasNaOrdemDeclarada).toBe(2);
+    expect(relatorioDuas.motivos).toContain(
+      "2 categorias seguem a ordem declarada; o máximo permitido é 1."
+    );
+  });
+});
+
+describe("banco atual — testes que documentam defeitos deliberadamente", () => {
+  it("biblioteca-encontros reprova pelos motivos estruturais exatos", () => {
+    const biblioteca = PROBLEMAS_GRADE.find((puzzle) => puzzle.id === "biblioteca-encontros");
+    expect(biblioteca).toBeDefined();
+
+    // Este teste deve cair quando o banco for refeito: nesse momento, cair será sinal de sucesso,
+    // não uma quebra da régua. As expectativas então devem ser substituídas pelos novos puzzles.
+    expect(avaliarEstrutura(biblioteca as Puzzle).motivos).toEqual([
+      "O grafo de categorias possui 4 componentes independentes.",
+      "Categorias com grau menor que 2: Visitante, Sala, Tema, Horário.",
+      "As restrições cross-category (0) não predominam sobre as intracategoria (8).",
+      "Categorias isomorfas ao eixo de posições: Horário.",
+      "Categorias resolvíveis apenas com restrições próprias: Visitante, Sala, Tema, Horário.",
+      "4 categorias seguem a ordem declarada; o máximo permitido é 1.",
+    ]);
+  });
+
+  it("museu-mostra-noturna reprova pelos motivos estruturais exatos", () => {
+    const museu = PROBLEMAS_GRADE.find((puzzle) => puzzle.id === "museu-mostra-noturna");
+    expect(museu).toBeDefined();
+
+    // Este teste deve cair quando o banco for refeito: nesse momento, cair será sinal de sucesso,
+    // não uma quebra da régua. As expectativas então devem ser substituídas pelos novos puzzles.
+    expect(avaliarEstrutura(museu as Puzzle).motivos).toEqual([
+      "Categorias com grau menor que 2: Horário.",
+      "O grafo de categorias possui 1 ponte.",
+      "Categorias isomorfas ao eixo de posições: Horário.",
+      "Categorias resolvíveis apenas com restrições próprias: Responsável.",
+      "4 categorias seguem a ordem declarada; o máximo permitido é 1.",
+    ]);
+  });
+
+  it("tutorial passa por isenção, mas todas as medidas continuam calculadas", () => {
+    const relatorio = avaliarEstrutura(PROBLEMA_TUTORIAL, true);
 
     expect(relatorio.aprovado).toBe(true);
     expect(relatorio.motivos).toEqual([]);
-    expect(relatorio.componentes).toHaveLength(2);
-    expect(relatorio.categoriasNaOrdemDeclarada).toBe(4);
-    expect(Object.keys(relatorio.profundidadeInferencial.porCelula)).toHaveLength(12);
+    expect(relatorio.componentes).toHaveLength(3);
+    expect(relatorio.grauPorCategoria).toEqual({ apresentador: 0, projeto: 0, horario: 0 });
+    expect(relatorio.pontes).toBe(0);
+    expect(relatorio.restricoesIntracategoria).toBe(4);
+    expect(relatorio.restricoesCrossCategory).toBe(0);
+    expect(relatorio.categoriasIsomorfasAoEixo).toEqual(["horario"]);
+    expect(relatorio.categoriasResolviveisSozinhas).toEqual(["apresentador", "projeto", "horario"]);
+    expect(relatorio.categoriasNaOrdemDeclarada).toBe(3);
+    expect(Object.keys(relatorio.profundidadeInferencial.porCelula)).toHaveLength(9);
   });
 });
 
-describe("conserto do VP — a triagem não pode explodir no caso ruim", () => {
-  it("puzzle SEM solução única é REPROVADO, e não lança", () => {
-    // A ferramenta existe para julgar candidatos, e é entre candidatos que mora o puzzle inválido.
-    // `derivar` lança nesse caso; se `avaliarEstrutura` propagasse, a triagem da fase 5 morreria
-    // no primeiro problema mal formado em vez de rejeitá-lo.
-    const ambiguo: Puzzle = {
-      id: "ambiguo", titulo: "a", contexto: "a", nivel: 2, posicoes: 3,
-      categorias: [
+describe("solução única é necessária, mas não suficiente", () => {
+  it("puzzle sem solução única é reprovado, e não lança", () => {
+    const ambiguo = puzzleMedicao(
+      [
         { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bruno", "Carla"] },
         { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
+        { id: "fruta", label: "Fruta", valores: ["Maçã", "Uva", "Pera"] },
       ],
-      pistas: [],
-      solucao: { pessoa: ["Ana", "Bruno", "Carla"], cor: ["Azul", "Verde", "Rosa"] },
-      metadata: {
-        complexity: 1, inferenceDepthDistribution: {}, skillWeights: {},
-        dominantOperations: [], clueTypeDistribution: {}, expectedDifficulty: 1,
-        validatedUniqueSolution: false,
-      },
-    };
+      [],
+      {
+        pessoa: ["Ana", "Bruno", "Carla"],
+        cor: ["Azul", "Verde", "Rosa"],
+        fruta: ["Maçã", "Uva", "Pera"],
+      }
+    );
+
     const relatorio = avaliarEstrutura(ambiguo);
     expect(relatorio.aprovado).toBe(false);
     expect(relatorio.motivos.join(" ")).toMatch(/derivar/i);
diff --git a/lib/grade/estrutura.ts b/lib/grade/estrutura.ts
index aabfd593..e617fc77 100644
--- a/lib/grade/estrutura.ts
+++ b/lib/grade/estrutura.ts
@@ -1,10 +1,27 @@
 import { derivar } from "./derivacao";
-import { itensDaPista } from "./motor";
-import type { Puzzle, TracoDerivacao } from "./tipos";
+import {
+  contarBits,
+  criarContexto,
+  dominiosIniciais,
+  itensDaRestricao,
+  propagarDominios,
+} from "./motor";
+import type { Categoria, Pista, Puzzle, Restricao, TracoDerivacao } from "./tipos";
 
-/** Proporção que representa todas as categorias na ordem declarada. */
+/** Quantidade máxima de categorias cuja solução pode repetir a ordem declarada dos valores. */
 export const LIMIAR_ORDEM_DECLARADA = 1;
 
+/**
+ * Heurística lexical de sequências conhecidas. Estes padrões pegam os casos
+ * conhecidos; não provam a ausência de uma categoria redundante ao eixo.
+ */
+export const PADROES_SEQUENCIA_EIXO = {
+  hora: /^\s*(\d{1,2})h(?:(\d{2}))?\s*$/i,
+  numero: /^\s*(\d+)\s*$/,
+  ordinal: /^\s*(\d+)\s*[ºª]\s*$/,
+  prefixoNumerado: /^\s*(.+?\D)\s+(\d+)\s*$/,
+} as const;
+
 export interface ArestaCategorias {
   categoriaA: string;
   categoriaB: string;
@@ -19,10 +36,14 @@ export interface ProfundidadeInferencial {
 export interface RelatorioEstrutural {
   aprovado: boolean;
   motivos: string[];
+  /** Contagem por pista visual: descreve o que a pessoa lê. */
   pistasIntracategoria: number;
+  /** Contagem por pista visual: descreve o que a pessoa lê. */
   pistasCrossCategory: number;
   /** T3 é intracategoria, mas aparece também como âncora para não ser confundida com uma restrição interna comum. */
   pistasAncora: number;
+  restricoesIntracategoria: number;
+  restricoesCrossCategory: number;
   profundidadeInferencial: ProfundidadeInferencial;
   categoriasNasConclusoes: number;
   redundancia: number;
@@ -30,7 +51,12 @@ export interface RelatorioEstrutural {
   paresPossiveis: number;
   componentes: string[][];
   arestas: ArestaCategorias[];
+  grauPorCategoria: Record<string, number>;
+  pontes: number;
   categoriasNaOrdemDeclarada: number;
+  categoriasIsomorfasAoEixo: string[];
+  categoriasResolviveisSozinhas: string[];
+  categoriasSemPistaEssencial: string[];
 }
 
 function chaveAresta(categoriaA: string, categoriaB: string): string {
@@ -69,6 +95,83 @@ function componentesDoGrafo(
   return componentes;
 }
 
+function contarPontes(
+  categorias: readonly string[],
+  arestas: readonly ArestaCategorias[]
+): number {
+  const componentesOriginais = componentesDoGrafo(categorias, arestas).length;
+  // Há no máximo 6 categorias e 15 arestas. Remover uma aresta por vez e
+  // testar conectividade é trivialmente barato neste tamanho e deixa a
+  // definição de ponte evidente, sem a complexidade desnecessária de Tarjan.
+  return arestas.filter((_, indiceRemovido) =>
+    componentesDoGrafo(
+      categorias,
+      arestas.filter((_, indice) => indice !== indiceRemovido)
+    ).length > componentesOriginais
+  ).length;
+}
+
+function ordemSequencialConhecida(valores: readonly string[]): number[] | null {
+  const horas = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.hora));
+  if (horas.every((resultado) => resultado !== null)) {
+    return horas.map((resultado) => Number(resultado?.[1]) * 60 + Number(resultado?.[2] ?? 0));
+  }
+
+  const numeros = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.numero));
+  if (numeros.every((resultado) => resultado !== null)) {
+    return numeros.map((resultado) => Number(resultado?.[1]));
+  }
+
+  const ordinais = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.ordinal));
+  if (ordinais.every((resultado) => resultado !== null)) {
+    return ordinais.map((resultado) => Number(resultado?.[1]));
+  }
+
+  const prefixados = valores.map((valor) => valor.match(PADROES_SEQUENCIA_EIXO.prefixoNumerado));
+  if (prefixados.every((resultado) => resultado !== null)) {
+    const prefixos = new Set(prefixados.map((resultado) => resultado?.[1].trim().toLocaleLowerCase("pt-BR")));
+    if (prefixos.size === 1) return prefixados.map((resultado) => Number(resultado?.[2]));
+  }
+
+  return null;
+}
+
+function categoriaIsomorfaAoEixo(categoria: Categoria, puzzle: Puzzle): boolean {
+  const ordem = ordemSequencialConhecida(puzzle.solucao[categoria.id] ?? []);
+  return ordem !== null && ordem.every((valor, indice) => indice === 0 || ordem[indice - 1] < valor);
+}
+
+function categoriasDaRestricao(restricao: Restricao): string[] {
+  return [...new Set(itensDaRestricao(restricao).map((item) => item.categoria))];
+}
+
+function pistaSomenteComRestricoes(pista: Pista, restricoes: readonly Restricao[]): Pista {
+  return { ...pista, restricoes };
+}
+
+function categoriaResolveSozinha(categoriaId: string, puzzle: Puzzle): boolean {
+  const pistasIntracategoria = puzzle.pistas.flatMap((pista) => {
+    const restricoes = pista.restricoes.filter((restricao) => {
+      const categorias = categoriasDaRestricao(restricao);
+      return categorias.length === 1 && categorias[0] === categoriaId;
+    });
+    return restricoes.length === 0 ? [] : [pistaSomenteComRestricoes(pista, restricoes)];
+  });
+  const contexto = criarContexto(puzzle, pistasIntracategoria);
+  const dominios = dominiosIniciais(contexto);
+  const propagacao = propagarDominios(dominios, contexto);
+  const indiceCategoria = puzzle.categorias.findIndex((categoria) => categoria.id === categoriaId);
+  return propagacao.consistente
+    && indiceCategoria >= 0
+    && contexto.variaveisPorCategoria[indiceCategoria].every(
+      (indiceVariavel) => contarBits(dominios[indiceVariavel]) === 1
+    );
+}
+
+function listarCategorias(ids: readonly string[], puzzle: Puzzle): string {
+  return ids.map((id) => puzzle.categorias.find((categoria) => categoria.id === id)?.label ?? id).join(", ");
+}
+
 /**
  * Estas medidas descrevem propriedades do problema; não são números clínicos
  * nem autorizam interpretação sobre a pessoa que o resolve.
@@ -81,23 +184,33 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
   let pistasIntracategoria = 0;
   let pistasCrossCategory = 0;
   let pistasAncora = 0;
+  let restricoesIntracategoria = 0;
+  let restricoesCrossCategory = 0;
 
   for (const pista of puzzle.pistas) {
-    const categorias = [...new Set(itensDaPista(pista).map((item) => item.categoria))]
-      .sort((a, b) => (ordemCategorias.get(a) ?? 0) - (ordemCategorias.get(b) ?? 0));
-    if (categorias.length <= 1) {
-      pistasIntracategoria += 1;
-      if (pista.restricoes.some((restricao) => restricao.tipo === "T3")) pistasAncora += 1;
-      continue;
-    }
+    let pistaTemRestricaoCross = false;
+    if (pista.restricoes.some((restricao) => restricao.tipo === "T3")) pistasAncora += 1;
 
-    pistasCrossCategory += 1;
-    for (let a = 0; a < categorias.length; a += 1) {
-      for (let b = a + 1; b < categorias.length; b += 1) {
-        const aresta = { categoriaA: categorias[a], categoriaB: categorias[b] };
-        arestasPorChave.set(chaveAresta(aresta.categoriaA, aresta.categoriaB), aresta);
+    for (const restricao of pista.restricoes) {
+      const categorias = categoriasDaRestricao(restricao)
+        .sort((a, b) => (ordemCategorias.get(a) ?? 0) - (ordemCategorias.get(b) ?? 0));
+      if (categorias.length <= 1) {
+        restricoesIntracategoria += 1;
+        continue;
+      }
+
+      restricoesCrossCategory += 1;
+      pistaTemRestricaoCross = true;
+      for (let a = 0; a < categorias.length; a += 1) {
+        for (let b = a + 1; b < categorias.length; b += 1) {
+          const aresta = { categoriaA: categorias[a], categoriaB: categorias[b] };
+          arestasPorChave.set(chaveAresta(aresta.categoriaA, aresta.categoriaB), aresta);
+        }
       }
     }
+
+    if (pistaTemRestricaoCross) pistasCrossCategory += 1;
+    else pistasIntracategoria += 1;
   }
 
   const arestas = [...arestasPorChave.values()];
@@ -105,10 +218,15 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
   const componentes = componentesDoGrafo(idsCategorias, arestas);
   const paresPossiveis = idsCategorias.length * (idsCategorias.length - 1) / 2;
   const conectividade = paresPossiveis === 0 ? 0 : arestas.length / paresPossiveis;
+  const grauPorCategoria = Object.fromEntries(idsCategorias.map((categoria) => [categoria, 0]));
+  for (const { categoriaA, categoriaB } of arestas) {
+    grauPorCategoria[categoriaA] += 1;
+    grauPorCategoria[categoriaB] += 1;
+  }
+  const pontes = contarPontes(idsCategorias, arestas);
 
-  // `derivar` LANÇA quando o puzzle não tem solução única — e esta ferramenta existe justamente
-  // para julgar candidatos, que é onde puzzles inválidos aparecem. Uma ferramenta de triagem que
-  // explode no caso ruim não serve: aqui o caso ruim é REPROVAÇÃO, com o motivo dito.
+  // Solução única é necessária, mas não suficiente: `derivar` lança quando
+  // ela falta, enquanto os demais critérios abaixo ainda medem a estrutura.
   let traco: TracoDerivacao | null = null;
   let erroDerivacao: string | null = null;
   try {
@@ -121,16 +239,27 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
       .filter(([, classificacao]) => classificacao === "essencial")
       .map(([pistaId]) => pistaId)
   );
-  const categoriasNasConclusoes = new Set(
+  const categoriasComPistaEssencial = new Set(
     puzzle.pistas
       .filter((pista) => pistasEssenciais.has(pista.id))
-      .flatMap((pista) => itensDaPista(pista).map((item) => item.categoria))
-  ).size;
+      .flatMap((pista) => pista.restricoes)
+      .flatMap((restricao) => categoriasDaRestricao(restricao))
+  );
+  const categoriasSemPistaEssencial = traco === null
+    ? []
+    : idsCategorias.filter((categoria) => !categoriasComPistaEssencial.has(categoria));
+  const categoriasNasConclusoes = categoriasComPistaEssencial.size;
   const redundancia = Object.values(traco?.classificacao ?? {})
     .filter((classificacao) => classificacao === "redundante").length;
   const categoriasNaOrdemDeclarada = puzzle.categorias.filter((categoria) =>
     categoria.valores.every((valor, indice) => puzzle.solucao[categoria.id]?.[indice] === valor)
   ).length;
+  const categoriasIsomorfasAoEixo = puzzle.categorias
+    .filter((categoria) => categoriaIsomorfaAoEixo(categoria, puzzle))
+    .map((categoria) => categoria.id);
+  const categoriasResolviveisSozinhas = idsCategorias.filter((categoria) =>
+    categoriaResolveSozinha(categoria, puzzle)
+  );
 
   const motivos: string[] = [];
   if (erroDerivacao !== null) {
@@ -140,11 +269,27 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
   if (!ehTutorial && componentes.length > 1) {
     motivos.push(`O grafo de categorias possui ${componentes.length} componentes independentes.`);
   }
-  const proporcaoNaOrdem = idsCategorias.length === 0
-    ? 0
-    : categoriasNaOrdemDeclarada / idsCategorias.length;
-  if (!ehTutorial && proporcaoNaOrdem >= LIMIAR_ORDEM_DECLARADA) {
-    motivos.push("Todas as categorias seguem a ordem em que seus valores foram declarados.");
+  const categoriasComGrauInsuficiente = idsCategorias.filter((categoria) => grauPorCategoria[categoria] < 2);
+  if (!ehTutorial && categoriasComGrauInsuficiente.length > 0) {
+    motivos.push(`Categorias com grau menor que 2: ${listarCategorias(categoriasComGrauInsuficiente, puzzle)}.`);
+  }
+  if (!ehTutorial && pontes > 0) {
+    motivos.push(`O grafo de categorias possui ${pontes} ${pontes === 1 ? "ponte" : "pontes"}.`);
+  }
+  if (!ehTutorial && restricoesCrossCategory <= restricoesIntracategoria) {
+    motivos.push(`As restrições cross-category (${restricoesCrossCategory}) não predominam sobre as intracategoria (${restricoesIntracategoria}).`);
+  }
+  if (!ehTutorial && categoriasIsomorfasAoEixo.length > 0) {
+    motivos.push(`Categorias isomorfas ao eixo de posições: ${listarCategorias(categoriasIsomorfasAoEixo, puzzle)}.`);
+  }
+  if (!ehTutorial && categoriasResolviveisSozinhas.length > 0) {
+    motivos.push(`Categorias resolvíveis apenas com restrições próprias: ${listarCategorias(categoriasResolviveisSozinhas, puzzle)}.`);
+  }
+  if (!ehTutorial && categoriasSemPistaEssencial.length > 0) {
+    motivos.push(`Categorias sem cobertura por pista essencial: ${listarCategorias(categoriasSemPistaEssencial, puzzle)}.`);
+  }
+  if (!ehTutorial && categoriasNaOrdemDeclarada > LIMIAR_ORDEM_DECLARADA) {
+    motivos.push(`${categoriasNaOrdemDeclarada} categorias seguem a ordem declarada; o máximo permitido é ${LIMIAR_ORDEM_DECLARADA}.`);
   }
 
   return {
@@ -153,6 +298,8 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
     pistasIntracategoria,
     pistasCrossCategory,
     pistasAncora,
+    restricoesIntracategoria,
+    restricoesCrossCategory,
     profundidadeInferencial: {
       porCelula: traco?.porCelula ?? {},
       maxima: traco?.profundidadeMaxima ?? 0,
@@ -164,6 +311,11 @@ export function avaliarEstrutura(puzzle: Puzzle, ehTutorial = false): RelatorioE
     paresPossiveis,
     componentes,
     arestas,
+    grauPorCategoria,
+    pontes,
     categoriasNaOrdemDeclarada,
+    categoriasIsomorfasAoEixo,
+    categoriasResolviveisSozinhas,
+    categoriasSemPistaEssencial,
   };
 }
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index 4b3320e7..a094c2ea 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -12,6 +12,7 @@ export { itensDaPista, itensDaRestricao, validarEstruturaPuzzle } from "./motor"
 export { derivar } from "./derivacao";
 export {
   LIMIAR_ORDEM_DECLARADA,
+  PADROES_SEQUENCIA_EIXO,
   avaliarEstrutura,
 } from "./estrutura";
 export type {
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
(nenhum)
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-fatiaB ==
