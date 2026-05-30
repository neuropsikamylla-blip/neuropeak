export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Checa conectividade com o banco sem expor dados (contagem, schema, etc.).
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // Rota pública: nunca vazar a mensagem de erro interna ao cliente.
    console.error("[API GET /api/health]", e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
