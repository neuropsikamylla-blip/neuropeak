// ─────────────────────────────────────────────────────────────────────────────
// Gerador de comandos do Focus Agentes. Cada rodada é validada antes de sair:
// os critérios têm alvos únicos e nenhum distrator pode satisfazê-los.
// ─────────────────────────────────────────────────────────────────────────────

import {
  FOCUS_CHARS, charById, type FocusChar, type Cor, type Acessorio, type Objeto, type Lado,
  COR_LABEL, ACC_LABEL, OBJ_LABEL, LADO_LABEL, CORES,
} from "./roster";

export interface Criterio {
  cor?: Cor;
  corNao?: Cor;
  acessorios?: Acessorio[];
  semAcessorios?: Acessorio[];
  semAcessorio?: boolean;
  objeto?: Objeto;
  lado?: Lado;
}

export type Etapa =
  | "cor"
  | "acessorio"
  | "corAcessorio"
  | "doisAlvos"
  | "mudancaRegra"
  | "inibicao";

export type FuncaoCognitiva = "seletiva" | "memoriaTrabalho" | "flexibilidade" | "inibicao";

export const FUNCAO_DA_ETAPA: Record<Etapa, FuncaoCognitiva> = {
  cor: "seletiva",
  acessorio: "seletiva",
  corAcessorio: "seletiva",
  doisAlvos: "memoriaTrabalho",
  mudancaRegra: "flexibilidade",
  inibicao: "inibicao",
};

export interface FocusRound {
  etapa: Etapa;
  criterio: Criterio;
  criterios?: Criterio[];
  criterioAbandonado?: Criterio;
  texto: string;
  negativo: boolean;
  amostraCor: Cor | null;
  acessorioIcone: Acessorio | null;
  objetoIcone: Objeto | null;
  alvoId: string;
  alvoIds: string[];
  personagensIds: string[];
  distratoresSemelhantes: boolean;
}

const ART_OBJ: Record<Objeto, string> = {
  balao: "um", guarda_chuva: "um", pipa: "uma", skate: "um",
  bola_basquete: "uma", bola_futebol: "uma",
};

const rnd = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: readonly T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Um personagem satisfaz COMPLETAMENTE o critério? */
export function matches(c: FocusChar, k: Criterio): boolean {
  if (k.cor && c.cor !== k.cor) return false;
  if (k.corNao && c.cor === k.corNao) return false;
  if (k.acessorios && !k.acessorios.every((a) => c.acessorios.includes(a))) return false;
  if (k.semAcessorios && k.semAcessorios.some((a) => c.acessorios.includes(a))) return false;
  if (k.semAcessorio && c.acessorios.length > 0) return false;
  if (k.objeto && c.objeto !== k.objeto) return false;
  if (k.lado && c.ladoObjeto !== k.lado) return false;
  return true;
}

const N = "**NÃO**";

function textoDe(k: Criterio, etapa: Etapa): string {
  if (etapa === "inibicao") {
    if (k.semAcessorio && k.cor) return `Toque no personagem ${COR_LABEL[k.cor]} que ${N} usa acessórios`;
    if (k.semAcessorios?.length && k.cor) {
      return `Toque no ${COR_LABEL[k.cor]} que ${N} está de ${ACC_LABEL[k.semAcessorios[0]]}`;
    }
    if (k.corNao && k.acessorios?.length) {
      return `Toque no personagem de ${ACC_LABEL[k.acessorios[0]]} que ${N} é ${COR_LABEL[k.corNao]}`;
    }
  }
  if (k.objeto && k.lado) {
    const cor = k.cor ? `${COR_LABEL[k.cor]} ` : "";
    return `Toque no ${cor}com a ${OBJ_LABEL[k.objeto]} no ${LADO_LABEL[k.lado]}`;
  }

  const complemento: string[] = [];
  if (k.acessorios?.length) complemento.push(k.acessorios.map((a) => ACC_LABEL[a]).join(" e "));
  if (k.objeto) complemento.push(OBJ_LABEL[k.objeto]);
  if (!k.cor && k.acessorios?.length) {
    return `Toque em quem usa ${k.acessorios.map((a) => ACC_LABEL[a]).join(" e ")}`;
  }
  if (!k.cor && k.objeto) {
    return `Toque em quem está com ${ART_OBJ[k.objeto]} ${OBJ_LABEL[k.objeto]}`;
  }
  if (complemento.length) return `Toque no ${COR_LABEL[k.cor!]} com ${complemento.join(" e ")}`;
  return `Toque no personagem ${COR_LABEL[k.cor!]}`;
}

function fragmentoCurto(k: Criterio): string {
  if (k.cor && k.acessorios?.length) return `${COR_LABEL[k.cor]} de ${ACC_LABEL[k.acessorios[0]]}`;
  if (k.cor && k.objeto) return `${COR_LABEL[k.cor]} com ${OBJ_LABEL[k.objeto]}`;
  if (k.cor) return COR_LABEL[k.cor];
  if (k.acessorios?.length) return `de ${ACC_LABEL[k.acessorios[0]]}`;
  return "agente indicado";
}

function textoMudanca(abandonado: Criterio, valido: Criterio): string {
  return `Ache o agente ${fragmentoCurto(abandonado)}… ${N.toLocaleLowerCase("pt-BR")}, o ${fragmentoCurto(valido)}`;
}

/** Descrição curta de UM atributo do critério — para feedback de erro. */
export function atributoFaltante(k: Criterio, escolhido: FocusChar | null): string {
  if (!escolhido) return "Observe a cor e o acessório indicados.";
  if (k.cor && escolhido.cor !== k.cor) return `O alvo era ${COR_LABEL[k.cor]}, não ${COR_LABEL[escolhido.cor]}.`;
  if (k.acessorios) {
    const falta = k.acessorios.find((a) => !escolhido.acessorios.includes(a));
    if (falta) return `A cor estava certa, mas faltava ${ACC_LABEL[falta]}.`;
  }
  if (k.objeto && escolhido.objeto !== k.objeto) return `O alvo estava com ${OBJ_LABEL[k.objeto]}.`;
  if (k.lado && escolhido.ladoObjeto !== k.lado) return `O alvo estava com a bola no ${LADO_LABEL[k.lado]}.`;
  if (k.semAcessorio && escolhido.acessorios.length) return "O alvo não usava nenhum acessório.";
  if (k.semAcessorios && k.semAcessorios.some((a) => escolhido.acessorios.includes(a))) {
    return `Esse tinha ${ACC_LABEL[k.semAcessorios[0]]} — o alvo não podia ter.`;
  }
  return "Observe também o acessório.";
}

const ACESS: Acessorio[] = ["bone", "fone", "oculos", "coroa", "chapeu", "gorro"];
const OBJS: Objeto[] = ["balao", "guarda_chuva", "pipa", "skate", "bola_basquete", "bola_futebol"];

function criterioCorAcessorio(): Criterio {
  const cor = rnd(CORES);
  const tipo = rnd(["acessorio", "objeto", "lateralidade"] as const);
  if (tipo === "acessorio") return { cor, acessorios: [rnd(ACESS)] };
  if (tipo === "lateralidade") {
    return {
      cor,
      objeto: rnd(["bola_basquete", "bola_futebol"] as Objeto[]),
      lado: rnd(["direito", "esquerdo"] as Lado[]),
    };
  }
  return { cor, objeto: rnd(OBJS) };
}

function criterioDaEtapa(etapa: Exclude<Etapa, "doisAlvos" | "mudancaRegra">): Criterio {
  if (etapa === "cor") return { cor: rnd(CORES) };
  if (etapa === "acessorio") return { acessorios: [rnd(ACESS)] };
  if (etapa === "corAcessorio") return criterioCorAcessorio();

  const cor = rnd(CORES);
  const modo = rnd(["semTudo", "semUm", "corNao"] as const);
  if (modo === "semTudo") return { cor, semAcessorio: true };
  if (modo === "semUm") return { cor, semAcessorios: [rnd(["bone", "fone"] as Acessorio[])] };
  return { acessorios: [rnd(["oculos", "fone"] as Acessorio[])], corNao: rnd(CORES) };
}

function compartilhaParte(c: FocusChar, k: Criterio): boolean {
  return !!(
    (k.cor && c.cor === k.cor) ||
    (k.acessorios?.some((a) => c.acessorios.includes(a))) ||
    (k.objeto && c.objeto === k.objeto) ||
    (k.lado && c.ladoObjeto === k.lado)
  );
}

function removeAmbiguidadeVisual(pool: FocusChar[], criterios: Criterio[]): FocusChar[] {
  let resultado = pool;
  for (const k of criterios) {
    if (k.acessorios?.includes("oculos")) {
      resultado = resultado.filter((c) => !c.acessorios.includes("oculos_escuro"));
    }
    if (k.acessorios?.includes("oculos_escuro")) {
      resultado = resultado.filter((c) => !c.acessorios.includes("oculos"));
    }
  }
  return resultado;
}

interface Cena {
  alvos: FocusChar[];
  ids: string[];
}

/** Monta uma cena com um alvo por critério válido e, opcionalmente, armadilhas obrigatórias. */
function montaCena(
  criterios: Criterio[],
  nPersonagens: number,
  distratoresSemelhantes: boolean,
  criteriosArmadilha: Criterio[] = [],
): Cena | null {
  const todosCriterios = [...criterios, ...criteriosArmadilha];
  const escolherExclusivo = (k: Criterio, outros: Criterio[]) => {
    const candidatos = FOCUS_CHARS.filter((c) =>
      matches(c, k) && !outros.some((outro) => matches(c, outro)),
    );
    return candidatos.length ? rnd(candidatos) : null;
  };

  const alvos = criterios.map((k, i) =>
    escolherExclusivo(k, todosCriterios.filter((_, j) => j !== i)),
  );
  if (alvos.some((c) => !c)) return null;

  const armadilhas = criteriosArmadilha.map((k, i) =>
    escolherExclusivo(k, [...criterios, ...criteriosArmadilha.filter((_, j) => j !== i)]),
  );
  if (armadilhas.some((c) => !c)) return null;

  const fixos = [...alvos, ...armadilhas] as FocusChar[];
  if (new Set(fixos.map((c) => c.id)).size !== fixos.length || fixos.length > nPersonagens) return null;

  let pool = FOCUS_CHARS.filter((c) =>
    !fixos.some((fixo) => fixo.id === c.id) &&
    !todosCriterios.some((k) => matches(c, k)),
  );
  pool = removeAmbiguidadeVisual(pool, todosCriterios);

  const distratores: FocusChar[] = [];
  if (distratoresSemelhantes) {
    const semelhantes = pool.filter((c) => criterios.some((k) => compartilhaParte(c, k)));
    // Na mudança de regra, a própria armadilha abandonada é o distrator semelhante:
    // mantém o mesmo atributo e troca somente seu valor.
    if (!semelhantes.length && !criteriosArmadilha.length) return null;
    if (semelhantes.length) distratores.push(rnd(semelhantes));
  }
  for (const c of shuffle(pool.filter((c) => !distratores.includes(c)))) {
    if (fixos.length + distratores.length >= nPersonagens) break;
    distratores.push(c);
  }
  if (fixos.length + distratores.length < nPersonagens) return null;

  const ids = shuffle([...fixos, ...distratores].map((c) => c.id));
  const personagens = ids.map(charById).filter((c): c is FocusChar => !!c);
  if (criterios.some((k) => personagens.filter((c) => matches(c, k)).length !== 1)) return null;
  if (criteriosArmadilha.some((k) => personagens.filter((c) => matches(c, k)).length !== 1)) return null;
  return { alvos: alvos as FocusChar[], ids };
}

function criaRound(
  etapa: Etapa,
  criterios: Criterio[],
  cena: Cena,
  texto: string,
  distratoresSemelhantes: boolean,
  criterioAbandonado?: Criterio,
): FocusRound {
  const criterio = criterios[0];
  const alvoIds = cena.alvos.map((c) => c.id);
  return {
    etapa,
    criterio,
    criterios: criterios.length > 1 ? criterios : undefined,
    criterioAbandonado,
    texto,
    negativo: etapa === "mudancaRegra" || !!(criterio.semAcessorio || criterio.semAcessorios || criterio.corNao),
    amostraCor: criterio.cor ?? null,
    acessorioIcone: criterio.acessorios?.[0] ?? null,
    objetoIcone: criterio.objeto ?? null,
    alvoId: alvoIds[0],
    alvoIds,
    personagensIds: cena.ids,
    distratoresSemelhantes,
  };
}

function criteriosDoisAlvos(): [Criterio, Criterio] {
  return [
    { cor: rnd(CORES), acessorios: [rnd(ACESS)] },
    { cor: rnd(CORES), acessorios: [rnd(ACESS)] },
  ];
}

function criteriosMudanca(): { abandonado: Criterio; valido: Criterio } {
  if (Math.random() < 0.5) {
    const [corAbandonada, corValida] = shuffle(CORES).slice(0, 2);
    return {
      abandonado: { cor: corAbandonada },
      valido: { cor: corValida },
    };
  }
  const [acessorioAbandonado, acessorioValido] = shuffle(ACESS).slice(0, 2);
  return {
    abandonado: { acessorios: [acessorioAbandonado] },
    valido: { acessorios: [acessorioValido] },
  };
}

function gerarAlvoUnico(
  etapa: Exclude<Etapa, "doisAlvos" | "mudancaRegra">,
  nPersonagens: number,
  evitarTexto: string | undefined,
  distratoresSemelhantes: boolean,
): FocusRound | null {
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    const criterio = criterioDaEtapa(etapa);
    const texto = textoDe(criterio, etapa);
    if (evitarTexto && texto === evitarTexto) continue;
    const cena = montaCena([criterio], nPersonagens, distratoresSemelhantes);
    if (cena) return criaRound(etapa, [criterio], cena, texto, distratoresSemelhantes);
  }
  return null;
}

/** Gera uma rodada válida para a etapa e o número de personagens. */
export function gerarRodada(
  etapa: Etapa,
  nPersonagens: number,
  evitarTexto?: string,
  distratoresSemelhantes = false,
): FocusRound {
  if (etapa === "doisAlvos") {
    for (let tentativa = 0; tentativa < 60; tentativa++) {
      const criterios = criteriosDoisAlvos();
      if (JSON.stringify(criterios[0]) === JSON.stringify(criterios[1])) continue;
      const texto = `Toque no ${fragmentoCurto(criterios[0])} e o ${fragmentoCurto(criterios[1])}`;
      if (evitarTexto && texto === evitarTexto) continue;
      const cena = montaCena(criterios, nPersonagens, distratoresSemelhantes);
      if (cena) return criaRound(etapa, criterios, cena, texto, distratoresSemelhantes);
    }

    const criterio = criterioCorAcessorio();
    const cenaSemelhante = montaCena([criterio], nPersonagens, distratoresSemelhantes);
    const cena = cenaSemelhante ?? montaCena([criterio], nPersonagens, false)!;
    return criaRound(
      etapa,
      [criterio],
      cena,
      textoDe(criterio, "corAcessorio"),
      distratoresSemelhantes && !!cenaSemelhante,
    );
  }

  if (etapa === "mudancaRegra") {
    for (let tentativa = 0; tentativa < 60; tentativa++) {
      const { abandonado, valido } = criteriosMudanca();
      const texto = textoMudanca(abandonado, valido);
      if (evitarTexto && texto === evitarTexto) continue;
      const cena = montaCena([valido], nPersonagens, distratoresSemelhantes, [abandonado]);
      if (cena) return criaRound(etapa, [valido], cena, texto, distratoresSemelhantes, abandonado);
    }
    const abandonado: Criterio = { cor: CORES[0] };
    const valido: Criterio = { cor: CORES[1] };
    const cena = montaCena([valido], nPersonagens, distratoresSemelhantes, [abandonado])!;
    return criaRound(
      etapa,
      [valido],
      cena,
      textoMudanca(abandonado, valido),
      distratoresSemelhantes,
      abandonado,
    );
  } else {
    const rodada = gerarAlvoUnico(etapa, nPersonagens, evitarTexto, distratoresSemelhantes);
    if (rodada) return rodada;
    const criterio = criterioDaEtapa(etapa);
    const cenaSemelhante = montaCena([criterio], nPersonagens, distratoresSemelhantes);
    const cena = cenaSemelhante ?? montaCena([criterio], nPersonagens, false)!;
    return criaRound(
      etapa,
      [criterio],
      cena,
      textoDe(criterio, etapa),
      distratoresSemelhantes && !!cenaSemelhante,
    );
  }
}
