"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Apple, Gamepad2, Eye, Heart, Flame, Feather, Music2, Wind, ArrowUp,
  Moon, Sun, Egg, ArrowRight, ChevronDown, Star, Smile, Lightbulb, type LucideIcon,
} from "lucide-react";
import {
  loadPet, petDisplayName, putPetToSleep, clearPetSleep, isPetSleeping, HATCH_TARGET,
  petStage, STAGE_LABELS, type PetKind, type PetState,
} from "@/lib/pet";
import { reconcilePet } from "@/lib/gamification";
import { PetCreature } from "./PetCreature";
import { LivePet } from "./LivePet";

// ── Paleta infantil premium (azul/marinho/dourado, neutra) ───────────────────
const INK = "#14213D", SUB = "#667085", NAVY = "#173B78", BLUE = "#1D4ED8";
const BORDER = "#E2E8F0", GOLD = "#E8B547", POS_BG = "#DDF7EF", POS_TX = "#047857";
const LAV = "#F3F0FF", SKY_A = "#EAF3FF", SKY_B = "#DCEBFF";

type ActionId =
  | "comer" | "brincar" | "piscar" | "carinho"
  | "fogo" | "voar" | "dancar" | "baterasas"
  | "pular" | "fazerCoracao";
const ACTIONS: Record<ActionId, { label: string; Icon: LucideIcon; live: string; tint: string }> = {
  comer:       { label: "Comer",         Icon: Apple,   live: "comer",   tint: "#F59E0B" },
  brincar:     { label: "Brincar",       Icon: Gamepad2, live: "brincar", tint: "#1D4ED8" },
  piscar:      { label: "Piscar",        Icon: Eye,     live: "piscar",  tint: "#0EA5E9" },
  carinho:     { label: "Carinho",       Icon: Heart,   live: "carinho", tint: "#F43F5E" },
  fogo:        { label: "Soltar fogo",   Icon: Flame,   live: "fogo",    tint: "#F97316" },
  voar:        { label: "Voar",          Icon: Feather, live: "voar",    tint: "#0EA5E9" },
  dancar:      { label: "Dançar",        Icon: Music2,  live: "dancar",  tint: "#8B5CF6" },
  baterasas:   { label: "Bater asas",    Icon: Wind,    live: "baterasas", tint: "#0EA5E9" },
  pular:       { label: "Pular",         Icon: ArrowUp, live: "pular",   tint: "#1D4ED8" },
  fazerCoracao:{ label: "Fazer coração", Icon: Heart,   live: "carinho", tint: "#F43F5E" },
};

interface PetConfig { tipo: string; quick: ActionId[]; mais: ActionId[]; textos: Record<string, string>; }
const PETS: Record<PetKind, PetConfig> = {
  dragao: {
    tipo: "Dragão bebê",
    quick: ["comer", "brincar", "piscar", "carinho"],
    mais: ["fogo", "voar", "dancar", "baterasas"],
    textos: {
      idle: "{n} está animado para treinar.", dormindo: "{n} está descansando.",
      comer: "{n} adorou o lanche!", brincar: "{n} quer brincar um pouco.",
      piscar: "{n} te deu uma piscadinha.", carinho: "{n} gostou do carinho.",
      fogo: "{n} soltou uma chama!", voar: "{n} está voando!",
      dancar: "{n} está dançando!", baterasas: "{n} abriu as asas!",
    },
  },
  monstrinho: {
    tipo: "Bichinho fofo",
    quick: ["comer", "brincar", "piscar", "carinho"],
    // "dançar" e "acenar" saíram: o monstrinho não tem arte própria (dançar caía
    // no mesmo desenho do pular) — decisão da Kamylla (13/jul).
    mais: ["pular", "fazerCoracao"],
    textos: {
      idle: "{n} está feliz em te ver.", dormindo: "{n} está descansando.",
      comer: "{n} adorou o lanche!", brincar: "{n} quer brincar.",
      piscar: "{n} te deu uma piscadinha.", carinho: "{n} gostou do carinho.",
      pular: "{n} pulou de alegria!", fazerCoracao: "{n} mandou um coração.",
    },
  },
};

const TIPS = [
  "Treinar todo dia deixa o {n} mais forte!",
  "Pequenas conquistas todo dia deixam o {n} muito feliz!",
  "Cuidar do {n} é tão bom quanto brincar com ele!",
];

// Enfeites do céu (fora do palco branco).
function Cloud({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: "absolute", background: "rgba(255,255,255,0.8)", borderRadius: 999, filter: "blur(1px)", ...style }} />;
}
function Twinkle({ style, size = 12, color = GOLD }: { style: React.CSSProperties; size?: number; color?: string }) {
  return <Star size={size} color={color} fill={color} style={{ position: "absolute", opacity: 0.85, ...style }} />;
}

export function PetHabitat({ patientId, sessionsToday, lastSessionId, lastScore, lastAtMs }: {
  patientId: string; playerName?: string; sessionsToday: number;
  lastSessionId?: string; lastScore?: number; lastAtMs?: number;
}) {
  const [pet, setPet] = useState<PetState | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const [acting, setActing] = useState<ActionId | null>(null);
  const [needFood, setNeedFood] = useState(false);   // necessidade após concluir exercício
  const [transition, setTransition] = useState<"descansar" | "acordar" | null>(null);
  const [showMore, setShowMore] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setPet(loadPet(patientId)); setSleeping(isPetSleeping(patientId));
    reconcilePet(patientId, setPet).catch(() => {}); // restaura do servidor (ARQ-002)

    // NECESSIDADE (decisão da Kamylla): o estado só muda quando o paciente CONCLUI
    // um exercício — aí o bichinho pode ficar com fome. Detecta treino novo
    // comparando com a última contagem vista (por dia).
    try {
      const seenKey = `np_pet_seen_${patientId}`;
      const needKey = `np_pet_need_${patientId}`;
      const today = new Date().toLocaleDateString("sv");
      const seenRaw = localStorage.getItem(seenKey);
      const seen = seenRaw ? (JSON.parse(seenRaw) as { date: string; count: number }) : null;
      const seenCount = seen && seen.date === today ? seen.count : 0;
      if (sessionsToday > seenCount) {
        localStorage.setItem(needKey, "1");           // treinou → surge a necessidade
        localStorage.setItem(seenKey, JSON.stringify({ date: today, count: sessionsToday }));
      }
      setNeedFood(localStorage.getItem(needKey) === "1");
    } catch { /* ignore */ }

    // REAÇÃO breve (não é comando): piscadinha alguns segundos após ÓTIMO
    // desempenho no último exercício (score >= 85, nos últimos 15 min, 1x por sessão).
    try {
      const gleeKey = `np_pet_glee_${patientId}`;
      if (
        lastSessionId && (lastScore ?? 0) >= 85 && lastAtMs &&
        Date.now() - lastAtMs < 15 * 60 * 1000 &&
        localStorage.getItem(gleeKey) !== lastSessionId &&
        !isPetSleeping(patientId)
      ) {
        localStorage.setItem(gleeKey, lastSessionId);
        timers.current.push(setTimeout(() => {
          setActing("piscar");
          timers.current.push(setTimeout(() => setActing(null), 2600));
        }, 900));
      }
    } catch { /* ignore */ }
  }, [patientId, sessionsToday, lastSessionId, lastScore, lastAtMs]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  if (!pet) return null;

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

  const feitos = pet.care;
  const faltam = Math.max(HATCH_TARGET - feitos, 0);
  const chocou = feitos >= HATCH_TARGET;
  const quaseChocando = !chocou && faltam === 1;
  const justHatched = chocou && feitos === HATCH_TARGET;
  const fase = STAGE_LABELS[petStage(feitos)];
  const trainedToday = sessionsToday > 0;
  const busy = !!acting || !!transition;

  const liveAction = transition ? transition
    : sleeping ? "dormir"
    : acting ? (ACTIONS[acting].live as "comer")
    : null;

  function play(id: ActionId) {
    if (sleeping || busy) return;
    setActing(id);
    // Alimentar atende a necessidade (fome) — o estado volta ao normal.
    if (id === "comer" && needFood) {
      try { localStorage.removeItem(`np_pet_need_${patientId}`); } catch { /* */ }
      timers.current.push(setTimeout(() => setNeedFood(false), 2000));
    }
    timers.current.push(setTimeout(() => setActing(null), 2200));
  }
  function rest() {
    if (busy) return;
    setShowMore(false); setTransition("descansar");
    timers.current.push(setTimeout(() => { putPetToSleep(patientId, pet!.care); setSleeping(true); setTransition(null); }, 3400));
  }
  function wake() {
    if (busy) return;
    setTransition("acordar");
    timers.current.push(setTimeout(() => { clearPetSleep(patientId); setSleeping(false); setTransition(null); }, 3000));
  }

  const status =
    !chocou ? (quaseChocando ? "Quase chocando" : "Incubando")
    : transition === "descansar" ? "Com sono"
    : transition === "acordar" ? "Acordando"
    : sleeping ? "Descansando"
    : acting ? "Animado"
    : needFood ? "Com fome"
    : trainedToday ? "Feliz"
    : "Pronto para brincar";
  const moodSleepy = sleeping || transition === "descansar" || status === "Com sono";

  const faltamTxt = faltam === 1 ? `Falta 1 treino para ${nome} nascer!` : `Faltam ${faltam} treinos para ${nome} nascer`;
  const mensagem =
    transition === "descansar" ? `${nome} está ficando com sono...`
    : transition === "acordar" ? `Bom dia! ${nome} está acordando.`
    : sleeping ? t("dormindo")
    : justHatched ? `${nome} nasceu!`
    : acting ? t(acting)
    : needFood ? `${nome} está com fome! Que tal dar um lanche?`
    : t("idle");

  const scene = `linear-gradient(180deg, ${SKY_A} 0%, ${SKY_B} 100%)`;
  const sceneNight = "linear-gradient(180deg,#C7D2FE 0%,#E4E9FF 100%)";
  const night = sleeping || transition === "descansar";
  const tip = TIPS[feitos % TIPS.length].replace("{n}", nome);

  return (
    <div style={{ padding: 14, minHeight: "calc(100vh - 130px)" }}>
      <div style={{ maxWidth: 470, margin: "0 auto", borderRadius: 30, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 18px 46px rgba(20,33,61,.12)" }}>

        {/* ── CENA EXTERNA DECORADA ─────────────────────────────────── */}
        <div style={{ position: "relative", background: night ? sceneNight : scene, transition: "background .8s", padding: "16px 16px 20px" }}>
          {/* enfeites (fora do palco) */}
          <Cloud style={{ top: 54, left: -14, width: 76, height: 24 }} />
          <Cloud style={{ top: 92, right: -8, width: 58, height: 20 }} />
          <Twinkle style={{ top: 14, right: 20 }} size={15} color={night ? "#fff" : GOLD} />
          <Twinkle style={{ top: 44, right: 56 }} size={10} color={night ? "#fff" : "#FBBF24"} />
          <Twinkle style={{ top: 120, left: 16 }} size={11} color={night ? "#C7D2FE" : "#93C5FD"} />

          {/* Cabeçalho: nome + tipo + fase + humor */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontWeight: 900, color: INK, fontSize: 22, lineHeight: 1 }}>{nome}</p>
              {chocou && (
                <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", background: "#EDE9FE", borderRadius: 999, padding: "3px 9px" }}>{fase}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <p style={{ fontSize: 12.5, color: NAVY, fontWeight: 700 }}>{cfg.tipo}</p>
              {chocou && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800, padding: "4px 11px", borderRadius: 999,
                  background: moodSleepy ? "#E7E9F5" : POS_BG, color: moodSleepy ? NAVY : POS_TX }}>
                  {moodSleepy ? <Moon size={12} /> : <Smile size={13} />} {status}
                </span>
              )}
            </div>
          </div>

          {/* PALCO INTERNO BRANCO */}
          <div style={{ position: "relative", background: "#FFFFFF", borderRadius: 24, height: 306,
            border: `1px solid ${BORDER}`, boxShadow: "0 8px 22px rgba(20,33,61,.08)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
            {/* estrelinhas discretas dentro do palco branco */}
            <Twinkle style={{ top: 20, left: 22 }} size={13} color="#FBBF24" />
            <Twinkle style={{ top: 40, right: 26 }} size={10} color="#93C5FD" />
            <Twinkle style={{ bottom: 96, left: 30 }} size={9} color="#C4B5FD" />
            {/* glow do ovo quase chocando */}
            {quaseChocando && (
              <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 210, height: 210, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}3a, transparent 68%)` }} />
            )}
            {/* pedestal + sombra */}
            <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", width: 196, height: 34, borderRadius: "50%", background: `linear-gradient(180deg, ${LAV}, #E7E9F5)`, boxShadow: "0 8px 16px rgba(20,33,61,.10)" }} />
            <div style={{ position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", width: 150, height: 12, background: "rgba(20,33,61,.10)", borderRadius: "50%", filter: "blur(4px)" }} />
            <div style={{ position: "relative", marginBottom: 20 }}>
              {chocou
                ? <LivePet kind={kind} stage={2} size={224} color={pet.color} action={liveAction}
                    roam={false}
                    staticPose={needFood ? (kind === "dragao" ? "comfome" : "bocejando") : "feliz"} />
                : <PetCreature kind={kind} stage={0} size={210} color={pet.color} />}
            </div>
            {/* badges discretos */}
            {chocou && trainedToday && (
              <span style={{ position: "absolute", top: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: POS_TX, background: POS_BG, borderRadius: 999, padding: "4px 10px" }}>Treinos hoje: {sessionsToday}</span>
            )}
            {quaseChocando && (
              <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 800, color: "#8A6410", background: "#FBF3DC", borderRadius: 999, padding: "4px 10px", border: `1px solid ${GOLD}55` }}>Quase chocando</span>
            )}
          </div>
        </div>

        {/* ── PAINEL ─────────────────────────────────────────────────── */}
        <div style={{ background: "#fff", padding: "14px 14px 18px" }}>

          {/* Humor + mensagem contextual (card) */}
          {chocou && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: LAV, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "10px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 12, background: moodSleepy ? "#E0E7FF" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {moodSleepy ? <Moon size={18} color={NAVY} /> : <Smile size={19} color="#16A34A" />}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 800, color: INK, fontSize: 14 }}>{status}</p>
                <p style={{ fontSize: 12.5, color: SUB, marginTop: 1 }}>{mensagem}</p>
              </div>
            </div>
          )}

          {/* Progresso para nascer (só na fase de ovo) */}
          {!chocou && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FBF7EE", border: `1px solid ${GOLD}44`, borderRadius: 16, padding: "12px" }}>
              <PetCreature kind={kind} stage={0} size={54} color={pet.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, color: INK, fontSize: 13.5 }}>{quaseChocando ? "Seu ovo está quase chocando!" : "Progresso para nascer"}</p>
                <div style={{ height: 8, borderRadius: 999, background: "#EEF2F7", marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, width: `${Math.round((feitos / HATCH_TARGET) * 100)}%`, background: `linear-gradient(90deg,${GOLD},#F59E0B)` }} />
                </div>
                <p style={{ fontSize: 12, color: SUB, fontWeight: 700, marginTop: 5 }}>{feitos} / {HATCH_TARGET} treinos · {faltamTxt}</p>
              </div>
            </div>
          )}

          {/* completou treinos de hoje */}
          {chocou && !sleeping && !busy && trainedToday && !justHatched && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: POS_TX, fontWeight: 700, marginTop: 12 }}>Você concluiu os treinos de hoje! Que tal colocar o {nome} para descansar?</p>
          )}
          {justHatched && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: SUB, marginTop: 10 }}>Seu bichinho está pronto para crescer e evoluir com você.</p>
          )}

          {/* Botão principal dinâmico */}
          <div style={{ marginTop: 12 }}>
            {!chocou ? (
              <Link href="/inicio" className="np-main">{quaseChocando ? `Ajudar ${nome} a nascer` : "Fazer um treino"} <ArrowRight size={18} /></Link>
            ) : sleeping ? (
              <button onClick={wake} disabled={busy} className="np-main np-btn"><Sun size={18} /> Acordar {nome}</button>
            ) : trainedToday ? (
              <button onClick={rest} disabled={busy} className="np-main np-btn"><Moon size={18} /> Colocar para descansar</button>
            ) : (
              <Link href="/inicio" className="np-main">Fazer um treino <ArrowRight size={18} /></Link>
            )}
          </div>

          {/* Ações rápidas + Mais ações */}
          {chocou && !sleeping && (
            <>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {cfg.quick.map((id) => <ActionBtn key={id} id={id} onClick={() => play(id)} disabled={busy} dim={busy && acting !== id} />)}
              </div>

              <button onClick={() => setShowMore((v) => !v)} className="np-more">
                Mais ações
                <ChevronDown size={16} color={NAVY} style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {showMore && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
                  {cfg.mais.map((id) => <ActionBtn key={id} id={id} onClick={() => play(id)} disabled={busy} dim={busy && acting !== id} small />)}
                </div>
              )}

              {/* Ciclo do dia + Dica do dia */}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <div style={{ flex: 1, background: "#EEF6FF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Moon size={14} color={NAVY} /><span style={{ fontSize: 12.5, fontWeight: 800, color: NAVY }}>Ciclo do dia</span></div>
                  <p style={{ fontSize: 11.5, color: SUB, marginTop: 4, lineHeight: 1.3 }}>Depois dos treinos, {nome} descansa e acorda no próximo dia.</p>
                </div>
                <div style={{ flex: 1, background: "#FBF7EE", border: `1px solid ${GOLD}44`, borderRadius: 14, padding: "10px 11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} color="#B45309" /><span style={{ fontSize: 12.5, fontWeight: 800, color: "#8A6410" }}>Dica do dia</span></div>
                  <p style={{ fontSize: 11.5, color: SUB, marginTop: 4, lineHeight: 1.3 }}>{tip}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .np-main { width: 100%; height: 50px; border-radius: 16px; color: #fff; font-weight: 800; font-size: 15px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; background: linear-gradient(135deg, ${NAVY}, ${BLUE}); transition: filter .15s, transform .1s; }
        .np-main:hover { filter: brightness(1.07); }
        .np-main:active { transform: scale(.985); }
        .np-btn:disabled { opacity: .6; cursor: default; }
        .np-more { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px; background: #F6F8FC; border: 1px solid ${BORDER}; border-radius: 14px; padding: 10px; font-size: 12.5px; font-weight: 800; color: ${NAVY}; cursor: pointer; transition: background .15s; }
        .np-more:hover { background: #EEF6FF; }
        .np-act { display: flex; flex-direction: column; align-items: center; gap: 5px; background: #fff; border: 1px solid ${BORDER}; border-radius: 16px; padding: 9px 2px 8px; cursor: pointer; transition: background .15s, transform .1s, border-color .15s; }
        .np-act:hover { background: #F6F8FC; border-color: #CBD5E1; }
        .np-act:active { transform: scale(.95); }
        .np-act:disabled { cursor: default; }
      `}</style>
    </div>
  );
}

// Botão de ação: ícone em círculo colorido + label.
function ActionBtn({ id, onClick, disabled, dim, small }: { id: ActionId; onClick: () => void; disabled?: boolean; dim?: boolean; small?: boolean }) {
  const { label, Icon, tint } = ACTIONS[id];
  const box = small ? 34 : 40, ic = small ? 18 : 20;
  return (
    <button onClick={onClick} disabled={disabled} className="np-act" style={{ flex: 1, opacity: dim ? 0.5 : 1 }}>
      <span style={{ width: box, height: box, borderRadius: 13, background: `${tint}1a`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={ic} color={tint} />
      </span>
      <span style={{ fontSize: small ? 10.5 : 11.5, fontWeight: 800, color: NAVY, textAlign: "center", lineHeight: 1.1 }}>{label}</span>
    </button>
  );
}
