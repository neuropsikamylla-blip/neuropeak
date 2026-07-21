"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AssetImage — renderiza QUALQUER asset da biblioteca por ID.
//   <AssetImage id="character:children:bento-01" alt="Bento" width={160} />
//   <AssetImage id="expression:children:bento-01:alegria" />
//
// Resolve a URL pela instância padrão (@/data/assets). Se o id for inválido ou a
// imagem faltar (ainda não há arte), mostra um placeholder discreto — nunca quebra
// a tela. Ponto de integração da infraestrutura; não altera nenhum exercício.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { resolveAssetUrl } from "@/data/assets";
import { parseAssetId } from "@/lib/assets";

export interface AssetImageProps {
  id: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  fallback?: React.ReactNode;
  draggable?: boolean;
}

export function AssetImage({
  id, alt, className, style, width, height, fallback, draggable = false,
}: AssetImageProps) {
  const [errored, setErrored] = useState(false);
  const url = parseAssetId(id) ? resolveAssetUrl(id) : null;

  if (!url || errored) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <AssetPlaceholder label={alt ?? id} className={className} style={style} width={width} height={height} />;
  }

  return (
    <img
      src={url}
      alt={alt ?? ""}
      className={className}
      style={{ width, height, objectFit: "contain", ...style }}
      draggable={draggable}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  );
}

// Placeholder neutro (compatível com fundo transparente): caixa tracejada suave.
function AssetPlaceholder({
  label, className, style, width, height,
}: { label: string; className?: string; style?: React.CSSProperties; width?: number | string; height?: number | string }) {
  return (
    <div
      className={className}
      aria-label={label}
      role="img"
      style={{
        width: width ?? 96,
        height: height ?? 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        border: "1.5px dashed rgba(26,39,68,0.25)",
        background: "rgba(26,39,68,0.04)",
        color: "rgba(26,39,68,0.35)",
        fontSize: 22,
        ...style,
      }}
    >
      <span aria-hidden>🖼️</span>
    </div>
  );
}
