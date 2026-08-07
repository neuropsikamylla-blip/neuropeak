import { describe, expect, it } from "vitest";
import { backfillDecision, tutorialRequired, completionRecordFor } from "./state";

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

// ─────────────────────────────────────────────────────────────────────────────
// Regra 8 da T1 — provas FUNCIONAIS de que rever o tutorial não grava nada.
// Exigidas por ela em 07/ago/2026, ao apontar que a versão
//     onTutorialDone?.();
//     if (!isTutorialReview) onTutorialDone?.();
// faria a revisão gravar e a primeira conclusão gravar duas vezes.
// ─────────────────────────────────────────────────────────────────────────────
describe("regra 8 — conclusão grava, revisão não", () => {
  /** Reproduz o `finishTutorial` do ExerciseWrapper, contando as chamadas de verdade. */
  function encerrarTutorial(isReview: boolean, versao = 1) {
    const chamadas: Array<{ tutorialVersion: number; tutorialSource: string }> = [];
    const onTutorialDone = (registro: { tutorialVersion: number; tutorialSource: string }) =>
      chamadas.push(registro);

    const registro = completionRecordFor(isReview, versao);
    if (registro !== null) onTutorialDone(registro);

    return chamadas;
  }

  it("primeira conclusão chama onTutorialDone exatamente 1 vez", () => {
    expect(encerrarTutorial(false)).toHaveLength(1);
  });

  it("revisão chama onTutorialDone exatamente 0 vezes", () => {
    expect(encerrarTutorial(true)).toHaveLength(0);
  });

  it("revisão não produz tutorialCompletedAt", () => {
    // Sem registro não há requisição, e sem requisição a coluna não é tocada.
    expect(completionRecordFor(true, 1)).toBeNull();
  });

  it("revisão não produz tutorialVersion", () => {
    expect(completionRecordFor(true, 3)?.tutorialVersion).toBeUndefined();
  });

  it("revisão não produz tutorialSource", () => {
    expect(completionRecordFor(true, 1)?.tutorialSource).toBeUndefined();
  });

  it("a conclusão registra a versão exigida e a origem PATIENT", () => {
    expect(completionRecordFor(false, 2)).toEqual({
      tutorialVersion: 2,
      tutorialSource: "PATIENT",
    });
  });

  it("revisões repetidas seguem sem gravar, quantas forem", () => {
    // O manual interativo pode ser consultado à vontade sem mover uma linha do banco.
    const total = [1, 2, 3, 4, 5].flatMap(() => encerrarTutorial(true));
    expect(total).toHaveLength(0);
  });

  it("alternar revisão e conclusão grava só na conclusão", () => {
    const chamadas = [
      ...encerrarTutorial(true),
      ...encerrarTutorial(false),
      ...encerrarTutorial(true),
    ];
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0].tutorialSource).toBe("PATIENT");
  });
});
