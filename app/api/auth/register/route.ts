export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { withApiHandler } from "@/lib/api-handler";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  clinicName: z.string().optional(),
  accessCode: z.string().min(1, "Código de acesso obrigatório"),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password, clinicName, accessCode } = result.data;

  const validCode = process.env.REGISTRATION_CODE;
  if (!validCode || accessCode !== validCode) {
    return NextResponse.json({ error: "Código de acesso inválido" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      clinicName: clinicName ?? null,
      role: "THERAPIST",
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
});
