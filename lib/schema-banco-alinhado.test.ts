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
 * Em 05/ago/2026 o banco recebeu, por SQL manual e em transação verificada, o enum `TutorialSource`
 * e as três colunas — e o backfill de 16 registros. Só então esta lista passou a incluí-las.
 *
 * ⚠️ **A ordem importa, e é sempre esta: primeiro o banco, depois esta lista, depois o schema.**
 * Acrescentar um campo aqui antes de a coluna existir em produção reproduz o incidente. A
 * igualdade exata abaixo é justamente o que impede um campo novo de entrar no schema sem que
 * alguém tenha, deliberadamente, atualizado este arquivo.
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
  // Implantados em produção em 05/ago/2026 (T1.0).
  "tutorialCompletedAt",
  "tutorialVersion",
  "tutorialSource",
] as const;

function lerSchema(): string {
  return readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
}

function modelo(nome: string): string {
  const schema = lerSchema();
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
    .filter(
      (linha) =>
        linha.length > 0 &&
        !linha.startsWith("//") &&
        !linha.startsWith("///") &&
        !linha.startsWith("@@"),
    )
    .map((linha) => linha.split(/\s+/)[0]);
}

describe("schema Prisma alinhado com o banco de produção", () => {
  it("ExerciseConfig declara exatamente os campos que existem no banco", () => {
    // Igualdade exata nos dois sentidos: campo a mais reproduz o incidente (o Client pede coluna
    // inexistente); campo a menos deixa dado do banco invisível ao código.
    expect(camposDeclarados(modelo("ExerciseConfig")).sort()).toEqual([...CAMPOS_NO_BANCO].sort());
  });

  it("os três campos de tutorial estão declarados, e todos nuláveis", () => {
    const corpo = modelo("ExerciseConfig");
    // Nulável é obrigatório: 66 dos 82 registros não têm tutorial, e NOT NULL exigiria um default
    // que inventaria um estado — "concluído em" não pode ter data para quem nunca concluiu.
    expect(corpo).toMatch(/tutorialCompletedAt\s+DateTime\?/);
    expect(corpo).toMatch(/tutorialVersion\s+Int\?/);
    expect(corpo).toMatch(/tutorialSource\s+TutorialSource\?/);
  });

  it("o enum TutorialSource existe com exatamente BACKFILL e PATIENT", () => {
    const schema = lerSchema();
    const inicio = schema.indexOf("enum TutorialSource {");
    expect(inicio, "enum TutorialSource não encontrado no schema").toBeGreaterThan(-1);
    const valores = schema
      .slice(inicio, schema.indexOf("\n}", inicio))
      .split("\n")
      .slice(1)
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0 && !linha.startsWith("//"));
    // A ordem é a do banco (BACKFILL = 1, PATIENT = 2) e não deve ser trocada: o Postgres guarda
    // a posição, e reordenar o enum no schema não reordena o tipo já criado em produção.
    expect(valores).toEqual(["BACKFILL", "PATIENT"]);
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

describe("rota do tutorial não toca dado clínico", () => {
  const rota = "app/api/exercise-tutorial/route.ts";

  it("grava apenas os três campos de tutorial", () => {
    const fonte = readFileSync(resolve(process.cwd(), rota), "utf8");
    expect(fonte).toContain("tutorialCompletedAt");
    expect(fonte).toContain("tutorialVersion");
    expect(fonte).toMatch(/tutorialSource:\s*"PATIENT"/);
  });

  it("não escreve em currentDifficulty, totalAttempts nem lastAttemptAt", () => {
    const fonte = readFileSync(resolve(process.cwd(), rota), "utf8");
    // Escrita seria `campo:` num objeto create/update. A rota nem menciona esses campos.
    expect(fonte).not.toMatch(/currentDifficulty\s*:/);
    expect(fonte).not.toMatch(/totalAttempts\s*:/);
    expect(fonte).not.toMatch(/lastAttemptAt\s*:/);
  });

  it("não cria Session nem dispara progressão, conquistas ou alertas", () => {
    const fonte = readFileSync(resolve(process.cwd(), rota), "utf8");
    expect(fonte).not.toMatch(/prisma\.session\./);
    expect(fonte).not.toMatch(/prisma\.achievement\./);
    expect(fonte).not.toMatch(/prisma\.alert\./);
    expect(fonte).not.toMatch(/calculate\w*Progression|calculateNewDifficulty/);
  });

  it("exige sessão de PATIENT e usa o patientId da sessão, nunca do corpo", () => {
    const fonte = readFileSync(resolve(process.cwd(), rota), "utf8");
    expect(fonte).toMatch(/user\.role !== "PATIENT"/);
    expect(fonte).toMatch(/patientId:\s*user\.patientId/);
    // O corpo aceita só exerciseId e version — `.strict()` recusa qualquer outro campo.
    expect(fonte).toContain(".strict()");
  });
});
