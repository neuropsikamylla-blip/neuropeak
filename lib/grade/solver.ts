import {
  aplicarMarcacoes,
  buscarComContexto,
  criarContexto,
  dominiosIniciais,
  itensDaPista,
  pistaSatisfeita,
  solucoesIguais,
  validarEstruturaPuzzle,
} from "./motor";
import type { MarcacaoParcial, Puzzle, Solucao } from "./tipos";

function validarLimite(limite: number): void {
  if (!Number.isInteger(limite) || limite < 1) {
    throw new Error(`O limite deve ser um inteiro positivo; recebido: ${limite}.`);
  }
}

function resolverEstruturado(puzzle: Puzzle, limite: number, parcial: MarcacaoParcial = []): Solucao[] {
  validarLimite(limite);
  const erro = validarEstruturaPuzzle(puzzle);
  if (erro !== null) throw new Error(`Puzzle inválido: ${erro}`);
  const resultado = buscarComContexto(criarContexto(puzzle), limite, parcial);
  if (resultado.erro !== null) throw new Error(`Marcação parcial inválida: ${resultado.erro}`);
  return resultado.solucoes;
}

/**
 * Valida estrutura, satisfatibilidade, unicidade e correspondência do gabarito
 * declarado com a única solução das restrições.
 */
export function validarPuzzle(puzzle: Puzzle): string | null {
  const erroEstrutural = validarEstruturaPuzzle(puzzle);
  if (erroEstrutural !== null) return erroEstrutural;

  const solucoes = buscarComContexto(criarContexto(puzzle), 2).solucoes;
  if (solucoes.length === 0) return `O puzzle ${puzzle.id} não possui solução.`;
  if (solucoes.length > 1) return `O puzzle ${puzzle.id} possui mais de uma solução.`;

  const pistaViolada = puzzle.pistas.find((pista) => !pistaSatisfeita(pista, puzzle.solucao));
  if (pistaViolada !== undefined) {
    return `A solução declarada do puzzle ${puzzle.id} viola a pista ${pistaViolada.id}.`;
  }
  if (!solucoesIguais(solucoes[0], puzzle.solucao, puzzle)) {
    return `A solução declarada do puzzle ${puzzle.id} não corresponde à solução única das pistas.`;
  }
  return null;
}

/** Encontra a primeira solução por padrão; `limite` permite pedir mais sem busca irrestrita. */
export function encontrarSolucoes(puzzle: Puzzle, limite = 1): Solucao[] {
  return resolverEstruturado(puzzle, limite);
}

/** Conta no máximo `limite` soluções e interrompe a busca assim que o alcança. */
export function contarSolucoes(puzzle: Puzzle, limite: number): number {
  return resolverEstruturado(puzzle, limite).length;
}

/** Prova unicidade procurando no máximo duas soluções. */
export function temSolucaoUnica(puzzle: Puzzle): boolean {
  if (validarEstruturaPuzzle(puzzle) !== null) return false;
  return buscarComContexto(criarContexto(puzzle), 2).solucoes.length === 1;
}

export function admiteSolucao(puzzle: Puzzle, parcial: MarcacaoParcial): boolean {
  if (validarEstruturaPuzzle(puzzle) !== null) return false;
  const resultado = buscarComContexto(criarContexto(puzzle), 1, parcial);
  return resultado.erro === null && resultado.solucoes.length > 0;
}

function chaveItem(categoria: string, valor: string): string {
  return JSON.stringify([categoria, valor]);
}

/**
 * Devolve um conjunto seguro de pistas relevantes, não um MUS: parte das
 * células logicamente restritivas e inclui as pistas do componente conectado
 * da contradição. A lista pode conter pistas dispensáveis para demonstrá-la.
 */
export function pistasEmConflito(puzzle: Puzzle, parcial: MarcacaoParcial): string[] {
  if (validarEstruturaPuzzle(puzzle) !== null || !Array.isArray(parcial) || admiteSolucao(puzzle, parcial)) return [];

  const logicas = parcial.filter((marcacao) => marcacao.estado !== "hipotese");
  const semPistas = criarContexto(puzzle, []);
  const dominios = dominiosIniciais(semPistas);
  if (aplicarMarcacoes(dominios, semPistas, logicas) !== null) return [];
  if (buscarComContexto(semPistas, 1, logicas).solucoes.length === 0) {
    // A contradição é explicada apenas pelas marcações e pela exclusividade 1:1.
    return [];
  }

  const itensRelevantes = new Set(logicas.map((m) => chaveItem(m.categoria, m.valor)));
  const categoriasRelevantes = new Set(logicas.map((m) => m.categoria));
  const pistasRelevantes = new Set<string>();
  let mudou = true;

  while (mudou) {
    mudou = false;
    for (const categoria of puzzle.categorias) {
      if (!categoriasRelevantes.has(categoria.id)) continue;
      for (const valor of categoria.valores) {
        const chave = chaveItem(categoria.id, valor);
        if (!itensRelevantes.has(chave)) {
          itensRelevantes.add(chave);
          mudou = true;
        }
      }
    }

    for (const pista of puzzle.pistas) {
      const itens = itensDaPista(pista);
      if (!itens.some((item) => itensRelevantes.has(chaveItem(item.categoria, item.valor)))) continue;
      if (!pistasRelevantes.has(pista.id)) {
        pistasRelevantes.add(pista.id);
        mudou = true;
      }
      for (const item of itens) {
        const chave = chaveItem(item.categoria, item.valor);
        if (!itensRelevantes.has(chave)) {
          itensRelevantes.add(chave);
          mudou = true;
        }
        if (!categoriasRelevantes.has(item.categoria)) {
          categoriasRelevantes.add(item.categoria);
          mudou = true;
        }
      }
    }
  }

  return puzzle.pistas.filter((pista) => pistasRelevantes.has(pista.id)).map((pista) => pista.id);
}
