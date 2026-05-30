import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { timingSafeEqual } from "crypto";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * Shape do `session.user` da app. NextAuth tipa `user` de forma frouxa; aqui
 * centralizamos o cast usado (repetido como `as { role?: string }`) em ~15 rotas.
 */
export type AppSessionUser = {
  id: string;
  email?: string;
  role?: "THERAPIST" | "PATIENT";
  patientId?: string;
  clinicName?: string;
  theme?: string;
  crp?: string;
};

/**
 * Resultado dos guards de auth: ou o usuário autenticado, ou a Response de erro
 * a ser retornada imediatamente pela rota. Discriminada por `response`.
 */
type AuthOk = { user: AppSessionUser; response?: undefined };
type AuthFail = { user?: undefined; response: NextResponse };
export type AuthResult = AuthOk | AuthFail;

/**
 * Exige uma sessão autenticada (qualquer role). Retorna 401 se ausente.
 * Preserva o status code e o corpo `{ error: "Unauthorized" }` usados nas rotas.
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user: session.user as AppSessionUser };
}

/**
 * Exige uma sessão de THERAPIST. Retorna 401 se não autenticado ou role !=
 * THERAPIST — exatamente o comportamento atual das rotas de terapeuta.
 */
export async function requireTherapist(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as AppSessionUser).role !== "THERAPIST") {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user: session.user as AppSessionUser };
}

/**
 * Exige um terapeuta com CRP verificado no banco (`crpStatus === "verified"`).
 * O gate de CRP existia só no client (página Mundo Interior); aqui ele passa a
 * ser aplicado no servidor — um terapeuta sem CRP verificado não opera as
 * sessões terapêuticas via API direta. Retorna 401 (não-terapeuta) ou 403
 * (terapeuta sem verificação). Em sucesso, devolve também o `therapistId`.
 */
export async function requireVerifiedCrp(): Promise<
  AuthFail | { user: AppSessionUser; therapistId: string; response?: undefined }
> {
  const auth = await requireTherapist();
  if (auth.response) return auth;

  const therapistId = auth.user.id;
  const user = await prisma.user.findUnique({
    where: { id: therapistId },
    select: { crpStatus: true },
  });

  if (user?.crpStatus !== "verified") {
    return {
      response: NextResponse.json(
        { error: "Verificação de CRP necessária" },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user, therapistId };
}

/**
 * Comparação de segredo resistente a timing attack e fail-CLOSED.
 *
 * - Se `expected` (env var) estiver ausente/vazio, retorna `false` — nunca
 *   autoriza por configuração faltante (o `Bearer undefined`/`=== undefined`
 *   anterior era fail-open).
 * - Usa `timingSafeEqual` sobre buffers de mesmo tamanho para não vazar o
 *   comprimento nem permitir comparação byte-a-byte por tempo.
 */
export function safeSecretCompare(
  provided: string | null | undefined,
  expected: string | undefined
): boolean {
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
