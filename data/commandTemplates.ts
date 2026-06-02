import type { CommandRuleType, AccessoryKey, ColorName } from "@/types/commands";

// ── Constantes de vocabulário ─────────────────────────────────────────────────

export const ACC_PT: Record<AccessoryKey, string> = {
  fone:            "fone de ouvido",
  oculos:          "óculos de grau",
  "oculos-escuros":"óculos escuros",
  microfone:       "microfone",
  capuz:           "capuz",
  mochila:         "mochila",
  bone:            "boné",
  touca:           "gorro",
  tablet:          "tablet",
  gravata:         "laço no pescoço",
  cesta:           "cesta",
  skate:           "skate",
  raquete:         "raquete de tênis",
  viseira:         "viseira",
};

export const COLOR_PT: Record<ColorName, string> = {
  azul:     "azul",
  verde:    "verde",
  roxo:     "roxo",
  laranja:  "laranja",
  vermelho: "vermelho",
  cinza:    "cinza",
  amarelo:  "amarelo",
  rosa:     "rosa",
};

/** 10 verbos como funções (recebem "o {noun}" e devolvem o prefixo completo).
 *  Tema do jogo: CAPTURAR alvos em movimento na arena. */
export const VERB_PREFIX_FNS: Array<(noun: string) => string> = [
  noun => `Capture o ${noun}`,       // 0 – capture
  noun => `Pegue o ${noun}`,         // 1 – pegue
  noun => `Capture o ${noun}`,       // 2 – capture
  noun => `Pegue o ${noun}`,         // 3 – pegue
  noun => `Capture o ${noun}`,       // 4 – capture
  noun => `Pegue o ${noun}`,         // 5 – pegue
  noun => `Capture o ${noun}`,       // 6 – capture
  noun => `Pegue o ${noun}`,         // 7 – pegue
  noun => `Capture o ${noun}`,       // 8 – capture
  noun => `Pegue o ${noun}`,         // 9 – pegue
];

/** Prefixos de sequência (para L6 e L8) */
export const SEQ_FIRST_FNS: Array<(noun: string) => string> = [
  noun => `Primeiro capture o ${noun}`,
  noun => `Comece capturando o ${noun}`,
  noun => `Primeiro pegue o ${noun}`,
  noun => `Capture primeiro o ${noun}`,
  noun => `Primeiro capture o ${noun}`,
  noun => `Comece pegando o ${noun}`,
  noun => `Primeiro pegue o ${noun}`,
  noun => `Capture primeiro o ${noun}`,
];

export const SEQ_THEN = [
  "depois o", "depois capture o", "em seguida o",
  "em seguida pegue o", "então capture o", "depois pegue o",
];

/** Prefixos duais (para L4 multiTarget) */
export const DUAL_PREFIX_FNS: Array<(noun: string) => string> = [
  noun => `Capture o ${noun}`,
  noun => `Pegue o ${noun}`,
  noun => `Capture o ${noun}`,
  noun => `Pegue o ${noun}`,
  noun => `Capture o ${noun}`,
  noun => `Pegue o ${noun}`,
  noun => `Capture o ${noun}`,
  noun => `Pegue o ${noun}`,
];

// ── Definição dos templates ───────────────────────────────────────────────────

export interface CommandTemplate {
  id: string;
  difficulty: number;  // 1–8
  ruleType: CommandRuleType;
  verbIndex: number;   // índice em VERB_PREFIX_FNS (ou SEQ_FIRST_FNS)
  formatType:
    | "acc-only"             // L1: "Ache o {noun} com {acc}"
    | "color-only"           // L1: "Ache o {noun} {color}"
    | "uniform-acc"          // L2: "Ache o {noun} {uniformColor} com {acc}"
    | "acc-with-acc-color"   // L2: "Ache o {noun} com {acc} {accColor}"
    | "hair-color"           // L2: "Ache o {noun} de cabelo {hairColor}"
    | "hair-color-acc"       // L2: "Ache o {noun} de cabelo {hairColor} com {acc}"
    | "contrast-acc"         // L3: "Ache o {noun} com {acc1}, não o de {acc2}"
    | "contrast-acc-color"   // L3: "Ache o {noun} com {acc} {color1}, não o de {acc} {color2}"
    | "contrast-color"       // L3: "Ache o {noun} {color1}, não o {color2}"
    | "multi-target"         // L4: "Ache o {noun} com {acc1} e o {noun} com {acc2}"
    | "multi-target-color"   // L4: "Ache o {noun} {color1} e o {noun} {color2}"
    | "multi-attr-2"         // L5: "Ache o {noun} com {acc1} e {acc2}"
    | "multi-attr-3"         // L5: "Ache o {noun} com {acc1}, {acc2} e {acc3}"
    | "sequence"             // L6: "Primeiro … depois …"
    | "sequence-color"       // L6: "Primeiro o {color1}, depois o {color2}"
    | "color-no-acc"          // L2: "Ache o {noun} {color} sem {acc}"
    | "negative-acc"         // L7: "Toque em qualquer {noun}, exceto no que usa {acc}"
    | "negative-acc-variant" // L7: alternativas de formulação do negativo
    | "advanced";            // L8: sequência + exclusão
  /** Acessórios ou cores fixos no template (se definidos, o gerador não escolhe aleatoriamente) */
  fixedAcc1?: AccessoryKey;
  fixedAcc2?: AccessoryKey;
  fixedAcc3?: AccessoryKey;
  fixedColor1?: ColorName;
  fixedColor2?: ColorName;
}

// ── 88 templates ─────────────────────────────────────────────────────────────

export const COMMAND_TEMPLATES: CommandTemplate[] = [

  // ── L1 – single (15) ──────────────────────────────────────────────────────
  { id: "L1-01",  difficulty: 1, ruleType: "single", verbIndex: 0, formatType: "acc-only" },
  { id: "L1-02",  difficulty: 1, ruleType: "single", verbIndex: 1, formatType: "acc-only" },
  { id: "L1-03",  difficulty: 1, ruleType: "single", verbIndex: 2, formatType: "acc-only" },
  { id: "L1-04",  difficulty: 1, ruleType: "single", verbIndex: 3, formatType: "acc-only" },
  { id: "L1-05",  difficulty: 1, ruleType: "single", verbIndex: 4, formatType: "acc-only" },
  { id: "L1-06",  difficulty: 1, ruleType: "single", verbIndex: 5, formatType: "acc-only" },
  { id: "L1-07",  difficulty: 1, ruleType: "single", verbIndex: 6, formatType: "acc-only" },
  { id: "L1-08",  difficulty: 1, ruleType: "single", verbIndex: 7, formatType: "acc-only" },
  { id: "L1-09",  difficulty: 1, ruleType: "single", verbIndex: 8, formatType: "acc-only" },
  { id: "L1-10",  difficulty: 1, ruleType: "single", verbIndex: 9, formatType: "acc-only" },
  { id: "L1-11",  difficulty: 1, ruleType: "single", verbIndex: 0, formatType: "color-only" },
  { id: "L1-12",  difficulty: 1, ruleType: "single", verbIndex: 1, formatType: "color-only" },
  { id: "L1-13",  difficulty: 1, ruleType: "single", verbIndex: 2, formatType: "color-only" },
  { id: "L1-14",  difficulty: 1, ruleType: "single", verbIndex: 8, formatType: "color-only" },
  { id: "L1-15",  difficulty: 1, ruleType: "single", verbIndex: 3, formatType: "color-only" },

  // ── L2 – colorAttribute (15) ──────────────────────────────────────────────
  { id: "L2-01",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "uniform-acc" },
  { id: "L2-02",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 1, formatType: "uniform-acc" },
  { id: "L2-03",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 2, formatType: "uniform-acc" },
  { id: "L2-04",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 7, formatType: "uniform-acc" },
  { id: "L2-05",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 8, formatType: "uniform-acc" },
  { id: "L2-06",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 3, formatType: "uniform-acc" },
  { id: "L2-07",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 4, formatType: "uniform-acc" },
  { id: "L2-08",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 5, formatType: "acc-with-acc-color" },
  { id: "L2-09",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "acc-with-acc-color" },
  { id: "L2-10",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 1, formatType: "acc-with-acc-color" },
  { id: "L2-11",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "hair-color" },
  { id: "L2-12",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 1, formatType: "hair-color" },
  { id: "L2-13",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 8, formatType: "hair-color" },
  { id: "L2-14",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "hair-color-acc" },
  { id: "L2-15",  difficulty: 2, ruleType: "colorAttribute", verbIndex: 1, formatType: "hair-color-acc" },

  // ── L2 extra – cor sem acessório (9) ────────────────────────────────────────
  { id: "L2-16", difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "color-no-acc", fixedAcc1: "fone" },
  { id: "L2-17", difficulty: 2, ruleType: "colorAttribute", verbIndex: 1, formatType: "color-no-acc", fixedAcc1: "fone" },
  { id: "L2-18", difficulty: 2, ruleType: "colorAttribute", verbIndex: 7, formatType: "color-no-acc", fixedAcc1: "fone" },
  { id: "L2-19", difficulty: 2, ruleType: "colorAttribute", verbIndex: 0, formatType: "color-no-acc", fixedAcc1: "bone" },
  { id: "L2-20", difficulty: 2, ruleType: "colorAttribute", verbIndex: 3, formatType: "color-no-acc", fixedAcc1: "bone" },
  { id: "L2-21", difficulty: 2, ruleType: "colorAttribute", verbIndex: 8, formatType: "color-no-acc", fixedAcc1: "bone" },
  { id: "L2-22", difficulty: 2, ruleType: "colorAttribute", verbIndex: 2, formatType: "color-no-acc", fixedAcc1: "capuz" },
  { id: "L2-23", difficulty: 2, ruleType: "colorAttribute", verbIndex: 5, formatType: "color-no-acc", fixedAcc1: "capuz" },
  { id: "L2-24", difficulty: 2, ruleType: "colorAttribute", verbIndex: 9, formatType: "color-no-acc", fixedAcc1: "capuz" },

  // ── L3 – contrast (12) ────────────────────────────────────────────────────
  { id: "L3-01",  difficulty: 3, ruleType: "contrast", verbIndex: 0, formatType: "contrast-acc",
    fixedAcc1: "fone", fixedAcc2: "capuz" },
  { id: "L3-02",  difficulty: 3, ruleType: "contrast", verbIndex: 1, formatType: "contrast-acc",
    fixedAcc1: "oculos", fixedAcc2: "oculos-escuros" },
  { id: "L3-03",  difficulty: 3, ruleType: "contrast", verbIndex: 2, formatType: "contrast-acc",
    fixedAcc1: "bone", fixedAcc2: "touca" },
  { id: "L3-04",  difficulty: 3, ruleType: "contrast", verbIndex: 3, formatType: "contrast-acc",
    fixedAcc1: "capuz", fixedAcc2: "mochila" },
  { id: "L3-05",  difficulty: 3, ruleType: "contrast", verbIndex: 4, formatType: "contrast-acc",
    fixedAcc1: "fone", fixedAcc2: "tablet" },
  { id: "L3-06",  difficulty: 3, ruleType: "contrast", verbIndex: 5, formatType: "contrast-acc",
    fixedAcc1: "touca", fixedAcc2: "fone" },
  { id: "L3-07",  difficulty: 3, ruleType: "contrast", verbIndex: 6, formatType: "contrast-acc",
    fixedAcc1: "microfone", fixedAcc2: "mochila" },
  { id: "L3-08",  difficulty: 3, ruleType: "contrast", verbIndex: 7, formatType: "contrast-acc",
    fixedAcc1: "raquete", fixedAcc2: "fone" },
  { id: "L3-09",  difficulty: 3, ruleType: "contrast", verbIndex: 8, formatType: "contrast-color" },
  { id: "L3-10",  difficulty: 3, ruleType: "contrast", verbIndex: 0, formatType: "contrast-color" },
  { id: "L3-11",  difficulty: 3, ruleType: "contrast", verbIndex: 0, formatType: "contrast-acc-color",
    fixedAcc1: "fone" },
  { id: "L3-12",  difficulty: 3, ruleType: "contrast", verbIndex: 1, formatType: "contrast-acc-color",
    fixedAcc1: "capuz" },

  // ── L4 – multiTarget (12) ─────────────────────────────────────────────────
  { id: "L4-01",  difficulty: 4, ruleType: "multiTarget", verbIndex: 0, formatType: "multi-target",
    fixedAcc1: "fone", fixedAcc2: "capuz" },
  { id: "L4-02",  difficulty: 4, ruleType: "multiTarget", verbIndex: 1, formatType: "multi-target",
    fixedAcc1: "raquete", fixedAcc2: "fone" },
  { id: "L4-03",  difficulty: 4, ruleType: "multiTarget", verbIndex: 3, formatType: "multi-target",
    fixedAcc1: "touca", fixedAcc2: "bone" },
  { id: "L4-04",  difficulty: 4, ruleType: "multiTarget", verbIndex: 4, formatType: "multi-target",
    fixedAcc1: "cesta", fixedAcc2: "skate" },
  { id: "L4-05",  difficulty: 4, ruleType: "multiTarget", verbIndex: 5, formatType: "multi-target",
    fixedAcc1: "fone", fixedAcc2: "tablet" },
  { id: "L4-06",  difficulty: 4, ruleType: "multiTarget", verbIndex: 6, formatType: "multi-target",
    fixedAcc1: "capuz", fixedAcc2: "mochila" },
  { id: "L4-07",  difficulty: 4, ruleType: "multiTarget", verbIndex: 7, formatType: "multi-target",
    fixedAcc1: "oculos", fixedAcc2: "fone" },
  { id: "L4-08",  difficulty: 4, ruleType: "multiTarget", verbIndex: 8, formatType: "multi-target",
    fixedAcc1: "bone", fixedAcc2: "capuz" },
  { id: "L4-09",  difficulty: 4, ruleType: "multiTarget", verbIndex: 9, formatType: "multi-target",
    fixedAcc1: "cesta", fixedAcc2: "capuz" },
  { id: "L4-10",  difficulty: 4, ruleType: "multiTarget", verbIndex: 0, formatType: "multi-target",
    fixedAcc1: "gravata", fixedAcc2: "touca" },
  { id: "L4-11",  difficulty: 4, ruleType: "multiTarget", verbIndex: 2, formatType: "multi-target-color" },
  { id: "L4-12",  difficulty: 4, ruleType: "multiTarget", verbIndex: 1, formatType: "multi-target-color" },

  // ── L5 – multiAttribute (12) ──────────────────────────────────────────────
  { id: "L5-01",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 0, formatType: "multi-attr-2",
    fixedAcc1: "fone", fixedAcc2: "cesta" },
  { id: "L5-02",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 1, formatType: "multi-attr-2",
    fixedAcc1: "fone", fixedAcc2: "oculos-escuros" },
  { id: "L5-03",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 2, formatType: "multi-attr-2",
    fixedAcc1: "capuz", fixedAcc2: "mochila" },
  { id: "L5-04",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 3, formatType: "multi-attr-2",
    fixedAcc1: "capuz", fixedAcc2: "gravata" },
  { id: "L5-05",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 4, formatType: "multi-attr-2",
    fixedAcc1: "fone", fixedAcc2: "tablet" },
  { id: "L5-06",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 5, formatType: "multi-attr-2",
    fixedAcc1: "touca", fixedAcc2: "fone" },
  { id: "L5-07",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 6, formatType: "multi-attr-2",
    fixedAcc1: "oculos", fixedAcc2: "tablet" },
  { id: "L5-08",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 7, formatType: "multi-attr-2",
    fixedAcc1: "bone", fixedAcc2: "mochila" },
  { id: "L5-09",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 8, formatType: "multi-attr-2",
    fixedAcc1: "capuz", fixedAcc2: "skate" },
  { id: "L5-10",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 9, formatType: "multi-attr-2",
    fixedAcc1: "touca", fixedAcc2: "oculos-escuros" },
  { id: "L5-11",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 0, formatType: "multi-attr-3",
    fixedAcc1: "capuz", fixedAcc2: "gravata", fixedAcc3: "skate" },
  { id: "L5-12",  difficulty: 5, ruleType: "multiAttribute", verbIndex: 1, formatType: "multi-attr-3",
    fixedAcc1: "touca", fixedAcc2: "fone", fixedAcc3: "oculos-escuros" },

  // ── L6 – sequence (8) ─────────────────────────────────────────────────────
  { id: "L6-01",  difficulty: 6, ruleType: "sequence", verbIndex: 0, formatType: "sequence",
    fixedAcc1: "tablet", fixedAcc2: "raquete" },
  { id: "L6-02",  difficulty: 6, ruleType: "sequence", verbIndex: 1, formatType: "sequence",
    fixedAcc1: "touca", fixedAcc2: "capuz" },
  { id: "L6-03",  difficulty: 6, ruleType: "sequence", verbIndex: 2, formatType: "sequence",
    fixedAcc1: "fone", fixedAcc2: "mochila" },
  { id: "L6-04",  difficulty: 6, ruleType: "sequence", verbIndex: 3, formatType: "sequence",
    fixedAcc1: "bone", fixedAcc2: "cesta" },
  { id: "L6-05",  difficulty: 6, ruleType: "sequence", verbIndex: 4, formatType: "sequence",
    fixedAcc1: "microfone", fixedAcc2: "tablet" },
  { id: "L6-06",  difficulty: 6, ruleType: "sequence", verbIndex: 5, formatType: "sequence",
    fixedAcc1: "raquete", fixedAcc2: "oculos" },
  { id: "L6-07",  difficulty: 6, ruleType: "sequence", verbIndex: 6, formatType: "sequence-color" },
  { id: "L6-08",  difficulty: 6, ruleType: "sequence", verbIndex: 7, formatType: "sequence",
    fixedAcc1: "gravata", fixedAcc2: "touca" },

  // ── L7 – negative (7) ─────────────────────────────────────────────────────
  { id: "L7-01",  difficulty: 7, ruleType: "negative", verbIndex: 2, formatType: "negative-acc",
    fixedAcc1: "oculos" },
  { id: "L7-02",  difficulty: 7, ruleType: "negative", verbIndex: 1, formatType: "negative-acc-variant",
    fixedAcc1: "mochila" },
  { id: "L7-03",  difficulty: 7, ruleType: "negative", verbIndex: 3, formatType: "negative-acc-variant",
    fixedAcc1: "capuz" },
  { id: "L7-04",  difficulty: 7, ruleType: "negative", verbIndex: 0, formatType: "negative-acc",
    fixedAcc1: "fone" },
  { id: "L7-05",  difficulty: 7, ruleType: "negative", verbIndex: 4, formatType: "negative-acc-variant",
    fixedAcc1: "bone" },
  { id: "L7-06",  difficulty: 7, ruleType: "negative", verbIndex: 8, formatType: "negative-acc",
    fixedAcc1: "tablet" },
  { id: "L7-07",  difficulty: 7, ruleType: "negative", verbIndex: 5, formatType: "negative-acc-variant",
    fixedAcc1: "skate" },

  // ── L8 – advanced (7) ─────────────────────────────────────────────────────
  { id: "L8-01",  difficulty: 8, ruleType: "advanced", verbIndex: 1, formatType: "advanced",
    fixedAcc1: "mochila", fixedAcc2: "cesta", fixedAcc3: "tablet" },
  { id: "L8-02",  difficulty: 8, ruleType: "advanced", verbIndex: 3, formatType: "advanced",
    fixedAcc1: "fone", fixedAcc2: "capuz", fixedAcc3: "mochila" },
  { id: "L8-03",  difficulty: 8, ruleType: "advanced", verbIndex: 0, formatType: "advanced",
    fixedAcc1: "touca", fixedAcc2: "microfone", fixedAcc3: "tablet" },
  { id: "L8-04",  difficulty: 8, ruleType: "advanced", verbIndex: 2, formatType: "advanced",
    fixedAcc1: "skate", fixedAcc2: "mochila", fixedAcc3: "fone" },
  { id: "L8-05",  difficulty: 8, ruleType: "advanced", verbIndex: 5, formatType: "advanced",
    fixedAcc1: "bone", fixedAcc2: "cesta", fixedAcc3: "skate" },
  { id: "L8-06",  difficulty: 8, ruleType: "advanced", verbIndex: 7, formatType: "advanced",
    fixedAcc1: "oculos-escuros", fixedAcc2: "microfone", fixedAcc3: "gravata" },
  { id: "L8-07",  difficulty: 8, ruleType: "advanced", verbIndex: 4, formatType: "advanced",
    fixedAcc1: "tablet", fixedAcc2: "bone", fixedAcc3: "capuz" },
];
