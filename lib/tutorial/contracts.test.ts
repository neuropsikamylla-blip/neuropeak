import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(file: string): string {
  return readFileSync(resolve(process.cwd(), file), "utf8");
}

describe("guardas estáticos do framework de tutorial", () => {
  it("não acopla lib/tutorial a progresso ou adaptação", () => {
    const directory = resolve(process.cwd(), "lib/tutorial");
    const implementationSources = readdirSync(directory)
      .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".test.ts"))
      .map((file) => readFileSync(resolve(directory, file), "utf8"))
      .join("\n");

    expect(implementationSources).not.toMatch(
      /useTimedProgress|useExerciseProgress|(?:@\/)?lib\/adaptive/,
    );
  });

  it("mantém o contrato clínico mínimo em types.ts", () => {
    expect(source("lib/tutorial/types.ts")).not.toMatch(
      /onComplete|score|accuracy|reactionTime/i,
    );
  });

  it("impede a rota de tocar caminhos clínicos e de progressão", () => {
    expect(source("app/api/exercise-tutorial/route.ts")).not.toMatch(
      /session\.create|currentDifficulty|lastAttemptAt|totalAttempts|achievement|alert/i,
    );
  });

  it("impede a preparação de expor informações proibidas", () => {
    expect(source("components/exercises/PreparationScreen.tsx")).not.toMatch(
      /dígitos|recorde|carga|fadiga|protocolo/i,
    );
  });
});
