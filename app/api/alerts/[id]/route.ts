export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const therapistId = (session.user as { id: string }).id;

  const alert = await prisma.alert.findUnique({
    where: { id },
    select: { id: true, patientId: true },
  });

  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patient = await prisma.patient.findFirst({
    where: { id: alert.patientId, therapistId },
    select: { id: true },
  });

  if (!patient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.alert.update({ where: { id }, data: { isRead: true } });

  return NextResponse.json({ ok: true });
}
