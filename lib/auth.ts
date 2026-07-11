import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import {
  isAllowed, registerFailure, clearFailures, clientIp,
  IDENTIFIER_RULE, IP_RULE,
} from "@/lib/rate-limit";

// Bloqueia a tentativa se o identificador OU o IP estourou o limite de falhas.
function loginBlocked(idKey: string, ip: string | null): boolean {
  if (!isAllowed(idKey)) return true;
  if (ip && !isAllowed(`ip:${ip}`)) return true;
  return false;
}
// Conta uma falha de login para o identificador e (se conhecido) o IP.
function loginFailure(idKey: string, ip: string | null): void {
  registerFailure(idKey, IDENTIFIER_RULE);
  if (ip) registerFailure(`ip:${ip}`, IP_RULE);
}

// Hash "boba" (custo 10) para comparar quando o usuário/paciente NÃO existe, de modo
// que o tempo de resposta seja parecido com quando existe — evita enumerar contas
// medindo latência (finding SEC-005).
const DUMMY_HASH = "$2a$10$SVyxsBzf/kDKMWx2I/0LF.KIHLxxhCQAd/7TjV570xQWiUGPekymG";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "therapist-login",
      name: "Terapeuta",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = clientIp(req);
        const idKey = `therapist:${credentials.email.trim().toLowerCase()}`;
        if (loginBlocked(idKey, ip)) return null; // muitas tentativas — recusa

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Sempre roda o bcrypt (contra hash dummy se o usuário não existe) — tempo constante.
        const valid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_HASH);
        if (!user || !valid) {
          loginFailure(idKey, ip);
          return null;
        }

        clearFailures(idKey); // sucesso zera o contador do identificador
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicName: user.clinicName ?? undefined,
          crp: user.crp ?? undefined,
        };
      },
    }),
    CredentialsProvider({
      id: "patient-pin",
      name: "Paciente",
      credentials: {
        patientId: { label: "Código do Paciente", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.patientId || !credentials?.pin) return null;

        const input = credentials.patientId.trim().toUpperCase();
        const ip = clientIp(req);
        const idKey = `pin:${input}`;
        if (loginBlocked(idKey, ip)) return null; // muitas tentativas — recusa

        const isCode = /^COG\d{4,6}$/.test(input);
        const patient = isCode
          ? await prisma.patient.findFirst({ where: { patientCode: input } })
          : await prisma.patient.findUnique({ where: { id: credentials.patientId } });

        // Sempre roda o bcrypt (contra hash dummy se o paciente não existe) — tempo constante.
        const pinValid = await bcrypt.compare(credentials.pin, patient?.pin ?? DUMMY_HASH);
        if (!patient || !pinValid) {
          loginFailure(idKey, ip);
          return null;
        }

        clearFailures(idKey); // sucesso zera o contador do identificador
        return {
          id: patient.id,
          email: `patient_${patient.id}@neuropeak.local`,
          name: patient.name,
          role: "PATIENT" as const,
          patientId: patient.id,
          theme: patient.theme,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role?: string; clinicName?: string; patientId?: string; theme?: string; crp?: string };
        token.role = u.role;
        token.clinicName = u.clinicName;
        token.patientId = u.patientId;
        token.theme = u.theme;
        token.crp = u.crp;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub ?? "";
        (session.user as { role: string }).role = token.role as string;
        (session.user as { clinicName?: string }).clinicName = token.clinicName as string | undefined;
        (session.user as { patientId?: string }).patientId = token.patientId as string | undefined;
        (session.user as { theme?: string }).theme = token.theme as string | undefined;
        (session.user as { crp?: string }).crp = token.crp as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
