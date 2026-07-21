"use client";

// Cabeçalho da história: título, faixa, ambiente e nível.
import React from "react";
import type { Theme } from "@/types";
import { socialStyles } from "./socialTheme";
import { FAIXA_LABEL, type SocialStory } from "@/lib/social/types";

export function StoryHeader({ story, theme, right }: {
  story: Pick<SocialStory, "titulo" | "faixa" | "nivel" | "ambiente">;
  theme: Theme;
  right?: React.ReactNode;
}) {
  const { pal } = socialStyles(theme);
  return (
    <div className="flex justify-between items-start gap-3 mb-3">
      <div>
        <h2 className={`font-bold text-base leading-tight ${pal.title}`}>🕵️ {story.titulo}</h2>
        <p className={`text-xs font-semibold mt-1 ${pal.sub}`}>
          {FAIXA_LABEL[story.faixa]} · {story.ambiente.nome} · Nível {story.nivel}
        </p>
      </div>
      {right}
    </div>
  );
}
