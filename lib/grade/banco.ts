import { pistaSimples, type Puzzle, type PuzzleMetadata } from "./tipos";
import { PROBLEMAS_NIVEL_2 } from "./problemas/nivel2";

export { PROBLEMAS_NIVEL_2 };

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

const PROBLEMA_BIBLIOTECA: Puzzle = {
  id: "biblioteca-encontros",
  titulo: "Encontros na biblioteca",
  contexto: "Quatro encontros aconteceram em sequência. Organize visitantes, salas, temas e horários.",
  nivel: 2,
  posicoes: 4,
  categorias: [
    { id: "visitante", label: "Visitante", valores: ["Caio", "Lia", "Mauro", "Nina"] },
    { id: "sala", label: "Sala", valores: ["Acervo", "Leitura", "Mídia", "Pesquisa"] },
    { id: "tema", label: "Tema", valores: ["História", "Arte", "Ciência", "Viagem"] },
    { id: "horario", label: "Horário", valores: ["14h", "15h", "16h", "17h"] },
  ],
  pistas: [
    pistaSimples("biblioteca-1", "Lia chegou entre Caio e Mauro, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "visitante", valor: "Caio" }, itemC: { categoria: "visitante", valor: "Lia" }, itemB: { categoria: "visitante", valor: "Mauro" },
    }),
    pistaSimples("biblioteca-2", "Mauro chegou entre Lia e Nina, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "visitante", valor: "Lia" }, itemC: { categoria: "visitante", valor: "Mauro" }, itemB: { categoria: "visitante", valor: "Nina" },
    }),
    pistaSimples("biblioteca-3", "Leitura fica entre Acervo e Mídia, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "sala", valor: "Acervo" }, itemC: { categoria: "sala", valor: "Leitura" }, itemB: { categoria: "sala", valor: "Mídia" },
    }),
    pistaSimples("biblioteca-4", "Mídia fica entre Leitura e Pesquisa, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "sala", valor: "Leitura" }, itemC: { categoria: "sala", valor: "Mídia" }, itemB: { categoria: "sala", valor: "Pesquisa" },
    }),
    pistaSimples("biblioteca-5", "Arte aparece entre História e Ciência, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "tema", valor: "História" }, itemC: { categoria: "tema", valor: "Arte" }, itemB: { categoria: "tema", valor: "Ciência" },
    }),
    pistaSimples("biblioteca-6", "Ciência aparece entre Arte e Viagem, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "tema", valor: "Arte" }, itemC: { categoria: "tema", valor: "Ciência" }, itemB: { categoria: "tema", valor: "Viagem" },
    }),
    pistaSimples("biblioteca-7", "15h fica entre 14h e 16h, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "horario", valor: "14h" }, itemC: { categoria: "horario", valor: "15h" }, itemB: { categoria: "horario", valor: "16h" },
    }),
    pistaSimples("biblioteca-8", "16h fica entre 15h e 17h, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "horario", valor: "15h" }, itemC: { categoria: "horario", valor: "16h" }, itemB: { categoria: "horario", valor: "17h" },
    }),
  ],
  solucao: {
    visitante: ["Caio", "Lia", "Mauro", "Nina"],
    sala: ["Acervo", "Leitura", "Mídia", "Pesquisa"],
    tema: ["História", "Arte", "Ciência", "Viagem"],
    horario: ["14h", "15h", "16h", "17h"],
  },
  metadata: metadata(
    2,
    2,
    { "1": 0, "2": 16, "3": 0, "4+": 0 },
    { exclusion: 0, relativeOrder: 3, adjacency: 0, crossCategory: 0, integrationDepth: 2, uncertaintyTolerance: 1 },
    ["T7"],
    { T7: 8 }
  ),
};

const PROBLEMA_MUSEU: Puzzle = {
  id: "museu-mostra-noturna",
  titulo: "Mostra noturna no museu",
  contexto: "Quatro responsáveis conduziram obras por salas e horários diferentes. Reconstrua a sequência.",
  nivel: 4,
  posicoes: 4,
  categorias: [
    { id: "responsavel", label: "Responsável", valores: ["Gabi", "Hugo", "Iara", "João"] },
    { id: "obra", label: "Obra", valores: ["Aurora", "Bruma", "Cais", "Duna"] },
    { id: "sala", label: "Sala", valores: ["Norte", "Sul", "Leste", "Oeste"] },
    { id: "horario", label: "Horário", valores: ["18h", "19h", "20h", "21h"] },
  ],
  pistas: [
    pistaSimples("museu-1", "A obra Bruma foi conduzida por Hugo.", { tipo: "T8",
      itemA: { categoria: "obra", valor: "Bruma" }, itemB: { categoria: "responsavel", valor: "Hugo" },
    }),
    pistaSimples("museu-2", "A sala Leste recebeu a obra Cais.", { tipo: "T8",
      itemA: { categoria: "sala", valor: "Leste" }, itemB: { categoria: "obra", valor: "Cais" },
    }),
    pistaSimples("museu-3", "Hugo participou da segunda visita.", { tipo: "T3",
      item: { categoria: "responsavel", valor: "Hugo" }, posicao: 2,
    }),
    pistaSimples("museu-4", "A obra Aurora ficou na sala Norte.", { tipo: "T8",
      itemA: { categoria: "obra", valor: "Aurora" }, itemB: { categoria: "sala", valor: "Norte" },
    }),
    pistaSimples("museu-5", "A visita das 19h ocorreu na sala Sul.", { tipo: "T8",
      itemA: { categoria: "horario", valor: "19h" }, itemB: { categoria: "sala", valor: "Sul" },
    }),
    pistaSimples("museu-6", "Iara participou entre Gabi e João, nessa ordem.", { tipo: "T7",
      itemA: { categoria: "responsavel", valor: "Gabi" }, itemC: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "responsavel", valor: "João" },
    }),
    pistaSimples("museu-7", "Gabi conduziu a obra Aurora.", { tipo: "T8",
      itemA: { categoria: "responsavel", valor: "Gabi" }, itemB: { categoria: "obra", valor: "Aurora" },
    }),
    pistaSimples("museu-8", "A sala Norte recebeu a visita das 18h.", { tipo: "T8",
      itemA: { categoria: "sala", valor: "Norte" }, itemB: { categoria: "horario", valor: "18h" },
    }),
    pistaSimples("museu-9", "Iara conduziu a obra Cais.", { tipo: "T8",
      itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "obra", valor: "Cais" },
    }),
    pistaSimples("museu-10", "A obra Bruma ficou na sala Sul.", { tipo: "T8",
      itemA: { categoria: "obra", valor: "Bruma" }, itemB: { categoria: "sala", valor: "Sul" },
    }),
    pistaSimples("museu-11", "A visita das 20h ocorreu na sala Leste.", { tipo: "T8",
      itemA: { categoria: "horario", valor: "20h" }, itemB: { categoria: "sala", valor: "Leste" },
    }),
    {
      id: "museu-12",
      texto: "Iara não conduziu a obra Duna nem esteve na sala Oeste.",
      restricoes: [
        { id: "museu-12#1", tipo: "T2", itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "obra", valor: "Duna" } },
        { id: "museu-12#2", tipo: "T2", itemA: { categoria: "responsavel", valor: "Iara" }, itemB: { categoria: "sala", valor: "Oeste" } },
      ],
    },
  ],
  solucao: {
    responsavel: ["Gabi", "Hugo", "Iara", "João"],
    obra: ["Aurora", "Bruma", "Cais", "Duna"],
    sala: ["Norte", "Sul", "Leste", "Oeste"],
    horario: ["18h", "19h", "20h", "21h"],
  },
  metadata: metadata(
    4,
    4,
    { "1": 1, "2": 5, "3": 6, "4+": 4 },
    { exclusion: 0, relativeOrder: 2, adjacency: 0, crossCategory: 3, integrationDepth: 3, uncertaintyTolerance: 2 },
    ["T8", "T7"],
    { T3: 1, T7: 1, T8: 9 }
  ),
};

export const PROBLEMAS_GRADE: readonly Puzzle[] = [PROBLEMA_BIBLIOTECA, PROBLEMA_MUSEU];
export const BANCO_GRADE: readonly Puzzle[] = [PROBLEMA_TUTORIAL, ...PROBLEMAS_GRADE];

/** Mantém a seleção determinística enquanto o banco desta fase tem só dois desafios. */
export function selecionarProblema(difficulty: number): Puzzle {
  return difficulty >= 7 ? PROBLEMA_MUSEU : PROBLEMA_BIBLIOTECA;
}
