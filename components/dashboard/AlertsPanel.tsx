"use client";

import { useState } from "react";
import { AlertCircle, Clock, TrendingDown, CheckCircle2, Loader2, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: "MISSED_SESSION" | "PERFORMANCE_DROP" | "GOAL_REACHED" | "CYCLE_COMPLETE";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

function AlertIcon({ type }: { type: Alert["type"] }) {
  switch (type) {
    case "MISSED_SESSION":
      return <Clock style={{ width: 17, height: 17, color: "#FBBF24", flexShrink: 0 }} />;
    case "PERFORMANCE_DROP":
      return <TrendingDown style={{ width: 17, height: 17, color: "#F87171", flexShrink: 0 }} />;
    case "GOAL_REACHED":
      return <CheckCircle2 style={{ width: 17, height: 17, color: "#34D399", flexShrink: 0 }} />;
    case "CYCLE_COMPLETE":
      return <CheckCircle2 style={{ width: 17, height: 17, color: "#60A5FA", flexShrink: 0 }} />;
  }
}

function alertBadge(type: Alert["type"]): React.CSSProperties {
  switch (type) {
    case "MISSED_SESSION": return { background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" };
    case "PERFORMANCE_DROP": return { background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" };
    case "GOAL_REACHED": return { background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" };
    case "CYCLE_COMPLETE": return { background: "rgba(96,165,250,0.15)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.3)" };
  }
}

function alertLabel(type: Alert["type"]): string {
  switch (type) {
    case "MISSED_SESSION": return "Sessão Perdida";
    case "PERFORMANCE_DROP": return "Queda de Desempenho";
    case "GOAL_REACHED": return "Meta Atingida";
    case "CYCLE_COMPLETE": return "Ciclo Concluído";
  }
}

export function AlertsPanel({ alerts: initial }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const unread = alerts.filter((a) => !a.isRead);

  async function markRead(alertId: string) {
    setLoading(alertId);
    try {
      await fetch(`/api/alerts/${alertId}`, { method: "PATCH" });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
    } finally {
      setLoading(null);
    }
  }

  async function markAllRead() {
    const unreadIds = alerts.filter((a) => !a.isRead).map((a) => a.id);
    setLoading("all");
    await Promise.all(unreadIds.map((id) => fetch(`/api/alerts/${id}`, { method: "PATCH" })));
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setLoading(null);
  }

  return (
    <div style={{
      background: "#0D2547",
      borderRadius: 20,
      border: "1px solid rgba(148,163,184,0.14)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.18)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle style={{ width: 18, height: 18, color: "#F87171" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F4F7FB" }}>Alertas</span>
          {unread.length > 0 && (
            <span style={{ fontSize: "0.68rem", fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }}>
              {unread.length}
            </span>
          )}
        </div>
        {unread.length > 1 && (
          <button
            style={{ fontSize: "0.73rem", color: "#A8B3C7", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, transition: "color 0.15s" }}
            onClick={markAllRead}
            disabled={loading === "all"}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#A8B3C7"; }}
          >
            {loading === "all" ? <Loader2 style={{ width: 12, height: 12, display: "inline" }} className="animate-spin" /> : "Marcar todos"}
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "0.875rem 1rem 1rem" }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
              <Bell style={{ width: 24, height: 24, color: "rgba(248,113,113,0.55)" }} />
            </div>
            <p style={{ fontSize: "0.875rem", color: "#A8B3C7", fontWeight: 500 }}>Nenhum alerta no momento.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.slice(0, 8).map((alert) => (
              <div
                key={alert.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "0.75rem",
                  borderRadius: 12,
                  background: alert.isRead ? "#0A1E3A" : "#102E59",
                  border: `1px solid ${alert.isRead ? "rgba(148,163,184,0.1)" : "rgba(255,255,255,0.1)"}`,
                  opacity: alert.isRead ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <AlertIcon type={alert.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.67rem", fontWeight: 600, borderRadius: 99, padding: "2px 8px", display: "inline-block", marginBottom: 4, ...alertBadge(alert.type) }}>
                    {alertLabel(alert.type)}
                  </span>
                  <div style={{ fontSize: "0.67rem", color: "#A8B3C7" }}>{formatDate(alert.createdAt)}</div>
                  <Link
                    href={`/pacientes/${alert.patientId}`}
                    style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#60A5FA", marginTop: 2 }}
                  >
                    {alert.patientName}
                  </Link>
                  <p style={{ fontSize: "0.75rem", color: "#B6C4DE", marginTop: 2 }}>{alert.message}</p>
                  {!alert.isRead && (
                    <button
                      style={{ marginTop: 6, fontSize: "0.71rem", color: "#A8B3C7", background: "transparent", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
                      onClick={() => markRead(alert.id)}
                      disabled={loading === alert.id}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#A8B3C7"; }}
                    >
                      {loading === alert.id ? <Loader2 style={{ width: 11, height: 11, display: "inline" }} className="animate-spin" /> : "Marcar como lido"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
