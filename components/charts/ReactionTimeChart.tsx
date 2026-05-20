"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RTDataPoint {
  date: string;
  reactionTime: number;
}

interface ReactionTimeChartProps {
  data: RTDataPoint[];
  baseline?: number;
  height?: number;
}

export function ReactionTimeChart({
  data,
  baseline = 500,
  height = 250,
}: ReactionTimeChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    displayDate: format(new Date(d.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `${v}ms`}
          label={{ value: "ms", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(0)}ms`, "Tempo de Reação"]}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <ReferenceLine
          y={baseline}
          stroke="#EA580C"
          strokeDasharray="5 5"
          label={{ value: "Referência", position: "right", fontSize: 11 }}
        />
        <Bar dataKey="reactionTime" fill="#2563EB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
