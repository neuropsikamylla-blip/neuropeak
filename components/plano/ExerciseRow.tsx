import { Plus, Check } from "lucide-react";
import { metaOf } from "@/lib/exercise-meta";
import { EXERCISE_SUBDOMAIN, EXERCISE_SUBDOMAIN_ID } from "@/lib/domain-taxonomy";
import { ExerciseIcon } from "@/components/ExerciseIcon";
import { DifficultyDots } from "./badges";
import { SubdomainTag, SecondaryChips } from "./ExerciseTags";

export interface ExerciseInfo {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  icon: string;
}

interface ExerciseRowProps {
  exercise: ExerciseInfo;
  added: boolean;
  onToggle: (id: string) => void;
}

/** Linha da tabela: Exercício (com habilidades) · Subdomínio · Dificuldade · Duração · Ação. */
export function ExerciseRow({ exercise, added, onToggle }: ExerciseRowProps) {
  const meta = metaOf(exercise.id);
  const subLabel = EXERCISE_SUBDOMAIN[exercise.id];
  const subId = EXERCISE_SUBDOMAIN_ID[exercise.id];

  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1fr)_124px_104px_64px_48px] items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
      {/* Exercício */}
      <div className="flex items-start gap-3 min-w-0">
        <ExerciseIcon id={exercise.id} emoji={exercise.icon} size={44} className="mt-0.5" />
        <div className="min-w-0">
          <p className="font-medium text-sm text-slate-100 leading-tight">{exercise.name}</p>
          <p className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-1">{exercise.description}</p>
          {meta.secondary.length > 0 && (
            <div className="mt-1.5"><SecondaryChips skills={meta.secondary} /></div>
          )}
          {/* Em telas pequenas, metadados embaixo (colunas somem) */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
            {subLabel && <SubdomainTag id={subId} label={subLabel} />}
            <DifficultyDots difficulty={meta.difficulty} showLabel={false} />
            <span className="text-xs text-slate-400">{exercise.estimatedMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Subdomínio */}
      <div className="hidden sm:block">{subLabel && <SubdomainTag id={subId} label={subLabel} />}</div>

      {/* Dificuldade */}
      <div className="hidden sm:block"><DifficultyDots difficulty={meta.difficulty} /></div>

      {/* Duração */}
      <div className="hidden sm:block text-sm text-slate-400 tabular-nums">~{exercise.estimatedMinutes} min</div>

      {/* Ação */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onToggle(exercise.id)}
          aria-label={added ? `Remover ${exercise.name} do plano` : `Adicionar ${exercise.name} ao plano`}
          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
            added
              ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              : "bg-white/5 border-white/15 text-slate-300 hover:border-blue-400 hover:text-blue-300"
          }`}
        >
          {added ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
