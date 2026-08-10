// ─────────────────────────────────────────────────────────────────────────────
// Roster do Focus Agentes (REFORMULAÇÃO — percepção/busca visual, sem emoções).
// As tags de cada personagem são derivadas do NOME do arquivo em
// /public/exercises/agentes-personagens/<cor>_<variação>.png (spec §15).
// Emoções (alegria/raiva/tristeza) NÃO entram nesta atividade (spec §1).
// ─────────────────────────────────────────────────────────────────────────────

export type Cor = "amarelo" | "azul" | "laranja" | "roxo" | "verde" | "vermelho";
export type Acessorio = "bone" | "fone" | "oculos" | "oculos_escuro" | "chapeu" | "gorro" | "coroa" | "luva";
export type Objeto = "balao" | "guarda_chuva" | "pipa" | "skate" | "bola_basquete" | "bola_futebol";
export type Lado = "direito" | "esquerdo";

export interface FocusChar {
  id: string;              // ex: "amarelo_basquete_dir"
  file: string;            // caminho da imagem
  cor: Cor;
  acessorios: Acessorio[]; // pode ter 0, 1 ou 2
  objeto: Objeto | null;
  bermuda: boolean;        // skate acompanhado de bermuda
  ladoObjeto: Lado | null; // só para objetos com lado (bola)
}

export const CORES: Cor[] = ["amarelo", "azul", "laranja", "roxo", "verde", "vermelho"];

type Attrs = Omit<FocusChar, "id" | "file" | "cor">;
const A = (acessorios: Acessorio[] = [], objeto: Objeto | null = null,
           bermuda = false, ladoObjeto: Lado | null = null): Attrs =>
  ({ acessorios, objeto, bermuda, ladoObjeto });

// sufixo do arquivo → atributos. As chaves batem EXATAMENTE com os nomes reais.
export const VARIACOES: Record<string, Attrs> = {
  base:           A(),
  bone:           A(["bone"]),
  fone:           A(["fone"]),
  oculos:         A(["oculos"]),
  oculos_escuro:  A(["oculos_escuro"]),
  chapeu:         A(["chapeu"]),
  gorro:          A(["gorro"]),
  coroa:          A(["coroa"]),
  luva:           A(["luva"]),
  fone_bone:      A(["fone", "bone"]),
  oculos_bone:    A(["oculos", "bone"]),
  oculos_fone:    A(["oculos", "fone"]),
  balao:          A([], "balao"),
  guarda_chuva:   A([], "guarda_chuva"),
  pipa:           A([], "pipa"),
  skate:          A([], "skate"),
  skate_bermuda:  A([], "skate", true),
  basquete_dir:   A([], "bola_basquete", false, "direito"),
  basquete_esq:   A([], "bola_basquete", false, "esquerdo"),
  futebol_dir:    A([], "bola_futebol", false, "direito"),
  futebol_esq:    A([], "bola_futebol", false, "esquerdo"),
  // alegria / raiva / tristeza → EXCLUÍDOS de propósito (spec §1)
};

const BASE_PATH = "/exercises/agentes-personagens";

/** Todos os personagens jogáveis (cores × variações, sem emoções). */
export const FOCUS_CHARS: FocusChar[] = CORES.flatMap((cor) =>
  Object.entries(VARIACOES).map(([suf, attrs]) => ({
    id: `${cor}_${suf}`,
    file: `${BASE_PATH}/${cor}_${suf}.png`,
    cor,
    ...attrs,
  })),
);

export const charById = (id: string): FocusChar | undefined =>
  FOCUS_CHARS.find((c) => c.id === id);

// ── Rótulos pt-BR (para os comandos e amostras) ──────────────────────────────
export const COR_LABEL: Record<Cor, string> = {
  amarelo: "amarelo", azul: "azul", laranja: "laranja",
  roxo: "roxo", verde: "verde", vermelho: "vermelho",
};
export const COR_HEX: Record<Cor, string> = {
  amarelo: "#facc15", azul: "#2563eb", laranja: "#ea580c",
  roxo: "#9333ea", verde: "#16a34a", vermelho: "#dc2626",
};
export const ACC_LABEL: Record<Acessorio, string> = {
  bone: "boné", fone: "fone de ouvido", oculos: "óculos",
  oculos_escuro: "óculos escuro", chapeu: "chapéu", gorro: "gorro",
  coroa: "coroa", luva: "luva",
};
export const OBJ_LABEL: Record<Objeto, string> = {
  balao: "balão", guarda_chuva: "guarda-chuva", pipa: "pipa",
  skate: "skate", bola_basquete: "bola de basquete", bola_futebol: "bola de futebol",
};
// Decisão dela em 10/ago/2026: encurtar para "à direita" / "à esquerda". O comando com
// lateralidade ficava longo demais na tela ("Toque no roxo com a bola de basquete no lado
// direito da imagem").
//
// RISCO ASSUMIDO, não descuido: sem "da imagem" o texto não distingue mais a direita DA FIGURA
// da direita de QUEM OLHA. Ela foi avisada e optou pelo texto curto. Não reintroduzir "da
// imagem" sem falar com ela — e, se a etapa de lateralidade apresentar resultado estranho,
// esta é a primeira hipótese a investigar.
export const LADO_LABEL: Record<Lado, string> = {
  direito: "à direita", esquerdo: "à esquerda",
};
