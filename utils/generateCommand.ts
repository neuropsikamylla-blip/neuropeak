import type { Theme } from "@/types";
import type {
  CharacterAttributes,
  AccessoryKey,
  ColorName,
  GeneratedCommand,
  CommandGeneratorParams,
  BuiltRound,
  CommandRuleType,
} from "@/types/commands";
import { characterAttributes } from "@/data/agentAttributes";
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

function randomAcc(pool: CharacterAttributes[]): AccessoryKey | null {
  const available = ALL_ACCESSORIES.filter(a => withAccessory(pool, a).length > 0);
  return available.length ? shuffle(available)[0] : null;
}

function randomColor(pool: CharacterAttributes[]): ColorName | null {
  const available = ALL_UNIFORM_COLORS.filter(c => pool.some(ch => ch.uniformColor === c));
  return available.length ? shuffle(available)[0] : null;
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
        `Toque em qualquer ${noun}, exceto no que usa ${ACC_PT[acc]}`, vi);
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
        `Selecione qualquer ${noun} sem ${ACC_PT[acc]}`,
        `Ache um ${noun} diferente do que usa ${ACC_PT[acc]}`,
        `Marque qualquer ${noun} que não usa ${ACC_PT[acc]}`,
        `Localize um ${noun} sem ${ACC_PT[acc]}`,
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
      text: `Ache o ${noun} ${COLOR_PT[target.uniformColor]}`,
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

/**
 * Gera um comando para personagens já visíveis na tela (API externa).
 * Retorna null se nenhum template for compatível com os personagens visíveis.
 */
export function generateCommand(params: CommandGeneratorParams): GeneratedCommand | null {
  const { visibleCharacters, mode, difficulty, previousCommands, theme = "CLINICAL" } = params;
  const recentVerbs = previousCommands
    .map(c => c.verbIndex ?? -1)
    .filter(v => v >= 0);

  const level = pickLevel(difficulty);
  const templates = COMMAND_TEMPLATES.filter(t => t.difficulty === level);

  for (const tmpl of shuffle(templates)) {
    const result = resolve(tmpl, visibleCharacters, visibleCharacters.length, theme);
    if (result) return { ...result.command, mode, difficulty };
  }
  return null;
}
