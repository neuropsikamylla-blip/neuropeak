"use client";

import { useEffect, useState } from "react";
import { listPtVoices, genderOf, getPreferredVoiceURI, setPreferredVoiceURI, ensureVoices, type VoiceGender } from "@/lib/voicePrefs";

const SAMPLE = "Olá! A sua lista de compras é: arroz, leite e pão.";

function speakSample(uri: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const v = listPtVoices().find(x => x.voiceURI === uri);
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(SAMPLE);
  u.lang = "pt-BR"; u.rate = 0.95; u.pitch = 1.0;
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

const GENDER_LABEL: Record<VoiceGender, string> = { fem: "Femininas", masc: "Masculinas", "?": "Outras" };

export function VoicePicker({ onClose }: { onClose: () => void }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sel, setSel] = useState<string>(getPreferredVoiceURI());

  useEffect(() => { ensureVoices(() => setVoices(listPtVoices())); }, []);
  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  const groups: VoiceGender[] = ["fem", "masc", "?"];
  const byGender = (g: VoiceGender) => voices.filter(v => genderOf(v) === g);

  function choose(uri: string) { setSel(uri); setPreferredVoiceURI(uri); speakSample(uri); }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,12,8,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, maxHeight: "82vh", overflowY: "auto",
        background: "#fbf6ec", borderRadius: 22, padding: "20px 18px", boxShadow: "0 24px 60px rgba(20,12,4,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: "#2a2018" }}>🔊 Escolher a voz</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
            background: "#ece3d1", color: "#6b6052", fontSize: 16, fontWeight: 900 }}>×</button>
        </div>
        <p style={{ fontSize: 12.5, color: "#8a7c63", marginBottom: 14 }}>
          Toque para ouvir uma amostra e selecionar. A escolha vale para todos os exercícios com áudio neste aparelho.
        </p>

        {voices.length === 0 && (
          <p style={{ fontSize: 13, color: "#9a8f7e", textAlign: "center", padding: "16px 0" }}>
            Nenhuma voz em português encontrada neste aparelho.
          </p>
        )}

        {groups.map(g => {
          const list = byGender(g);
          if (!list.length) return null;
          return (
            <div key={g} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#b0a187", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{GENDER_LABEL[g]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {list.map(v => {
                  const active = sel === v.voiceURI;
                  return (
                    <button key={v.voiceURI} onClick={() => choose(v.voiceURI)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 14, cursor: "pointer",
                        background: active ? "#e7f5f1" : "#fff", border: active ? "2px solid #2f9e8f" : "1.5px solid #ece0c8",
                        textAlign: "left", transition: "all .15s" }}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, fontSize: 15,
                        background: active ? "#2f9e8f" : "rgba(47,158,143,0.12)", color: active ? "#fff" : "#2f9e8f",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>{active ? "✓" : "▶"}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: "#2a2018", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                        <span style={{ display: "block", fontSize: 11, color: "#9a8f7e" }}>{v.lang}{!v.localService ? " · nuvem (mais natural)" : ""}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button onClick={onClose} style={{ width: "100%", height: 48, marginTop: 6, borderRadius: 100, border: "none",
          background: "linear-gradient(135deg,#11514f,#0d3a3c)", color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>
          Pronto
        </button>
      </div>
    </div>
  );
}
