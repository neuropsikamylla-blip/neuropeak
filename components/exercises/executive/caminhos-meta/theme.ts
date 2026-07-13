// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — paleta CLARA neutra adulta (spec §14).
// Mesma família azul-clara do Cubo/Span novos: fundo #F4F7FB, cartões brancos,
// borda rgba(158,190,221,.5), acento #4F8FEA. SEM visual infantil, nada piscando.
// ─────────────────────────────────────────────────────────────────────────────

export const CM = {
  bg: "#F4F7FB",
  bgGradient: "linear-gradient(180deg, #FDFEFF 0%, #EFF4FB 55%, #E7EFF8 100%)",
  card: "#FFFFFF",
  cardSoft: "#EEF4FB",
  border: "rgba(158,190,221,0.5)",
  borderSoft: "rgba(158,190,221,0.35)",
  accent: "#4F8FEA",
  accentDark: "#3B79D9",
  accentSoft: "rgba(79,143,234,0.10)",
  ink: "#2C4257", // texto forte
  text: "#3B5A75",
  textMid: "#5C7A94",
  textSoft: "#8FA9C0",
  // estados
  ok: "#16A34A",
  okBg: "#E9F9EF",
  okBorder: "#8FD9AB",
  warn: "#D97706", // âmbar (parcial / revisar)
  warnBg: "#FEF6E7",
  warnBorder: "#F1C57B",
  err: "#DC2626",
  errBg: "#FDECEC",
  errBorder: "#F0A9A9",
  slot: "#F3F7FC", // espaço vazio do plano
  slotBorder: "rgba(120,160,205,0.45)",
  discard: "#F6F8FA", // área "não faz parte"
} as const;

export const SHADOW_CARD =
  "0 6px 16px rgba(100,140,180,0.14), inset 0 1px 0 rgba(255,255,255,0.85)";
export const SHADOW_PANEL =
  "0 20px 52px rgba(100,140,180,0.16), inset 0 1px 0 rgba(255,255,255,0.8)";
