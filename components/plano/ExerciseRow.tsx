import { Plus, Check } from "lucide-react";
import { metaOf } from "@/lib/exercise-meta";
import { TypeBadge, DifficultyDots } from "./badges";

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

/** Linha da tabela de exercícios (estilo SaaS premium). */
export function ExerciseRow({ exercise, added, onToggle }: ExerciseRowProps) {
  const meta = metaOf(exercise.id);
  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1fr)_110px_120px_88px_56px] items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors">
      {/* Exercício: ícone + nome + descrição */}
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-2xl leading-none mt-0.5 shrink-0">{exercise.icon}</span>
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-800 truncate">{exercise.name}</p>
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{exercise.description}</p>
          {/* Tipo + dificuldade em telas pequenas (as colunas somem no mobile) */}
          <div className="flex items-center gap-2 mt-1.5 sm:hidden">
            <TypeBadge type={meta.type} />
            <DifficultyDots difficulty={meta.difficulty} showLabel={false} />
            <span className="text-xs text-gray-400">{exercise.estimatedMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Tipo */}
      <div className="hidden sm:flex justify-start"><TypeBadge type={meta.type} /></div>

      {/* Dificuldade */}
      <div className="hidden sm:flex justify-start"><DifficultyDots difficulty={meta.difficulty} /></div>

      {/* Duração */}
      <div className="hidden sm:block text-sm text-gray-500 tabular-nums">{exercise.estimatedMinutes} min</div>

      {/* Ação */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onToggle(exercise.id)}
          aria-label={added ? `Remover ${exercise.name} do plano` : `Adicionar ${exercise.name} ao plano`}
          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
            added
              ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
              : "bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {added ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
