"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TherapeuticSession } from "@/components/therapeutic/MundoInterior";

type Theme = "CLINICAL" | "COLORFUL" | "GAMIFIED";

const styles = {
  CLINICAL: {
    bg: "bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 min-h-screen",
    title: "text-slate-800 text-xl font-bold",
    sub: "text-slate-500",
    card: "bg-white rounded-2xl shadow-sm border border-slate-200/70 p-5",
    cardActive: "bg-white rounded-2xl shadow-md border-2 border-indigo-300 p-5 hover:shadow-lg transition-all",
    cardSoon: "bg-slate-50 rounded-2xl border border-slate-200/50 p-5 opacity-60",
    badge: "bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full",
    badgeSoon: "bg-slate-100 text-slate-400 text-xs px-2 py-0.5 rounded-full",
    arrow: "text-indigo-400",
  },
  COLORFUL: {
    bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 min-h-screen",
    title: "text-purple-700 text-2xl font-bold",
    sub: "text-purple-400",
    card: "bg-white rounded-2xl shadow border-2 border-purple-100 p-5",
    cardActive: "bg-white rounded-2xl shadow-lg border-2 border-purple-300 p-5 hover:border-purple-400 transition-all",
    cardSoon: "bg-purple-50/50 rounded-2xl border-2 border-purple-100 p-5 opacity-60",
    badge: "bg-purple-100 text-purple-600 text-xs font-medium px-2 py-0.5 rounded-full",
    badgeSoon: "bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full",
    arrow: "text-purple-400",
  },
  GAMIFIED: {
    bg: "bg-gray-950 min-h-screen",
    title: "text-cyan-400 text-xl font-black tracking-wide",
    sub: "text-gray-400",
    card: "bg-gray-800 rounded-2xl border border-gray-700 p-5",
    cardActive: "bg-gray-800 rounded-2xl border border-cyan-500/50 p-5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all",
    cardSoon: "bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 opacity-50",
    badge: "bg-cyan-900/50 text-cyan-400 text-xs font-medium px-2 py-0.5 rounded-full border border-cyan-500/30",
    badgeSoon: "bg-gray-700 text-gray-500 text-xs px-2 py-0.5 rounded-full",
    arrow: "text-cyan-400",
  },
};

export default function ExpressaoPage() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const user = authSession?.user as { role?: string; theme?: string; name?: string } | undefined;
  const theme = (user?.theme ?? "CLINICAL") as Theme;
  const s = styles[theme];

  const [mundoInteriorSession, setMundoInteriorSession] = useState<TherapeuticSession | null | "loading">("loading");

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if (user?.role !== "PATIENT") { router.replace("/login"); return; }

    fetch("/api/therapeutic-sessions")
      .then(r => r.ok ? r.json() : null)
      .then(data => setMundoInteriorSession(data))
      .catch(() => setMundoInteriorSession(null));
  }, [status, user, router]);

  const hasActiveSession = mundoInteriorSession && mundoInteriorSession !== "loading";

  return (
    <div className={`${s.bg} p-4 space-y-5`}>
      {/* Header */}
      <div className="pt-2">
        <h1 className={s.title}>
          {theme === "COLORFUL" ? "Expressão ✨" : theme === "GAMIFIED" ? "EXPRESSÃO" : "Expressão"}
        </h1>
        <p className={`text-sm mt-1 ${s.sub}`}>
          {theme === "GAMIFIED"
            ? "Atividades de autoconhecimento e regulação"
            : theme === "COLORFUL"
            ? "Explore seus sentimentos e emoções 💫"
            : "Atividades de autoconhecimento e regulação emocional"}
        </p>
      </div>

      {/* Mundo Interior */}
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
          Disponível
        </p>

        {hasActiveSession ? (
          <Link href="/treino/mundo-interior">
            <div className={s.cardActive}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="text-4xl">🌌</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-800"}`}>
                      Mundo Interior
                    </p>
                    <span className={s.badge}>Sessão ativa</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.sub}`}>
                    {(mundoInteriorSession as TherapeuticSession).characterData?.name
                      ? `${(mundoInteriorSession as TherapeuticSession).characterData.avatar} ${(mundoInteriorSession as TherapeuticSession).characterData.name} está esperando`
                      : "Sua jornada continua aqui"}
                  </p>
                </div>
                <span className={`text-xl ${s.arrow}`}>›</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className={s.card}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌌</span>
              <div className="flex-1">
                <p className={`font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-800"}`}>
                  Mundo Interior
                </p>
                <p className={`text-xs mt-0.5 ${s.sub}`}>
                  {mundoInteriorSession === "loading"
                    ? "Verificando..."
                    : "Aguardando sua terapeuta iniciar uma sessão"}
                </p>
              </div>
              {mundoInteriorSession === "loading" && (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin opacity-40" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Em breve */}
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${theme === "GAMIFIED" ? "text-gray-500" : "text-gray-400"}`}>
          Em breve
        </p>
        <div className="space-y-3">
          {[
            { icon: "🎨", name: "Diário Emocional", desc: "Registre como você está se sentindo" },
            { icon: "🧘", name: "Respiração e Calma", desc: "Técnicas de regulação emocional" },
            { icon: "📖", name: "Histórias", desc: "Narrativas terapêuticas interativas" },
          ].map(item => (
            <div key={item.name} className={s.cardSoon}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>{item.name}</p>
                    <span className={s.badgeSoon}>Em breve</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.sub}`}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
