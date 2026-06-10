"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldX, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface CrpRequest {
  id: string;
  name: string;
  email: string;
  crp: string;
  crpStatus: "pending" | "verified" | "rejected";
  crpDocument: string | null;
  crpSubmittedAt: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  verified: "Aprovado",
  rejected: "Rejeitado",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CrpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const user = session?.user as { email?: string } | undefined;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/crp-verification")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) { router.replace("/dashboard"); return; }
        setRequests(data);
      })
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [status, router]);

  async function decide(userId: string, decision: "verified" | "rejected") {
    setActing(userId);
    try {
      const res = await fetch("/api/crp-verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: decision }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) =>
        prev.map((r) => (r.id === userId ? { ...r, crpStatus: decision } : r))
      );
      toast({ title: decision === "verified" ? "CRP aprovado" : "CRP rejeitado" });
    } catch {
      toast({ title: "Erro ao processar", variant: "destructive" });
    } finally {
      setActing(null);
    }
  }

  async function openDocument(path: string) {
    const res = await fetch(`/api/crp-verification/document?path=${encodeURIComponent(path)}`);
    if (!res.ok) { toast({ title: "Erro ao abrir documento", variant: "destructive" }); return; }
    const { url } = await res.json();
    window.open(url, "_blank");
  }

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Verificação de CRP</h1>
          <p className="text-sm text-slate-400">Aprovar ou rejeitar solicitações de acesso ao Mundo Interior</p>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-16 bg-[#0D2547] rounded-xl border border-white/10">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma solicitação ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-[#0D2547] rounded-xl border border-white/10 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-100">{r.name}</p>
                <p className="text-sm text-slate-400">{r.email}</p>
                <p className="text-sm text-blue-300 font-medium mt-0.5">CRP {r.crp}</p>
                {r.crpSubmittedAt && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enviado em {new Date(r.crpSubmittedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                r.crpStatus === "verified" ? "bg-green-500/15 text-green-300 border border-green-500/30" :
                r.crpStatus === "rejected" ? "bg-red-500/15 text-red-300 border border-red-500/30" :
                "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
              }`}>
                {STATUS_LABEL[r.crpStatus] ?? r.crpStatus}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {r.crpDocument && (
                <Button variant="outline" size="sm" onClick={() => openDocument(r.crpDocument!)}>
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Ver documento
                </Button>
              )}
              {r.crpStatus === "pending" && (
                <>
                  <Button size="sm" onClick={() => decide(r.id, "verified")} disabled={acting === r.id}
                    className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")} disabled={acting === r.id}
                    className="border-red-500/40 text-red-300 hover:bg-red-500/15">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Rejeitar
                  </Button>
                </>
              )}
              {r.crpStatus === "verified" && (
                <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")} disabled={acting === r.id}
                  className="border-red-500/40 text-red-300 hover:bg-red-500/15 text-xs">
                  <ShieldX className="w-3.5 h-3.5 mr-1" />
                  Revogar acesso
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Toaster />
    </div>
  );
}
