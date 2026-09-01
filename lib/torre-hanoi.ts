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
 * para permanência prolongada... a repetição excessiva transforma a tarefa em reprodução de
 * sequência conhecida em vez de planejamento"*.
 *
 * A pergunta que o gate faz é UMA — *"a pessoa compreendeu e consegue aplicar as regras básicas
 * da Torre?"* — e não "ela já joga bem". Daí a assimetria entre os sinais, ajustada por ela em
 * 01/set:
 *
 * - **Movimento inválido bloqueia sozinho.** É o único sinal que fala diretamente sobre APLICAR
 *   a regra: tentar pôr um disco maior sobre um menor é não ter entendido a restrição.
 * - **Reiniciar NÃO bloqueia sozinho.** Palavras dela: *"pode representar percepção de uma
 *   estratégia ineficiente e autorregulação, portanto não deve ser usado sozinho como evidência
 *   de que a regra não foi compreendida"*.
 * - **Eficiência baixa NÃO bloqueia sozinha.** *"Nessas fases, eficiência baixa pode indicar
 *   planejamento ainda imaturo, mas isso é justamente algo que o exercício deverá treinar nas
 *   fases seguintes."* E ela já tinha sido explícita: não exigir mínimo de movimentos.
 * - **Os dois juntos bloqueiam.** Eficiência muito baixa E vários reinícios, combinados, sugerem
 *   dificuldade global suficiente para repetir a fase.
 *
 * Da fase 3 em diante, onde o destino já varia, volta o critério de desempenho mais exigente.
 *
 * Os limiares são PARÂMETROS DO PROGRAMA, não norma neuropsicológica — a mesma ressalva que ela
 * fez sobre as faixas de eficiência (seção 11 da espec). Ajustáveis com dados reais de uso.
 */
/** Bloqueia SOZINHO: fala diretamente sobre aplicar a regra. */
const GATE_INVALIDOS_MAXIMOS = 3;
/** Só bloqueiam JUNTOS: cada um sozinho tem leitura clínica benigna. */
const GATE_EFICIENCIA_ALTA = 2.0;
const GATE_REINICIOS_ALTOS = 1;

export function deveAvancarDeFase(fase: number, d: DesempenhoPuzzle): boolean {
  if (fase > 2) return deveSubirDeNivel(d.eficiencia);

  // A função só é chamada quando o problema FOI concluído — quem não conclui não chega aqui, e
  // fica na fase por não ter fechado o gate.
  if (d.invalidos > GATE_INVALIDOS_MAXIMOS) return false;
  if (d.eficiencia > GATE_EFICIENCIA_ALTA && d.reinicios > GATE_REINICIOS_ALTOS) return false;
  return true;
}

/**
 * A segunda tentativa só se oferece quando existe o que melhorar.
 *
 * Ela, em 01/set/2026, depois de resolver em 15 movimentos com mínimo 15: *"apareceu 'você quer
 * tentar resolver em uma menor quantidade?'... acho que tem de aparecer somente se eu extrapolar
 * o mínimo (que não aparece) mas que você sabe"*. Perguntar a quem já achou o caminho mais curto
 * é pedir o impossível — e ainda sugere que o desempenho dele não bastou.
 *
 * O mínimo continua invisível durante a execução: quem sabe dele é o sistema, e é o sistema que
 * decide se a pergunta faz sentido.
 */
export function ofereceSegundaTentativa(movimentos: number, minimo: number): boolean {
  return movimentos > minimo;
}
