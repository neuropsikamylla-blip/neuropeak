import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await supabase
          .from('User')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

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
      async authorize(credentials) {
        if (!credentials?.patientId || !credentials?.pin) return null;

        const input = credentials.patientId.trim().toUpperCase();
        const isCode = /^COG\d{4,6}$/.test(input);
        let patient = null;
        if (isCode) {
          try {
            const { data } = await supabase
              .from('Patient')
              .select('*')
              .eq('patientCode', input)
              .maybeSingle();
            patient = data;
          } catch {
            // column may not exist yet; fall through to null
          }
        } else {
          const { data } = await supabase
            .from('Patient')
            .select('*')
            .eq('id', credentials.patientId)
            .maybeSingle();
          patient = data;
        }

        if (!patient) return null;
        const pinValid = await bcrypt.compare(credentials.pin, patient.pin);
        if (!pinValid) return null;

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
