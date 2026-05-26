export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { generatePin, generatePatientCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

const createPatientSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string(),
  education: z.string().optional(),
  medications: z.string().optional(),
  therapeuticGoals: z.string().optional(),
  clinicalNotes: z.string().optional(),
  contact: z.string().optional(),
  guardian: z.string().optional(),
  cid: z.string().optional(),
  diagnosis: z.string().optional(),
  theme: z.enum(["CLINICAL", "COLORFUL", "GAMIFIED"]).default("CLINICAL"),
});

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const patients = await prisma.patient.findMany({
    where: { therapistId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ patients });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const therapist = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { patientLicenses: true },
  });

  const licenses = therapist?.patientLicenses ?? -1;
  if (licenses === 0) {
    return NextResponse.json({ error: "Licença necessária" }, { status: 402 });
  }

  const body = await req.json();
  const result = createPatientSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { name, birthDate, theme, ...rest } = result.data;
  const plainPin = generatePin();
  const pin = await bcrypt.hash(plainPin, 10);

  let patientCode: string | undefined;
  let codeIsUnique = false;
  do {
    patientCode = generatePatientCode();
    const existing = await prisma.patient.findFirst({ where: { patientCode } });
    codeIsUnique = !existing;
  } while (!codeIsUnique);

  const patient = await prisma.patient.create({
    data: {
      name,
      birthDate: new Date(birthDate),
      theme,
      pin,
      pinPlain: plainPin,
      therapistId,
      patientCode,
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
    },
  });

  if (licenses > 0) {
    await prisma.user.update({
      where: { id: therapistId },
      data: { patientLicenses: licenses - 1 },
    });
  }

  return NextResponse.json({ patient: { ...patient, pin: plainPin } }, { status: 201 });
}
