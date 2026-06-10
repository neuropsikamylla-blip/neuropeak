import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Plus, Users, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TherapeuticSession } from "@/components/therapeutic/MundoInterior";

export const dynamic = "force-dynamic";

export default async function MundoInteriorOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as { id: string }).id;

  const therapistUser = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { crp: true, crpStatus: true },
  });
  const crpStatus = therapistUser?.crpStatus ?? "unverified";
  const hasCrp = crpStatus === "verified";

  const [patients, activeSessions] = await Promise.all([
    prisma.patient.findMany({
      where: { therapistId },
      select: { id: true, name: true, diagnosis: true },
      orderBy: { name: "asc" },
    }),
    prisma.therapeuticSession.findMany({
      where: { therapistId, status: "active" },
    }),
  ]);

  const activeByPatient: Record<string, TherapeuticSession> = {};
  for (const s of activeSessions as unknown as TherapeuticSession[]) {
    activeByPatient[s.patientId] = s;
  }

  const activePatients = patients.filter((p) => activeByPatient[p.id]);
  const otherPatients = patients.filter((p) => !activeByPatient[p.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mundo Interior</h1>
          <p className="text-sm text-slate-400">Ferramenta gamificada de apoio ao acompanhamento psicológico</p>
        </div>
      </div>

      {/* Disclaimer obrigatório */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-relaxed">
          <strong>Ferramenta auxiliar de uso mediado.</strong> Não realiza diagnóstico e não substitui acompanhamento psicológico profissional. Deve ser utilizada exclusivamente em sessão conduzida por psicólogo habilitado.
        </p>
      </div>

      {/* Gate de CRP */}
      {crpStatus === "pending" && (
        <div className="flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-4">
          <ShieldCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-200">Verificação em análise</p>
            <p className="text-xs text-yellow-300/80 mt-0.5">Seu documento foi enviado e está sendo analisado. O acesso será liberado após aprovação.</p>
          </div>
        </div>
      )}
      {(crpStatus === "unverified" || crpStatus === "rejected") && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-4">
          <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-red-200">
              {crpStatus === "rejected" ? "Verificação rejeitada" : "CRP não verificado"}
            </p>
            <p className="text-xs text-red-300/80">
              Envie seu CRP e documento comprobatório nas configurações para liberar o acesso.
            </p>
            <Button asChild size="sm" variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/15">
              <Link href="/configuracoes">Ir para Configurações</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Conteúdo bloqueado sem CRP */}
      {hasCrp && activePatients.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
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
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-400/30 bg-indigo-500/10 hover:border-indigo-400/60 transition-all cursor-pointer">
                  <span className="text-3xl">{char?.avatar ?? "🌌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100">{p.name}</p>
                    {char?.name && (
                      <p className="text-xs text-indigo-300">{char.name} · sessão em andamento</p>
                    )}
                    {!char?.name && (
                      <p className="text-xs text-indigo-300">Criando personagem…</p>
                    )}
                  </div>
                  <span className="text-indigo-400 text-xl">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* All patients — só mostra com CRP */}
      {hasCrp && <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          Pacientes ({patients.length})
        </p>
        {patients.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum paciente cadastrado ainda.</p>
        )}
        {otherPatients.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-[#0D2547] hover:border-white/20 transition-all">
            <p className="font-medium text-slate-100">{p.name}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pacientes/${p.id}/mundo-interior`}>
                <Plus className="w-4 h-4 mr-1" />
                Iniciar sessão
              </Link>
            </Button>
          </div>
        ))}
      </div>}
    </div>
  );
}
