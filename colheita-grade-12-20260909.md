== DIFF do lab grade-12 (contra a base do bundle) ==
diff --git a/lib/grade/banco.ts b/lib/grade/banco.ts
index e582f446..429b6a30 100644
--- a/lib/grade/banco.ts
+++ b/lib/grade/banco.ts
@@ -1,7 +1,10 @@
 import { pistaSimples, type Puzzle, type PuzzleMetadata } from "./tipos";
 import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
+import { PROBLEMAS_NIVEL_3 } from "./problemas/nivel3";
+import { PROBLEMAS_NIVEL_4 } from "./problemas/nivel4";
+import { PROBLEMAS_NIVEL_5 } from "./problemas/nivel5";
 
-export { PROBLEMAS_NIVEL_2 };
+export { PROBLEMAS_NIVEL_2, PROBLEMAS_NIVEL_3, PROBLEMAS_NIVEL_4, PROBLEMAS_NIVEL_5 };
 
 function metadata(
   complexity: number,
diff --git a/lib/grade/gerador.test.ts b/lib/grade/gerador.test.ts
index 1328e266..ddff89fc 100644
--- a/lib/grade/gerador.test.ts
+++ b/lib/grade/gerador.test.ts
@@ -1,9 +1,16 @@
 import { describe, expect, it } from "vitest";
 import {
   emitirCodigoTypeScript,
+  fundirExclusoes,
   gerarPuzzles,
+  TODOS_OS_TEMAS,
   TEMAS_NIVEL_2,
+  verificarAmbiguidadeDeReferencia,
+  verificarUsoDeQuem,
 } from "./gerador";
+import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
+import { contarSolucoes } from "./solver";
+import type { TemaGrade } from "./gerador";
 
 describe("gerador de problemas da grade", () => {
   it("é determinístico para a mesma semente", () => {
@@ -22,4 +29,69 @@ describe("gerador de problemas da grade", () => {
     expect(primeira).toBe(segunda);
     expect(primeira).toContain("export const PROBLEMAS_NIVEL_2: Puzzle[]");
   });
+
+  it("rejeita referência com o mesmo molde em duas categorias e aprova os 16 temas", () => {
+    const ambiguo: TemaGrade = {
+      id: "ambiguo",
+      titulo: "Ambíguo",
+      contexto: "Tema usado apenas como contraprova.",
+      rotulosPosicao: ["1", "2"],
+      categorias: [
+        { id: "oficina", label: "Oficina", valores: ["Cerâmica", "Marcenaria"] },
+        { id: "mediador", label: "Mediador", valores: ["Sol", "Zeca"] },
+      ],
+      gramatica: {
+        categorias: {
+          oficina: { animado: false, sujeito: (v) => `A oficina de ${v}`, predicado: (v) => `é a oficina de ${v}`, referencia: (v) => `a oficina de ${v}` },
+          mediador: { animado: true, sujeito: (v) => `A oficina de ${v}`, predicado: (v) => `foi mediada por ${v}`, referencia: (v) => `a oficina de ${v}` },
+        },
+      },
+    };
+    expect(verificarAmbiguidadeDeReferencia(ambiguo)).toMatch(/oficina.*mediador/);
+    for (const tema of TODOS_OS_TEMAS) {
+      expect(verificarAmbiguidadeDeReferencia(tema), tema.id).toBeNull();
+    }
+  });
+
+  it.each(["sujeito", "referencia"] as const)(
+    "rejeita Quem em %s de categoria inanimada",
+    (campo) => {
+      const tema: TemaGrade = {
+        ...TEMAS_NIVEL_2[0],
+        categorias: [{ id: "filme", label: "Filme", valores: ["Aurora", "Bruma"] }],
+        gramatica: {
+          categorias: {
+            filme: {
+              animado: false,
+              sujeito: (valor) => campo === "sujeito" ? `Quem exibiu ${valor}` : `O filme ${valor}`,
+              predicado: (valor) => `é ${valor}`,
+              referencia: (valor) => campo === "referencia" ? `quem exibiu ${valor}` : `o filme ${valor}`,
+            },
+          },
+        },
+      };
+      expect(verificarUsoDeQuem(tema)).toContain("inanimada");
+    }
+  );
+
+  it("a fusão pós-minimização preserva a quantidade de soluções", () => {
+    const base = PROBLEMAS_NIVEL_2.find((puzzle) =>
+      puzzle.pistas.some((pista) => pista.restricoes.length > 1)
+    );
+    expect(base).toBeDefined();
+    if (base === undefined) return;
+    const separadas = base.pistas.flatMap((pista) => pista.restricoes.map((restricao, indice) => ({
+      id: `${pista.id}-separada-${indice + 1}`,
+      texto: pista.texto,
+      restricoes: [{ ...restricao, id: `${pista.id}-separada-${indice + 1}#1` }],
+    })));
+    const tema = TEMAS_NIVEL_2.find(({ id }) => id === base.id);
+    expect(tema).toBeDefined();
+    if (tema === undefined) return;
+    const fundidas = fundirExclusoes(separadas, tema.gramatica);
+    expect(fundidas.length).toBeLessThan(separadas.length);
+    expect(contarSolucoes({ ...base, pistas: separadas }, 2)).toBe(
+      contarSolucoes({ ...base, pistas: fundidas }, 2)
+    );
+  });
 });
diff --git a/lib/grade/gerador.ts b/lib/grade/gerador.ts
index 3815096a..a40c1bff 100644
--- a/lib/grade/gerador.ts
+++ b/lib/grade/gerador.ts
@@ -1,6 +1,7 @@
 import { avaliarEstrutura } from "./estrutura";
 import {
   textoDaPistaComposta,
+  textoDasExclusoes,
   textoDaRestricao,
   verificarTextoPista,
   type GramaticaTema,
@@ -24,12 +25,14 @@ export interface TemaGrade {
   rotulosPosicao: readonly string[];
   categorias: readonly Categoria[];
   gramatica: GramaticaTema;
+  nivel?: 2 | 3 | 4 | 5;
 }
 
 export interface ResultadoGeracao {
   seed: string;
   puzzles: Puzzle[];
   tentativas: Record<string, number>;
+  fusoes: Record<string, number>;
 }
 
 interface Candidata {
@@ -45,6 +48,7 @@ type RestricaoSemId<T extends Restricao = Restricao> = T extends unknown
 type Aleatorio = () => number;
 
 const gramaticaPessoa = {
+  animado: true,
   sujeito: (valor: string) => valor,
   predicado: (valor: string) => `é ${valor}`,
   referencia: (valor: string) => valor,
@@ -65,21 +69,23 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
       categorias: {
         paciente: gramaticaPessoa,
         especialidade: {
-          sujeito: (valor) => `Quem foi à ${valor}`,
+          animado: false,
+          sujeito: (valor) => `A pessoa que foi à ${valor}`,
           predicado: (valor) => `foi à ${valor}`,
-          referencia: (valor) => `quem foi à ${valor}`,
+          referencia: (valor) => `a pessoa que foi à ${valor}`,
         },
         sala: {
-          sujeito: (valor) => `Quem usou a sala ${valor}`,
+          animado: false,
+          sujeito: (valor) => `A pessoa que usou a sala ${valor}`,
           predicado: (valor) => `usou a sala ${valor}`,
-          referencia: (valor) => `quem usou a sala ${valor}`,
+          referencia: (valor) => `a pessoa que usou a sala ${valor}`,
         },
       },
       ordem: {
-        antesDe: "foi atendido antes de",
-        imediatamenteAntesDe: "foi atendido imediatamente antes de",
-        vizinhas: "foram atendidos em horários vizinhos",
-        entre: "foi atendido entre",
+        antesDe: "teve consulta antes de",
+        imediatamenteAntesDe: "teve consulta imediatamente antes de",
+        vizinhas: "tiveram consultas em horários vizinhos",
+        entre: "teve consulta entre",
       },
     },
   },
@@ -97,14 +103,16 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
       categorias: {
         barista: gramaticaPessoa,
         preparo: {
-          sujeito: (valor) => `Quem preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
+          animado: false,
+          sujeito: (valor) => `O barista que preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
           predicado: (valor) => `preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
-          referencia: (valor) => `quem preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
+          referencia: (valor) => `o barista que preparou ${valor === "Prensa" ? "a" : "o"} ${valor}`,
         },
         posto: {
-          sujeito: (valor) => `Quem ficou no ${valor}`,
+          animado: false,
+          sujeito: (valor) => `O barista do posto ${valor}`,
           predicado: (valor) => `ficou no ${valor}`,
-          referencia: (valor) => `quem ficou no ${valor}`,
+          referencia: (valor) => `o barista do posto ${valor}`,
         },
       },
       ordem: {
@@ -127,14 +135,21 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
     ],
     gramatica: {
       categorias: {
-        filme: gramaticaPessoa,
+        filme: {
+          animado: false,
+          sujeito: (valor) => valor,
+          predicado: (valor) => `é ${valor}`,
+          referencia: (valor) => valor,
+        },
         curador: {
+          animado: true,
           // "Quem foi apresentado por Ciro" trataria um FILME como pessoa.
           sujeito: (valor) => `O filme apresentado por ${valor}`,
           predicado: (valor) => `foi apresentado por ${valor}`,
           referencia: (valor) => `o filme apresentado por ${valor}`,
         },
         genero: {
+          animado: false,
           sujeito: (valor) => `O ${valor}`,
           predicado: (valor) => `é um ${valor}`,
           referencia: (valor) => `o ${valor}`,
@@ -161,11 +176,13 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
     gramatica: {
       categorias: {
         oficina: {
+          animado: false,
           sujeito: (valor) => `A oficina de ${valor}`,
           predicado: (valor) => `é a oficina de ${valor}`,
           referencia: (valor) => `a oficina de ${valor}`,
         },
         mediador: {
+          animado: true,
           // "a oficina de Sol" colidia com "a oficina de Marcenaria": mesma forma para o
           // mediador e para o nome da oficina. O paciente não tem como saber qual é qual.
           sujeito: (valor) => `A oficina mediada por ${valor}`,
@@ -173,6 +190,7 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
           referencia: (valor) => `a oficina mediada por ${valor}`,
         },
         espaco: {
+          animado: false,
           sujeito: (valor) => `A oficina que ocupou o ${valor}`,
           predicado: (valor) => `ocupou o ${valor}`,
           referencia: (valor) => `a oficina que ocupou o ${valor}`,
@@ -188,6 +206,646 @@ export const TEMAS_NIVEL_2: readonly TemaGrade[] = [
   },
 ];
 
+export const TEMAS_NIVEL_3: readonly TemaGrade[] = [
+  {
+    id: "consultorio-odontologico",
+    titulo: "Consultório odontológico",
+    contexto: "Quatro consultas odontológicas aconteceram pela manhã. Organize pacientes, procedimentos, convênios e dentistas.",
+    nivel: 3,
+    rotulosPosicao: ["8h", "9h", "10h", "11h"],
+    categorias: [
+      { id: "paciente", label: "Paciente", valores: ["Bento", "Célia", "Márcio", "Tereza"] },
+      { id: "procedimento", label: "Procedimento", valores: ["Canal", "Clareamento", "Extração", "Limpeza"] },
+      { id: "convenio", label: "Convênio", valores: ["Aurora", "Bemviver", "Consalud", "Vitalis"] },
+      { id: "dentista", label: "Dentista", valores: ["Dr. Elias", "Dra. Norma", "Dr. Paulo", "Dra. Sônia"] },
+    ],
+    gramatica: {
+      categorias: {
+        paciente: {
+          animado: true,
+          sujeito: (valor) => `A consulta de ${valor}`,
+          predicado: (valor) => `foi de ${valor}`,
+          referencia: (valor) => `a consulta de ${valor}`,
+        },
+        procedimento: {
+          animado: false,
+          sujeito: (valor) => `A consulta com o procedimento ${valor}`,
+          predicado: (valor) => `incluiu o procedimento ${valor}`,
+          referencia: (valor) => `a consulta com o procedimento ${valor}`,
+        },
+        convenio: {
+          animado: false,
+          sujeito: (valor) => `A consulta pelo convênio ${valor}`,
+          predicado: (valor) => `usou o convênio ${valor}`,
+          referencia: (valor) => `a consulta pelo convênio ${valor}`,
+        },
+        dentista: {
+          animado: true,
+          sujeito: (valor) => `A consulta conduzida por ${valor}`,
+          predicado: (valor) => `foi conduzida por ${valor}`,
+          referencia: (valor) => `a consulta conduzida por ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "aconteceu antes de",
+        imediatamenteAntesDe: "aconteceu imediatamente antes de",
+        vizinhas: "aconteceram em horários vizinhos",
+        entre: "aconteceu entre",
+      },
+    },
+  },
+  {
+    id: "estandes-feira-livro",
+    titulo: "Estandes da feira do livro",
+    contexto: "Quatro editoras ocuparam estandes diferentes. Organize editoras, gêneros, países e cores.",
+    nivel: 3,
+    rotulosPosicao: ["Estande 1", "Estande 2", "Estande 3", "Estande 4"],
+    categorias: [
+      { id: "editora", label: "Editora", valores: ["Alaúde", "Bordô", "Chama", "Duna"] },
+      { id: "genero", label: "Gênero", valores: ["Ensaio", "Infantil", "Poesia", "Romance"] },
+      { id: "pais", label: "País", valores: ["Chile", "Egito", "Irlanda", "Japão"] },
+      { id: "cor", label: "Cor", valores: ["Azul", "Ocre", "Rubi", "Verde"] },
+    ],
+    gramatica: {
+      categorias: {
+        editora: {
+          animado: false,
+          sujeito: (valor) => `A editora ${valor}`,
+          predicado: (valor) => `é a editora ${valor}`,
+          referencia: (valor) => `a editora ${valor}`,
+        },
+        genero: {
+          animado: false,
+          sujeito: (valor) => `A editora do gênero ${valor}`,
+          predicado: (valor) => `publicou o gênero ${valor}`,
+          referencia: (valor) => `a editora do gênero ${valor}`,
+        },
+        pais: {
+          animado: false,
+          sujeito: (valor) => `A editora do país ${valor}`,
+          predicado: (valor) => `representou o país ${valor}`,
+          referencia: (valor) => `a editora do país ${valor}`,
+        },
+        cor: {
+          animado: false,
+          sujeito: (valor) => `A editora do estande ${valor}`,
+          predicado: (valor) => `ficou no estande ${valor}`,
+          referencia: (valor) => `a editora do estande ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "ficou antes de",
+        imediatamenteAntesDe: "ficou imediatamente antes de",
+        vizinhas: "ficaram em estandes vizinhos",
+        entre: "ficou entre",
+      },
+    },
+  },
+  {
+    id: "consultas-nutricao",
+    titulo: "Consultas de nutrição",
+    contexto: "Quatro clientes vieram em dias diferentes. Organize clientes, objetivos, planos e bairros.",
+    nivel: 3,
+    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta"],
+    categorias: [
+      { id: "cliente", label: "Cliente", valores: ["Alan", "Diva", "Rute", "Vitor"] },
+      { id: "objetivo", label: "Objetivo", valores: ["Desempenho", "Digestão", "Energia", "Sono"] },
+      { id: "plano", label: "Plano", valores: ["Bronze", "Prata", "Ouro", "Platina"] },
+      { id: "bairro", label: "Bairro", valores: ["Alvorada", "Boa Vista", "Cruzeiro", "Laranjeiras"] },
+    ],
+    gramatica: {
+      categorias: {
+        cliente: gramaticaPessoa,
+        objetivo: {
+          animado: false,
+          sujeito: (valor) => `O cliente com objetivo de ${valor}`,
+          predicado: (valor) => `buscou ${valor}`,
+          referencia: (valor) => `o cliente com objetivo de ${valor}`,
+        },
+        plano: {
+          animado: false,
+          sujeito: (valor) => `O cliente do plano ${valor}`,
+          predicado: (valor) => `usou o plano ${valor}`,
+          referencia: (valor) => `o cliente do plano ${valor}`,
+        },
+        bairro: {
+          animado: false,
+          sujeito: (valor) => `O cliente do bairro ${valor}`,
+          predicado: (valor) => `veio do bairro ${valor}`,
+          referencia: (valor) => `o cliente do bairro ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "veio antes de",
+        imediatamenteAntesDe: "veio imediatamente antes de",
+        vizinhas: "vieram em dias vizinhos",
+        entre: "veio entre",
+      },
+    },
+  },
+  {
+    id: "ensaios-orquestra",
+    titulo: "Ensaios da orquestra",
+    contexto: "Quatro naipes ensaiaram em horários diferentes. Organize naipes, regentes, peças e salas.",
+    nivel: 3,
+    rotulosPosicao: ["9h", "11h", "14h", "16h"],
+    categorias: [
+      { id: "naipe", label: "Naipe", valores: ["Cordas", "Madeiras", "Metais", "Percussão"] },
+      { id: "regente", label: "Regente", valores: ["Ana Lúcia", "Fábio", "Marta", "Sérgio"] },
+      { id: "peca", label: "Peça", valores: ["Alvorada", "Barcarola", "Cortejo", "Devaneio"] },
+      { id: "sala", label: "Sala", valores: ["Anexo", "Concha", "Estúdio", "Foyer"] },
+    ],
+    gramatica: {
+      categorias: {
+        naipe: {
+          animado: false,
+          sujeito: (valor) => `O naipe de ${valor}`,
+          predicado: (valor) => `é o naipe de ${valor}`,
+          referencia: (valor) => `o naipe de ${valor}`,
+        },
+        regente: {
+          animado: true,
+          sujeito: (valor) => `O naipe regido por ${valor}`,
+          predicado: (valor) => `foi regido por ${valor}`,
+          referencia: (valor) => `o naipe regido por ${valor}`,
+        },
+        peca: {
+          animado: false,
+          sujeito: (valor) => `O naipe que tocou ${valor}`,
+          predicado: (valor) => `tocou ${valor}`,
+          referencia: (valor) => `o naipe que tocou ${valor}`,
+        },
+        sala: {
+          animado: false,
+          sujeito: (valor) => `O naipe da sala ${valor}`,
+          predicado: (valor) => `ensaiou ${["Concha"].includes(valor) ? "na" : "no"} ${valor}`,
+          referencia: (valor) => `o naipe da sala ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "ensaiou antes de",
+        imediatamenteAntesDe: "ensaiou imediatamente antes de",
+        vizinhas: "ensaiaram em horários vizinhos",
+        entre: "ensaiou entre",
+      },
+    },
+  },
+];
+
+export const TEMAS_NIVEL_4: readonly TemaGrade[] = [
+  {
+    id: "atendimentos-fisioterapia",
+    titulo: "Atendimentos da fisioterapia",
+    contexto: "Cinco atendimentos de fisioterapia aconteceram pela manhã. Organize pacientes, regiões, recursos e fisioterapeutas.",
+    nivel: 4,
+    rotulosPosicao: ["7h", "8h", "9h", "10h", "11h"],
+    categorias: [
+      { id: "paciente", label: "Paciente", valores: ["Aline", "Caio", "Elza", "Nuno", "Wilma"] },
+      { id: "regiao", label: "Região", valores: ["Coluna", "Joelho", "Ombro", "Punho", "Tornozelo"] },
+      { id: "recurso", label: "Recurso", valores: ["Bola", "Elástico", "Esteira", "Halteres", "Prancha"] },
+      { id: "fisioterapeuta", label: "Fisioterapeuta", valores: ["Dr. Ivo", "Dra. Lúcia", "Dr. Nei", "Dra. Olga", "Dra. Rita"] },
+    ],
+    gramatica: {
+      categorias: {
+        paciente: {
+          animado: true,
+          sujeito: (valor) => `O atendimento de ${valor}`,
+          predicado: (valor) => `foi de ${valor}`,
+          referencia: (valor) => `o atendimento de ${valor}`,
+        },
+        regiao: {
+          animado: false,
+          sujeito: (valor) => `O atendimento da região ${valor}`,
+          predicado: (valor) => `tratou a região ${valor}`,
+          referencia: (valor) => `o atendimento da região ${valor}`,
+        },
+        recurso: {
+          animado: false,
+          sujeito: (valor) => `O atendimento com ${valor}`,
+          predicado: (valor) => `usou ${valor}`,
+          referencia: (valor) => `o atendimento com ${valor}`,
+        },
+        fisioterapeuta: {
+          animado: true,
+          sujeito: (valor) => `O atendimento conduzido por ${valor}`,
+          predicado: (valor) => `foi conduzido por ${valor}`,
+          referencia: (valor) => `o atendimento conduzido por ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "aconteceu antes de",
+        imediatamenteAntesDe: "aconteceu imediatamente antes de",
+        vizinhas: "aconteceram em horários vizinhos",
+        entre: "aconteceu entre",
+      },
+    },
+  },
+  {
+    id: "turnos-recepcao",
+    titulo: "Turnos da recepção",
+    contexto: "Cinco recepcionistas trabalharam em dias diferentes. Organize recepcionistas, tarefas, andares e uniformes.",
+    nivel: 4,
+    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
+    categorias: [
+      { id: "recepcionista", label: "Recepcionista", valores: ["Bia", "Douglas", "Kátia", "Márcio", "Zilda"] },
+      { id: "tarefa", label: "Tarefa", valores: ["Agendamentos", "Arquivo", "Cobrança", "Ligações", "Triagem"] },
+      { id: "andar", label: "Andar", valores: ["Cobertura", "Mezanino", "Subsolo", "Térreo", "Sobreloja"] },
+      { id: "uniforme", label: "Uniforme", valores: ["Areia", "Grafite", "Marinho", "Musgo", "Vinho"] },
+    ],
+    gramatica: {
+      categorias: {
+        recepcionista: gramaticaPessoa,
+        tarefa: {
+          animado: false,
+          sujeito: (valor) => `A recepcionista responsável por ${valor}`,
+          predicado: (valor) => `cuidou de ${valor}`,
+          referencia: (valor) => `a recepcionista responsável por ${valor}`,
+        },
+        andar: {
+          animado: false,
+          sujeito: (valor) => `A recepcionista do andar ${valor}`,
+          predicado: (valor) => `trabalhou ${["Cobertura", "Sobreloja"].includes(valor) ? "na" : "no"} ${valor}`,
+          referencia: (valor) => `a recepcionista do andar ${valor}`,
+        },
+        uniforme: {
+          animado: false,
+          sujeito: (valor) => `A recepcionista de uniforme ${valor}`,
+          predicado: (valor) => `usou o uniforme ${valor}`,
+          referencia: (valor) => `a recepcionista de uniforme ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "trabalhou antes de",
+        imediatamenteAntesDe: "trabalhou imediatamente antes de",
+        vizinhas: "trabalharam em dias vizinhos",
+        entre: "trabalhou entre",
+      },
+    },
+  },
+  {
+    id: "palestras-congresso",
+    titulo: "Palestras do congresso",
+    contexto: "Cinco palestrantes participaram do congresso. Organize palestrantes, temas, formatos e auditórios.",
+    nivel: 4,
+    rotulosPosicao: ["9h", "10h30", "13h", "14h30", "16h"],
+    categorias: [
+      { id: "palestrante", label: "Palestrante", valores: ["Aurora", "Ícaro", "Solange", "Teodoro", "Yara"] },
+      { id: "tema", label: "Tema", valores: ["Ansiedade", "Linguagem", "Memória", "Sono", "Vínculos"] },
+      { id: "formato", label: "Formato", valores: ["Debate", "Mesa", "Oficina", "Painel", "Roda"] },
+      { id: "auditorio", label: "Auditório", valores: ["Bosque", "Cristal", "Lagoa", "Pedra", "Vento"] },
+    ],
+    gramatica: {
+      categorias: {
+        palestrante: gramaticaPessoa,
+        tema: {
+          animado: false,
+          sujeito: (valor) => `O palestrante do tema ${valor}`,
+          predicado: (valor) => `abordou ${valor}`,
+          referencia: (valor) => `o palestrante do tema ${valor}`,
+        },
+        formato: {
+          animado: false,
+          sujeito: (valor) => `O palestrante do formato ${valor}`,
+          predicado: (valor) => `participou ${["Mesa", "Oficina", "Roda"].includes(valor) ? "da" : "do"} ${valor}`,
+          referencia: (valor) => `o palestrante do formato ${valor}`,
+        },
+        auditorio: {
+          animado: false,
+          sujeito: (valor) => `O palestrante do auditório ${valor}`,
+          predicado: (valor) => `usou o auditório ${valor}`,
+          referencia: (valor) => `o palestrante do auditório ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "palestrou antes de",
+        imediatamenteAntesDe: "palestrou imediatamente antes de",
+        vizinhas: "palestraram em horários vizinhos",
+        entre: "palestrou entre",
+      },
+    },
+  },
+  {
+    id: "colheita-horta-comunitaria",
+    titulo: "Colheita da horta comunitária",
+    contexto: "Cinco equipes fizeram colheitas em semanas diferentes. Organize hortas, cultivos, responsáveis e destinos.",
+    nivel: 4,
+    rotulosPosicao: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
+    categorias: [
+      { id: "horta", label: "Horta", valores: ["Beira-Rio", "Encosta", "Morro", "Pomar", "Várzea"] },
+      { id: "cultivo", label: "Cultivo", valores: ["Abóbora", "Alface", "Cenoura", "Quiabo", "Rúcula"] },
+      { id: "responsavel", label: "Responsável", valores: ["Efigênia", "Joel", "Nadir", "Sebastião", "Vânia"] },
+      { id: "destino", label: "Destino", valores: ["Creche", "Escola", "Feira", "Hospital", "Mercado"] },
+    ],
+    gramatica: {
+      categorias: {
+        horta: {
+          animado: false,
+          sujeito: (valor) => `A equipe da horta ${valor}`,
+          predicado: (valor) => `fez a colheita na horta ${valor}`,
+          referencia: (valor) => `a equipe da horta ${valor}`,
+        },
+        cultivo: {
+          animado: false,
+          sujeito: (valor) => `A equipe do cultivo ${valor}`,
+          predicado: (valor) => `colheu ${valor}`,
+          referencia: (valor) => `a equipe do cultivo ${valor}`,
+        },
+        responsavel: {
+          animado: true,
+          sujeito: (valor) => `A equipe liderada por ${valor}`,
+          predicado: (valor) => `foi liderada por ${valor}`,
+          referencia: (valor) => `a equipe liderada por ${valor}`,
+        },
+        destino: {
+          animado: false,
+          sujeito: (valor) => `A equipe do destino ${valor}`,
+          predicado: (valor) => `entregou ao destino ${valor}`,
+          referencia: (valor) => `a equipe do destino ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "colheu antes de",
+        imediatamenteAntesDe: "colheu imediatamente antes de",
+        vizinhas: "colheram em semanas vizinhas",
+        entre: "colheu entre",
+      },
+    },
+  },
+];
+
+export const TEMAS_NIVEL_5: readonly TemaGrade[] = [
+  {
+    id: "plantao-pronto-socorro",
+    titulo: "Plantão do pronto-socorro",
+    contexto: "Cinco médicos atenderam durante o plantão. Organize médicos, queixas, exames, leitos e encaminhamentos.",
+    nivel: 5,
+    rotulosPosicao: ["18h", "20h", "22h", "0h", "2h"],
+    categorias: [
+      { id: "medico", label: "Médico", valores: ["Dr. Aldo", "Dra. Bruna", "Dr. Cássio", "Dra. Dora", "Dr. Elmo"] },
+      { id: "queixa", label: "Queixa", valores: ["Cefaleia", "Fratura", "Náusea", "Tontura", "Tosse"] },
+      { id: "exame", label: "Exame", valores: ["Ecografia", "Eletro", "Raio-X", "Sangue", "Urina"] },
+      { id: "leito", label: "Leito", valores: ["Amarelo", "Branco", "Cinza", "Laranja", "Roxo"] },
+      { id: "encaminhamento", label: "Encaminhamento", valores: ["Alta", "Cirurgia", "Internação", "Observação", "Retorno"] },
+    ],
+    gramatica: {
+      categorias: {
+        medico: gramaticaPessoa,
+        queixa: {
+          animado: false,
+          sujeito: (valor) => `O médico da queixa ${valor}`,
+          predicado: (valor) => `atendeu a queixa ${valor}`,
+          referencia: (valor) => `o médico da queixa ${valor}`,
+        },
+        exame: {
+          animado: false,
+          sujeito: (valor) => `O médico do exame ${valor}`,
+          predicado: (valor) => `solicitou o exame ${valor}`,
+          referencia: (valor) => `o médico do exame ${valor}`,
+        },
+        leito: {
+          animado: false,
+          sujeito: (valor) => `O médico do leito ${valor}`,
+          predicado: (valor) => `usou o leito ${valor}`,
+          referencia: (valor) => `o médico do leito ${valor}`,
+        },
+        encaminhamento: {
+          animado: false,
+          sujeito: (valor) => `O médico do encaminhamento ${valor}`,
+          predicado: (valor) => `definiu ${valor} como encaminhamento`,
+          referencia: (valor) => `o médico do encaminhamento ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "atendeu antes de",
+        imediatamenteAntesDe: "atendeu imediatamente antes de",
+        vizinhas: "atenderam em horários vizinhos",
+        entre: "atendeu entre",
+      },
+    },
+  },
+  {
+    id: "semana-restaurante",
+    titulo: "Semana do restaurante",
+    contexto: "Cinco pratos foram servidos em dias diferentes. Organize pratos, chefs, acompanhamentos, sobremesas e salas.",
+    nivel: 5,
+    rotulosPosicao: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
+    categorias: [
+      { id: "prato", label: "Prato", valores: ["Bobó", "Escondidinho", "Moqueca", "Risoto", "Vatapá"] },
+      { id: "chef", label: "Chef", valores: ["Aparecida", "Dionísio", "Genoveva", "Leandro", "Otávio"] },
+      { id: "acompanhamento", label: "Acompanhamento", valores: ["Chuchu", "Farofa", "Pirão", "Salada", "Vinagrete"] },
+      { id: "sobremesa", label: "Sobremesa", valores: ["Cocada", "Manjar", "Pavê", "Pudim", "Quindim"] },
+      { id: "sala", label: "Sala", valores: ["Adega", "Jardim", "Mezanino", "Terraço", "Varanda"] },
+    ],
+    gramatica: {
+      categorias: {
+        prato: {
+          animado: false,
+          sujeito: (valor) => `O prato ${valor}`,
+          predicado: (valor) => `foi o prato ${valor}`,
+          referencia: (valor) => `o prato ${valor}`,
+        },
+        chef: {
+          animado: true,
+          sujeito: (valor) => `O prato preparado por ${valor}`,
+          predicado: (valor) => `foi preparado por ${valor}`,
+          referencia: (valor) => `o prato preparado por ${valor}`,
+        },
+        acompanhamento: {
+          animado: false,
+          sujeito: (valor) => `O prato com ${valor}`,
+          predicado: (valor) => `teve ${valor} como acompanhamento`,
+          referencia: (valor) => `o prato com ${valor}`,
+        },
+        sobremesa: {
+          animado: false,
+          sujeito: (valor) => `O prato da sobremesa ${valor}`,
+          predicado: (valor) => `teve ${valor} como sobremesa`,
+          referencia: (valor) => `o prato da sobremesa ${valor}`,
+        },
+        sala: {
+          animado: false,
+          sujeito: (valor) => `O prato da sala ${valor}`,
+          predicado: (valor) => `foi servido ${["Adega", "Varanda"].includes(valor) ? "na" : "no"} ${valor}`,
+          referencia: (valor) => `o prato da sala ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "foi servido antes de",
+        imediatamenteAntesDe: "foi servido imediatamente antes de",
+        vizinhas: "foram servidos em dias vizinhos",
+        entre: "foi servido entre",
+      },
+    },
+  },
+  {
+    id: "trilhas-parque",
+    titulo: "Trilhas do parque",
+    contexto: "Cinco guias conduziram trilhas diferentes. Organize guias, biomas, durações, atrativos e níveis.",
+    nivel: 5,
+    rotulosPosicao: ["Trilha 1", "Trilha 2", "Trilha 3", "Trilha 4", "Trilha 5"],
+    categorias: [
+      { id: "guia", label: "Guia", valores: ["Benedita", "Firmino", "Iolanda", "Ubirajara", "Zulmira"] },
+      { id: "bioma", label: "Bioma", valores: ["Campo", "Cerrado", "Mangue", "Mata", "Restinga"] },
+      { id: "duracao", label: "Duração", valores: ["Curta", "Média", "Longa", "Extensa", "Integral"] },
+      { id: "atrativo", label: "Atrativo", valores: ["Cachoeira", "Gruta", "Lago", "Mirante", "Ruína"] },
+      { id: "nivel", label: "Nível", valores: ["Fácil", "Leve", "Moderado", "Difícil", "Severo"] },
+    ],
+    gramatica: {
+      categorias: {
+        guia: gramaticaPessoa,
+        bioma: {
+          animado: false,
+          sujeito: (valor) => `O guia do bioma ${valor}`,
+          predicado: (valor) => `guiou no bioma ${valor}`,
+          referencia: (valor) => `o guia do bioma ${valor}`,
+        },
+        duracao: {
+          animado: false,
+          sujeito: (valor) => `O guia da trilha com duração ${valor}`,
+          predicado: (valor) => `guiou a trilha com duração ${valor}`,
+          referencia: (valor) => `o guia da trilha com duração ${valor}`,
+        },
+        atrativo: {
+          animado: false,
+          sujeito: (valor) => `O guia do atrativo ${valor}`,
+          predicado: (valor) => `visitou o atrativo ${valor}`,
+          referencia: (valor) => `o guia do atrativo ${valor}`,
+        },
+        nivel: {
+          animado: false,
+          sujeito: (valor) => `O guia do nível ${valor}`,
+          predicado: (valor) => `conduziu a trilha de nível ${valor}`,
+          referencia: (valor) => `o guia do nível ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "guiou antes de",
+        imediatamenteAntesDe: "guiou imediatamente antes de",
+        vizinhas: "guiaram trilhas vizinhas",
+        entre: "guiou entre",
+      },
+    },
+  },
+  {
+    id: "exposicao-museu",
+    titulo: "Exposição do museu",
+    contexto: "Cinco obras foram expostas em salas diferentes. Organize obras, artistas, técnicas, décadas e doadores.",
+    nivel: 5,
+    rotulosPosicao: ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"],
+    categorias: [
+      { id: "obra", label: "Obra", valores: ["Aurora", "Clepsidra", "Estuário", "Ninho", "Vertigem"] },
+      { id: "artista", label: "Artista", valores: ["Anísio", "Gilda", "Hermínia", "Rodolfo", "Wanda"] },
+      { id: "tecnica", label: "Técnica", valores: ["Aquarela", "Bronze", "Gravura", "Óleo", "Têxtil"] },
+      { id: "decada", label: "Década", valores: ["Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"] },
+      { id: "doador", label: "Doador", valores: ["Almeida", "Barroso", "Camargo", "Dutra", "Esteves"] },
+    ],
+    gramatica: {
+      categorias: {
+        obra: {
+          animado: false,
+          sujeito: (valor) => `A obra ${valor}`,
+          predicado: (valor) => `é a obra ${valor}`,
+          referencia: (valor) => `a obra ${valor}`,
+        },
+        artista: {
+          animado: true,
+          sujeito: (valor) => `A obra de ${valor}`,
+          predicado: (valor) => `é de ${valor}`,
+          referencia: (valor) => `a obra de ${valor}`,
+        },
+        tecnica: {
+          animado: false,
+          sujeito: (valor) => `A obra em ${valor}`,
+          predicado: (valor) => `foi feita em ${valor}`,
+          referencia: (valor) => `a obra em ${valor}`,
+        },
+        decada: {
+          animado: false,
+          sujeito: (valor) => `A obra dos anos ${valor}`,
+          predicado: (valor) => `é dos anos ${valor}`,
+          referencia: (valor) => `a obra dos anos ${valor}`,
+        },
+        doador: {
+          animado: false,
+          sujeito: (valor) => `A obra doada por ${valor}`,
+          predicado: (valor) => `foi doada por ${valor}`,
+          referencia: (valor) => `a obra doada por ${valor}`,
+        },
+      },
+      ordem: {
+        antesDe: "foi exposta antes de",
+        imediatamenteAntesDe: "foi exposta imediatamente antes de",
+        vizinhas: "foram expostas em salas vizinhas",
+        entre: "foi exposta entre",
+      },
+    },
+  },
+];
+
+export const TODOS_OS_TEMAS: readonly TemaGrade[] = [
+  ...TEMAS_NIVEL_2,
+  ...TEMAS_NIVEL_3,
+  ...TEMAS_NIVEL_4,
+  ...TEMAS_NIVEL_5,
+];
+
+function moldeDeReferencia(referencia: string, valor: string): string {
+  return referencia
+    .split(valor)
+    .join("{valor}")
+    .replace(/\s+/g, " ")
+    .trim()
+    .toLocaleLowerCase("pt-BR");
+}
+
+/** Retorna a ambiguidade encontrada ou `null` quando os moldes são distintos. */
+export function verificarAmbiguidadeDeReferencia(tema: TemaGrade): string | null {
+  const moldesPorCategoria = tema.categorias.map((categoria) => {
+    const gramatica = tema.gramatica.categorias[categoria.id];
+    if (gramatica === undefined) {
+      return { categoria, moldes: new Set<string>() };
+    }
+    return {
+      categoria,
+      moldes: new Set(categoria.valores.map((valor) =>
+        moldeDeReferencia(gramatica.referencia(valor), valor)
+      )),
+    };
+  });
+
+  for (let a = 0; a < moldesPorCategoria.length; a += 1) {
+    for (let b = a + 1; b < moldesPorCategoria.length; b += 1) {
+      const primeira = moldesPorCategoria[a];
+      const segunda = moldesPorCategoria[b];
+      const moldeRepetido = [...primeira.moldes].find((molde) => segunda.moldes.has(molde));
+      if (moldeRepetido !== undefined) {
+        return `As categorias "${primeira.categoria.id}" e "${segunda.categoria.id}" usam o mesmo molde de referência: ${moldeRepetido}.`;
+      }
+    }
+  }
+  return null;
+}
+
+/** Retorna o uso indevido de "Quem" ou `null` quando a animação está coerente. */
+export function verificarUsoDeQuem(tema: TemaGrade): string | null {
+  for (const categoria of tema.categorias) {
+    const gramatica = tema.gramatica.categorias[categoria.id];
+    if (gramatica === undefined) {
+      return `Não há gramática para a categoria "${categoria.id}".`;
+    }
+    if (gramatica.animado) continue;
+    for (const valor of categoria.valores) {
+      if (/^quem\b/i.test(gramatica.sujeito(valor).trim())) {
+        return `O sujeito da categoria inanimada "${categoria.id}" começa com "Quem".`;
+      }
+      if (/^quem\b/i.test(gramatica.referencia(valor).trim())) {
+        return `A referência da categoria inanimada "${categoria.id}" começa com "Quem".`;
+      }
+    }
+  }
+  return null;
+}
+
 function hashSeed(seed: string): number {
   let hash = 2166136261;
   for (let indice = 0; indice < seed.length; indice += 1) {
@@ -385,14 +1043,74 @@ function materializarPistas(candidatas: readonly Candidata[], prefixo: string):
   });
 }
 
-function metadataInicial(): PuzzleMetadata {
+function chaveSujeitoDeExclusao(pista: Pista): string | null {
+  if (pista.restricoes.length === 0 || pista.restricoes.some((restricao) => restricao.tipo !== "T2")) {
+    return null;
+  }
+  const [primeira] = pista.restricoes;
+  if (primeira.tipo !== "T2") return null;
+  return pista.restricoes.every((restricao) =>
+    restricao.tipo === "T2"
+    && restricao.itemA.categoria === primeira.itemA.categoria
+    && restricao.itemA.valor === primeira.itemA.valor
+  ) ? chaveItem(primeira.itemA) : null;
+}
+
+/** Funde, sem mudar a lógica, as pistas de exclusão que têm o mesmo sujeito. */
+export function fundirExclusoes(
+  pistas: readonly Pista[],
+  gramatica: GramaticaTema
+): Pista[] {
+  const grupos = new Map<string, Pista[]>();
+  for (const pista of pistas) {
+    const chave = chaveSujeitoDeExclusao(pista);
+    if (chave === null) continue;
+    const grupo = grupos.get(chave) ?? [];
+    grupo.push(pista);
+    grupos.set(chave, grupo);
+  }
+
+  const emitidos = new Set<string>();
+  return pistas.flatMap((pista) => {
+    const chave = chaveSujeitoDeExclusao(pista);
+    if (chave === null) return [pista];
+    if (emitidos.has(chave)) return [];
+    emitidos.add(chave);
+    const grupo = grupos.get(chave) ?? [pista];
+    if (grupo.length === 1) return [pista];
+
+    const unicas = new Map<string, Restricao>();
+    for (const restricao of grupo.flatMap((item) => item.restricoes)) {
+      if (restricao.tipo !== "T2") continue;
+      unicas.set(chaveItem(restricao.itemB), restricao);
+    }
+    const restricoes = [...unicas.values()].map((restricao, indice) => ({
+      ...restricao,
+      id: `${pista.id}#${indice + 1}`,
+    }));
+    if (restricoes.length === 1) {
+      return [{
+        ...pista,
+        texto: textoDaRestricao(restricoes[0], gramatica, []),
+        restricoes,
+      }];
+    }
+    return [{
+      ...pista,
+      texto: textoDasExclusoes(restricoes, gramatica),
+      restricoes,
+    }];
+  });
+}
+
+function metadataInicial(nivel: Puzzle["nivel"]): PuzzleMetadata {
   return {
     complexity: 2,
     inferenceDepthDistribution: {},
     skillWeights: {},
     dominantOperations: [],
     clueTypeDistribution: {},
-    expectedDifficulty: 2,
+    expectedDifficulty: nivel,
     validatedUniqueSolution: true,
   };
 }
@@ -422,25 +1140,25 @@ function completarMetadata(puzzle: Puzzle): PuzzleMetadata {
     },
     dominantOperations: dominantes,
     clueTypeDistribution: distribuicao,
-    expectedDifficulty: 2,
+    expectedDifficulty: puzzle.nivel,
     validatedUniqueSolution: true,
   };
 }
 
-function gerarTentativa(tema: TemaGrade, seed: string): Puzzle {
+function gerarTentativa(tema: TemaGrade, seed: string): { puzzle: Puzzle; fusoes: number } {
   const aleatorio = criarAleatorio(seed);
   const { categorias, solucao } = montarCategoriasESolucao(tema, aleatorio);
   const base: Puzzle = {
     id: tema.id,
     titulo: tema.titulo,
     contexto: tema.contexto,
-    nivel: 2,
-    posicoes: 4,
+    nivel: tema.nivel ?? 2,
+    posicoes: tema.rotulosPosicao.length,
     rotulosPosicao: [...tema.rotulosPosicao],
     categorias,
     pistas: [],
     solucao,
-    metadata: metadataInicial(),
+    metadata: metadataInicial(tema.nivel ?? 2),
   };
   const ordenadas = criarPool(tema, base)
     .map((candidata) => ({
@@ -466,8 +1184,16 @@ function gerarTentativa(tema: TemaGrade, seed: string): Puzzle {
     if (contarSolucoes(base, 2) === 1) selecionadas = semCandidata;
   }
   base.pistas = materializarPistas(selecionadas, tema.id);
+  const solucoesAntesDaFusao = contarSolucoes(base, 2);
+  const quantidadeAntesDaFusao = base.pistas.length;
+  base.pistas = fundirExclusoes(base.pistas, tema.gramatica);
+  const solucoesDepoisDaFusao = contarSolucoes(base, 2);
+  if (solucoesDepoisDaFusao !== solucoesAntesDaFusao) {
+    throw new Error(`A fusão de exclusões alterou a lógica do tema ${tema.id}.`);
+  }
+  for (const pista of base.pistas) verificarTextoPista(pista.texto);
   base.metadata = completarMetadata(base);
-  return base;
+  return { puzzle: base, fusoes: quantidadeAntesDaFusao - base.pistas.length };
 }
 
 export function gerarPuzzles(
@@ -481,31 +1207,33 @@ export function gerarPuzzles(
   const seedNormalizada = String(seed);
   const puzzles: Puzzle[] = [];
   const tentativas: Record<string, number> = {};
+  const fusoes: Record<string, number> = {};
 
-  for (let indiceTema = 0; indiceTema < temas.length; indiceTema += 1) {
-    const tema = temas[indiceTema];
+  for (const tema of temas) {
+    const erroQuem = verificarUsoDeQuem(tema);
+    if (erroQuem !== null) throw new Error(erroQuem);
+    const erroAmbiguidade = verificarAmbiguidadeDeReferencia(tema);
+    if (erroAmbiguidade !== null) throw new Error(erroAmbiguidade);
     let ultimoMotivo = "nenhuma tentativa executada";
     let encontrado: Puzzle | null = null;
+    let fusoesEncontradas = 0;
     for (let tentativa = 1; tentativa <= limiteTentativas; tentativa += 1) {
-      let puzzle: Puzzle;
+      let resultadoTentativa: { puzzle: Puzzle; fusoes: number };
       try {
-        puzzle = gerarTentativa(tema, `${seedNormalizada}:${tema.id}:${tentativa}`);
+        resultadoTentativa = gerarTentativa(tema, `${seedNormalizada}:${tema.id}:${tentativa}`);
       } catch (erro) {
         ultimoMotivo = erro instanceof Error ? erro.message : String(erro);
         continue;
       }
+      const { puzzle } = resultadoTentativa;
       const relatorio = avaliarEstrutura(puzzle);
-      const exigeComposta = indiceTema === 0;
-      const temComposta = puzzle.pistas.some((pista) => pista.restricoes.length >= 2);
-      if (relatorio.aprovado && (!exigeComposta || temComposta)) {
+      if (relatorio.aprovado) {
         encontrado = puzzle;
+        fusoesEncontradas = resultadoTentativa.fusoes;
         tentativas[tema.id] = tentativa;
         break;
       }
-      ultimoMotivo = [
-        ...relatorio.motivos,
-        ...(exigeComposta && !temComposta ? ["o primeiro tema precisa conter uma pista composta"] : []),
-      ].join("; ");
+      ultimoMotivo = relatorio.motivos.join("; ");
     }
     if (encontrado === null) {
       throw new Error(
@@ -513,8 +1241,9 @@ export function gerarPuzzles(
       );
     }
     puzzles.push(encontrado);
+    fusoes[tema.id] = fusoesEncontradas;
   }
-  return { seed: seedNormalizada, puzzles, tentativas };
+  return { seed: seedNormalizada, puzzles, tentativas, fusoes };
 }
 
 export function gerarProblemasNivel2(
@@ -524,13 +1253,37 @@ export function gerarProblemasNivel2(
   return gerarPuzzles(TEMAS_NIVEL_2, seed, limiteTentativas);
 }
 
+export function gerarProblemasNivel3(
+  seed: string | number,
+  limiteTentativas = 2_000
+): ResultadoGeracao {
+  return gerarPuzzles(TEMAS_NIVEL_3, seed, limiteTentativas);
+}
+
+export function gerarProblemasNivel4(
+  seed: string | number,
+  limiteTentativas = 2_000
+): ResultadoGeracao {
+  return gerarPuzzles(TEMAS_NIVEL_4, seed, limiteTentativas);
+}
+
+export function gerarProblemasNivel5(
+  seed: string | number,
+  limiteTentativas = 2_000
+): ResultadoGeracao {
+  return gerarPuzzles(TEMAS_NIVEL_5, seed, limiteTentativas);
+}
+
 /** Serialização pura: o resultado é dado TypeScript legível e não executa geração em produção. */
-export function emitirCodigoTypeScript(puzzles: readonly Puzzle[]): string {
+export function emitirCodigoTypeScript(
+  puzzles: readonly Puzzle[],
+  nomeExportacao = "PROBLEMAS_NIVEL_2"
+): string {
   return [
     'import type { Puzzle } from "../tipos";',
     "",
     "/** Arquivo emitido pelo gerador de autoria. Não edite manualmente. */",
-    `export const PROBLEMAS_NIVEL_2: Puzzle[] = ${JSON.stringify(puzzles, null, 2)};`,
+    `export const ${nomeExportacao}: Puzzle[] = ${JSON.stringify(puzzles, null, 2)};`,
     "",
   ].join("\n");
 }
diff --git a/lib/grade/gerar-banco.test.ts b/lib/grade/gerar-banco.test.ts
index 6edb709b..eac431e0 100644
--- a/lib/grade/gerar-banco.test.ts
+++ b/lib/grade/gerar-banco.test.ts
@@ -2,36 +2,53 @@ import { statSync, writeFileSync } from "node:fs";
 import { fileURLToPath } from "node:url";
 import { describe, expect, it } from "vitest";
 import { avaliarEstrutura } from "./estrutura";
-import { emitirCodigoTypeScript, gerarProblemasNivel2 } from "./gerador";
+import {
+  emitirCodigoTypeScript,
+  gerarProblemasNivel2,
+  gerarProblemasNivel3,
+  gerarProblemasNivel4,
+  gerarProblemasNivel5,
+} from "./gerador";
 import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
+import { PROBLEMAS_NIVEL_3 } from "./problemas/nivel3";
+import { PROBLEMAS_NIVEL_4 } from "./problemas/nivel4";
+import { PROBLEMAS_NIVEL_5 } from "./problemas/nivel5";
 import { temSolucaoUnica, validarPuzzle } from "./solver";
 
-export const SEED_BANCO_NIVEL_2 = "nivel2-20260908";
+export const SEED_BANCO = "grade-12-20260909";
 
-const caminhoBanco = fileURLToPath(new URL("./problemas/nivel2.ts", import.meta.url));
+const bancos = [
+  { nivel: 2, caminho: fileURLToPath(new URL("./problemas/nivel2.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_2, gerar: gerarProblemasNivel2 },
+  { nivel: 3, caminho: fileURLToPath(new URL("./problemas/nivel3.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_3, gerar: gerarProblemasNivel3 },
+  { nivel: 4, caminho: fileURLToPath(new URL("./problemas/nivel4.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_4, gerar: gerarProblemasNivel4 },
+  { nivel: 5, caminho: fileURLToPath(new URL("./problemas/nivel5.ts", import.meta.url)), puzzles: PROBLEMAS_NIVEL_5, gerar: gerarProblemasNivel5 },
+] as const;
 
-describe("banco emitido de nível 2", () => {
+describe("bancos emitidos dos níveis 2 a 5", () => {
   it("gera somente quando GERAR_BANCO=1; caso contrário, não escreve", () => {
-    const mtimeAntes = statSync(caminhoBanco).mtimeMs;
+    const mtimesAntes = bancos.map(({ caminho }) => statSync(caminho).mtimeMs);
 
     if (process.env.GERAR_BANCO === "1") {
-      const resultado = gerarProblemasNivel2(SEED_BANCO_NIVEL_2);
-      writeFileSync(caminhoBanco, emitirCodigoTypeScript(resultado.puzzles), "utf8");
-      expect(resultado.puzzles).toHaveLength(4);
+      for (const { nivel, caminho, gerar } of bancos) {
+        const resultado = gerar(SEED_BANCO);
+        writeFileSync(caminho, emitirCodigoTypeScript(resultado.puzzles, `PROBLEMAS_NIVEL_${nivel}`), "utf8");
+        expect(resultado.puzzles).toHaveLength(4);
+      }
       return;
     }
 
-    expect(PROBLEMAS_NIVEL_2).toHaveLength(4);
-    for (const puzzle of PROBLEMAS_NIVEL_2) {
+    const todos = bancos.flatMap(({ puzzles }) => [...puzzles]);
+    expect(todos).toHaveLength(16);
+    for (const puzzle of todos) {
       expect(temSolucaoUnica(puzzle), puzzle.id).toBe(true);
       expect(validarPuzzle(puzzle), puzzle.id).toBeNull();
       const relatorio = avaliarEstrutura(puzzle);
       expect(relatorio.motivos, `${puzzle.id}: ${relatorio.motivos.join("; ")}`).toEqual([]);
       expect(relatorio.aprovado, puzzle.id).toBe(true);
     }
-    expect(PROBLEMAS_NIVEL_2.some((puzzle) =>
+    expect(todos.some((puzzle) =>
       puzzle.pistas.some((pista) => pista.restricoes.length >= 2)
     )).toBe(true);
-    expect(statSync(caminhoBanco).mtimeMs).toBe(mtimeAntes);
+    expect(bancos.map(({ caminho }) => statSync(caminho).mtimeMs)).toEqual(mtimesAntes);
   });
 });
diff --git a/lib/grade/gramatica.test.ts b/lib/grade/gramatica.test.ts
index 79ca0de8..5a93e244 100644
--- a/lib/grade/gramatica.test.ts
+++ b/lib/grade/gramatica.test.ts
@@ -2,6 +2,7 @@ import { describe, expect, it } from "vitest";
 import {
   elidirVerboRepetido,
   textoDaPistaComposta,
+  textoDasExclusoes,
   textoDaRestricao,
   validarTextoPista,
   verificarTextoPista,
@@ -12,11 +13,13 @@ import type { Restricao } from "./tipos";
 const gramatica: GramaticaTema = {
   categorias: {
     pessoa: {
+      animado: true,
       sujeito: (valor) => valor,
       predicado: (valor) => `é ${valor}`,
       referencia: (valor) => valor,
     },
     sala: {
+      animado: false,
       sujeito: (valor) => `Quem usou a sala ${valor}`,
       predicado: (valor) => `usou a sala ${valor}`,
       referencia: (valor) => `a pessoa da sala ${valor}`,
@@ -67,6 +70,18 @@ describe("gramática das pistas", () => {
       "Alice não usou a sala Jade nem é Rafa."
     );
   });
+
+  it("monta uma fusão de três exclusões com as vírgulas corretas", () => {
+    const restricoes: Restricao[] = ["Jade", "Coral", "Âmbar"].map((valor, indice) => ({
+      id: `tripla#${indice + 1}`,
+      tipo: "T2" as const,
+      itemA: { categoria: "pessoa", valor: "Alice" },
+      itemB: { categoria: "sala", valor },
+    }));
+    expect(textoDasExclusoes(restricoes, gramatica)).toBe(
+      "Alice não usou a sala Jade, nem Coral, nem Âmbar."
+    );
+  });
 });
 
 describe("elisão do verbo em pista composta — conserto do VP", () => {
diff --git a/lib/grade/gramatica.ts b/lib/grade/gramatica.ts
index 86bfe45f..8124fde6 100644
--- a/lib/grade/gramatica.ts
+++ b/lib/grade/gramatica.ts
@@ -1,6 +1,8 @@
 import type { Item, Restricao } from "./tipos";
 
 export interface GramaticaCategoria {
+  /** Se os valores da categoria representam pessoas. */
+  animado: boolean;
   /** Como o valor vira sujeito da frase. */
   sujeito: (valor: string) => string;
   /** Predicado iniciado por verbo, para permitir a negação com "não". */
@@ -142,6 +144,42 @@ export function textoDaPistaComposta(
   );
 }
 
+/** Agrupa duas ou mais exclusões que compartilham o mesmo sujeito. */
+export function textoDasExclusoes(
+  restricoes: readonly Restricao[],
+  gramatica: GramaticaTema
+): string {
+  if (restricoes.length < 2) {
+    throw new Error("Uma fusão exige ao menos duas restrições T2.");
+  }
+  const [primeira] = restricoes;
+  if (
+    primeira.tipo !== "T2"
+    || restricoes.some((restricao) =>
+      restricao.tipo !== "T2"
+      || restricao.itemA.categoria !== primeira.itemA.categoria
+      || restricao.itemA.valor !== primeira.itemA.valor
+    )
+  ) {
+    throw new Error("Uma fusão exige restrições T2 com o mesmo sujeito.");
+  }
+
+  const predicados = restricoes.map((restricao) => {
+    if (restricao.tipo !== "T2") throw new Error("Restrição incompatível com a fusão.");
+    return predicado(restricao.itemB, gramatica);
+  });
+  const partes = [
+    predicados[0],
+    ...predicados.slice(1).map((parte, indice) =>
+      elidirVerboRepetido(predicados[indice], parte)
+    ),
+  ];
+  const separador = partes.length >= 3 ? ", nem " : " nem ";
+  return finalizar(
+    `${sujeito(primeira.itemA, gramatica)} não ${partes.join(separador)}`
+  );
+}
+
 /** Artigos e preposições: elidem-se com o verbo? Não — permanecem na segunda parte. */
 const PALAVRAS_FUNCIONAIS = new Set([
   "o", "a", "os", "as", "um", "uma", "uns", "umas",
diff --git a/lib/grade/problemas/nivel2.ts b/lib/grade/problemas/nivel2.ts
index 00004b81..dda66f72 100644
--- a/lib/grade/problemas/nivel2.ts
+++ b/lib/grade/problemas/nivel2.ts
@@ -19,47 +19,47 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "id": "paciente",
         "label": "Paciente",
         "valores": [
-          "Décio",
           "Rafa",
-          "Alice",
-          "Íris"
+          "Décio",
+          "Íris",
+          "Alice"
         ]
       },
       {
         "id": "especialidade",
         "label": "Especialidade",
         "valores": [
+          "Psicologia",
           "Cardiologia",
-          "Nutrição",
           "Ortopedia",
-          "Psicologia"
+          "Nutrição"
         ]
       },
       {
         "id": "sala",
         "label": "Sala",
         "valores": [
-          "Jade",
-          "Névoa",
           "Âmbar",
-          "Coral"
+          "Jade",
+          "Coral",
+          "Névoa"
         ]
       }
     ],
     "pistas": [
       {
         "id": "consultas-manha-1",
-        "texto": "Rafa foi atendido imediatamente antes de quem foi à Psicologia.",
+        "texto": "A pessoa que usou a sala Jade teve consulta imediatamente antes da pessoa que usou a sala Coral.",
         "restricoes": [
           {
             "tipo": "T6",
             "itemA": {
-              "categoria": "paciente",
-              "valor": "Rafa"
+              "categoria": "sala",
+              "valor": "Jade"
             },
             "itemB": {
-              "categoria": "especialidade",
-              "valor": "Psicologia"
+              "categoria": "sala",
+              "valor": "Coral"
             },
             "id": "consultas-manha-1#1"
           }
@@ -67,55 +67,43 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "consultas-manha-2",
-        "texto": "Quem usou a sala Âmbar não é Alice nem foi à Psicologia.",
+        "texto": "Décio e a pessoa que usou a sala Névoa tiveram consultas em horários vizinhos.",
         "restricoes": [
           {
-            "tipo": "T2",
+            "tipo": "T5",
             "itemA": {
-              "categoria": "sala",
-              "valor": "Âmbar"
-            },
-            "itemB": {
               "categoria": "paciente",
-              "valor": "Alice"
-            },
-            "id": "consultas-manha-2#1"
-          },
-          {
-            "tipo": "T2",
-            "itemA": {
-              "categoria": "sala",
-              "valor": "Âmbar"
+              "valor": "Décio"
             },
             "itemB": {
-              "categoria": "especialidade",
-              "valor": "Psicologia"
+              "categoria": "sala",
+              "valor": "Névoa"
             },
-            "id": "consultas-manha-2#2"
+            "id": "consultas-manha-2#1"
           }
         ]
       },
       {
         "id": "consultas-manha-3",
-        "texto": "Quem foi à Psicologia não é Rafa nem usou a sala Coral.",
+        "texto": "Alice não foi à Ortopedia nem usou a sala Coral.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "especialidade",
-              "valor": "Psicologia"
+              "categoria": "paciente",
+              "valor": "Alice"
             },
             "itemB": {
-              "categoria": "paciente",
-              "valor": "Rafa"
+              "categoria": "especialidade",
+              "valor": "Ortopedia"
             },
             "id": "consultas-manha-3#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "especialidade",
-              "valor": "Psicologia"
+              "categoria": "paciente",
+              "valor": "Alice"
             },
             "itemB": {
               "categoria": "sala",
@@ -127,29 +115,29 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "consultas-manha-4",
-        "texto": "Quem usou a sala Névoa não é Décio nem Íris.",
+        "texto": "A pessoa que foi à Ortopedia não é Íris nem usou a sala Coral.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "sala",
-              "valor": "Névoa"
+              "categoria": "especialidade",
+              "valor": "Ortopedia"
             },
             "itemB": {
               "categoria": "paciente",
-              "valor": "Décio"
+              "valor": "Íris"
             },
             "id": "consultas-manha-4#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "sala",
-              "valor": "Névoa"
+              "categoria": "especialidade",
+              "valor": "Ortopedia"
             },
             "itemB": {
-              "categoria": "paciente",
-              "valor": "Íris"
+              "categoria": "sala",
+              "valor": "Coral"
             },
             "id": "consultas-manha-4#2"
           }
@@ -157,13 +145,13 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "consultas-manha-5",
-        "texto": "Quem foi à Cardiologia é Rafa.",
+        "texto": "Íris teve consulta imediatamente antes de Rafa.",
         "restricoes": [
           {
-            "tipo": "T8",
+            "tipo": "T6",
             "itemA": {
-              "categoria": "especialidade",
-              "valor": "Cardiologia"
+              "categoria": "paciente",
+              "valor": "Íris"
             },
             "itemB": {
               "categoria": "paciente",
@@ -175,93 +163,123 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "consultas-manha-6",
-        "texto": "Quem foi à Nutrição foi atendido imediatamente antes de Décio.",
+        "texto": "Décio não usou a sala Âmbar.",
         "restricoes": [
           {
-            "tipo": "T6",
+            "tipo": "T2",
             "itemA": {
-              "categoria": "especialidade",
-              "valor": "Nutrição"
-            },
-            "itemB": {
               "categoria": "paciente",
               "valor": "Décio"
             },
+            "itemB": {
+              "categoria": "sala",
+              "valor": "Âmbar"
+            },
             "id": "consultas-manha-6#1"
           }
         ]
       },
       {
         "id": "consultas-manha-7",
-        "texto": "Quem usou a sala Névoa não é Décio nem Alice.",
+        "texto": "Íris teve consulta antes da pessoa que usou a sala Névoa.",
         "restricoes": [
           {
-            "tipo": "T2",
+            "tipo": "T11",
             "itemA": {
+              "categoria": "paciente",
+              "valor": "Íris"
+            },
+            "itemB": {
               "categoria": "sala",
               "valor": "Névoa"
             },
+            "id": "consultas-manha-7#1"
+          }
+        ]
+      },
+      {
+        "id": "consultas-manha-8",
+        "texto": "A pessoa que foi à Psicologia não é Rafa nem Íris.",
+        "restricoes": [
+          {
+            "tipo": "T2",
+            "itemA": {
+              "categoria": "especialidade",
+              "valor": "Psicologia"
+            },
             "itemB": {
               "categoria": "paciente",
-              "valor": "Décio"
+              "valor": "Rafa"
             },
-            "id": "consultas-manha-7#1"
+            "id": "consultas-manha-8#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "sala",
-              "valor": "Névoa"
+              "categoria": "especialidade",
+              "valor": "Psicologia"
             },
             "itemB": {
               "categoria": "paciente",
-              "valor": "Alice"
+              "valor": "Íris"
             },
-            "id": "consultas-manha-7#2"
+            "id": "consultas-manha-8#2"
           }
         ]
       },
       {
-        "id": "consultas-manha-8",
-        "texto": "Alice e quem foi à Psicologia foram atendidos em horários vizinhos.",
+        "id": "consultas-manha-9",
+        "texto": "A pessoa que foi à Nutrição não usou a sala Âmbar nem Coral.",
         "restricoes": [
           {
-            "tipo": "T5",
+            "tipo": "T2",
             "itemA": {
-              "categoria": "paciente",
-              "valor": "Alice"
+              "categoria": "especialidade",
+              "valor": "Nutrição"
             },
             "itemB": {
+              "categoria": "sala",
+              "valor": "Âmbar"
+            },
+            "id": "consultas-manha-9#1"
+          },
+          {
+            "tipo": "T2",
+            "itemA": {
               "categoria": "especialidade",
-              "valor": "Psicologia"
+              "valor": "Nutrição"
             },
-            "id": "consultas-manha-8#1"
+            "itemB": {
+              "categoria": "sala",
+              "valor": "Coral"
+            },
+            "id": "consultas-manha-9#2"
           }
         ]
       }
     ],
     "solucao": {
       "paciente": [
-        "Rafa",
         "Íris",
-        "Alice",
-        "Décio"
+        "Rafa",
+        "Décio",
+        "Alice"
       ],
       "especialidade": [
         "Cardiologia",
+        "Ortopedia",
         "Psicologia",
-        "Nutrição",
-        "Ortopedia"
+        "Nutrição"
       ],
       "sala": [
-        "Névoa",
+        "Âmbar",
         "Jade",
         "Coral",
-        "Âmbar"
+        "Névoa"
       ]
     },
     "metadata": {
-      "complexity": 8,
+      "complexity": 9,
       "inferenceDepthDistribution": {
         "1": 0,
         "2": 0,
@@ -269,23 +287,23 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "4+": 12
       },
       "skillWeights": {
-        "exclusion": 8,
-        "relativeOrder": 0,
+        "exclusion": 9,
+        "relativeOrder": 1,
         "adjacency": 3,
-        "crossCategory": 12,
-        "integrationDepth": 8,
+        "crossCategory": 11,
+        "integrationDepth": 9,
         "uncertaintyTolerance": 2
       },
       "dominantOperations": [
         "T2",
         "T6",
-        "T5"
+        "T11"
       ],
       "clueTypeDistribution": {
         "T6": 2,
-        "T2": 8,
-        "T8": 1,
-        "T5": 1
+        "T5": 1,
+        "T2": 9,
+        "T11": 1
       },
       "expectedDifficulty": 2,
       "validatedUniqueSolution": true
@@ -308,107 +326,107 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "id": "barista",
         "label": "Barista",
         "valores": [
-          "Ester",
           "Bruno",
-          "Nara",
-          "Tulio"
+          "Tulio",
+          "Ester",
+          "Nara"
         ]
       },
       {
         "id": "preparo",
         "label": "Preparo",
         "valores": [
+          "Espresso",
           "Filtrado",
           "Prensa",
-          "Gelado",
-          "Espresso"
+          "Gelado"
         ]
       },
       {
         "id": "posto",
         "label": "Posto",
         "valores": [
-          "Balcão",
           "Caixa",
-          "Salão",
-          "Forno"
+          "Balcão",
+          "Forno",
+          "Salão"
         ]
       }
     ],
     "pistas": [
       {
         "id": "turnos-cafeteria-1",
-        "texto": "Bruno não preparou o Gelado nem o Espresso.",
+        "texto": "O barista que preparou o Filtrado ficou no Forno.",
         "restricoes": [
           {
-            "tipo": "T2",
+            "tipo": "T8",
             "itemA": {
-              "categoria": "barista",
-              "valor": "Bruno"
+              "categoria": "preparo",
+              "valor": "Filtrado"
             },
             "itemB": {
-              "categoria": "preparo",
-              "valor": "Gelado"
+              "categoria": "posto",
+              "valor": "Forno"
             },
             "id": "turnos-cafeteria-1#1"
-          },
+          }
+        ]
+      },
+      {
+        "id": "turnos-cafeteria-2",
+        "texto": "Ester não preparou o Espresso nem ficou no Balcão.",
+        "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
               "categoria": "barista",
-              "valor": "Bruno"
+              "valor": "Ester"
             },
             "itemB": {
               "categoria": "preparo",
               "valor": "Espresso"
             },
-            "id": "turnos-cafeteria-1#2"
-          }
-        ]
-      },
-      {
-        "id": "turnos-cafeteria-2",
-        "texto": "Quem preparou o Gelado ficou no Salão.",
-        "restricoes": [
+            "id": "turnos-cafeteria-2#1"
+          },
           {
-            "tipo": "T8",
+            "tipo": "T2",
             "itemA": {
-              "categoria": "preparo",
-              "valor": "Gelado"
+              "categoria": "barista",
+              "valor": "Ester"
             },
             "itemB": {
               "categoria": "posto",
-              "valor": "Salão"
+              "valor": "Balcão"
             },
-            "id": "turnos-cafeteria-2#1"
+            "id": "turnos-cafeteria-2#2"
           }
         ]
       },
       {
         "id": "turnos-cafeteria-3",
-        "texto": "Quem preparou o Espresso não é Tulio nem ficou no Forno.",
+        "texto": "Tulio não preparou o Gelado nem ficou no Balcão.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "preparo",
-              "valor": "Espresso"
-            },
-            "itemB": {
               "categoria": "barista",
               "valor": "Tulio"
             },
+            "itemB": {
+              "categoria": "preparo",
+              "valor": "Gelado"
+            },
             "id": "turnos-cafeteria-3#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "preparo",
-              "valor": "Espresso"
+              "categoria": "barista",
+              "valor": "Tulio"
             },
             "itemB": {
               "categoria": "posto",
-              "valor": "Forno"
+              "valor": "Balcão"
             },
             "id": "turnos-cafeteria-3#2"
           }
@@ -416,83 +434,99 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "turnos-cafeteria-4",
-        "texto": "Nara trabalhou antes de quem preparou o Filtrado.",
+        "texto": "O barista do posto Salão não é Bruno nem preparou o Espresso.",
         "restricoes": [
           {
-            "tipo": "T11",
+            "tipo": "T2",
             "itemA": {
+              "categoria": "posto",
+              "valor": "Salão"
+            },
+            "itemB": {
               "categoria": "barista",
-              "valor": "Nara"
+              "valor": "Bruno"
+            },
+            "id": "turnos-cafeteria-4#1"
+          },
+          {
+            "tipo": "T2",
+            "itemA": {
+              "categoria": "posto",
+              "valor": "Salão"
             },
             "itemB": {
               "categoria": "preparo",
-              "valor": "Filtrado"
+              "valor": "Espresso"
             },
-            "id": "turnos-cafeteria-4#1"
+            "id": "turnos-cafeteria-4#2"
           }
         ]
       },
       {
         "id": "turnos-cafeteria-5",
-        "texto": "Quem preparou o Gelado não é Tulio nem ficou no Forno.",
+        "texto": "Bruno trabalhou entre o barista do posto Salão e o barista que preparou o Gelado, nessa ordem.",
         "restricoes": [
           {
-            "tipo": "T2",
+            "tipo": "T7",
             "itemA": {
-              "categoria": "preparo",
-              "valor": "Gelado"
+              "categoria": "posto",
+              "valor": "Salão"
             },
-            "itemB": {
+            "itemC": {
               "categoria": "barista",
-              "valor": "Tulio"
+              "valor": "Bruno"
             },
-            "id": "turnos-cafeteria-5#1"
-          },
-          {
-            "tipo": "T2",
-            "itemA": {
+            "itemB": {
               "categoria": "preparo",
               "valor": "Gelado"
             },
-            "itemB": {
-              "categoria": "posto",
-              "valor": "Forno"
-            },
-            "id": "turnos-cafeteria-5#2"
+            "id": "turnos-cafeteria-5#1"
           }
         ]
       },
       {
         "id": "turnos-cafeteria-6",
-        "texto": "Bruno trabalhou antes de quem ficou no Balcão.",
+        "texto": "Nara não preparou o Espresso nem o Gelado.",
         "restricoes": [
           {
-            "tipo": "T4",
+            "tipo": "T2",
             "itemA": {
               "categoria": "barista",
-              "valor": "Bruno"
+              "valor": "Nara"
             },
             "itemB": {
-              "categoria": "posto",
-              "valor": "Balcão"
+              "categoria": "preparo",
+              "valor": "Espresso"
             },
             "id": "turnos-cafeteria-6#1"
+          },
+          {
+            "tipo": "T2",
+            "itemA": {
+              "categoria": "barista",
+              "valor": "Nara"
+            },
+            "itemB": {
+              "categoria": "preparo",
+              "valor": "Gelado"
+            },
+            "id": "turnos-cafeteria-6#2"
           }
         ]
       },
       {
         "id": "turnos-cafeteria-7",
-        "texto": "Quem ficou no Forno trabalhou antes de Bruno.",
+        "texto": "O barista do posto Forno não é Tulio.",
         "restricoes": [
           {
-            "tipo": "T11",
+            "tipo": "T2",
             "itemA": {
               "categoria": "posto",
               "valor": "Forno"
             },
             "itemB": {
               "categoria": "barista",
-              "valor": "Bruno"
+              "valor": "Tulio"
             },
             "id": "turnos-cafeteria-7#1"
           }
@@ -500,17 +534,21 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "turnos-cafeteria-8",
-        "texto": "Quem preparou a Prensa e quem ficou no Caixa trabalharam em dias vizinhos.",
+        "texto": "O barista que preparou a Prensa trabalhou entre o barista do posto Forno e o barista que preparou o Gelado, nessa ordem.",
         "restricoes": [
           {
-            "tipo": "T5",
+            "tipo": "T7",
             "itemA": {
+              "categoria": "posto",
+              "valor": "Forno"
+            },
+            "itemC": {
               "categoria": "preparo",
               "valor": "Prensa"
             },
             "itemB": {
-              "categoria": "posto",
-              "valor": "Caixa"
+              "categoria": "preparo",
+              "valor": "Gelado"
             },
             "id": "turnos-cafeteria-8#1"
           }
@@ -525,16 +563,16 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "Ester"
       ],
       "preparo": [
-        "Gelado",
-        "Prensa",
         "Filtrado",
-        "Espresso"
+        "Prensa",
+        "Espresso",
+        "Gelado"
       ],
       "posto": [
-        "Salão",
         "Forno",
-        "Caixa",
-        "Balcão"
+        "Salão",
+        "Balcão",
+        "Caixa"
       ]
     },
     "metadata": {
@@ -546,24 +584,22 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "4+": 12
       },
       "skillWeights": {
-        "exclusion": 6,
-        "relativeOrder": 3,
-        "adjacency": 1,
-        "crossCategory": 11,
+        "exclusion": 9,
+        "relativeOrder": 2,
+        "adjacency": 0,
+        "crossCategory": 12,
         "integrationDepth": 8,
         "uncertaintyTolerance": 2
       },
       "dominantOperations": [
         "T2",
-        "T11",
-        "T4"
+        "T7",
+        "T8"
       ],
       "clueTypeDistribution": {
-        "T2": 6,
         "T8": 1,
-        "T11": 2,
-        "T4": 1,
-        "T5": 1
+        "T2": 9,
+        "T7": 2
       },
       "expectedDifficulty": 2,
       "validatedUniqueSolution": true
@@ -586,19 +622,19 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "id": "filme",
         "label": "Filme",
         "valores": [
-          "Vertigem",
-          "Correnteza",
           "Estuário",
-          "Miragem"
+          "Correnteza",
+          "Miragem",
+          "Vertigem"
         ]
       },
       {
         "id": "curador",
         "label": "Curador",
         "valores": [
-          "Otto",
-          "Vera",
           "Lena",
+          "Vera",
+          "Otto",
           "Ciro"
         ]
       },
@@ -606,39 +642,47 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "id": "genero",
         "label": "Gênero",
         "valores": [
+          "Drama",
           "Suspense",
-          "Policial",
           "Documentário",
-          "Drama"
+          "Policial"
         ]
       }
     ],
     "pistas": [
       {
         "id": "sessoes-cineclube-1",
-        "texto": "O Drama foi exibido entre o filme apresentado por Otto e o filme apresentado por Vera, nessa ordem.",
+        "texto": "O Drama não é Correnteza nem foi apresentado por Otto.",
         "restricoes": [
           {
-            "tipo": "T7",
+            "tipo": "T2",
             "itemA": {
-              "categoria": "curador",
-              "valor": "Otto"
+              "categoria": "genero",
+              "valor": "Drama"
             },
-            "itemC": {
+            "itemB": {
+              "categoria": "filme",
+              "valor": "Correnteza"
+            },
+            "id": "sessoes-cineclube-1#1"
+          },
+          {
+            "tipo": "T2",
+            "itemA": {
               "categoria": "genero",
               "valor": "Drama"
             },
             "itemB": {
               "categoria": "curador",
-              "valor": "Vera"
+              "valor": "Otto"
             },
-            "id": "sessoes-cineclube-1#1"
+            "id": "sessoes-cineclube-1#2"
           }
         ]
       },
       {
         "id": "sessoes-cineclube-2",
-        "texto": "Estuário foi exibido entre o filme apresentado por Otto e o filme apresentado por Vera, nessa ordem.",
+        "texto": "O Policial foi exibido entre o filme apresentado por Otto e o Documentário, nessa ordem.",
         "restricoes": [
           {
             "tipo": "T7",
@@ -647,12 +691,12 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
               "valor": "Otto"
             },
             "itemC": {
-              "categoria": "filme",
-              "valor": "Estuário"
+              "categoria": "genero",
+              "valor": "Policial"
             },
             "itemB": {
-              "categoria": "curador",
-              "valor": "Vera"
+              "categoria": "genero",
+              "valor": "Documentário"
             },
             "id": "sessoes-cineclube-2#1"
           }
@@ -660,17 +704,13 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "sessoes-cineclube-3",
-        "texto": "O filme apresentado por Lena foi exibido entre o Policial e o filme apresentado por Vera, nessa ordem.",
+        "texto": "Estuário foi apresentado por Vera.",
         "restricoes": [
           {
-            "tipo": "T7",
+            "tipo": "T1",
             "itemA": {
-              "categoria": "genero",
-              "valor": "Policial"
-            },
-            "itemC": {
-              "categoria": "curador",
-              "valor": "Lena"
+              "categoria": "filme",
+              "valor": "Estuário"
             },
             "itemB": {
               "categoria": "curador",
@@ -682,17 +722,17 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "sessoes-cineclube-4",
-        "texto": "O filme apresentado por Ciro é um Drama.",
+        "texto": "O filme apresentado por Vera foi exibido antes de Miragem.",
         "restricoes": [
           {
-            "tipo": "T1",
+            "tipo": "T11",
             "itemA": {
               "categoria": "curador",
-              "valor": "Ciro"
+              "valor": "Vera"
             },
             "itemB": {
-              "categoria": "genero",
-              "valor": "Drama"
+              "categoria": "filme",
+              "valor": "Miragem"
             },
             "id": "sessoes-cineclube-4#1"
           }
@@ -700,17 +740,17 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "sessoes-cineclube-5",
-        "texto": "O Policial foi exibido antes de Miragem.",
+        "texto": "O Suspense foi exibido antes do filme apresentado por Ciro.",
         "restricoes": [
           {
-            "tipo": "T4",
+            "tipo": "T11",
             "itemA": {
               "categoria": "genero",
-              "valor": "Policial"
+              "valor": "Suspense"
             },
             "itemB": {
-              "categoria": "filme",
-              "valor": "Miragem"
+              "categoria": "curador",
+              "valor": "Ciro"
             },
             "id": "sessoes-cineclube-5#1"
           }
@@ -718,72 +758,100 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
       },
       {
         "id": "sessoes-cineclube-6",
-        "texto": "Correnteza foi exibido entre o Drama e o Suspense, nessa ordem.",
+        "texto": "O filme apresentado por Otto e o Drama foram exibidos em horários vizinhos.",
         "restricoes": [
           {
-            "tipo": "T7",
+            "tipo": "T5",
             "itemA": {
+              "categoria": "curador",
+              "valor": "Otto"
+            },
+            "itemB": {
               "categoria": "genero",
               "valor": "Drama"
             },
-            "itemC": {
-              "categoria": "filme",
-              "valor": "Correnteza"
+            "id": "sessoes-cineclube-6#1"
+          }
+        ]
+      },
+      {
+        "id": "sessoes-cineclube-7",
+        "texto": "O filme apresentado por Ciro não é um Documentário nem um Policial.",
+        "restricoes": [
+          {
+            "tipo": "T2",
+            "itemA": {
+              "categoria": "curador",
+              "valor": "Ciro"
             },
             "itemB": {
               "categoria": "genero",
-              "valor": "Suspense"
+              "valor": "Documentário"
             },
-            "id": "sessoes-cineclube-6#1"
+            "id": "sessoes-cineclube-7#1"
+          },
+          {
+            "tipo": "T2",
+            "itemA": {
+              "categoria": "curador",
+              "valor": "Ciro"
+            },
+            "itemB": {
+              "categoria": "genero",
+              "valor": "Policial"
+            },
+            "id": "sessoes-cineclube-7#2"
           }
         ]
       }
     ],
     "solucao": {
       "filme": [
+        "Correnteza",
         "Vertigem",
         "Estuário",
-        "Correnteza",
         "Miragem"
       ],
       "curador": [
         "Otto",
         "Ciro",
-        "Lena",
-        "Vera"
+        "Vera",
+        "Lena"
       ],
       "genero": [
-        "Policial",
+        "Suspense",
         "Drama",
-        "Documentário",
-        "Suspense"
+        "Policial",
+        "Documentário"
       ]
     },
     "metadata": {
-      "complexity": 6,
+      "complexity": 7,
       "inferenceDepthDistribution": {
         "1": 0,
-        "2": 4,
-        "3": 7,
-        "4+": 1
+        "2": 0,
+        "3": 1,
+        "4+": 11
       },
       "skillWeights": {
-        "exclusion": 0,
-        "relativeOrder": 5,
-        "adjacency": 0,
-        "crossCategory": 6,
-        "integrationDepth": 4,
+        "exclusion": 4,
+        "relativeOrder": 3,
+        "adjacency": 1,
+        "crossCategory": 9,
+        "integrationDepth": 7,
         "uncertaintyTolerance": 2
       },
       "dominantOperations": [
-        "T7",
-        "T1",
-        "T4"
+        "T2",
+        "T11",
+        "T1"
       ],
       "clueTypeDistribution": {
-        "T7": 4,
+        "T2": 4,
+        "T7": 1,
         "T1": 1,
-        "T4": 1
+        "T11": 2,
+        "T5": 1
       },
       "expectedDifficulty": 2,
       "validatedUniqueSolution": true
@@ -806,29 +874,29 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "id": "oficina",
         "label": "Oficina",
         "valores": [
-          "Fotografia",
+          "Marcenaria",
           "Tecelagem",
-          "Cerâmica",
-          "Marcenaria"
+          "Fotografia",
+          "Cerâmica"
         ]
       },
       {
         "id": "mediador",
         "label": "Mediador",
         "valores": [
-          "Sol",
+          "Iuri",
           "Alma",
-          "Zeca",
-          "Iuri"
+          "Sol",
+          "Zeca"
         ]
       },
       {
         "id": "espaco",
         "label": "Espaço",
         "valores": [
+          "Galpão",
           "Ateliê",
           "Pátio",
-          "Galpão",
           "Mezanino"
         ]
       }
@@ -836,247 +904,175 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
     "pistas": [
       {
         "id": "oficinas-centro-cultural-1",
-        "texto": "A oficina que ocupou o Pátio aconteceu entre a oficina que ocupou o Galpão e a oficina mediada por Sol, nessa ordem.",
-        "restricoes": [
-          {
-            "tipo": "T7",
-            "itemA": {
-              "categoria": "espaco",
-              "valor": "Galpão"
-            },
-            "itemC": {
-              "categoria": "espaco",
-              "valor": "Pátio"
-            },
-            "itemB": {
-              "categoria": "mediador",
-              "valor": "Sol"
-            },
-            "id": "oficinas-centro-cultural-1#1"
-          }
-        ]
-      },
-      {
-        "id": "oficinas-centro-cultural-2",
-        "texto": "A oficina mediada por Zeca não ocupou o Ateliê nem o Mezanino.",
+        "texto": "A oficina de Marcenaria não ocupou o Galpão, nem foi mediada por Sol, nem por Zeca.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "mediador",
-              "valor": "Zeca"
+              "categoria": "oficina",
+              "valor": "Marcenaria"
             },
             "itemB": {
               "categoria": "espaco",
-              "valor": "Ateliê"
+              "valor": "Galpão"
             },
-            "id": "oficinas-centro-cultural-2#1"
+            "id": "oficinas-centro-cultural-1#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "mediador",
-              "valor": "Zeca"
+              "categoria": "oficina",
+              "valor": "Marcenaria"
             },
             "itemB": {
-              "categoria": "espaco",
-              "valor": "Mezanino"
-            },
-            "id": "oficinas-centro-cultural-2#2"
-          }
-        ]
-      },
-      {
-        "id": "oficinas-centro-cultural-3",
-        "texto": "A oficina mediada por Sol é a oficina de Tecelagem.",
-        "restricoes": [
-          {
-            "tipo": "T8",
-            "itemA": {
               "categoria": "mediador",
               "valor": "Sol"
             },
-            "itemB": {
-              "categoria": "oficina",
-              "valor": "Tecelagem"
-            },
-            "id": "oficinas-centro-cultural-3#1"
-          }
-        ]
-      },
-      {
-        "id": "oficinas-centro-cultural-4",
-        "texto": "A oficina mediada por Iuri aconteceu antes da oficina de Marcenaria.",
-        "restricoes": [
-          {
-            "tipo": "T11",
-            "itemA": {
-              "categoria": "mediador",
-              "valor": "Iuri"
-            },
-            "itemB": {
-              "categoria": "oficina",
-              "valor": "Marcenaria"
-            },
-            "id": "oficinas-centro-cultural-4#1"
-          }
-        ]
-      },
-      {
-        "id": "oficinas-centro-cultural-5",
-        "texto": "A oficina de Fotografia não foi mediada por Alma.",
-        "restricoes": [
+            "id": "oficinas-centro-cultural-1#2"
+          },
           {
             "tipo": "T2",
             "itemA": {
               "categoria": "oficina",
-              "valor": "Fotografia"
+              "valor": "Marcenaria"
             },
             "itemB": {
               "categoria": "mediador",
-              "valor": "Alma"
+              "valor": "Zeca"
             },
-            "id": "oficinas-centro-cultural-5#1"
+            "id": "oficinas-centro-cultural-1#3"
           }
         ]
       },
       {
-        "id": "oficinas-centro-cultural-6",
-        "texto": "A oficina que ocupou o Pátio é a oficina de Marcenaria.",
+        "id": "oficinas-centro-cultural-3",
+        "texto": "A oficina que ocupou o Ateliê é a oficina de Cerâmica.",
         "restricoes": [
           {
-            "tipo": "T1",
+            "tipo": "T8",
             "itemA": {
               "categoria": "espaco",
-              "valor": "Pátio"
+              "valor": "Ateliê"
             },
             "itemB": {
               "categoria": "oficina",
-              "valor": "Marcenaria"
+              "valor": "Cerâmica"
             },
-            "id": "oficinas-centro-cultural-6#1"
+            "id": "oficinas-centro-cultural-3#1"
           }
         ]
       },
       {
-        "id": "oficinas-centro-cultural-7",
-        "texto": "A oficina de Cerâmica não foi mediada por Sol nem ocupou o Mezanino.",
+        "id": "oficinas-centro-cultural-4",
+        "texto": "A oficina que ocupou o Galpão não foi mediada por Sol nem por Zeca.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "oficina",
-              "valor": "Cerâmica"
+              "categoria": "espaco",
+              "valor": "Galpão"
             },
             "itemB": {
               "categoria": "mediador",
               "valor": "Sol"
             },
-            "id": "oficinas-centro-cultural-7#1"
+            "id": "oficinas-centro-cultural-4#1"
           },
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "oficina",
-              "valor": "Cerâmica"
+              "categoria": "espaco",
+              "valor": "Galpão"
             },
             "itemB": {
-              "categoria": "espaco",
-              "valor": "Mezanino"
+              "categoria": "mediador",
+              "valor": "Zeca"
             },
-            "id": "oficinas-centro-cultural-7#2"
+            "id": "oficinas-centro-cultural-4#2"
           }
         ]
       },
       {
-        "id": "oficinas-centro-cultural-8",
-        "texto": "A oficina que ocupou o Ateliê não foi mediada por Zeca nem por Iuri.",
+        "id": "oficinas-centro-cultural-5",
+        "texto": "A oficina mediada por Alma não é a oficina de Marcenaria.",
         "restricoes": [
           {
             "tipo": "T2",
             "itemA": {
-              "categoria": "espaco",
-              "valor": "Ateliê"
-            },
-            "itemB": {
               "categoria": "mediador",
-              "valor": "Zeca"
-            },
-            "id": "oficinas-centro-cultural-8#1"
-          },
-          {
-            "tipo": "T2",
-            "itemA": {
-              "categoria": "espaco",
-              "valor": "Ateliê"
+              "valor": "Alma"
             },
             "itemB": {
-              "categoria": "mediador",
-              "valor": "Iuri"
+              "categoria": "oficina",
+              "valor": "Marcenaria"
             },
-            "id": "oficinas-centro-cultural-8#2"
+            "id": "oficinas-centro-cultural-5#1"
           }
         ]
       },
       {
-        "id": "oficinas-centro-cultural-9",
-        "texto": "A oficina que ocupou o Mezanino não foi mediada por Iuri.",
+        "id": "oficinas-centro-cultural-6",
+        "texto": "A oficina que ocupou o Galpão aconteceu imediatamente antes da oficina de Fotografia.",
         "restricoes": [
           {
-            "tipo": "T2",
+            "tipo": "T6",
             "itemA": {
               "categoria": "espaco",
-              "valor": "Mezanino"
+              "valor": "Galpão"
             },
             "itemB": {
-              "categoria": "mediador",
-              "valor": "Iuri"
+              "categoria": "oficina",
+              "valor": "Fotografia"
             },
-            "id": "oficinas-centro-cultural-9#1"
+            "id": "oficinas-centro-cultural-6#1"
           }
         ]
       },
       {
-        "id": "oficinas-centro-cultural-10",
-        "texto": "A oficina que ocupou o Galpão aconteceu imediatamente antes da oficina mediada por Alma.",
+        "id": "oficinas-centro-cultural-7",
+        "texto": "A oficina mediada por Zeca aconteceu entre a oficina que ocupou o Mezanino e a oficina mediada por Alma, nessa ordem.",
         "restricoes": [
           {
-            "tipo": "T6",
+            "tipo": "T7",
             "itemA": {
               "categoria": "espaco",
-              "valor": "Galpão"
+              "valor": "Mezanino"
+            },
+            "itemC": {
+              "categoria": "mediador",
+              "valor": "Zeca"
             },
             "itemB": {
               "categoria": "mediador",
               "valor": "Alma"
             },
-            "id": "oficinas-centro-cultural-10#1"
+            "id": "oficinas-centro-cultural-7#1"
           }
         ]
       }
     ],
     "solucao": {
       "oficina": [
-        "Fotografia",
-        "Cerâmica",
         "Marcenaria",
-        "Tecelagem"
+        "Cerâmica",
+        "Tecelagem",
+        "Fotografia"
       ],
       "mediador": [
         "Iuri",
-        "Alma",
         "Zeca",
+        "Alma",
         "Sol"
       ],
       "espaco": [
-        "Galpão",
+        "Mezanino",
         "Ateliê",
-        "Pátio",
-        "Mezanino"
+        "Galpão",
+        "Pátio"
       ]
     },
     "metadata": {
-      "complexity": 10,
+      "complexity": 6,
       "inferenceDepthDistribution": {
         "1": 0,
         "2": 0,
@@ -1084,25 +1080,23 @@ export const PROBLEMAS_NIVEL_2: Puzzle[] = [
         "4+": 12
       },
       "skillWeights": {
-        "exclusion": 8,
-        "relativeOrder": 2,
+        "exclusion": 6,
+        "relativeOrder": 1,
         "adjacency": 1,
-        "crossCategory": 13,
-        "integrationDepth": 10,
+        "crossCategory": 9,
+        "integrationDepth": 6,
         "uncertaintyTolerance": 2
       },
       "dominantOperations": [
         "T2",
-        "T1",
-        "T11"
+        "T6",
+        "T7"
       ],
       "clueTypeDistribution": {
-        "T7": 1,
-        "T2": 8,
+        "T2": 6,
         "T8": 1,
-        "T11": 1,
-        "T1": 1,
-        "T6": 1
+        "T6": 1,
+        "T7": 1
       },
       "expectedDifficulty": 2,
       "validatedUniqueSolution": true
diff --git a/lib/grade/vp-prova-banco.test.ts b/lib/grade/vp-prova-banco.test.ts
index e9295d1e..1c2afcf3 100644
--- a/lib/grade/vp-prova-banco.test.ts
+++ b/lib/grade/vp-prova-banco.test.ts
@@ -1,5 +1,8 @@
 import { describe, expect, it } from "vitest";
 import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
+import { PROBLEMAS_NIVEL_3 } from "./problemas/nivel3";
+import { PROBLEMAS_NIVEL_4 } from "./problemas/nivel4";
+import { PROBLEMAS_NIVEL_5 } from "./problemas/nivel5";
 import { avaliarEstrutura } from "./estrutura";
 import { temSolucaoUnica, validarPuzzle } from "./solver";
 import { itensDaRestricao } from "./motor";
@@ -10,38 +13,45 @@ import type { Restricao } from "./tipos";
 // frase errada — e aí o paciente lê uma coisa e o motor cobra outra. Isso é indetectável pela
 // suíte de lógica e destrói o exercício em silêncio.
 
-describe("banco de nível 2 — a lógica", () => {
-  it("são 4 problemas, todos com solução única e gabarito válido", () => {
-    expect(PROBLEMAS_NIVEL_2).toHaveLength(4);
-    for (const p of PROBLEMAS_NIVEL_2) {
+const TODOS_OS_PROBLEMAS = [
+  ...PROBLEMAS_NIVEL_2,
+  ...PROBLEMAS_NIVEL_3,
+  ...PROBLEMAS_NIVEL_4,
+  ...PROBLEMAS_NIVEL_5,
+];
+
+describe("banco dos níveis 2 a 5 — a lógica", () => {
+  it("são 16 problemas, todos com solução única e gabarito válido", () => {
+    expect(TODOS_OS_PROBLEMAS).toHaveLength(16);
+    for (const p of TODOS_OS_PROBLEMAS) {
       expect(validarPuzzle(p), `${p.id}`).toBeNull();
       expect(temSolucaoUnica(p), `${p.id}`).toBe(true);
-      expect(p.posicoes).toBe(4);
-      expect(p.categorias).toHaveLength(3);
+      expect(p.posicoes).toBe(p.nivel <= 3 ? 4 : 5);
+      expect(p.categorias).toHaveLength(p.nivel === 2 ? 3 : p.nivel === 5 ? 5 : 4);
     }
   });
 
   it("todos passam na régua INTEIRA, e o motivo aparece quando não passam", () => {
-    for (const p of PROBLEMAS_NIVEL_2) {
+    for (const p of TODOS_OS_PROBLEMAS) {
       const r = avaliarEstrutura(p);
       expect(r.aprovado, `${p.id} reprovou: ${r.motivos.join(" | ")}`).toBe(true);
     }
   });
 
   it("nenhum problema repete a solução de outro", () => {
-    const chaves = PROBLEMAS_NIVEL_2.map((p) => JSON.stringify(p.solucao));
+    const chaves = TODOS_OS_PROBLEMAS.map((p) => JSON.stringify(p.solucao));
     expect(new Set(chaves).size).toBe(chaves.length);
   });
 
   it("o eixo tem rótulos, um por posição", () => {
-    for (const p of PROBLEMAS_NIVEL_2) {
+    for (const p of TODOS_OS_PROBLEMAS) {
       expect(p.rotulosPosicao, `${p.id} sem rótulos de eixo`).toHaveLength(p.posicoes);
     }
   });
 });
 
-describe("banco de nível 2 — o TEXTO das pistas", () => {
-  const todasAsPistas = PROBLEMAS_NIVEL_2.flatMap((p) =>
+describe("banco dos níveis 2 a 5 — o TEXTO das pistas", () => {
+  const todasAsPistas = TODOS_OS_PROBLEMAS.flatMap((p) =>
     p.pistas.map((pista) => ({ puzzle: p.id, pista }))
   );
 
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/grade/problemas/nivel3.ts
?? lib/grade/problemas/nivel4.ts
?? lib/grade/problemas/nivel5.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-12 ==
