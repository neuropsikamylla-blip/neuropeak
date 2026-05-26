export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1, "Código obrigatório"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { code } = result.data;

  const license = await prisma.licenseCode.findFirst({
    where: { code: code.trim().toUpperCase() },
  });

  if (!license) {
    return NextResponse.json({ error: "Código de licença inválido" }, { status: 404 });
  }

  if (license.usedByTherapistId) {
    return NextResponse.json({ error: "Este código já foi utilizado" }, { status: 409 });
  }

  const user = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { patientLicenses: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const currentLicenses = user.patientLicenses ?? -1;
  const newLicenses = currentLicenses === -1 ? license.licenses : currentLicenses + license.licenses;

  await prisma.licenseCode.update({
    where: { id: license.id },
    data: { usedByTherapistId: therapistId, usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: therapistId },
    data: { patientLicenses: newLicenses },
  });

  return NextResponse.json({ success: true, licenses: newLicenses });
}
