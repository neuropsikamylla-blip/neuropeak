export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function sendLicenseRequestEmail(therapist: { name: string; email: string; clinicName?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = process.env.RESEND_FROM_EMAIL || "NeuroPeak <onboarding@resend.dev>";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["neuropsi.kamylla@gmail.com"],
      subject: `Solicitação de licença — ${therapist.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">NeuroPeak — Solicitação de Licença</h2>
          <p><strong>Terapeuta:</strong> ${therapist.name}</p>
          <p><strong>Email:</strong> ${therapist.email}</p>
          <p><strong>Clínica:</strong> ${therapist.clinicName || "Não informado"}</p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;">
            Acesse o painel Supabase para gerar e enviar um código de licença.
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapistId = (session.user as { id: string }).id;

  const { data: user } = await supabase
    .from("User")
    .select("name, email, clinicName")
    .eq("id", therapistId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  await sendLicenseRequestEmail(user).catch(() => {});

  return NextResponse.json({ success: true });
}
