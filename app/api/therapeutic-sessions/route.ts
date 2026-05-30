export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { withApiHandler } from "@/lib/api-handler";

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const therapistId = (session.user as { id: string }).id;
  const { patientId } = await req.json();
  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

  // Isolamento multi-tenant: o paciente precisa pertencer a este terapeuta.
  const owns = await prisma.patient.findFirst({
    where: { id: patientId, therapistId },
    select: { id: true },
  });
  if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Transação: pausar a sessão ativa e criar a nova juntas — evita paciente sem sessão ativa.
  const data = await prisma.$transaction(async (tx) => {
    await tx.therapeuticSession.updateMany({
      where: { patientId, therapistId, status: "active" },
      data: { status: "paused" },
    });
    return tx.therapeuticSession.create({
      data: {
        patientId,
        therapistId,
        status: "active",
        phase: "character_creation",
        characterData: {},
        currentRegion: null,
        currentHouseIndex: 0,
        unlockedTools: [],
        completedRegions: [],
        responses: [],
        therapistNotes: "",
      },
    });
  });

  return NextResponse.json(data);
});

export const GET = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const searchParams = req.nextUrl.searchParams;

  if (role === "THERAPIST") {
    const therapistId = (session.user as { id: string }).id;
    const patientId = searchParams.get("patientId");
    if (patientId) {
      // Isolamento multi-tenant: só retorna sessões deste terapeuta para o paciente.
      const data = await prisma.therapeuticSession.findMany({
        where: { patientId, therapistId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json(data);
    }
    const data = await prisma.therapeuticSession.findMany({
      where: { therapistId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  }

  if (role === "PATIENT") {
    const patientId = (session.user as { patientId?: string }).patientId;
    if (!patientId) return NextResponse.json({ error: "No patientId" }, { status: 400 });
    const data = await prisma.therapeuticSession.findFirst({
      where: { patientId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data ?? null);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
});
