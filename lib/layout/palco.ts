/**
 * Larguras canônicas do palco dos exercícios.
 *
 * Vive em `lib/` — e não dentro do componente — por dois motivos: é conhecimento do
 * domínio (que peça merece que teto), e o Vitest deste projeto roda sem suporte a JSX,
 * então um teste não consegue importar de um `.tsx`. O componente é
 * `components/exercises/ExerciseStage.tsx` e importa daqui.
 */

export type StageWidth = "compacto" | "medio" | "amplo";

/** Teto de largura do conteúdo, em px, por tipo de peça. Decidido por ela em 27/ago/2026. */
export const LARGURAS_PALCO: Record<StageWidth, number> = {
  compacto: 640, // peça única, teclado, estímulo central
  medio: 960,    // grades, cartas, tabuleiros pequenos
  amplo: 1280,   // arena, cena, catálogo
};
