"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DIFFICULTY_INFO, type Difficulty } from "@/lib/exercise-meta";

export type DifficultyFilter = Difficulty | "todas";

interface ExerciseSearchProps {
  query: string;
  onQuery: (value: string) => void;
  difficulty: DifficultyFilter;
  onDifficulty: (value: DifficultyFilter) => void;
}

/** Campo de busca + botão de filtros (dificuldade). */
export function ExerciseSearch({ query, onQuery, difficulty, onDifficulty }: ExerciseSearchProps) {
  const [open, setOpen] = useState(false);
  const filtering = difficulty !== "todas";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar exercício..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            filtering || open ? "border-blue-400/50 text-blue-300 bg-blue-500/15" : "border-white/15 text-slate-300 hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {filtering && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 z-20 rounded-xl border border-white/10 bg-[#0f2147] shadow-lg p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Dificuldade</p>
              <div className="space-y-1">
                {(["todas", "facil", "medio", "dificil"] as const).map((d) => {
                  const label = d === "todas" ? "Todas" : DIFFICULTY_INFO[d].label;
                  const isActive = difficulty === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { onDifficulty(d); setOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive ? "bg-blue-500/15 text-blue-300 font-semibold" : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
