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
  fase: 1 | 2 | 3 | 4 | 5 | 6;
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
  // Fase 1 — a única geometria A estrita com 3 discos.
  { id: "A3-01", discos: 3, tipo: "A", inicial: torre(3, 0), alvo: torre(3, 2), fase: 1, categoria: "P" },

  // Fase 2 — todas as seis transferências completas ordenadas com 4 discos.
  { id: "A4-01", discos: 4, tipo: "A", inicial: torre(4, 0), alvo: torre(4, 2), fase: 2, categoria: "P" },
  { id: "B4-01", discos: 4, tipo: "B", inicial: torre(4, 0), alvo: torre(4, 1), fase: 2, categoria: "P" },
  { id: "B4-02", discos: 4, tipo: "B", inicial: torre(4, 1), alvo: torre(4, 0), fase: 2, categoria: "P" },
  { id: "B4-03", discos: 4, tipo: "B", inicial: torre(4, 1), alvo: torre(4, 2), fase: 2, categoria: "F" },
  { id: "B4-04", discos: 4, tipo: "B", inicial: torre(4, 2), alvo: torre(4, 0), fase: 2, categoria: "F" },
  { id: "B4-05", discos: 4, tipo: "B", inicial: torre(4, 2), alvo: torre(4, 1), fase: 2, categoria: "F" },

  // Fase 3 — configurações iniciais e objetivos diferentes, sempre com 4 discos.
  { id: "C4-01", discos: 4, tipo: "C", inicial: configuracao(0, 1, 0, 1), alvo: torre(4, 2), fase: 3, categoria: "RP" },
  { id: "C4-02", discos: 4, tipo: "C", inicial: configuracao(2, 0, 1, 0), alvo: torre(4, 2), fase: 3, categoria: "RP" },
  { id: "C4-03", discos: 4, tipo: "C", inicial: configuracao(1, 2, 0, 0), alvo: torre(4, 1), fase: 3, categoria: "RP" },
  { id: "C4-04", discos: 4, tipo: "C", inicial: configuracao(2, 1, 2, 0), alvo: torre(4, 0), fase: 3, categoria: "RP" },
  { id: "C4-05", discos: 4, tipo: "C", inicial: configuracao(0, 2, 1, 2), alvo: torre(4, 1), fase: 3, categoria: "M" },
  { id: "D4-01", discos: 4, tipo: "D", inicial: torre(4, 0), alvo: configuracao(2, 1, 2, 0), fase: 3, categoria: "RP" },
  { id: "D4-02", discos: 4, tipo: "D", inicial: torre(4, 1), alvo: configuracao(0, 2, 1, 0), fase: 3, categoria: "RP" },
  { id: "D4-03", discos: 4, tipo: "D", inicial: configuracao(2, 0, 1, 1), alvo: configuracao(1, 2, 0, 2), fase: 3, categoria: "M" },

  // Fase 4 — alternância entre transferência, estado parcial, alvo-modelo e papel E.
  { id: "B3-01", discos: 3, tipo: "B", inicial: torre(3, 0), alvo: torre(3, 1), fase: 4, categoria: "F" },
  { id: "B3-02", discos: 3, tipo: "B", inicial: torre(3, 1), alvo: torre(3, 2), fase: 4, categoria: "F" },
  { id: "C3-01", discos: 3, tipo: "C", inicial: configuracao(1, 0, 2), alvo: torre(3, 2), fase: 4, categoria: "RP" },
  { id: "C4-06", discos: 4, tipo: "C", inicial: configuracao(1, 0, 2, 1), alvo: torre(4, 0), fase: 4, categoria: "F" },
  { id: "D3-01", discos: 3, tipo: "D", inicial: torre(3, 2), alvo: configuracao(0, 1, 2), fase: 4, categoria: "RP" },
  { id: "D4-04", discos: 4, tipo: "D", inicial: configuracao(1, 2, 0, 1), alvo: configuracao(2, 0, 1, 2), fase: 4, categoria: "M" },
  { id: "E4-01", discos: 4, tipo: "E", inicial: configuracao(0, 2, 1, 0), alvo: torre(4, 2), fase: 4, categoria: "F" },
  { id: "E4-02", discos: 4, tipo: "E", inicial: torre(4, 1), alvo: configuracao(2, 0, 2, 1), fase: 4, categoria: "F" },

  // Fase 5 — nove problemas mistos com 5 discos.
  { id: "A5-01", discos: 5, tipo: "A", inicial: torre(5, 0), alvo: torre(5, 2), fase: 5, categoria: "P" },
  { id: "B5-01", discos: 5, tipo: "B", inicial: torre(5, 0), alvo: torre(5, 1), fase: 5, categoria: "P" },
  { id: "B5-02", discos: 5, tipo: "B", inicial: torre(5, 1), alvo: torre(5, 2), fase: 5, categoria: "F" },
  { id: "C5-01", discos: 5, tipo: "C", inicial: configuracao(0, 1, 0, 2, 1), alvo: torre(5, 2), fase: 5, categoria: "RP" },
  { id: "C5-02", discos: 5, tipo: "C", inicial: configuracao(2, 0, 1, 2, 0), alvo: torre(5, 1), fase: 5, categoria: "M" },
  { id: "C5-03", discos: 5, tipo: "C", inicial: configuracao(1, 2, 0, 1, 2), alvo: torre(5, 0), fase: 5, categoria: "M" },
  { id: "D5-01", discos: 5, tipo: "D", inicial: torre(5, 2), alvo: configuracao(0, 1, 2, 0, 1), fase: 5, categoria: "RP" },
  { id: "D5-02", discos: 5, tipo: "D", inicial: configuracao(0, 2, 1, 0, 2), alvo: configuracao(2, 1, 0, 2, 1), fase: 5, categoria: "M" },
  { id: "E5-01", discos: 5, tipo: "E", inicial: configuracao(1, 0, 2, 1, 0), alvo: torre(5, 2), fase: 5, categoria: "F" },

  // Fase 6 — mistura de 5 e 6 discos, privilegiando estrutura em vez de torres de 63 passos.
  { id: "C5-04", discos: 5, tipo: "C", inicial: configuracao(2, 1, 0, 2, 0), alvo: torre(5, 1), fase: 6, categoria: "M" },
  { id: "D5-03", discos: 5, tipo: "D", inicial: configuracao(1, 0, 2, 1, 0), alvo: configuracao(2, 1, 0, 2, 1), fase: 6, categoria: "M" },
  { id: "E5-02", discos: 5, tipo: "E", inicial: torre(5, 2), alvo: configuracao(1, 0, 2, 1, 0), fase: 6, categoria: "F" },
  { id: "C6-01", discos: 6, tipo: "C", inicial: configuracao(0, 1, 0, 2, 1, 0), alvo: torre(6, 2), fase: 6, categoria: "RP" },
  { id: "C6-02", discos: 6, tipo: "C", inicial: configuracao(2, 1, 2, 0, 1, 0), alvo: torre(6, 0), fase: 6, categoria: "M" },
  { id: "D6-01", discos: 6, tipo: "D", inicial: torre(6, 0), alvo: configuracao(2, 1, 0, 2, 1, 0), fase: 6, categoria: "RP" },
  { id: "D6-02", discos: 6, tipo: "D", inicial: configuracao(0, 2, 1, 0, 2, 1), alvo: configuracao(1, 0, 2, 1, 0, 2), fase: 6, categoria: "M" },
  { id: "E6-01", discos: 6, tipo: "E", inicial: configuracao(1, 0, 2, 1, 0, 2), alvo: torre(6, 1), fase: 6, categoria: "F" },
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
