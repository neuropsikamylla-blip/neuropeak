import { ITEM_IMAGE_IDS, itemImageId, itemImageSrc } from "@/lib/item-images";

/** Mostra a imagem real do item (se existir em /exercises/itens) ou o emoji como fallback. */
export function ItemVisual({ name, emoji, size, className = "" }: { name: string; emoji: string; size: number; className?: string }) {
  if (ITEM_IMAGE_IDS.has(itemImageId(name))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={itemImageSrc(name)} alt="" draggable={false} width={size} height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain", display: "block", userSelect: "none" }} />
    );
  }
  return <span className={className} style={{ fontSize: Math.round(size * 0.8), lineHeight: 1 }}>{emoji}</span>;
}
