import { describe, expect, it } from "vitest";
import { judgeSemaforo, type SemaforoResponse } from "./semaforo";

describe("judgeSemaforo", () => {
  it.each([
    { targetIsGreen: true, response: "advance", correct: true, omitted: false },
    { targetIsGreen: true, response: "stop", correct: false, omitted: false },
    { targetIsGreen: true, response: "none", correct: false, omitted: true },
    { targetIsGreen: false, response: "advance", correct: false, omitted: false },
    { targetIsGreen: false, response: "stop", correct: true, omitted: false },
    { targetIsGreen: false, response: "none", correct: false, omitted: true },
  ] as const satisfies ReadonlyArray<{
    targetIsGreen: boolean;
    response: SemaforoResponse;
    correct: boolean;
    omitted: boolean;
  }>)("julga alvo verde=$targetIsGreen e resposta=$response", (expected) => {
    expect(judgeSemaforo(expected.targetIsGreen, expected.response)).toEqual({
      correct: expected.correct,
      omitted: expected.omitted,
    });
  });

  it("omissao com sinal vermelho NAO conta como acerto (regressao de 31/ago/2026)", () => {
    expect(judgeSemaforo(false, "none")).toEqual({ correct: false, omitted: true });
  });

  it("nenhuma das tres cores considera omissao um acerto", () => {
    const targetIsGreenByColor = { green: true, red: false, yellow: false } as const;

    for (const targetIsGreen of Object.values(targetIsGreenByColor)) {
      expect(judgeSemaforo(targetIsGreen, "none").correct).toBe(false);
    }
  });

  it("marca omitted somente quando response e none", () => {
    const responses: SemaforoResponse[] = ["advance", "stop", "none"];
    const attempts = [true, false].flatMap((targetIsGreen) =>
      responses.map((response) => ({ response, ...judgeSemaforo(targetIsGreen, response) }))
    );

    expect(attempts.filter((attempt) => attempt.omitted)).toHaveLength(2);
    expect(attempts.filter((attempt) => !attempt.omitted)).toHaveLength(4);
    expect(attempts.every((attempt) => attempt.omitted === (attempt.response === "none"))).toBe(true);
  });
});
