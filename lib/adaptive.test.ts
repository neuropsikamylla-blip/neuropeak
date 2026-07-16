import { describe, it, expect } from "vitest";
import { calculateNewDifficulty, checkAchievements, calculateProgression, calculateFocusProgression, focusDetectTargetMs } from "@/lib/adaptive";
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

describe("calculateNewDifficulty", () => {
  it("menos de 2 sessoes relevantes => maintain", () => {
    const r = calculateNewDifficulty(5, [mkSession({ exerciseId: "e1" })], "e1");
    expect(r.action).toBe("maintain");
    expect(r.newDifficulty).toBe(5);
  });
  it("precisao media > 85% => increase (+1)", () => {
    const s = Array.from({ length: 3 }, () => mkSession({ exerciseId: "e1", accuracy: 0.9 }));
    const r = calculateNewDifficulty(5, s, "e1");
    expect(r.action).toBe("increase");
    expect(r.newDifficulty).toBe(6);
  });
  it("precisao media < 60% => decrease (-1)", () => {
    const s = Array.from({ length: 3 }, () => mkSession({ exerciseId: "e1", accuracy: 0.4 }));
    const r = calculateNewDifficulty(5, s, "e1");
    expect(r.action).toBe("decrease");
    expect(r.newDifficulty).toBe(4);
  });
  it("nao ultrapassa 10 nem cai abaixo de 1", () => {
    const hi = Array.from({ length: 3 }, () => mkSession({ exerciseId: "e1", accuracy: 0.95 }));
    expect(calculateNewDifficulty(10, hi, "e1").newDifficulty).toBe(10);
    const lo = Array.from({ length: 3 }, () => mkSession({ exerciseId: "e1", accuracy: 0.2 }));
    expect(calculateNewDifficulty(1, lo, "e1").newDifficulty).toBe(1);
  });
  it("so considera sessoes do mesmo exerciseId", () => {
    const s = [
      mkSession({ exerciseId: "outro", accuracy: 0.95 }),
      mkSession({ exerciseId: "outro", accuracy: 0.95 }),
    ];
    expect(calculateNewDifficulty(5, s, "e1").action).toBe("maintain");
  });
});

describe("calculateProgression — teto de nível (CORR-001)", () => {
  const good = { accTotal: 0.9 }; // desempenho que sobe de nível

  it("por padrão limita em 10 (não passa de 10)", () => {
    expect(calculateProgression(10, good, 1).nextLevel).toBe(10);
    expect(calculateProgression(9, good, 1).nextLevel).toBe(10);
  });

  it("com maxLevel 12 (Supermercado) não rebaixa quem está em 11/12", () => {
    // Antes do fix, 12 virava 10 (rebaixava o paciente de elite).
    expect(calculateProgression(11, good, 1, 12).nextLevel).toBe(12);
    expect(calculateProgression(12, good, 1, 12).nextLevel).toBe(12);
  });

  it("com maxLevel 12, nível 10 ainda pode subir para 11", () => {
    expect(calculateProgression(10, good, 1, 12).nextLevel).toBe(11);
  });
});

describe("calculateFocusProgression — critério duplo VP+atenção (16/jul)", () => {
  it("régua de detecção: 3,5s no nível 1 → 1,5s no nível 10 (com clamp)", () => {
    expect(focusDetectTargetMs(1)).toBe(3500);
    expect(focusDetectTargetMs(10)).toBe(1500);
    expect(focusDetectTargetMs(0)).toBe(3500);
    expect(focusDetectTargetMs(15)).toBe(1500);
  });
  it("preciso E rápido sobe de nível", () => {
    const r = calculateFocusProgression(3, 0.9, 2000); // alvo N3 = 3050ms
    expect(r.action).toBe("increase");
    expect(r.nextLevel).toBe(4);
  });
  it("preciso porém LENTO mantém o nível (treina velocidade)", () => {
    const r = calculateFocusProgression(3, 0.9, 5000);
    expect(r.action).toBe("maintain");
    expect(r.nextLevel).toBe(3);
    expect(r.reason).toContain("velocidade");
  });
  it("sem dado de detecção não trava a subida (sessões antigas)", () => {
    const r = calculateFocusProgression(3, 0.9);
    expect(r.action).toBe("increase");
  });
  it("acurácia baixa desce, mesmo rápido", () => {
    const r = calculateFocusProgression(3, 0.4, 800);
    expect(r.action).toBe("decrease");
    expect(r.nextLevel).toBe(2);
  });
});

describe("checkAchievements", () => {
  it("FIRST_SESSION com 1 sessao", () => {
    const got = checkAchievements([mkSession()], []);
    expect(got.some((a) => a.type === "FIRST_SESSION")).toBe(true);
  });
  it("nao re-concede achievement ja obtido", () => {
    const got = checkAchievements([mkSession()], ["FIRST_SESSION"]);
    expect(got.some((a) => a.type === "FIRST_SESSION")).toBe(false);
  });
  it("SESSIONS_10 com 10 sessoes", () => {
    const got = checkAchievements(Array.from({ length: 10 }, () => mkSession()), []);
    expect(got.some((a) => a.type === "SESSIONS_10")).toBe(true);
  });
  it("PERFECT_SCORE com accuracy 1.0", () => {
    const got = checkAchievements([mkSession({ accuracy: 1.0 })], []);
    expect(got.some((a) => a.type === "PERFECT_SCORE")).toBe(true);
  });
  // Regressao do BUG-01: streaks nunca desbloqueavam (parse de data pt-BR -> NaN)
  it("STREAK_3 desbloqueia com 3 dias consecutivos (regressao BUG-01)", () => {
    const s = [
      mkSession({ completedAt: new Date("2026-05-28T13:00:00Z") }),
      mkSession({ completedAt: new Date("2026-05-29T13:00:00Z") }),
      mkSession({ completedAt: new Date("2026-05-30T13:00:00Z") }),
    ];
    const got = checkAchievements(s, []);
    expect(got.some((a) => a.type === "STREAK_3")).toBe(true);
  });
  it("STREAK_3 NAO desbloqueia com dias nao-consecutivos", () => {
    const s = [
      mkSession({ completedAt: new Date("2026-05-20T13:00:00Z") }),
      mkSession({ completedAt: new Date("2026-05-25T13:00:00Z") }),
      mkSession({ completedAt: new Date("2026-05-30T13:00:00Z") }),
    ];
    const got = checkAchievements(s, []);
    expect(got.some((a) => a.type === "STREAK_3")).toBe(false);
  });
});
