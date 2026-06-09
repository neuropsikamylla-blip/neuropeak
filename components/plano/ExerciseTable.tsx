import { ExerciseRow, type ExerciseInfo } from "./ExerciseRow";

export interface ExerciseGroup {
  id: string;
  label: string;
  exercises: ExerciseInfo[];
}

interface ExerciseTableProps {
  groups: ExerciseGroup[];
  addedIds: Set<string>;
  onToggle: (id: string) => void;
}

/** Tabela moderna de exercícios, agrupada por subdomínio. */
export function ExerciseTable({ groups, addedIds, onToggle }: ExerciseTableProps) {
  const nonEmpty = groups.filter((g) => g.exercises.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center">
        <p className="text-sm text-gray-400">Nenhum exercício encontrado com esses filtros.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Cabeçalho de colunas */}
      <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_110px_120px_88px_56px] gap-3 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200">
        {["Exercício", "Tipo", "Dificuldade", "Duração", ""].map((h, i) => (
          <span key={i} className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</span>
        ))}
      </div>

      {nonEmpty.map((group) => (
        <div key={group.id}>
          {/* Cabeçalho do subdomínio */}
          <div className="px-4 py-1.5 bg-gray-50/60 border-b border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{group.label}</span>
          </div>
          {group.exercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} added={addedIds.has(ex.id)} onToggle={onToggle} />
          ))}
        </div>
      ))}
    </div>
  );
}
