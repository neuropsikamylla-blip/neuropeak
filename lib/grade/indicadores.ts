import { BANCO_GRADE } from "./banco";
import {
  CONFIGURACAO_VERIFICACOES,
  verificacoesPermitidas,
  type ConfiguracaoVerificacoes,
} from "./interacao";
import type { EventoPistaGrade, MetadataSessaoGrade } from "./sessao";

export interface OrdemDaPistaTrabalhada {
  puzzleId: string;
  pistaId: string;
  ordem: number;
  acao: EventoPistaGrade["type"];
}

export interface IndicadoresGrade {
  resolucao: number | null;
  exploracaoAntesDaDeterminacao: {
    atribuicoesAntesDeDeterminacaoPorAtribuicoes: number | null;
    atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: number | null;
  };
  persistenciaEmContradicao: number | null;
  autonomiaDeMonitoramento: {
    verificacoesUsadasPorCota: number | null;
    verificacoesInconsistentesCorrigidasDepois: number;
  };
  metodoDeLeitura: {
    pistasRiscadasPorPistasDoProblema: number | null;
    pistasDesmarcadasDepois: number;
    ordemDasPistasTrabalhadas: readonly OrdemDaPistaTrabalhada[];
  };
}

function razao(numerador: number, denominador: number): number | null {
  return denominador === 0 ? null : numerador / denominador;
}

function totalDeAtribuicoes(metadata: MetadataSessaoGrade): number {
  return metadata.problemas.reduce((total, problema) => total + problema.atribuicoes.length, 0);
}

export function resolucao(metadata: MetadataSessaoGrade): number | null {
  return razao(metadata.problemasResolvidos, metadata.problemas.length);
}

/**
 * Explorar antes de a relação estar determinada não é defeito: é uma forma de resolver um
 * problema de restrições. O que diferencia os registros é o que veio depois: atribuições
 * revisadas registram mudança posterior; atribuições sobre estado já contraditório pertencem
 * ao indicador separado de persistência em contradição.
 */
export function exploracaoAntesDaDeterminacao(
  metadata: MetadataSessaoGrade
): IndicadoresGrade["exploracaoAntesDaDeterminacao"] {
  const totalAtribuicoes = totalDeAtribuicoes(metadata);
  const totalAntesDaDeterminacao = metadata.atribuicoesAntesDeDeterminacao;

  return {
    atribuicoesAntesDeDeterminacaoPorAtribuicoes: razao(
      totalAntesDaDeterminacao,
      totalAtribuicoes
    ),
    atribuicoesRevisadasPorAtribuicoesAntesDeDeterminacao: razao(
      metadata.dessasRevisadas,
      totalAntesDaDeterminacao
    ),
  };
}

export function persistenciaEmContradicao(metadata: MetadataSessaoGrade): number | null {
  return razao(metadata.atribuicoesComEstadoJaContraditorio, totalDeAtribuicoes(metadata));
}

function cotaDisponivel(
  metadata: MetadataSessaoGrade,
  configuracao: Readonly<ConfiguracaoVerificacoes>
): number | null {
  let cota = 0;
  for (const problema of metadata.problemas) {
    const permitidas = verificacoesPermitidas(problema.nivel, false, configuracao);
    if (permitidas === "livre") return null;
    cota += permitidas;
  }
  return cota;
}

export function autonomiaDeMonitoramento(
  metadata: MetadataSessaoGrade,
  configuracao: Readonly<ConfiguracaoVerificacoes> = CONFIGURACAO_VERIFICACOES
): IndicadoresGrade["autonomiaDeMonitoramento"] {
  const verificacoes = metadata.problemas.flatMap((problema) => problema.verificacoes);
  const verificacoesInconsistentes = verificacoes.filter(
    (verificacao) => verificacao.estado === "inconsistente"
  );
  const cota = cotaDisponivel(metadata, configuracao);

  return {
    verificacoesUsadasPorCota: cota === null ? null : razao(verificacoes.length, cota),
    verificacoesInconsistentesCorrigidasDepois: verificacoesInconsistentes.filter(
      (verificacao) => verificacao.corrigidaDepois
    ).length,
  };
}

function totalDePistasDosProblemas(metadata: MetadataSessaoGrade): number | null {
  const pistasPorPuzzle = new Map(BANCO_GRADE.map((puzzle) => [puzzle.id, puzzle.pistas.length]));
  let total = 0;

  for (const problema of metadata.problemas) {
    const quantidade = pistasPorPuzzle.get(problema.puzzleId);
    if (quantidade === undefined) return null;
    total += quantidade;
  }

  return total;
}

export function metodoDeLeitura(
  metadata: MetadataSessaoGrade
): IndicadoresGrade["metodoDeLeitura"] {
  const eventos = metadata.problemas.flatMap((problema) =>
    problema.eventosPista.map((evento) => ({ puzzleId: problema.puzzleId, evento }))
  );
  const totalDePistas = totalDePistasDosProblemas(metadata);
  const pistasRiscadas = eventos.filter(({ evento }) => evento.type === "clue_crossed");

  return {
    pistasRiscadasPorPistasDoProblema: totalDePistas === null
      ? null
      : razao(pistasRiscadas.length, totalDePistas),
    pistasDesmarcadasDepois: eventos.filter(({ evento }) => evento.type === "clue_uncrossed").length,
    ordemDasPistasTrabalhadas: eventos.map(({ puzzleId, evento }, indice) => ({
      puzzleId,
      pistaId: evento.pistaId,
      ordem: indice + 1,
      acao: evento.type,
    })),
  };
}

export function calcularIndicadores(
  metadata: MetadataSessaoGrade,
  configuracao: Readonly<ConfiguracaoVerificacoes> = CONFIGURACAO_VERIFICACOES
): IndicadoresGrade {
  return {
    resolucao: resolucao(metadata),
    exploracaoAntesDaDeterminacao: exploracaoAntesDaDeterminacao(metadata),
    persistenciaEmContradicao: persistenciaEmContradicao(metadata),
    autonomiaDeMonitoramento: autonomiaDeMonitoramento(metadata, configuracao),
    metodoDeLeitura: metodoDeLeitura(metadata),
  };
}
