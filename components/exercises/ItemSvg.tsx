import Image from "next/image";
import { ProductSvg } from "@/components/exercises/memory/ProductSvg";

function ExerciseImage({ id, size }: { id: string; size: number }) {
  return (
    <Image
      src={`/exercises/items/${id}.png`}
      alt={id}
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
      unoptimized
    />
  );
}

export function ItemSvg({ id, size = 36 }: { id: string; size?: number }) {
  if (id.startsWith("an-") || id.startsWith("vs-") || id.startsWith("bq-")) {
    return <ExerciseImage id={id} size={size} />;
  }
  return <ProductSvg id={id} size={size} />;
}
