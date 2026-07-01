import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { PetHabitat } from "@/components/patient/PetHabitat";
import type { SessionData } from "@/types";

export const dynamic = "force-dynamic";

export default async function BichinhoPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "PATIENT") redirect("/login");

  const patientId = (session.user as { patientId?: string }).patientId;
  if (!patientId) redirect("/login");

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) redirect("/login");
  // O habitat (Tamagotchi) é exclusivo do tema Kids (colorido).
  if (patient.theme !== "COLORFUL") redirect("/inicio");

  const sessions = await prisma.session.findMany({
    where: { patientId }, orderBy: { completedAt: "desc" }, take: 100,
  });
  const now = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const sessionsToday = (sessions as unknown as SessionData[]).filter((s) => isToday(new Date(s.completedAt))).length;

  return <PetHabitat patientId={patient.id} playerName={patient.name} sessionsToday={sessionsToday} />;
}
