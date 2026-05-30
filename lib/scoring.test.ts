import { describe, it, expect } from "vitest";
import {
  calculateExerciseScore,
  calculateAdherence,
  calculateDomainScore,
  calculateTrend,
  calculateSessionScore,
} from "@/lib/scoring";
import type { SessionData } from "@/types";

function mkSession(over: Partial<SessionData> = {}): SessionData {
  return {
    exerciseId: "e1",
    domain: "memory",
    score: 50,
    accuracy: 0.5,
    reactionTime: null,
    difficulty: 1,
    duration: 60,
    completedAt: new Date("2026-05-01T10:00:00Z"),
    ...over,
  };
}

describe("calculateExerciseScore", () => {
  it("accuracy 1.0 (sem rt, dificuldade base) = 100", () => {
    expect(calculateExerciseScore("x", 1.0)).toBe(100);
  });
  it("accuracy 0.5 ~= 50", () => {
    expect(calculateExerciseScore("x", 0.5)).toBeCloseTo(50, 5);
  });
  it("nunca passa de 100 (clamp superior)", () => {
    // exercicio com expected reaction time + rt rapido + dificuldade alta
    expect(calculateExerciseScore("tempo-reacao", 1.0, 100, 10)).toBeLessThanOrEqual(100);
  });
  it("nunca fica negativo", () => {
    expect(calculateExerciseScore("x", 0)).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateSessionScore", () => {
  it("lista vazia = 0", () => {
    expect(calculateSessionScore([])).toBe(0);
  });
  it("media ponderada", () => {
    expect(calculateSessionScore([{ score: 100 }, { score: 0 }])).toBe(50);
  });
});

describe("calculateAdherence (regressao BUG-04)", () => {
  it("expectedFrequency = 0 retorna 0, nao 100/Infinity", () => {
    expect(calculateAdherence([mkSession()], 0, new Date("2026-04-01"))).toBe(0);
  });
  it("expectedFrequency negativo retorna 0", () => {
    expect(calculateAdherence([mkSession()], -3, new Date("2026-04-01"))).toBe(0);
  });
  it("nunca passa de 100", () => {
    const many = Array.from({ length: 50 }, () => mkSession());
    expect(calculateAdherence(many, 1, new Date("2026-05-01"))).toBeLessThanOrEqual(100);
  });
});

describe("calculateTrend", () => {
  it("menos de 4 sessoes = stable", () => {
    expect(calculateTrend([mkSession(), mkSession(), mkSession()])).toBe("stable");
  });
  it("melhora clara = up", () => {
    const s: SessionData[] = [
      mkSession({ score: 10, completedAt: new Date("2026-05-01") }),
      mkSession({ score: 20, completedAt: new Date("2026-05-02") }),
      mkSession({ score: 80, completedAt: new Date("2026-05-03") }),
      mkSession({ score: 90, completedAt: new Date("2026-05-04") }),
    ];
    expect(calculateTrend(s)).toBe("up");
  });
});

describe("calculateDomainScore", () => {
  it("sem sessoes => todos os dominios com score 0", () => {
    const res = calculateDomainScore([]);
    expect(res.length).toBe(4);
    expect(res.every((d) => d.score === 0 && d.sessions === 0)).toBe(true);
  });
  it("agrega media por dominio", () => {
    const res = calculateDomainScore([
      mkSession({ domain: "memory", score: 80 }),
      mkSession({ domain: "memory", score: 60 }),
    ]);
    const mem = res.find((d) => d.domain === "memory");
    expect(mem?.score).toBe(70);
    expect(mem?.sessions).toBe(2);
  });
});
