"use client";

import Image from "next/image";

const ALIASES: Record<string, string> = {
  "agua-min":  "agua",
  "refri":     "refrigerante",
  "papel-hig": "papel",
  "suco-cx":   "suco",
};

export function ProductSvg({ id, size = 36 }: { id: string; size?: number }) {
  const resolvedId = ALIASES[id] ?? id;
  const src = `/exercises/items/${resolvedId}.png`;

  return (
    <Image
      src={src}
      alt={resolvedId}
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
      unoptimized
    />
  );
}
