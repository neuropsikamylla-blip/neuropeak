import { pistaSimples, type Puzzle, type PuzzleMetadata } from "./tipos";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";
import { PROBLEMAS_NIVEL_3 } from "./problemas/nivel3";
import { PROBLEMAS_NIVEL_4 } from "./problemas/nivel4";
import { PROBLEMAS_NIVEL_5 } from "./problemas/nivel5";

export { PROBLEMAS_NIVEL_2, PROBLEMAS_NIVEL_3, PROBLEMAS_NIVEL_4, PROBLEMAS_NIVEL_5 };

function metadata(
  complexity: number,
  expectedDifficulty: number,
  inferenceDepthDistribution: Record<string, number>,
  skillWeights: Record<string, number>,
  dominantOperations: PuzzleMetadata["dominantOperations"],
  clueTypeDistribution: PuzzleMetadata["clueTypeDistribution"]
): PuzzleMetadata {
  return {
    complexity,
    inferenceDepthDistribution,
    skillWeights,
    dominantOperations,
    clueTypeDistribution,
    expectedDifficulty,
    validatedUniqueSolution: true,
  };
}

/** Problema curto, usado somente para ensinar a mecânica da interface. */
export const PROBLEMA_TUTORIAL: Puzzle = {
  id: "tutorial-feira-cientifica",
  titulo: "Organização da feira científica",
  contexto: "Três apresentações ocupam posições consecutivas. Organize cada categoria usando as pistas.",
  nivel: 1,
  posicoes: 3,
  categorias: [
    { id: "apresentador", label: "Apresentador", valores: ["Bruno", "Ana", "Carla"] },
    { id: "projeto", label: "Projeto", valores: ["Atlas", "Brisa", "Cosmos"] },
    { id: "horario", label: "Horário", valores: ["9h", "10h", "11h"] },
  ],
  pistas: [
    pistaSimples("tutorial-1", "Ana ocupa a posição central.", {
      tipo: "T3",
      item: { categoria: "apresentador", valor: "Ana" },
      posicao: 2,
    }),
    pistaSimples("tutorial-2", "Bruno aparece antes de Carla.", {
      tipo: "T4",
      itemA: { categoria: "apresentador", valor: "Bruno" },
      itemB: { categoria: "apresentador", valor: "Carla" },
    }),
    pistaSimples("tutorial-3", "Brisa fica entre Atlas e Cosmos, nessa ordem.", {
      tipo: "T7",
      itemA: { categoria: "projeto", valor: "Atlas" },
      itemC: { categoria: "projeto", valor: "Brisa" },
      itemB: { categoria: "projeto", valor: "Cosmos" },
    }),
    pistaSimples("tutorial-4", "A apresentação das 10h fica entre as de 9h e 11h, nessa ordem.", {
      tipo: "T7",
      itemA: { categoria: "horario", valor: "9h" },
      itemC: { categoria: "horario", valor: "10h" },
      itemB: { categoria: "horario", valor: "11h" },
    }),
  ],
  solucao: {
    apresentador: ["Bruno", "Ana", "Carla"],
    projeto: ["Atlas", "Brisa", "Cosmos"],
    horario: ["9h", "10h", "11h"],
  },
  metadata: metadata(
    1,
    1,
    { "1": 7, "2": 2, "3": 0, "4+": 0 },
    { exclusion: 0, relativeOrder: 2, adjacency: 0, crossCategory: 0, integrationDepth: 1, uncertaintyTolerance: 0 },
    ["T7", "T3", "T4"],
    { T3: 1, T4: 1, T7: 2 }
  ),
};

// `biblioteca-encontros` e `museu-mostra-noturna` foram REMOVIDOS em 09/set, por decisão dela:
// reprovavam na régua estrutural e o defeito era estrutural, não de ajuste. Cada critério da régua
// tem prova sintética própria em `estrutura.test.ts`, então nada de evidência saiu com eles.
// O histórico do que eram e por que caíram está no PROGRESSO.md.

/** O seed bank validado: 16 problemas, quatro por nível, todos aprovados pela régua. */
export const PROBLEMAS_GRADE: readonly Puzzle[] = [
  ...PROBLEMAS_NIVEL_2,
  ...PROBLEMAS_NIVEL_3,
  ...PROBLEMAS_NIVEL_4,
  ...PROBLEMAS_NIVEL_5,
];

export const BANCO_GRADE: readonly Puzzle[] = [PROBLEMA_TUTORIAL, ...PROBLEMAS_GRADE];

/**
 * A dificuldade do paciente (1–13, teto do banco) vira o NÍVEL do problema. As faixas são largas
 * de propósito: quatro problemas por nível dão margem para repetir a mesma exigência cognitiva
 * com conteúdo diferente antes de subir a carga.
 */
export function nivelDaDificuldade(difficulty: number): Puzzle["nivel"] {
  if (difficulty <= 3) return 2;
  if (difficulty <= 6) return 3;
  if (difficulty <= 9) return 4;
  return 5;
}

/**
 * Escolhe o próximo problema do nível, pulando os já usados.
 *
 * `usados` sustenta a sequência dentro da sessão — misto → focalizado → transferência. A tela
 * passa os ids já resolvidos para não repetir um problema enquanto ainda houver outro no nível.
 * Esgotados os do nível, recomeça: repetir conteúdo é melhor do que devolver nada.
 */
export function selecionarProblema(difficulty: number, usados: readonly string[] = []): Puzzle {
  const nivel = nivelDaDificuldade(difficulty);
  const doNivel = PROBLEMAS_GRADE.filter((puzzle) => puzzle.nivel === nivel);
  if (doNivel.length === 0) throw new Error(`O banco não tem problema de nível ${nivel}.`);
  return doNivel.find((puzzle) => !usados.includes(puzzle.id)) ?? doNivel[0];
}
