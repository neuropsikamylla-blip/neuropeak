export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { withApiHandler } from "@/lib/api-handler";

// Allowlist dos campos que podem ser atualizados via PATCH — impede mass
// assignment de id/patientId/therapistId/createdAt (Zod faz strip do resto).
const updateSchema = z.object({
  phase: z.string().optional(),
  status: z.string().optional(),
  currentRegion: z.string().nullable().optional(),
  currentHouseIndex: z.number().int().min(0).optional(),
  therapistNotes: z.string().optional(),
  characterData: z.any().optional(),
  unlockedTools: z.array(z.string()).optional(),
  completedRegions: z.array(z.string()).optional(),
  responses: z.array(z.any()).optional(),
});

type SessionUser = { id?: string; role?: string; patientId?: string };

// Ownership: o terapeuta dono (criou a sessão) ou o paciente da sessão.
function canAccess(
  ts: { therapistId: string; patientId: string },
  user: SessionUser
): boolean {
  if (user.role === "THERAPIST") return ts.therapistId === user.id;
  if (user.role === "PATIENT") return ts.patientId === user.patientId;
  return false;
}

export const GET = withApiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const data = await prisma.therapeuticSession.findUnique({ where: { id } });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = session.user as SessionUser;
  if (!canAccess(data, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // O paciente não deve receber as anotações clínicas do terapeuta sobre ele.
  if (user.role === "PATIENT") {
    return NextResponse.json({ ...data, therapistNotes: undefined });
  }
  return NextResponse.json(data);
});

export const PATCH = withApiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.therapeuticSession.findUnique({
    where: { id },
    select: { therapistId: true, patientId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccess(existing, session.user as SessionUser)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const data = await prisma.therapeuticSession.update({
    where: { id },
    data: result.data as Prisma.TherapeuticSessionUpdateInput,
  });
  return NextResponse.json(data);
});
