"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Calendar, ChevronRight } from "lucide-react";
import { daysSince } from "@/lib/utils";
import type { PatientSummary } from "@/types";
import { motion } from "framer-motion";

interface PatientCardProps {
  patient: PatientSummary;
  index?: number;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp style={{ width: 13, height: 13, color: "#34D399" }} />;
  if (trend === "down") return <TrendingDown style={{ width: 13, height: 13, color: "#F87171" }} />;
  return <Minus style={{ width: 13, height: 13, color: "#94A3B8" }} />;
}

function MiniSparkline({ adherence }: { adherence: number }) {
  const raw = [adherence * 0.68, adherence * 0.78, adherence * 0.72, adherence * 0.88, adherence * 0.85, adherence * 0.94, adherence];
  const W = 68, H = 22;
  const max = Math.max(...raw), min = Math.min(...raw);
  const range = max - min || 1;
  const coords = raw.map((v, i) => ({
    x: (i / (raw.length - 1)) * (W - 4) + 2,
    y: H - 3 - ((v - min) / range) * (H - 8),
  }));
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const p = coords[i - 1], c = coords[i];
    const mx = (p.x + c.x) / 2;
    d += ` C ${mx} ${p.y} ${mx} ${c.y} ${c.x} ${c.y}`;
  }
  const color = adherence >= 80 ? "#34D399" : adherence >= 60 ? "#FBBF24" : "#F87171";
  const last = coords[coords.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

function adherenceBadge(pct: number): React.CSSProperties {
  if (pct >= 80) return { background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" };
  if (pct >= 60) return { background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" };
  if (pct >= 40) return { background: "rgba(255,255,255,0.06)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.12)" };
  return { background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" };
}

function avatarStyle(name: string): { bg: string; color: string } {
  const palettes = [
    { bg: "rgba(96,165,250,0.18)", color: "#60A5FA" },
    { bg: "rgba(74,222,128,0.18)", color: "#4ADE80" },
    { bg: "rgba(192,132,252,0.18)", color: "#C084FC" },
    { bg: "rgba(251,146,60,0.18)", color: "#FB923C" },
    { bg: "rgba(251,113,133,0.18)", color: "#FB7185" },
    { bg: "rgba(45,212,191,0.18)", color: "#2DD4BF" },
  ];
  return palettes[name.charCodeAt(0) % palettes.length];
}

export function PatientCard({ patient, index = 0 }: PatientCardProps) {
  const initials = patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const lastSessionDays = patient.lastSession ? daysSince(patient.lastSession) : null;
  const isInactive = lastSessionDays !== null && lastSessionDays > 7;
  const av = avatarStyle(patient.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      <Link href={`/pacientes/${patient.id}`} style={{ display: "block" }}>
        <div
          style={{
            background: "#14264e",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(96,165,250,0.16), 0 1px 4px rgba(0,0,0,0.25)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          {/* Blue left accent bar */}
          <div style={{ width: 4, alignSelf: "stretch", background: "#60A5FA", flexShrink: 0 }} />

          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: av.bg, color: av.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.88rem", flexShrink: 0,
            border: `1.5px solid ${av.color}44`,
            margin: "0.875rem 0 0.875rem 1rem",
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, marginLeft: 12, paddingTop: "0.875rem", paddingBottom: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 600, color: "#F1F5F9", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {patient.name}
              </span>
              {patient.alertCount > 0 && (
                <AlertCircle style={{ width: 13, height: 13, color: "#FBBF24", flexShrink: 0 }} />
              )}
              {isInactive && (
                <span style={{ fontSize: "0.62rem", fontWeight: 600, borderRadius: 99, padding: "1px 6px", background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", flexShrink: 0 }}>
                  Inativo
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, color: "#8A9BBC", fontSize: "0.76rem" }}>
              <Calendar style={{ width: 10, height: 10 }} />
              {lastSessionDays === null
                ? "Sem sessões"
                : lastSessionDays === 0
                ? "Última sessão: hoje"
                : `Última sessão: ${lastSessionDays} dias atrás`}
            </div>
          </div>

          {/* Sparkline */}
          <div style={{ flexShrink: 0, marginRight: 12 }}>
            <MiniSparkline adherence={patient.adherence} />
          </div>

          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginRight: 12 }}>
            <TrendIcon trend={patient.trend} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, borderRadius: 99, padding: "3px 10px", ...adherenceBadge(patient.adherence) }}>
              {patient.adherence}%
            </span>
            <ChevronRight style={{ width: 15, height: 15, color: "#64748B" }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
