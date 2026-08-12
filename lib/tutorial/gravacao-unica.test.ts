import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * REGRA GLOBAL 10 DA T1 — a gravação do tutorial tem UM caminho só.
 *
 * Congelada por ela em 07/ago/2026, ao elevar a garantia da regra 8 de "vale para o Span" para
 * "vale para os 33". O N‑Back foi aposentado em 12/ago/2026 por decisão dela. A motivação é direta:
 * se cada exercício puder gravar do seu jeito, a promessa
 * de que rever o tutorial não altera dado clínico deixa de ser verificável — passaria a depender de
 * 33 implementações estarem todas corretas, para sempre.
 *
 * Estes testes valem para TODOS os exercícios, inclusive os que ainda serão convertidos. Um
 * exercício novo que tente gravar por conta própria falha aqui, no lote em que for criado.
 */

/** Os ÚNICOS arquivos autorizados a participar do caminho de gravação. */
const CAMINHO_AUTORIZADO = [
  "app/(patient)/treino/[exercicio]/page.tsx", // dispara o POST, uma vez, no caminho automático
  "app/api/exercise-tutorial/route.ts",         // a rota que grava
  "components/exercises/ExerciseWrapper.tsx",   // decide chamar, obedecendo a completionRecordFor
  "lib/tutorial/state.ts",                      // a regra: completionRecordFor
];

/**
 * Marcas de que um arquivo participa da GRAVAÇÃO do tutorial.
 *
 * `tutorialVersion` de propósito fora da lista: `tutorialVersionFor()` é consulta legítima — saber
 * qual versão o exercício exige não é o mesmo que gravar que ela foi cumprida. Já
 * `tutorialCompletedAt` e `tutorialSource` só existem no registro em si.
 */
const MARCAS_DE_GRAVACAO =
  /onTutorialDone|\/api\/exercise-tutorial|tutorialCompletedAt|tutorialSource/;

function listar(diretorio: string): string[] {
  return (readdirSync(resolve(process.cwd(), diretorio), { recursive: true }) as string[])
    .map(String)
    .filter((f) => /\.tsx?$/.test(f) && !f.includes(".test."))
    .map((f) => `${diretorio}/${f}`);
}

function fonte(caminho: string): string {
  return readFileSync(resolve(process.cwd(), caminho), "utf8");
}

describe("T1 global — 10: a gravação do tutorial tem um caminho único", () => {
  it("nenhum componente de exercício participa da gravação", () => {
    const infratores = listar("components/exercises")
      .filter((f) => !CAMINHO_AUTORIZADO.includes(f))
      .filter((f) => MARCAS_DE_GRAVACAO.test(fonte(f)));

    // Se este teste falhar, um exercício está tentando gravar por conta própria. A correção nunca
    // O N‑Back foi aposentado em 12/ago/2026 por decisão dela.
    // Isto não é relaxar o teste: é usar o caminho do ExerciseWrapper, como os outros 33.
    expect(infratores).toEqual([]);
  });

  it("nenhuma definição de tutorial participa da gravação", () => {
    const infratores = listar("lib/tutorial")
      .filter((f) => !CAMINHO_AUTORIZADO.includes(f))
      .filter((f) => MARCAS_DE_GRAVACAO.test(fonte(f)));

    expect(infratores).toEqual([]);
  });

  it("apenas um arquivo fora da API chama a rota de tutorial", () => {
    const chamadores = [...listar("app"), ...listar("components"), ...listar("lib")]
      .filter((f) => f !== "app/api/exercise-tutorial/route.ts")
      .filter((f) => /fetch\(\s*["'`]\/api\/exercise-tutorial/.test(fonte(f)));

    expect(chamadores).toEqual(["app/(patient)/treino/[exercicio]/page.tsx"]);
  });

  it("o único fetch da rota acontece uma vez só", () => {
    const page = fonte("app/(patient)/treino/[exercicio]/page.tsx");
    const chamadas = page.match(/fetch\(\s*["'`]\/api\/exercise-tutorial/g) ?? [];

    expect(chamadas).toHaveLength(1);
  });

  it("completionRecordFor é a única regra de decisão, e o wrapper a usa", () => {
    const wrapper = fonte("components/exercises/ExerciseWrapper.tsx");

    expect(wrapper).toMatch(/completionRecordFor\(isTutorialReview, tutorial\.version\)/);
    // Nenhuma decisão paralela: a chamada é guardada pelo resultado da função, e só por ele.
    expect(wrapper.match(/onTutorialDone\?\.\(\)/g) ?? []).toHaveLength(1);
    expect(wrapper).toMatch(/if \(registro !== null\) onTutorialDone\?\.\(\);/);
  });

  it("nenhum exercício reimplementa a decisão de gravar", () => {
    const infratores = listar("components/exercises")
      .filter((f) => f !== "components/exercises/ExerciseWrapper.tsx")
      .filter((f) => /completionRecordFor|tutorialRequired/.test(fonte(f)));

    // A decisão vive no wrapper. Um exercício que a repita cria um segundo caminho — e dois
    // caminhos significam que a garantia vale em um e pode não valer no outro.
    expect(infratores).toEqual([]);
  });
});
