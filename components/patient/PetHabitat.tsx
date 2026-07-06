"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadPet, petDisplayName, usedInteractionsToday, spendInteraction, interactionsAvailable,
  petSleepState, putPetToSleep, clearPetSleep, PET_ACTIONS,
  type PetState, type PetAction, type SleepState,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";
import { LivePet } from "./LivePet";

// Jornada do bichinho (tema Kids):
//  🥚 OVO  →  (1º treino)  →  🐣 NASCE  →  interações (fogo/voar/comer/piscar)
//  liberadas por treino  →  😴 dormir até o próximo treino  →  🌅 acorda.
export function PetHabitat({ patientId, sessionsToday }: { patientId: string; playerName?: string; sessionsToday: number }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [used, setUsed] = useState(0);
  const [anim, setAnim] = useState<PetAction | null>(null);
  const [sleep, setSleep] = useState<SleepState>("awake");

  useEffect(() => {
    const p = loadPet(patientId);
    setPet(p);
    setUsed(usedInteractionsToday(patientId));
    setSleep(petSleepState(patientId, p.care));
  }, [patientId]);

  // Se está "acordando" (treinou de novo), mostra a animação e depois volta ao normal.
  useEffect(() => {
    if (sleep !== "waking") return;
    const t = window.setTimeout(() => { clearPetSleep(patientId); setSleep("awake"); }, 3200);
    return () => window.clearTimeout(t);
  }, [sleep, patientId]);

  if (!pet) return null;

  // Sem bichinho ainda → manda criar no Início.
  if (!pet.kind) {
    return (
      <div style={{ minHeight: "calc(100vh - 130px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, boxShadow: "0 16px 40px rgba(30,60,120,.12)" }}>
          <div style={{ fontSize: 56 }}>🥚</div>
          <p style={{ fontWeight: 800, color: "#0f766e", fontSize: 18, margin: "10px 0 6px" }}>Você ainda não tem um bichinho!</p>
          <p style={{ color: "#5b7", fontSize: 13, marginBottom: 16 }}>Vá ao Início e escolha o seu para começar.</p>
          <Link href="/inicio" style={{ display: "inline-block", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", color: "#fff", fontWeight: 800, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}>Ir para o Início →</Link>
        </div>
      </div>
    );
  }

  const name = petDisplayName(pet);
  const born = pet.care >= 1;            // nasceu após o 1º treino
  const displayStage = born ? 2 : 0;     // 0 = ovo; 2 = dragão (tamanho fixo)
  const available = interactionsAvailable(patientId, sessionsToday);

  // O que o bichinho está fazendo agora.
  const action: "comer" | "fogo" | "voar" | "piscar" | "dormir" | "acordando" | null =
    sleep === "sleeping" ? "dormir"
    : sleep === "waking" ? "acordando"
    : (anim as "comer" | "fogo" | "voar" | "piscar" | null) ?? null;

  function doAction(a: PetAction) {
    if (available < 1 || anim || sleep !== "awake") return;
    spendInteraction(patientId);
    setUsed((u) => u + 1);
    setAnim(a);
    window.setTimeout(() => setAnim(null), 2000);
  }
  function goSleep() {
    if (anim || sleep !== "awake") return;
    putPetToSleep(patientId, pet!.care);
    setSleep("sleeping");
  }

  const scene = "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)";
  const sceneNight = "linear-gradient(180deg,#c7d2fe 0%,#e0e7ff 62%)";

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 18px 44px rgba(30,60,120,.18)", border: "3px solid #fff" }}>
        {/* CENA */}
        <div style={{ position: "relative", height: 360, background: sleep === "sleeping" ? sceneNight : scene }}>
          {/* nome */}
          <div style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex" }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "8px 14px", boxShadow: "0 4px 14px rgba(30,60,120,.1)" }}>
              <span style={{ fontWeight: 800, color: "#0f766e", fontSize: 15 }}>{name}</span>
              {sleep === "sleeping" && <span style={{ marginLeft: 8, fontSize: 12 }}>💤 dormindo</span>}
            </div>
          </div>

          {/* bichinho / ovo */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              {born ? (
                <LivePet kind={pet.kind} stage={displayStage} size={220} color={pet.color} action={action} />
              ) : (
                <PetCreature kind={pet.kind} stage={0} size={210} color={pet.color} />
              )}
            </div>
          </div>
        </div>

        {/* PAINEL DE BAIXO */}
        <div style={{ background: "#fff", padding: "14px 12px 14px" }}>
          {!born ? (
            // ── Fase OVO ──────────────────────────────────────────────
            <div style={{ textAlign: "center", padding: "6px 8px" }}>
              <p style={{ fontWeight: 800, color: "#0f766e", fontSize: 15, margin: "0 0 4px" }}>Seu ovo está quase chocando! 🥚</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>Faça <b>1 treino</b> para {name} nascer 🐣</p>
              <Link href="/inicio" style={{ display: "inline-block", marginTop: 12, background: "linear-gradient(135deg,#14b8a6,#06b6d4)", color: "#fff", fontWeight: 800, padding: "11px 22px", borderRadius: 999, textDecoration: "none", fontSize: 14 }}>Fazer um treino →</Link>
            </div>
          ) : sleep === "sleeping" ? (
            // ── Dormindo ─────────────────────────────────────────────
            <div style={{ textAlign: "center", padding: "10px 8px" }}>
              <p style={{ fontWeight: 800, color: "#4f46e5", fontSize: 15, margin: "0 0 4px" }}>Shhh... {name} está dormindo 💤</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>Ele acorda quando você fizer o <b>próximo treino</b>.</p>
              <Link href="/inicio" style={{ display: "inline-block", marginTop: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 800, padding: "11px 22px", borderRadius: 999, textDecoration: "none", fontSize: 14 }}>Treinar para acordar →</Link>
            </div>
          ) : sleep === "waking" ? (
            // ── Acordando ────────────────────────────────────────────
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <p style={{ fontWeight: 800, color: "#0f766e", fontSize: 16 }}>Bom dia! {name} acordou! 🌅</p>
            </div>
          ) : (
            // ── Acordado: interações ─────────────────────────────────
            <>
              <div style={{ display: "flex", gap: 8 }}>
                {PET_ACTIONS.map((a) => {
                  const locked = available < 1;
                  return (
                    <button key={a.id} onClick={() => doAction(a.id)} disabled={locked || !!anim}
                      style={{
                        flex: 1, border: "2px solid", borderColor: locked ? "#e2e8f0" : "#a5f3fc",
                        background: locked ? "#f1f5f9" : "#ecfeff", borderRadius: 16, padding: "10px 2px",
                        cursor: locked || anim ? "default" : "pointer", opacity: anim && !locked ? 0.6 : 1,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "transform .1s",
                      }}>
                      <span style={{ fontSize: 24 }}>{locked ? "🔒" : a.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: locked ? "#94a3b8" : "#0f766e" }}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Dormir */}
              <button onClick={goSleep} disabled={!!anim}
                style={{ width: "100%", marginTop: 10, border: "2px solid #ddd6fe", background: "#f5f3ff", borderRadius: 16, padding: "9px 4px",
                  cursor: anim ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: anim ? 0.6 : 1 }}>
                <span style={{ fontSize: 20 }}>😴</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "#6d28d9" }}>Colocar para dormir</span>
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                {available > 0 ? (
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 999, padding: "5px 14px" }}>
                    ✨ {available} {available === 1 ? "interação liberada" : "interações liberadas"} hoje
                  </span>
                ) : (
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>Faça um treino para brincar com {name}! 💪</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
