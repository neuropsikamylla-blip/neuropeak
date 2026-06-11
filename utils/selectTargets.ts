import type { CharacterAttributes, AccessoryKey, ColorName } from "@/types/commands";

/** Embaralha um array (não muta o original) */
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Filtra personagens que possuem um acessório específico */
export function withAccessory(
  chars: CharacterAttributes[],
  acc: AccessoryKey,
): CharacterAttributes[] {
  return chars.filter(c => c.accessories.includes(acc));
}

/** Filtra personagens que NÃO possuem um acessório específico */
export function withoutAccessory(
  chars: CharacterAttributes[],
  acc: AccessoryKey,
): CharacterAttributes[] {
  return chars.filter(c => !c.accessories.includes(acc));
}

/** Filtra personagens que possuem TODOS os acessórios informados */
export function withAllAccessories(
  chars: CharacterAttributes[],
  accs: AccessoryKey[],
): CharacterAttributes[] {
  return chars.filter(c => accs.every(a => c.accessories.includes(a)));
}

/** Filtra personagens que NÃO possuem NENHUM dos acessórios informados */
export function withoutAnyAccessory(
  chars: CharacterAttributes[],
  accs: AccessoryKey[],
): CharacterAttributes[] {
  return chars.filter(c => !accs.some(a => c.accessories.includes(a)));
}

/** Filtra por cor de uniforme */
export function withUniformColor(
  chars: CharacterAttributes[],
  color: ColorName,
): CharacterAttributes[] {
  return chars.filter(c => c.uniformColor === color);
}

/** Filtra por cor de cabelo */
export function withHairColor(
  chars: CharacterAttributes[],
  color: ColorName,
): CharacterAttributes[] {
  return chars.filter(c => c.hairColor === color);
}

/** Filtra por cor de acessório específico */
export function withAccessoryColor(
  chars: CharacterAttributes[],
  acc: AccessoryKey,
  color: ColorName,
): CharacterAttributes[] {
  return chars.filter(c =>
    c.accessories.includes(acc) && c.accessoryColors?.[acc] === color,
  );
}

/**
 * Retorna até `count` personagens de agentes DISTINTOS.
 * `excludeAgents` evita repetir agentes já escolhidos.
 */
export function pickDistinctAgents(
  pool: CharacterAttributes[],
  count: number,
  excludeAgentIds: Set<string> = new Set(),
): CharacterAttributes[] {
  const used = new Set(excludeAgentIds);
  const result: CharacterAttributes[] = [];
  for (const c of shuffle(pool)) {
    if (!used.has(c.agentId)) {
      used.add(c.agentId);
      result.push(c);
      if (result.length >= count) break;
    }
  }
  return result;
}

/**
 * Escolhe N personagens únicos (por agentId) para preencher uma rodada.
 * Mistura alvos e distratores, assegurando que `targets` e `forbidden`
 * já estejam incluídos e que o total não ultrapasse `n`.
 */
export function buildVisibleSet(
  targets: CharacterAttributes[],
  forbidden: CharacterAttributes[],
  allChars: CharacterAttributes[],
  n: number,
): CharacterAttributes[] {
  const fixed = [...targets, ...forbidden];
  const usedAgents = new Set(fixed.map(c => c.agentId));
  const needed = n - fixed.length;
  const distractors = pickDistinctAgents(
    allChars.filter(c => !usedAgents.has(c.agentId)),
    needed,
    usedAgents,
  );
  return shuffle([...fixed, ...distractors]);
}

/** Cores de uniforme usadas em comandos (exclui cinza/rosa — só aparecem nos robôs sem acessórios) */
export const ALL_UNIFORM_COLORS: ColorName[] = [
  "azul", "verde", "roxo", "laranja", "vermelho", "amarelo",
];

/** Acessórios disponíveis nos 36 agentes padronizados (cada um tem pelo menos 1 portador). */
export const ALL_ACCESSORIES: AccessoryKey[] = [
  "fone", "oculos", "bone", "mochila", "raquete", "skate",
];
