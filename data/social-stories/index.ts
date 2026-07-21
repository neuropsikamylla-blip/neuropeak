// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO de histórias do Investigadores da Situação Social.
//
// Para adicionar uma história: crie um arquivo neste diretório (copie
// `_TEMPLATE.ts`), importe-o aqui e inclua no array `STORY_MODULES`. Nada de
// código do exercício muda — só dados. Ver README.md.
//
// Começa VAZIO de propósito (Etapa 3 não cria histórias).
// ─────────────────────────────────────────────────────────────────────────────

import type { SocialStory, FaixaEtaria, NivelSocial } from "@/lib/social/types";
import { assertStories } from "@/lib/social/validate";
import { SEED_STORIES } from "./seed";

// Histórias-semente (conteúdo inicial). Para acrescentar: crie um arquivo (copie
// _TEMPLATE.ts) e some ao array abaixo. Ver README.md.
const STORY_MODULES: SocialStory[] = [
  ...SEED_STORIES,
];

/** Todas as histórias válidas (validadas em dev). */
export const SOCIAL_STORIES: SocialStory[] = assertStories(STORY_MODULES);

// ── Seletores usados pela UI ──────────────────────────────────────────────────
export function storiesByFaixa(faixa: FaixaEtaria): SocialStory[] {
  return SOCIAL_STORIES.filter((s) => s.faixa === faixa);
}
export function storiesByNivel(faixa: FaixaEtaria, nivel: NivelSocial): SocialStory[] {
  return storiesByFaixa(faixa).filter((s) => s.nivel === nivel);
}
export function storyById(id: string): SocialStory | undefined {
  return SOCIAL_STORIES.find((s) => s.id === id);
}
export const faixasComHistorias = (): FaixaEtaria[] =>
  [...new Set(SOCIAL_STORIES.map((s) => s.faixa))];
