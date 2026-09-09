import type { Item, Restricao } from "./tipos";

export interface GramaticaCategoria {
  /** Se os valores da categoria representam pessoas. */
  animado: boolean;
  /** Como o valor vira sujeito da frase. */
  sujeito: (valor: string) => string;
  /** Predicado iniciado por verbo, para permitir a negação com "não". */
  predicado: (valor: string) => string;
  /** Sintagma nominal usado nas pistas de ordem. */
  referencia: (valor: string) => string;
}

export interface GramaticaOrdem {
  antesDe: string;
  imediatamenteAntesDe: string;
  vizinhas: string;
  entre: string;
}

export interface GramaticaTema {
  categorias: Readonly<Record<string, GramaticaCategoria>>;
  ordem?: Partial<GramaticaOrdem>;
}

export const ORDEM_PADRAO: GramaticaOrdem = {
  antesDe: "vem antes de",
  imediatamenteAntesDe: "vem imediatamente antes de",
  vizinhas: "ocupam posições vizinhas",
  entre: "está entre",
};

function comInicialMaiuscula(texto: string): string {
  return texto.length === 0 ? texto : texto[0].toLocaleUpperCase("pt-BR") + texto.slice(1);
}

/** Retorna a razão da rejeição ou `null` quando o texto pode ser emitido. */
export function validarTextoPista(texto: string): string | null {
  if (/ {2,}/.test(texto)) return "A pista contém espaço duplo.";
  if (/\s+[.,;:!?]/.test(texto)) return "A pista contém espaço antes de pontuação.";
  if (!texto.endsWith(".")) return "A pista deve terminar em ponto.";
  return null;
}

/** Valida e devolve o texto, para que toda construção passe pelo mesmo portão. */
export function verificarTextoPista(texto: string): string {
  const erro = validarTextoPista(texto);
  if (erro !== null) throw new Error(erro);
  return texto;
}

function categoriaDoItem(item: Item, gramatica: GramaticaTema): GramaticaCategoria {
  const categoria = gramatica.categorias[item.categoria];
  if (categoria === undefined) {
    throw new Error(`Não há gramática para a categoria "${item.categoria}".`);
  }
  return categoria;
}

function sujeito(item: Item, gramatica: GramaticaTema): string {
  return categoriaDoItem(item, gramatica).sujeito(item.valor);
}

function predicado(item: Item, gramatica: GramaticaTema): string {
  return categoriaDoItem(item, gramatica).predicado(item.valor);
}

function referencia(item: Item, gramatica: GramaticaTema): string {
  return categoriaDoItem(item, gramatica).referencia(item.valor);
}

function finalizar(texto: string): string {
  return verificarTextoPista(`${comInicialMaiuscula(texto)}.`);
}

function antesComContracao(inicio: string, fim: string): string {
  if (inicio.endsWith(" de") && fim.startsWith("a ")) {
    return `${inicio.slice(0, -3)} da ${fim.slice(2)}`;
  }
  if (inicio.endsWith(" de") && fim.startsWith("o ")) {
    return `${inicio.slice(0, -3)} do ${fim.slice(2)}`;
  }
  return `${inicio} ${fim}`;
}

/** Monta os tipos contemplados pela gramática geral de autoria. */
export function textoDaRestricao(
  restricao: Restricao,
  gramatica: GramaticaTema,
  rotulosPosicao: readonly string[]
): string {
  const ordem = { ...ORDEM_PADRAO, ...gramatica.ordem };

  switch (restricao.tipo) {
    case "T1":
    case "T8":
      return finalizar(`${sujeito(restricao.itemA, gramatica)} ${predicado(restricao.itemB, gramatica)}`);
    case "T2":
      return finalizar(`${sujeito(restricao.itemA, gramatica)} não ${predicado(restricao.itemB, gramatica)}`);
    case "T3": {
      const rotulo = rotulosPosicao[restricao.posicao - 1];
      if (rotulo === undefined) throw new Error(`Não há rótulo para a posição ${restricao.posicao}.`);
      return finalizar(`${sujeito(restricao.item, gramatica)} está em ${rotulo}`);
    }
    case "T4":
    case "T11":
      return finalizar(antesComContracao(
        `${referencia(restricao.itemA, gramatica)} ${ordem.antesDe}`,
        referencia(restricao.itemB, gramatica)
      ));
    case "T5":
      return finalizar(`${referencia(restricao.itemA, gramatica)} e ${referencia(restricao.itemB, gramatica)} ${ordem.vizinhas}`);
    case "T6":
      return finalizar(antesComContracao(
        `${referencia(restricao.itemA, gramatica)} ${ordem.imediatamenteAntesDe}`,
        referencia(restricao.itemB, gramatica)
      ));
    case "T7":
      return finalizar(`${referencia(restricao.itemC, gramatica)} ${ordem.entre} ${referencia(restricao.itemA, gramatica)} e ${referencia(restricao.itemB, gramatica)}, nessa ordem`);
    case "T9":
    case "T10":
      throw new Error(`A gramática geral não define molde para ${restricao.tipo}.`);
  }
}

/** Agrupa duas exclusões que compartilham o mesmo sujeito. */
export function textoDaPistaComposta(
  primeira: Restricao,
  segunda: Restricao,
  gramatica: GramaticaTema
): string {
  if (
    primeira.tipo !== "T2"
    || segunda.tipo !== "T2"
    || primeira.itemA.categoria !== segunda.itemA.categoria
    || primeira.itemA.valor !== segunda.itemA.valor
  ) {
    throw new Error("Uma pista composta exige duas restrições T2 com o mesmo sujeito.");
  }
  const predA = predicado(primeira.itemB, gramatica);
  const predB = predicado(segunda.itemB, gramatica);
  return finalizar(
    `${sujeito(primeira.itemA, gramatica)} não ${predA} nem ${elidirVerboRepetido(predA, predB, segunda.itemB.valor)}`
  );
}

/** Agrupa duas ou mais exclusões que compartilham o mesmo sujeito. */
export function textoDasExclusoes(
  restricoes: readonly Restricao[],
  gramatica: GramaticaTema
): string {
  if (restricoes.length < 2) {
    throw new Error("Uma fusão exige ao menos duas restrições T2.");
  }
  const [primeira] = restricoes;
  if (
    primeira.tipo !== "T2"
    || restricoes.some((restricao) =>
      restricao.tipo !== "T2"
      || restricao.itemA.categoria !== primeira.itemA.categoria
      || restricao.itemA.valor !== primeira.itemA.valor
    )
  ) {
    throw new Error("Uma fusão exige restrições T2 com o mesmo sujeito.");
  }

  const predicados = restricoes.map((restricao) => {
    if (restricao.tipo !== "T2") throw new Error("Restrição incompatível com a fusão.");
    return predicado(restricao.itemB, gramatica);
  });
  const valores = restricoes.map((restricao) => {
    if (restricao.tipo !== "T2") throw new Error("Restrição incompatível com a fusão.");
    return restricao.itemB.valor;
  });
  const partes = [
    predicados[0],
    ...predicados.slice(1).map((parte, indice) =>
      elidirVerboRepetido(predicados[indice], parte, valores[indice + 1])
    ),
  ];
  const separador = partes.length >= 3 ? ", nem " : " nem ";
  return finalizar(
    `${sujeito(primeira.itemA, gramatica)} não ${partes.join(separador)}`
  );
}

/** Artigos e preposições: elidem-se com o verbo? Não — permanecem na segunda parte. */
const PALAVRAS_FUNCIONAIS = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "por", "pelo", "pela", "para", "ao", "à", "aos", "às", "com",
]);

/**
 * Elide o trecho VERBAL repetido na segunda parte de uma pista composta.
 *
 * "não é Décio nem é Íris" não é português corrente: a segunda ocorrência do verbo cai e sobra
 * "não é Décio nem Íris". Mas só o VERBO cai — o artigo e a preposição ficam:
 *
 *   "preparou o Gelado" + "preparou o Espresso"      -> "não preparou o Gelado nem O Espresso"
 *   "foi mediada por Zeca" + "foi mediada por Iuri"   -> "não foi mediada por Zeca nem POR Iuri"
 *   "é Décio" + "é Íris"                              -> "não é Décio nem Íris"
 *
 * Quando os verbos são DIFERENTES ("não é Alice nem foi à Psicologia"), não há o que elidir.
 *
 * A comparação é por palavras inteiras, do início, para nunca cortar no meio de um termo.
 */
export function elidirVerboRepetido(predicadoA: string, predicadoB: string, valorB?: string): string {
  const palavrasA = predicadoA.split(" ");
  const palavrasB = predicadoB.split(" ");
  // ⚠️ A elisão NUNCA pode entrar no valor. "foi conduzida por Dra. Norma" e "…por Dra. Sônia"
  // compartilham o prefixo "foi conduzida por Dra.", e elidir tudo produzia "nem Sônia" — um
  // nome que não existe na grade, onde o item se chama "Dra. Sônia". O paciente leria um
  // referente inexistente. `valorB` marca onde o valor começa, e a elisão para antes dele.
  const inicioDoValor = valorB === undefined ? palavrasB.length : (() => {
    const indice = palavrasB.findIndex((_, i) => palavrasB.slice(i).join(" ").startsWith(valorB));
    return indice === -1 ? palavrasB.length : indice;
  })();
  let comuns = 0;
  while (
    comuns < palavrasA.length - 1
    && comuns < palavrasB.length - 1
    && comuns < inicioDoValor
    && palavrasA[comuns] === palavrasB[comuns]
  ) {
    comuns += 1;
  }
  if (comuns === 0) return predicadoB;
  // Elide o trecho comum, mas DEVOLVE as palavras funcionais do fim dele. É essa devolução que
  // separa dois casos que parecem iguais e não são:
  //   "preparou o Gelado"  + "…o Espresso"  -> o artigo faz parte do nome -> "o Espresso"
  //   "usou a sala Jade"   + "…a sala Coral" -> "sala" já foi dita        -> "Coral"
  //   "foi mediada por Zeca" + "…por Iuri"   -> a preposição rege o nome  -> "por Iuri"
  //   "é Décio"            + "é Íris"        -> nada funcional            -> "Íris"
  let inicio = comuns;
  while (inicio > 0 && PALAVRAS_FUNCIONAIS.has(palavrasB[inicio - 1].toLocaleLowerCase("pt-BR"))) {
    inicio -= 1;
  }
  return palavrasB.slice(inicio).join(" ");
}
