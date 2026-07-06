"use client";

// Página de PRÉVIA do bichinho (Kids) — mostra EXATAMENTE a construção que o
// paciente vê no app, em ordem de jornada:
//   1. Crescimento: OVO → NASCE → ADULTO
//   2. Ele ganha vida (anima sozinho) + ações que a criança pode tocar
//   3. Cenas de movimento (animação quadro-a-quadro)
//   4. O ciclo do dia: fim do treino → DESCANSAR; volta ao treino → ACORDAR
//   5. Como aparece no Início (componente real)
//   6. Todas as poses
// Acesse em /preview/bichinho. Livre (sem login).

import { useEffect, useState } from "react";
import { PetCreature } from "@/components/patient/PetCreature";
import { LivePet } from "@/components/patient/LivePet";
import { PetCompanion } from "@/components/patient/PetCompanion";
import { STAGE_LABELS, DEFAULT_COLOR, colorsFor, paletteById, type PetKind, type PetColorId } from "@/lib/pet";

const ALL_POSES: { id: string; label: string }[] = [
  { id: "idle", label: "Parado (adulto)" }, { id: "piscar", label: "Piscando" }, { id: "sonolento", label: "Sonolento" },
  { id: "feliz", label: "Feliz" }, { id: "rindo", label: "Rindo" }, { id: "gargalhando", label: "Gargalhando" },
  { id: "bocejando", label: "Bocejando" }, { id: "espreguicando", label: "Espreguiçando" },
  { id: "pensando", label: "Pensando" }, { id: "pensando2", label: "Pensando 2" }, { id: "comfome", label: "Com fome" },
  { id: "fumaca", label: "Fumacinha" }, { id: "bufando", label: "Bufando" }, { id: "acenando", label: "Acenando" },
  { id: "coracao", label: "Coração" }, { id: "meditando", label: "Meditando" }, { id: "correndo", label: "Correndo" },
  { id: "pulando", label: "Pulando" }, { id: "asas1", label: "Voando" }, { id: "planar1", label: "Planando" },
  { id: "fogo2", label: "Soltando fogo" }, { id: "comer1", label: "Comendo" }, { id: "dancar1", label: "Dançando" },
  { id: "brincar", label: "Brincando" }, { id: "delicia", label: "Delícia" }, { id: "travesseiro", label: "Travesseiro" },
  { id: "dormir", label: "Dormindo" }, { id: "nascendo", label: "Saindo do ovo" },
];
const MONSTER_POSES: { id: string; label: string }[] = [
  { id: "idle", label: "Parado" }, { id: "feliz", label: "Feliz" }, { id: "bocejando", label: "Bocejando" },
  { id: "fumaca", label: "Bolha" }, { id: "coracao", label: "Coração" }, { id: "dormir", label: "Dormindo" },
  { id: "nascendo", label: "Saindo do ovo" }, { id: "comer1", label: "Comendo" },
  { id: "piscar1", label: "Piscar" }, { id: "pular2", label: "Pulando" },
];

// Flipbook: alterna imagens rapidinho (mesma técnica do app) pra mostrar o
// movimento quadro-a-quadro isolado.
function Flip({ srcs, ms, size }: { srcs: string[]; ms: number[]; size: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    let k = 0, alive = true;
    let t: ReturnType<typeof setTimeout>;
    const step = () => { if (!alive) return; k = (k + 1) % srcs.length; setI(k); t = setTimeout(step, ms[k]); };
    t = setTimeout(step, ms[0]);
    return () => { alive = false; clearTimeout(t); };
  }, [srcs, ms]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={srcs[i]} alt="" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />;
}

export default function PreviewBichinho() {
  const [kind, setKind] = useState<PetKind>("dragao");
  const [color, setColor] = useState<PetColorId>("verde");
  const [demo, setDemo] = useState<null | "comer" | "fogo" | "voar" | "piscar" | "dancar" | "show">(null);
  // Ciclo do dia: acordado → descansar (dorme) → acordar (volta) → acordado…
  const [day, setDay] = useState<"acordado" | "descansar" | "dormindo" | "acordar">("acordado");

  function play(a: "comer" | "fogo" | "voar" | "piscar" | "dancar" | "show") {
    setDemo(a);
    window.setTimeout(() => setDemo(null), a === "show" ? 3800 : 1900);
  }
  function descansar() {
    setDay("descansar");
    window.setTimeout(() => setDay("dormindo"), 3400); // após espreguiçar+sonolento, fica dormindo
  }
  function acordar() {
    setDay("acordar");
    window.setTimeout(() => setDay("acordado"), 4400); // travesseiro→boceja→pensando, volta ao normal
  }

  const scene = "radial-gradient(circle at 50% 45%, #ffffff, #eef3fb 78%)";
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 18, padding: 10, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, boxShadow: "0 6px 18px rgba(30,60,120,.1)",
  };
  const h2: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "#334155", margin: "26px 0 12px" };
  const cap: React.CSSProperties = { fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 6 };
  const isDragon = kind === "dragao";
  const poses = isDragon ? ALL_POSES : MONSTER_POSES;

  // ação do ciclo do dia passada ao LivePet
  const dayAction: "descansar" | "acordar" | "dormir" | null =
    day === "descansar" ? "descansar" : day === "dormindo" ? "dormir" : day === "acordar" ? "acordar" : null;
  const dayLabel = {
    acordado: "🌞 Acordado — brincando e treinando", descansar: "🥱 Ficando com sono…",
    dormindo: "😴 Dormindo até o próximo treino", acordar: "🌅 Acordou! Já quer um comando…",
  }[day];

  return (
    <div style={{ minHeight: "100vh", padding: "22px 16px 48px", fontFamily: "Inter, system-ui, sans-serif", background: "linear-gradient(160deg,#e0f2fe,#fce7f3)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f766e", marginBottom: 4 }}>Prévia do Bichinho 🐉</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 18 }}>A jornada completa, na ordem que o paciente vê: nasce, ganha vida, e todo dia descansa e acorda.</p>

        {/* Controles */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Bichinho</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
                <button key={k} onClick={() => { setKind(k); setColor(DEFAULT_COLOR[k]); setDay("acordado"); }}
                  style={{ padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, cursor: "pointer",
                    border: kind === k ? "2px solid #14b8a6" : "2px solid #e2e8f0", background: kind === k ? "#ccfbf1" : "#fff", color: "#0f766e" }}>
                  {k === "dragao" ? "🐲 Dragão" : "👾 Monstrinho"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Cor</div>
            <div style={{ display: "flex", gap: 10 }}>
              {colorsFor(kind).map(paletteById).map((c) => (
                <button key={c.id} onClick={() => setColor(c.id)} aria-label={c.label}
                  style={{ width: 32, height: 32, borderRadius: "50%", cursor: "pointer", background: c.body,
                    border: color === c.id ? "3px solid #0f766e" : "3px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,.15)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* 1. CRESCIMENTO */}
        <h2 style={h2}>1. Crescimento — do ovo ao adulto 🥚→🐣→🐲</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { pose: "ovo", stage: 0, t: "🥚 Ovo", s: "antes do 1º treino" },
            { pose: "nascendo", stage: 2, t: "🐣 Nasce", s: "no 1º treino" },
            { pose: "idle", stage: 2, t: "🐲 Adulto", s: "cresceu — tamanho fixo" },
          ].map((it, i) => (
            <div key={it.pose} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ ...card, width: 150 }}>
                <div style={{ background: scene, borderRadius: 14 }}>
                  <PetCreature kind={kind} stage={it.stage} color={color} pose={it.pose} size={132} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0f766e" }}>{it.t}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{it.s}</span>
              </div>
              {i < 2 && <span style={{ fontSize: 26, color: "#94a3b8", fontWeight: 900 }}>→</span>}
            </div>
          ))}
        </div>

        {/* 2. VIVO + AÇÕES */}
        <h2 style={h2}>2. Ganha vida — anima sozinho e faz o que a criança pedir 🎬</h2>
        <div style={{ maxWidth: 360, margin: "0 auto", borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 36px rgba(30,60,120,.16)", border: "3px solid #fff" }}>
          <div style={{ position: "relative", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)" }}>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              <LivePet kind={kind} stage={2} color={color} size={210} action={demo} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, background: "#fff", flexWrap: "wrap" }}>
            {(isDragon
              ? [["comer", "🍎", "Comer"], ["fogo", "🔥", "Fogo"], ["voar", "🦋", "Voar"], ["piscar", "😉", "Piscar"], ["dancar", "💃", "Dançar"], ["show", "✨", "Show"]] as const
              : [["comer", "🍎", "Comer"], ["piscar", "😉", "Piscar"], ["show", "✨", "Pular"]] as const
            ).map(([a, e, l]) => (
              <button key={a} onClick={() => play(a)} disabled={!!demo}
                style={{ flex: "1 0 30%", border: "2px solid #a5f3fc", background: "#ecfeff", borderRadius: 14, padding: "8px 4px",
                  cursor: demo ? "default" : "pointer", opacity: demo ? 0.6 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 20 }}>{e}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0f766e" }}>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <p style={cap}>De vez em quando ele <b>pisca</b> e muda de pose sozinho. 👆 Toque nos botões pra ele obedecer.</p>

        {/* 3. QUADRO-A-QUADRO */}
        {isDragon && (
          <>
            <h2 style={h2}>3. Cenas de movimento (animação quadro-a-quadro) 🎞️</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {[
                { l: "💃 Dançando", srcs: ["dancar1", "dancar2"], ms: [360, 360] },
                { l: "🍎 Comendo", srcs: ["comer1", "comer2", "comer3"], ms: [420, 420, 420] },
                { l: "👀 Piscando", srcs: ["piscar1", "piscar2"], ms: [1800, 150] },
                { l: "🔥 Soltando fogo", srcs: ["fogo1", "fogo2", "fogo3"], ms: [300, 900, 300] },
                { l: "🦋 Batendo asas", srcs: ["asas1", "asas2", "asas3"], ms: [190, 190, 190] },
              ].map((it) => (
                <div key={it.l} style={card}>
                  <div style={{ background: scene, borderRadius: 16, padding: 4 }}>
                    <Flip size={132} ms={it.ms} srcs={it.srcs.map((p) => `/petimg/dragao-${color}-${p}.png`)} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#0f766e" }}>{it.l}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 4. CICLO DO DIA */}
        <h2 style={h2}>4. O ciclo do dia — descansar no fim, acordar na volta 🌙→🌅</h2>
        <div style={{ maxWidth: 360, margin: "0 auto", borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 36px rgba(30,60,120,.16)", border: "3px solid #fff" }}>
          <div style={{ position: "relative", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center",
            background: day === "dormindo" || day === "descansar"
              ? "linear-gradient(180deg,#c7d2fe 0%,#e0e7ff 62%)"
              : "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)", transition: "background .8s" }}>
            <div style={{ position: "absolute", top: 12, left: 14, background: "#fff", borderRadius: 12, padding: "6px 12px", boxShadow: "0 4px 14px rgba(30,60,120,.1)" }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#334155" }}>{dayLabel}</span>
            </div>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              <LivePet kind={kind} stage={2} color={color} size={210} action={dayAction} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, background: "#fff" }}>
            <button onClick={descansar} disabled={day !== "acordado"}
              style={{ flex: 1, border: "2px solid #ddd6fe", background: "#f5f3ff", borderRadius: 14, padding: "10px 4px",
                cursor: day === "acordado" ? "pointer" : "default", opacity: day === "acordado" ? 1 : 0.5,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 20 }}>😴</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#6d28d9" }}>Colocar para descansar</span>
            </button>
            <button onClick={acordar} disabled={day !== "dormindo"}
              style={{ flex: 1, border: "2px solid #fde68a", background: "#fffbeb", borderRadius: 14, padding: "10px 4px",
                cursor: day === "dormindo" ? "pointer" : "default", opacity: day === "dormindo" ? 1 : 0.5,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 20 }}>🌅</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#b45309" }}>Voltar ao treino (acordar)</span>
            </button>
          </div>
        </div>
        <p style={cap}><b>Descansar:</b> ele se espreguiça → fica com sono → dorme. <b>Acordar:</b> abraça o travesseiro → boceja → fica pensando num comando.</p>

        {/* 5. COMPONENTE REAL */}
        <h2 style={h2}>5. Como aparece no Início (componente real)</h2>
        <div style={{ maxWidth: 340, margin: "0 auto" }}>
          <PetCompanion patientId="preview-demo" theme="COLORFUL" />
        </div>

        {/* 6. TODAS AS POSES */}
        <h2 style={h2}>6. Todas as poses ({poses.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {poses.map((pz) => (
            <div key={pz.id} style={card}>
              <div style={{ background: scene, borderRadius: 14 }}>
                <PetCreature kind={kind} stage={2} color={color} mood={pz.id === "dormir" ? "sleep" : "idle"} pose={pz.id} size={116} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>{pz.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
