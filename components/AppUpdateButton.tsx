"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface AppUpdateButtonProps {
  iconClass?: string;
  buttonClass?: string;
}

export function AppUpdateButton({ iconClass = "w-4 h-4", buttonClass = "" }: AppUpdateButtonProps) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) return;
      const { version } = await res.json() as { version: string };

      const stored = sessionStorage.getItem("neuropeak-version");
      if (!stored) {
        sessionStorage.setItem("neuropeak-version", version);
        return;
      }
      if (stored !== version) {
        setHasUpdate(true);
      }
    } catch {
      // offline or network error — silently ignore
    }
  }, []);

  useEffect(() => {
    checkForUpdate();
    // Re-check every 10 minutes while the app is open
    const id = setInterval(checkForUpdate, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [checkForUpdate]);

  function handleUpdate() {
    setLoading(true);
    sessionStorage.removeItem("neuropeak-version");
    window.location.reload();
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
