export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { token, newPassword } = result.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });
  }

  if (resetToken.used) {
    return NextResponse.json({ error: "Este link já foi utilizado" }, { status: 400 });
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  return NextResponse.json({ success: true });
}
