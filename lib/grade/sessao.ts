import { acuraciaDoProblema, type RegistroAtribuicao, type RegistroVerificacao } from "./interacao";
import { calcularIndicadores, type IndicadoresGrade } from "./indicadores";
import type { Puzzle } from "./tipos";

/**
 * ⚠️ PROVISÓRIA. O valor é o PADRÃO DA PLATAFORMA fechado por ela em 09/set — alvo de 8 min —,
 * e substituiu a proposta de 11 min que esta fatia trazia. Ela decidiu que Torre, Estacionamento
 * e Grade entram todos no mesmo padrão: *"a margem de 8→10 existe justamente para permitir
 * concluir adequadamente um problema de planejamento já iniciado sem transformar o exercício em
 * um bloco longo demais"*.
 *
 * Esta constante SOME quando a Grade migrar para `useBlocoDeTreino` (dosagem global), que traz o
 * teto de 10 min e a janela de tolerância que ainda não existem aqui. Até lá, a Grade tem alvo e
 * não tem teto — que é o comportamento de todos os outros exercícios hoje.
 */
export const DURACAO_SESSAO_GRADE_MS = 8 * 60 * 1000;

export interface EventoPistaGrade {
  type: "clue_crossed" | "clue_uncrossed";
  pistaId: string;
  momento: number;
  timestamp: number;
}

export interface RegistroProblemaGrade {
  puzzleId: string;
  nivel: Puzzle["nivel"];
  concluido: boolean;
  atribuicoes: RegistroAtribuicao[];
  verificacoes: RegistroVerificacao[];
  eventosPista: EventoPistaGrade[];
  atribuicoesAntesDeDeterminacao: number;
  dessasMantidas: number;
  dessasRevisadas: number;
  atribuicoesComEstadoJaContraditorio: number;
  latenciaPrimeiraAcao: number;
  totalAcoes: number;
  tempoTotal: number;
  tentativasConcluirIncorretas: number;
  usosVerificarRaciocinio: number;
}

export type MetadataSessaoGrade = {
  problemas: readonly RegistroProblemaGrade[];
  problemasResolvidos: number;
  tempoTotal: number;
  atribuicoesAntesDeDeterminacao: number;
  dessasMantidas: number;
  dessasRevisadas: number;
  atribuicoesComEstadoJaContraditorio: number;
  indicadores?: IndicadoresGrade;
};

export interface AgregadoSessaoGrade {
  metadata: MetadataSessaoGrade;
  acuracia: number;
}

/**
 * Consolida a sessão sem misturar o cálculo clínico com o ciclo de estado da tela.
 * Problemas que ultrapassaram o tempo enquanto estavam em andamento permanecem auditáveis,
 * mas não contam como resolvidos nem alteram a média de acurácia.
 */
export function agregarSessaoGrade(
  problemas: readonly RegistroProblemaGrade[]
): AgregadoSessaoGrade {
  const concluidos = problemas.filter((problema) => problema.concluido);
  const somar = (
    campo:
      | "tempoTotal"
      | "atribuicoesAntesDeDeterminacao"
      | "dessasMantidas"
      | "dessasRevisadas"
      | "atribuicoesComEstadoJaContraditorio"
  ): number => problemas.reduce((total, problema) => total + problema[campo], 0);

  const acuracia = concluidos.length === 0
    ? 0
    : concluidos.reduce(
      (total, problema) => total + acuraciaDoProblema(problema.tentativasConcluirIncorretas),
      0
    ) / concluidos.length;

  const metadataSemIndicadores: MetadataSessaoGrade = {
    problemas,
    problemasResolvidos: concluidos.length,
    tempoTotal: somar("tempoTotal"),
    atribuicoesAntesDeDeterminacao: somar("atribuicoesAntesDeDeterminacao"),
    dessasMantidas: somar("dessasMantidas"),
    dessasRevisadas: somar("dessasRevisadas"),
    atribuicoesComEstadoJaContraditorio: somar("atribuicoesComEstadoJaContraditorio"),
  };

  return {
    metadata: {
      ...metadataSemIndicadores,
      indicadores: calcularIndicadores(metadataSemIndicadores),
    },
    acuracia,
  };
}
