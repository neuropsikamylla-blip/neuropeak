export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { randomUUID } from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

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

  await sendPasswordResetEmail(user.email, resetUrl).catch(() => {});

  return NextResponse.json({ success: true });
}
