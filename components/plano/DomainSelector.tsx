"use client";

import type { CSSProperties } from "react";
import { Brain, Target, Puzzle, Gauge, Sprout, Lightbulb, Check, type LucideIcon } from "lucide-react";
import { DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS, type Domain } from "@/types";

export const DOMAIN_ICONS: Record<Domain, LucideIcon> = {
  memory: Brain,
  attention: Target,
  executive: Puzzle,
  processing: Gauge,
  functional: Sprout,
};

// Ordem dos cards (igual à referência clínica).
export const DOMAIN_ORDER: Domain[] = ["memory", "attention", "executive", "processing", "functional"];

interface DomainSelectorProps {
  selected: Domain[];
  onToggle: (domain: Domain) => void;
  /** Quantidade real de exercícios disponíveis por domínio. */
  counts: Record<Domain, number>;
}

/**
 * Seção premium de seleção de domínios cognitivos do plano de treino.
 * Reutilizável — a cor de cada domínio (DOMAIN_COLORS) aparece como acento visual.
 */
export function DomainSelector({ selected, onToggle, counts }: DomainSelectorProps) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_-16px_rgba(0,0,0,0.12)]">
      <h2 className="text-xl font-bold text-gray-900">Selecione os domínios de treino</h2>
      <p className="text-sm text-gray-500 mt-1">
        Escolha as áreas cognitivas que farão parte do plano do paciente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-6">
        {DOMAIN_ORDER.map((domain) => {
          const color = DOMAIN_COLORS[domain];
          const Icon = DOMAIN_ICONS[domain];
          const isSelected = selected.includes(domain);
          const count = counts[domain] ?? 0;

          const cardStyle: CSSProperties = {
            ["--dc" as string]: color,
            ...(isSelected ? { borderColor: color, backgroundColor: `${color}0D` } : {}),
          };

          return (
            <button
              key={domain}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={DOMAIN_LABELS[domain]}
              onClick={() => onToggle(domain)}
              style={cardStyle}
              className={`group relative flex flex-col items-center text-center min-h-[280px] rounded-[20px] border-2 p-6 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--dc)] ${
                isSelected
                  ? "shadow-[0_12px_30px_-14px_var(--dc)]"
                  : "border-[#E5E7EB] bg-white hover:border-[var(--dc)] hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.2)]"
              }`}
            >
              {/* Check no canto superior direito */}
              <span
                className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors"
                style={isSelected ? { backgroundColor: color, borderColor: color } : { borderColor: "#D1D5DB" }}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>

              {/* Ícone grande em círculo translúcido */}
              <span
                className="flex items-center justify-center w-20 h-20 rounded-full mt-2"
                style={{ backgroundColor: `${color}14` }}
              >
                <Icon className="w-9 h-9" style={{ color }} strokeWidth={1.75} />
              </span>

              {/* Nome do domínio */}
              <h3 className="mt-5 text-base font-bold leading-tight" style={{ color }}>
                {DOMAIN_LABELS[domain]}
              </h3>

              {/* Quantidade de exercícios */}
              <p className="mt-2 text-sm font-semibold" style={{ color }}>
                {count} exercício{count !== 1 ? "s" : ""}
              </p>

              {/* Linha divisória fina */}
              <span className="block w-16 h-px bg-gray-200 my-4" />

              {/* Descrição curta */}
              <p className="text-sm text-gray-500 leading-relaxed">{DOMAIN_DESCRIPTIONS[domain]}</p>
            </button>
          );
        })}
      </div>

      {/* Box de dica */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-blue-50 px-5 py-4">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 shrink-0">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Dica</p>
          <p className="text-sm text-gray-600 mt-0.5">
            Você pode selecionar múltiplos domínios para criar um plano equilibrado e personalizado.
          </p>
        </div>
      </div>
    </section>
  );
}
