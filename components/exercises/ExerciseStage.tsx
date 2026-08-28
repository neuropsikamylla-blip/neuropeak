"use client";

/**
 * Palco PADRÃO dos exercícios — ocupa o wrapper sem somar altura ao viewport.
 * A rolagem fica aqui dentro quando o conteúdo é alto, enquanto a largura
 * máxima preserva a proporção apropriada de cada tipo de peça.
 */

import { LARGURAS_PALCO, type StageWidth } from "@/lib/layout/palco";

export { LARGURAS_PALCO, type StageWidth };

export function ExerciseStage({
  width,
  background,
  backgroundClassName,
  fill = false,
  children,
}: {
  width: StageWidth;
  background?: string;
  backgroundClassName?: string;
  /**
   * `true` para exercício cuja ARENA ocupa a altura disponível (usa `flex-1` por dentro).
   *
   * Sem isto a cadeia toda tem altura automática, `flex-1` resolve para ZERO e a arena some
   * — foi o que aconteceu com a Vigilância em 28/ago/2026: o exercício abria com o título e
   * a barra, e o campo de pipas simplesmente não existia. O `min-h-screen` que a migração
   * tirou era o que dava altura àquele flex.
   */
  fill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`absolute inset-0 overflow-auto ${backgroundClassName ?? ""}`} style={background ? { background } : undefined}>
      <div className={`relative min-h-full flex items-center justify-center p-4 sm:p-6 ${fill ? "h-full" : ""}`}>
        <div className={`w-full ${fill ? "h-full" : ""}`} style={{ maxWidth: LARGURAS_PALCO[width] }}>
          {children}
        </div>
      </div>
    </div>
  );
}
