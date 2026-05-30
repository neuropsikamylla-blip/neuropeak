import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Sem timeout, um SMTP travado seguraria a request até o limite da função.
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"NeuroPeak" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Redefinição de senha — NeuroPeak",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">NeuroPeak</h2>
        <p style="color: #374151;">Você solicitou a redefinição de senha da sua conta.</p>
        <p style="color: #374151;">Clique no botão abaixo para criar uma nova senha.
          Este link expira em <strong>1 hora</strong>.</p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;
                 border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0;">
          Redefinir minha senha
        </a>
        <p style="color:#6b7280;font-size:13px;">
          Se você não solicitou esta redefinição, ignore este email.
        </p>
        <p style="color:#9ca3af;font-size:12px;word-break:break-all;">
          Link direto: ${resetUrl}
        </p>
      </div>
    `,
  });

  return true;
}

export async function sendLicenseRequestEmail(therapist: {
  name: string;
  email: string;
  clinicName?: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;

  // Sem fallback hardcoded: se ADMIN_EMAIL não estiver configurado, falha
  // explícita em vez de enviar dados a um endereço pessoal versionado.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL não configurado");
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"NeuroPeak" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `Solicitação de licença — ${therapist.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">NeuroPeak — Solicitação de Licença</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Terapeuta</td>
            <td style="padding:8px 0;font-weight:600;">${therapist.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
            <td style="padding:8px 0;">${therapist.email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Clínica</td>
            <td style="padding:8px 0;">${therapist.clinicName || "—"}</td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">
          Gere um código em LicenseCode no Supabase e envie para o terapeuta resgatar
          em Configurações → Licenças.
        </p>
      </div>
    `,
  });

  return true;
}
