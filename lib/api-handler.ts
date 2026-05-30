import { NextRequest, NextResponse } from "next/server";

/**
 * Envolve um route handler do App Router com try/catch + logging padronizado.
 *
 * Exceções não tratadas viram um 500 JSON consistente (`{ error }`) em vez do HTML
 * de erro do Next — o que o cliente espera — e são logadas com método + rota para
 * diagnóstico em produção (Vercel captura stdout/stderr). Não engole erros: registra.
 */
export function withApiHandler<Args extends unknown[]>(
  handler: (req: NextRequest, ...args: Args) => Promise<Response> | Response
) {
  return async (req: NextRequest, ...args: Args): Promise<Response> => {
    try {
      return await handler(req, ...args);
    } catch (e) {
      console.error(`[API ${req.method} ${req.nextUrl.pathname}]`, e);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  };
}
