import { posicoesParaEstado, type Estado } from "./estado";
import { menorCaminho } from "./minimo";
import type { TipoProblema } from "./tipos";

export interface Problema {
  id: string;
  discos: number;
  tipo: TipoProblema;
  inicial: Estado;
  alvo: Estado;
  minimo: number;
  fase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  categoria: "P" | "RP" | "F" | "M";
}

type DefinicaoProblema = Omit<Problema, "minimo">;

function torre(discos: number, haste: 0 | 1 | 2): Estado {
  return posicoesParaEstado(Array<number>(discos).fill(haste));
}

/** Posições na ordem dos discos 1 (menor) até n (maior). */
function configuracao(...posicoes: number[]): Estado {
  return posicoesParaEstado(posicoes);
}

const DEFINICOES = [
  // Fases 1–3: há somente seis pares clássicos distintos em três hastes.
  // Seis problemas cobrem uma sessão de 11 min a cerca de um a cada 1 min 50 s,
  // sem duplicar artificialmente a mesma geometria dentro da fase.
  // Fase 1 — 3 discos, exclusivamente transferências clássicas.
  // FASE 1 — a porta de entrada. Ela foi literal: "todos os discos empilhados corretamente na
  // haste esquerda" → "todos empilhados corretamente na haste direita". Um formato só, de
  // propósito: aqui se aprende a REGRA, e repetir o mesmo problema é o que consolida. Destino
  // variável é a fase 3, e está lá.
  { id: "A3-01", discos: 3, tipo: "A", inicial: torre(3, 0), alvo: torre(3, 2), fase: 1, categoria: "P" },

  // Fase 2 — os mesmos seis formatos clássicos, agora com 4 discos.
  // FASE 2 — o mesmo formato clássico, agora com 4 discos. Também um só: a variação de destino
  // pertence à fase 3.
  { id: "A4-01", discos: 4, tipo: "A", inicial: torre(4, 0), alvo: torre(4, 2), fase: 2, categoria: "P" },

  // Fase 3 — a origem continua uma torre; o destino varia entre as outras hastes.
  { id: "A4-02", discos: 4, tipo: "A", inicial: torre(4, 0), alvo: torre(4, 2), fase: 3, categoria: "RP" },
  { id: "B4-06", discos: 4, tipo: "B", inicial: torre(4, 0), alvo: torre(4, 1), fase: 3, categoria: "RP" },
  { id: "B4-07", discos: 4, tipo: "B", inicial: torre(4, 1), alvo: torre(4, 0), fase: 3, categoria: "RP" },
  { id: "B4-08", discos: 4, tipo: "B", inicial: torre(4, 1), alvo: torre(4, 2), fase: 3, categoria: "RP" },
  { id: "B4-09", discos: 4, tipo: "B", inicial: torre(4, 2), alvo: torre(4, 0), fase: 3, categoria: "RP" },
  { id: "B4-10", discos: 4, tipo: "B", inicial: torre(4, 2), alvo: torre(4, 1), fase: 3, categoria: "RP" },

  // Fase 4 — início variável; o alvo volta a ser uma torre completa.
  { id: "C4-01", discos: 4, tipo: "C", inicial: configuracao(0, 1, 0, 1), alvo: torre(4, 2), fase: 4, categoria: "RP" },
  { id: "C4-02", discos: 4, tipo: "C", inicial: configuracao(2, 0, 1, 0), alvo: torre(4, 2), fase: 4, categoria: "RP" },
  { id: "C4-03", discos: 4, tipo: "C", inicial: configuracao(1, 2, 0, 0), alvo: torre(4, 1), fase: 4, categoria: "RP" },
  { id: "C4-04", discos: 4, tipo: "C", inicial: configuracao(2, 1, 2, 0), alvo: torre(4, 0), fase: 4, categoria: "F" },
  { id: "C4-05", discos: 4, tipo: "C", inicial: configuracao(0, 2, 1, 2), alvo: torre(4, 1), fase: 4, categoria: "F" },
  { id: "C4-06", discos: 4, tipo: "C", inicial: configuracao(1, 0, 2, 1), alvo: torre(4, 0), fase: 4, categoria: "F" },

  // Fase 5 — tanto início quanto alvo são configurações variáveis.
  { id: "D4-01", discos: 4, tipo: "D", inicial: configuracao(2, 0, 1, 1), alvo: configuracao(1, 2, 0, 2), fase: 5, categoria: "RP" },
  { id: "D4-02", discos: 4, tipo: "D", inicial: configuracao(1, 2, 0, 1), alvo: configuracao(2, 0, 1, 2), fase: 5, categoria: "RP" },
  { id: "D4-03", discos: 4, tipo: "D", inicial: configuracao(0, 2, 1, 0), alvo: configuracao(2, 1, 0, 2), fase: 5, categoria: "F" },
  { id: "D4-04", discos: 4, tipo: "D", inicial: configuracao(1, 0, 2, 0), alvo: configuracao(0, 2, 1, 2), fase: 5, categoria: "F" },
  { id: "D4-05", discos: 4, tipo: "D", inicial: configuracao(2, 1, 0, 2), alvo: configuracao(0, 1, 2, 1), fase: 5, categoria: "M" },
  { id: "D4-06", discos: 4, tipo: "D", inicial: configuracao(0, 1, 2, 0), alvo: configuracao(1, 2, 0, 1), fase: 5, categoria: "M" },

  // Fase 6 — 5 discos e formatos mistos, para não transformar a progressão em uma escada rígida.
  { id: "A5-01", discos: 5, tipo: "A", inicial: torre(5, 0), alvo: torre(5, 2), fase: 6, categoria: "P" },
  { id: "B5-01", discos: 5, tipo: "B", inicial: torre(5, 1), alvo: torre(5, 2), fase: 6, categoria: "P" },
  { id: "C5-01", discos: 5, tipo: "C", inicial: configuracao(0, 1, 0, 2, 1), alvo: torre(5, 2), fase: 6, categoria: "RP" },
  { id: "C5-02", discos: 5, tipo: "C", inicial: configuracao(2, 0, 1, 2, 0), alvo: torre(5, 1), fase: 6, categoria: "F" },
  { id: "D5-01", discos: 5, tipo: "D", inicial: configuracao(1, 2, 0, 1, 2), alvo: configuracao(0, 2, 1, 0, 2), fase: 6, categoria: "F" },
  { id: "D5-02", discos: 5, tipo: "D", inicial: configuracao(0, 2, 1, 0, 2), alvo: configuracao(2, 1, 0, 2, 1), fase: 6, categoria: "M" },
  { id: "E5-01", discos: 5, tipo: "E", inicial: configuracao(2, 1, 0, 2, 0), alvo: torre(5, 1), fase: 6, categoria: "M" },
  { id: "E5-02", discos: 5, tipo: "E", inicial: torre(5, 2), alvo: configuracao(1, 0, 2, 1, 0), fase: 6, categoria: "F" },

  // Fase 7 — 5 discos com estados menos regulares e alternância entre C, D e E.
  { id: "C5-03", discos: 5, tipo: "C", inicial: configuracao(2, 1, 0, 2, 1), alvo: torre(5, 0), fase: 7, categoria: "M" },
  { id: "C5-04", discos: 5, tipo: "C", inicial: configuracao(1, 0, 2, 1, 0), alvo: torre(5, 2), fase: 7, categoria: "M" },
  { id: "D5-03", discos: 5, tipo: "D", inicial: configuracao(2, 0, 1, 2, 0), alvo: configuracao(1, 2, 0, 1, 2), fase: 7, categoria: "M" },
  { id: "D5-04", discos: 5, tipo: "D", inicial: configuracao(0, 1, 2, 1, 0), alvo: configuracao(2, 0, 1, 0, 2), fase: 7, categoria: "M" },
  { id: "E5-03", discos: 5, tipo: "E", inicial: configuracao(1, 2, 0, 2, 1), alvo: torre(5, 0), fase: 7, categoria: "F" },
  { id: "E5-04", discos: 5, tipo: "E", inicial: torre(5, 1), alvo: configuracao(0, 2, 1, 0, 2), fase: 7, categoria: "F" },
  { id: "D5-05", discos: 5, tipo: "D", inicial: configuracao(0, 2, 1, 2, 0), alvo: configuracao(1, 0, 2, 0, 1), fase: 7, categoria: "M" },
  { id: "C5-05", discos: 5, tipo: "C", inicial: configuracao(2, 0, 2, 1, 0), alvo: torre(5, 1), fase: 7, categoria: "M" },

  // Fase 8 — poucos desafios seletivos de 6 discos; nunca 7 ou 8 discos.
  { id: "C6-01", discos: 6, tipo: "C", inicial: configuracao(0, 1, 0, 2, 1, 0), alvo: torre(6, 2), fase: 8, categoria: "RP" },
  { id: "D6-01", discos: 6, tipo: "D", inicial: configuracao(2, 1, 2, 0, 1, 0), alvo: configuracao(0, 2, 1, 0, 2, 1), fase: 8, categoria: "M" },
  { id: "E6-01", discos: 6, tipo: "E", inicial: configuracao(1, 0, 2, 1, 0, 2), alvo: torre(6, 1), fase: 8, categoria: "F" },
  { id: "D6-02", discos: 6, tipo: "D", inicial: configuracao(0, 2, 1, 2, 0, 1), alvo: configuracao(2, 0, 1, 0, 2, 1), fase: 8, categoria: "M" },
  { id: "E6-02", discos: 6, tipo: "E", inicial: torre(6, 0), alvo: configuracao(2, 1, 0, 2, 1, 0), fase: 8, categoria: "RP" },
] as const satisfies readonly DefinicaoProblema[];

function preValidar(definicao: DefinicaoProblema): Problema {
  const resultado = menorCaminho(definicao.inicial, definicao.alvo, definicao.discos);
  if (resultado === null || resultado.minimo <= 0) {
    throw new Error(`O problema ${definicao.id} não possui um caminho positivo até o alvo.`);
  }
  return { ...definicao, minimo: resultado.minimo };
}

/** Banco fechado: toda configuração e todo mínimo são validados pela BFS ao carregar o módulo. */
export const BANCO: readonly Problema[] = Object.freeze(DEFINICOES.map(preValidar));
