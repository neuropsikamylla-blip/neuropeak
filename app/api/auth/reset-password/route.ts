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

  try {
    // Transação atômica: invalida o token (claim condicional anti reuso concorrente) e
    // troca a senha juntos. Se a troca de senha falhar, o token volta a valer (rollback).
    await prisma.$transaction(async (tx) => {
      const claim = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, used: false },
        data: { used: true },
      });
      if (claim.count === 0) throw new Error("ALREADY_USED");

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_USED") {
      return NextResponse.json({ error: "Este link já foi utilizado" }, { status: 400 });
    }
    console.error("[reset-password] erro ao redefinir senha:", e);
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
