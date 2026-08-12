import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG } from "@/lib/prescription/catalog";

const root = process.cwd();
const retiredId = ["n", "back"].join("");
const retiredComponent = ["N", "Back"].join("");
const dualTaskPath = "components/exercises/attention/DualTask.tsx";

function sourceFiles(directory: string): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const canonicalWithoutRetiredExercise = [
  "span-numerico",
  "stroop-task",
  "focus-agents",
  "span-numerico-inverso",
  "matriz-espacial",
  "matriz-espacial-inversa",
  "jogo-memoria",
  "trilha-visual",
  "antes-depois",
  "informacao-em-foco",
  "mot",
  "dual-task",
  "tempo-reacao",
  "certo-ou-errado",
  "semaforo",
  "corrida-tempo",
  "torre-hanoi",
  "labirinto",
  "ordem-historia",
  "compra-multifuncional",
  "task-switching",
  "deductive-grid",
  "letras-sequencia",
  "sequencia-itens",
  "padroes-rotacao",
  "lista-distracao",
  "restaurante-ordem",
  "desafio-supermercado",
  "cubo-corsi",
  "vigilancia",
  "identificacao-simbolos",
  "estacionamento-logico",
  "investigadores-sociais",
] as const;

describe("aposentadoria integral do exercício", () => {
  it("mantém a menção técnica somente na mecânica interna do Dual Task", () => {
    const matcher = new RegExp(`${retiredId}|${retiredComponent}`);
    const matches = ["app", "lib", "components", "types"]
      .flatMap(sourceFiles)
      .filter((path) => matcher.test(readFileSync(resolve(root, path), "utf8")))
      .map((path) => relative(root, resolve(root, path)));

    // A subtarefa homônima é uma mecânica própria do Dual Task e deve permanecer intacta.
    expect(new Set(matches)).toEqual(new Set([dualTaskPath]));
  });

  it("preserva exatamente a lista canônica anterior menos o exercício aposentado", () => {
    expect(EXERCISE_CATALOG.map(({ exerciseId }) => exerciseId)).toEqual(
      canonicalWithoutRetiredExercise,
    );
    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
    expect(canonicalWithoutRetiredExercise).toHaveLength(33);
  });

  it("remove o componente aposentado do repositório", () => {
    expect(existsSync(resolve(root, "components/exercises/memory", `${retiredComponent}.tsx`)))
      .toBe(false);
  });
});
