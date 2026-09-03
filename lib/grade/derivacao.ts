import {
  buscarComContexto,
  criarContexto,
  dominiosIniciais,
  propagarDominios,
  totalPossibilidades,
} from "./motor";
import { validarPuzzle } from "./solver";
import {
  chaveCelula,
  type Pista,
  type Puzzle,
  type TracoDerivacao,
} from "./tipos";

function combinacoes<T>(itens: readonly T[], tamanho: number): T[][] {
  const resultado: T[][] = [];
  const atual: T[] = [];

  const visitar = (inicio: number): void => {
    if (atual.length === tamanho) {
      resultado.push([...atual]);
      return;
    }
    const faltam = tamanho - atual.length;
    for (let indice = inicio; indice <= itens.length - faltam; indice += 1) {
      atual.push(itens[indice]);
      visitar(indice + 1);
      atual.pop();
    }
  };

  visitar(0);
  return resultado;
}

function dominiosPropagados(puzzle: Puzzle, pistas: readonly Pista[]): number[] | null {
  const contexto = criarContexto(puzzle, pistas);
  const dominios = dominiosIniciais(contexto);
  return propagarDominios(dominios, contexto).consistente ? dominios : null;
}

function posicaoDaSolucao(puzzle: Puzzle, categoriaId: string, valor: string): number {
  return puzzle.solucao[categoriaId].indexOf(valor);
}

function estaForcada(dominios: readonly number[] | null, variavel: number, posicao: number): boolean {
  return dominios !== null && dominios[variavel] === 1 << posicao;
}

function justificacaoIrredutivel(
  puzzle: Puzzle,
  variavel: number,
  posicao: number
): Pista[] {
  let candidatas = [...puzzle.pistas];
  if (!estaForcada(dominiosPropagados(puzzle, candidatas), variavel, posicao)) return candidatas;

  for (const pista of puzzle.pistas) {
    const semPista = candidatas.filter((candidata) => candidata.id !== pista.id);
    if (estaForcada(dominiosPropagados(puzzle, semPista), variavel, posicao)) {
      candidatas = semPista;
    }
  }
  return candidatas;
}

/**
 * Calcula dados de autoria. Profundidades 1–3 são o menor número de pistas
 * cujo fecho de propagação força a célula; conclusões restantes ficam na
 * faixa 4+, com uma justificação irredutível quando a propagação completa as
 * alcança e com todas as pistas quando exigem análise por casos.
 */
export function derivar(puzzle: Puzzle): TracoDerivacao {
  const erro = validarPuzzle(puzzle);
  if (erro !== null) throw new Error(`Não é possível derivar o puzzle ${puzzle.id}: ${erro}`);

  const contextoCompleto = criarContexto(puzzle);
  const porVariavel = new Map<number, { profundidade: number; pistas: string[] }>();

  for (let profundidade = 1; profundidade <= Math.min(3, puzzle.pistas.length); profundidade += 1) {
    for (const grupo of combinacoes(puzzle.pistas, profundidade)) {
      const dominios = dominiosPropagados(puzzle, grupo);
      if (dominios === null) continue;
      for (let variavel = 0; variavel < contextoCompleto.variaveis.length; variavel += 1) {
        if (porVariavel.has(variavel)) continue;
        const item = contextoCompleto.variaveis[variavel];
        const posicao = posicaoDaSolucao(puzzle, item.categoriaId, item.valor);
        if (estaForcada(dominios, variavel, posicao)) {
          porVariavel.set(variavel, {
            profundidade,
            pistas: grupo.map((pista) => pista.id),
          });
        }
      }
    }
  }

  const dominiosCompletos = dominiosPropagados(puzzle, puzzle.pistas);
  for (let variavel = 0; variavel < contextoCompleto.variaveis.length; variavel += 1) {
    if (porVariavel.has(variavel)) continue;
    const item = contextoCompleto.variaveis[variavel];
    const posicao = posicaoDaSolucao(puzzle, item.categoriaId, item.valor);
    const justificacao = estaForcada(dominiosCompletos, variavel, posicao)
      ? justificacaoIrredutivel(puzzle, variavel, posicao)
      : [...puzzle.pistas];
    porVariavel.set(variavel, {
      profundidade: Math.max(4, justificacao.length),
      pistas: justificacao.map((pista) => pista.id),
    });
  }

  const porCelula: TracoDerivacao["porCelula"] = {};
  const distribuicaoProfundidade: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4+": 0,
  };
  let profundidadeMaxima = 0;

  porVariavel.forEach((traco, variavel) => {
    const item = contextoCompleto.variaveis[variavel];
    const posicao = posicaoDaSolucao(puzzle, item.categoriaId, item.valor);
    porCelula[chaveCelula(item.categoriaId, item.valor, posicao + 1)] = traco;
    const faixa = traco.profundidade >= 4 ? "4+" : String(traco.profundidade);
    distribuicaoProfundidade[faixa] += 1;
    profundidadeMaxima = Math.max(profundidadeMaxima, traco.profundidade);
  });

  const poderRestritivo: Record<string, number> = {};
  const totalInicial = contextoCompleto.variaveis.length * puzzle.posicoes;
  for (const pista of puzzle.pistas) {
    // Mede células-candidatas eliminadas pelo fecho da pista isolada. Isso
    // preserva a medição no mesmo espaço compacto usado pelo solver.
    const dominios = dominiosPropagados(puzzle, [pista]);
    poderRestritivo[pista.id] = dominios === null
      ? totalInicial
      : totalInicial - totalPossibilidades(dominios);
  }

  const classificacao: TracoDerivacao["classificacao"] = {};
  for (const pista of puzzle.pistas) {
    const restantes = puzzle.pistas.filter((candidata) => candidata.id !== pista.id);
    const contextoSemPista = criarContexto(puzzle, restantes);
    const quantidade = buscarComContexto(contextoSemPista, 2).solucoes.length;
    if (quantidade !== 1) {
      // Definição normativa da spec: sem a pista, a unicidade deixa de existir.
      classificacao[pista.id] = "essencial";
      continue;
    }

    // A spec não separa operacionalmente "útil" de "redundante". Aqui, uma
    // pista não essencial é útil quando ainda fortalece o fecho de propagação;
    // se o fecho fica idêntico sem ela, é redundante.
    const semPista = dominiosPropagados(puzzle, restantes);
    const mesmoFecho = semPista !== null
      && dominiosCompletos !== null
      && semPista.length === dominiosCompletos.length
      && semPista.every((dominio, indice) => dominio === dominiosCompletos[indice]);
    classificacao[pista.id] = mesmoFecho ? "redundante" : "util";
  }

  // Garante por construção que todas as células verdadeiras, e apenas elas,
  // estão no traço. A soma também protege contra alterações no modelo interno.
  const celulasEsperadas = puzzle.categorias.length * puzzle.posicoes;
  if (Object.keys(porCelula).length !== celulasEsperadas) {
    throw new Error(`Traço incompleto para ${puzzle.id}: ${Object.keys(porCelula).length}/${celulasEsperadas} células.`);
  }
  return {
    porCelula,
    poderRestritivo,
    classificacao,
    profundidadeMaxima,
    distribuicaoProfundidade,
  };
}
