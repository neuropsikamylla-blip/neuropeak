"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface AppUpdateButtonProps {
  iconClass?: string;
  buttonClass?: string;
  showVersion?: boolean;
}

export function AppUpdateButton({ iconClass = "w-4 h-4", buttonClass = "", showVersion = false }: AppUpdateButtonProps) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as { version: string; appVersion: string };

      setAppVersion(data.appVersion);

      const stored = sessionStorage.getItem("neuropeak-version");
      if (!stored) {
        sessionStorage.setItem("neuropeak-version", data.version);
        return;
      }
      if (stored !== data.version) {
        setHasUpdate(true);
      }
    } catch {
      // offline ou sem rede — ignora silenciosamente
    }
  }, []);

  useEffect(() => {
    checkForUpdate();
    const id = setInterval(checkForUpdate, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [checkForUpdate]);

  function handleUpdate() {
    setLoading(true);
    sessionStorage.removeItem("neuropeak-version");
    window.location.reload();
  }

  if (showVersion) {
    return (
      <div className="flex items-center gap-2">
        {appVersion && (
          <span className="text-xs text-gray-400 font-mono">v{appVersion}</span>
        )}
        <button
          onClick={handleUpdate}
          disabled={loading}
          title={hasUpdate ? "Nova versão disponível — toque para atualizar" : "Verificar atualização"}
          aria-label="Atualizar aplicativo"
          className={`relative p-1.5 rounded-lg transition-opacity hover:opacity-75 active:scale-95 ${buttonClass}`}
        >
          <RefreshCw className={`${iconClass} ${loading ? "animate-spin" : ""}`} />
          {hasUpdate && !loading && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
        {hasUpdate && (
          <span className="text-xs text-red-500 font-medium animate-pulse">Nova versão!</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      title={hasUpdate ? "Nova versão disponível — toque para atualizar" : "Atualizar app"}
      aria-label="Atualizar aplicativo"
      className={`relative p-1.5 rounded-lg transition-opacity hover:opacity-75 active:scale-95 ${buttonClass}`}
    >
      <RefreshCw className={`${iconClass} ${loading ? "animate-spin" : ""}`} />
      {hasUpdate && !loading && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </button>
  );
}
