export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  clinicName: z.string().optional(),
  accessCode: z.string().min(1, "Código de acesso obrigatório"),
});

export async function POST(req: NextRequest) {
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

  const { data: existing } = await supabase
    .from('User')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { error } = await supabase.from('User').insert({
    id: randomUUID(),
    email,
    password: hashedPassword,
    name,
    clinicName: clinicName ?? null,
    role: "THERAPIST",
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
