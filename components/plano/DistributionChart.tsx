import { DOMAIN_LABELS, DOMAIN_COLORS, type Domain } from "@/types";
import { ALL_DOMAINS as DOMAIN_ORDER } from "@/lib/domain-taxonomy";

interface DistributionChartProps {
  /** Quantidade de exercícios por domínio. */
  counts: Record<Domain, number>;
}

const R = 30;
const STROKE = 12;
const C = 2 * Math.PI * R;

/** Gráfico donut da distribuição de exercícios por domínio. */
export function DistributionChart({ counts }: DistributionChartProps) {
  const items = DOMAIN_ORDER.map((d) => ({ domain: d, count: counts[d] ?? 0 })).filter((i) => i.count > 0);
  const total = items.reduce((s, i) => s + i.count, 0);

  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0 -rotate-90">
        {total === 0 ? (
          <circle cx="40" cy="40" r={R} fill="none" stroke="#F1F5F9" strokeWidth={STROKE} />
        ) : (
          items.map((item) => {
            const len = (item.count / total) * C;
            const seg = (
              <circle
                key={item.domain}
                cx="40" cy="40" r={R}
                fill="none"
                stroke={DOMAIN_COLORS[item.domain]}
                strokeWidth={STROKE}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return seg;
          })
        )}
      </svg>

      <div className="flex-1 min-w-0 space-y-1">
        {total === 0 ? (
          <p className="text-xs text-gray-400">Adicione exercícios para ver a distribuição.</p>
        ) : (
          DOMAIN_ORDER.filter((d) => (counts[d] ?? 0) > 0).map((d) => (
            <div key={d} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DOMAIN_COLORS[d] }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{DOMAIN_LABELS[d]}</span>
              <span className="text-xs font-semibold text-gray-500 tabular-nums">{counts[d]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
