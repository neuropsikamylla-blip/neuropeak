import { describe, expect, it } from "vitest";
import { backfillDecision, tutorialRequired } from "./state";

describe("tutorialRequired", () => {
  const completedAt = new Date("2026-08-04T12:00:00.000Z");

  it("exige tutorial quando nunca houve conclusão", () => {
    expect(tutorialRequired({ completedAt: null, completedVersion: null }, 1)).toBe(true);
  });

  it("é conservador quando há data sem versão", () => {
    expect(tutorialRequired({ completedAt, completedVersion: null }, 1)).toBe(true);
  });

  it("exige tutorial quando a versão concluída é menor", () => {
    expect(tutorialRequired({ completedAt, completedVersion: 1 }, 2)).toBe(true);
  });

  it("dispensa tutorial quando a versão concluída é a exigida", () => {
    expect(tutorialRequired({ completedAt, completedVersion: 2 }, 2)).toBe(false);
  });

  it("dispensa tutorial quando a versão exigida sofreu rollback", () => {
    expect(tutorialRequired({ completedAt, completedVersion: 3 }, 2)).toBe(false);
  });
});

describe("backfillDecision", () => {
  const createdAt = new Date("2026-07-01T10:00:00.000Z");
  const lastAttemptAt = new Date("2026-08-01T10:00:00.000Z");

  it("marca linha com tentativas e sem conclusão", () => {
    expect(backfillDecision({
      totalAttempts: 1,
      tutorialCompletedAt: null,
      lastAttemptAt,
      createdAt,
    })).toEqual({
      tutorialCompletedAt: lastAttemptAt,
      tutorialVersion: 1,
      tutorialSource: "BACKFILL",
    });
  });

  it("não toca linha sem tentativas", () => {
    expect(backfillDecision({
      totalAttempts: 0,
      tutorialCompletedAt: null,
      lastAttemptAt: null,
      createdAt,
    })).toBeNull();
  });

  it("não toca linha já concluída", () => {
    expect(backfillDecision({
      totalAttempts: 4,
      tutorialCompletedAt: lastAttemptAt,
      lastAttemptAt,
      createdAt,
    })).toBeNull();
  });

  it("usa a última tentativa quando existe e a criação como fallback", () => {
    const withAttempt = backfillDecision({
      totalAttempts: 2,
      tutorialCompletedAt: null,
      lastAttemptAt,
      createdAt,
    });
    const withoutAttempt = backfillDecision({
      totalAttempts: 2,
      tutorialCompletedAt: null,
      lastAttemptAt: null,
      createdAt,
    });

    expect(withAttempt?.tutorialCompletedAt).toBe(lastAttemptAt);
    expect(withoutAttempt?.tutorialCompletedAt).toBe(createdAt);
  });

  it("sempre identifica a origem como BACKFILL", () => {
    const result = backfillDecision({
      totalAttempts: 1,
      tutorialCompletedAt: null,
      lastAttemptAt: null,
      createdAt,
    });

    expect(result?.tutorialSource).toBe("BACKFILL");
  });
});
