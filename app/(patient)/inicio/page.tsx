import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateAge } from "@/lib/utils";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, type Domain, type Theme, type SessionData } from "@/types";
import { Trophy, Flame, Star } from "lucide-react";

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const { data: patientBase } = await supabase
    .from('Patient')
    .select('*')
    .eq('id', patientId)
    .single();

  if (!patientBase) redirect("/login");

  const [
    { data: trainingPlans },
    { data: sessions },
    { data: achievements },
  ] = await Promise.all([
    supabase
      .from('TrainingPlan')
      .select('*')
      .eq('patientId', patientId)
      .eq('isActive', true)
      .limit(1),
    supabase
      .from('Session')
      .select('*')
      .eq('patientId', patientId)
      .order('completedAt', { ascending: false })
      .limit(50),
    supabase
      .from('Achievement')
      .select('*')
      .eq('patientId', patientId)
      .order('unlockedAt', { ascending: false })
      .limit(3),
  ]);

  const patient = {
    ...patientBase,
    trainingPlans: trainingPlans ?? [],
    sessions: (sessions ?? []) as SessionData[],
    achievements: achievements ?? [],
  };

  const theme = patient.theme as Theme;
  const activePlan = patient.trainingPlans[0];
  const exercises = activePlan
    ? (JSON.parse(activePlan.exercises) as string[])
    : [];

  const typedSessions = patient.sessions as SessionData[];
  const typedAchievements = patient.achievements as Array<{ id: string; icon: string; title: string; unlockedAt: string }>;

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
      bg: "bg-gray-50",
      header: "bg-white border-b border-gray-100",
      card: "bg-white rounded-xl shadow-sm border border-gray-100",
      title: "text-gray-900 text-2xl font-semibold",
      sub: "text-gray-500",
      accent: "text-blue-600",
      exCard: "bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all",
      exDone: "bg-gray-50 rounded-xl border border-gray-100 opacity-60",
      stat: "bg-gray-50 rounded-xl",
      progress: "bg-gray-200",
      progressBar: "bg-blue-500",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50",
      header: "bg-white/80 backdrop-blur rounded-2xl mb-4 shadow",
      card: "bg-white rounded-2xl shadow-lg border-2 border-purple-100",
      title: "text-purple-700 text-3xl font-bold",
      sub: "text-purple-400",
      accent: "text-pink-500",
      exCard: "bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 hover:shadow-lg transition-all",
      exDone: "bg-purple-50 rounded-2xl border-2 border-purple-100 opacity-60",
      stat: "bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl",
      progress: "bg-purple-200",
      progressBar: "bg-purple-500",
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
  const firstName = patient.name.split(" ")[0];

  return (
    <div className={`min-h-screen ${s.bg} p-4 space-y-4`}>
      {/* Welcome card */}
      <div className={`p-5 ${s.header}`}>
        <h1 className={s.title}>
          {theme === "COLORFUL" ? `Olá, ${firstName}! 👋` : theme === "GAMIFIED" ? `MISSÃO ATIVA — ${firstName.toUpperCase()}` : `Olá, ${firstName}`}
        </h1>
        <p className={`text-sm mt-1 ${s.sub}`}>
          {theme === "GAMIFIED"
            ? "Complete seus exercícios para ganhar XP!"
            : theme === "COLORFUL"
            ? "Hora de treinar o cérebro! 🧠✨"
            : "Pronto para o seu treino de hoje?"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 text-center ${s.stat}`}>
          <Flame className={`w-5 h-5 mx-auto mb-1 ${uniqueDays.size > 0 ? "text-orange-500" : "text-gray-400"}`} />
          <p className={`text-xl font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>{uniqueDays.size}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Dias ativos 🔥" : "Dias"}</p>
        </div>
        <div className={`p-3 text-center ${s.stat}`}>
          <Trophy className={`w-5 h-5 mx-auto mb-1 ${theme === "GAMIFIED" ? "text-cyan-400" : "text-yellow-500"}`} />
          <p className={`text-xl font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>{totalPoints}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Pontos ⭐" : "Pontos"}</p>
        </div>
        <div className={`p-3 text-center ${s.stat}`}>
          <Star className={`w-5 h-5 mx-auto mb-1 ${theme === "GAMIFIED" ? "text-yellow-400" : "text-purple-500"}`} />
          <p className={`text-xl font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>{typedAchievements.length}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Conquistas 🏅" : "Conquistas"}</p>
        </div>
      </div>

      {/* Cycle progress */}
      {activePlan && cycleTarget > 0 && (
        <div className={`p-4 ${s.card}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
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
            <p className="text-xs text-green-600 mt-2 font-medium text-center">
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
        <h2 className={`font-bold mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-purple-700 text-lg" : "text-gray-800"}`}>
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

              const cardContent = (
                <div className={`p-4 flex items-center gap-4 ${doneToday ? s.exDone : `cursor-pointer ${s.exCard}`}`}>
                  <span className="text-3xl">{ex.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                        {ex.name}
                      </p>
                      {doneToday && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {theme === "GAMIFIED" ? "COMPLETO" : "Concluído"}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${s.sub}`}>{ex.description}</p>
                    <p className={`text-xs mt-0.5 ${s.accent}`}>
                      {DOMAIN_LABELS[ex.domain as Domain]} · ~{ex.estimatedMinutes}min
                    </p>
                  </div>
                  {!doneToday && (
                    <span className={`text-xl ${theme === "GAMIFIED" ? "text-cyan-400" : "text-blue-500"}`}>→</span>
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
          <h2 className={`font-bold mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-purple-700 text-lg" : "text-gray-800"}`}>
            {theme === "COLORFUL" ? "Suas conquistas 🏆" : "Conquistas"}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {typedAchievements.slice(0, 5).map((a) => (
              <div key={a.id} className={`flex-shrink-0 p-3 text-center rounded-2xl border ${theme === "GAMIFIED" ? "bg-gray-800 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"}`}>
                <span className="text-3xl">{a.icon}</span>
                <p className={`text-xs font-medium mt-1 ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
