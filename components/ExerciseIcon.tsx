import { EXERCISE_ICON_IDS, ICON_SCALE } from "@/lib/exercise-icons";

interface ExerciseIconProps {
  id: string;
  emoji: string;
  /** Tamanho em px (lado do quadrado). */
  size?: number;
  className?: string;
}

/** Ícone do exercício: usa o ícone 3D (PNG) quando existe, senão o emoji. */
export function ExerciseIcon({ id, emoji, size = 28, className = "" }: ExerciseIconProps) {
  if (EXERCISE_ICON_IDS.has(id)) {
    const px = Math.round(size * (ICON_SCALE[id] ?? 1));
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/exercises/icones-exercicios/${id}.png`}
        alt=""
        width={px}
        height={px}
        className={`object-contain shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <span className={`shrink-0 leading-none ${className}`} style={{ fontSize: Math.round(size * 0.82) }}>
      {emoji}
    </span>
  );
}
