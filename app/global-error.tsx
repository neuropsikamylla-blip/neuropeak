"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Algo deu errado</h2>
        <p style={{ color: "#6b7280", maxWidth: 420 }}>
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={() => reset()}
          style={{
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
