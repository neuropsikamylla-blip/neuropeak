import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { calculateAge } from "@/lib/utils";
import { EXERCISE_DEFINITIONS, DOMAIN_LABELS, type Domain, type Theme } from "@/types";
import { Trophy, Flame, Star } from "lucide-react";

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      trainingPlans: { where: { isActive: true }, take: 1 },
      sessions: { orderBy: { completedAt: "desc" }, take: 20 },
      achievements: { orderBy: { unlockedAt: "desc" }, take: 3 },
    },
  });

  if (!patient) redirect("/login");

  const theme = patient.theme as Theme;
  const activePlan = patient.trainingPlans[0];
  const exercises = activePlan
    ? (JSON.parse(activePlan.exercises) as string[])
    : [];

  // Count sessions today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = patient.sessions.filter((s) => new Date(s.completedAt) >= today);
  const totalPoints = Math.round(patient.sessions.reduce((sum, s) => sum + s.score, 0));

  // Calculate streak
  const uniqueDays = new Set(
    patient.sessions.map((s) => {
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
      stat: "bg-gray-50 rounded-xl",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50",
      header: "bg-white/80 backdrop-blur rounded-2xl mb-4 shadow",
      card: "bg-white rounded-2xl shadow-lg border-2 border-purple-100",
      title: "text-purple-700 text-3xl font-bold",
      sub: "text-purple-400",
      accent: "text-pink-500",
      exCard: "bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 hover:shadow-lg transition-all",
      stat: "bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl",
    },
    GAMIFIED: {
      bg: "bg-gray-950",
      header: "bg-gray-800 rounded-2xl mb-4 border border-cyan-500/20",
      card: "bg-gray-800 rounded-2xl border border-cyan-500/20",
      title: "text-cyan-400 text-2xl font-black tracking-wide",
      sub: "text-gray-400",
      accent: "text-cyan-400",
      exCard: "bg-gray-800 rounded-2xl border border-gray-700 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all",
      stat: "bg-gray-700 rounded-2xl",
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
          <p className={`text-xl font-bold ${theme === "GAMIFIED" ? "text-white" : "text-gray-900"}`}>{patient.achievements.length}</p>
          <p className={`text-xs ${s.sub}`}>{theme === "COLORFUL" ? "Conquistas 🏅" : "Conquistas"}</p>
        </div>
      </div>

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

              return (
                <Link key={exId} href={`/treino/${exId}`}>
                  <div className={`p-4 flex items-center gap-4 cursor-pointer ${s.exCard} ${doneToday ? "opacity-60" : ""}`}>
                    <span className="text-3xl">{ex.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${theme === "GAMIFIED" ? "text-gray-100" : "text-gray-800"}`}>
                          {ex.name}
                        </p>
                        {doneToday && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ Concluído
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
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent achievements */}
      {patient.achievements.length > 0 && (
        <div>
          <h2 className={`font-bold mb-3 ${theme === "GAMIFIED" ? "text-gray-200" : theme === "COLORFUL" ? "text-purple-700 text-lg" : "text-gray-800"}`}>
            {theme === "COLORFUL" ? "Suas conquistas 🏆" : "Conquistas"}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {patient.achievements.slice(0, 5).map((a) => (
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
