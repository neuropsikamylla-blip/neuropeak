import type { ProgressionResult } from "@/lib/adaptive";

export interface StableProgressionInput {
  /** Acurácia da sessão que acabou. */
  accAtual: number;
  /** Sessões anteriores, da mais recente para a mais antiga (no máximo 3). */
  accsAnteriores: number[];
  /** Maior nível já executado com acurácia maior ou igual a 80%. */
  consolidado: number;
}

/**
 * Calcula a progressão entre sessões usando memória de curto prazo.
 *
 * Duas sessões consecutivas na mesma faixa são necessárias para mover o nível.
 * Uma queda abaixo do nível consolidado exige três sessões ruins consecutivas.
 */
export function calculateStableProgression(
  currentLevel: number,
  m: StableProgressionInput,
  maxLevel: number = 10,
): ProgressionResult {
  const teto = Math.max(1, Math.round(maxLevel));
  const lvl = Math.min(teto, Math.max(1, Math.round(currentLevel)));
  const anterior = m.accsAnteriores[0];
  const pct = (value: number) => Math.round(value * 100);

  let consolidatedLevel = m.accAtual >= 0.80
    ? Math.max(m.consolidado, lvl)
    : m.consolidado;

  if (anterior === undefined) {
    return {
      nextLevel: lvl,
      action: "maintain",
      consolidatedLevel,
      reason: "Primeira sessão do exercício — mantém o nível até haver histórico.",
    };
  }

  let proposedLevel = lvl;
  let decision: "increase" | "maintain" | "decrease" = "maintain";
  let reason = `Mantém o nível (${pct(m.accAtual)}% agora; ${pct(anterior)}% antes).`;

  if (m.accAtual < 0.45 && anterior < 0.45) {
    proposedLevel = Math.max(1, lvl - 2);
    decision = "decrease";
    reason = "Duas sessões muito ruins consecutivas — reduz 2 níveis.";
  } else if (m.accAtual < 0.65 && anterior < 0.65) {
    proposedLevel = Math.max(1, lvl - 1);
    decision = "decrease";
    reason = "Duas sessões ruins consecutivas — reduz 1 nível.";
  } else if (m.accAtual >= 0.85 && anterior >= 0.85 && lvl < teto) {
    proposedLevel = Math.min(teto, lvl + 1);
    decision = "increase";
    reason = "Duas sessões boas consecutivas — sobe 1 nível.";
  }

  if (decision === "decrease" && proposedLevel < consolidatedLevel) {
    const tresRuins = m.accAtual < 0.65
      && anterior < 0.65
      && m.accsAnteriores[1] !== undefined
      && m.accsAnteriores[1] < 0.65;

    proposedLevel = Math.min(
      lvl,
      tresRuins ? Math.max(1, consolidatedLevel - 1) : consolidatedLevel,
    );
    reason = tresRuins
      ? "Três sessões ruins consecutivas — permite descer até 1 nível abaixo do consolidado."
      : "O nível consolidado protege contra queda baseada em apenas duas sessões.";

    // ⚠️ CONSERTO DO VP, 23/set: a proteção original TRAVAVA a descida. Com o consolidado fixo,
    // um paciente com SEIS sessões ruins seguidas parava um nível abaixo do melhor que já fez e
    // não descia mais — medido na simulação (8→8→8→7→7→7→7). Isso está clinicamente errado:
    // perda real de habilidade (quadro, medicação, evolução) precisa poder baixar o patamar.
    // Quando o desempenho ruim se confirma em três sessões, o consolidado deixou de descrever a
    // capacidade atual e cede junto — a proteção existe contra RUÍDO, não contra piora real.
    if (tresRuins) consolidatedLevel = Math.min(consolidatedLevel, proposedLevel);
  }

  const nextLevel = Math.min(teto, Math.max(1, proposedLevel));
  const action = nextLevel > lvl
    ? "increase"
    : nextLevel < lvl
      ? "decrease"
      : "maintain";

  return { nextLevel, action, consolidatedLevel, reason };
}
