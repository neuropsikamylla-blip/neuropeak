== DIFF do lab grade-estrutura (contra a base do bundle) ==
diff --git a/components/exercises/executive/DeductiveGrid.tsx b/components/exercises/executive/DeductiveGrid.tsx
index 078448c6..a07e8317 100644
--- a/components/exercises/executive/DeductiveGrid.tsx
+++ b/components/exercises/executive/DeductiveGrid.tsx
@@ -10,15 +10,21 @@ import {
   admiteSolucao,
   celulasComValorRepetido,
   chavePosicaoGrade,
+  consumirVerificacao,
   criarGradeVazia,
   estadoDaAtribuicao,
   gradeEstaCorreta,
   mensagemVerificacao,
   paraMarcacaoParcial,
+  pistasEmConflito,
+  registrarCorrecaoDasVerificacoes,
   resumirAtribuicoes,
   selecionarProblema,
   verificacaoDisponivel,
+  verificacoesPermitidas,
   type RegistroAtribuicao,
+  type RegistroVerificacao,
+  type QuantidadeVerificacoes,
   type ValorCelula,
   type Puzzle,
 } from "@/lib/grade";
@@ -40,6 +46,7 @@ interface EventoPista {
 
 interface RegistroProblema {
   atribuicoes: RegistroAtribuicao[];
+  verificacoes: RegistroVerificacao[];
   eventosPista: EventoPista[];
   latenciaPrimeiraAcao: number | null;
   totalAcoes: number;
@@ -50,6 +57,7 @@ interface RegistroProblema {
 function novoRegistroProblema(): RegistroProblema {
   return {
     atribuicoes: [],
+    verificacoes: [],
     eventosPista: [],
     latenciaPrimeiraAcao: null,
     totalAcoes: 0,
@@ -131,6 +139,9 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
   const [pistasRiscadas, setPistasRiscadas] = useState<Set<string>>(() => new Set());
   const [mensagem, setMensagem] = useState<string | null>(null);
   const [concluido, setConcluido] = useState(false);
+  const [verificacoesRestantes, setVerificacoesRestantes] = useState<QuantidadeVerificacoes>(() =>
+    verificacoesPermitidas(PROBLEMA_TUTORIAL.nivel, true)
+  );
   const inicioProblema = useRef(Date.now());
   const registro = useRef<RegistroProblema>(novoRegistroProblema());
   const transicao = useRef<ReturnType<typeof setTimeout> | null>(null);
@@ -160,6 +171,19 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     });
   }
 
+  function registrarCorrecaoSeNecessaria(
+    proximaGrade: Record<string, ValorCelula[]>,
+    momento: number
+  ): void {
+    if (!admiteSolucao(puzzle, paraMarcacaoParcial(proximaGrade))) return;
+    registro.current.verificacoes = registrarCorrecaoDasVerificacoes(
+      registro.current.verificacoes,
+      puzzle.id,
+      registro.current.totalAcoes,
+      momento
+    );
+  }
+
   function atribuir(categoria: string, posicao: number, valor: string): void {
     if (concluido) return;
     const valorAnterior = grade[categoria][posicao - 1];
@@ -173,25 +197,30 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
       valor,
       posicao
     );
+    const momento = registrarAcao();
     registro.current.atribuicoes.push({
       categoria,
       valor,
       posicao,
-      momento: registrarAcao(),
+      momento,
       valorAnterior,
       relacaoJaEstavaLogicamenteDeterminada: estado === "determinada",
       estadoDaAtribuicao: estado,
       revisadaDepois: false,
     });
-    setGrade((atual) => celulaComValor(atual, categoria, posicao, valor));
+    const proximaGrade = celulaComValor(grade, categoria, posicao, valor);
+    registrarCorrecaoSeNecessaria(proximaGrade, momento);
+    setGrade(proximaGrade);
     setMensagem(null);
   }
 
   function limpar(categoria: string, posicao: number): void {
     if (concluido || grade[categoria][posicao - 1] === null) return;
     marcarAtribuicoesRevisadas(categoria, posicao);
-    registrarAcao();
-    setGrade((atual) => celulaComValor(atual, categoria, posicao, null));
+    const momento = registrarAcao();
+    const proximaGrade = celulaComValor(grade, categoria, posicao, null);
+    registrarCorrecaoSeNecessaria(proximaGrade, momento);
+    setGrade(proximaGrade);
     setMensagem(null);
   }
 
@@ -215,10 +244,29 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
   }
 
   function verificar(): void {
-    if (concluido || !verificacaoDisponivel(puzzle.nivel)) return;
-    registrarAcao();
-    registro.current.usosVerificarRaciocinio += 1;
-    const temIncompatibilidade = !admiteSolucao(puzzle, paraMarcacaoParcial(grade));
+    if (concluido || !verificacaoDisponivel(verificacoesRestantes)) return;
+    const momento = registrarAcao();
+    const parcial = paraMarcacaoParcial(grade);
+    const temIncompatibilidade = !admiteSolucao(puzzle, parcial);
+    const proximasRestantes = consumirVerificacao(verificacoesRestantes);
+    const ordemVerificacao = registro.current.usosVerificarRaciocinio + 1;
+    registro.current.usosVerificarRaciocinio = ordemVerificacao;
+    // `pistasEmConflito` devolve um conjunto seguro de pistas relevantes, não um MUS.
+    // A contagem registra somente o que o motor sustenta, sem atribuir minimalidade.
+    const quantidadeContradicoes = pistasEmConflito(puzzle, parcial).length;
+    registro.current.verificacoes.push({
+      puzzleId: puzzle.id,
+      numeroAcao: registro.current.totalAcoes,
+      tempoDesdeInicio: momento,
+      ordemVerificacao,
+      verificacoesRestantes: proximasRestantes,
+      estado: temIncompatibilidade ? "inconsistente" : "consistente",
+      quantidadeContradicoes,
+      corrigidaDepois: false,
+      acoesAteCorrecao: null,
+      tempoAteCorrecao: null,
+    });
+    setVerificacoesRestantes(proximasRestantes);
     setMensagem(mensagemVerificacao(puzzle.nivel, temIncompatibilidade));
   }
 
@@ -229,6 +277,7 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     setPistasRiscadas(new Set());
     setMensagem(null);
     setConcluido(false);
+    setVerificacoesRestantes(verificacoesPermitidas(desafio.nivel, false));
     registro.current = novoRegistroProblema();
     inicioProblema.current = Date.now();
   }
@@ -252,12 +301,14 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
     }
 
     const atribuicoes = registro.current.atribuicoes.map((atribuicao) => ({ ...atribuicao }));
+    const verificacoes = registro.current.verificacoes.map((verificacao) => ({ ...verificacao }));
     const eventosPista = registro.current.eventosPista.map((evento) => ({ ...evento }));
     const resumo = resumirAtribuicoes(atribuicoes);
     const metadata = {
       puzzleId: puzzle.id,
       nivel: puzzle.nivel,
       atribuicoes,
+      verificacoes,
       eventosPista,
       ...resumo,
       latenciaPrimeiraAcao: registro.current.latenciaPrimeiraAcao ?? tempoTotal,
@@ -448,7 +499,7 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
             )}
 
             <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
-              {verificacaoDisponivel(puzzle.nivel) && (
+              {verificacaoDisponivel(verificacoesRestantes) && (
                 <button
                   type="button"
                   onClick={verificar}
@@ -456,6 +507,7 @@ export function DeductiveGrid({ difficulty, theme, onComplete }: DeductiveGridPr
                   className={`min-h-11 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${pal.secundaria}`}
                 >
                   Verificar raciocínio
+                  {verificacoesRestantes === "livre" ? "" : ` · ${verificacoesRestantes}`}
                 </button>
               )}
               <button
diff --git a/lib/grade/index.ts b/lib/grade/index.ts
index 2171fecc..efa40780 100644
--- a/lib/grade/index.ts
+++ b/lib/grade/index.ts
@@ -8,27 +8,43 @@ export {
   validarPuzzle,
 } from "./solver";
 export { derivar } from "./derivacao";
+export {
+  LIMIAR_ORDEM_DECLARADA,
+  avaliarEstrutura,
+} from "./estrutura";
+export type {
+  ArestaCategorias,
+  ProfundidadeInferencial,
+  RelatorioEstrutural,
+} from "./estrutura";
 export { BANCO_GRADE, PROBLEMA_TUTORIAL, PROBLEMAS_GRADE, selecionarProblema } from "./banco";
 export {
+  CONFIGURACAO_VERIFICACOES,
+  MENSAGEM_COM_INCOMPATIBILIDADE,
   MENSAGEM_SEM_INCOMPATIBILIDADE,
-  NIVEIS_COM_VERIFICACAO,
   PESO_TENTATIVA_INCORRETA,
   acuraciaDoProblema,
   celulasComValorRepetido,
   chavePosicaoGrade,
+  consumirVerificacao,
   estadoDaAtribuicao,
   criarGradeVazia,
   gradeEstaCorreta,
   mensagemVerificacao,
   paraMarcacaoParcial,
+  registrarCorrecaoDasVerificacoes,
   relacaoJaDeterminada,
   resumirAtribuicoes,
   verificacaoDisponivel,
+  verificacoesPermitidas,
 } from "./interacao";
 export type {
+  ConfiguracaoVerificacoes,
   EstadoDaAtribuicao,
   EstadoGrade,
+  QuantidadeVerificacoes,
   RegistroAtribuicao,
+  RegistroVerificacao,
   ResumoAtribuicoes,
   ValorCelula,
 } from "./interacao";
diff --git a/lib/grade/interacao.test.ts b/lib/grade/interacao.test.ts
index b5def3d4..793afbf1 100644
--- a/lib/grade/interacao.test.ts
+++ b/lib/grade/interacao.test.ts
@@ -1,18 +1,25 @@
 import { describe, expect, it } from "vitest";
 import {
   BANCO_GRADE,
+  CONFIGURACAO_VERIFICACOES,
+  MENSAGEM_COM_INCOMPATIBILIDADE,
+  MENSAGEM_SEM_INCOMPATIBILIDADE,
   acuraciaDoProblema,
   celulasComValorRepetido,
   chavePosicaoGrade,
+  consumirVerificacao,
   estadoDaAtribuicao,
   mensagemVerificacao,
   paraMarcacaoParcial,
   PROBLEMA_TUTORIAL,
+  registrarCorrecaoDasVerificacoes,
   relacaoJaDeterminada,
   resumirAtribuicoes,
   temSolucaoUnica,
   verificacaoDisponivel,
+  verificacoesPermitidas,
   type RegistroAtribuicao,
+  type RegistroVerificacao,
 } from "./index";
 
 describe("banco da Grade Dedutiva — Fase 3", () => {
@@ -52,12 +59,58 @@ describe("regras puras da interface", () => {
     }
   });
 
-  it("não disponibiliza o botão de verificar nos níveis avançados", () => {
+  it("limita verificações por nível, mantém o tutorial livre e aceita configuração zero", () => {
+    expect(verificacoesPermitidas(1, false)).toBe(3);
+    expect(verificacoesPermitidas(2, false)).toBe(3);
+    expect(verificacoesPermitidas(3, false)).toBe(2);
+    expect(verificacoesPermitidas(4, false)).toBe(1);
+    expect(verificacoesPermitidas(5, false)).toBe(1);
+    expect(verificacoesPermitidas(5, true)).toBe("livre");
+    expect(verificacoesPermitidas(5, false, {
+      ...CONFIGURACAO_VERIFICACOES,
+      porNivel: { ...CONFIGURACAO_VERIFICACOES.porNivel, 5: 0 },
+    })).toBe(0);
+  });
+
+  it("não deixa a contagem negativa e oculta o recurso quando chega a zero", () => {
+    expect(consumirVerificacao(1)).toBe(0);
+    expect(consumirVerificacao(0)).toBe(0);
+    expect(consumirVerificacao("livre")).toBe("livre");
     expect(verificacaoDisponivel(1)).toBe(true);
-    expect(verificacaoDisponivel(2)).toBe(true);
-    expect(verificacaoDisponivel(3)).toBe(true);
-    expect(verificacaoDisponivel(4)).toBe(false);
-    expect(verificacaoDisponivel(5)).toBe(false);
+    expect(verificacaoDisponivel("livre")).toBe(true);
+    expect(verificacaoDisponivel(0)).toBe(false);
+  });
+
+  it("usa exatamente as duas mensagens genéricas definidas", () => {
+    expect(mensagemVerificacao(1, true)).toBe(MENSAGEM_COM_INCOMPATIBILIDADE);
+    expect(mensagemVerificacao(5, true)).toBe(
+      "Existe uma incompatibilidade na sua organização. Revise suas escolhas."
+    );
+    expect(mensagemVerificacao(1, false)).toBe(MENSAGEM_SEM_INCOMPATIBILIDADE);
+    expect(mensagemVerificacao(5, false)).toBe(
+      "Até aqui, sua organização é compatível com as pistas."
+    );
+  });
+
+  it("registra factual e objetivamente a correção posterior a uma verificação", () => {
+    const verificacao: RegistroVerificacao = {
+      puzzleId: "puzzle-1",
+      numeroAcao: 4,
+      tempoDesdeInicio: 1200,
+      ordemVerificacao: 1,
+      verificacoesRestantes: 2,
+      estado: "inconsistente",
+      quantidadeContradicoes: 3,
+      corrigidaDepois: false,
+      acoesAteCorrecao: null,
+      tempoAteCorrecao: null,
+    };
+    expect(registrarCorrecaoDasVerificacoes([verificacao], "puzzle-1", 7, 2100)).toEqual([{
+      ...verificacao,
+      corrigidaDepois: true,
+      acoesAteCorrecao: 3,
+      tempoAteCorrecao: 900,
+    }]);
   });
 
   it("consulta o solver para saber se uma relação já foi determinada", () => {
diff --git a/lib/grade/interacao.ts b/lib/grade/interacao.ts
index 92cf10ba..d75cf072 100644
--- a/lib/grade/interacao.ts
+++ b/lib/grade/interacao.ts
@@ -4,23 +4,87 @@ import type { MarcacaoParcial, Puzzle } from "./tipos";
 export type ValorCelula = string | null;
 export type EstadoGrade = Readonly<Record<string, readonly ValorCelula[]>>;
 
+export type QuantidadeVerificacoes = number | "livre";
+
 /**
- * Regra de conteúdo ajustável: níveis 1–2 são iniciais, 3 é intermediário e
- * 4–5 são avançados, portanto não exibem a verificação.
+ * Configuração única e recalibrável da ajuda: o tutorial ensina a mecânica;
+ * nos problemas de treino, a quantidade diminui conforme o nível aumenta.
+ * Valores zero são válidos e retiram o recurso daquele nível.
  */
-export const NIVEIS_COM_VERIFICACAO: readonly Puzzle["nivel"][] = [1, 2, 3];
+export interface ConfiguracaoVerificacoes {
+  tutorial: "livre";
+  porNivel: Readonly<Record<Puzzle["nivel"], number>>;
+}
+
+export const CONFIGURACAO_VERIFICACOES: Readonly<ConfiguracaoVerificacoes> = {
+  tutorial: "livre",
+  porNivel: { 1: 3, 2: 3, 3: 2, 4: 1, 5: 1 },
+};
+
+export const MENSAGEM_COM_INCOMPATIBILIDADE =
+  "Existe uma incompatibilidade na sua organização. Revise suas escolhas.";
+export const MENSAGEM_SEM_INCOMPATIBILIDADE =
+  "Até aqui, sua organização é compatível com as pistas.";
+
+export function verificacoesPermitidas(
+  nivel: Puzzle["nivel"],
+  ehTutorial: boolean,
+  configuracao: Readonly<ConfiguracaoVerificacoes> = CONFIGURACAO_VERIFICACOES
+): QuantidadeVerificacoes {
+  return ehTutorial ? configuracao.tutorial : configuracao.porNivel[nivel];
+}
 
-export const MENSAGEM_SEM_INCOMPATIBILIDADE = "Nenhuma incompatibilidade encontrada até aqui.";
+export function verificacaoDisponivel(restantes: QuantidadeVerificacoes): boolean {
+  return restantes === "livre" || restantes > 0;
+}
 
-export function verificacaoDisponivel(nivel: Puzzle["nivel"]): boolean {
-  return NIVEIS_COM_VERIFICACAO.includes(nivel);
+export function consumirVerificacao(restantes: QuantidadeVerificacoes): QuantidadeVerificacoes {
+  return restantes === "livre" ? restantes : Math.max(0, restantes - 1);
 }
 
-export function mensagemVerificacao(nivel: Puzzle["nivel"], temIncompatibilidade: boolean): string {
-  if (!temIncompatibilidade) return MENSAGEM_SEM_INCOMPATIBILIDADE;
-  return nivel <= 2
-    ? "Existe uma incompatibilidade no seu raciocínio. Revise suas conclusões."
-    : "Existe pelo menos uma incompatibilidade. Revise antes de continuar.";
+export function mensagemVerificacao(
+  _nivel: Puzzle["nivel"],
+  temIncompatibilidade: boolean
+): string {
+  return temIncompatibilidade
+    ? MENSAGEM_COM_INCOMPATIBILIDADE
+    : MENSAGEM_SEM_INCOMPATIBILIDADE;
+}
+
+export interface RegistroVerificacao {
+  puzzleId: string;
+  numeroAcao: number;
+  tempoDesdeInicio: number;
+  ordemVerificacao: number;
+  verificacoesRestantes: QuantidadeVerificacoes;
+  estado: "consistente" | "inconsistente";
+  quantidadeContradicoes: number;
+  corrigidaDepois: boolean;
+  acoesAteCorrecao: number | null;
+  tempoAteCorrecao: number | null;
+}
+
+export function registrarCorrecaoDasVerificacoes(
+  verificacoes: readonly RegistroVerificacao[],
+  puzzleId: string,
+  numeroAcao: number,
+  tempoDesdeInicio: number
+): RegistroVerificacao[] {
+  return verificacoes.map((verificacao) => {
+    if (
+      verificacao.puzzleId !== puzzleId
+      || verificacao.estado !== "inconsistente"
+      || verificacao.corrigidaDepois
+    ) {
+      return verificacao;
+    }
+    return {
+      ...verificacao,
+      corrigidaDepois: true,
+      acoesAteCorrecao: Math.max(0, numeroAcao - verificacao.numeroAcao),
+      tempoAteCorrecao: Math.max(0, tempoDesdeInicio - verificacao.tempoDesdeInicio),
+    };
+  });
 }
 
 /** Chave sem delimitadores ambíguos para uma célula visual da grade. */
== ARQUIVOS NOVOS (nao aparecem no diff — trazer cada um e passo explicito) ==
?? lib/grade/estrutura.test.ts
?? lib/grade/estrutura.ts
== RITO APOS COLHER: Claude le o diff linha a linha, aplica no repo real, roda as provas la, commita citando a origem, e por fim: lab.sh remover grade-estrutura ==
