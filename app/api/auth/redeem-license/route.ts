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

  // Validação preliminar (mensagens amigáveis); o claim atômico abaixo garante corretude sob concorrência.
  const license = await prisma.licenseCode.findFirst({
    where: { code: code.trim().toUpperCase() },
  });

  if (!license) {
    return NextResponse.json({ error: "Código de licença inválido" }, { status: 404 });
  }

  if (license.usedByTherapistId) {
    return NextResponse.json({ error: "Este código já foi utilizado" }, { status: 409 });
  }

  // Se o terapeuta já tem acesso ILIMITADO (-1), resgatar um código o rebaixaria para
  // um número finito. Rejeita antes de consumir o código — assim ele mantém o ilimitado
  // e o código continua disponível.
  const me = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { patientLicenses: true },
  });
  if ((me?.patientLicenses ?? -1) === -1) {
    return NextResponse.json(
      { error: "Você já tem acesso ilimitado a pacientes. O código não foi utilizado." },
      { status: 400 },
    );
  }

  try {
    // Transação atômica: marca o código como usado (claim condicional anti duplo-resgate)
    // e credita as licenças juntos. Se um falhar, o outro reverte — sem licença paga perdida.
    const newLicenses = await prisma.$transaction(async (tx) => {
      const claim = await tx.licenseCode.updateMany({
        where: { id: license.id, usedByTherapistId: null },
        data: { usedByTherapistId: therapistId, usedAt: new Date() },
      });
      if (claim.count === 0) throw new Error("ALREADY_USED");

      const user = await tx.user.findUnique({
        where: { id: therapistId },
        select: { patientLicenses: true },
      });
      if (!user) throw new Error("USER_NOT_FOUND");

      const current = user.patientLicenses ?? -1;
      // Defesa extra: se por algum motivo ainda estiver ilimitado, preserva o -1.
      const next = current === -1 ? -1 : current + license.licenses;
      await tx.user.update({ where: { id: therapistId }, data: { patientLicenses: next } });
      return next;
    });

    return NextResponse.json({ success: true, licenses: newLicenses });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_USED") {
      return NextResponse.json({ error: "Este código já foi utilizado" }, { status: 409 });
    }
    if (e instanceof Error && e.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    console.error("[redeem-license] erro ao resgatar licença:", e);
    return NextResponse.json({ error: "Erro ao resgatar licença" }, { status: 500 });
  }
}
