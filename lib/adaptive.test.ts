import { describe, it, expect } from "vitest";
import { calculateNewDifficulty, checkAchievements } from "@/lib/adaptive";
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
