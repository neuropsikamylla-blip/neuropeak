"use client";

import type { CSSProperties } from "react";
import { ChevronRight, Lightbulb } from "lucide-react";
import { DOMAIN_LABELS, DOMAIN_COLORS, type Domain } from "@/types";
import { DOMAIN_ORDER, DOMAIN_ICONS } from "./DomainSelector";
import { DOMAIN_SUBDOMAINS } from "@/lib/domain-taxonomy";

export interface SubdomainSelection {
  domain: Domain;
  subdomain: string | null; // id do subdomínio, ou null = domínio inteiro
}

interface DomainSidebarProps {
  selected: Domain[];
  active: SubdomainSelection;
  onSelect: (sel: SubdomainSelection) => void;
  /** Exercícios já adicionados ao plano (para contar por domínio/subdomínio). */
  addedIds: Set<string>;
}

/** Coluna 1 — árvore Domínio → Subdomínio com estado ativo. */
export function DomainSidebar({ selected, active, onSelect, addedIds }: DomainSidebarProps) {
  const domains = DOMAIN_ORDER.filter((d) => selected.includes(d));

  return (
    <aside className="flex flex-col gap-3">
      <div className="space-y-1">
        {domains.map((domain) => {
          const color = DOMAIN_COLORS[domain];
          const Icon = DOMAIN_ICONS[domain];
          const isOpen = active.domain === domain;
          const subdomains = DOMAIN_SUBDOMAINS[domain];
          const addedInDomain = subdomains.reduce(
            (n, s) => n + s.exercises.filter((e) => addedIds.has(e)).length, 0
          );

          const domainStyle: CSSProperties = {
            ["--dc" as string]: color,
            ...(isOpen && active.subdomain === null ? { borderColor: color, backgroundColor: `${color}0D` } : {}),
          };

          return (
            <div key={domain}>
              {/* Domínio */}
              <button
                type="button"
                onClick={() => onSelect({ domain, subdomain: null })}
                aria-expanded={isOpen}
                style={domainStyle}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all ${
                  isOpen && active.subdomain === null ? "shadow-sm" : "border-transparent hover:bg-gray-50"
                }`}
              >
                <ChevronRight className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ backgroundColor: `${color}14` }}>
                  <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.9} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate" style={{ color: isOpen ? color : "#1F2937" }}>
                    {DOMAIN_LABELS[domain]}
                  </span>
                </span>
                {addedInDomain > 0 && (
                  <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: color }}>
                    {addedInDomain}
                  </span>
                )}
              </button>

              {/* Subdomínios (quando o domínio está aberto) */}
              {isOpen && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
                  {subdomains.map((sd) => {
                    const total = sd.exercises.length;
                    const added = sd.exercises.filter((e) => addedIds.has(e)).length;
                    const isActive = active.subdomain === sd.id;
                    const empty = total === 0;
                    return (
                      <button
                        key={sd.id}
                        type="button"
                        disabled={empty}
                        onClick={() => onSelect({ domain, subdomain: sd.id })}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                          empty ? "cursor-default text-gray-300"
                          : isActive ? "font-semibold" : "text-gray-600 hover:bg-gray-50"
                        }`}
                        style={isActive ? { backgroundColor: `${color}12`, color } : undefined}
                      >
                        <span className="flex-1 min-w-0 truncate">{sd.label}</span>
                        {empty ? (
                          <span className="text-[10px] italic text-gray-300 shrink-0">em breve</span>
                        ) : (
                          <span className="text-[11px] tabular-nums shrink-0" style={{ color: added > 0 ? color : "#9CA3AF" }}>
                            {added > 0 ? `${added}/${total}` : total}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-start gap-2.5 rounded-xl bg-blue-50 px-3.5 py-3">
        <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Navegue pelos subdomínios para montar um plano completo e equilibrado.
        </p>
      </div>
    </aside>
  );
}
