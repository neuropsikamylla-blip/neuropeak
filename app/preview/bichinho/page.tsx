"use client";

// Página de PRÉVIA do bichinho (Kids) — mostra todas as fases, poses e cores
// usando o componente real (PetCreature). Livre (sem login), só arte, sem dados.
// Acesse em /preview/bichinho. Serve para acompanhar como está ficando no app.

import { useState } from "react";
import { motion } from "framer-motion";
import { PetCreature } from "@/components/patient/PetCreature";
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
  const [demo, setDemo] = useState<null | "comer" | "brincar" | "dormir">(null);
  function play(a: "comer" | "brincar" | "dormir") {
    setDemo(a);
    window.setTimeout(() => setDemo(null), a === "dormir" ? 2600 : 1700);
  }
  const demoPose: DragonPose = demo === "comer" ? "comer" : demo === "brincar" ? "brincar" : "idle";
  const demoMood = demo === "dormir" ? "sleep" : "idle";

  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4, boxShadow: "0 8px 22px rgba(30,60,120,.12)",
  };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: "#0f766e" };
  const scene = "radial-gradient(circle at 50% 40%, #cffafe, transparent 70%)";

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
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#334155", margin: "0 0 12px" }}>Em movimento (toque nos botões) 🎬</h2>
        <div style={{ maxWidth: 360, margin: "0 auto 28px", borderRadius: 24, overflow: "hidden", boxShadow: "0 14px 36px rgba(30,60,120,.16)", border: "3px solid #fff" }}>
          <div style={{ position: "relative", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center",
            background: demo === "dormir"
              ? "linear-gradient(180deg,#3b3170 56%,#4a6b3a 56%)"
              : "linear-gradient(180deg,#7dd3fc 56%,#c9edb0 56%)", transition: "background .5s" }}>
            <div style={{ position: "absolute", top: 16, right: 20, width: 44, height: 44, borderRadius: "50%",
              background: demo === "dormir" ? "radial-gradient(circle at 40% 35%,#e5e7eb,#cbd5e1)" : "radial-gradient(circle at 40% 35%,#fef08a,#fbbf24)", transition: "all .5s" }} />
            <motion.div style={{ marginBottom: 8 }}
              animate={demo === "brincar" ? { y: [0, -26, 0, -14, 0] } : demo === "dormir" ? { rotate: [0, -3, 0] } : { y: [0, -8, 0] }}
              transition={{ duration: demo ? 1.4 : 2.4, repeat: demo ? 0 : Infinity, ease: "easeInOut" }}>
              <PetCreature kind={kind} stage={2} color={color} pose={demoPose} mood={demoMood} size={200} />
            </motion.div>
          </div>
          <div style={{ display: "flex", gap: 10, padding: 12, background: "#fff" }}>
            {([["comer", "🍎", "Alimentar"], ["brincar", "🎾", "Brincar"], ["dormir", "😴", "Dormir"]] as const).map(([a, e, l]) => (
              <button key={a} onClick={() => play(a)} disabled={!!demo}
                style={{ flex: 1, border: "2px solid #a5f3fc", background: "#ecfeff", borderRadius: 16, padding: "10px 4px",
                  cursor: demo ? "default" : "pointer", opacity: demo ? 0.6 : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 24 }}>{e}</span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0f766e" }}>{l}</span>
              </button>
            ))}
          </div>
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
