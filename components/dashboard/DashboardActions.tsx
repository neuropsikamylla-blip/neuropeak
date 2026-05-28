"use client";

import Link from "next/link";
import { UserPlus, FileText } from "lucide-react";

export function DashboardActions() {
  return (
    <div className="flex gap-3">
      <Link
        href="/relatorios"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
        style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#DBEAFE"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
      >
        <FileText style={{ width: 15, height: 15 }} />
        Relatórios
      </Link>
      <Link
        href="/pacientes/novo"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
        style={{ background: "#2563EB", color: "white", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", border: "none" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(37,99,235,0.45)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#2563EB"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
      >
        <UserPlus style={{ width: 15, height: 15 }} />
        Novo Paciente
      </Link>
    </div>
  );
}
