"use client";

import type { CSSProperties } from "react";
import { DOMAIN_LABELS, DOMAIN_COLORS, type Domain } from "@/types";
import { DOMAIN_ORDER, DOMAIN_ICONS } from "./DomainSelector";

interface DomainTabsProps {
  active: Domain;
  onSelect: (domain: Domain) => void;
  counts: Record<Domain, number>;
}

/** Abas horizontais de domínios cognitivos (navegação principal). */
export function DomainTabs({ active, onSelect, counts }: DomainTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto p-1.5 rounded-2xl bg-gray-50 border border-gray-100">
      {DOMAIN_ORDER.map((domain) => {
        const color = DOMAIN_COLORS[domain];
        const Icon = DOMAIN_ICONS[domain];
        const isActive = active === domain;
        const style: CSSProperties = isActive
          ? { backgroundColor: "#fff", borderColor: color, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
          : {};
        return (
          <button
            key={domain}
            type="button"
            onClick={() => onSelect(domain)}
            aria-current={isActive}
            style={style}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
              isActive ? "" : "border-transparent hover:bg-white/60"
            }`}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: `${color}14` }}>
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.9} />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold leading-tight" style={{ color: isActive ? color : "#374151" }}>
                {DOMAIN_LABELS[domain]}
              </span>
              <span className="block text-xs text-gray-400">{counts[domain]} exercícios</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
