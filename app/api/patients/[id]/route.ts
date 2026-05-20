export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  trainingPlan: z.object({
    domains: z.array(z.string()),
    exercises: z.array(z.string()),
    sessionDuration: z.number().min(5).max(120),
    frequency: z.number().min(1).max(7),
  }).optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]).optional(),
  clinicalNotes: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  medications: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { role?: string; id?: string; patientId?: string };
  const isTherapist = user.role === "THERAPIST";
  const isPatient = user.role === "PATIENT" && user.patientId === id;

  if (!isTherapist && !isPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const includeConfig = searchParams.get("config") === "true";

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      trainingPlans: { where: { isActive: true }, take: 1 },
      exerciseConfigs: includeConfig,
      sessions: { orderBy: { completedAt: "desc" }, take: 50 },
    },
  });

  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isTherapist && patient.therapistId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ patient });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const patient = await prisma.patient.findFirst({
    where: { id, therapistId },
  });
  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { trainingPlan, ...patientUpdates } = result.data;

  if (Object.keys(patientUpdates).length > 0) {
    await prisma.patient.update({
      where: { id },
      data: patientUpdates,
    });
  }

  if (trainingPlan) {
    await prisma.trainingPlan.updateMany({
      where: { patientId: id },
      data: { isActive: false },
    });

    await prisma.trainingPlan.create({
      data: {
        patientId: id,
        domains: JSON.stringify(trainingPlan.domains),
        exercises: JSON.stringify(trainingPlan.exercises),
        sessionDuration: trainingPlan.sessionDuration,
        frequency: trainingPlan.frequency,
        isActive: true,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  await prisma.patient.deleteMany({
    where: { id, therapistId },
  });

  return NextResponse.json({ success: true });
}
