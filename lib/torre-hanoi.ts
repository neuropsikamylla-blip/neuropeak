/**
 * O mínimo é referência matemática e métrica interna, nunca critério rígido de
 * sucesso: resolver em 17 movimentos quando o mínimo era 15 não é fracasso.
 */
export function eficiencia(moves: number, optimal: number): number {
  // Sem um mínimo positivo não há razão de eficiência. Retornamos Infinity para
  // não deixar NaN escapar e para impedir progressão baseada em uma métrica inválida.
  if (optimal <= 0) return Infinity;
  return moves / optimal;
}

export type FaixaEficiencia = "muito-boa" | "adequada" | "baixa";

export function faixaEficiencia(ef: number): FaixaEficiencia {
  if (ef <= 1.2) return "muito-boa";
  if (ef <= 1.4) return "adequada";
  return "baixa";
}

export function deveSubirDeNivel(ef: number): boolean {
  return ef <= 1.4;
}
