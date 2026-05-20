"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { formatDate, daysSince } from "@/lib/utils";
import type { PatientSummary } from "@/types";
import { motion } from "framer-motion";

interface PatientCardProps {
  patient: PatientSummary;
  index?: number;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

function adherenceColor(pct: number): "success" | "warning" | "destructive" | "secondary" {
  if (pct >= 80) return "success";
  if (pct >= 60) return "warning";
  if (pct >= 40) return "secondary";
  return "destructive";
}

export function PatientCard({ patient, index = 0 }: PatientCardProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const lastSessionDays = patient.lastSession ? daysSince(patient.lastSession) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/pacientes/${patient.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                  {patient.alertCount > 0 && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {lastSessionDays === null
                    ? "Sem sessões"
                    : lastSessionDays === 0
                    ? "Última sessão: hoje"
                    : `Última sessão: ${lastSessionDays} dias atrás`}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <TrendIcon trend={patient.trend} />
                  <Badge variant={adherenceColor(patient.adherence)}>
                    {patient.adherence}%
                  </Badge>
                </div>
                {lastSessionDays !== null && lastSessionDays > 7 && (
                  <Badge variant="destructive" className="text-xs">
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
