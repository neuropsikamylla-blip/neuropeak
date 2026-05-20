"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Bell, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatsOverviewProps {
  totalPatients: number;
  sessionsThisWeek: number;
  pendingAlerts: number;
  avgAdherence: number;
}

export function StatsOverview({
  totalPatients,
  sessionsThisWeek,
  pendingAlerts,
  avgAdherence,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Total de Pacientes",
      value: totalPatients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      suffix: "",
    },
    {
      label: "Sessões esta semana",
      value: sessionsThisWeek,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
      suffix: "",
    },
    {
      label: "Alertas pendentes",
      value: pendingAlerts,
      icon: Bell,
      color: pendingAlerts > 0 ? "text-red-600" : "text-gray-600",
      bg: pendingAlerts > 0 ? "bg-red-50" : "bg-gray-50",
      suffix: "",
    },
    {
      label: "Adesão média",
      value: avgAdherence,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      suffix: "%",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}{stat.suffix}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
