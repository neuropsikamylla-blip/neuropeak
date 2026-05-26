export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendLicenseRequestEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { name: true, email: true, clinicName: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  await sendLicenseRequestEmail({ ...user, clinicName: user.clinicName ?? undefined }).catch(() => {});

  return NextResponse.json({ success: true });
}
