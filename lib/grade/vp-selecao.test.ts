import { describe, expect, it } from "vitest";
import { selecionarProblema, nivelDaDificuldade, PROBLEMAS_GRADE, BANCO_GRADE } from "./banco";
import { avaliarEstrutura } from "./estrutura";

// A ligação do banco à tela é o último elo, e o mais fácil de errar em silêncio: um mapeamento
// torto entrega ao paciente um problema de carga errada, e nada acusa.
describe("seleção do problema por dificuldade", () => {
  it("cobre a faixa inteira de dificuldade sem buraco", () => {
    for (let dificuldade = 1; dificuldade <= 13; dificuldade += 1) {
      const puzzle = selecionarProblema(dificuldade);
      expect(puzzle, `dificuldade ${dificuldade}`).toBeDefined();
      expect(puzzle.nivel).toBe(nivelDaDificuldade(dificuldade));
    }
  });

  it("a carga cresce com a dificuldade, e nunca regride", () => {
    let anterior = 0;
    for (let dificuldade = 1; dificuldade <= 13; dificuldade += 1) {
      const nivel = nivelDaDificuldade(dificuldade);
      expect(nivel, `dificuldade ${dificuldade} regrediu`).toBeGreaterThanOrEqual(anterior);
      anterior = nivel;
    }
    expect(nivelDaDificuldade(1)).toBe(2);
    expect(nivelDaDificuldade(13)).toBe(5);
  });

  it("nenhum problema servido ao paciente reprova na régua", () => {
    for (let dificuldade = 1; dificuldade <= 13; dificuldade += 1) {
      const puzzle = selecionarProblema(dificuldade);
      const relatorio = avaliarEstrutura(puzzle);
      expect(relatorio.aprovado, `d${dificuldade} → ${puzzle.id}: ${relatorio.motivos.join(" | ")}`).toBe(true);
    }
  });

  it("`usados` pula o que já veio — o gancho da sequência dentro da sessão", () => {
    const primeiro = selecionarProblema(1);
    const segundo = selecionarProblema(1, [primeiro.id]);
    expect(segundo.id).not.toBe(primeiro.id);
    expect(segundo.nivel).toBe(primeiro.nivel);
  });

  it("esgotado o nível, recomeça em vez de devolver nada", () => {
    const doNivel = PROBLEMAS_GRADE.filter((p) => p.nivel === 2).map((p) => p.id);
    const escolhido = selecionarProblema(1, doNivel);
    expect(doNivel).toContain(escolhido.id);
  });

  it("o tutorial não é servido como desafio", () => {
    const idsServidos = new Set(
      Array.from({ length: 13 }, (_, i) => selecionarProblema(i + 1).id)
    );
    const tutorial = BANCO_GRADE.find((p) => p.nivel === 1);
    expect(tutorial).toBeDefined();
    expect(idsServidos.has(tutorial!.id)).toBe(false);
  });
});
