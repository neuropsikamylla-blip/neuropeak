// ─────────────────────────────────────────────────────────────────────────────
// Motor adaptativo POR TENTATIVA — épico de padronização Cogmed
// (COGMED-PADRONIZACAO-PROPOSTA.md, decisões da Kamylla em 15/jul/2026).
//
// Regra (princípio operacional do método, não conteúdo proprietário):
//   • tentativa CORRETA        → nível +1 já na próxima tentativa;
//   • erro LEVE  (exatamente 1 item errado, OU troca de ordem de 2 itens
//     adjacentes, OU omissão de 1 item no final com o resto certo) → mantém;
//   • erro GRAVE (qualquer outra divergência)                     → nível −1.
//
// O objetivo clínico é treinar na BORDA da capacidade: erros são esperados no
// nível ideal. Usado pelos exercícios de memória operacional (span numérico,
// letras, Corsi, matriz espacial, sequência de itens).
// ─────────────────────────────────────────────────────────────────────────────

export type TrialVerdict = "correta" | "erro-leve" | "erro-grave";

/** Classifica uma tentativa comparando a sequência esperada com a resposta. */
export function classifyTrial<T>(expected: readonly T[], given: readonly T[]): TrialVerdict {
  if (given.length === expected.length) {
    const diffs: number[] = [];
    for (let i = 0; i < expected.length; i++) if (expected[i] !== given[i]) diffs.push(i);
    if (diffs.length === 0) return "correta";
    if (diffs.length === 1) return "erro-leve";
    const [a, b] = diffs;
    if (
      diffs.length === 2 &&
      b === a + 1 &&
      expected[a] === given[b] &&
      expected[b] === given[a]
    ) {
      return "erro-leve"; // troca de dois itens adjacentes
    }
    return "erro-grave";
  }
  // omissão de UM item no final, com todo o resto certo = "um item incorreto"
  if (given.length === expected.length - 1 && given.every((x, i) => x === expected[i])) {
    return "erro-leve";
  }
  return "erro-grave";
}

/** Próximo nível segundo a regra por tentativa (clampado em [min, max]). */
export function nextLevelPerTrial(
  level: number,
  verdict: TrialVerdict,
  min: number,
  max: number
): number {
  if (verdict === "correta") return Math.min(max, level + 1);
  if (verdict === "erro-grave") return Math.max(min, level - 1);
  return level;
}

/**
 * Para exercícios em que a resposta CORTA no primeiro toque errado (Cubo Corsi,
 * Matriz Espacial): não existe "resposta completa" para comparar. Aproximação
 * fiel ao espírito da regra: errar somente o ÚLTIMO item da sequência (tudo
 * certo até ali) = erro leve; errar antes disso = erro grave.
 * `hits` = quantos itens o paciente acertou antes do primeiro erro.
 */
export function classifyTapTrial(sequenceLen: number, hits: number): TrialVerdict {
  if (hits >= sequenceLen) return "correta";
  return hits === sequenceLen - 1 ? "erro-leve" : "erro-grave";
}
