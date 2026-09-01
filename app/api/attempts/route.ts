import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Tentativas de exercício — a peça que separa "nunca realizado" de "iniciado e abandonado".
 *
 * Seção 29 da espec do Jogo das Torres (31/ago/2026). Até aqui, `Session` só nascia no fim: quem
 * desistia no meio não deixava rastro nenhum, e a auditoria de 31/ago mostrou o custo disso —
 * ZERO sessões de `torre-hanoi` no banco, contra 72 de outros 21 exercícios. O silêncio não tinha
 * como ser lido.
 *
 * O abandono é INFERIDO: uma tentativa que ficou em INICIADO e nunca virou CONCLUIDO foi
 * abandonada. Depender de evento de fechamento de aba seria menos confiável — o navegador não
 * garante entrega.
 */

const postSchema = z.object({
  exerciseId: z.string().min(1).max(64),
  difficulty: z.number().int().min(1).max(20).optional(),
});

const patchSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(["CONCLUIDO", "INTERROMPIDO"]),
  metadata: z.string().max(8000).optional(),
});

/** Só o próprio paciente registra a própria tentativa. */
async function patientIdDaSessao() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { patientId?: string; role?: string } | undefined)?.patientId;
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "PATIENT" && id ? id : null;
}

export async function POST(req: Request) {
  const patientId = await patientIdDaSessao();
  if (!patientId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const attempt = await prisma.exerciseAttempt.create({
    data: { patientId, exerciseId: parsed.data.exerciseId, difficulty: parsed.data.difficulty ?? null },
    select: { id: true },
  });
  return NextResponse.json({ id: attempt.id }, { status: 201 });
}

export async function PATCH(req: Request) {
  const patientId = await patientIdDaSessao();
  if (!patientId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  // `updateMany` com o patientId no filtro: ninguém fecha a tentativa de outro paciente.
  const r = await prisma.exerciseAttempt.updateMany({
    where: { id: parsed.data.id, patientId },
    data: { status: parsed.data.status, endedAt: new Date(), metadata: parsed.data.metadata ?? null },
  });
  if (r.count === 0) return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
