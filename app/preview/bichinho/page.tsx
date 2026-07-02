"use client";

// Página de PRÉVIA do bichinho (Kids) — mostra todas as fases, poses e cores
// usando o componente real (PetCreature). Livre (sem login), só arte, sem dados.
// Acesse em /preview/bichinho. Serve para acompanhar como está ficando no app.

import { useState } from "react";
import { PetCreature } from "@/components/patient/PetCreature";
import { LivePet } from "@/components/patient/LivePet";
import { PetCompanion } from "@/components/patient/PetCompanion";
import { STAGE_LABELS, DEFAULT_COLOR, colorsFor, paletteById, type PetKind, type PetColorId, type DragonPose } from "@/lib/pet";

const POSES: { id: DragonPose; label: string }[] = [
  { id: "idle", label: "Parado" },
  { id: "comer", label: "Comendo" },
  { id: "dormir", label: "Dormindo" },
  { id: "brincar", label: "Brincando" },
  { id: "piscar", label: "Piscando" },
];

export default function PreviewBichinho() {
  const [kind, setKind] = useState<PetKind>("dragao");
  const [color, setColor] = useState<PetColorId>("verde");
  const [demo, setDemo] = useState<null | "comer" | "brincar" | "dormir" | "cocegas" | "show">(null);
  function play(a: "comer" | "brincar" | "dormir" | "cocegas" | "show") {
    setDemo(a);
    window.setTimeout(() => setDemo(null), a === "show" ? 3800 : a === "dormir" ? 2600 : 1600);
  }
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, boxShadow: "0 8px 22px rgba(30,60,120,.12)",
  };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: "#0f766e" };
  const scene = "radial-gradient(circle at 50% 45%, #ffffff, #eef3fb 78%)";

  return (
    <div style={{
      minHeight: "100vh", padding: "22px 16px 40px",
      fontFamily: "Inter, system-ui, sans-serif",
      background: "linear-gradient(160deg,#e0f2fe,#fce7f3)",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f766e", marginBottom: 4 }}>Prévia do Bichinho 🐣</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 18 }}>
          Todas as fases, poses e cores — como aparecem no app (tema Kids).
        </p>

        {/* Controles */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Bichinho</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
                <button key={k} onClick={() => { setKind(k); setColor(DEFAULT_COLOR[k]); }}
                  style={{ padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 13, cursor: "pointer",
                    border: kind === k ? "2px solid #14b8a6" : "2px solid #e2e8f0",
                    background: kind === k ? "#ccfbf1" : "#fff", color: "#0f766e" }}>
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

        {/* Em movimento */}
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Em movimento (anima sozinho) 🎬</h2>
        <div style={{ maxWidth: 360, margin: "0 auto 28px", borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 36px rgba(30,60,120,.16)", border: "3px solid #fff" }}>
          <div style={{ position: "relative", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center",
            background: "linear-gradient(180deg,#eef6ff 0%,#ffffff 62%)" }}>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ width: 150, height: 14, background: "rgba(30,60,120,.12)", borderRadius: "50%", position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", filter: "blur(3px)" }} />
              <LivePet kind={kind} stage={2} color={color} size={210} action={demo} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, padding: 12, background: "#fff" }}>
            {([["comer", "🍎", "Comer"], ["brincar", "🎾", "Brincar"], ["dormir", "😴", "Dormir"], ["cocegas", "😄", "Cócegas"], ["show", "✨", "Show"]] as const).map(([a, e, l]) => (
              <button key={a} onClick={() => play(a)} disabled={!!demo}
                style={{ flex: 1, border: "2px solid #a5f3fc", background: "#ecfeff", borderRadius: 16, padding: "10px 4px",
                  cursor: demo ? "default" : "pointer", opacity: demo ? 0.6 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 24 }}>{e}</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0f766e" }}>{l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Componente REAL do Início (PetCompanion) */}
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Componente real do Início (PetCompanion)</h2>
        <div style={{ maxWidth: 340, margin: "0 auto 28px" }}>
          <PetCompanion patientId="preview-demo" theme="COLORFUL" />
        </div>

        {/* Card de escolha (como aparece no Início) */}
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Card de escolha (Início)</h2>
        <div style={{ display: "flex", gap: 12, maxWidth: 340, margin: "0 auto 28px" }}>
          {(["dragao", "monstrinho"] as PetKind[]).map((k) => (
            <div key={k} style={{ flex: 1, borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(240,253,250,.6)", border: "2px solid #ccfbf1" }}>
              <div style={{ borderRadius: "50%", background: "radial-gradient(circle at 50% 45%, #ffffff, #eef3fb 78%)" }}>
                <PetCreature kind={k} stage={2} size={100} color={k === "dragao" ? "verde" : "roxo"} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#374151" }}>{k === "dragao" ? "Dragão" : "Monstrinho"}</span>
            </div>
          ))}
        </div>

        {/* Fases */}
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Fases (crescimento)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[0, 1, 2, 3].map((stage) => (
            <div key={stage} style={card}>
              <div style={{ background: scene, borderRadius: "50%" }}>
                <PetCreature kind={kind} stage={stage} size={150} color={color} />
              </div>
              <span style={label}>{stage === 0 ? "Ovo" : STAGE_LABELS[stage]}</span>
            </div>
          ))}
        </div>

        {/* Poses (só dragão tem poses de imagem) */}
        {kind === "dragao" && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Poses (movimentos no habitat)</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {POSES.map((pz) => (
                <div key={pz.id} style={card}>
                  <div style={{ background: scene, borderRadius: "50%" }}>
                    <PetCreature kind={kind} stage={2} color={color}
                      mood={pz.id === "dormir" ? "sleep" : "idle"} pose={pz.id} size={140} />
                  </div>
                  <span style={label}>{pz.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
