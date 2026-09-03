import {
  TIPOS_PISTA,
  type Item,
  type MarcacaoParcial,
  type Pista,
  type Puzzle,
  type Solucao,
  type TipoPista,
} from "./tipos";

interface OperadorPista {
  quantidadeOperandos: number;
  itens: (pista: Pista) => readonly Item[];
  satisfaz: (posicoes: readonly number[], pista: Pista) => boolean;
}

function itensAB(pista: Pista): readonly Item[] {
  return "itemA" in pista && "itemB" in pista ? [pista.itemA, pista.itemB] : [];
}

function itensABCD(pista: Pista): readonly Item[] {
  return "itemA" in pista && "itemB" in pista && "itemC" in pista && "itemD" in pista
    ? [pista.itemA, pista.itemB, pista.itemC, pista.itemD]
    : [];
}

/**
 * Registro declarativo dos operadores. O motor de propagação conhece apenas
 * domínios e predicados; um operador futuro entra neste registro sem alterar
 * a busca, a exclusividade ou o MRV.
 */
const OPERADORES: Record<TipoPista, OperadorPista> = {
  T1: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a === b },
  T2: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a !== b },
  T3: {
    quantidadeOperandos: 1,
    itens: (pista) => (pista.tipo === "T3" ? [pista.item] : []),
    satisfaz: ([posicao], pista) => pista.tipo === "T3" && posicao === pista.posicao - 1,
  },
  T4: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a < b },
  T5: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => Math.abs(a - b) === 1 },
  T6: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => b - a === 1 },
  T7: {
    quantidadeOperandos: 3,
    itens: (pista) =>
      pista.tipo === "T7" ? [pista.itemA, pista.itemC, pista.itemB] : [],
    satisfaz: ([a, c, b]) => a < c && c < b,
  },
  T8: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a === b },
  T9: {
    quantidadeOperandos: 4,
    itens: itensABCD,
    satisfaz: ([a, b, c, d]) => a !== b || c === d,
  },
  T10: {
    quantidadeOperandos: 4,
    itens: itensABCD,
    satisfaz: ([a, b, c, d]) => (a === b) !== (c === d),
  },
  T11: { quantidadeOperandos: 2, itens: itensAB, satisfaz: ([a, b]) => a < b },
};

export interface VariavelCompilada {
  categoria: number;
  categoriaId: string;
  valor: string;
}

export interface PistaCompilada {
  pista: Pista;
  variaveis: readonly number[];
  operador: OperadorPista;
}

export interface ContextoSolver {
  puzzle: Puzzle;
  posicoes: number;
  mascaraCompleta: number;
  variaveis: readonly VariavelCompilada[];
  variaveisPorCategoria: readonly (readonly number[])[];
  indiceItens: ReadonlyMap<string, ReadonlyMap<string, number>>;
  pistas: readonly PistaCompilada[];
}

export interface ResultadoPropagacao {
  consistente: boolean;
  alterou: boolean;
}

export function contarBits(mascara: number): number {
  let restante = mascara;
  let total = 0;
  while (restante !== 0) {
    restante &= restante - 1;
    total += 1;
  }
  return total;
}

function ehSingleton(mascara: number): boolean {
  return mascara !== 0 && (mascara & (mascara - 1)) === 0;
}

function indiceDoBit(mascara: number): number {
  return 31 - Math.clz32(mascara);
}

function textoNaoVazio(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

function erroItem(puzzle: Puzzle, item: Item, pistaId: string): string | null {
  if (item === null || typeof item !== "object") {
    return `A pista ${pistaId} contém um item inválido.`;
  }
  const categoria = puzzle.categorias.find((c) => c.id === item.categoria);
  if (categoria === undefined) {
    return `A pista ${pistaId} referencia a categoria inexistente "${item.categoria}".`;
  }
  if (!categoria.valores.includes(item.valor)) {
    return `A pista ${pistaId} referencia o valor inexistente "${item.valor}" na categoria "${item.categoria}".`;
  }
  return null;
}

/** Validação somente estrutural, sem executar busca nem conferir unicidade. */
export function validarEstruturaPuzzle(puzzle: Puzzle): string | null {
  if (puzzle === null || typeof puzzle !== "object") return "O puzzle deve ser um objeto.";
  if (!textoNaoVazio(puzzle.id)) return "O puzzle deve ter um id não vazio.";
  if (!textoNaoVazio(puzzle.titulo)) return `O puzzle ${puzzle.id} deve ter um título não vazio.`;
  if (typeof puzzle.contexto !== "string") return `O puzzle ${puzzle.id} deve ter um contexto textual.`;
  if (![1, 2, 3, 4, 5].includes(puzzle.nivel)) {
    return `O puzzle ${puzzle.id} deve ter nível inteiro entre 1 e 5.`;
  }
  // 3 posições existem por causa do TUTORIAL dela (seções 6 e 62 da espec: "3 posições, 3
  // categorias, 3–5 pistas"). Sem isto o próprio tutorial não passaria pelo validador. Os
  // exercícios de treino usam 4 ou 5; o teto de 5 é decisão dela (seção 62).
  if (!Number.isInteger(puzzle.posicoes) || puzzle.posicoes < 3 || puzzle.posicoes > 5) {
    return `O puzzle ${puzzle.id} deve ter de 3 a 5 posições; recebido: ${puzzle.posicoes}.`;
  }
  if (!Array.isArray(puzzle.categorias) || puzzle.categorias.length < 3 || puzzle.categorias.length > 6) {
    return `O puzzle ${puzzle.id} deve ter entre 3 e 6 categorias.`;
  }

  const idsCategorias = new Set<string>();
  for (const categoria of puzzle.categorias) {
    if (!textoNaoVazio(categoria?.id)) return `O puzzle ${puzzle.id} contém categoria sem id válido.`;
    if (idsCategorias.has(categoria.id)) return `A categoria "${categoria.id}" aparece mais de uma vez.`;
    idsCategorias.add(categoria.id);
    if (!textoNaoVazio(categoria.label)) return `A categoria "${categoria.id}" deve ter label não vazio.`;
    if (!Array.isArray(categoria.valores) || categoria.valores.length !== puzzle.posicoes) {
      return `A categoria "${categoria.id}" deve ter exatamente ${puzzle.posicoes} valores.`;
    }
    if (categoria.valores.some((valor) => !textoNaoVazio(valor))) {
      return `A categoria "${categoria.id}" contém valor vazio ou inválido.`;
    }
    if (new Set(categoria.valores).size !== categoria.valores.length) {
      return `A categoria "${categoria.id}" contém valores repetidos.`;
    }
  }

  if (!Array.isArray(puzzle.pistas)) return `As pistas do puzzle ${puzzle.id} devem ser uma lista.`;
  const idsPistas = new Set<string>();
  for (const pista of puzzle.pistas) {
    if (!textoNaoVazio(pista?.id)) return `O puzzle ${puzzle.id} contém pista sem id válido.`;
    if (idsPistas.has(pista.id)) return `A pista "${pista.id}" aparece mais de uma vez.`;
    idsPistas.add(pista.id);
    if (!textoNaoVazio(pista.texto)) return `A pista ${pista.id} deve ter texto não vazio.`;
    if (!TIPOS_PISTA.includes(pista.tipo)) return `A pista ${pista.id} tem tipo desconhecido: ${pista.tipo}.`;

    const operador = OPERADORES[pista.tipo];
    const itens = operador.itens(pista);
    if (itens.length !== operador.quantidadeOperandos) return `A pista ${pista.id} não contém todos os operandos de ${pista.tipo}.`;
    for (const item of itens) {
      const erro = erroItem(puzzle, item, pista.id);
      if (erro !== null) return erro;
    }
    if (pista.tipo === "T3" && (!Number.isInteger(pista.posicao) || pista.posicao < 1 || pista.posicao > puzzle.posicoes)) {
      return `A pista ${pista.id} usa posição inválida: ${pista.posicao}.`;
    }
    if (pista.tipo === "T8" && pista.itemA.categoria === pista.itemB.categoria) {
      return `A pista ${pista.id} do tipo T8 deve cruzar categorias diferentes.`;
    }
  }

  if (puzzle.solucao === null || typeof puzzle.solucao !== "object" || Array.isArray(puzzle.solucao)) {
    return `O puzzle ${puzzle.id} deve conter uma solução por categoria.`;
  }
  const chavesSolucao = Object.keys(puzzle.solucao);
  if (chavesSolucao.length !== puzzle.categorias.length || chavesSolucao.some((id) => !idsCategorias.has(id))) {
    return `A solução do puzzle ${puzzle.id} deve conter exatamente as categorias declaradas.`;
  }
  for (const categoria of puzzle.categorias) {
    const valores = puzzle.solucao[categoria.id];
    if (!Array.isArray(valores) || valores.length !== puzzle.posicoes) {
      return `A solução da categoria "${categoria.id}" deve ter exatamente ${puzzle.posicoes} posições.`;
    }
    if (new Set(valores).size !== puzzle.posicoes || valores.some((valor) => !categoria.valores.includes(valor))) {
      return `A solução da categoria "${categoria.id}" deve ser uma permutação de seus valores.`;
    }
  }
  if (puzzle.metadata === null || typeof puzzle.metadata !== "object" || Array.isArray(puzzle.metadata)) {
    return `O puzzle ${puzzle.id} deve conter metadata.`;
  }
  return null;
}

export function criarContexto(puzzle: Puzzle, pistas: readonly Pista[] = puzzle.pistas): ContextoSolver {
  const variaveis: VariavelCompilada[] = [];
  const variaveisPorCategoria: number[][] = [];
  const indiceItens = new Map<string, Map<string, number>>();

  puzzle.categorias.forEach((categoria, indiceCategoria) => {
    const indices: number[] = [];
    const porValor = new Map<string, number>();
    categoria.valores.forEach((valor) => {
      const indice = variaveis.length;
      variaveis.push({ categoria: indiceCategoria, categoriaId: categoria.id, valor });
      indices.push(indice);
      porValor.set(valor, indice);
    });
    variaveisPorCategoria.push(indices);
    indiceItens.set(categoria.id, porValor);
  });

  const compiladas = pistas.map((pista): PistaCompilada => {
    const operador = OPERADORES[pista.tipo];
    const indices = operador.itens(pista).map((item) => {
      const indice = indiceItens.get(item.categoria)?.get(item.valor);
      if (indice === undefined) throw new Error(`Item inválido ao compilar a pista ${pista.id}.`);
      return indice;
    });
    return { pista, variaveis: indices, operador };
  });

  return {
    puzzle,
    posicoes: puzzle.posicoes,
    mascaraCompleta: (1 << puzzle.posicoes) - 1,
    variaveis,
    variaveisPorCategoria,
    indiceItens,
    pistas: compiladas,
  };
}

export function dominiosIniciais(contexto: ContextoSolver): number[] {
  return Array<number>(contexto.variaveis.length).fill(contexto.mascaraCompleta);
}

function propagarExclusividade(dominios: number[], contexto: ContextoSolver): ResultadoPropagacao {
  let alterou = false;

  for (const indices of contexto.variaveisPorCategoria) {
    for (const indice of indices) {
      const dominio = dominios[indice];
      if (dominio === 0) return { consistente: false, alterou };
      if (!ehSingleton(dominio)) continue;
      for (const outro of indices) {
        if (outro === indice || (dominios[outro] & dominio) === 0) continue;
        dominios[outro] &= ~dominio;
        alterou = true;
        if (dominios[outro] === 0) return { consistente: false, alterou };
      }
    }

    for (let posicao = 0; posicao < contexto.posicoes; posicao += 1) {
      const bit = 1 << posicao;
      const candidatos = indices.filter((indice) => (dominios[indice] & bit) !== 0);
      if (candidatos.length === 0) return { consistente: false, alterou };
      if (candidatos.length === 1 && dominios[candidatos[0]] !== bit) {
        dominios[candidatos[0]] = bit;
        alterou = true;
      }
    }
  }

  return { consistente: true, alterou };
}

function propagarPista(
  dominios: number[],
  contexto: ContextoSolver,
  compilada: PistaCompilada
): ResultadoPropagacao {
  const unicas: number[] = [];
  const paraUnica: number[] = [];
  for (const variavel of compilada.variaveis) {
    let indice = unicas.indexOf(variavel);
    if (indice < 0) {
      indice = unicas.length;
      unicas.push(variavel);
    }
    paraUnica.push(indice);
  }

  const suportes = Array<number>(unicas.length).fill(0);
  const atribuicao = Array<number>(unicas.length).fill(-1);

  const visitar = (profundidade: number): void => {
    if (profundidade === unicas.length) {
      const posicoesOperandos = paraUnica.map((indice) => atribuicao[indice]);
      if (!compilada.operador.satisfaz(posicoesOperandos, compilada.pista)) return;
      atribuicao.forEach((posicao, indice) => {
        suportes[indice] |= 1 << posicao;
      });
      return;
    }

    const variavel = unicas[profundidade];
    const categoria = contexto.variaveis[variavel].categoria;
    let restantes = dominios[variavel];
    while (restantes !== 0) {
      const bit = restantes & -restantes;
      restantes &= restantes - 1;
      const posicao = indiceDoBit(bit);
      let violaExclusividade = false;
      for (let anterior = 0; anterior < profundidade; anterior += 1) {
        const outraVariavel = unicas[anterior];
        if (contexto.variaveis[outraVariavel].categoria === categoria && atribuicao[anterior] === posicao) {
          violaExclusividade = true;
          break;
        }
      }
      if (violaExclusividade) continue;
      atribuicao[profundidade] = posicao;
      visitar(profundidade + 1);
    }
  };

  visitar(0);

  let alterou = false;
  for (let indice = 0; indice < unicas.length; indice += 1) {
    const variavel = unicas[indice];
    const reduzido = dominios[variavel] & suportes[indice];
    if (reduzido !== dominios[variavel]) {
      dominios[variavel] = reduzido;
      alterou = true;
    }
    if (reduzido === 0) return { consistente: false, alterou };
  }
  return { consistente: true, alterou };
}

/** Propaga exclusividade e todas as pistas até o ponto fixo. */
export function propagarDominios(dominios: number[], contexto: ContextoSolver): ResultadoPropagacao {
  let alterouAlguma = false;

  while (true) {
    let alterouRodada = false;
    const exclusividade = propagarExclusividade(dominios, contexto);
    if (!exclusividade.consistente) return { consistente: false, alterou: alterouAlguma || exclusividade.alterou };
    alterouRodada ||= exclusividade.alterou;

    for (const pista of contexto.pistas) {
      const resultado = propagarPista(dominios, contexto, pista);
      if (!resultado.consistente) return { consistente: false, alterou: true };
      alterouRodada ||= resultado.alterou;
    }

    if (!alterouRodada) return { consistente: true, alterou: alterouAlguma };
    alterouAlguma = true;
  }
}

export function aplicarMarcacoes(
  dominios: number[],
  contexto: ContextoSolver,
  parcial: MarcacaoParcial
): string | null {
  if (!Array.isArray(parcial)) return "A marcação parcial deve ser uma lista de células.";

  for (const marcacao of parcial) {
    if (marcacao === null || typeof marcacao !== "object") return "A marcação parcial contém uma célula inválida.";
    const indice = contexto.indiceItens.get(marcacao.categoria)?.get(marcacao.valor);
    if (indice === undefined) {
      return `A marcação referencia o item inexistente "${marcacao.categoria}/${marcacao.valor}".`;
    }
    if (!Number.isInteger(marcacao.posicao) || marcacao.posicao < 1 || marcacao.posicao > contexto.posicoes) {
      return `A marcação usa posição inválida: ${marcacao.posicao}.`;
    }
    if (!["impossivel", "hipotese", "confirmado"].includes(marcacao.estado)) {
      return `A marcação usa estado inválido: ${marcacao.estado}.`;
    }
    if (marcacao.estado === "hipotese") continue;
    const bit = 1 << (marcacao.posicao - 1);
    if (marcacao.estado === "confirmado") dominios[indice] &= bit;
    else dominios[indice] &= ~bit;
  }
  return null;
}

function solucaoDosDominios(dominios: readonly number[], contexto: ContextoSolver): Solucao {
  const solucao: Solucao = Object.fromEntries(
    contexto.puzzle.categorias.map((categoria) => [categoria.id, Array<string>(contexto.posicoes)])
  );
  dominios.forEach((dominio, indice) => {
    const variavel = contexto.variaveis[indice];
    solucao[variavel.categoriaId][indiceDoBit(dominio)] = variavel.valor;
  });
  return solucao;
}

export interface ResultadoBusca {
  erro: string | null;
  solucoes: Solucao[];
}

export function buscarComContexto(
  contexto: ContextoSolver,
  limite: number,
  parcial: MarcacaoParcial = []
): ResultadoBusca {
  const dominios = dominiosIniciais(contexto);
  const erroMarcacoes = aplicarMarcacoes(dominios, contexto, parcial);
  if (erroMarcacoes !== null) return { erro: erroMarcacoes, solucoes: [] };
  const solucoes: Solucao[] = [];

  const buscar = (estado: number[]): void => {
    if (solucoes.length >= limite) return;
    const propagado = propagarDominios(estado, contexto);
    if (!propagado.consistente) return;

    let escolhida = -1;
    let menorDominio = Number.POSITIVE_INFINITY;
    for (let indice = 0; indice < estado.length; indice += 1) {
      const tamanho = contarBits(estado[indice]);
      if (tamanho > 1 && tamanho < menorDominio) {
        escolhida = indice;
        menorDominio = tamanho;
      }
    }

    if (escolhida < 0) {
      solucoes.push(solucaoDosDominios(estado, contexto));
      return;
    }

    let alternativas = estado[escolhida];
    while (alternativas !== 0 && solucoes.length < limite) {
      const bit = alternativas & -alternativas;
      alternativas &= alternativas - 1;
      const ramo = [...estado];
      ramo[escolhida] = bit;
      buscar(ramo);
    }
  };

  buscar(dominios);
  return { erro: null, solucoes };
}

export function totalPossibilidades(dominios: readonly number[]): number {
  return dominios.reduce((total, dominio) => total + contarBits(dominio), 0);
}

export function posicaoDoItem(solucao: Solucao, item: Item): number {
  return solucao[item.categoria]?.indexOf(item.valor) ?? -1;
}

export function pistaSatisfeita(pista: Pista, solucao: Solucao): boolean {
  const operador = OPERADORES[pista.tipo];
  const posicoes = operador.itens(pista).map((item) => posicaoDoItem(solucao, item));
  return posicoes.every((posicao) => posicao >= 0) && operador.satisfaz(posicoes, pista);
}

export function solucoesIguais(a: Solucao, b: Solucao, puzzle: Puzzle): boolean {
  return puzzle.categorias.every((categoria) =>
    a[categoria.id]?.every((valor, posicao) => valor === b[categoria.id]?.[posicao])
  );
}

export function itensDaPista(pista: Pista): readonly Item[] {
  return OPERADORES[pista.tipo].itens(pista);
}
