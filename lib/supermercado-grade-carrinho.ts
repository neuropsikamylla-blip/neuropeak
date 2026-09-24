/** Como os itens se organizam dentro da cesta do carrinho.
 *
 *  Ela mandou a referência do que queria: produtos GRANDES, ocupando a cesta, sem espaço
 *  sobrando dos lados. As duas tentativas anteriores erraram por motivos opostos —
 *  primeiro a célula dividia a área inteira e a foto boiava no meio dela; depois a grade
 *  mantinha proporção fixa e encolhia de largura, deixando as fotos miúdas com nove itens.
 */

/** Nunca menos que isto, mesmo com dois itens: sem o piso, duas compras dividiriam a altura
 *  inteira em uma faixa só e apareceriam gigantes. Com ele, ocupam a faixa de baixo num
 *  tamanho de gente — e `alignContent: end` assenta tudo no fundo, como num carrinho real. */
export const LINHAS_MINIMAS_CESTA = 3;

/** ⚠️ O carrinho NÃO tem teto: o paciente pode pegar mais itens do que a lista pedia, e é
 *  assim que o erro por excesso aparece — ela mesma chegou a 9 numa lista de 2. A grade
 *  precisa aguentar qualquer quantidade sem espremer a foto. */
export function colunasDoCarrinho(itens: number): number {
  if (itens <= 4) return 2;
  if (itens <= 12) return 3;
  return 4;
}

export function linhasDoCarrinho(itens: number): number {
  return Math.max(LINHAS_MINIMAS_CESTA, Math.ceil(itens / colunasDoCarrinho(itens)));
}

/** Quantas células vazias entram ANTES dos produtos na grade.
 *
 *  É o que faz as compras assentarem no FUNDO da cesta e subirem conforme entram, como num
 *  carrinho de verdade. `alignContent: end` sozinho não resolve: as faixas já ocupam a altura
 *  toda, então não sobra espaço livre para alinhar e os itens ficam na primeira linha.
 *  Ela viu com dois itens: *"podemos começar na parte de baixo, e quando aumenta a quantidade
 *  sobe e nao ao contrario"*. */
export function vaziasAntes(itens: number): number {
  const celulas = colunasDoCarrinho(itens) * linhasDoCarrinho(itens);
  return Math.max(0, celulas - itens);
}
