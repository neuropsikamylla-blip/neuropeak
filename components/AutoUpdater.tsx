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

// Recarrega, mas com trava de 20s pra nunca entrar em loop (ex.: cache teimoso).
function reloadGuarded() {
  try {
    const last = +(sessionStorage.getItem(RKEY) || 0);
    if (Date.now() - last < 20000) return;
    sessionStorage.setItem(RKEY, String(Date.now()));
  } catch { /* */ }
  window.location.reload();
}

/**
 * Atualização automática: compara a versão do código rodando com a do servidor.
 * Quando sai um deploy novo, recarrega SOZINHO — mas só em tela segura (nunca no
 * meio de um exercício). O paciente não precisa fazer nada.
 */
export function AutoUpdater() {
  const pathname = usePathname();

  // Verificação periódica + ao voltar o foco pro app.
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
    const id = setInterval(check, 90 * 1000);
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
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
