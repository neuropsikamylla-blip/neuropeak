"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Algo deu errado</h2>
      <p className="max-w-md text-gray-500">
        Ocorreu um erro inesperado. Você pode tentar novamente — se persistir, contate o suporte.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
