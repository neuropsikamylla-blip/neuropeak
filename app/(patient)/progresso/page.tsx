import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { calculateDomainScore } from "@/lib/scoring";
import { formatDate, formatDuration } from "@/lib/utils";
import { DOMAIN_LABELS, type Domain, type Theme, type SessionData } from "@/types";
import { format, subDays } from "date-fns";

export default async function ProgressoPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") {
    redirect("/login");
  }

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const patientBase = await prisma.patient.findUnique({ where: { id: patientId } });

  if (!patientBase) redirect("/login");

  const [sessionRows, achievementRows] = await Promise.all([
    prisma.session.findMany({ where: { patientId }, orderBy: { completedAt: "desc" }, take: 30 }),
    prisma.achievement.findMany({ where: { patientId }, orderBy: { unlockedAt: "desc" } }),
  ]);

  const patient = {
    ...patientBase,
    sessions: sessionRows,
    achievements: achievementRows,
  };

  const theme = patient.theme as Theme;
  const sessions = (patient.sessions as SessionData[]);
  const achievements = patient.achievements as unknown as Array<{ id: string; icon: string; title: string; description?: string; unlockedAt: string }>;
  const domainScores = calculateDomainScore(sessions as any);
  const totalPoints = Math.round(sessions.reduce((s, sess) => s + sess.score, 0));

  const styles = {
    CLINICAL: {
      bg: "bg-gray-50",
      card: "bg-white rounded-xl border border-gray-200 shadow-sm",
      title: "text-gray-900 font-bold text-xl",
      sub: "text-gray-500 text-sm",
      accent: "text-blue-600",
      scoreBg: "bg-gray-50",
    },
    COLORFUL: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      card: "bg-white rounded-2xl border-2 border-purple-100 shadow-lg",
      title: "text-purple-700 font-bold text-2xl",
      sub: "text-purple-400 text-sm",
      accent: "text-pink-500 font-bold",
      scoreBg: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    GAMIFIED: {
      bg: "bg-gray-950",
      card: "bg-gray-800 rounded-2xl border border-cyan-500/20",
      title: "text-cyan-400 font-black text-xl tracking-wide",
      sub: "text-gray-400 text-sm",
      accent: "text-cyan-400",
      scoreBg: "bg-gray-700",
    },
  };

  const s = styles[theme];

  return (
    <div className={`min-h-screen ${s.bg} p-4 space-y-4`}>
      <h1 className={s.title}>
        {theme === "GAMIFIED" ? "MEUS STATS" : theme === "COLORFUL" ? "Meu Progresso 📈" : "Meu Progresso"}
      </h1>

      {/* Total stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-4 text-center ${s.card}`}>
          <p className={`text-3xl font-black ${s.accent}`}>{sessions.length}</p>
          <p className={s.sub}>Sessões realizadas</p>
        </div>
        <div className={`p-4 text-center ${s.card}`}>
          <p className={`text-3xl font-black ${s.accent}`}>{totalPoints}</p>
          <p className={s.sub}>Pontos totais</p>
        </div>
      </div>

      {/* Domain scores */}
      <div className={s.card}>
        <div className="p-4 border-b border-gray-100">
          <h2 className={`font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
            {theme === "COLORFUL" ? "Seus superpoderes 🧠" : "Desempenho por domínio"}
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {domainScores.map((ds) => (
            <div key={ds.domain}>
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-300" : "text-gray-700"}`}>
                  {DOMAIN_LABELS[ds.domain]}
                </span>
                <span className={`text-sm font-bold ${ds.score >= 70 ? "text-green-500" : ds.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                  {ds.score}/100
                </span>
              </div>
              <div className={`h-3 rounded-full ${theme === "GAMIFIED" ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className={`h-full rounded-full transition-all ${
                    ds.score >= 70 ? "bg-green-500" : ds.score >= 50 ? "bg-yellow-500" : "bg-red-400"
                  }`}
                  style={{ width: `${ds.score}%` }}
                />
              </div>
              <p className={`text-xs mt-0.5 ${s.sub}`}>{ds.sessions} sessões</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className={s.card}>
          <div className="p-4 border-b border-gray-100">
            <h2 className={`font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
              {theme === "COLORFUL" ? "Minhas conquistas 🏆" : "Conquistas"}
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.scoreBg}`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>{a.title}</p>
                  <p className={`text-xs ${s.sub}`}>{formatDate(a.unlockedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className={s.card}>
        <div className="p-4 border-b border-gray-100">
          <h2 className={`font-semibold ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>
            {theme === "COLORFUL" ? "Sessões recentes 📋" : "Sessões recentes"}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {sessions.slice(0, 10).map((s2, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === "GAMIFIED" ? "text-gray-200" : "text-gray-800"}`}>{s2.exerciseId}</p>
                <p className={s.sub}>{format(new Date(s2.completedAt), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${s.accent}`}>{Math.round(s2.score)}</p>
                <p className={s.sub}>{Math.round(s2.accuracy * 100)}%</p>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className={`text-center py-8 ${s.sub}`}>Nenhuma sessão ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
