"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, TrendingDown, CheckCircle2, Loader2 } from "lucide-react";
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
      return <Clock className="w-5 h-5 text-orange-500" />;
    case "PERFORMANCE_DROP":
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    case "GOAL_REACHED":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "CYCLE_COMPLETE":
      return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
  }
}

function alertVariant(type: Alert["type"]): "warning" | "destructive" | "success" | "info" {
  switch (type) {
    case "MISSED_SESSION":
      return "warning";
    case "PERFORMANCE_DROP":
      return "destructive";
    case "GOAL_REACHED":
      return "success";
    case "CYCLE_COMPLETE":
      return "info";
  }
}

function alertLabel(type: Alert["type"]): string {
  switch (type) {
    case "MISSED_SESSION":
      return "Sessão Perdida";
    case "PERFORMANCE_DROP":
      return "Queda de Desempenho";
    case "GOAL_REACHED":
      return "Meta Atingida";
    case "CYCLE_COMPLETE":
      return "Ciclo Concluído";
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
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    } finally {
      setLoading(null);
    }
  }

  async function markAllRead() {
    const unreadIds = alerts.filter((a) => !a.isRead).map((a) => a.id);
    setLoading("all");
    await Promise.all(
      unreadIds.map((id) => fetch(`/api/alerts/${id}`, { method: "PATCH" }))
    );
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setLoading(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Alertas
          {unread.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unread.length}
            </Badge>
          )}
        </CardTitle>
        {unread.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-gray-500"
            onClick={markAllRead}
            disabled={loading === "all"}
          >
            {loading === "all" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Marcar todos"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum alerta no momento.</p>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 8).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-opacity ${
                  alert.isRead ? "bg-gray-50 opacity-50" : "bg-white"
                }`}
              >
                <AlertIcon type={alert.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={alertVariant(alert.type)} className="text-xs">
                      {alertLabel(alert.type)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                  <Link
                    href={`/pacientes/${alert.patientId}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {alert.patientName}
                  </Link>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                </div>
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 flex-shrink-0"
                    onClick={() => markRead(alert.id)}
                    disabled={loading === alert.id}
                  >
                    {loading === alert.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Lido"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
