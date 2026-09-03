export * from "./tipos";
export {
  admiteSolucao,
  contarSolucoes,
  encontrarSolucoes,
  pistasEmConflito,
  temSolucaoUnica,
  validarPuzzle,
} from "./solver";
export { derivar } from "./derivacao";
export { BANCO_GRADE, PROBLEMA_TUTORIAL, PROBLEMAS_GRADE, selecionarProblema } from "./banco";
export {
  MENSAGEM_SEM_INCOMPATIBILIDADE,
  NIVEIS_COM_VERIFICACAO,
  PESO_TENTATIVA_INCORRETA,
  acuraciaDoProblema,
  celulasComValorRepetido,
  chavePosicaoGrade,
  estadoDaAtribuicao,
  criarGradeVazia,
  gradeEstaCorreta,
  mensagemVerificacao,
  paraMarcacaoParcial,
  relacaoJaDeterminada,
  resumirAtribuicoes,
  verificacaoDisponivel,
} from "./interacao";
export type {
  EstadoDaAtribuicao,
  EstadoGrade,
  RegistroAtribuicao,
  ResumoAtribuicoes,
  ValorCelula,
} from "./interacao";
