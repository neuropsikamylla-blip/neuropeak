export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { generatePin, generatePatientCode } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { withApiHandler } from "@/lib/api-handler";

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

export const GET = withApiHandler(async (req: NextRequest) => {
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
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

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

  // Licença + criação numa transação atômica. O decremento condicional
  // (updateMany onde patientLicenses > 0) evita a race condition em que duas
  // requisições simultâneas leem a mesma contagem e criam pacientes além do
  // limite. patientLicenses === -1 significa ilimitado (não decrementa).
  const patient = await prisma
    .$transaction(async (tx) => {
      const therapist = await tx.user.findUnique({
        where: { id: therapistId },
        select: { patientLicenses: true },
      });
      const licenses = therapist?.patientLicenses ?? -1;

      if (licenses === 0) throw new Error("NO_LICENSE");

      if (licenses > 0) {
        const dec = await tx.user.updateMany({
          where: { id: therapistId, patientLicenses: { gt: 0 } },
          data: { patientLicenses: { decrement: 1 } },
        });
        if (dec.count === 0) throw new Error("NO_LICENSE");
      }

      return tx.patient.create({
        data: {
          name,
          birthDate: new Date(birthDate),
          theme,
          pin,
          therapistId,
          patientCode,
          ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
        },
      });
    })
    .catch((e: unknown) => {
      if (e instanceof Error && e.message === "NO_LICENSE") return null;
      throw e;
    });

  if (!patient) {
    return NextResponse.json({ error: "Licença necessária" }, { status: 402 });
  }

  return NextResponse.json({ patient: { ...patient, pin: plainPin } }, { status: 201 });
});
