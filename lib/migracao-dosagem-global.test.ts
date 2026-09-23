import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { EXERCISE_DEFINITIONS } from "@/types";
import { resolveExerciseDosage } from "@/lib/exercise-dosage";

const ROOT = process.cwd();
const EXERCISES_DIR = resolve(ROOT, "components/exercises");
const GRADE = "components/exercises/executive/DeductiveGrid.tsx";

function arquivosTsx(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? arquivosTsx(path) : entry.name.endsWith(".tsx") ? [path] : [];
  });
}

function fonte(path: string): string {
  return readFileSync(path, "utf8");
}

const componentes = arquivosTsx(EXERCISES_DIR);

describe("migração global da dosagem", () => {
  it("NENHUM exercício usa mais useTimedProgress — nem a Grade", () => {
    // A versão anterior abria exceção para a Grade, que migrava depois. Ela migrou no mesmo dia,
    // então o invariante ficou mais forte: zero exceções. É este teste que impede a migração
    // regredir em silêncio quando alguém acrescentar um exercício novo copiando um antigo.
    const usos = componentes
      .filter((path) => fonte(path).includes("useTimedProgress"))
      .map((path) => relative(ROOT, path));

    expect(usos).toEqual([]);
  });

  it("todo componente com useBlocoDeTreino renderiza a barra temporal e a tolerância", () => {
    const semBarra = componentes
      .filter((path) => fonte(path).includes("useBlocoDeTreino"))
      .filter((path) => !fonte(path).includes("<ExerciseProgressBar"))
      .map((path) => relative(ROOT, path));
    const semTolerancia = componentes
      .filter((path) => fonte(path).includes("useBlocoDeTreino"))
      .filter((path) => !fonte(path).match(/<ExerciseProgressBar[^>]*emTolerancia=/))
      .map((path) => relative(ROOT, path));

    expect(semBarra).toEqual([]);
    expect(semTolerancia).toEqual([]);
  });

  it("todos os ids literais usados pelo hook existem no catálogo", () => {
    const catalogo = new Set(Object.keys(EXERCISE_DEFINITIONS));
    const usos = componentes.flatMap((path) =>
      [...fonte(path).matchAll(/useBlocoDeTreino\("([^"]+)"\s*,/g)]
        .map((match) => ({ path: relative(ROOT, path), id: match[1] })),
    );

    // 32 na migração dos 31 + 1 quando a Grade entrou, no mesmo dia → 33. Voltou a 32 em
    // 23/set/2026, quando o Desafio Cidade foi retirado do programa por decisão dela.
    // O que este teste protege não é o número: é que TODO id passado ao hook exista no catálogo.
    // Um id inventado faria o exercício cair no padrão 8/10 em silêncio, e um de dose curta
    // perderia a dose curta. O piso existe para avisar quando um exercício PARA de declarar o id.
    expect(usos.length, "algum exercício deixou de declarar seu id ao hook").toBeGreaterThanOrEqual(32);
    for (const uso of usos) expect(catalogo.has(uso.id), `${uso.path}: ${uso.id}`).toBe(true);

    const span = fonte(resolve(EXERCISES_DIR, "memory/SpanNumerico.tsx"));
    expect(span).toContain('reverse ? "span-numerico-inverso" : "span-numerico"');
    const matriz = fonte(resolve(EXERCISES_DIR, "memory/MatrizEspacial.tsx"));
    expect(matriz).toContain('alwaysReverse === true ? "matriz-espacial-inversa" : "matriz-espacial"');
  });

  it("preserva as doses curtas e a variação do Stroop", () => {
    expect(resolveExerciseDosage("tempo-reacao", 5)).toEqual({ targetDurationSec: 300, maxDurationSec: 360 });
    expect(resolveExerciseDosage("semaforo", 5)).toEqual({ targetDurationSec: 300, maxDurationSec: 360 });
    expect(resolveExerciseDosage("informacao-em-foco", 5)).toEqual({ targetDurationSec: 360, maxDurationSec: 420 });
    expect([1, 3, 6, 9].map((difficulty) => resolveExerciseDosage("stroop-task", difficulty))).toEqual([
      { targetDurationSec: 240, maxDurationSec: 300 },
      { targetDurationSec: 300, maxDurationSec: 360 },
      { targetDurationSec: 360, maxDurationSec: 420 },
      { targetDurationSec: 420, maxDurationSec: 480 },
    ]);
  });

  it("mantém useTimedProgress exportado com a assinatura original", () => {
    const engine = fonte(resolve(EXERCISES_DIR, "useExerciseEngine.ts"));
    expect(engine).toContain("export function useTimedProgress(targetMs: number = DEFAULT_TARGET_MS)");
  });
});
