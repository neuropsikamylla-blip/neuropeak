"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Versão do código que está rodando AGORA (embutida no bundle pelo build).
const LOADED = process.env.NEXT_PUBLIC_APP_VERSION;
const RKEY = "np-auto-reload-at";

// É um exercício em andamento? (não recarregar — perderia a sessão do paciente)
function inExercise(path: string): boolean {
  return /^\/treino\/[^/]+$/.test(path) && path !== "/treino/mundo-interior";
}

// Recarrega LIMPANDO qualquer service worker/cache antes — garante que o
// paciente pegue a versão nova de verdade (sem "pedaço" antigo). Trava de 20s
// pra nunca entrar em loop.
function reloadGuarded() {
  try {
    const last = +(sessionStorage.getItem(RKEY) || 0);
    if (Date.now() - last < 20000) return;
    sessionStorage.setItem(RKEY, String(Date.now()));
  } catch { /* */ }
  (async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch { /* */ }
    window.location.reload();
  })();
}

/**
 * Atualização automática: compara a versão do código rodando com a do servidor.
 * Quando sai um deploy novo, recarrega SOZINHO — mas só em tela segura (nunca no
 * meio de um exercício). O paciente não precisa fazer nada.
 */
export function AutoUpdater() {
  const pathname = usePathname();

  // Verificação periódica (sem visibilitychange — pode causar reload inesperado com Zoom remote control).
  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok || stop) return;
        const data = (await res.json()) as { appVersion?: string };
        if (LOADED && data.appVersion && data.appVersion !== LOADED && !inExercise(window.location.pathname)) {
          reloadGuarded();
        }
      } catch { /* offline — ignora */ }
    }
    check();
    const id = setInterval(check, 60 * 1000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => { stop = true; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  // Ao trocar de rota (ex.: o paciente sai do exercício), atualiza se houver versão nova.
  useEffect(() => {
    if (inExercise(pathname)) return;
    fetch("/api/version", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { appVersion?: string } | null) => {
        if (data?.appVersion && LOADED && data.appVersion !== LOADED) reloadGuarded();
      })
      .catch(() => { /* */ });
  }, [pathname]);

  return null;
}
