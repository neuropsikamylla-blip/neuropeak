import { TYPE_INFO, DIFFICULTY_INFO, type ExerciseType, type Difficulty } from "@/lib/exercise-meta";

/** Badge de categoria do exercício (Visual / Auditiva / Verbal / Espacial). */
export function TypeBadge({ type }: { type: ExerciseType }) {
  const info = TYPE_INFO[type];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: info.text, backgroundColor: info.bg }}
    >
      {info.label}
    </span>
  );
}

/** Indicador de dificuldade: ●○○ Fácil / ●●○ Médio / ●●● Difícil. */
export function DifficultyDots({ difficulty, showLabel = true }: { difficulty: Difficulty; showLabel?: boolean }) {
  const info = DIFFICULTY_INFO[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: i < info.dots ? info.color : "#E5E7EB" }}
          />
        ))}
      </span>
      {showLabel && <span className="text-xs font-medium" style={{ color: info.color }}>{info.label}</span>}
    </span>
  );
}
