export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

  const { data: resetToken } = await supabase
    .from("PasswordResetToken")
    .select("id, userId, expiresAt, used")
    .eq("token", token)
    .single();

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

  const { error: updateError } = await supabase
    .from("User")
    .update({ password: hashedPassword, updatedAt: new Date().toISOString() })
    .eq("id", resetToken.userId);

  if (updateError) {
    return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 });
  }

  await supabase
    .from("PasswordResetToken")
    .update({ used: true })
    .eq("id", resetToken.id);

  return NextResponse.json({ success: true });
}
