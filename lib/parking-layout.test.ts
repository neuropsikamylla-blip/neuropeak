import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PARKING_LEVELS } from "./parking-levels";
import {
  BORDER, CELL_IDEAL, CELL_MIN, CORRIDOR, DAY_START_HOUR, medidasDoTabuleiro,
  NIGHT_START_HOUR, periodoDoDia, tamanhoDaCelula,
} from "./parking-layout";

const COMPONENT_PATH = resolve(process.cwd(), "components/exercises/executive/EstacionamentoLogico.tsx");

describe("layout do Estacionamento Lógico", () => {
  it("escolhe dia e noite pelas fronteiras configuráveis", () => {
    for (const hora of [
      0, Math.floor(DAY_START_HOUR / 2), DAY_START_HOUR - 1,
      NIGHT_START_HOUR, Math.floor((NIGHT_START_HOUR + 23) / 2), 23,
    ]) {
      expect(periodoDoDia(hora)).toBe("noite");
    }
    for (const hora of [DAY_START_HOUR, Math.floor((DAY_START_HOUR + NIGHT_START_HOUR) / 2), NIGHT_START_HOUR - 1]) {
      expect(periodoDoDia(hora)).toBe("dia");
    }
  });

  it("dimensiona células inteiras, confortáveis e limitadas pelo espaço real", () => {
    expect(tamanhoDaCelula(6, { largura: 1200, altura: 900 })).toBe(CELL_IDEAL);

    for (const espaco of [
      { largura: 320, altura: 568 },
      { largura: 393, altura: 852 },
      { largura: 768, altura: 1024 },
      { largura: 1280, altura: 800 },
      { largura: 1512, altura: 982 },
    ]) {
      const cellPx = tamanhoDaCelula(6, espaco);
      const medidas = medidasDoTabuleiro(6, cellPx);
      expect(Number.isInteger(cellPx)).toBe(true);
      expect(cellPx).toBeGreaterThanOrEqual(CELL_MIN);
      expect(cellPx).toBeLessThanOrEqual(CELL_IDEAL);
      expect(medidas.larguraComCorredor).toBeLessThanOrEqual(espaco.largura);
      expect(medidas.total).toBeLessThanOrEqual(espaco.altura);
    }

    const apertado = { largura: 500, altura: 300 };
    expect(tamanhoDaCelula(6, apertado)).toBe(
      Math.floor(Math.min(
        (apertado.largura - BORDER * 2 - CORRIDOR) / 6,
        (apertado.altura - BORDER * 2) / 6,
      )),
    );
  });

  it("nunca aumenta a célula ao aumentar o grid e expande a área física quando há espaço", () => {
    const espaco = { largura: 1600, altura: 1000 };
    const celulas = Array.from({ length: 8 }, (_, index) => tamanhoDaCelula(index + 3, espaco));
    for (let index = 1; index < celulas.length; index++) {
      expect(celulas[index]).toBeLessThanOrEqual(celulas[index - 1]);
    }

    const seis = medidasDoTabuleiro(6, tamanhoDaCelula(6, espaco));
    const sete = medidasDoTabuleiro(7, tamanhoDaCelula(7, espaco));
    const oito = medidasDoTabuleiro(8, tamanhoDaCelula(8, espaco));
    expect(sete.interno).toBeGreaterThan(seis.interno);
    expect(oito.interno).toBeGreaterThan(sete.interno);
  });

  it("mantém o banco em 6×6 enquanto a lógica usa GRID fixo", () => {
    for (const level of Object.values(PARKING_LEVELS).flat()) {
      expect(
        level.grid === undefined || level.grid === 6,
        `A fase ${level.id} declara grid ${level.grid}; migre a lógica que usa GRID fixo antes de adicionar grids maiores.`,
      ).toBe(true);
    }
  });

  it("não altera a contagem nem as fases geradas", () => {
    const levels = Object.values(PARKING_LEVELS);
    const fases = levels.flat();
    expect(levels).toHaveLength(10);
    expect(levels.every((nivel) => nivel.length === 40)).toBe(true);
    expect(fases).toHaveLength(400);
    expect(Math.max(...fases.map((level) => level.cars.length))).toBe(10);
  });

  it("preserva os contratos de UI e a lógica fixa", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8");
    const logica = source.slice(source.indexOf("function buildGrid"), source.indexOf("// ── Top-view vehicle"));
    const tutorialConcluido = source.slice(source.indexOf("// ── Tutorial concluído"), source.indexOf("// ── Result screen"));

    expect(source).not.toMatch(/transform:\s*["'`][^"'`]*scale\s*\(/);
    expect(tutorialConcluido).toContain("mx-auto");
    expect(tutorialConcluido).not.toContain("max-w-xs");
    expect(tutorialConcluido).not.toContain("#ECEAE4");
    expect(logica).not.toContain("gridDaFase");
    for (const functionName of ["buildGrid", "canMove", "isWin", "reachRange"]) {
      expect(logica.slice(logica.indexOf(`function ${functionName}`))).toContain("GRID");
    }
  });

  it("congela a régua funcional que o layout não pode mudar", () => {
    const porId = new Map(Object.values(PARKING_LEVELS).flat().map((level) => [level.id, level]));
    expect(porId.get("n1-01")?.idealMoves).toBe(5);
    expect(porId.get("n5-01")?.idealMoves).toBe(9);
    expect(porId.get("n10-01")?.idealMoves).toBe(18);

    const source = readFileSync(COMPONENT_PATH, "utf8");
    expect(source).toContain("const EXIT_ROW = 2");
    expect(source).toContain("const cellRule = curDiffRef.current >= 15");
  });
});
