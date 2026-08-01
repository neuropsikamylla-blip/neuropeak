// ─────────────────────────────────────────────────────────────────────────────
// Gerador de comandos do Focus Agentes (reformulação). Comandos por ETAPA
// (spec §6), sem emoções (§1), com VALIDAÇÃO de alvo único antes de cada
// rodada (§16) e critério estruturado para feedback específico (§10) e
// registros do profissional (§14).
// ─────────────────────────────────────────────────────────────────────────────

import {
  FOCUS_CHARS, charById, type FocusChar, type Cor, type Acessorio, type Objeto, type Lado,
  COR_LABEL, ACC_LABEL, OBJ_LABEL, LADO_LABEL, CORES,
} from "./roster";

// Critério ESTRUTURADO da rodada (também usado p/ métricas e feedback).
export interface Criterio {
  cor?: Cor;
  corNao?: Cor;                 // "que não é verde"
  acessorios?: Acessorio[];     // precisa TER todos
  semAcessorios?: Acessorio[];  // NÃO pode ter nenhum destes (inibição)
  semAcessorio?: boolean;       // não usa NENHUM acessório
  objeto?: Objeto;
  lado?: Lado;
}

export type Etapa = 1 | 2 | 3 | 4 | 5;

export interface FocusRound {
  etapa: Etapa;
  criterio: Criterio;
  texto: string;                // comando exibido (com \n para a barra, se preciso)
  negativo: boolean;            // tem "NÃO"/"Ignore" (destacar visualmente)
  amostraCor: Cor | null;       // cor a mostrar como amostra no topo
  acessorioIcone: Acessorio | null;
  objetoIcone: Objeto | null;
  alvoId: string;
  personagensIds: string[];     // alvo + distratores (ordem embaralhada)
}

// artigo indefinido de cada objeto (para frases naturais)
const ART_OBJ: Record<Objeto, string> = {
  balao: "um", guarda_chuva: "um", pipa: "uma", skate: "um",
  bola_basquete: "uma", bola_futebol: "uma",
};

// ── util ─────────────────────────────────────────────────────────────────────
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

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

// ── texto do comando ─────────────────────────────────────────────────────────
const N = "**NÃO**"; // marcador de negação (o componente destaca)

function textoDe(k: Criterio, etapa: Etapa): string {
  // Etapa 5 — inibição (frases específicas)
  if (etapa === 5) {
    if (k.semAcessorio && k.cor) return `Toque no personagem ${COR_LABEL[k.cor]} que ${N} usa acessórios`;
    if (k.semAcessorios?.length && k.cor)
      return `Toque no ${COR_LABEL[k.cor]} que ${N} está de ${ACC_LABEL[k.semAcessorios[0]]}`;
    if (k.corNao && k.acessorios?.length)
      return `Toque no personagem de ${ACC_LABEL[k.acessorios[0]]} que ${N} é ${COR_LABEL[k.corNao]}`;
    if (k.cor && k.acessorios?.length)  // "Entre os personagens com X, toque no Y"
      return `Entre os personagens com ${ACC_LABEL[k.acessorios[0]]}, toque no ${COR_LABEL[k.cor]}`;
    if (k.cor && k.objeto)
      return `Entre os personagens com ${OBJ_LABEL[k.objeto]}, toque no ${COR_LABEL[k.cor]}`;
  }
  // Etapa 4 — lateralidade
  if (etapa === 4 && k.objeto && k.lado) {
    const cor = k.cor ? `${COR_LABEL[k.cor]} ` : "";
    return `Toque no ${cor}com a ${OBJ_LABEL[k.objeto]} no ${LADO_LABEL[k.lado]}`;
  }
  // Etapas 1–3 — cor e/ou acessório(s)/objeto
  const parts: string[] = [];
  if (k.cor) parts.push(COR_LABEL[k.cor]);
  const compl: string[] = [];
  if (k.acessorios?.length) compl.push(k.acessorios.map((a) => ACC_LABEL[a]).join(" e "));
  if (k.objeto) compl.push(OBJ_LABEL[k.objeto]);
  // Etapa 1 sem cor (só acessório/objeto)
  if (!k.cor && k.acessorios?.length) return `Toque em quem usa ${k.acessorios.map((a) => ACC_LABEL[a]).join(" e ")}`;
  if (!k.cor && k.objeto) {
    return `Toque em quem está com ${ART_OBJ[k.objeto]} ${OBJ_LABEL[k.objeto]}`;
  }
  const alvo = parts.join(" ");
  if (compl.length) return `Toque no ${alvo} com ${compl.join(" e ")}`;
  return `Toque no personagem ${alvo}`;
}

/** Descrição curta de UM atributo do critério — para feedback de erro (§10). */
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
  if (k.semAcessorios && k.semAcessorios.some((a) => escolhido.acessorios.includes(a)))
    return `Esse tinha ${ACC_LABEL[k.semAcessorios[0]]} — o alvo não podia ter.`;
  return "Observe também o acessório.";
}

// ── escolha de critério por etapa ────────────────────────────────────────────
const ACESS: Acessorio[] = ["bone", "fone", "oculos", "coroa"];
const OBJS: Objeto[] = ["balao", "guarda_chuva", "pipa", "skate", "bola_basquete", "bola_futebol"];

function criterioDaEtapa(etapa: Etapa): Criterio {
  switch (etapa) {
    case 1: {
      const t = rnd(["cor", "acc", "obj"] as const);
      if (t === "cor") return { cor: rnd(CORES) };
      if (t === "acc") return { acessorios: [rnd(["bone", "fone", "oculos", "coroa"] as Acessorio[])] };
      return { objeto: rnd(["guarda_chuva", "skate", "bola_basquete", "balao"] as Objeto[]) };
    }
    case 2: {
      const cor = rnd(CORES);
      return Math.random() < 0.6
        ? { cor, acessorios: [rnd(ACESS)] }
        : { cor, objeto: rnd(OBJS) };
    }
    case 3: // distratores semelhantes — mesmo tipo de critério da etapa 2, cena mais difícil
      return criterioDaEtapa(2);
    case 4: { // lateralidade
      const objeto = rnd(["bola_basquete", "bola_futebol"] as Objeto[]);
      const lado = rnd(["direito", "esquerdo"] as Lado[]);
      return Math.random() < 0.6 ? { cor: rnd(CORES), objeto, lado } : { objeto: rnd(["pipa"] as Objeto[]), lado };
    }
    case 5: { // inibição
      const cor = rnd(CORES);
      const modo = rnd(["semTudo", "semUm", "corNao", "entre"] as const);
      if (modo === "semTudo") return { cor, semAcessorio: true };
      if (modo === "semUm") return { cor, semAcessorios: [rnd(["bone", "fone"] as Acessorio[])] };
      if (modo === "corNao") return { acessorios: [rnd(["oculos", "fone"] as Acessorio[])], corNao: rnd(CORES) };
      return { cor, acessorios: [rnd(["bone", "fone"] as Acessorio[])] }; // "entre os com X, toque no Y"
    }
  }
}

// ── monta a cena com VALIDAÇÃO de alvo único (§16) ───────────────────────────
function montaCena(k: Criterio, etapa: Etapa, nPersonagens: number): { alvo: FocusChar; ids: string[] } | null {
  const candidatos = FOCUS_CHARS.filter((c) => matches(c, k));
  if (!candidatos.length) return null;
  const alvo = rnd(candidatos);

  // distratores = NÃO satisfazem o critério (garante alvo único)
  let pool = FOCUS_CHARS.filter((c) => !matches(c, k) && c.id !== alvo.id);

  // Evita AMBIGUIDADE VISUAL entre óculos de grau e óculos escuros (parecidos):
  // se o comando pede um, o outro não entra como distrator (a Kamylla errou por isso).
  if (k.acessorios?.includes("oculos")) pool = pool.filter((c) => !c.acessorios.includes("oculos_escuro"));
  if (k.acessorios?.includes("oculos_escuro")) pool = pool.filter((c) => !c.acessorios.includes("oculos"));

  // §3/§16: nas etapas 3+ garante ao menos 1 distrator SEMELHANTE (compartilha parte)
  const semelhantes = pool.filter((c) =>
    (k.cor && c.cor === k.cor) ||
    (k.acessorios && k.acessorios.some((a) => c.acessorios.includes(a))) ||
    (k.objeto && c.objeto === k.objeto),
  );
  const distratores: FocusChar[] = [];
  if (etapa >= 3 && semelhantes.length) distratores.push(rnd(semelhantes));
  // completa evitando repetir a mesma imagem
  const resto = shuffle(pool.filter((c) => !distratores.includes(c)));
  for (const c of resto) {
    if (distratores.length >= nPersonagens - 1) break;
    distratores.push(c);
  }
  if (distratores.length < nPersonagens - 1) return null; // não deu p/ preencher

  const ids = shuffle([alvo.id, ...distratores.map((c) => c.id)]);
  // validação final: exatamente 1 satisfaz o critério
  const nMatch = ids.map(charById).filter((c): c is FocusChar => !!c).filter((c) => matches(c, k)).length;
  if (nMatch !== 1) return null;
  return { alvo, ids };
}

/** Gera uma rodada válida para a etapa e nº de personagens. Retenta se ambígua.
 *  `evitarTexto` = comando da rodada anterior (não repetir o mesmo em seguida). */
export function gerarRodada(etapa: Etapa, nPersonagens: number, evitarTexto?: string): FocusRound {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const k = criterioDaEtapa(etapa);
    const texto = textoDe(k, etapa);
    if (evitarTexto && texto === evitarTexto) continue; // não repetir o comando anterior
    const cena = montaCena(k, etapa, nPersonagens);
    if (!cena) continue;
    const negativo = !!(k.semAcessorio || k.semAcessorios || k.corNao);
    return {
      etapa, criterio: k,
      texto,
      negativo,
      amostraCor: k.cor ?? null,
      acessorioIcone: k.acessorios?.[0] ?? null,
      objetoIcone: k.objeto ?? null,
      alvoId: cena.alvo.id,
      personagensIds: cena.ids,
    };
  }
  // fallback simples (nunca deve chegar aqui): cor pura
  const cor = rnd(CORES);
  const k: Criterio = { cor };
  const cena = montaCena(k, 1, Math.min(nPersonagens, 6))!;
  return { etapa: 1, criterio: k, texto: textoDe(k, 1), negativo: false,
    amostraCor: cor, acessorioIcone: null, objetoIcone: null,
    alvoId: cena.alvo.id, personagensIds: cena.ids };
}
