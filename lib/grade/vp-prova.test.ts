import { describe, expect, it } from "vitest";
import { temSolucaoUnica, contarSolucoes, admiteSolucao } from "./index";
import { pistaSimples } from "./tipos";

const cats = [
  { id: "pessoa", label: "Pessoa", valores: ["Ana", "Bruno", "Carla"] },
  { id: "cor", label: "Cor", valores: ["Azul", "Verde", "Rosa"] },
  { id: "fruta", label: "Fruta", valores: ["Maçã", "Uva", "Pera"] },
];
const base = (pistas: any[]): any => ({
  id: "t", titulo: "t", contexto: "t", nivel: 1, posicoes: 3, categorias: cats, pistas,
  solucao: { pessoa: ["Ana", "Bruno", "Carla"], cor: ["Azul", "Verde", "Rosa"], fruta: ["Maçã", "Uva", "Pera"] }, metadata: {},
});
const T3 = (id: string, valor: string, posicao: number): any =>
  pistaSimples(id, id, { tipo: "T3", item: { categoria: "pessoa", valor }, posicao });
const T1 = (id: string, p: string, c: string): any =>
  pistaSimples(id, id, { tipo: "T1", itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "cor", valor: c } });

const T1f = (id: string, p: string, f: string): any =>
  pistaSimples(id, id, { tipo: "T1", itemA: { categoria: "pessoa", valor: p }, itemB: { categoria: "fruta", valor: f } });

/** Amarra as três categorias: solução única de verdade. */
const UNICO: any[] = [
  T3("p1", "Ana", 1), T3("p2", "Bruno", 2),
  T1("p3", "Ana", "Azul"), T1("p4", "Bruno", "Verde"),
  T1f("p5", "Ana", "Maçã"), T1f("p6", "Bruno", "Uva"),
];

// Prova ADVERSARIAL escrita pelo VP, independente da suíte do Codex: puzzles construídos para
// FALHAR, não para passar. É o que separa "os testes dele passam" de "o solver está certo".
describe("prova independente do solver", () => {
  it("puzzle AMBÍGUO é reprovado — a segunda categoria fica solta", () => {
    const p = base([T3("p1", "Ana", 1), T3("p2", "Bruno", 2)]);
    expect(temSolucaoUnica(p)).toBe(false);
    expect(contarSolucoes(p, 10)).toBeGreaterThan(1);
  });

  it("puzzle ÚNICO é aprovado", () => {
    const p = base(UNICO);
    expect(temSolucaoUnica(p)).toBe(true);
    expect(contarSolucoes(p, 10)).toBe(1);
  });

  it("puzzle IMPOSSÍVEL dá zero soluções", () => {
    expect(contarSolucoes(base([T3("p1", "Ana", 1), T3("p2", "Ana", 2)]), 10)).toBe(0);
  });

  it("HIPÓTESE não restringe e CONFIRMAÇÃO restringe — a MESMA marcação errada", () => {
    // A distinção que sustenta metade da espec dela (seções 7-8 e 35).
    const p = base(UNICO);
    const errada = (estado: string) => [{ categoria: "pessoa", valor: "Ana", posicao: 2, estado }] as any;
    expect(admiteSolucao(p, errada("hipotese"))).toBe(true);
    expect(admiteSolucao(p, errada("confirmado"))).toBe(false);
  });
});
