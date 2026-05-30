export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { withApiHandler } from "@/lib/api-handler";
import { safeSecretCompare } from "@/lib/auth-helpers";
import { generateUniquePatientCode } from "@/lib/patients";

export const POST = withApiHandler(async (req: NextRequest) => {
  // Fail-closed: sem ADMIN_SECRET configurado, safeSecretCompare retorna false.
  const secret = req.headers.get("x-admin-secret");
  if (!safeSecretCompare(secret, process.env.ADMIN_SECRET)) {
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
    const patientCode = await generateUniquePatientCode();
    await prisma.patient.update({ where: { id: patient.id }, data: { patientCode } });
    updated++;
  }

  return NextResponse.json({ updated, message: `${updated} paciente(s) atualizado(s) com código` });
});
