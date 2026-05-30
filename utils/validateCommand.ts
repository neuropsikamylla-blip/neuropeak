import type { CharacterAttributes, AccessoryKey, ColorName, GeneratedCommand } from "@/types/commands";
import { withAccessory, withAllAccessories, withoutAccessory, withAccessoryColor, withUniformColor, withHairColor } from "@/utils/selectTargets";

/** Verifica se existe pelo menos 1 personagem com o acessório dado */
export function hasAcc(chars: CharacterAttributes[], acc: AccessoryKey): boolean {
  return withAccessory(chars, acc).length > 0;
}

/** Verifica se existem 2+ personagens de agentes distintos com o acessório */
export function hasTwoDistinctWithAcc(
  chars: CharacterAttributes[],
  acc: AccessoryKey,
): boolean {
  const agents = new Set(withAccessory(chars, acc).map(c => c.agentId));
  return agents.size >= 2;
}

/** Verifica se existe 1 personagem com acc1 E outro de agente distinto com acc2 */
export function hasDistinctPair(
  chars: CharacterAttributes[],
  acc1: AccessoryKey,
  acc2: AccessoryKey,
): boolean {
  const pool1 = withAccessory(chars, acc1);
  const pool2 = withAccessory(chars, acc2);
  for (const c1 of pool1) {
    if (pool2.some(c2 => c2.agentId !== c1.agentId)) return true;
  }
  return false;
}

/** Verifica se há 1 personagem com acc1 (sem acc2) e 1 personagem com acc2 (sem acc1), de agentes distintos */
export function hasContrastPair(
  chars: CharacterAttributes[],
  acc1: AccessoryKey,
  acc2: AccessoryKey,
): boolean {
  const withAcc1Only = withAccessory(chars, acc1).filter(c => !c.accessories.includes(acc2));
  const withAcc2Only = withAccessory(chars, acc2).filter(c => !c.accessories.includes(acc1));
  for (const c1 of withAcc1Only) {
    if (withAcc2Only.some(c2 => c2.agentId !== c1.agentId)) return true;
  }
  return false;
}

/** Verifica se existe personagem com TODOS os acessórios simultaneamente */
export function hasComboChar(
  chars: CharacterAttributes[],
  accs: AccessoryKey[],
): boolean {
  return withAllAccessories(chars, accs).length > 0;
}

/** Verifica se há personagens suficientes para um comando negativo (>= 2 sem o acessório) */
export function hasNegativeSetup(
  chars: CharacterAttributes[],
  forbiddenAcc: AccessoryKey,
): boolean {
  const forbidden = withAccessory(chars, forbiddenAcc);
  const valid = withoutAccessory(chars, forbiddenAcc);
  return forbidden.length >= 1 && valid.length >= 2;
}

/** Verifica se há personagem com cor de acessório específica */
export function hasAccColor(
  chars: CharacterAttributes[],
  acc: AccessoryKey,
  color: ColorName,
): boolean {
  return withAccessoryColor(chars, acc, color).length > 0;
}

/** Verifica se há duas cores de uniforme distintas (para contraste de cor) */
export function hasColorContrast(chars: CharacterAttributes[]): boolean {
  const colors = new Set(chars.map(c => c.uniformColor));
  return colors.size >= 2;
}

/** Verifica se há personagens com cor de cabelo */
export function hasHairColor(chars: CharacterAttributes[], color: ColorName): boolean {
  return withHairColor(chars, color).length > 0;
}

/** Verifica se um personagem com uniformColor + acc existe */
export function hasUniformAcc(
  chars: CharacterAttributes[],
  color: ColorName,
  acc: AccessoryKey,
): boolean {
  return withUniformColor(chars, color).filter(c => c.accessories.includes(acc)).length > 0;
}

/** Valida que um GeneratedCommand é coerente: targets ∩ forbidden = ∅ */
export function validateCommand(cmd: GeneratedCommand): boolean {
  const forbidden = new Set(cmd.forbidden);
  if (cmd.targets.some(id => forbidden.has(id))) return false;
  if (cmd.targets.length === 0) return false;
  if (cmd.requiredTargets < 1) return false;
  if (cmd.requiredTargets > cmd.targets.length) return false;
  return true;
}
