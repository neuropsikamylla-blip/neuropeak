// ─────────────────────────────────────────────────────────────────────────────
// Construção de prompts — determinística e com ESTILO travado (Direção de Arte).
// Um prompt por entrada do catálogo. Sem texto, sem marca, fundo conforme o tipo.
// ─────────────────────────────────────────────────────────────────────────────

import { STYLE, NEGATIVE, RESOLUTION } from "./config.mjs";

function subjectLine(e) {
  switch (e.kind) {
    case "character":
      return `Full-body character illustration of ${e.subject}, standing in a neutral relaxed pose, facing forward, friendly and approachable`;
    case "expression":
      return `Head-and-shoulders portrait of ${e.subject}, clearly showing a ${e.exprLabel} facial expression, same character identity, facing forward`;
    case "pose":
      return `Full-body illustration of ${e.subject}, in a clear "${e.poseLabel}" body pose, same character identity`;
    case "object":
      return `A single ${e.subject}, one object only, centered, clean and simple`;
    case "environment":
      return `A ${e.subject} interior/scene, empty, WITHOUT any people or characters, wide establishing view`;
    case "animal":
      return `A cute, friendly ${e.subject}, full body, side or three-quarter view`;
    case "vehicle":
      return `A ${e.subject}, full vehicle, clean side view`;
    case "icon":
      return `A simple, flat, rounded icon representing "${e.subject}", minimal, bold and clear`;
    default:
      return e.subject;
  }
}

function backgroundLine(e) {
  return e.transparent
    ? "isolated on a fully transparent background (PNG with alpha), no ground shadow"
    : "complete cohesive background scene filling the frame";
}

export function buildPrompt(e) {
  const prompt = [
    subjectLine(e),
    STYLE,
    backgroundLine(e),
    "no text, no watermark, no signature",
    `square composition, ${RESOLUTION}x${RESOLUTION}`,
  ].join(". ");
  return { prompt, negative: NEGATIVE };
}
