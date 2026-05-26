export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generatePatientCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await prisma.patient.findMany({
    where: { patientCode: null },
    select: { id: true },
  });

  if (patients.length === 0) {
    return NextResponse.json({ updated: 0, message: "Todos os pacientes já têm código" });
  }

  let updated = 0;
  for (const patient of patients) {
    let patientCode: string;
    let unique = false;
    do {
      patientCode = generatePatientCode();
      const existing = await prisma.patient.findFirst({ where: { patientCode } });
      unique = !existing;
    } while (!unique);

    await prisma.patient.update({ where: { id: patient.id }, data: { patientCode } });
    updated++;
  }

  return NextResponse.json({ updated, message: `${updated} paciente(s) atualizado(s) com código` });
}
