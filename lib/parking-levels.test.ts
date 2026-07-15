// Valida o banco GERADO de fases do Estacionamento Lógico (lib/parking-levels.ts)
// com um solver BFS INDEPENDENTE do gerador (implementação própria, por varredura
// de alcance na grade) — se gerador e teste concordarem no mínimo de movimentos de
// todas as fases, o banco é confiável como régua clínica.
import { describe, it, expect } from "vitest";
import { PARKING_LEVELS, PLAY_LEVELS } from "./parking-levels";
import type { ParkingCar } from "@/types/parking";

const GRID = 6;
const EXIT_ROW = 2;

// Faixa de "mínimo de movimentos" permitida por nível da escada (spec do épico).
const RANGE: Record<number, [number, number]> = {
  1: [5, 5], 2: [6, 6], 3: [7, 7], 4: [8, 8], 5: [9, 9],
  6: [10, 10], 7: [11, 12], 8: [13, 14], 9: [15, 16], 10: [17, 99],
};

function occupiedCells(c: ParkingCar): Array<[number, number]> {
  return Array.from({ length: c.len }, (_, i) =>
    c.orientation === "vertical" ? [c.row + i, c.col] as [number, number] : [c.row, c.col + i] as [number, number]
  );
}

// BFS por MOVIMENTO (mover um carro = 1, qualquer distância), implementado por
// varredura de alcance na grade — abordagem diferente da do gerador de propósito.
function minMovesIndependent(start: ParkingCar[]): number | null {
  const key = (cs: ParkingCar[]) => cs.map((c) => (c.orientation === "horizontal" ? c.col : c.row)).join(",");
  const win = (cs: ParkingCar[]) => {
    const t = cs.find((c) => c.id === "target")!;
    return t.col + t.len >= GRID;
  };
  if (win(start)) return 0;
  const seen = new Set([key(start)]);
  let frontier = [start];
  for (let dist = 1; frontier.length; dist++) {
    const next: ParkingCar[][] = [];
    for (const state of frontier) {
      const grid: boolean[][] = Array.from({ length: GRID }, () => Array(GRID).fill(false));
      for (const c of state) for (const [r, col] of occupiedCells(c)) grid[r][col] = true;
      for (let i = 0; i < state.length; i++) {
        const car = state[i];
        // limpa as células do próprio carro para calcular o alcance
        for (const [r, col] of occupiedCells(car)) grid[r][col] = false;
        let lo: number, hi: number;
        if (car.orientation === "horizontal") {
          lo = car.col; hi = car.col;
          while (lo > 0 && !grid[car.row][lo - 1]) lo--;
          while (hi < GRID - car.len && !grid[car.row][hi + car.len]) hi++;
        } else {
          lo = car.row; hi = car.row;
          while (lo > 0 && !grid[lo - 1][car.col]) lo--;
          while (hi < GRID - car.len && !grid[hi + car.len][car.col]) hi++;
        }
        const cur = car.orientation === "horizontal" ? car.col : car.row;
        for (let p = lo; p <= hi; p++) {
          if (p === cur) continue;
          const ns = state.map((c, j) =>
            j !== i ? c : c.orientation === "horizontal" ? { ...c, col: p } : { ...c, row: p }
          );
          if (win(ns)) return dist;
          const k = key(ns);
          if (!seen.has(k)) { seen.add(k); next.push(ns); }
        }
        for (const [r, col] of occupiedCells(car)) grid[r][col] = true;
      }
    }
    frontier = next;
  }
  return null;
}

describe("banco de fases do Estacionamento (gerado)", () => {
  it("tem fases em todos os níveis 1–10", () => {
    expect(PLAY_LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const l of PLAY_LEVELS) expect(PARKING_LEVELS[l].length).toBeGreaterThanOrEqual(20);
  });

  it("estrutura válida: alvo na fileira da saída, sem sobreposição, ids únicos, tabuleiro cheio", () => {
    const ids = new Set<string>();
    for (const l of PLAY_LEVELS) {
      for (const level of PARKING_LEVELS[l]) {
        expect(level.id).toBeTruthy();
        expect(ids.has(level.id!)).toBe(false);
        ids.add(level.id!);
        expect(level.cars.length).toBeGreaterThanOrEqual(5);

        const targets = level.cars.filter((c) => c.id === "target");
        expect(targets).toHaveLength(1);
        expect(targets[0].row).toBe(EXIT_ROW);
        expect(targets[0].orientation).toBe("horizontal");
        expect(targets[0].len).toBe(2);

        const seen = new Set<string>();
        for (const c of level.cars) {
          if (c.id !== "target" && c.orientation === "horizontal") expect(c.row).not.toBe(EXIT_ROW);
          for (const [r, col] of occupiedCells(c)) {
            expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThan(GRID);
            expect(col).toBeGreaterThanOrEqual(0); expect(col).toBeLessThan(GRID);
            const k = `${r},${col}`;
            expect(seen.has(k)).toBe(false);
            seen.add(k);
          }
        }
      }
    }
  });

  for (const l of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    it(`nível ${l}: mínimo de movimentos confere com solver independente e cai na faixa`, () => {
      const [lo, hi] = RANGE[l];
      for (const level of PARKING_LEVELS[l] ?? []) {
        expect(level.idealMoves).toBeGreaterThanOrEqual(lo);
        expect(level.idealMoves).toBeLessThanOrEqual(hi);
        expect(minMovesIndependent(level.cars)).toBe(level.idealMoves);
      }
    }, 120000);
  }
});
