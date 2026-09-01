import { describe, expect, it } from "vitest";
import { BANCO } from "./banco";
import { faseDaDificuldade, proximoProblema, type Fase } from "./selecao";

const FASES: Fase[] = [1, 2, 3, 4, 5, 6, 7, 8];

describe("faseDaDificuldade", () => {
  it("cobre a escala 1–10 sem buraco, começa na fase 1 e é monotônica", () => {
    const fases = Array.from({ length: 10 }, (_, i) => faseDaDificuldade(i + 1));

    expect(fases.every((fase) => fase >= 1 && fase <= 8)).toBe(true);
    expect(faseDaDificuldade(1)).toBe(1);
    expect(faseDaDificuldade(3)).toBe(2);
    expect(faseDaDificuldade(10)).toBe(8);
    for (let i = 1; i < fases.length; i += 1) {
      expect(fases[i]).toBeGreaterThanOrEqual(fases[i - 1]);
    }
  });
});

describe("proximoProblema", () => {
  it.each(FASES)("percorre a fase %i inteira sem repetir nenhum problema", (fase) => {
    const total = BANCO.filter((p) => p.fase === fase).length;
    const usados: string[] = [];
    const tipos: string[] = [];

    for (let i = 0; i < total; i += 1) {
      const problema = proximoProblema(fase, usados, tipos, () => 0);
      expect(usados).not.toContain(problema.id);
      usados.push(problema.id);
      tipos.push(problema.tipo);
    }

    expect(new Set(usados).size).toBe(total);
  });

  it("nunca serve 6 discos fora da fase 8", () => {
    let seisForaDaFase8 = 0;
    for (const fase of FASES) {
      const usados: string[] = [];
      for (let i = 0; i < 40; i += 1) {
        const problema = proximoProblema(fase, usados, [], () => (i % 7) / 7);
        if (problema.discos === 6 && fase !== 8) seisForaDaFase8 += 1;
        usados.push(problema.id);
      }
    }
    expect(seisForaDaFase8).toBe(0);
  });

  it("evita um terceiro problema do mesmo tipo quando há alternativa", () => {
    const fase: Fase = 6;
    const tipoRepetido = BANCO.find((p) => p.fase === fase)!.tipo;
    const problema = proximoProblema(fase, [], [tipoRepetido, tipoRepetido], () => 0);
    expect(problema.tipo).not.toBe(tipoRepetido);
  });

  it("com a fase esgotada, recomeça sem repetir o problema imediatamente anterior", () => {
    // Numa fase com mais de um problema, esgotar não pode servir o mesmo de novo em seguida.
    const fase = ([3, 4, 5, 6, 7, 8] as Fase[]).find(
      (f) => BANCO.filter((p) => p.fase === f).length >= 2
    )!;
    const usados = BANCO.filter((p) => p.fase === fase).map((x) => x.id);
    const p = proximoProblema(fase, usados, [], () => 0);
    expect(p.id).not.toBe(usados[usados.length - 1]);
  });

  it("numa fase de um problema só, serve sempre o mesmo — é a porta de entrada", () => {
    // Fases 1 e 2 têm um formato só de propósito: aprender a regra. Repetir ali é o desenho,
    // não um defeito do seletor.
    for (const fase of [1, 2] as Fase[]) {
      const unico = BANCO.filter((p) => p.fase === fase);
      expect(unico).toHaveLength(1);
      expect(proximoProblema(fase, [unico[0].id], [], () => 0).id).toBe(unico[0].id);
    }
  });
});
