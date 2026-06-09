"use client";

import type { CSSProperties } from "react";
import { Check, Lightbulb } from "lucide-react";
import { DOMAIN_LABELS, DOMAIN_COLORS, type Domain } from "@/types";
import { DOMAIN_ORDER, DOMAIN_ICONS } from "./DomainSelector";

interface DomainSidebarProps {
  /** Domínios incluídos no plano (selecionados na etapa anterior). */
  selected: Domain[];
  /** Domínio em foco (cujos exercícios aparecem na coluna central). */
  active: Domain;
  onFocus: (domain: Domain) => void;
  /** Quantos exercícios já foram adicionados ao plano, por domínio. */
  addedCounts: Record<Domain, number>;
}

/** Coluna 1 — lista de domínios com ícone, contagem e estado ativo. */
export function DomainSidebar({ selected, active, onFocus, addedCounts }: DomainSidebarProps) {
  const domains = DOMAIN_ORDER.filter((d) => selected.includes(d));

  return (
    <aside className="flex flex-col gap-3">
      <div className="space-y-1.5">
        {domains.map((domain) => {
          const color = DOMAIN_COLORS[domain];
          const Icon = DOMAIN_ICONS[domain];
          const isActive = active === domain;
          const added = addedCounts[domain] ?? 0;

          const style: CSSProperties = {
            ["--dc" as string]: color,
            ...(isActive ? { borderColor: color, backgroundColor: `${color}0D` } : {}),
          };

          return (
            <button
              key={domain}
              type="button"
              onClick={() => onFocus(domain)}
              aria-current={isActive}
              style={style}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                isActive ? "shadow-sm" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <span
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ backgroundColor: `${color}14` }}
              >
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight truncate" style={{ color: isActive ? color : "#1F2937" }}>
                  {DOMAIN_LABELS[domain]}
                </span>
                <span className="block text-xs text-gray-400">
                  {added > 0 ? `${added} no plano` : "nenhum ainda"}
                </span>
              </span>
              {added > 0 && (
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card de dica */}
      <div className="mt-1 flex items-start gap-2.5 rounded-xl bg-blue-50 px-3.5 py-3">
        <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Combine exercícios de diferentes domínios para um plano equilibrado.
        </p>
      </div>
    </aside>
  );
}
