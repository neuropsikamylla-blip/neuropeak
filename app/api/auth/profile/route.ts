export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { withApiHandler } from "@/lib/api-handler";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  clinicName: z.string().optional(),
  crp: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export const PATCH = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { currentPassword, newPassword, ...profileUpdates } = result.data;

  if (profileUpdates.email) {
    const existing = await prisma.user.findFirst({
      where: { email: profileUpdates.email, NOT: { id: userId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 409 });
    }
  }

  const updates: Record<string, unknown> = { ...profileUpdates };

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Informe a senha atual" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

    updates.password = await bcrypt.hash(newPassword, 12);
  }

  await prisma.user.update({ where: { id: userId }, data: updates });

  return NextResponse.json({ success: true });
});
