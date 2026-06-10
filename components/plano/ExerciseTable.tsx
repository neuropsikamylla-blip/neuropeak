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
      <div className="rounded-2xl border border-white/10 bg-[#0D2547] py-14 text-center">
        <p className="text-sm text-slate-400">Nenhum exercício encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D2547] overflow-hidden">
      {/* Cabeçalho */}
      <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_124px_104px_64px_48px] gap-3 px-4 py-2.5 bg-white/5 border-b border-white/10">
        {["Exercício", "Subdomínio", "Dificuldade", "Duração", "Ação"].map((h, i) => (
          <span key={i} className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{h}</span>
        ))}
      </div>

      <div>
        {exercises.map((ex) => (
          <ExerciseRow key={ex.id} exercise={ex} added={addedIds.has(ex.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
