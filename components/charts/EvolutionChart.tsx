"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DOMAIN_COLORS, DOMAIN_LABELS, type Domain } from "@/types";

interface DataPoint {
  date: string;
  memory?: number;
  attention?: number;
  processing?: number;
  executive?: number;
}

interface EvolutionChartProps {
  data: DataPoint[];
  domains?: Domain[];
  height?: number;
}

export function EvolutionChart({
  data,
  domains = ["memory", "attention", "processing", "executive"],
  height = 300,
}: EvolutionChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    displayDate: format(new Date(d.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: "#7e93b6" }} stroke="rgba(255,255,255,0.2)" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#7e93b6" }} stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}`} />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}`,
            DOMAIN_LABELS[name as Domain] ?? name,
          ]}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Legend formatter={(value) => DOMAIN_LABELS[value as Domain] ?? value} />
        {domains.map((domain) => (
          <Line
            key={domain}
            type="monotone"
            dataKey={domain}
            stroke={DOMAIN_COLORS[domain]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
