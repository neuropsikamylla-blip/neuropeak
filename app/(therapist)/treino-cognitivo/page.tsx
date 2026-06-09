"use client";

import { useState, type CSSProperties } from "react";
import { Brain, ChevronDown } from "lucide-react";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS, type Domain } from "@/types";
import { DOMAIN_ORDER, DOMAIN_ICONS } from "@/components/plano/DomainSelector";
import { DOMAIN_SUBDOMAINS, DOMAIN_COUNTS } from "@/lib/domain-taxonomy";

export default function TreinoCognitivoPage() {
  // Domínio em foco no catálogo (clicar num card expande seus exercícios).
  const [active, setActive] = useState<Domain | null>("memory");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treino Cognitivo</h1>
          <p className="text-sm text-gray-500">Domínios cognitivos e os exercícios de cada um</p>
        </div>
      </div>

      {/* Catálogo de domínios — seção premium */}
      <section className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_-16px_rgba(0,0,0,0.12)]">
        <h2 className="text-xl font-bold text-gray-900">Domínios de treino</h2>
        <p className="text-sm text-gray-500 mt-1">
          Clique em um domínio para ver os exercícios que ele desenvolve.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-6">
          {DOMAIN_ORDER.map((domain) => {
            const color = DOMAIN_COLORS[domain];
            const Icon = DOMAIN_ICONS[domain];
            const isActive = active === domain;
            const count = DOMAIN_COUNTS[domain] ?? 0;

            const cardStyle: CSSProperties = {
              ["--dc" as string]: color,
              ...(isActive ? { borderColor: color, backgroundColor: `${color}0D` } : {}),
            };

            return (
              <button
                key={domain}
                type="button"
                aria-expanded={isActive}
                aria-label={DOMAIN_LABELS[domain]}
                onClick={() => setActive((prev) => (prev === domain ? null : domain))}
                style={cardStyle}
                className={`group relative flex flex-col items-center text-center min-h-[280px] rounded-[20px] border-2 p-6 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--dc)] ${
                  isActive
                    ? "shadow-[0_12px_30px_-14px_var(--dc)]"
                    : "border-[#E5E7EB] bg-white hover:border-[var(--dc)] hover:-translate-y-[3px] hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.2)]"
                }`}
              >
                {/* Indicador de expansão no canto superior direito */}
                <span
                  className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full transition-all"
                  style={isActive ? { backgroundColor: color } : { backgroundColor: `${color}14` }}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180 text-white" : ""}`}
                    style={isActive ? undefined : { color }}
                    strokeWidth={3}
                  />
                </span>

                {/* Ícone grande em círculo translúcido */}
                <span
                  className="flex items-center justify-center w-20 h-20 rounded-full mt-2"
                  style={{ backgroundColor: `${color}14` }}
                >
                  <Icon className="w-9 h-9" style={{ color }} strokeWidth={1.75} />
                </span>

                <h3 className="mt-5 text-base font-bold leading-tight" style={{ color }}>
                  {DOMAIN_LABELS[domain]}
                </h3>
                <p className="mt-2 text-sm font-semibold" style={{ color }}>
                  {count} exercício{count !== 1 ? "s" : ""}
                </p>
                <span className="block w-16 h-px bg-gray-200 my-4" />
                <p className="text-sm text-gray-500 leading-relaxed">{DOMAIN_DESCRIPTIONS[domain]}</p>
              </button>
            );
          })}
        </div>

        {/* Painel de exercícios do domínio em foco */}
        {active && (
          <div
            className="mt-6 rounded-2xl border p-5 sm:p-6"
            style={{ borderColor: `${DOMAIN_COLORS[active]}33`, backgroundColor: `${DOMAIN_COLORS[active]}08` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[active] }} />
              <h3 className="text-base font-bold" style={{ color: DOMAIN_COLORS[active] }}>
                Exercícios de {DOMAIN_LABELS[active]}
              </h3>
            </div>

            <div className="space-y-5">
              {DOMAIN_SUBDOMAINS[active].map((sd) => {
                const exercises = sd.exercises
                  .map((id) => EXERCISE_DEFINITIONS[id as keyof typeof EXERCISE_DEFINITIONS])
                  .filter(Boolean);
                const empty = exercises.length === 0;
                return (
                  <div key={sd.id}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 pl-1 flex items-center gap-2">
                      {sd.label}
                      {empty && <span className="text-[10px] italic font-normal text-gray-300 normal-case tracking-normal">em breve</span>}
                    </p>
                    {empty ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white/50 px-3 py-2.5">
                        <p className="text-xs text-gray-400">Subdomínio em construção — novos exercícios em breve.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {exercises.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-start gap-3 rounded-xl bg-white border border-gray-200 p-3"
                          >
                            <span className="text-2xl leading-none mt-0.5">{ex.icon}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-gray-800">{ex.name}</p>
                              <p className="text-xs text-gray-500 leading-snug">
                                {ex.description} · ~{ex.estimatedMinutes}min
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
