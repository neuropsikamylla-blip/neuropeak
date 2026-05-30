export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { generatePin, generatePatientCode } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { withApiHandler } from "@/lib/api-handler";

export const POST = withApiHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  void req;
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const patient = await prisma.patient.findFirst({
    where: { id, therapistId },
    select: { id: true, patientCode: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const plainPin = generatePin();
  const hashedPin = await bcrypt.hash(plainPin, 10);

  let patientCode = patient.patientCode;
  if (!patientCode) {
    let unique = false;
    do {
      patientCode = generatePatientCode();
      const existing = await prisma.patient.findFirst({ where: { patientCode } });
      unique = !existing;
    } while (!unique);
  }

  await prisma.patient.update({
    where: { id },
    data: { pin: hashedPin, pinPlain: plainPin, patientCode },
  });

  return NextResponse.json({ pin: plainPin, patientCode });
});
