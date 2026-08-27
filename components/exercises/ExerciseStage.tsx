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
  children,
}: {
  width: StageWidth;
  background?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-auto" style={background ? { background } : undefined}>
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="w-full" style={{ maxWidth: LARGURAS_PALCO[width] }}>
          {children}
        </div>
      </div>
    </div>
  );
}
