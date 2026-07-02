"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadPet, petStage, careProgress, sessionsToNextStage, petDisplayName,
  usedInteractionsToday, spendInteraction,
  INTERACTIONS_PER_SESSION, STAGE_LABELS, PET_ACTIONS,
  type PetState, type PetAction,
} from "@/lib/pet";
import { LivePet } from "./LivePet";

// Habitat estilo Tamagotchi (tema Kids). O bichinho vive numa cena e a criança
// pode alimentar, brincar e colocar pra dormir. As interações são LIBERADAS por
// treino (recompensa), então cuidar do bichinho incentiva a terapia.
export function PetHabitat({ patientId, playerName, sessionsToday }: { patientId: string; playerName: string; sessionsToday: number }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [used, setUsed] = useState(0);
  const [anim, setAnim] = useState<PetAction | null>(null);

  useEffect(() => {
    setPet(loadPet(patientId));
    setUsed(usedInteractionsToday(patientId));
  }, [patientId]);

  if (!pet) return null;

  const available = Math.max(0, sessionsToday * INTERACTIONS_PER_SESSION - used);

  function doAction(a: PetAction) {
    if (available < 1 || anim) return;
    spendInteraction(patientId);
    setUsed((u) => u + 1);
    setAnim(a);
    window.setTimeout(() => setAnim(null), a === "dormir" ? 2600 : 1700);
  }

  // Sem bichinho ainda → manda criar no Início.
  if (!pet.kind) {
    return (
      <div style={{ minHeight: "calc(100vh - 130px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, boxShadow: "0 16px 40px rgba(30,60,120,.12)" }}>
          <div style={{ fontSize: 56 }}>🥚</div>
          <p style={{ fontWeight: 800, color: "#0f766e", fontSize: 18, margin: "10px 0 6px" }}>Você ainda não tem um bichinho!</p>
          <p style={{ color: "#5b7", fontSize: 13, marginBottom: 16 }}>Vá ao Início e escolha o seu para começar a cuidar dele.</p>
          <Link href="/inicio" style={{ display: "inline-block", background: "linear-gradient(135deg,#14b8a6,#06b6d4)", color: "#fff", fontWeight: 800, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}>Ir para o Início →</Link>
        </div>
      </div>
    );
  }

  const stage = petStage(pet.care);
  const pct = Math.round(careProgress(pet.care) * 100);
  const faltam = sessionsToNextStage(pet.care);
  const isAdult = stage >= 3;
  const name = petDisplayName(pet);
  const action = anim === "alimentar" ? "comer" : anim === "brincar" ? "brincar" : anim === "dormir" ? "dormir" : null;

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      {/* CENA */}
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 18px 44px rgba(30,60,120,.18)", border: "3px solid #fff" }}>
        {/* quartinho claro (fundo branco evita a "borda branca" do recorte) */}
        <div style={{ position: "relative", height: 360, background: "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)" }}>
          {/* cabeçalho: nome + fase + progresso */}
          <div style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex" }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "8px 12px", minWidth: 150, boxShadow: "0 4px 14px rgba(30,60,120,.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 800, color: "#0f766e", fontSize: 14 }}>{name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#0d9488", background: "#ccfbf1", padding: "1px 7px", borderRadius: 999 }}>{STAGE_LABELS[stage]}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#e2e8f0", marginTop: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f43f5e,#fb7185)", borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                {isAdult ? "Cresceu tudo! 🎉" : `Faltam ${faltam} ${faltam === 1 ? "treino" : "treinos"} 🌟`}
              </div>
            </div>
          </div>

          {/* bichinho VIVO — anima sozinho e fica 100% visível */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              <LivePet kind={pet.kind} stage={stage} size={220} color={pet.color} action={action} />
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div style={{ background: "#fff", padding: "14px 12px 12px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {PET_ACTIONS.map((a) => {
              const locked = available < 1;
              return (
                <button key={a.id} onClick={() => doAction(a.id)} disabled={locked || !!anim}
                  style={{
                    flex: 1, border: "2px solid", borderColor: locked ? "#e2e8f0" : "#a5f3fc",
                    background: locked ? "#f1f5f9" : "#ecfeff", borderRadius: 16, padding: "10px 4px",
                    cursor: locked || anim ? "default" : "pointer", opacity: anim && !locked ? 0.6 : 1,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "transform .1s",
                  }}>
                  <span style={{ fontSize: 26 }}>{locked ? "🔒" : a.emoji}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: locked ? "#94a3b8" : "#0f766e" }}>{locked ? "amanhã" : a.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            {available > 0 ? (
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 999, padding: "5px 14px" }}>
                ✨ {available} {available === 1 ? "interação liberada" : "interações liberadas"} hoje
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: "#64748b" }}>
                Faça um treino para liberar carinhos com {name}! 💪
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
