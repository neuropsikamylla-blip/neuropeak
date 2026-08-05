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

  // A rota está PAUSADA desde o hotfix de 05/ago/2026: ela depende de colunas que o banco
  // ainda não tem, e o Prisma Client gerado com elas derrubava toda consulta a ExerciseConfig.
  // O arquivo foi preservado em docs/t1-pausada/ e volta quando o banco receber os campos.
  it("mantém a rota fora de app/api enquanto o banco não tem os campos", () => {
    expect(existsSync(resolve(process.cwd(), "app/api/exercise-tutorial/route.ts"))).toBe(false);
  });

  it("o arquivo preservado continua sem tocar caminhos clínicos e de progressão", () => {
    expect(source("docs/t1-pausada/exercise-tutorial-route.ts.txt")).not.toMatch(
      /session\.create|currentDifficulty|lastAttemptAt|totalAttempts|achievement|alert/i,
    );
  });

  it("impede a preparação de expor informações proibidas", () => {
    expect(source("components/exercises/PreparationScreen.tsx")).not.toMatch(
      /dígitos|recorde|carga|fadiga|protocolo/i,
    );
  });
});
