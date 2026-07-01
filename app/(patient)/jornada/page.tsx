import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { SkillTree } from "@/components/patient/skilltree/SkillTree";
import type { SessionData } from "@/types";

export const dynamic = "force-dynamic";

export default async function JornadaPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") redirect("/login");

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) redirect("/login");

  const [sessions, achievementsCount] = await Promise.all([
    prisma.session.findMany({ where: { patientId }, orderBy: { completedAt: "desc" }, take: 500 }),
    prisma.achievement.count({ where: { patientId } }),
  ]);

  // XP real = soma das pontuações (0-100) de cada sessão concluída.
  const typed = sessions as unknown as SessionData[];
  const totalXp = typed.reduce((sum, s) => sum + Math.round(s.score), 0);

  const now = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const todays = typed.filter((s) => isToday(new Date(s.completedAt)));
  const sessionsToday = todays.length;
  const xpToday = todays.reduce((sum, s) => sum + Math.round(s.score), 0);

  return (
    <SkillTree
      patientId={patient.id}
      playerName={patient.name}
      totalXp={totalXp}
      sessionsToday={sessionsToday}
      xpToday={xpToday}
      achievementsCount={achievementsCount}
    />
  );
}
