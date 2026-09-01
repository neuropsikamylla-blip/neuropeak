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

export interface DesempenhoPuzzle {
  eficiencia: number;
  reinicios: number;
  invalidos: number;
}

/**
 * As fases 1 e 2 são GATE DE AQUISIÇÃO, não banco de treino recorrente.
 *
 * Decisão dela em 01/set/2026: *"elas são fases de aquisição/consolidação da regra, e não fases
 * para permanência prolongada... depois de demonstrar domínio suficiente o sistema deve avançar,
 * porque a repetição excessiva transforma a tarefa em reprodução de sequência conhecida em vez de
 * planejamento"*. E o critério, nas palavras dela: *"se concluir com compreensão das regras e sem
 * dificuldade importante, pode avançar... NÃO EXIGIR MÍNIMO DE MOVIMENTOS"*.
 *
 * Por isso o gate não olha eficiência boa — olha ausência de sinal de que a regra ainda não foi
 * pega. Da fase 3 em diante, onde o destino já varia, volta a valer o critério apertado.
 *
 * Os três limiares abaixo são PARÂMETROS DO PROGRAMA, não norma neuropsicológica — a mesma
 * ressalva que ela fez sobre as faixas de eficiência (seção 11 da espec). Ajustáveis com dados
 * reais de uso.
 */
const GATE_EFICIENCIA_MAXIMA = 2.0;   // mais que o dobro do mínimo sugere que ainda não pegou
const GATE_REINICIOS_MAXIMOS = 1;
const GATE_INVALIDOS_MAXIMOS = 3;

export function deveAvancarDeFase(fase: number, d: DesempenhoPuzzle): boolean {
  if (fase > 2) return deveSubirDeNivel(d.eficiencia);
  return (
    d.eficiencia <= GATE_EFICIENCIA_MAXIMA &&
    d.reinicios <= GATE_REINICIOS_MAXIMOS &&
    d.invalidos <= GATE_INVALIDOS_MAXIMOS
  );
}
