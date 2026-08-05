import { existsSync, readFileSync, readdirSync } from "node:fs";
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

  // A rota ficou PAUSADA entre o hotfix de 05/ago/2026 e a implantação da T1.0 no mesmo dia:
  // dependia de colunas que o banco não tinha, e o Prisma Client gerado com elas derrubava toda
  // consulta a ExerciseConfig. Com as colunas aplicadas em produção, a rota voltou de
  // docs/t1-pausada/ — restaurada byte a byte.
  it("a rota está ativa em app/api, agora que o banco tem os campos", () => {
    expect(existsSync(resolve(process.cwd(), "app/api/exercise-tutorial/route.ts"))).toBe(true);
  });

  it("a rota ativa não toca caminhos clínicos e de progressão", () => {
    expect(source("app/api/exercise-tutorial/route.ts")).not.toMatch(
      /session\.create|currentDifficulty|lastAttemptAt|totalAttempts|achievement|alert/i,
    );
  });

  it("a rota ativa é idêntica à versão preservada — restauração, não reescrita", () => {
    expect(source("app/api/exercise-tutorial/route.ts")).toBe(
      source("docs/t1-pausada/exercise-tutorial-route.ts.txt"),
    );
  });

  it("impede a preparação de expor informações proibidas", () => {
    expect(source("components/exercises/PreparationScreen.tsx")).not.toMatch(
      /dígitos|recorde|carga|fadiga|protocolo/i,
    );
  });
});
