import { describe, expect, it } from "vitest";
import { BANCO } from "./banco";
import { faseDaDificuldade, proximoProblema, type Fase } from "./selecao";

const FASES: Fase[] = [1, 2, 3, 4, 5, 6];

describe("faseDaDificuldade", () => {
  it("cobre a escala 1–10 sem buraco e sem passar de 6", () => {
    const fases = Array.from({ length: 10 }, (_, i) => faseDaDificuldade(i + 1));
    expect(fases.every((f) => f >= 1 && f <= 6)).toBe(true);
    expect(faseDaDificuldade(1)).toBe(1);
    expect(faseDaDificuldade(10)).toBe(6);
    // monotônica: nunca desce quando a dificuldade sobe
    for (let i = 1; i < fases.length; i++) expect(fases[i]).toBeGreaterThanOrEqual(fases[i - 1]);
  });
});

describe("proximoProblema", () => {
  it.each(FASES)("percorre a fase %i inteira sem repetir nenhum problema", (fase) => {
    const total = BANCO.filter((p) => p.fase === fase).length;
    const usados: string[] = [];
    const tipos: string[] = [];
    for (let i = 0; i < total; i++) {
      const p = proximoProblema(fase, usados, tipos, () => 0);
      expect(usados).not.toContain(p.id);   // prova a ausência, não a presença
      usados.push(p.id);
      tipos.push(p.tipo);
    }
    expect(new Set(usados).size).toBe(total);
  });

  it("nunca serve 6 discos fora da fase 6", () => {
    let seisForaDaFase6 = 0;
    for (const fase of FASES) {
      const usados: string[] = [];
      for (let i = 0; i < 40; i++) {
        const p = proximoProblema(fase, usados, [], () => (i % 7) / 7);
        if (p.discos === 6 && fase !== 6) seisForaDaFase6++;
        usados.push(p.id);
      }
    }
    expect(seisForaDaFase6).toBe(0);
  });

  it("evita um terceiro problema do mesmo tipo quando há alternativa", () => {
    const fase: Fase = 3;
    const tipoRepetido = BANCO.find((p) => p.fase === fase)!.tipo;
    const p = proximoProblema(fase, [], [tipoRepetido, tipoRepetido], () => 0);
    expect(p.tipo).not.toBe(tipoRepetido);
  });

  it("com a fase esgotada, recomeça sem repetir o problema imediatamente anterior", () => {
    const fase: Fase = 1;
    const daFase = BANCO.filter((p) => p.fase === fase);
    if (daFase.length < 2) {
      // A fase 1 é curta de propósito; o contrato ainda vale: devolve algo válido.
      const p = proximoProblema(fase, daFase.map((x) => x.id), [], () => 0);
      expect(p.fase).toBe(fase);
      return;
    }
    const usados = daFase.map((x) => x.id);
    const p = proximoProblema(fase, usados, [], () => 0);
    expect(p.id).not.toBe(usados[usados.length - 1]);
  });
});
