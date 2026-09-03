import { admiteSolucao } from "./solver";
import type { MarcacaoParcial, Puzzle } from "./tipos";

export type ValorCelula = string | null;
export type EstadoGrade = Readonly<Record<string, readonly ValorCelula[]>>;

export type QuantidadeVerificacoes = number | "livre";

/**
 * Configuração única e recalibrável da ajuda: o tutorial ensina a mecânica;
 * nos problemas de treino, a quantidade diminui conforme o nível aumenta.
 * Valores zero são válidos e retiram o recurso daquele nível.
 */
export interface ConfiguracaoVerificacoes {
  tutorial: "livre";
  porNivel: Readonly<Record<Puzzle["nivel"], number>>;
}

export const CONFIGURACAO_VERIFICACOES: Readonly<ConfiguracaoVerificacoes> = {
  tutorial: "livre",
  porNivel: { 1: 3, 2: 3, 3: 2, 4: 1, 5: 1 },
};

export const MENSAGEM_COM_INCOMPATIBILIDADE =
  "Existe uma incompatibilidade na sua organização. Revise suas escolhas.";
export const MENSAGEM_SEM_INCOMPATIBILIDADE =
  "Até aqui, sua organização é compatível com as pistas.";

export function verificacoesPermitidas(
  nivel: Puzzle["nivel"],
  ehTutorial: boolean,
  configuracao: Readonly<ConfiguracaoVerificacoes> = CONFIGURACAO_VERIFICACOES
): QuantidadeVerificacoes {
  return ehTutorial ? configuracao.tutorial : configuracao.porNivel[nivel];
}

export function verificacaoDisponivel(restantes: QuantidadeVerificacoes): boolean {
  return restantes === "livre" || restantes > 0;
}

export function consumirVerificacao(restantes: QuantidadeVerificacoes): QuantidadeVerificacoes {
  return restantes === "livre" ? restantes : Math.max(0, restantes - 1);
}

export function mensagemVerificacao(
  _nivel: Puzzle["nivel"],
  temIncompatibilidade: boolean
): string {
  return temIncompatibilidade
    ? MENSAGEM_COM_INCOMPATIBILIDADE
    : MENSAGEM_SEM_INCOMPATIBILIDADE;
}

export interface RegistroVerificacao {
  puzzleId: string;
  numeroAcao: number;
  tempoDesdeInicio: number;
  ordemVerificacao: number;
  verificacoesRestantes: QuantidadeVerificacoes;
  estado: "consistente" | "inconsistente";
  quantidadeContradicoes: number;
  corrigidaDepois: boolean;
  acoesAteCorrecao: number | null;
  tempoAteCorrecao: number | null;
}

export function registrarCorrecaoDasVerificacoes(
  verificacoes: readonly RegistroVerificacao[],
  puzzleId: string,
  numeroAcao: number,
  tempoDesdeInicio: number
): RegistroVerificacao[] {
  return verificacoes.map((verificacao) => {
    if (
      verificacao.puzzleId !== puzzleId
      || verificacao.estado !== "inconsistente"
      || verificacao.corrigidaDepois
    ) {
      return verificacao;
    }
    return {
      ...verificacao,
      corrigidaDepois: true,
      acoesAteCorrecao: Math.max(0, numeroAcao - verificacao.numeroAcao),
      tempoAteCorrecao: Math.max(0, tempoDesdeInicio - verificacao.tempoDesdeInicio),
    };
  });
}

/** Chave sem delimitadores ambíguos para uma célula visual da grade. */
export function chavePosicaoGrade(categoria: string, posicao: number): string {
  return JSON.stringify([categoria, posicao]);
}

export function criarGradeVazia(puzzle: Puzzle): Record<string, ValorCelula[]> {
  return Object.fromEntries(
    puzzle.categorias.map((categoria) => [categoria.id, Array<ValorCelula>(puzzle.posicoes).fill(null)])
  );
}

/** Retorna todas as células envolvidas em duplicidades e nenhuma outra. */
export function celulasComValorRepetido(grade: EstadoGrade): Set<string> {
  const repetidas = new Set<string>();
  for (const [categoria, valores] of Object.entries(grade)) {
    const posicoesPorValor = new Map<string, number[]>();
    valores.forEach((valor, indice) => {
      if (valor === null) return;
      const posicoes = posicoesPorValor.get(valor) ?? [];
      posicoes.push(indice + 1);
      posicoesPorValor.set(valor, posicoes);
    });
    for (const posicoes of posicoesPorValor.values()) {
      if (posicoes.length < 2) continue;
      posicoes.forEach((posicao) => repetidas.add(chavePosicaoGrade(categoria, posicao)));
    }
  }
  return repetidas;
}

export function paraMarcacaoParcial(grade: EstadoGrade): MarcacaoParcial {
  return Object.entries(grade).flatMap(([categoria, valores]) =>
    valores.flatMap((valor, indice) =>
      valor === null ? [] : [{ categoria, valor, posicao: indice + 1, estado: "confirmado" as const }]
    )
  );
}

export function gradeEstaCorreta(puzzle: Puzzle, grade: EstadoGrade): boolean {
  return puzzle.categorias.every((categoria) => {
    const valores = grade[categoria.id];
    return valores?.length === puzzle.posicoes
      && valores.every((valor, indice) => valor === puzzle.solucao[categoria.id][indice]);
  });
}

/**
 * O estado de informação em que a atribuição foi feita. São três situações, não duas, e
 * distingui-las importa: de um estado já contraditório não se deduz nada de útil, então
 * juntar "marcou sem estar determinado" com "marcou enquanto o próprio estado já era
 * impossível" infla o indicador e leva a fase 6 a ler como exploração o que é persistência
 * numa contradição — ou o contrário.
 */
export type EstadoDaAtribuicao = "determinada" | "ainda-em-aberto" | "estado-ja-contraditorio";

/**
 * Consulta o solver no estado imediatamente anterior à atribuição. A relação está determinada
 * quando o estado ainda admite solução e negar exatamente essa relação torna o problema
 * impossível — ou seja, quando não havia escolha a fazer ali.
 */
export function estadoDaAtribuicao(
  puzzle: Puzzle,
  parcial: MarcacaoParcial,
  categoria: string,
  valor: string,
  posicao: number
): EstadoDaAtribuicao {
  const estadoAnterior = parcial.filter(
    (marcacao) => marcacao.categoria !== categoria || marcacao.posicao !== posicao
  );
  if (!admiteSolucao(puzzle, estadoAnterior)) return "estado-ja-contraditorio";
  const forcada = !admiteSolucao(puzzle, [
    ...estadoAnterior,
    { categoria, valor, posicao, estado: "impossivel" },
  ]);
  return forcada ? "determinada" : "ainda-em-aberto";
}

/** Mantida como atalho de leitura: só "determinada" conta como relação já forçada. */
export function relacaoJaDeterminada(
  puzzle: Puzzle,
  parcial: MarcacaoParcial,
  categoria: string,
  valor: string,
  posicao: number
): boolean {
  return estadoDaAtribuicao(puzzle, parcial, categoria, valor, posicao) === "determinada";
}

export interface RegistroAtribuicao {
  categoria: string;
  valor: string;
  posicao: number;
  momento: number;
  valorAnterior: string | null;
  relacaoJaEstavaLogicamenteDeterminada: boolean;
  /** A terceira situação, que o booleano acima não distingue. */
  estadoDaAtribuicao: EstadoDaAtribuicao;
  revisadaDepois: boolean;
}

export interface ResumoAtribuicoes {
  atribuicoesAntesDeDeterminacao: number;
  dessasMantidas: number;
  dessasRevisadas: number;
  /** Contadas à parte, e NÃO somadas às de cima: são um estado de informação diferente. */
  atribuicoesComEstadoJaContraditorio: number;
}

/**
 * Estes dados são deliberadamente descritivos. Uma marcação única não revela
 * se a pessoa tinha certeza ou se estava testando uma possibilidade; interpretar
 * estado mental a partir dela cabe à profissional, não à interface.
 */
export function resumirAtribuicoes(atribuicoes: readonly RegistroAtribuicao[]): ResumoAtribuicoes {
  const antesDaDeterminacao = atribuicoes.filter(
    (atribuicao) => atribuicao.estadoDaAtribuicao === "ainda-em-aberto"
  );
  const dessasRevisadas = antesDaDeterminacao.filter((atribuicao) => atribuicao.revisadaDepois).length;
  return {
    atribuicoesAntesDeDeterminacao: antesDaDeterminacao.length,
    dessasMantidas: antesDaDeterminacao.length - dessasRevisadas,
    dessasRevisadas,
    atribuicoesComEstadoJaContraditorio: atribuicoes.filter(
      (atribuicao) => atribuicao.estadoDaAtribuicao === "estado-ja-contraditorio"
    ).length,
  };
}

/**
 * Quanto uma tentativa de conclusão incorreta pesa na acurácia. Calibrado contra os limiares
 * reais de `calculateNewDifficulty` (sobe acima de 0,85; desce abaixo de 0,60): UMA tentativa
 * incorreta mantém o nível, porque declarar pronto e depois corrigir é autocorreção e não
 * falha; TRÊS fazem descer, porque aí já é dificuldade de monitoramento, não um deslize.
 */
export const PESO_TENTATIVA_INCORRETA = 0.2;

/**
 * ⚠️ PROVISÓRIO, e proposto pelo VP — não é decisão dela nem do gestor de conteúdo.
 *
 * A tela só deixa concluir com a grade correta, então "acertou o problema" é sempre verdadeiro
 * e uma acurácia fixa em 1 faria a Grade subir de nível em toda sessão e disparar sozinha a
 * conquista de 100% — o mesmo defeito que a Torre teve em 31/ago (`accuracy` alimenta
 * `lib/adaptive.ts`). O que varia entre pacientes é o PROCESSO, e o único sinal de processo
 * que se pode usar aqui sem contrariar decisão já tomada é quantas vezes a pessoa declarou
 * "terminei" com a grade ainda incompatível.
 *
 * Deliberadamente FORA da conta, por decisão dela já registrada: revisar uma atribuição
 * (é monitoramento, não erro), o tempo (rápido ≠ melhor) e o uso de "Verificar raciocínio"
 * (o gestor de conteúdo pediu que fosse REGISTRADO, não penalizado).
 *
 * A medida definitiva sai da fase 6, que precisa ser rediscutida com ela antes de virar código.
 */
export function acuraciaDoProblema(tentativasConcluirIncorretas: number): number {
  return Math.max(0, 1 - PESO_TENTATIVA_INCORRETA * Math.max(0, tentativasConcluirIncorretas));
}
