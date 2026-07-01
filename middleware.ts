import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Therapist routes
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/pacientes") ||
      path.startsWith("/relatorios") ||
      path.startsWith("/treino-cognitivo") ||
      path.startsWith("/mundo-interior") ||
      path.startsWith("/configuracoes") ||
      path.startsWith("/admin")
    ) {
      if (token?.role !== "THERAPIST") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Patient routes
    // Note: checked with `else if` because "/treino-cognitivo" (therapist)
    // is a prefix-superset of "/treino" (patient). Without the exclusivity, a
    // therapist hitting /treino-cognitivo would match this block too and be
    // wrongly redirected to /login.
    else if (
      path.startsWith("/inicio") ||
      path.startsWith("/treino") ||
      path.startsWith("/progresso") ||
      path.startsWith("/jornada")
    ) {
      if (token?.role !== "PATIENT") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pacientes/:path*",
    "/relatorios/:path*",
    "/treino-cognitivo/:path*",
    "/mundo-interior/:path*",
    "/configuracoes/:path*",
    "/admin/:path*",
    "/inicio/:path*",
    "/treino/:path*",
    "/progresso/:path*",
    "/jornada/:path*",
  ],
};
