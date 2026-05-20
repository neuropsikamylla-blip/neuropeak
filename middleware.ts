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
      path.startsWith("/relatorios")
    ) {
      if (token?.role !== "THERAPIST") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Patient routes
    if (
      path.startsWith("/inicio") ||
      path.startsWith("/treino") ||
      path.startsWith("/progresso")
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
    "/inicio/:path*",
    "/treino/:path*",
    "/progresso/:path*",
  ],
};
