"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Apple, Gamepad2, Eye, Heart, Flame, Feather, Music2, Wind, ArrowUp, Hand,
  Moon, Sun, Egg, ArrowRight, ChevronDown, Sparkles, type LucideIcon,
} from "lucide-react";
import {
  loadPet, petDisplayName, putPetToSleep, clearPetSleep, isPetSleeping, HATCH_TARGET,
  type PetKind, type PetState,
} from "@/lib/pet";
import { PetCreature } from "./PetCreature";
import { LivePet } from "./LivePet";

// ── Paleta infantil premium (azul/marinho/dourado, neutra) ───────────────────
const INK = "#14213D", SUB = "#667085", NAVY = "#173B78", BLUE = "#1D4ED8";
const BORDER = "#E2E8F0", GOLD = "#E8B547", POS_BG = "#DDF7EF", POS_TX = "#047857";

// ── Ações: id → rótulo, ícone e a animação correspondente no LivePet ─────────
type ActionId =
  | "comer" | "brincar" | "piscar" | "carinho"
  | "fogo" | "voar" | "dancar" | "baterasas"
  | "pular" | "fazerCoracao" | "acenar";
const ACTIONS: Record<ActionId, { label: string; Icon: LucideIcon; live: string }> = {
  comer:       { label: "Comer",        Icon: Apple,   live: "comer" },
  brincar:     { label: "Brincar",      Icon: Gamepad2, live: "brincar" },
  piscar:      { label: "Piscar",       Icon: Eye,     live: "piscar" },
  carinho:     { label: "Carinho",      Icon: Heart,   live: "carinho" },
  fogo:        { label: "Soltar fogo",  Icon: Flame,   live: "fogo" },
  voar:        { label: "Voar",         Icon: Feather, live: "voar" },
  dancar:      { label: "Dançar",       Icon: Music2,  live: "dancar" },
  baterasas:   { label: "Bater asas",   Icon: Wind,    live: "baterasas" },
  pular:       { label: "Pular",        Icon: ArrowUp, live: "pular" },
  fazerCoracao:{ label: "Fazer coração",Icon: Heart,   live: "carinho" },
  acenar:      { label: "Acenar",       Icon: Hand,    live: "acenar" },
};

// ── Configuração por personagem (Flama = dragão, Bolinho = monstrinho) ───────
interface PetConfig {
  tipo: string;
  quick: ActionId[];
  mais: ActionId[];
  textos: Record<string, string>; // {n} = nome do pet
}
const PETS: Record<PetKind, PetConfig> = {
  dragao: {
    tipo: "Dragão bebê",
    quick: ["comer", "brincar", "piscar", "carinho"],
    mais: ["fogo", "voar", "dancar", "baterasas"],
    textos: {
      idle: "{n} está animado para treinar.",
      dormindo: "{n} está descansando.",
      comer: "{n} adorou o lanche!",
      brincar: "{n} quer brincar um pouco.",
      piscar: "{n} te deu uma piscadinha.",
      carinho: "{n} gostou do carinho.",
      fogo: "{n} soltou uma chama!",
      voar: "{n} está voando!",
      dancar: "{n} está dançando!",
      baterasas: "{n} abriu as asas!",
    },
  },
  monstrinho: {
    tipo: "Bichinho fofo",
    quick: ["comer", "brincar", "piscar", "carinho"],
    mais: ["pular", "fazerCoracao", "dancar", "acenar"],
    textos: {
      idle: "{n} está feliz em te ver.",
      dormindo: "{n} está descansando.",
      comer: "{n} adorou o lanche!",
      brincar: "{n} quer brincar.",
      piscar: "{n} te deu uma piscadinha.",
      carinho: "{n} gostou do carinho.",
      pular: "{n} pulou de alegria!",
      fazerCoracao: "{n} mandou um coração.",
      dancar: "{n} está dançando!",
      acenar: "{n} está te acenando!",
    },
  },
};

// Nuvem decorativa (fica FORA do palco branco).
function Cloud({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", background: "rgba(255,255,255,0.75)", borderRadius: 999, filter: "blur(1px)", ...style }} />;
}

export function PetHabitat({ patientId, sessionsToday }: { patientId: string; playerName?: string; sessionsToday: number }) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const [acting, setActing] = useState<ActionId | null>(null);
  const [transition, setTransition] = useState<"descansar" | "acordar" | null>(null);
  const [showMore, setShowMore] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setPet(loadPet(patientId));
    setSleeping(isPetSleeping(patientId));
  }, [patientId]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  if (!pet) return null;

  // Sem bichinho escolhido → manda pro Início.
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

  const kind = pet.kind;
  const cfg = PETS[kind];
  const nome = petDisplayName(pet);
  const t = (k: string) => (cfg.textos[k] ?? cfg.textos.idle).replace("{n}", nome);

  // Incubação (configurável).
  const feitos = pet.care;
  const faltam = Math.max(HATCH_TARGET - feitos, 0);
  const chocou = feitos >= HATCH_TARGET;
  const quaseChocando = !chocou && faltam === 1;
  const justHatched = chocou && feitos === HATCH_TARGET;

  const busy = !!acting || !!transition;

  // Animação atual do LivePet.
  const liveAction = transition ? transition
    : sleeping ? "dormir"
    : acting ? (ACTIONS[acting].live as "comer")
    : null;

  // ── Handlers ────────────────────────────────────────────────────────────
  function play(id: ActionId) {
    if (sleeping || busy) return;
    setActing(id);
    timers.current.push(setTimeout(() => setActing(null), 2200));
  }
  function rest() {
    if (busy) return;
    setShowMore(false);
    setTransition("descansar");                                  // se ajeita → dorme
    timers.current.push(setTimeout(() => {
      putPetToSleep(patientId, pet!.care); setSleeping(true); setTransition(null);
    }, 3400));
  }
  function wake() {
    if (busy) return;
    setTransition("acordar");                                    // travesseiro → espreguiça
    timers.current.push(setTimeout(() => {
      clearPetSleep(patientId); setSleeping(false); setTransition(null);
    }, 3000));
  }

  // ── Status curto + mensagem contextual ──────────────────────────────────
  const status =
    !chocou ? (quaseChocando ? "Quase chocando" : "Incubando")
    : transition === "descansar" ? "Com sono"
    : transition === "acordar" ? "Acordando"
    : sleeping ? "Descansando"
    : acting ? "Animado"
    : "Pronto para brincar";
  const statusPositive = sleeping || status === "Pronto para brincar";

  const faltamTxt = faltam === 1 ? `Falta 1 treino para ${nome} nascer` : `Faltam ${faltam} treinos para ${nome} nascer`;
  const mensagem =
    !chocou ? (quaseChocando ? "Seu ovo está quase chocando!" : faltamTxt)
    : transition === "descansar" ? `${nome} está ficando com sono...`
    : transition === "acordar" ? `Bom dia! ${nome} está acordando.`
    : sleeping ? t("dormindo")
    : justHatched ? `${nome} nasceu!`
    : acting ? t(acting)
    : sessionsToday > 0 ? "Você concluiu os treinos de hoje."
    : t("idle");

  // ── Cena externa (lúdica) + palco interno branco ────────────────────────
  const scene = "linear-gradient(180deg,#EAF3FF 0%,#DCEBFF 100%)";
  const sceneNight = "linear-gradient(180deg,#C7D2FE 0%,#E4E9FF 100%)";
  const night = sleeping || transition === "descansar";

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", borderRadius: 28, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 16px 40px rgba(20,33,61,.10)" }}>

        {/* ── CENA EXTERNA (céu, nuvens, estrelas) ─────────────────────── */}
        <div style={{ position: "relative", background: night ? sceneNight : scene, transition: "background .8s", padding: "16px 16px 18px" }}>
          {/* enfeites (fora do palco) */}
          <Cloud style={{ top: 60, left: -12, width: 70, height: 22 }} />
          <Cloud style={{ top: 96, right: -6, width: 54, height: 18 }} />
          {night
            ? <>
                <Sparkles size={16} color="#FFFFFF" style={{ position: "absolute", top: 14, right: 20, opacity: .9 }} />
                <Sparkles size={11} color="#FFFFFF" style={{ position: "absolute", top: 40, right: 54, opacity: .7 }} />
              </>
            : <Sparkles size={14} color={GOLD} style={{ position: "absolute", top: 16, right: 22, opacity: .9 }} />}

          {/* Cabeçalho do pet: nome + tipo/fase + status */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 900, color: INK, fontSize: 20, lineHeight: 1 }}>{nome}</p>
              <p style={{ fontSize: 12, color: NAVY, fontWeight: 700, marginTop: 3 }}>{cfg.tipo}</p>
            </div>
            {chocou && (
              <span style={{
                fontSize: 12, fontWeight: 800, padding: "5px 12px", borderRadius: 999,
                background: statusPositive ? POS_BG : "#FFFFFF",
                color: statusPositive ? POS_TX : NAVY,
                border: `1px solid ${statusPositive ? "transparent" : BORDER}`,
              }}>{status}</span>
            )}
          </div>

          {/* PALCO INTERNO BRANCO (personagem sempre sobre branco) */}
          <div style={{
            position: "relative", background: "#FFFFFF", borderRadius: 22, height: 300,
            border: `1px solid ${BORDER}`, boxShadow: "inset 0 2px 14px rgba(20,33,61,.05)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden",
          }}>
            {/* brilho do ovo quase chocando (discreto, dentro do palco branco) */}
            {quaseChocando && (
              <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)", width: 190, height: 190, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}33, transparent 70%)` }} />
            )}
            {/* sombra de contato */}
            <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", width: 160, height: 16, background: "rgba(20,33,61,.10)", borderRadius: "50%", filter: "blur(4px)" }} />
            <div style={{ position: "relative", marginBottom: 14 }}>
              {chocou ? (
                <LivePet kind={kind} stage={2} size={220} color={pet.color} action={liveAction} />
              ) : (
                <PetCreature kind={kind} stage={0} size={210} color={pet.color} />
              )}
            </div>
            {/* badge discreto de treinos de hoje */}
            {chocou && sessionsToday > 0 && (
              <span style={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: POS_TX, background: POS_BG, borderRadius: 999, padding: "4px 10px" }}>
                Treinos hoje: {sessionsToday}
              </span>
            )}
            {quaseChocando && (
              <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 800, color: "#8A6410", background: "#FBF3DC", borderRadius: 999, padding: "4px 10px", border: `1px solid ${GOLD}55` }}>
                Quase chocando
              </span>
            )}
          </div>
        </div>

        {/* ── PAINEL INFERIOR (mensagem + botões) ──────────────────────── */}
        <div style={{ background: "#fff", padding: "14px 14px 18px" }}>
          {/* Mensagem contextual */}
          <p style={{ textAlign: "center", fontWeight: 800, color: INK, fontSize: 15, margin: "2px 0 2px" }}>{mensagem}</p>
          {justHatched && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: SUB, marginBottom: 4 }}>Seu bichinho está pronto para crescer e evoluir com você.</p>
          )}

          {/* Botão principal dinâmico */}
          <div style={{ marginTop: 12 }}>
            {!chocou ? (
              <Link href="/inicio" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 16, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                {quaseChocando ? `Ajudar ${nome} a nascer` : "Fazer um treino"} <ArrowRight size={18} />
              </Link>
            ) : sleeping ? (
              <button onClick={wake} disabled={busy} className="w-full h-12 rounded-2xl text-white font-extrabold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60" style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})` }}>
                <Sun size={18} /> Acordar {nome}
              </button>
            ) : sessionsToday > 0 ? (
              // Descansar só é liberado depois de treinar hoje.
              <button onClick={rest} disabled={busy} className="w-full h-12 rounded-2xl text-white font-extrabold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60" style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})` }}>
                <Moon size={18} /> Colocar para descansar
              </button>
            ) : (
              // Ainda não treinou hoje → incentiva o treino.
              <Link href="/inicio" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 16, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                Fazer um treino <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {/* Ações rápidas + Mais ações (só quando nasceu e acordado) */}
          {chocou && !sleeping && (
            <>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {cfg.quick.map((id) => {
                  const { label, Icon } = ACTIONS[id];
                  return (
                    <button key={id} onClick={() => play(id)} disabled={busy}
                      className="flex flex-col items-center gap-1 rounded-2xl border py-2.5 cursor-pointer transition active:scale-95 bg-[#EEF6FF] hover:bg-[#DCEBFF] border-[#E2E8F0] disabled:cursor-default"
                      style={{ flex: 1, opacity: busy && acting !== id ? 0.5 : 1 }}>
                      <Icon size={20} color={BLUE} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: NAVY }}>{label}</span>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setShowMore((v) => !v)} className="w-full flex items-center justify-center gap-1.5 rounded-[14px] border py-2.5 cursor-pointer transition bg-[#F6F8FC] hover:bg-[#EEF6FF] border-[#E2E8F0]" style={{ marginTop: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: NAVY }}>Mais ações</span>
                <ChevronDown size={16} color={NAVY} style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>

              {showMore && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
                  {cfg.mais.map((id) => {
                    const { label, Icon } = ACTIONS[id];
                    return (
                      <button key={id} onClick={() => play(id)} disabled={busy}
                        className="flex flex-col items-center gap-1 rounded-2xl border py-2.5 cursor-pointer transition active:scale-95 bg-[#EEF6FF] hover:bg-[#DCEBFF] border-[#E2E8F0] disabled:cursor-default" style={{ opacity: busy && acting !== id ? 0.5 : 1 }}>
                        <Icon size={19} color={BLUE} />
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: NAVY, textAlign: "center", lineHeight: 1.1 }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
