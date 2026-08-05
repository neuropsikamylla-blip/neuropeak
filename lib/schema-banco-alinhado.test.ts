import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regressão do incidente de 05/ago/2026.
 *
 * O `schema.prisma` recebeu três campos de tutorial em `ExerciseConfig` que o banco de produção
 * nunca chegou a ter. O Prisma Client é gerado a partir do schema e passa a pedir **todas** as
 * colunas do modelo em cada consulta — inclusive no `RETURNING` de um `upsert`. Resultado: toda
 * chamada que tocasse `ExerciseConfig` quebrava com erro 500 em produção, por três versões:
 *
 *   - o terapeuta via o plano vazio (a falha virava "nenhum exercício");
 *   - o paciente treinava sempre no nível 1, sem o bloqueio de "já fez hoje";
 *   - `POST /api/sessions` gravava a Session e falhava logo depois, no upsert.
 *
 * A lição: **alterar o `schema.prisma` já é alterar o comportamento em produção**, mesmo sem rodar
 * `db push`. Schema e banco precisam andar juntos.
 *
 * Este teste trava o modelo `ExerciseConfig` na forma que o banco tem hoje. Quando o banco receber
 * os campos (fase T1.0, depois do backup validado), atualize a lista **junto** com o `db push` —
 * nunca antes.
 */
const CAMPOS_NO_BANCO = [
  "id",
  "patientId",
  "patient",
  "exerciseId",
  "currentDifficulty",
  "totalAttempts",
  "lastAttemptAt",
  "createdAt",
  "updatedAt",
] as const;

function modelo(nome: string): string {
  const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  const inicio = schema.indexOf(`model ${nome} {`);
  expect(inicio, `modelo ${nome} não encontrado no schema`).toBeGreaterThan(-1);
  return schema.slice(inicio, schema.indexOf("\n}", inicio));
}

/** Campos escalares e relações declarados, ignorando comentários e atributos de bloco. */
function camposDeclarados(corpoDoModelo: string): string[] {
  return corpoDoModelo
    .split("\n")
    .slice(1)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0 && !linha.startsWith("//") && !linha.startsWith("@@"))
    .map((linha) => linha.split(/\s+/)[0]);
}

describe("schema Prisma alinhado com o banco de produção", () => {
  it("ExerciseConfig declara exatamente os campos que existem no banco", () => {
    expect(camposDeclarados(modelo("ExerciseConfig")).sort()).toEqual([...CAMPOS_NO_BANCO].sort());
  });

  it("não há campos de tutorial no schema enquanto o banco não os tiver", () => {
    const corpo = modelo("ExerciseConfig");
    expect(corpo).not.toContain("tutorialCompletedAt");
    expect(corpo).not.toContain("tutorialVersion");
    expect(corpo).not.toContain("tutorialSource");
  });

  it("o enum TutorialSource não existe no schema", () => {
    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    expect(schema).not.toContain("enum TutorialSource");
  });
});

describe("falha de carregamento nunca vira estado vazio", () => {
  const telas = [
    "app/(therapist)/pacientes/[id]/plano/page.tsx",
    "app/(patient)/treino/[exercicio]/page.tsx",
  ];

  it.each(telas)("%s não engole erro de API com catch vazio", (caminho) => {
    const fonte = readFileSync(resolve(process.cwd(), caminho), "utf8");
    // `.catch(() => {})` transformava 500 em "plano vazio" e em "nível 1 sem bloqueio diário".
    expect(fonte).not.toMatch(/\.catch\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/);
  });

  it.each(telas)("%s trata resposta não-ok e expõe estado de erro", (caminho) => {
    const fonte = readFileSync(resolve(process.cwd(), caminho), "utf8");
    expect(fonte).toContain("r.ok");
    expect(fonte).toContain("setLoadError");
    expect(fonte).toMatch(/Tentar novamente/);
  });
});
