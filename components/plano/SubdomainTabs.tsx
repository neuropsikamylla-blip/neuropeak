"use client";

import { subdomainColor, type Subdomain } from "@/lib/domain-taxonomy";

interface SubdomainTabsProps {
  subdomains: Subdomain[];
  active: string | null; // id, ou null = Todos
  onSelect: (id: string | null) => void;
}

/** Chips de subdomínio (navegação dentro do domínio). */
export function SubdomainTabs({ subdomains, active, onSelect }: SubdomainTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
          active === null ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        Todos
      </button>

      {subdomains.map((sd) => {
        const empty = sd.exercises.length === 0;
        const c = subdomainColor(sd.id);
        const isActive = active === sd.id;
        return (
          <button
            key={sd.id}
            type="button"
            disabled={empty}
            onClick={() => onSelect(sd.id)}
            style={isActive ? { backgroundColor: c.text, borderColor: c.text, color: "#fff" } : undefined}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              empty ? "bg-gray-50 text-gray-300 border-gray-100 cursor-default"
              : isActive ? "" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sd.label}
            {empty && <span className="ml-1.5 text-[10px] italic">em breve</span>}
          </button>
        );
      })}
    </div>
  );
}
