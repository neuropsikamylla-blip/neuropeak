/** Quanto mede o card de cena na grade do Ordem da História.
 *
 *  Era um número FIXO em px (300 / 250 / 210 conforme a quantidade de cenas). Ela testou no
 *  notebook e reprovou: *"acho que elas estao muito pequena para quando abre no NOTEBOOK...
 *  o tamanho talvez esteja razoavel para celular, mas para o computador nao"*. Fixo em px, o
 *  card ignorava a altura da tela — sobrava meia tela vazia embaixo enquanto as cenas ficavam
 *  miúdas.
 *
 *  E aqui ENXERGAR é a tarefa: a ordem se deduz de detalhes pequenos — a roupa que mudou, o
 *  objeto que saiu da mão, o quanto já foi construído. Cena pequena não é desconforto, é o
 *  exercício ficando mais difícil pelo motivo errado.
 */

/** Padrão de segurança para o espaço que não é a grade, usado no primeiro render, antes de
 *  o layout ser medido. Fica FOLGADO de propósito: errar para menos faria o botão de
 *  confirmar sumir, porque o contêiner do exercício é `overflow: hidden`. */
export const ALTURA_FORA_PADRAO = 260;
/** Margem sobre a altura medida, para o arredondamento e a sombra do botão. */
export const FOLGA_MEDIDA = 12;
export const GAP_GRADE = 16;
export const MARGEM_LATERAL = 48;
/** Nunca menor que isto (telas baixas) nem maior (telas altas, onde um card gigante deixa
 *  o arraste longo demais e a leitura pior). */
export const CARD_MIN = 200;
export const CARD_MAX = 420;

export function tamanhoDoCard(entrada: {
  larguraJanela: number;
  alturaJanela: number;
  cenas: number;
  colunas: number;
  /** largura/altura da cena, do catálogo */
  proporcao: number;
  /** Altura ocupada por cabeçalho, instrução e rodapé. MEDIDA do layout; o padrão só
   *  vale no primeiro render. */
  alturaForaDaGrade?: number;
}): number {
  const { larguraJanela, alturaJanela, cenas, colunas, proporcao } = entrada;
  const foraDaGrade = entrada.alturaForaDaGrade ?? ALTURA_FORA_PADRAO;
  const linhas = Math.ceil(cenas / colunas);
  const a = proporcao > 0 ? proporcao : 1.2;

  const porAltura = (Math.max(0, alturaJanela - foraDaGrade) / linhas - GAP_GRADE) * a;
  const porLargura = (larguraJanela - MARGEM_LATERAL) / colunas - GAP_GRADE;

  return Math.max(CARD_MIN, Math.min(CARD_MAX, porAltura, porLargura));
}
