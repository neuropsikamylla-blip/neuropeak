export * from "./tipos";
export {
  admiteSolucao,
  contarSolucoes,
  encontrarSolucoes,
  pistasEmConflito,
  restricoesViolando,
  temSolucaoUnica,
  validarPuzzle,
} from "./solver";
export { itensDaPista, itensDaRestricao, validarEstruturaPuzzle } from "./motor";
export { derivar } from "./derivacao";
export {
  LIMIAR_ORDEM_DECLARADA,
  avaliarEstrutura,
} from "./estrutura";
export type {
  ArestaCategorias,
  ProfundidadeInferencial,
  RelatorioEstrutural,
} from "./estrutura";
export { BANCO_GRADE, PROBLEMA_TUTORIAL, PROBLEMAS_GRADE, selecionarProblema } from "./banco";
export {
  CONFIGURACAO_VERIFICACOES,
  MENSAGEM_COM_INCOMPATIBILIDADE,
  MENSAGEM_SEM_INCOMPATIBILIDADE,
  PESO_TENTATIVA_INCORRETA,
  acuraciaDoProblema,
  celulasComValorRepetido,
  chavePosicaoGrade,
  consumirVerificacao,
  estadoDaAtribuicao,
  criarGradeVazia,
  gradeEstaCorreta,
  mensagemVerificacao,
  paraMarcacaoParcial,
  registrarCorrecaoDasVerificacoes,
  relacaoJaDeterminada,
  resumirAtribuicoes,
  verificacaoDisponivel,
  verificacoesPermitidas,
} from "./interacao";
export type {
  ConfiguracaoVerificacoes,
  EstadoDaAtribuicao,
  EstadoGrade,
  QuantidadeVerificacoes,
  RegistroAtribuicao,
  RegistroVerificacao,
  ResumoAtribuicoes,
  ValorCelula,
} from "./interacao";
