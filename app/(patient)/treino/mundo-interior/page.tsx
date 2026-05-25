"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MundoInterior } from "@/components/therapeutic/MundoInterior";
import type { TherapeuticSession } from "@/components/therapeutic/MundoInterior";

export default function MundoInteriorPatientPage() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const [session, setSession] = useState<TherapeuticSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((authSession?.user as { role?: string })?.role !== "PATIENT") { router.replace("/login"); return; }

    fetch("/api/therapeutic-sessions")
      .then(r => r.json())
      .then(data => { setSession(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, authSession, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <span className="text-6xl">🌌</span>
        <p className="text-white font-bold text-xl text-center">Mundo Interior</p>
        <p className="text-white/50 text-sm text-center max-w-xs">
          Aguardando sua terapeuta iniciar uma sessão. Quando estiver pronto, esta tela atualizará automaticamente.
        </p>
        <div className="flex gap-1 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return <MundoInterior sessionId={session.id} />;
}
