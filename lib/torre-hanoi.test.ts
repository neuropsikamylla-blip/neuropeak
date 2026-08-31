import { describe, expect, it } from "vitest";
import { julgarPuzzle } from "./torre-hanoi";

describe("julgarPuzzle", () => {
  it.each([
    { moves: 7, optimal: 7, restarts: 0, isOptimal: true },
    { moves: 7, optimal: 7, restarts: 1, isOptimal: false },
    { moves: 7, optimal: 7, restarts: 2, isOptimal: false },
    { moves: 8, optimal: 7, restarts: 0, isOptimal: false },
    { moves: 8, optimal: 7, restarts: 1, isOptimal: false },
    { moves: 8, optimal: 7, restarts: 2, isOptimal: false },
  ] as const)(
    "julga moves=$moves, minimo=$optimal e reinicios=$restarts como otimo=$isOptimal",
    ({ moves, optimal, restarts, isOptimal }) => {
      expect(julgarPuzzle({ moves, optimal, restarts })).toEqual({ optimal: isOptimal });
    }
  );

  it("reiniciar uma tentativa com movimentos minimos nao permite subir de nivel", () => {
    for (const restarts of [1, 2]) {
      expect(julgarPuzzle({ moves: 7, optimal: 7, restarts }).optimal).toBe(false);
    }
  });
});
