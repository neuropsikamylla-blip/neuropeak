import type { ProtocolName } from "./types";

/** Conversão explícita de uma dose legada armazenada em `settings.trials`. */
export function convertLegacyDose(
  settings: Readonly<Record<string, unknown>>,
  protocol: ProtocolName,
): Record<string, unknown> {
  const converted: Record<string, unknown> = { ...settings, protocol };
  delete converted.trials;
  return converted;
}
