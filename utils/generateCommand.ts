import type { Theme } from "@/types";
import type {
  CharacterAttributes,
  AccessoryKey,
  ColorName,
  SymbolKey,
  ObjectKey,
  GeneratedCommand,
  BuiltRound,
  CommandRuleType,
  FocusMode,
} from "@/types/commands";
import { characterAttributes, allCharacterAttributes } from "@/data/agentAttributes";
import {
  COMMAND_TEMPLATES,
  VERB_PREFIX_FNS,
  SEQ_FIRST_FNS,
  SEQ_THEN,
  DUAL_PREFIX_FNS,
  ACC_PT,
  COLOR_PT,
  type CommandTemplate,
} from "@/data/commandTemplates";
import {
  shuffle,
  withAccessory,
  withoutAccessory,
  withAllAccessories,
  withoutAnyAccessory,
  withUniformColor,
  withHairColor,
  withAccessoryColor,
  pickDistinctAgents,
  ALL_UNIFORM_COLORS,
  ALL_ACCESSORIES,
} from "@/utils/selectTargets";

// ── Helpers internos ──────────────────────────────────────────────────────────

const NOUN: Record<string, string> = {
  CLINICAL: "agente",
  COLORFUL: "personagem",
  GAMIFIED: "avatar",
};

function vb(idx: number, noun: string): string {
  return VERB_PREFIX_FNS[idx % VERB_PREFIX_FNS.length](noun);
}
function seqFirst(idx: number, noun: string): string {
  return SEQ_FIRST_FNS[idx % SEQ_FIRST_FNS.length](noun);
}
function seqThen(idx: number): string {
  return SEQ_THEN[idx % SEQ_THEN.length];
}
function dualVb(idx: number, noun: string): string {
  return DUAL_PREFIX_FNS[idx % DUAL_PREFIX_FNS.length](noun);
}

// Memória das 2 últimas escolhas → evita repetir o mesmo comando em rodadas
// seguidas (a Kamylla notou "clique no azul" 3x / "da raquete" 2x — cansativo).
let recentColors: ColorName[] = [];
let recentAccs: AccessoryKey[] = [];

function randomAcc(pool: CharacterAttributes[]): AccessoryKey | null {
  const available = ALL_ACCESSORIES.filter(a => withAccessory(pool, a).length > 0);
  if (!available.length) return null;
  const fresh = available.filter(a => !recentAccs.includes(a));
  const pick = shuffle(fresh.length ? fresh : available)[0];
  recentAccs = [pick, ...recentAccs].slice(0, 2);
  return pick;
}

function randomColor(pool: CharacterAttributes[]): ColorName | null {
  const available = ALL_UNIFORM_COLORS.filter(c => pool.some(ch => ch.uniformColor === c));
  if (!available.length) return null;
  const fresh = available.filter(c => !recentColors.includes(c));
  const pick = shuffle(fresh.length ? fresh : available)[0];
  recentColors = [pick, ...recentColors].slice(0, 2);
  return pick;
}

// Escolhe cor/acessório de uma lista de candidatos, evitando os 2 mais recentes
// (mesma memória de randomColor/randomAcc) — usado pelos modos (buildFoco etc.),
// que antes sorteavam com shuffle direto e por isso repetiam o comando.
function pickColorFrom(candidates: ColorName[]): ColorName {
  const base = candidates.length ? candidates : [...ALL_UNIFORM_COLORS];
  const fresh = base.filter(c => !recentColors.includes(c));
  const pick = shuffle(fresh.length ? fresh : base)[0];
  recentColors = [pick, ...recentColors].slice(0, 2);
  return pick;
}
function pickAccFrom(candidates: AccessoryKey[]): AccessoryKey {
  const base = candidates.length ? candidates : [...ALL_ACCESSORIES];
  const fresh = base.filter(a => !recentAccs.includes(a));
  const pick = shuffle(fresh.length ? fresh : base)[0];
  recentAccs = [pick, ...recentAccs].slice(0, 2);
  return pick;
}
// Alterna o TIPO de comando do Foco N1 (cor ↔ acessório) p/ não repetir o formato.
let lastFocoKind: "color" | "acc" | null = null;
function nextFocoKind(canAcc: boolean): "color" | "acc" {
  if (!canAcc) { lastFocoKind = "color"; return "color"; }
  const kind: "color" | "acc" =
    lastFocoKind === "color" ? "acc" : lastFocoKind === "acc" ? "color" : (Math.random() < 0.5 ? "color" : "acc");
  lastFocoKind = kind;
  return kind;
}

function numChars(difficulty: number): number {
  if (difficulty <= 1) return 4;
  if (difficulty <= 3) return 5;
  if (difficulty <= 5) return 6;
  if (difficulty <= 7) return 7;
  return 8;
}

function displayN(difficulty: number): number {
  if (difficulty <= 2) return 16;
  if (difficulty <= 4) return 20;
  if (difficulty <= 6) return 24;
  if (difficulty <= 8) return 26;
  return 28;
}

function fillToN(built: BuiltRound, n: number): BuiltRound {
  if (built.characters.length >= n) return built;

  const usedIds = new Set(built.characters.map(c => c.id));
  const targetIds = new Set(built.command.targets);
  const forbiddenIds = new Set(built.command.forbidden);
  const targetChars = built.characters.filter(c => targetIds.has(c.id));
  const forbiddenChars = built.characters.filter(c => forbiddenIds.has(c.id));
  const isNegative = built.command.rule.type === "negative" || built.command.rule.type === "advanced";

  const isSafe = (c: CharacterAttributes): boolean => {
    if (usedIds.has(c.id)) return false;
    if (isNegative) {
      return !forbiddenChars.some(f => f.accessories.some(a => c.accessories.includes(a)));
    }
    if (targetChars.some(t =>
      c.uniformColor === t.uniformColor ||
      t.accessories.some(a => c.accessories.includes(a))
    )) return false;
    if (forbiddenChars.some(f => f.accessories.some(a => c.accessories.includes(a)))) return false;
    return true;
  };

  const candidates = shuffle(characterAttributes.filter(c => !usedIds.has(c.id)));
  const needed = n - built.characters.length;
  const toAdd: CharacterAttributes[] = [];

  for (const c of candidates) {
    if (toAdd.length >= needed) break;
    if (isSafe(c)) toAdd.push(c);
  }

  if (toAdd.length < needed) {
    const addedIds = new Set(toAdd.map(c => c.id));
    for (const c of candidates) {
      if (toAdd.length >= needed) break;
      if (!addedIds.has(c.id)) toAdd.push(c);
    }
  }

  return {
    characters: shuffle([...built.characters, ...toAdd]),
    command: built.command,
  };
}

function pickLevel(difficulty: number): number {
  const r = Math.random();
  if (difficulty <= 1) return 1;
  if (difficulty <= 2) return r < 0.70 ? 1 : 2;
  if (difficulty <= 3) return r < 0.20 ? 1 : r < 0.70 ? 2 : 3;
  if (difficulty <= 4) return r < 0.20 ? 2 : r < 0.70 ? 3 : 4;
  if (difficulty <= 5) return r < 0.20 ? 3 : r < 0.60 ? 4 : 5;
  if (difficulty <= 6) return r < 0.15 ? 4 : r < 0.55 ? 5 : 6;
  if (difficulty <= 7) return r < 0.10 ? 5 : r < 0.50 ? 6 : 7;
  if (difficulty <= 8) return r < 0.20 ? 6 : r < 0.60 ? 7 : 8;
  if (difficulty <= 9) return r < 0.30 ? 7 : 8;
  return 8;
}

// ── Montagem de resultado ─────────────────────────────────────────────────────

function mkResult(
  targets: CharacterAttributes[],
  distractors: CharacterAttributes[],
  forbidden: CharacterAttributes[],
  sequenced: boolean,
  requiredTargets: number,
  ruleType: CommandRuleType,
  text: string,
  verbIndex: number,
): BuiltRound {
  const cmd: GeneratedCommand = {
    text, mode: "visual", difficulty: 0,
    targets: targets.map(c => c.id),
    distractors: distractors.map(c => c.id),
    forbidden: forbidden.map(c => c.id),
    sequenced, requiredTargets, verbIndex,
    rule: { type: ruleType },
  };
  return { characters: shuffle([...targets, ...distractors, ...forbidden]), command: cmd };
}

// ── Resolução de template ─────────────────────────────────────────────────────

function resolve(
  tmpl: CommandTemplate,
  pool: CharacterAttributes[],
  n: number,
  theme: Theme,
): BuiltRound | null {
  const noun = NOUN[theme] ?? "agente";
  const vi = tmpl.verbIndex;

  switch (tmpl.formatType) {

    // L1 ── acessório + cor do uniforme
    case "acc-only": {
      const acc = tmpl.fixedAcc1 ?? randomAcc(pool);
      if (!acc) return null;
      const [target] = pickDistinctAgents(withAccessory(pool, acc), 1);
      if (!target) return null;
      const color = target.uniformColor;
      // exclui apenas quem tem exatamente cor+acessório iguais ao alvo (seriam ambíguos)
      const dist = pickDistinctAgents(
        pool.filter(c => c.agentId !== target.agentId && !(c.uniformColor === color && c.accessories.includes(acc))),
        n - 1,
        new Set([target.agentId]),
      );
      if (dist.length < n - 1) return null;
      return mkResult([target], dist, [], false, 1, "single",
        `${vb(vi, noun)} ${COLOR_PT[color]} com ${ACC_PT[acc]}`, vi);
    }

    // L1 ── cor simples
    case "color-only": {
      const color = tmpl.fixedColor1 ?? randomColor(pool);
      if (!color) return null;
      const [target] = pickDistinctAgents(withUniformColor(pool, color), 1);
      if (!target) return null;
      const dist = pickDistinctAgents(pool.filter(c => c.uniformColor !== color), n - 1, new Set([target.agentId]));
      if (dist.length < n - 1) return null;
      return mkResult([target], dist, [], false, 1, "single", `${vb(vi, noun)} ${COLOR_PT[color]}`, vi);
    }

    // L2 ── uniforme + acessório
    case "uniform-acc": {
      const color = tmpl.fixedColor1 ?? randomColor(pool);
      const acc   = tmpl.fixedAcc1  ?? randomAcc(pool);
      if (!color || !acc) return null;
      const [target] = pickDistinctAgents(withUniformColor(pool, color).filter(c => c.accessories.includes(acc)), 1);
      if (!target) return null;
      const confPool = [
        ...withUniformColor(pool, color).filter(c => !c.accessories.includes(acc) && c.agentId !== target.agentId),
        ...withAccessory(pool, acc).filter(c => c.uniformColor !== color && c.agentId !== target.agentId),
      ];
      const conf = pickDistinctAgents(confPool, Math.min(2, n - 1), new Set([target.agentId]));
      const rest = pickDistinctAgents(
        pool.filter(c => c.agentId !== target.agentId && !conf.some(x => x.agentId === c.agentId)),
        n - 1 - conf.length,
        new Set([target.agentId, ...conf.map(c => c.agentId)]),
      );
      return mkResult([target], [...conf, ...rest], [], false, 1, "colorAttribute",
        `${vb(vi, noun)} ${COLOR_PT[color]} com ${ACC_PT[acc]}`, vi);
    }

    // L2 ── cor de uniforme sem acessório ("agente azul sem fone")
    case "color-no-acc": {
      const acc = tmpl.fixedAcc1 ?? randomAcc(pool);
      if (!acc) return null;
      // Descobre quais cores têm alvo (cor+sem acc) E confusor (cor+com acc, agentId diferente)
      const validColors = shuffle(
        (Object.keys(COLOR_PT) as (keyof typeof COLOR_PT)[]).filter(color => {
          const tPool = pool.filter(c => c.uniformColor === color && !c.accessories.includes(acc));
          const tIds  = new Set(tPool.map(c => c.agentId));
          const cPool = pool.filter(c => c.uniformColor === color && c.accessories.includes(acc));
          return tPool.length > 0 && cPool.some(c => !tIds.has(c.agentId));
        })
      );
      if (!validColors.length) return null;
      const color = tmpl.fixedColor1 && validColors.includes(tmpl.fixedColor1)
        ? tmpl.fixedColor1
        : validColors[0];
      const targetPool = pool.filter(c => c.uniformColor === color && !c.accessories.includes(acc));
      const [target] = pickDistinctAgents(targetPool, 1);
      if (!target) return null;
      const confPool = pool.filter(c => c.uniformColor === color && c.accessories.includes(acc));
      const [conf] = pickDistinctAgents(confPool, 1, new Set([target.agentId]));
      if (!conf) return null;
      const rest = pickDistinctAgents(
        pool.filter(c => c.agentId !== target.agentId && c.agentId !== conf.agentId),
        n - 2,
        new Set([target.agentId, conf.agentId]),
      );
      return mkResult([target], [conf, ...rest], [], false, 1, "colorAttribute",
        `${vb(vi, noun)} ${COLOR_PT[color]} sem ${ACC_PT[acc]}`, vi);
    }

    // L2 ── acessório colorido
    case "acc-with-acc-color": {
      const acc = tmpl.fixedAcc1 ?? randomAcc(pool);
      if (!acc) return null;
      const colored = pool.filter(c => c.accessories.includes(acc) && c.accessoryColors?.[acc]);
      const [target] = pickDistinctAgents(colored, 1);
      if (!target) return null;
      const accColor = target.accessoryColors![acc]!;
      const conf = pickDistinctAgents(
        pool.filter(c => c.accessories.includes(acc) && c.accessoryColors?.[acc] !== accColor && c.agentId !== target.agentId),
        1, new Set([target.agentId]),
      );
      const rest = pickDistinctAgents(
        withoutAccessory(pool, acc).filter(c => c.agentId !== target.agentId),
        n - 1 - conf.length,
        new Set([target.agentId, ...conf.map(c => c.agentId)]),
      );
      return mkResult([target], [...conf, ...rest], [], false, 1, "colorAttribute",
        `${vb(vi, noun)} com ${ACC_PT[acc]} ${COLOR_PT[accColor]}`, vi);
    }

    // L2 ── cor de cabelo
    case "hair-color": {
      const withHair = pool.filter(c => c.hairColor);
      const [target] = pickDistinctAgents(withHair, 1);
      if (!target) return null;
      const hc = target.hairColor!;
      const dist = pickDistinctAgents(pool.filter(c => c.hairColor !== hc && c.agentId !== target.agentId), n - 1, new Set([target.agentId]));
      if (dist.length < n - 1) return null;
      return mkResult([target], dist, [], false, 1, "colorAttribute",
        `${vb(vi, noun)} de cabelo ${COLOR_PT[hc]}`, vi);
    }

    // L2 ── cor de cabelo + acessório
    case "hair-color-acc": {
      const acc = tmpl.fixedAcc1 ?? randomAcc(pool);
      if (!acc) return null;
      const [target] = pickDistinctAgents(pool.filter(c => c.hairColor && c.accessories.includes(acc)), 1);
      if (!target) return null;
      const hc   = target.hairColor!;
      const dist = pickDistinctAgents(pool.filter(c => c.agentId !== target.agentId), n - 1, new Set([target.agentId]));
      return mkResult([target], dist, [], false, 1, "colorAttribute",
        `${vb(vi, noun)} de cabelo ${COLOR_PT[hc]} com ${ACC_PT[acc]}`, vi);
    }

    // L3 ── contraste de acessório
    case "contrast-acc": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      if (!acc1 || !acc2) return null;
      const [target] = pickDistinctAgents(withAccessory(pool, acc1).filter(c => !c.accessories.includes(acc2)), 1);
      if (!target) return null;
      const conf = pickDistinctAgents(withAccessory(pool, acc2).filter(c => c.agentId !== target.agentId), 1, new Set([target.agentId]));
      const rest = pickDistinctAgents(
        withoutAnyAccessory(pool, [acc1, acc2]).filter(c => c.agentId !== target.agentId),
        n - 1 - conf.length,
        new Set([target.agentId, ...conf.map(c => c.agentId)]),
      );
      return mkResult([target], [...conf, ...rest], [], false, 1, "contrast",
        `${vb(vi, noun)} com ${ACC_PT[acc1]}, não o de ${ACC_PT[acc2]}`, vi);
    }

    // L3 ── contraste por cor de acessório
    case "contrast-acc-color": {
      const acc = tmpl.fixedAcc1;
      if (!acc) return null;
      const colored = pool.filter(c => c.accessories.includes(acc) && c.accessoryColors?.[acc]);
      if (colored.length < 2) return null;
      const [c1, c2] = pickDistinctAgents(colored, 2);
      if (!c1 || !c2) return null;
      const col1 = c1.accessoryColors![acc]!;
      const col2 = c2.accessoryColors![acc]!;
      if (col1 === col2) return null;
      const [target, confuser] = shuffle([c1, c2]) as [CharacterAttributes, CharacterAttributes];
      const tCol = target.accessoryColors![acc]!;
      const cCol = confuser.accessoryColors![acc]!;
      const rest = pickDistinctAgents(
        withoutAccessory(pool, acc).filter(c => c.agentId !== target.agentId && c.agentId !== confuser.agentId),
        n - 2,
        new Set([target.agentId, confuser.agentId]),
      );
      return mkResult([target], [confuser, ...rest], [], false, 1, "contrast",
        `${vb(vi, noun)} com ${ACC_PT[acc]} ${COLOR_PT[tCol]}, não o de ${ACC_PT[acc]} ${COLOR_PT[cCol]}`, vi);
    }

    // L3 ── contraste de cor de uniforme
    case "contrast-color": {
      const colors = shuffle(ALL_UNIFORM_COLORS.filter(c => pool.some(ch => ch.uniformColor === c)));
      if (colors.length < 2) return null;
      const [col1, col2] = colors as [ColorName, ColorName];
      const [target] = pickDistinctAgents(withUniformColor(pool, col1), 1);
      if (!target) return null;
      const conf = pickDistinctAgents(withUniformColor(pool, col2).filter(c => c.agentId !== target.agentId), 1, new Set([target.agentId]));
      const rest = pickDistinctAgents(
        pool.filter(c => c.uniformColor !== col1 && c.uniformColor !== col2 && c.agentId !== target.agentId),
        n - 1 - conf.length,
        new Set([target.agentId, ...conf.map(c => c.agentId)]),
      );
      return mkResult([target], [...conf, ...rest], [], false, 1, "contrast",
        `${vb(vi, noun)} ${COLOR_PT[col1]}, não o ${COLOR_PT[col2]}`, vi);
    }

    // L4 ── dois alvos por acessório
    case "multi-target": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      if (!acc1 || !acc2) return null;
      const [t1] = pickDistinctAgents(withAccessory(pool, acc1).filter(c => !c.accessories.includes(acc2)), 1);
      if (!t1) return null;
      const [t2] = pickDistinctAgents(withAccessory(pool, acc2).filter(c => !c.accessories.includes(acc1)), 1, new Set([t1.agentId]));
      if (!t2) return null;
      const used = new Set([t1.agentId, t2.agentId]);
      const dist = pickDistinctAgents(withoutAnyAccessory(pool, [acc1, acc2]).filter(c => !used.has(c.agentId)), n - 2, used);
      return mkResult([t1, t2], dist, [], false, 2, "multiTarget",
        `${dualVb(vi, noun)} com ${ACC_PT[acc1]} e o ${noun} com ${ACC_PT[acc2]}`, vi);
    }

    // L4 ── dois alvos por cor
    case "multi-target-color": {
      const colors = shuffle(ALL_UNIFORM_COLORS.filter(c => pool.some(ch => ch.uniformColor === c)));
      if (colors.length < 2) return null;
      const [col1, col2] = colors as [ColorName, ColorName];
      const [t1] = pickDistinctAgents(withUniformColor(pool, col1), 1);
      if (!t1) return null;
      const [t2] = pickDistinctAgents(withUniformColor(pool, col2), 1, new Set([t1.agentId]));
      if (!t2) return null;
      const used = new Set([t1.agentId, t2.agentId]);
      const dist = pickDistinctAgents(pool.filter(c => c.uniformColor !== col1 && c.uniformColor !== col2 && !used.has(c.agentId)), n - 2, used);
      return mkResult([t1, t2], dist, [], false, 2, "multiTarget",
        `${dualVb(vi, noun)} ${COLOR_PT[col1]} e o ${noun} ${COLOR_PT[col2]}`, vi);
    }

    // L5 ── múltiplos atributos (2)
    case "multi-attr-2": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      if (!acc1 || !acc2) return null;
      const [target] = pickDistinctAgents(withAllAccessories(pool, [acc1, acc2]), 1);
      if (!target) return null;
      const c1 = pickDistinctAgents(withAccessory(pool, acc1).filter(c => !c.accessories.includes(acc2) && c.agentId !== target.agentId), 1, new Set([target.agentId]));
      const used1 = new Set([target.agentId, ...c1.map(c => c.agentId)]);
      const c2 = pickDistinctAgents(withAccessory(pool, acc2).filter(c => !c.accessories.includes(acc1) && !used1.has(c.agentId)), 1, used1);
      const conf = [...c1, ...c2];
      const usedAll = new Set([target.agentId, ...conf.map(c => c.agentId)]);
      const rest = pickDistinctAgents(withoutAnyAccessory(pool, [acc1, acc2]).filter(c => !usedAll.has(c.agentId)), n - 1 - conf.length, usedAll);
      return mkResult([target], [...conf, ...rest], [], false, 1, "multiAttribute",
        `${vb(vi, noun)} com ${ACC_PT[acc1]} e ${ACC_PT[acc2]}`, vi);
    }

    // L5 ── múltiplos atributos (3)
    case "multi-attr-3": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      const acc3 = tmpl.fixedAcc3;
      if (!acc1 || !acc2 || !acc3) return null;
      const [target] = pickDistinctAgents(withAllAccessories(pool, [acc1, acc2, acc3]), 1);
      if (!target) return null;
      const dist = pickDistinctAgents(pool.filter(c => c.agentId !== target.agentId), n - 1, new Set([target.agentId]));
      return mkResult([target], dist, [], false, 1, "multiAttribute",
        `${vb(vi, noun)} com ${ACC_PT[acc1]}, ${ACC_PT[acc2]} e ${ACC_PT[acc3]}`, vi);
    }

    // L6 ── sequência por acessório
    case "sequence": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      if (!acc1 || !acc2) return null;
      const [t1] = pickDistinctAgents(withAccessory(pool, acc1).filter(c => !c.accessories.includes(acc2)), 1);
      if (!t1) return null;
      const [t2] = pickDistinctAgents(withAccessory(pool, acc2).filter(c => !c.accessories.includes(acc1)), 1, new Set([t1.agentId]));
      if (!t2) return null;
      const used = new Set([t1.agentId, t2.agentId]);
      const dist = pickDistinctAgents(withoutAnyAccessory(pool, [acc1, acc2]).filter(c => !used.has(c.agentId)), n - 2, used);
      const sf = seqFirst(vi, noun);
      const st = seqThen(vi);
      return mkResult([t1, t2], dist, [], true, 2, "sequence",
        `${sf} com ${ACC_PT[acc1]}, ${st} ${noun} com ${ACC_PT[acc2]}`, vi);
    }

    // L6 ── sequência por cor
    case "sequence-color": {
      const colors = shuffle(ALL_UNIFORM_COLORS.filter(c => pool.some(ch => ch.uniformColor === c)));
      if (colors.length < 2) return null;
      const [col1, col2] = colors as [ColorName, ColorName];
      const [t1] = pickDistinctAgents(withUniformColor(pool, col1), 1);
      if (!t1) return null;
      const [t2] = pickDistinctAgents(withUniformColor(pool, col2), 1, new Set([t1.agentId]));
      if (!t2) return null;
      const used = new Set([t1.agentId, t2.agentId]);
      const dist = pickDistinctAgents(pool.filter(c => c.uniformColor !== col1 && c.uniformColor !== col2 && !used.has(c.agentId)), n - 2, used);
      const sf = seqFirst(vi, noun);
      const st = seqThen(vi);
      return mkResult([t1, t2], dist, [], true, 2, "sequence",
        `${sf} ${COLOR_PT[col1]}, ${st} ${noun} ${COLOR_PT[col2]}`, vi);
    }

    // L7 ── negativo (exceto o que usa X)
    case "negative-acc": {
      const acc = tmpl.fixedAcc1;
      if (!acc) return null;
      const forbidPool = withAccessory(pool, acc);
      const validPool  = withoutAccessory(pool, acc);
      if (!forbidPool.length || validPool.length < 2) return null;
      const [forbidden] = pickDistinctAgents(forbidPool, 1);
      if (!forbidden) return null;
      const valid = pickDistinctAgents(validPool, n - 1, new Set([forbidden.agentId]));
      if (valid.length < 2) return null;
      return mkResult(valid, [], [forbidden], false, 1, "negative",
        `Capture qualquer ${noun}, exceto o que usa ${ACC_PT[acc]}`, vi);
    }

    // L7 ── negativo (variações de formulação)
    case "negative-acc-variant": {
      const acc = tmpl.fixedAcc1;
      if (!acc) return null;
      const forbidPool = withAccessory(pool, acc);
      const validPool  = withoutAccessory(pool, acc);
      if (!forbidPool.length || validPool.length < 2) return null;
      const [forbidden] = pickDistinctAgents(forbidPool, 1);
      if (!forbidden) return null;
      const valid = pickDistinctAgents(validPool, n - 1, new Set([forbidden.agentId]));
      if (valid.length < 2) return null;
      const variants = [
        `${vb(vi, noun)} que não tem ${ACC_PT[acc]}`,
        `Capture qualquer ${noun} sem ${ACC_PT[acc]}`,
        `Capture um ${noun} diferente do que usa ${ACC_PT[acc]}`,
        `Capture qualquer ${noun} que não usa ${ACC_PT[acc]}`,
        `Capture um ${noun} sem ${ACC_PT[acc]}`,
      ];
      const text = variants[vi % variants.length];
      return mkResult(valid, [], [forbidden], false, 1, "negative", text, vi);
    }

    // L8 ── avançado (sequência + proibido)
    case "advanced": {
      const acc1 = tmpl.fixedAcc1;
      const acc2 = tmpl.fixedAcc2;
      const acc3 = tmpl.fixedAcc3;
      if (!acc1 || !acc2 || !acc3) return null;
      const p1 = withAccessory(pool, acc1).filter(c => !c.accessories.includes(acc2) && !c.accessories.includes(acc3));
      const p2 = withAccessory(pool, acc2).filter(c => !c.accessories.includes(acc1) && !c.accessories.includes(acc3));
      const p3 = withAccessory(pool, acc3).filter(c => !c.accessories.includes(acc1) && !c.accessories.includes(acc2));
      const [t1] = pickDistinctAgents(p1, 1);
      if (!t1) return null;
      const [t2] = pickDistinctAgents(p2, 1, new Set([t1.agentId]));
      if (!t2) return null;
      const [forbid] = pickDistinctAgents(p3, 1, new Set([t1.agentId, t2.agentId]));
      if (!forbid) return null;
      const used = new Set([t1.agentId, t2.agentId, forbid.agentId]);
      const dist = pickDistinctAgents(withoutAnyAccessory(pool, [acc1, acc2, acc3]).filter(c => !used.has(c.agentId)), n - 3, used);
      const sf = seqFirst(vi, noun);
      const st = seqThen(vi);
      const text = `${sf} com ${ACC_PT[acc1]}, ${st} ${noun} com ${ACC_PT[acc2]}, mas não toque em nenhum com ${ACC_PT[acc3]}`;
      return mkResult([t1, t2], dist, [forbid], true, 2, "advanced", text, vi);
    }

    default:
      return null;
  }
}

// ── Fallback garantido ────────────────────────────────────────────────────────

function colorFallback(n: number, theme: Theme): BuiltRound {
  const noun = NOUN[theme] ?? "agente";
  const byColor = new Map<string, CharacterAttributes>();
  for (const c of shuffle(characterAttributes)) {
    if (!byColor.has(c.uniformColor)) byColor.set(c.uniformColor, c);
  }
  const pool = Array.from(byColor.values()).slice(0, n);
  const [target, ...rest] = pool;
  return {
    characters: shuffle(pool),
    command: {
      text: `Capture o ${noun} ${COLOR_PT[target.uniformColor]}`,
      mode: "visual", difficulty: 1, verbIndex: 0,
      targets: [target.id], distractors: rest.map(c => c.id),
      forbidden: [], sequenced: false, requiredTargets: 1,
      rule: { type: "single" },
    },
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Gera uma rodada completa (personagens + comando) para o exercício Focus Agentes.
 *
 * @param difficulty   Nível adaptativo 1-10
 * @param theme        Tema visual
 * @param recentVerbs  Índices de verbos usados recentemente (evita repetição imediata)
 */
export function buildRound(
  difficulty: number,
  theme: Theme,
  recentVerbs: number[] = [],
): BuiltRound {
  const level = pickLevel(difficulty);
  const n = numChars(difficulty);
  const dN = displayN(difficulty);

  const levelTemplates = COMMAND_TEMPLATES.filter(t => t.difficulty === level);
  const recentSet = new Set(recentVerbs.slice(-3));
  const ordered = [
    ...shuffle(levelTemplates.filter(t => !recentSet.has(t.verbIndex))),
    ...shuffle(levelTemplates.filter(t => recentSet.has(t.verbIndex))),
  ];

  for (const tmpl of ordered) {
    const result = resolve(tmpl, characterAttributes, n, theme);
    if (result) return fillToN(result, dN);
  }

  for (const fb of [level - 1, level - 2, 1]) {
    if (fb < 1) continue;
    for (const tmpl of shuffle(COMMAND_TEMPLATES.filter(t => t.difficulty === fb))) {
      const result = resolve(tmpl, characterAttributes, n, theme);
      if (result) return fillToN(result, dN);
    }
  }

  return fillToN(colorFallback(n, theme), dN);
}

// ── API por MODO (redesign 4 modos × 5 níveis) ──────────────────────────────────

// Para cada modo cognitivo, qual "difficulty interna" dos templates usar por nível
// (1–5). O modo seleciona a CATEGORIA de comando; o nível escala a complexidade.
//   foco        → seleção por atributos (single/colorAttribute/multiAttribute)
//   inibicao    → exceções (contrast "não o de…" / negative "exceto…")
//   alternancia → sequência ("primeiro… depois…")
//   desafio     → multiTarget + advanced (sequência + exceção)
const MODE_LEVEL_DIFF: Record<FocusMode, [number, number, number, number, number]> = {
  foco:        [1, 2, 2, 5, 5],
  inibicao:    [3, 3, 7, 7, 8],
  alternancia: [6, 6, 6, 6, 6],
  desafio:     [4, 4, 8, 8, 8],
};

// Personagens "ativos" (n) e total exibido (dN) por nível (1–5).
// Mantido enxuto de propósito: muitos personagens viram poluição visual e
// dificultam achar o alvo sem necessidade (o desafio vem dos atributos + velocidade).
const MODE_LEVEL_N: [number, number][] = [
  [5, 10], [6, 13], [7, 16], [8, 18], [9, 20],
];

// Formatos de comando que dependem de detalhes sutis/ambíguos (cor do cabelo,
// cor do acessório, "sem X") — evitados para que o alvo descrito seja sempre
// claramente identificável na cena.
const SUBTLE_FORMATS = new Set<string>([
  "hair-color", "hair-color-acc", "acc-with-acc-color", "contrast-acc-color", "color-no-acc",
]);

// ── Parte 2: "capturar todos da regra" (go/no-go) ───────────────────────────────
// Em vez de 1 alvo, marca TODOS os personagens que batem a regra como alvos.
// Foco: só alvos (capture todos os X). Inibição: alvos GO + proibidos NO-GO,
// com texto em 2 linhas (✅ capturar / 🚫 não tocar) — claro, sem "X, não o Y".

function distinctByColor(c: ColorName, max: number): CharacterAttributes[] {
  return pickDistinctAgents(withUniformColor(characterAttributes, c), max);
}
function distinctByAcc(a: AccessoryKey, max: number): CharacterAttributes[] {
  return pickDistinctAgents(withAccessory(characterAttributes, a), max);
}

// ── Fase A: regras ricas para Foco e Inibição ──────────────────────────────────
// Os 36 agentes são combinações ÚNICAS (cor × 1 acessório). Para "tocar em todos
// os verdes com fone" (que tem só 1 agente), criamos CÓPIAS do agente que bate.
let _cloneSeq = 0;
function cloneAgents(attr: CharacterAttributes, n: number): CharacterAttributes[] {
  return Array.from({ length: n }, () => ({ ...attr, id: `${attr.id}__k${_cloneSeq++}` }));
}
const COLOR_PL: Partial<Record<ColorName, string>> = {
  azul: "azuis", verde: "verdes", roxo: "roxos", laranja: "laranja", vermelho: "vermelhos", amarelo: "amarelos",
};
const colorPl = (c: ColorName) => COLOR_PL[c] ?? COLOR_PT[c];
const agentWith = (col: ColorName, acc: AccessoryKey) =>
  characterAttributes.find(c => c.uniformColor === col && c.accessories.includes(acc));
const colorsWithAcc = (acc: AccessoryKey) => ALL_UNIFORM_COLORS.filter(c => agentWith(c, acc));
const accsWithMinColors = (k: number) => ALL_ACCESSORIES.filter(a => colorsWithAcc(a).length >= k);
const noAccessoryAgents = () => withoutAnyAccessory(characterAttributes, ALL_ACCESSORIES);
const cap = (arr: CharacterAttributes[], n: number) => arr.slice(0, Math.max(0, n));

type Zone = "top" | "bottom" | "left" | "right";
const ZONES: Zone[] = ["top", "bottom", "left", "right"];
const ZONE_PT: Record<Zone, string> = { top: "em cima", bottom: "embaixo", left: "à esquerda", right: "à direita" };
const OPP_ZONE: Record<Zone, Zone> = { top: "bottom", bottom: "top", left: "right", right: "left" };
type MoveDir = "right" | "left" | "up" | "down";
const DIR_PT: Record<MoveDir, string> = { right: "para a direita", left: "para a esquerda", up: "para cima", down: "para baixo" };

function buildFoco(lv: number, noun: string, dN: number): BuiltRound {
  // N1 — um atributo só (cor OU acessório), alternando o tipo e sem repetir o valor
  if (lv === 1) {
    const useAcc = nextFocoKind(accsWithMinColors(3).length > 0) === "acc";
    if (useAcc) {
      const acc = pickAccFrom(accsWithMinColors(3));
      const targets = distinctByAcc(acc, 4);
      const distract = pickDistinctAgents(withoutAccessory(characterAttributes, acc), dN - targets.length, new Set(targets.map(t => t.agentId)));
      return mkResult(targets, distract, [], false, targets.length, "multiTarget", `Toque nos ${noun}s com ${ACC_PT[acc]}`, 0);
    }
    const col = pickColorFrom(ALL_UNIFORM_COLORS.filter(c => distinctByColor(c, 3).length >= 3));
    const targets = distinctByColor(col, 4);
    const distract = pickDistinctAgents(characterAttributes.filter(c => c.uniformColor !== col), dN - targets.length, new Set(targets.map(t => t.agentId)));
    return mkResult(targets, distract, [], false, targets.length, "multiTarget", `Toque nos ${noun}s ${colorPl(col)}`, 0);
  }

  // N4 — POSIÇÃO ou MOVIMENTO por cor (metade/metade). Mesma cor "no lugar errado" = distrator.
  if (lv === 4) {
    const col = pickColorFrom(ALL_UNIFORM_COLORS.filter(c => distinctByColor(c, 4).length >= 4));
    const colAgents = distinctByColor(col, 6);
    const targets = colAgents.slice(0, 3);
    const sameColorTrap = colAgents.slice(3, 5);
    const others = pickDistinctAgents(characterAttributes.filter(c => c.uniformColor !== col), dN - targets.length - sameColorTrap.length, new Set(colAgents.map(a => a.agentId)));
    if (Math.random() < 0.5) {   // MOVIMENTO
      const dir = shuffle<MoveDir>(["right", "left", "up", "down"])[0];
      const r = mkResult(targets, [...sameColorTrap, ...others], [], false, targets.length, "multiTarget", `Toque nos ${noun}s ${colorPl(col)} que estão indo ${DIR_PT[dir]}`, 0);
      r.command.movement = dir;
      return r;
    }
    // POSIÇÃO
    const zone = shuffle(ZONES)[0]; const opp = OPP_ZONE[zone];
    const zones: Record<string, Zone> = {};
    targets.forEach(t => { zones[t.id] = zone; });
    sameColorTrap.forEach(d => { zones[d.id] = opp; });
    const r = mkResult(targets, [...sameColorTrap, ...others], [], false, targets.length, "multiTarget", `Toque nos ${noun}s ${colorPl(col)} que estão ${ZONE_PT[zone]}`, 0);
    r.command.zones = zones;
    return r;
  }

  // N5 — POSIÇÃO + cor+acessório: idênticos na zona oposta = armadilha (só a posição discrimina).
  if (lv === 5) {
    const zone = shuffle(ZONES)[0]; const opp = OPP_ZONE[zone];
    const acc = pickAccFrom(accsWithMinColors(3));
    const col = pickColorFrom(colorsWithAcc(acc));
    const match = agentWith(col, acc)!;
    const targets = cloneAgents(match, 3);
    const trapOpp = cloneAgents(match, 2);                 // idênticos, mas na zona errada
    const sameColor = pickDistinctAgents(withoutAccessory(withUniformColor(characterAttributes, col), acc), 3);
    const sameAcc = pickDistinctAgents(withAccessory(characterAttributes, acc).filter(c => c.uniformColor !== col), 3);
    const zones: Record<string, Zone> = {};
    targets.forEach(t => { zones[t.id] = zone; });
    trapOpp.forEach(t => { zones[t.id] = opp; });
    const distract = cap([...trapOpp, ...sameColor, ...sameAcc], dN - targets.length);
    const r = mkResult(targets, distract, [], false, targets.length, "multiTarget", `Toque nos ${noun}s ${colorPl(col)} com ${ACC_PT[acc]} que estão ${ZONE_PT[zone]}`, 0);
    r.command.zones = zones;
    return r;
  }

  // N2 / N3 — cor + acessório (cópias) com distratores PARECIDOS
  const acc = pickAccFrom(accsWithMinColors(3));
  const col = pickColorFrom(colorsWithAcc(acc));
  const match = agentWith(col, acc)!;
  const targets = cloneAgents(match, 3);
  const sameColor = withoutAccessory(withUniformColor(characterAttributes, col), acc);
  const sameAcc = withAccessory(characterAttributes, acc).filter(c => c.uniformColor !== col);
  const unrelated = characterAttributes.filter(c => c.uniformColor !== col && !c.accessories.includes(acc));
  const nPar = lv >= 3 ? 4 : 3;
  let distract = [...pickDistinctAgents(sameColor, nPar), ...pickDistinctAgents(sameAcc, nPar)];
  const remaining = dN - targets.length - distract.length;
  if (remaining > 0) distract = [...distract, ...pickDistinctAgents(unrelated, lv >= 3 ? Math.min(remaining, 2) : remaining, new Set(distract.map(d => d.agentId)))];
  distract = cap(distract, dN - targets.length);
  return mkResult(targets, distract, [], false, targets.length, "multiTarget", `Toque nos ${noun}s ${colorPl(col)} com ${ACC_PT[acc]}`, 0);
}

function buildInibicao(lv: number, noun: string, dN: number): BuiltRound {
  const fill = (targets: CharacterAttributes[], forbidden: CharacterAttributes[], avoid: (c: CharacterAttributes) => boolean) => {
    const exclude = new Set([...targets, ...forbidden].map(c => c.agentId));
    const neutral = pickDistinctAgents(characterAttributes.filter(c => !avoid(c)), Math.max(0, dN - targets.length - forbidden.length), exclude);
    return mkResultWrap(targets, neutral, forbidden);
  };
  const mkResultWrap = (targets: CharacterAttributes[], neutral: CharacterAttributes[], forbidden: CharacterAttributes[], text?: string) =>
    mkResult(targets, neutral, forbidden, false, targets.length, "multiTarget", text ?? "", 0);

  // N1 — go/no-go por cor
  if (lv === 1) {
    const valid = shuffle(ALL_UNIFORM_COLORS).filter(c => distinctByColor(c, 3).length >= 2);
    const go = pickColorFrom(valid);
    const nogo = shuffle(valid.filter(c => c !== go))[0] ?? valid.find(c => c !== go) ?? valid[0];
    const targets = distinctByColor(go, 3), forbidden = distinctByColor(nogo, 3);
    const r = fill(targets, forbidden, c => c.uniformColor === go || c.uniformColor === nogo);
    r.command.text = `✅ Toque nos ${noun}s ${colorPl(go)}\n🚫 NÃO toque nos ${colorPl(nogo)}`;
    return r;
  }
  // N2 — alvo por ACESSÓRIO, proibido por COR (atributos diferentes)
  if (lv === 2) {
    const acc = pickAccFrom(accsWithMinColors(2));
    const nogoCol = shuffle(ALL_UNIFORM_COLORS)[0];
    const targets = distinctByAcc(acc, 3).filter(t => t.uniformColor !== nogoCol);
    const forbidden = distinctByColor(nogoCol, 3).filter(f => !f.accessories.includes(acc));
    const r = fill(targets, forbidden, c => c.accessories.includes(acc) || c.uniformColor === nogoCol);
    r.command.text = `✅ Toque nos ${noun}s com ${ACC_PT[acc]}\n🚫 NÃO toque nos ${colorPl(nogoCol)}`;
    return r;
  }
  // N3 — exceção: cor, EXCETO os com acessório
  if (lv === 3) {
    const acc = pickAccFrom(accsWithMinColors(2));
    const col = pickColorFrom(colorsWithAcc(acc));
    const targets = pickDistinctAgents(withoutAccessory(withUniformColor(characterAttributes, col), acc), 4);
    const forbidden = cloneAgents(agentWith(col, acc)!, 2);
    const r = fill(targets, forbidden, c => c.uniformColor === col);
    r.command.text = `✅ Toque nos ${noun}s ${colorPl(col)}\n🚫 menos os com ${ACC_PT[acc]}`;
    return r;
  }
  // N4 — alvo por ACESSÓRIO, EXCETO uma cor
  if (lv === 4) {
    const acc = shuffle(accsWithMinColors(3))[0];
    const excCol = shuffle(colorsWithAcc(acc))[0];
    const targets = distinctByAcc(acc, 4).filter(t => t.uniformColor !== excCol);
    const forbidden = cloneAgents(agentWith(excCol, acc)!, 2);
    const r = fill(targets, forbidden, c => c.accessories.includes(acc));
    r.command.text = `✅ Toque nos ${noun}s com ${ACC_PT[acc]}\n🚫 menos os ${colorPl(excCol)}`;
    return r;
  }
  // N5 — alvo + exceção + proibido
  const acc = shuffle(accsWithMinColors(3))[0];
  const colorsWith = colorsWithAcc(acc);
  const excCol = colorsWith[0];
  const forbCol = shuffle(ALL_UNIFORM_COLORS.filter(c => c !== excCol && !colorsWith.includes(c)))[0] ?? ALL_UNIFORM_COLORS.find(c => c !== excCol)!;
  const targets = distinctByAcc(acc, 4).filter(t => t.uniformColor !== excCol && t.uniformColor !== forbCol);
  const forbidden = [...cloneAgents(agentWith(excCol, acc)!, 1), ...distinctByColor(forbCol, 2)];
  const r = fill(targets, forbidden, c => c.accessories.includes(acc) || c.uniformColor === forbCol);
  r.command.text = `✅ Toque nos ${noun}s com ${ACC_PT[acc]}\n🚫 menos os ${colorPl(excCol)} · não toque nos ${colorPl(forbCol)}`;
  return r;
}

function buildCaptureAll(mode: FocusMode, level: number, theme: Theme): BuiltRound | null {
  const noun = NOUN[theme] ?? "agente";
  const lv = Math.max(1, Math.min(5, level));
  const dN = MODE_LEVEL_N[lv - 1][1];
  if (mode === "foco") return buildFoco(lv, noun, dN);
  if (mode === "inibicao") return buildInibicao(lv, noun, dN);
  return null;
}

// ── Fase C: Alternância e Desafio com TROCA REAL de critério ───────────────────
// Cada fase pode ser de um TIPO diferente (cor / acessório / cor+acessório /
// cor-exceto-acessório), em vez de só trocar de cor. Desafio acrescenta uma cor
// proibida constante. Os neutros nunca batem com nenhuma fase (não confundem).
type PhaseKind = "color" | "acc" | "combo" | "colorExceptAcc";

interface PhaseBuilt { text: string; targets: CharacterAttributes[]; claimColors: ColorName[]; claimAccs: AccessoryKey[]; }

function buildPhaseRule(kind: PhaseKind, noun: string, used: Set<string>): PhaseBuilt | null {
  const free = (pool: CharacterAttributes[]) => pool.filter(c => !used.has(c.agentId));
  if (kind === "color") {
    const col = shuffle(ALL_UNIFORM_COLORS).find(c => free(withUniformColor(characterAttributes, c)).length >= 2);
    if (!col) return null;
    const targets = pickDistinctAgents(withUniformColor(characterAttributes, col), 3, used);
    targets.forEach(t => used.add(t.agentId));
    return { text: `Toque nos ${noun}s ${colorPl(col)}`, targets, claimColors: [col], claimAccs: [] };
  }
  if (kind === "acc") {
    const acc = shuffle(ALL_ACCESSORIES).find(a => free(withAccessory(characterAttributes, a)).length >= 2);
    if (!acc) return null;
    const targets = pickDistinctAgents(withAccessory(characterAttributes, acc), 3, used);
    targets.forEach(t => used.add(t.agentId));
    return { text: `Toque nos ${noun}s com ${ACC_PT[acc]}`, targets, claimColors: [], claimAccs: [acc] };
  }
  if (kind === "combo") {
    const acc = shuffle(accsWithMinColors(2)).find(a => colorsWithAcc(a).some(c => !used.has(agentWith(c, a)!.agentId)));
    if (!acc) return null;
    const col = shuffle(colorsWithAcc(acc).filter(c => !used.has(agentWith(c, acc)!.agentId)))[0];
    const match = agentWith(col, acc)!;
    used.add(match.agentId);
    return { text: `Toque nos ${noun}s ${colorPl(col)} com ${ACC_PT[acc]}`, targets: cloneAgents(match, 3), claimColors: [col], claimAccs: [acc] };
  }
  // colorExceptAcc — toque na cor, menos os que usam o acessório
  const acc = shuffle(accsWithMinColors(2)).find(a => colorsWithAcc(a).some(c => free(withoutAccessory(withUniformColor(characterAttributes, c), a)).length >= 2));
  if (!acc) return null;
  const col = shuffle(colorsWithAcc(acc).filter(c => free(withoutAccessory(withUniformColor(characterAttributes, c), acc)).length >= 2))[0];
  const targets = pickDistinctAgents(withoutAccessory(withUniformColor(characterAttributes, col), acc), 3, used);
  targets.forEach(t => used.add(t.agentId));
  return { text: `Toque nos ${noun}s ${colorPl(col)}, menos os com ${ACC_PT[acc]}`, targets, claimColors: [col], claimAccs: [acc] };
}

function phaseSeq(mode: FocusMode, lv: number): PhaseKind[] {
  if (mode === "alternancia") {
    if (lv === 1) return ["color", "color"];
    if (lv === 2) return Math.random() < 0.5 ? ["color", "acc"] : ["acc", "color"];
    if (lv === 3) return shuffle<PhaseKind>(["color", "acc", "combo"]);
    if (lv === 4) return ["acc", "colorExceptAcc"];
    return ["color", "acc", "colorExceptAcc"];
  }
  // desafio
  if (lv === 1) return ["combo", "combo"];
  if (lv === 2) return ["combo", "acc"];
  if (lv === 3) return ["combo", "colorExceptAcc"];
  if (lv === 4) return ["acc", "combo", "colorExceptAcc"];
  return ["combo", "colorExceptAcc", "acc"];
}

// Regra CONDICIONAL (Fase H): a regra ativa é indicada pela cor da barra do topo.
// Ex.: barra AZUL → toque nos com fone; barra ROXA → toque nos com boné.
function buildConditional(mode: FocusMode, theme: Theme, dN: number): BuiltRound | null {
  const noun = NOUN[theme] ?? "agente";
  const isDesafio = mode === "desafio";
  const accs = shuffle(accsWithMinColors(2)).slice(0, 2);
  if (accs.length < 2) return null;
  const barColors = shuffle<ColorName>(["azul", "roxo", "verde", "vermelho", "laranja", "amarelo"]).slice(0, 2);
  const used = new Set<string>();
  const claimAccs = new Set(accs);
  const allTargets: CharacterAttributes[] = [];
  const phases: { text: string; targetIds: string[]; barColor: ColorName }[] = [];
  accs.forEach((acc, i) => {
    const targets = pickDistinctAgents(withAccessory(characterAttributes, acc), 3, used);
    targets.forEach(t => used.add(t.agentId));
    allTargets.push(...targets);
    phases.push({ text: `Barra ${COLOR_PT[barColors[i]].toUpperCase()}: toque nos ${noun}s com ${ACC_PT[acc]}`, targetIds: targets.map(t => t.id), barColor: barColors[i] });
  });
  let forbidden: CharacterAttributes[] = [];
  let forbidColor: ColorName | null = null;
  if (isDesafio) {
    forbidColor = shuffle(ALL_UNIFORM_COLORS).find(c => !barColors.includes(c) && pickDistinctAgents(withUniformColor(characterAttributes, c), 2, used).length >= 2) ?? null;
    if (forbidColor) { forbidden = pickDistinctAgents(withUniformColor(characterAttributes, forbidColor), 2, used); forbidden.forEach(t => used.add(t.agentId)); }
  }
  const neutral = pickDistinctAgents(
    characterAttributes.filter(c => !c.accessories.some(a => claimAccs.has(a)) && c.uniformColor !== forbidColor),
    Math.max(0, dN - allTargets.length - forbidden.length), used);
  const mapText = accs.map((acc, i) => `${COLOR_PT[barColors[i]].toUpperCase()} → ${ACC_PT[acc]}`).join("  ·  ");
  const command: GeneratedCommand = {
    text: `Siga a barra do topo:\n${mapText}${forbidColor ? `\n🚫 NUNCA toque nos ${colorPl(forbidColor)}` : ""}`,
    mode: "visual", difficulty: 0,
    targets: phases[0].targetIds, distractors: neutral.map(c => c.id), forbidden: forbidden.map(c => c.id),
    sequenced: false, requiredTargets: phases[0].targetIds.length, rule: { type: "sequence" },
    phases, conditional: true,
  };
  return { characters: shuffle([...allTargets, ...forbidden, ...neutral]), command };
}

// SEQUÊNCIA (Fase H): toque numa ORDEM específica (fone → boné → mochila).
function buildSequence(theme: Theme, dN: number): BuiltRound | null {
  const noun = NOUN[theme] ?? "agente";
  const accs = shuffle(accsWithMinColors(1)).slice(0, 3);
  if (accs.length < 3) return null;
  const used = new Set<string>();
  const targets = accs.map(acc => {
    const a = pickDistinctAgents(withAccessory(characterAttributes, acc), 1, used)[0];
    if (a) used.add(a.agentId);
    return a;
  }).filter(Boolean) as CharacterAttributes[];
  if (targets.length < 3) return null;
  const claimAccs = new Set(accs);
  const neutral = pickDistinctAgents(characterAttributes.filter(c => !c.accessories.some(a => claimAccs.has(a))), Math.max(0, dN - 3), used);
  const command: GeneratedCommand = {
    text: `Toque nesta ordem:\n${accs.map(a => ACC_PT[a]).join("  →  ")}`,
    mode: "visual", difficulty: 0,
    targets: targets.map(t => t.id), distractors: neutral.map(c => c.id), forbidden: [],
    sequenced: true, requiredTargets: 3, rule: { type: "sequence" },
  };
  return { characters: shuffle([...targets, ...neutral]), command };
}

function buildPhased(mode: FocusMode, level: number, theme: Theme): BuiltRound | null {
  const noun = NOUN[theme] ?? "agente";
  const lv = Math.max(1, Math.min(5, level));
  const dN = MODE_LEVEL_N[lv - 1][1];
  const isDesafio = mode === "desafio";

  // N5 (Alternância/Desafio) — regra condicional pela cor da barra.
  if (lv === 5) { const c = buildConditional(mode, theme, dN); if (c) return c; }
  // Desafio N3 — às vezes uma rodada de SEQUÊNCIA (toque na ordem).
  if (isDesafio && lv === 3 && Math.random() < 0.5) { const s = buildSequence(theme, dN); if (s) return s; }

  const used = new Set<string>();
  const allTargets: CharacterAttributes[] = [];
  const phases: { text: string; targetIds: string[] }[] = [];
  const claimColors = new Set<ColorName>();
  const claimAccs = new Set<AccessoryKey>();

  for (const kind of phaseSeq(mode, lv)) {
    const r = buildPhaseRule(kind, noun, used) ?? buildPhaseRule("color", noun, used);
    if (!r) return null;
    phases.push({ text: r.text, targetIds: r.targets.map(t => t.id) });
    allTargets.push(...r.targets);
    r.claimColors.forEach(c => claimColors.add(c));
    r.claimAccs.forEach(a => claimAccs.add(a));
  }

  // Cor proibida constante (Desafio N>=2)
  let forbidden: CharacterAttributes[] = [];
  let forbidColor: ColorName | null = null;
  if (isDesafio && lv >= 2) {
    forbidColor = shuffle(ALL_UNIFORM_COLORS).find(c => !claimColors.has(c) && pickDistinctAgents(withUniformColor(characterAttributes, c), 2, used).length >= 2) ?? null;
    if (forbidColor) {
      forbidden = pickDistinctAgents(withUniformColor(characterAttributes, forbidColor), 2, used);
      forbidden.forEach(t => used.add(t.agentId));
      claimColors.add(forbidColor);
      phases[0] = { ...phases[0], text: `${phases[0].text}\n🚫 NUNCA toque nos ${colorPl(forbidColor)}` };
    }
  }

  // Neutros: NÃO batem com nenhuma fase (sem cor/acessório reivindicados).
  const neutral = pickDistinctAgents(
    characterAttributes.filter(c => !claimColors.has(c.uniformColor) && !c.accessories.some(a => claimAccs.has(a))),
    Math.max(0, dN - allTargets.length - forbidden.length),
    used,
  );

  const command: GeneratedCommand = {
    text: phases[0].text,
    mode: "visual", difficulty: 0,
    targets: phases[0].targetIds,
    distractors: neutral.map(c => c.id),
    forbidden: forbidden.map(c => c.id),
    sequenced: false,
    requiredTargets: phases[0].targetIds.length,
    rule: { type: "sequence" },
    phases,
  };
  return { characters: shuffle([...allTargets, ...forbidden, ...neutral]), command };
}

/**
 * Gera uma rodada para um MODO e NÍVEL fixos (escolhidos pelo terapeuta), em vez
 * da dificuldade adaptativa aleatória de `buildRound`. Reaproveita toda a lógica
 * de geração existente (`resolve`/`fillToN`), apenas restringindo a categoria de
 * comando ao modo e escalando pelo nível.
 *
 * @param mode   Modo cognitivo (foco/inibicao/alternancia/desafio)
 * @param level  Nível 1–5
 * @param theme  Tema visual
 * @param recentVerbs Índices de verbos usados recentemente (evita repetição)
 */
// Desbloqueios pós-N5 (níveis 6-9, independem do modo):
// 6 = atenção com exceção · 7 = capturar na ordem (sequência) · 8 = duas regras (condicional) · 9 = ignorar distração.
function buildUnlock(lv: number, theme: Theme): BuiltRound {
  const noun = NOUN[theme] ?? "agente";
  const dN = MODE_LEVEL_N[4][1];
  if (lv === 7) { const s = buildSequence(theme, dN); if (s) return s; }
  if (lv === 8) { const c = buildConditional("desafio", theme, dN); if (c) return c; }
  return buildInibicao(lv === 9 ? 4 : 5, noun, dN);   // exceção/proibido (9 = piscam, aplicado no componente)
}

// ── FOCO: ladder cognitivo 1–7 (redesign) ──────────────────────────────────────
// Modelo "capturar TODOS os que batem a regra" (go/no-go): a cena é montada aqui,
// então todo agente que bate a regra É alvo — nunca há ambiguidade. A dificuldade
// vem de: nº de critérios, semelhança dos distratores (near-miss), quantidade,
// velocidade, EXCLUSÃO (D5) e DOIS grupos-alvo (D6). NÃO usa regra espacial.
// Objetos entram a partir de D2; símbolos só a partir de D4.
type FCritKind = "color" | "acc" | "object" | "symbol";
interface FCrit { k: FCritKind; v: string }
const FOBJ_PT: Record<string, string> = { bola: "bola de futebol", skate: "skate", basquete: "bola de basquete" };
const FSYM_PT: Record<string, string> = { estrela: "estrela", circulo: "círculo", triangulo: "triângulo", raio: "raio" };
const F_OBJECTS = ["bola", "skate", "basquete"];
const F_SYMBOLS = ["estrela", "circulo", "triangulo", "raio"];

function fMatch(a: CharacterAttributes, c: FCrit): boolean {
  if (c.k === "color")  return a.uniformColor === (c.v as ColorName);
  if (c.k === "acc")    return a.accessories.includes(c.v as AccessoryKey);
  if (c.k === "object") return (a.object ?? "none") === (c.v as ObjectKey);
  return (a.symbol ?? "none") === (c.v as SymbolKey);
}
const fMatchAll   = (a: CharacterAttributes, cs: FCrit[]) => cs.every(c => fMatch(a, c));
const fMatchCount = (a: CharacterAttributes, cs: FCrit[]) => cs.reduce((n, c) => n + (fMatch(a, c) ? 1 : 0), 0);
const fRint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const fPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function fCritNoun(c: FCrit): string {
  if (c.k === "acc")    return ACC_PT[c.v as AccessoryKey];
  if (c.k === "object") return FOBJ_PT[c.v];
  return FSYM_PT[c.v];
}
function fRulePhrase(noun: string, crits: FCrit[], withNoun: boolean): string {
  const color = crits.find(c => c.k === "color");
  const others = crits.filter(c => c.k !== "color");
  let s = withNoun ? `${noun}s` : "";
  if (color) s += `${s ? " " : ""}${colorPl(color.v as ColorName)}`;
  if (others.length) s += `${s ? " " : ""}com ${others.map(fCritNoun).join(" e ")}`;
  return s.trim();
}
function fExcludeShort(c: FCrit): string {
  if (c.k === "color")  return colorPl(c.v as ColorName);
  return `com ${fCritNoun(c)}`;
}

// PILOTO Foco (endurecimento — velocidade de processamento + atenção seletiva):
// ── `targets`: nº EXATO de alvos verdadeiros por nível — sobe com o nível para
//    forçar varredura de vários itens (2→2→3→3→4→4→5). Nunca 1 só alvo.
// ── `near`: fração dos NÃO-alvos que são "confusáveis" (compartilham exatamente
//    UM atributo com a regra — mesma cor sem o acessório, ou o acessório em outra
//    cor). ≥0,50 a partir do N2 para exigir checar TODOS os atributos, não só um.
// ── `chars`: tamanho da multidão (mantido cheio, faixa ~12–26, alinhado ao
//    displayN 16–28 dos outros modos) — só a COMPOSIÇÃO muda, não o volume.
// Todos os números abaixo são CALIBRÁVEIS após teste clínico.
interface FocoCfg { chars: [number, number]; targets: [number, number]; near: number }
// Recalibração de elite: multidão mais densa, mais alvos (com variabilidade real
// nos ranges), distratores ainda mais parecidos (near ≥0,65 já no N1).
const FOCO_CFG: Record<number, FocoCfg> = {
  1: { chars: [14, 16], targets: [2, 3], near: 0.65 },
  2: { chars: [16, 18], targets: [3, 3], near: 0.70 },
  3: { chars: [18, 21], targets: [3, 4], near: 0.75 },
  4: { chars: [21, 24], targets: [4, 4], near: 0.78 },
  5: { chars: [24, 27], targets: [4, 5], near: 0.80 },
  6: { chars: [26, 29], targets: [5, 5], near: 0.82 },
  7: { chars: [28, 31], targets: [5, 6], near: 0.85 },
};

// Cores VIZINHAS/parecidas (para o N1, de 1 atributo, os distratores de cor não
// serem triviais — obrigam discriminação fina). Calibrável após teste clínico.
const FOCO_NEAR_COLORS: Partial<Record<ColorName, ColorName[]>> = {
  azul:     ["roxo", "verde"],
  verde:    ["azul", "amarelo"],
  roxo:     ["azul", "vermelho"],
  laranja:  ["vermelho", "amarelo"],
  vermelho: ["laranja", "roxo"],
  amarelo:  ["laranja", "verde"],
};

// Tira `n` agentes distintos (por agentId) do pool; clona se faltar. IDs únicos.
function fTake(pool: CharacterAttributes[], n: number, used: Set<string>): CharacterAttributes[] {
  const picked: CharacterAttributes[] = [];
  for (const c of shuffle(pool)) {
    if (picked.length >= n) break;
    if (used.has(c.agentId)) continue;
    used.add(c.agentId); picked.push(c);
  }
  const baseLen = picked.length;
  let i = 0;
  while (picked.length < n && baseLen > 0) { picked.push(picked[i % baseLen]); i++; }
  return picked.slice(0, n).map(c => ({ ...c, id: `${c.id}__k${_cloneSeq++}` }));
}

interface FocoRule { crits: FCrit[]; exclude?: FCrit; groupB?: FCrit[] }

// noSymbols=true (usado pela CHUVA de agentes do Foco): NUNCA gera critério de
// símbolo (estrela/círculo/…) — os emblemas não leem bem em agentes pequenos e em
// queda. Restringe as dimensões a COR + ACESSÓRIO + OBJETO. Também restringe o
// pool de satisfação aos agentes SEM símbolo, para casar com o pool da cena.
function fChooseRule(dd: number, noSymbols = false): FocoRule {
  const R = noSymbols
    ? allCharacterAttributes.filter(a => (a.symbol ?? "none") === "none")
    : allCharacterAttributes;
  const poolFor = (cs: FCrit[]) => R.filter(a => fMatchAll(a, cs));
  const color = (): FCrit => ({ k: "color",  v: fPick([...ALL_UNIFORM_COLORS]) });
  const acc   = (): FCrit => ({ k: "acc",    v: fPick([...ALL_ACCESSORIES]) });
  const obj   = (): FCrit => ({ k: "object", v: fPick(F_OBJECTS) });
  // Terceiro atributo (D4): símbolo no modo arena; objeto na chuva (sem símbolo).
  const third = (): FCrit => (noSymbols ? obj() : ({ k: "symbol", v: fPick(F_SYMBOLS) }));
  const trySat = (mk: () => FCrit[], tries = 40): FCrit[] | null => {
    for (let i = 0; i < tries; i++) { const cs = mk(); if (poolFor(cs).length >= 1) return cs; }
    return null;
  };

  if (dd === 1) return { crits: Math.random() < 0.5 ? [color()] : [acc()] };
  if (dd === 2 || dd === 3)
    return { crits: trySat(() => [color(), Math.random() < 0.5 ? acc() : obj()]) ?? [color(), acc()] };
  if (dd === 4) {
    const cs = Math.random() < 0.5
      ? trySat(() => [color(), acc(), third()])
      : trySat(() => [color(), { k: "acc", v: "bone" }, obj()]);
    return { crits: cs ?? trySat(() => [color(), acc(), third()]) ?? [color(), acc()] };
  }
  if (dd === 5) {
    for (let i = 0; i < 50; i++) {
      const base: FCrit[] = Math.random() < 0.5 ? [acc()] : [color()];
      if (!noSymbols && Math.random() < 0.3) base.push(third());
      const excl: FCrit = Math.random() < 0.5 ? color() : acc();
      if (base.some(b => b.k === excl.k && b.v === excl.v)) continue;
      const bp = poolFor(base);
      if (bp.some(a => !fMatch(a, excl)) && bp.some(a => fMatch(a, excl))) return { crits: base, exclude: excl };
    }
    return { crits: [{ k: "acc", v: "bone" }], exclude: color() };
  }
  // dd === 6 — dois grupos distintos
  for (let i = 0; i < 50; i++) {
    const A = trySat(() => [color(), Math.random() < 0.5 ? acc() : obj()]);
    const B = trySat(() => [color(), Math.random() < 0.5 ? acc() : obj()]);
    if (A && B && fRulePhrase("x", A, false) !== fRulePhrase("x", B, false)) return { crits: A, groupB: B };
  }
  return { crits: [color()], groupB: [color()] };
}

// noSymbols=true ⇒ CHUVA de agentes do Foco: cena e regra só com COR+ACESSÓRIO+
// OBJETO (sem emblemas de símbolo, ilegíveis pequenos/em queda).
function buildFocoLadder(difficulty: number, theme: Theme, noSymbols = false): BuiltRound {
  const noun = NOUN[theme] ?? "agente";
  const d = Math.max(1, Math.min(7, Math.round(difficulty)));
  const cfg = FOCO_CFG[d];
  const R = noSymbols
    ? allCharacterAttributes.filter(a => (a.symbol ?? "none") === "none")
    : allCharacterAttributes;
  const poolFor = (cs: FCrit[]) => R.filter(a => fMatchAll(a, cs));

  const memory = d === 7;
  const rule = fChooseRule(d === 7 ? fPick([5, 6]) : d, noSymbols);
  const used = new Set<string>();
  const charCount = fRint(cfg.chars[0], cfg.chars[1]);
  const targetCount = fRint(cfg.targets[0], cfg.targets[1]);
  const excl = rule.exclude;

  // Alvos (grupo A, e B se houver)
  const aPool = poolFor(rule.crits).filter(a => !excl || !fMatch(a, excl));
  const aCount = rule.groupB ? Math.ceil(targetCount / 2) : targetCount;
  const targetsA = fTake(aPool, Math.max(1, aCount), used);
  let targetsB: CharacterAttributes[] = [];
  if (rule.groupB) targetsB = fTake(poolFor(rule.groupB), Math.max(1, Math.floor(targetCount / 2)), used);
  const targets = [...targetsA, ...targetsB];

  // Proibidos (exclusão) — ~30% da cena de interferência (os "quase certos" que
  // batem a base mas caem na exceção). É o que treina o controle inibitório.
  let forbidden: CharacterAttributes[] = [];
  if (excl) {
    const fbWant = Math.min(Math.max(2, Math.round(charCount * 0.3)), Math.max(2, charCount - targets.length - 2));
    forbidden = fTake(poolFor(rule.crits).filter(a => fMatch(a, excl)), fbWant, used);
  }

  // Distratores: NÃO batem a regra (nem A nem B) e não são proibidos; near-miss priorizado
  const groups = rule.groupB ? [rule.crits, rule.groupB] : [rule.crits];
  const isTargetLike = (a: CharacterAttributes) => groups.some(cs => fMatchAll(a, cs) && (!excl || !fMatch(a, excl)));
  const isForbidLike = (a: CharacterAttributes) => !!excl && fMatchAll(a, rule.crits) && fMatch(a, excl);
  const nonMatch = R.filter(a => !isTargetLike(a) && !isForbidLike(a));
  // "Confusável": compartilha EXATAMENTE UM atributo com um grupo-alvo (força
  // checar TODOS os atributos, não só um). Para regra de 1 atributo:
  //  · cor  → distrator de cor VIZINHA (discriminação de cor não-trivial);
  //  · acc/objeto/símbolo → distrator que tem a MESMA cor de algum alvo (o
  //    outro eixo bate, o atributo pedido não) — evita o "1 alvo óbvio".
  const targetColors = new Set(targets.map(t => t.uniformColor));
  const isNear = (a: CharacterAttributes) =>
    groups.some(cs => {
      if (cs.length >= 2) return fMatchCount(a, cs) === cs.length - 1;   // multi-crit: bate todos menos um
      const c = cs[0];
      if (c.k === "color") {
        const neighbors = FOCO_NEAR_COLORS[c.v as ColorName] ?? [];
        return neighbors.includes(a.uniformColor);
      }
      // crit único não-cor: mesma cor de um alvo, mas sem o atributo pedido
      return targetColors.has(a.uniformColor);
    });
  const nearPool = nonMatch.filter(isNear);
  const farPool  = nonMatch.filter(a => !isNear(a));
  const slots = Math.max(0, charCount - targets.length - forbidden.length);
  const nNear = Math.min(slots, Math.round(slots * cfg.near));
  const nFar  = slots - nNear;
  let distractors = [
    ...fTake(nearPool.length ? nearPool : farPool, nNear, used),
    ...fTake(farPool.length ? farPool : nearPool, nFar, used),
  ];
  if (distractors.length < slots) distractors = [...distractors, ...fTake(nonMatch, slots - distractors.length, used)];
  distractors = distractors.slice(0, slots);

  // Texto do comando
  let text: string;
  if (excl) text = `Toque nos ${fRulePhrase(noun, rule.crits, true)}, exceto os ${fExcludeShort(excl)}`;
  else if (rule.groupB) text = `Toque nos ${fRulePhrase(noun, rule.crits, true)} e nos ${fRulePhrase(noun, rule.groupB, false)}`;
  else text = `Toque nos ${fRulePhrase(noun, rule.crits, true)}`;

  // Codifica a regra REAL em requiredAttributes ("kind:value") para métricas e
  // inspeção (probe). groupB entra com prefixo "b:"; a exclusão vai em excludedAttributes.
  const critStr = (c: FCrit) => `${c.k}:${c.v}`;
  const requiredAttributes = [
    ...rule.crits.map(critStr),
    ...(rule.groupB ? rule.groupB.map(c => `b:${critStr(c)}`) : []),
  ];
  const excludedAttributes = excl ? [critStr(excl)] : undefined;

  const characters = shuffle([...targets, ...forbidden, ...distractors]);
  const command: GeneratedCommand = {
    text, mode: "visual", difficulty: d, ladder: d, memory,
    targets: targets.map(t => t.id),
    distractors: distractors.map(t => t.id),
    forbidden: forbidden.map(t => t.id),
    sequenced: false, requiredTargets: targets.length,
    rule: { type: "multiTarget", requiredAttributes, excludedAttributes }, verbIndex: 0,
  };
  return { characters, command };
}

function buildModeRoundOnce(
  mode: FocusMode,
  level: number,
  theme: Theme,
  recentVerbs: number[] = [],
  noSymbols = false,
): BuiltRound {
  const lvRaw = Math.max(1, Math.min(9, Math.round(level)));
  // Foco usa o ladder cognitivo 1–7 (não os desbloqueios/templates antigos).
  if (mode === "foco") return buildFocoLadder(lvRaw, theme, noSymbols);
  if (lvRaw >= 6) return buildUnlock(lvRaw, theme);   // desbloqueios pós-N5
  const lv   = lvRaw;
  const diff = MODE_LEVEL_DIFF[mode][lv - 1];
  const [n, dN] = MODE_LEVEL_N[lv - 1];

  // Inibição usa "capturar todos da regra" (go/no-go). (Foco já retornou acima
  // pelo ladder cognitivo.) A cena já vem completa — sem fillToN para não repetir.
  if (mode === "inibicao") {
    const all = buildCaptureAll(mode, lv, theme);
    if (all) return all;
  }
  // Alternância e Desafio: rodada com troca de regra (fases).
  if (mode === "alternancia" || mode === "desafio") {
    const ph = buildPhased(mode, lv, theme);
    if (ph) return ph;
  }

  const levelTemplates = COMMAND_TEMPLATES.filter(
    t => t.difficulty === diff && !SUBTLE_FORMATS.has(t.formatType),
  );
  const recentSet = new Set(recentVerbs.slice(-3));
  const ordered = [
    ...shuffle(levelTemplates.filter(t => !recentSet.has(t.verbIndex))),
    ...shuffle(levelTemplates.filter(t => recentSet.has(t.verbIndex))),
  ];

  for (const tmpl of ordered) {
    const result = resolve(tmpl, characterAttributes, n, theme);
    if (result) return fillToN(result, dN);
  }

  // Fallback: tenta as outras dificuldades do MESMO modo (mantém a categoria).
  for (const fb of MODE_LEVEL_DIFF[mode]) {
    if (fb === diff) continue;
    const fbTemplates = shuffle(
      COMMAND_TEMPLATES.filter(t => t.difficulty === fb && !SUBTLE_FORMATS.has(t.formatType)),
    );
    for (const tmpl of fbTemplates) {
      const result = resolve(tmpl, characterAttributes, n, theme);
      if (result) return fillToN(result, dN);
    }
  }

  return fillToN(colorFallback(n, theme), dN);
}

// Assinatura da REGRA de uma rodada (determinística). Inclui as fases
// (Alternância/Desafio mudam a regra durante a rodada), pra duas rodadas só
// "iguais" se a regra inteira for igual.
export function roundSignature(b: BuiltRound): string {
  const phases = b.command.phases?.map(p => p.text).join(">") ?? "";
  return `${b.command.text}¦${phases}`;
}

// Wrapper: evita REPETIR a mesma REGRA nas rodadas recentes da sessão. Tenta
// gerar várias vezes até achar uma regra inédita (na janela recente); se o
// repertório do nível for pequeno, usa a última gerada.
export function buildModeRound(
  mode: FocusMode,
  level: number,
  theme: Theme,
  recentVerbs: number[] = [],
  recentSigs: string[] = [],
  noSymbols = false,
): BuiltRound {
  const recent = new Set(recentSigs);
  let last: BuiltRound | null = null;
  for (let i = 0; i < 24; i++) {
    const r = buildModeRoundOnce(mode, level, theme, recentVerbs, noSymbols);
    last = r;
    if (!recent.has(roundSignature(r))) return r;
  }
  return last as BuiltRound;
}
