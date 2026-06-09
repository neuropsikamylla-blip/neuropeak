import { Info } from "lucide-react";
import { ExerciseRow, type ExerciseInfo } from "./ExerciseRow";

interface ExerciseTableProps {
  exercises: ExerciseInfo[];
  addedIds: Set<string>;
  onToggle: (id: string) => void;
}

/** Tabela moderna de exercícios. */
export function ExerciseTable({ exercises, addedIds, onToggle }: ExerciseTableProps) {
  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center">
        <p className="text-sm text-gray-400">Nenhum exercício encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Cabeçalho */}
      <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_132px_minmax(0,1.6fr)_104px_66px_52px] gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Exercício</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Subdomínio</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1">
          Habilidades Secundárias
          <Info className="w-3 h-3 text-gray-300" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Dificuldade</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Duração</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Ação</span>
      </div>

      <div>
        {exercises.map((ex) => (
          <ExerciseRow key={ex.id} exercise={ex} added={addedIds.has(ex.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
