export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

async function sendResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM_EMAIL || "NeuroPeak <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Redefinição de senha — NeuroPeak",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">NeuroPeak</h2>
          <p>Você solicitou a redefinição de senha da sua conta.</p>
          <p>Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
            Redefinir senha
          </a>
          <p style="color:#6b7280;font-size:12px;">Se você não solicitou esta redefinição, ignore este email.</p>
          <p style="color:#6b7280;font-size:12px;">Ou acesse diretamente: ${resetUrl}</p>
        </div>
      `,
    }),
  });

  return res.ok;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const { email } = result.data;

  const { data: user } = await supabase
    .from("User")
    .select("id, email, name")
    .eq("email", email)
    .single();

  // Always return success to avoid email enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Invalidate old tokens
  await supabase
    .from("PasswordResetToken")
    .update({ used: true })
    .eq("userId", user.id)
    .eq("used", false);

  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await supabase.from("PasswordResetToken").insert({
    id: randomUUID(),
    token,
    userId: user.id,
    expiresAt,
    used: false,
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/nova-senha?token=${token}`;

  await sendResetEmail(user.email, resetUrl);

  return NextResponse.json({ success: true });
}
