"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { TherapeuticSession } from "@/components/therapeutic/MundoInterior";
import { REGIONS } from "@/components/therapeutic/MundoInterior";

const PHASE_LABELS: Record<string, string> = {
  character_creation: "Criando personagem",
  map: "Escolhendo região",
  board: "Explorando região",
  tool_unlock: "Desbloqueando ferramenta",
  complete: "Jornada completa",
};

export default function MundoInteriorTherapistPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [sessions, setSessions] = useState<TherapeuticSession[]>([]);
  const [activeSession, setActiveSession] = useState<TherapeuticSession | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notesRef = useRef(notes);
  notesRef.current = notes;

  const loadSessions = useCallback(async () => {
    const res = await fetch(`/api/therapeutic-sessions?patientId=${patientId}`);
    if (res.ok) {
      const data: TherapeuticSession[] = await res.json();
      setSessions(data);
      const active = data.find(s => s.status === "active") ?? null;
      setActiveSession(active);
      if (active && !notesRef.current) setNotes(active.therapistNotes ?? "");
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    loadSessions();
    pollRef.current = setInterval(loadSessions, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadSessions]);

  async function createSession() {
    setCreating(true);
    try {
      const res = await fetch("/api/therapeutic-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Sessão iniciada! Peça ao paciente para acessar o Mundo Interior." });
      await loadSessions();
    } catch {
      toast({ title: "Erro ao criar sessão", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function saveNotes() {
    if (!activeSession) return;
    setSaving(true);
    await fetch(`/api/therapeutic-sessions/${activeSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ therapistNotes: notes }),
    });
    setSaving(false);
    toast({ title: "Notas salvas" });
  }

  async function closeSession() {
    if (!activeSession) return;
    await fetch(`/api/therapeutic-sessions/${activeSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    toast({ title: "Sessão encerrada" });
    await loadSessions();
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Carregando...</div>;
  }

  const char = activeSession?.characterData;
  const region = REGIONS.find(r => r.id === activeSession?.currentRegion);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pacientes/${patientId}`} aria-label="Voltar"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-100">🌌 Mundo Interior</h1>
          <p className="text-sm text-slate-400">Ferramenta gamificada de apoio ao acompanhamento psicológico</p>
        </div>
        <Button onClick={createSession} disabled={creating || !!activeSession} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          {creating ? "Criando..." : "Nova sessão"}
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200">
          Ferramenta auxiliar de apoio ao acompanhamento psicológico. Não realiza diagnóstico e não substitui psicoterapia. Use exclusivamente em sessão mediada pelo psicólogo.
        </p>
      </div>

      {/* Active session */}
      {activeSession ? (
        <div className="space-y-4">
          {/* Status card */}
          <div className="rounded-2xl border-2 border-indigo-400/30 bg-indigo-500/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-indigo-200">Sessão ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={loadSessions} aria-label="Atualizar sessões" className="text-slate-400 hover:text-slate-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={closeSession} className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">
                  Encerrar
                </button>
              </div>
            </div>

            {/* Phase */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-200 font-medium bg-indigo-500/20 px-2 py-0.5 rounded-full">
                {PHASE_LABELS[activeSession.phase] ?? activeSession.phase}
              </span>
              {region && (
                <span className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {region.emoji} {region.name} — casa {activeSession.currentHouseIndex + 1}/6
                </span>
              )}
            </div>

            {/* Character */}
            {char?.name && (
              <div className="bg-[#0f2147] rounded-xl p-3 space-y-1.5 border border-indigo-400/20">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personagem</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{char.avatar}</span>
                  <div>
                    <p className="font-bold text-slate-100">{char.name}</p>
                    <p className="text-xs text-slate-400">{char.power} · evita: {char.fear}</p>
                    <p className="text-xs text-slate-500">{char.energyType}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Unlocked tools */}
            {activeSession.unlockedTools.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeSession.unlockedTools.map(t => (
                  <span key={t} className="text-xs bg-amber-500/10 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full">⭐ {t}</span>
                ))}
              </div>
            )}

            {/* Progress regions */}
            <div className="flex gap-2 flex-wrap">
              {REGIONS.map(r => {
                const done = activeSession.completedRegions.includes(r.id);
                const current = activeSession.currentRegion === r.id;
                return (
                  <span key={r.id} className={`text-xs px-2 py-0.5 rounded-full border ${done ? "bg-green-500/15 text-green-300 border-green-500/30" : current ? "bg-blue-500/15 text-blue-300 border-blue-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                    {r.emoji} {done ? "✓" : current ? "..." : "○"}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Responses */}
          {activeSession.responses.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Respostas do paciente ({activeSession.responses.length})
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto rounded-xl">
                {[...activeSession.responses].reverse().map((r, i) => (
                  <div key={i} className="bg-[#0f2147] rounded-xl p-3 border border-white/10 space-y-1">
                    <p className="text-xs text-slate-500">{r.houseId.replace(/_/g, " · ")} · {new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-xs text-slate-400 italic">"{r.question}"</p>
                    <p className="text-sm text-slate-100 font-medium">{r.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Therapist notes */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-200">Notas do terapeuta</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observações clínicas, hipóteses, pontos para aprofundar..."
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              rows={4}
            />
            <Button onClick={saveNotes} disabled={saving} size="sm" variant="outline">
              {saving ? "Salvando..." : "Salvar notas"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-white/15 p-8 text-center space-y-3">
          <span className="text-5xl">🌌</span>
          <p className="font-semibold text-slate-200">Nenhuma sessão ativa</p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">Inicie uma nova sessão e peça ao paciente para acessar o Mundo Interior no aplicativo.</p>
          <Button onClick={createSession} disabled={creating}>
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Criando..." : "Iniciar sessão"}
          </Button>
        </div>
      )}

      {/* Session history */}
      {sessions.filter(s => s.status !== "active").length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-200">Sessões anteriores</p>
          <div className="space-y-2">
            {sessions.filter(s => s.status !== "active").slice(0, 5).map(s => (
              <div key={s.id} className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">
                    {s.characterData.avatar} {s.characterData.name || "Sem personagem"} · {s.responses.length} respostas
                  </p>
                  <p className="text-xs text-slate-500">{s.completedRegions.length}/{REGIONS.length} regiões</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "completed" ? "bg-green-500/15 text-green-300" : "bg-white/10 text-slate-400"}`}>
                  {s.status === "completed" ? "completo" : "pausado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
