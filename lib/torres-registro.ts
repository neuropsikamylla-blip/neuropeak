export interface MovimentoTorre {
  disco: number;
  de: number;
  para: number;
}

/**
 * Conta quando um disco retorna imediatamente, na sua própria sequência de
 * movimentos, à haste de onde acabou de sair. Movimentos de outros discos no
 * intervalo não mudam esse padrão; outro movimento do mesmo disco, sim.
 */
export function contarReversoes(movimentos: MovimentoTorre[]): number {
  const ultimoMovimentoPorDisco = new Map<number, MovimentoTorre>();
  let reversoes = 0;

  for (const movimento of movimentos) {
    const anterior = ultimoMovimentoPorDisco.get(movimento.disco);
    if (anterior && movimento.de === anterior.para && movimento.para === anterior.de) {
      reversoes += 1;
    }
    ultimoMovimentoPorDisco.set(movimento.disco, movimento);
  }

  return reversoes;
}
