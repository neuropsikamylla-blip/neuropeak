export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { withApiHandler } from "@/lib/api-handler";
import prisma from "@/lib/db";
import { tutorialVersionFor } from "@/lib/tutorial/versions";

const completionSchema = z.object({
  exerciseId: z.string().min(1),
  version: z.number().int().min(1),
}).strict();

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { role?: string; patientId?: string };
  if (user.role !== "PATIENT" || !user.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = completionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { exerciseId, version } = parsed.data;
  if (tutorialVersionFor(exerciseId) === undefined) {
    return NextResponse.json({ error: "Exercício inválido" }, { status: 400 });
  }

  const key = { patientId: user.patientId, exerciseId };
  const existing = await prisma.exerciseConfig.findUnique({
    where: { patientId_exerciseId: key },
    select: {
      tutorialCompletedAt: true,
      tutorialVersion: true,
      tutorialSource: true,
    },
  });

  if (
    existing !== null
    && existing.tutorialCompletedAt !== null
    && existing.tutorialVersion === version
    && existing.tutorialSource === "PATIENT"
  ) {
    return NextResponse.json({ ok: true });
  }

  const tutorialCompletedAt = new Date();
  await prisma.exerciseConfig.upsert({
    where: { patientId_exerciseId: key },
    create: {
      ...key,
      tutorialCompletedAt,
      tutorialVersion: version,
      tutorialSource: "PATIENT",
    },
    update: {
      tutorialCompletedAt,
      tutorialVersion: version,
      tutorialSource: "PATIENT",
    },
  });

  return NextResponse.json({ ok: true });
});
