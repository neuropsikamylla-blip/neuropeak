export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { randomUUID } from "crypto";
import { z } from "zod";
import { withApiHandler } from "@/lib/api-handler";

const schema = z.object({
  email: z.string().email(),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const { email } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) return NextResponse.json({ success: true });

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/nova-senha?token=${token}`;

  await sendPasswordResetEmail(user.email, resetUrl).catch(
    (e) => console.error("[forgot-password] falha ao enviar email:", e)
  );

  return NextResponse.json({ success: true });
});
