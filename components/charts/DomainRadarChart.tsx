"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DomainScore } from "@/types";
import { DOMAIN_LABELS } from "@/types";

interface DomainRadarChartProps {
  scores: DomainScore[];
  height?: number;
}

export function DomainRadarChart({ scores, height = 300 }: DomainRadarChartProps) {
  const data = scores.map((s) => ({
    domain: DOMAIN_LABELS[s.domain],
    score: s.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar
          name="Pontuação"
          dataKey="score"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.2}
        />
        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}`, "Pontuação"]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
