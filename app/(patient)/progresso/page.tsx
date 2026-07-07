import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { calculateDomainScore } from "@/lib/scoring";
import { formatDate, formatDuration } from "@/lib/utils";
import { DOMAIN_LABELS, type Domain, type Theme, type SessionData } from "@/types";
import { format, subDays } from "date-fns";
import { Award } from "lucide-react";

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
      bg: "np-app-bg",
      card: "bg-[#0D2547] rounded-xl border border-white/10 shadow-sm",
      title: "text-slate-100 font-bold text-xl",
      sub: "text-slate-400 text-sm",
      accent: "text-blue-400",
      scoreBg: "bg-white/5",
    },
    COLORFUL: {
      bg: "bg-[#F6F8FC]",
      card: "bg-white rounded-2xl border border-[#E2E8F0] shadow-sm",
      title: "text-[#173B78] font-bold text-2xl",
      sub: "text-[#667085] text-sm",
      accent: "text-[#1D4ED8] font-bold",
      scoreBg: "bg-[#F6F8FC]",
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
  // Clínico e Gamificado têm fundo escuro → textos claros; só Colorido é claro.
  const isDark = theme === "GAMIFIED" || theme === "CLINICAL";
  const divider = isDark ? "border-white/10" : "border-[#E2E8F0]";
  const dividerY = isDark ? "divide-white/10" : "divide-[#E2E8F0]";
  const heading = isDark ? "text-gray-200" : "text-[#14213D]";

  return (
    <div className={`min-h-screen ${s.bg} p-4 space-y-4`}>
      <h1 className={s.title}>
        {theme === "GAMIFIED" ? "MEUS STATS" : "Meu Progresso"}
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
        <div className={`p-4 border-b ${divider}`}>
          <h2 className={`font-semibold ${heading}`}>
            {theme === "COLORFUL" ? "Seus superpoderes" : "Desempenho por domínio"}
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {domainScores.map((ds) => (
            <div key={ds.domain}>
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {DOMAIN_LABELS[ds.domain]}
                </span>
                <span className={`text-sm font-bold ${ds.score >= 70 ? "text-green-500" : ds.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                  {ds.score}/100
                </span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? "bg-black/25" : "bg-gray-200"}`}>
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
          <div className={`p-4 border-b ${divider}`}>
            <h2 className={`font-semibold ${heading}`}>
              {theme === "COLORFUL" ? "Minhas conquistas" : "Conquistas"}
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.scoreBg}`}>
                {theme === "COLORFUL"
                  ? <Award className="w-6 h-6 flex-shrink-0" style={{ color: "#E8B547" }} />
                  : <span className="text-2xl">{a.icon}</span>}
                <div>
                  <p className={`text-sm font-semibold ${heading}`}>{a.title}</p>
                  <p className={`text-xs ${s.sub}`}>{formatDate(a.unlockedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className={s.card}>
        <div className={`p-4 border-b ${divider}`}>
          <h2 className={`font-semibold ${heading}`}>
            Sessões recentes
          </h2>
        </div>
        <div className={`divide-y ${dividerY}`}>
          {sessions.slice(0, 10).map((s2, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>{s2.exerciseId}</p>
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
