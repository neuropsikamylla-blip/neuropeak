export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth-helpers";

// Estado de gamificação (bichinho + árvore de habilidades) do paciente, persistido
// no servidor para não se perder ao trocar de aparelho ou limpar o navegador (ARQ-002).
// O paciente só acessa o PRÓPRIO estado (via patientId da sessão).

const putSchema = z.object({
  petState: z.unknown().optional(),
  skillState: z.unknown().optional(),
});

// GET — devolve o estado salvo do paciente logado.
export const GET = withApiHandler(async () => {
  const { user, response } = await requireAuth();
  if (response) return response;
  if (user.role !== "PATIENT" || !user.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const patient = await prisma.patient.findUnique({
    where: { id: user.patientId },
    select: { petState: true, skillState: true },
  });
  return NextResponse.json({
    petState: patient?.petState ?? null,
    skillState: patient?.skillState ?? null,
  });
});

// PUT — salva o estado do paciente logado (só os campos enviados).
export const PUT = withApiHandler(async (req: NextRequest) => {
  const { user, response } = await requireAuth();
  if (response) return response;
  if (user.role !== "PATIENT" || !user.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const data: { petState?: object; skillState?: object } = {};
  if (parsed.data.petState !== undefined) data.petState = parsed.data.petState as object;
  if (parsed.data.skillState !== undefined) data.skillState = parsed.data.skillState as object;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true }); // nada a salvar
  }
  await prisma.patient.update({ where: { id: user.patientId }, data });
  return NextResponse.json({ ok: true });
});
