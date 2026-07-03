"use client";

// Página de PRÉVIA do bichinho (Kids). Mostra tudo que foi feito: o dragão
// vivo (anima sozinho), as animações quadro-a-quadro (piscar / bater asas),
// as ações, as duas cores (verde/vinho), todas as poses e as fases.
// Acesse em /preview/bichinho. Livre (sem login).

import { useEffect, useState } from "react";
import { PetCreature } from "@/components/patient/PetCreature";
import { LivePet } from "@/components/patient/LivePet";
import { PetCompanion } from "@/components/patient/PetCompanion";
import { STAGE_LABELS, DEFAULT_COLOR, colorsFor, paletteById, type PetKind, type PetColorId } from "@/lib/pet";

const ALL_POSES: { id: string; label: string }[] = [
  { id: "idle", label: "Parado" }, { id: "piscar", label: "Piscando" }, { id: "sonolento", label: "Sonolento" },
  { id: "feliz", label: "Feliz" }, { id: "rindo", label: "Rindo" }, { id: "bocejando", label: "Bocejando" },
  { id: "pensando", label: "Pensando" }, { id: "pensando2", label: "Pensando 2" }, { id: "fumaca", label: "Fumacinha" },
  { id: "bufando", label: "Bufando" }, { id: "acenando", label: "Acenando" }, { id: "coracao", label: "Coração" },
  { id: "espreguicando", label: "Espreguiçando" }, { id: "meditando", label: "Meditando" }, { id: "correndo", label: "Correndo" },
  { id: "pulando", label: "Pulando" }, { id: "asas1", label: "Voando" }, { id: "planando", label: "Planando" },
  { id: "fogo2", label: "Soltando fogo" }, { id: "comer1", label: "Comendo" }, { id: "dancar1", label: "Dançando" },
  { id: "brincar", label: "Brincando" }, { id: "comfome", label: "Com fome" }, { id: "delicia", label: "Delícia" },
  { id: "dormir", label: "Dormindo" }, { id: "travesseiro", label: "Travesseiro" }, { id: "nascendo", label: "Saindo do ovo" },
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
  const [demo, setDemo] = useState<null | "comer" | "brincar" | "dormir" | "cocegas" | "show">(null);
  function play(a: "comer" | "brincar" | "dormir" | "cocegas" | "show") {
    setDemo(a);
    window.setTimeout(() => setDemo(null), a === "show" ? 3800 : a === "dormir" ? 2600 : 1600);
  }
  const scene = "radial-gradient(circle at 50% 45%, #ffffff, #eef3fb 78%)";
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 18, padding: 10, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, boxShadow: "0 6px 18px rgba(30,60,120,.1)",
  };
  const h2: React.CSSProperties = { fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" };
  const isDragon = kind === "dragao";

  return (
    <div style={{ minHeight: "100vh", padding: "22px 16px 48px", fontFamily: "Inter, system-ui, sans-serif", background: "linear-gradient(160deg,#e0f2fe,#fce7f3)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f766e", marginBottom: 4 }}>Prévia do Bichinho 🐉</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 18 }}>Tudo o que já está pronto — o dragão anima sozinho, pisca, bate asas e muda de atividade.</p>

        {/* Controles */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Bichinho</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
                <button key={k} onClick={() => { setKind(k); setColor(DEFAULT_COLOR[k]); }}
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

        {/* Em movimento (anima sozinho) */}
        <h2 style={h2}>1. Vivo — anima sozinho 🎬</h2>
        <div style={{ maxWidth: 360, margin: "0 auto 14px", borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 36px rgba(30,60,120,.16)", border: "3px solid #fff" }}>
          <div style={{ position: "relative", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)" }}>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              <LivePet kind={kind} stage={2} color={color} size={210} action={demo} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, background: "#fff", flexWrap: "wrap" }}>
            {([["comer", "🍎", "Comer"], ["brincar", "🎾", "Brincar"], ["dormir", "😴", "Dormir"], ["cocegas", "😄", "Cócegas"], ["show", "✨", "Show"]] as const).map(([a, e, l]) => (
              <button key={a} onClick={() => play(a)} disabled={!!demo}
                style={{ flex: "1 0 30%", border: "2px solid #a5f3fc", background: "#ecfeff", borderRadius: 14, padding: "8px 4px",
                  cursor: demo ? "default" : "pointer", opacity: demo ? 0.6 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 20 }}>{e}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0f766e" }}>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 28 }}>Repare: de vez em quando ele <b>pisca</b> e, quando voa, <b>bate as asas</b> sozinho. 👆</p>

        {/* Animações quadro-a-quadro (isoladas) */}
        {isDragon && (
          <>
            <h2 style={h2}>2. Piscar (animação quadro-a-quadro) 👀</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <div style={{ ...card, flex: 1, minWidth: 200, maxWidth: 260 }}>
                <div style={{ background: scene, borderRadius: 16, padding: 6 }}>
                  <Flip size={150} srcs={[`/petimg/dragao-${color}-idle.png`, `/petimg/dragao-${color}-piscar.png`]} ms={[1800, 150]} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0f766e" }}>👀 Piscando</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>olho abre e fecha rapidinho</span>
              </div>
            </div>
          </>
        )}

        {/* Componente REAL do Início */}
        <h2 style={h2}>3. Como aparece no Início (componente real)</h2>
        <div style={{ maxWidth: 340, margin: "0 auto 28px" }}>
          <PetCompanion patientId="preview-demo" theme="COLORFUL" />
        </div>

        {/* Fases */}
        <h2 style={h2}>4. Fases (crescimento)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[0, 1, 2, 3].map((stage) => (
            <div key={stage} style={card}>
              <div style={{ background: scene, borderRadius: "50%" }}>
                <PetCreature kind={kind} stage={stage} size={140} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0f766e" }}>{stage === 0 ? "Ovo" : STAGE_LABELS[stage]}</span>
            </div>
          ))}
        </div>

        {/* Todas as poses (só dragão tem imagens) */}
        {isDragon && (
          <>
            <h2 style={h2}>5. Todas as poses ({ALL_POSES.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              {ALL_POSES.map((pz) => (
                <div key={pz.id} style={card}>
                  <div style={{ background: scene, borderRadius: 14 }}>
                    <PetCreature kind="dragao" stage={2} color={color} mood={pz.id === "dormir" ? "sleep" : "idle"} pose={pz.id} size={116} />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>{pz.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
