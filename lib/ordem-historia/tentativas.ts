export interface RegistroHistoria {
  acertoPrimeira: number;
  acertoFinal: number;
  confirmacoes: number;
  resolvida: boolean;
  resolvidaDePrimeira: boolean;
  movimentos: number;
}

export interface ResumoSessao {
  storiesFirstTryExact: number;
  storiesSolvedAfter: number;
  storiesUnsolved: number;
  accFirstTry: number;
  accFinal: number;
  confirmationsTotal: number;
}

/** Cenas na posição certa e a fotografia cardId -> índice dessa confirmação. */
export function avaliarOrdem(cards: { id: string; order: number }[]): {
  corretas: number;
  total: number;
  acertos: Record<string, number>;
} {
  const acertos: Record<string, number> = {};

  cards.forEach((card, indice) => {
    if (card.order === indice) acertos[card.id] = indice;
  });

  return { corretas: Object.keys(acertos).length, total: cards.length, acertos };
}

/** Agrega as histórias encerradas da sessão sem incluir abandonos nas médias. */
export function resumirSessao(registros: RegistroHistoria[]): ResumoSessao {
  const concluidas = registros.filter((registro) => registro.resolvida);
  const media = (campo: "acertoPrimeira" | "acertoFinal") => concluidas.length
    ? concluidas.reduce((total, registro) => total + registro[campo], 0) / concluidas.length
    : 0;

  return {
    storiesFirstTryExact: registros.filter((registro) => registro.resolvidaDePrimeira).length,
    storiesSolvedAfter: registros.filter((registro) => registro.resolvida && !registro.resolvidaDePrimeira).length,
    storiesUnsolved: registros.filter((registro) => !registro.resolvida).length,
    accFirstTry: media("acertoPrimeira"),
    accFinal: media("acertoFinal"),
    confirmationsTotal: registros.reduce((total, registro) => total + registro.confirmacoes, 0),
  };
}
