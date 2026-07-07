"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Feather, Apple, Eye, Lock, Moon, Egg, ArrowRight, Gift, type LucideIcon } from "lucide-react";
import {
  loadPet, petDisplayName, usedInteractionsToday, spendInteraction, interactionsAvailable,
  petSleepState, putPetToSleep, clearPetSleep, PET_ACTIONS,
  type PetState, type PetAction, type SleepState,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";
import { LivePet } from "./LivePet";

// Paleta infantil premium (azul/marinho/dourado — neutra, sem verde/rosa/roxo).
const INK = "#14213D", SUB = "#667085", NAVY = "#173B78", BLUE = "#1D4ED8";
const BORDER = "#E2E8F0", LIGHT = "#DBEAFE", LAV = "#EEF2FF", GOLD = "#E8B547";

// Ícones (figuras, não emoji) para cada interação.
const ACTION_ICON: Record<string, LucideIcon> = { fogo: Flame, voar: Feather, comer: Apple, piscar: Eye };

// Jornada do bichinho (tema Kids):
//  OVO  →  (1º treino)  →  NASCE  →  interações (fogo/voar/comer/piscar)
//  liberadas por treino  →  dormir até o próximo treino  →  acorda.
export function PetHabitat({ patientId, sessionsToday }: { patientId: string; playerName?: string; sessionsToday: number }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [, setUsed] = useState(0);
  const [anim, setAnim] = useState<PetAction | null>(null);
  const [sleep, setSleep] = useState<SleepState>("awake");
  const [dayAnim, setDayAnim] = useState<"descansar" | null>(null); // sequência de dormir tocando

  useEffect(() => {
    const p = loadPet(patientId);
    setPet(p);
    setUsed(usedInteractionsToday(patientId));
    setSleep(petSleepState(patientId, p.care));
  }, [patientId]);

  // Se está "acordando" (treinou de novo), toca a sequência e depois volta ao normal.
  useEffect(() => {
    if (sleep !== "waking") return;
    const t = window.setTimeout(() => { clearPetSleep(patientId); setSleep("awake"); }, 4600);
    return () => window.clearTimeout(t);
  }, [sleep, patientId]);

  if (!pet) return null;

  // Sem bichinho ainda → manda criar no Início.
  if (!pet.kind) {
    return (
      <div style={{ minHeight: "calc(100vh - 130px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, border: `1px solid ${BORDER}`, boxShadow: "0 12px 32px rgba(20,33,61,.08)" }}>
          <Egg size={52} color={GOLD} style={{ margin: "0 auto" }} />
          <p style={{ fontWeight: 800, color: NAVY, fontSize: 18, margin: "10px 0 6px" }}>Você ainda não tem um bichinho!</p>
          <p style={{ color: SUB, fontSize: 13, marginBottom: 16 }}>Vá ao Início e escolha o seu para começar.</p>
          <Link href="/inicio" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", fontWeight: 800, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}>Ir para o Início <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }

  const name = petDisplayName(pet);
  const born = pet.care >= 1;            // nasceu após o 1º treino
  const displayStage = born ? 2 : 0;     // 0 = ovo; 2 = bichinho (tamanho fixo)
  const available = interactionsAvailable(patientId, sessionsToday);

  // O que o bichinho está fazendo agora.
  const action: "comer" | "fogo" | "voar" | "piscar" | "dormir" | "descansar" | "acordar" | null =
    dayAnim ? "descansar"
    : sleep === "sleeping" ? "dormir"
    : sleep === "waking" ? "acordar"
    : (anim as "comer" | "fogo" | "voar" | "piscar" | null) ?? null;

  function doAction(a: PetAction) {
    if (available < 1 || anim || sleep !== "awake" || dayAnim) return;
    spendInteraction(patientId);
    setUsed((u) => u + 1);
    setAnim(a);
    window.setTimeout(() => setAnim(null), 2000);
  }
  function goSleep() {
    if (anim || sleep !== "awake" || dayAnim) return;
    putPetToSleep(patientId, pet!.care);
    setDayAnim("descansar");                                   // espreguiça → sonolento → dorme
    window.setTimeout(() => { setDayAnim(null); setSleep("sleeping"); }, 3400);
  }

  // Área do bichinho: fundo BRANCO/claro (a arte já é sobre branco). Noite = azul suave.
  const scene = "linear-gradient(180deg,#EEF2FF 0%,#FFFFFF 58%)";
  const sceneNight = "linear-gradient(180deg,#C7D2FE 0%,#EEF2FF 62%)";
  const night = sleep === "sleeping" || dayAnim;

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 14px 36px rgba(20,33,61,.10)" }}>
        {/* CENA */}
        <div style={{ position: "relative", height: 360, background: night ? sceneNight : scene, transition: "background .8s" }}>
          {/* nome */}
          <div style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex" }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "8px 14px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 14px rgba(20,33,61,.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>{name}</span>
              {sleep === "sleeping" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: SUB }}><Moon size={12} /> dormindo</span>}
            </div>
          </div>

          {/* bichinho / ovo */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 150, height: 14, background: "rgba(20,33,61,.10)", borderRadius: "50%", position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
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
              <p style={{ fontWeight: 800, color: NAVY, fontSize: 15, margin: "0 0 4px" }}>Seu ovo está quase chocando!</p>
              <p style={{ fontSize: 13, color: SUB }}>Faça <b>1 treino</b> para {name} nascer.</p>
              <Link href="/inicio" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", fontWeight: 800, padding: "11px 22px", borderRadius: 999, textDecoration: "none", fontSize: 14 }}>Fazer um treino <ArrowRight size={16} /></Link>
            </div>
          ) : dayAnim ? (
            // ── Se ajeitando pra dormir (espreguiça → sonolento → dorme) ──
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <p style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>Boa noite… {name} está se ajeitando</p>
            </div>
          ) : sleep === "sleeping" ? (
            // ── Dormindo ─────────────────────────────────────────────
            <div style={{ textAlign: "center", padding: "10px 8px" }}>
              <p style={{ fontWeight: 800, color: NAVY, fontSize: 15, margin: "0 0 4px" }}>Shhh... {name} está dormindo</p>
              <p style={{ fontSize: 13, color: SUB }}>Ele acorda quando você fizer o <b>próximo treino</b>.</p>
              <Link href="/inicio" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", fontWeight: 800, padding: "11px 22px", borderRadius: 999, textDecoration: "none", fontSize: 14 }}>Treinar para acordar <ArrowRight size={16} /></Link>
            </div>
          ) : sleep === "waking" ? (
            // ── Acordando ────────────────────────────────────────────
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <p style={{ fontWeight: 800, color: NAVY, fontSize: 16 }}>Bom dia! {name} acordou!</p>
            </div>
          ) : (
            // ── Acordado: interações ─────────────────────────────────
            <>
              <div style={{ display: "flex", gap: 8 }}>
                {PET_ACTIONS.map((a) => {
                  const locked = available < 1;
                  const Ic = ACTION_ICON[a.id] ?? Gift;
                  return (
                    <button key={a.id} onClick={() => doAction(a.id)} disabled={locked || !!anim}
                      style={{
                        flex: 1, border: "1px solid", borderColor: locked ? BORDER : LIGHT,
                        background: locked ? "#F6F8FC" : LAV, borderRadius: 16, padding: "10px 2px",
                        cursor: locked || anim ? "default" : "pointer", opacity: anim && !locked ? 0.6 : 1,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "transform .1s",
                      }}>
                      {locked ? <Lock size={20} color="#94A3B8" /> : <Ic size={20} color={BLUE} />}
                      <span style={{ fontSize: 11, fontWeight: 800, color: locked ? "#94A3B8" : NAVY }}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Dormir */}
              <button onClick={goSleep} disabled={!!anim}
                style={{ width: "100%", marginTop: 10, border: `1px solid ${BORDER}`, background: "#F6F8FC", borderRadius: 16, padding: "9px 4px",
                  cursor: anim ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: anim ? 0.6 : 1 }}>
                <Moon size={17} color={NAVY} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: NAVY }}>Colocar para dormir</span>
              </button>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                {available > 0 ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "#8A6410", background: "#FBF3DC", border: `1px solid ${GOLD}55`, borderRadius: 999, padding: "5px 14px" }}>
                    <Gift size={14} color={GOLD} /> {available} {available === 1 ? "interação liberada" : "interações liberadas"} hoje
                  </span>
                ) : (
                  <span style={{ fontSize: 12.5, color: SUB }}>Faça um treino para brincar com {name}!</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
