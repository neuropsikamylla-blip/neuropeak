import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateAge } from "@/lib/utils";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, DOMAIN_COLORS, type Domain, type Theme, type SessionData } from "@/types";
import { planExerciseIds } from "@/lib/exercise-plan";
import { Trophy, Flame, Star } from "lucide-react";
import { ExerciseIcon } from "@/components/ExerciseIcon";

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const patientBase = await prisma.patient.findUnique({ where: { id: patientId } });

  if (!patientBase) redirect("/login");

  const [trainingPlans, sessions, achievements] = await Promise.all([
    prisma.trainingPlan.findMany({ where: { patientId, isActive: true }, take: 1 }),
    prisma.session.findMany({ where: { patientId }, orderBy: { completedAt: "desc" }, take: 50 }),
    prisma.achievement.findMany({ where: { patientId }, orderBy: { unlockedAt: "desc" }, take: 3 }),
  ]);

  const patient = {
    ...patientBase,
    trainingPlans,
    sessions: sessions as unknown as SessionData[],
    achievements,
  };

  const theme = patient.theme as Theme;
  const activePlan = patient.trainingPlans[0];
  const exercises = activePlan ? planExerciseIds(activePlan.exercises) : [];

  const typedSessions = patient.sessions as SessionData[];
  const typedAchievements = patient.achievements as unknown as Array<{ id: string; icon: string; title: string; unlockedAt: string }>;

  // Cycle progress
  const cycleTarget = activePlan ? activePlan.frequency * 4 : 0;
  const cycleSessionsCount = activePlan
    ? typedSessions.filter(
        (s) => new Date(s.completedAt) >= new Date(activePlan.createdAt)
      ).length
    : 0;
  const cycleComplete = cycleSessionsCount >= cycleTarget && cycleTarget > 0;

  // Count sessions today (by local date)
  const now = new Date();
  const todaySessions = typedSessions.filter((s) => {
    const d = new Date(s.completedAt);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
  const totalPoints = Math.round(typedSessions.reduce((sum, s) => sum + s.score, 0));

  // Streak (unique days)
  const uniqueDays = new Set(
    typedSessions.map((s) => {
      const d = new Date(s.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const styles = {
    CLINICAL: {
      bg: "np-app-bg",
      header: "bg-[#0D2547] border border-white/10 shadow-sm rounded-2xl",
      card: "bg-[#0D2547] rounded-2xl shadow-sm border border-white/10",
      title: "text-slate-100 text-2xl font-bold tracking-tight",
      sub: "text-slate-400",
      accent: "text-indigo-400",
      exCard: "bg-[#0D2547] rounded-2xl border border-white/10 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all duration-200",
      exDone: "bg-[#0A1E3A] rounded-2xl border border-white/5 opacity-70",
      stat: "bg-[#0D2547] rounded-2xl border border-white/10 shadow-sm",
      progress: "bg-black/25",
      progressBar: "bg-gradient-to-r from-blue-500 to-indigo-400",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-teal-50 via-cyan-50 to-yellow-50",
      header: "bg-white/80 backdrop-blur rounded-2xl mb-4 shadow",
      card: "bg-white rounded-2xl shadow-lg border-2 border-teal-100",
      title: "text-teal-700 text-3xl font-bold",
      sub: "text-teal-400",
      accent: "text-cyan-500",
      exCard: "bg-white rounded-2xl border-2 border-teal-100 hover:border-teal-400 hover:shadow-lg transition-all",
      exDone: "bg-teal-50 rounded-2xl border-2 border-teal-100 opacity-60",
      stat: "bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl",
      progress: "bg-teal-200",
      progressBar: "bg-teal-500",
    },
    GAMIFIED: {
      bg: "bg-gray-950",
      header: "bg-gray-800 rounded-2xl mb-4 border border-cyan-500/20",
      card: "bg-gray-800 rounded-2xl border border-cyan-500/20",
      title: "text-cyan-400 text-2xl font-black tracking-wide",
      sub: "text-gray-400",
      accent: "text-cyan-400",
      exCard: "bg-gray-800 rounded-2xl border border-gray-700 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all",
      exDone: "bg-gray-800 rounded-2xl border border-gray-700 opacity-50",
      stat: "bg-gray-700 rounded-2xl",
      progress: "bg-gray-700",
      progressBar: "bg-cyan-500",
    },
  };

  const s = styles[theme];
  // Clínico e Gamificado têm fundo escuro → textos claros; só Colorido é claro.
  const isDark = theme === "GAMIFIED" || theme === "CLINICAL";
  const firstName = patient.name.split(" ")[0];

  return (
    <div className={`min-h-screen ${s.bg} p-4 space-y-4`}>
      {/* Welcome card */}
      <div className={`p-5 ${s.header}`}>
        <h1 className={s.title}>
          {theme === "COLORFUL" ? `Olá, ${firstName}! 👋` : theme === "GAMIFIED" ? `MISSÃO ATIVA — ${firstName.toUpperCase()}` : `Bom treino, ${firstName}`}
        </h1>
        <p className={`text-sm mt-1 ${s.sub}`}>
          {theme === "GAMIFIED"
            ? "Complete seus exercícios para ganhar XP!"
            : theme === "COLORFUL"
            ? "Hora de treinar o cérebro! 🧠✨"
            : "Treino cognitivo personalizado para você"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 text-center ${s.stat}`}>
          <Flame className={`w-5 h-5 mx-auto mb-1 ${uniqueDays.size > 0 ? "text-orange-500" : "text-gray-400"}`} />
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{uniqueDays.size}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Dias ativos 🔥" : "Dias"}</p>
        </div>
        <div className={`p-3 text-center ${s.stat}`}>
          <Trophy className={`w-5 h-5 mx-auto mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-yellow-500"}`} />
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{totalPoints}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Pontos ⭐" : "Pontos"}</p>
        </div>
        <div className={`p-3 text-center ${s.stat}`}>
          <Star className={`w-5 h-5 mx-auto mb-1 ${theme === "GAMIFIED" ? "text-yellow-400" : "text-teal-500"}`} />
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{typedAchievements.length}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Conquistas 🏅" : "Conquistas"}</p>
        </div>
      </div>

      {/* Cycle progress */}
      {activePlan && cycleTarget > 0 && (
        <div className={`p-4 ${s.card}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {theme === "GAMIFIED" ? "PROGRESSO DO CICLO" : theme === "COLORFUL" ? "Progresso do ciclo 📈" : "Progresso do ciclo"}
            </span>
            <span className={`text-sm font-bold ${s.accent}`}>
              {Math.min(cycleSessionsCount, cycleTarget)}/{cycleTarget}
            </span>
          </div>
          <div className={`h-2.5 rounded-full ${s.progress}`}>
            <div
              className={`h-full rounded-full transition-all ${s.progressBar}`}
              style={{ width: `${Math.min(100, Math.round((cycleSessionsCount / cycleTarget) * 100))}%` }}
            />
          </div>
          {cycleComplete ? (
            <p className="text-xs text-green-500 mt-2 font-medium text-center">
              {theme === "GAMIFIED" ? "✓ CICLO COMPLETO — Aguarde nova missão do terapeuta" : theme === "COLORFUL" ? "🎊 Ciclo concluído! Aguarde seu terapeuta configurar o próximo." : "Ciclo concluído. Aguarde seu terapeuta configurar o próximo."}
            </p>
          ) : (
            <p className={`text-xs mt-2 ${s.sub}`}>
              {cycleTarget - cycleSessionsCount} {cycleTarget - cycleSessionsCount === 1 ? "sessão restante" : "sessões restantes"} neste ciclo
            </p>
          )}
        </div>
      )}

      {/* Today's plan */}
      <div>
        <h2 className={`font-bold mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-teal-700 text-lg" : "text-slate-200"}`}>
          {theme === "GAMIFIED" ? "EXERCÍCIOS DE HOJE" : theme === "COLORFUL" ? "Seu treino de hoje 🎯" : "Treino de hoje"}
        </h2>

        {exercises.length === 0 ? (
          <div className={`p-6 text-center ${s.card}`}>
            <p className={s.sub}>Nenhum exercício configurado ainda.</p>
            <p className={`text-sm mt-1 ${s.sub}`}>Aguarde seu terapeuta configurar o plano.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exId) => {
              const ex = EXERCISE_DEFINITIONS[exId as keyof typeof EXERCISE_DEFINITIONS];
              if (!ex) return null;
              const doneToday = todaySessions.some((s) => s.exerciseId === exId);

              const domainColor = DOMAIN_COLORS[ex.domain as Domain] ?? "#6366f1";
              const cardContent = (
                <div
                  className={`p-4 flex items-center gap-4 overflow-hidden relative ${doneToday ? s.exDone : `cursor-pointer ${s.exCard}`}`}
                  style={theme === "CLINICAL" ? { borderLeft: `3px solid ${doneToday ? "#cbd5e1" : domainColor}` } : undefined}
                >
                  <ExerciseIcon id={exId} emoji={ex.icon} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${theme === "COLORFUL" ? "text-gray-800" : "text-gray-100"}`}>
                        {ex.name}
                      </p>
                      {doneToday && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {theme === "GAMIFIED" ? "COMPLETO" : "Concluído"}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${s.sub}`}>{ex.description}</p>
                    {theme === "CLINICAL" ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: domainColor + "18", color: domainColor }}
                        >
                          {DOMAIN_LABELS[ex.domain as Domain]}
                        </span>
                        <span className="text-xs text-slate-400">~{ex.estimatedMinutes} min</span>
                      </div>
                    ) : (
                      <p className={`text-xs mt-0.5 ${s.accent}`}>
                        {DOMAIN_LABELS[ex.domain as Domain]} · ~{ex.estimatedMinutes}min
                      </p>
                    )}
                  </div>
                  {!doneToday && (
                    <span className={`text-xl flex-shrink-0 ${theme === "GAMIFIED" ? "text-cyan-400" : theme === "CLINICAL" ? "text-indigo-400" : "text-blue-500"}`}>›</span>
                  )}
                </div>
              );

              return doneToday ? (
                <div key={exId}>{cardContent}</div>
              ) : (
                <Link key={exId} href={`/treino/${exId}`}>{cardContent}</Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent achievements */}
      {typedAchievements.length > 0 && (
        <div>
          <h2 className={`font-bold mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-teal-700 text-lg" : "text-slate-200"}`}>
            {theme === "COLORFUL" ? "Suas conquistas 🏆" : "Conquistas"}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {typedAchievements.slice(0, 5).map((a) => (
              <div key={a.id} className={`flex-shrink-0 p-3 text-center rounded-2xl border ${theme === "COLORFUL" ? "bg-yellow-50 border-yellow-200" : theme === "GAMIFIED" ? "bg-gray-800 border-yellow-500/30" : "bg-[#0D2547] border-yellow-500/30"}`}>
                <span className="text-3xl">{a.icon}</span>
                <p className={`text-xs font-medium mt-1 ${theme === "COLORFUL" ? "text-gray-700" : "text-gray-300"}`}>{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
