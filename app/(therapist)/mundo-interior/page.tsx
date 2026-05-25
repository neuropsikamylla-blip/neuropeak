import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TherapeuticSession } from "@/components/therapeutic/MundoInterior";

export const dynamic = "force-dynamic";

export default async function MundoInteriorOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const [{ data: patients }, { data: activeSessions }] = await Promise.all([
    supabase
      .from("Patient")
      .select("id, name, diagnosis")
      .eq("therapistId", therapistId)
      .order("name"),
    supabase
      .from("TherapeuticSession")
      .select("*")
      .eq("therapistId", therapistId)
      .eq("status", "active"),
  ]);

  const activeByPatient: Record<string, TherapeuticSession> = {};
  for (const s of (activeSessions ?? []) as TherapeuticSession[]) {
    activeByPatient[s.patientId] = s;
  }

  const activePatients = (patients ?? []).filter((p) => activeByPatient[p.id]);
  const otherPatients = (patients ?? []).filter((p) => !activeByPatient[p.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mundo Interior</h1>
          <p className="text-sm text-gray-500">Módulo psicoterapêutico gamificado — use em sessão com o paciente</p>
        </div>
      </div>

      {/* Active sessions */}
      {activePatients.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Sessões ativas ({activePatients.length})
          </p>
          {activePatients.map((p) => {
            const s = activeByPatient[p.id];
            const char = s.characterData as { name?: string; avatar?: string } | null;
            return (
              <Link key={p.id} href={`/pacientes/${p.id}/mundo-interior`}>
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer">
                  <span className="text-3xl">{char?.avatar ?? "🌌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {char?.name && (
                      <p className="text-xs text-indigo-600">{char.name} · sessão em andamento</p>
                    )}
                    {!char?.name && (
                      <p className="text-xs text-indigo-600">Criando personagem…</p>
                    )}
                  </div>
                  <span className="text-indigo-400 text-xl">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* All patients */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          Pacientes ({(patients ?? []).length})
        </p>
        {(patients ?? []).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum paciente cadastrado ainda.</p>
        )}
        {otherPatients.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all">
            <div>
              <p className="font-medium text-gray-800">{p.name}</p>
              {p.diagnosis && <p className="text-xs text-gray-400">{p.diagnosis}</p>}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pacientes/${p.id}/mundo-interior`}>
                <Plus className="w-4 h-4 mr-1" />
                Iniciar sessão
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
