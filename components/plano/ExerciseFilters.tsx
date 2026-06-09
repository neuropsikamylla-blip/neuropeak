"use client";

import { Search } from "lucide-react";
import { TYPE_FILTERS, type ExerciseType } from "@/lib/exercise-meta";

export type TypeFilter = ExerciseType | "todos";

interface ExerciseFiltersProps {
  active: TypeFilter;
  onChange: (value: TypeFilter) => void;
  query: string;
  onQuery: (value: string) => void;
}

/** Barra de filtros (chips por tipo) + campo de busca. */
export function ExerciseFilters({ active, onChange, query, onQuery }: ExerciseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      {/* Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_FILTERS.map((f) => {
          const isActive = active === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar exercícios..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
        />
      </div>
    </div>
  );
}
