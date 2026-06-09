"use client";

import { Users, Calendar, Bell, TrendingUp, ArrowUpRight, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface StatsOverviewProps {
  totalPatients: number;
  sessionsThisWeek: number;
  pendingAlerts: number;
  avgAdherence: number;
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const W = 80, H = 28;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => ({
    x: (i / (points.length - 1)) * (W - 4) + 2,
    y: H - 4 - ((v - min) / range) * (H - 10),
  }));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const p = coords[i - 1], c = coords[i];
    const mx = (p.x + c.x) / 2;
    d += ` C ${mx} ${p.y} ${mx} ${c.y} ${c.x} ${c.y}`;
  }
  const last = coords[coords.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

export function StatsOverview({ totalPatients, sessionsThisWeek, pendingAlerts, avgAdherence }: StatsOverviewProps) {
  const stats = [
    {
      label: "Total de Pacientes",
      value: totalPatients,
      suffix: "",
      icon: Users,
      iconBg: "rgba(96,165,250,0.15)",
      iconColor: "#60A5FA",
      sparkColor: "#60A5FA",
      sparkPoints: [1, 1.5, 1, 2, 1.8, 2.2, Math.max(totalPatients, 1)],
      trend: "up" as const,
      trendPct: "12%",
      trendColor: "#34D399",
    },
    {
      label: "Sessões esta semana",
      value: sessionsThisWeek,
      suffix: "",
      icon: Calendar,
      iconBg: "rgba(52,211,153,0.15)",
      iconColor: "#34D399",
      sparkColor: "#34D399",
      sparkPoints: [2, 3, 2.5, 4, 3.2, 5, Math.max(sessionsThisWeek, 2)],
      trend: "up" as const,
      trendPct: "25%",
      trendColor: "#34D399",
    },
    {
      label: "Alertas pendentes",
      value: pendingAlerts,
      suffix: "",
      icon: Bell,
      iconBg: pendingAlerts > 0 ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
      iconColor: pendingAlerts > 0 ? "#FBBF24" : "#94A3B8",
      sparkColor: pendingAlerts > 0 ? "#FBBF24" : "#64748B",
      sparkPoints: [3, 2, 3, 1, 2, pendingAlerts > 0 ? 1 : 0, pendingAlerts],
      trend: "stable" as const,
      trendPct: "0%",
      trendColor: "#94A3B8",
    },
    {
      label: "Adesão média",
      value: avgAdherence,
      suffix: "%",
      icon: TrendingUp,
      iconBg: "rgba(167,139,250,0.15)",
      iconColor: "#A78BFA",
      sparkColor: "#A78BFA",
      sparkPoints: [70, 76, 74, 82, 88, 94, Math.max(avgAdherence, 60)],
      trend: "up" as const,
      trendPct: "8%",
      trendColor: "#34D399",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.4, ease: "easeOut" }}
        >
          <div
            style={{
              background: "#14264e",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.18)",
              padding: "1.25rem",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(96,165,250,0.18), 0 1px 3px rgba(0,0,0,0.25)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.18)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: stat.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <stat.icon style={{ width: 20, height: 20, color: stat.iconColor }} />
              </div>
              <div>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  {stat.value}{stat.suffix}
                </p>
                <p style={{ fontSize: "0.73rem", color: "#8A9BBC", marginTop: 1, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Sparkline points={stat.sparkPoints} color={stat.sparkColor} />
              <div style={{ display: "flex", alignItems: "center", gap: 3, color: stat.trendColor }}>
                {stat.trend === "up"
                  ? <ArrowUpRight style={{ width: 14, height: 14 }} />
                  : <Minus style={{ width: 14, height: 14 }} />
                }
                <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{stat.trendPct}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
