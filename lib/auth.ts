import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        };
      },
    }),
    CredentialsProvider({
      id: "patient-pin",
      name: "Paciente",
      credentials: {
        patientId: { label: "ID do Paciente", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.patientId || !credentials?.pin) return null;

        const { data: patient } = await supabase
          .from('Patient')
          .select('*')
          .eq('id', credentials.patientId)
          .single();

        if (!patient) return null;
        if (patient.pin !== credentials.pin) return null;

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
        const u = user as unknown as { role?: string; clinicName?: string; patientId?: string; theme?: string };
        token.role = u.role;
        token.clinicName = u.clinicName;
        token.patientId = u.patientId;
        token.theme = u.theme;
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
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
