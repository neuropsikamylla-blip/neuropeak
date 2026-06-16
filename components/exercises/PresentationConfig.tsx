"use client";

import type { ReactNode } from "react";

// Modo de apresentação unificado (escolhido ANTES de iniciar — nunca toca áudio sozinho).
// visual = só texto · visual_audio = texto + áudio · audio_only = só áudio (esconde o texto).
export type PresMode = "visual" | "visual_audio" | "audio_only";

interface Props {
  title: string;
  /** Linha curta de contexto (ex.: nível atual). Opcional. */
  subtitle?: ReactNode;
  icon?: string;
  /** Cor de destaque dos botões. */
  accent?: string;
  onChoose: (mode: PresMode) => void;
  /** Conteúdo extra opcional acima dos botões (ex.: trocar voz). */
  extra?: ReactNode;
}

/** Tela "Configurar atividade" — a terapeuta escolhe o modo de apresentação. */
export function PresentationConfig({ title, subtitle, icon = "⚙️", accent = "#11514f", onChoose, extra }: Props) {
  const Btn = ({ m, ico, label, sub }: { m: PresMode; ico: string; label: string; sub: string }) => (
    <button
      onClick={() => onChoose(m)}
      style={{
        width: "100%", padding: "14px 16px", borderRadius: 16, border: "2px solid #d8e0ea", background: "#fff",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
      }}
      onPointerDown={(e) => (e.currentTarget.style.borderColor = accent)}
      onPointerUp={(e) => (e.currentTarget.style.borderColor = "#d8e0ea")}
    >
      <span style={{ fontSize: 26, width: 34, textAlign: "center", flexShrink: 0 }}>{ico}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 800, fontSize: 16, color: "#1e293b" }}>{label}</span>
        <span style={{ fontSize: 12.5, color: "#7c8794", lineHeight: 1.25 }}>{sub}</span>
      </span>
    </button>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(180deg,#eef4fb 0%,#e6edf8 60%,#eef2fa 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 26, padding: "28px 22px", textAlign: "center", boxShadow: "0 20px 56px rgba(40,60,110,0.18)" }}>
        <div style={{ fontSize: 44, marginBottom: 4 }}>{icon}</div>
        <h1 style={{ color: "#1e293b", fontSize: 22, fontWeight: 900, marginBottom: 2 }}>{title}</h1>
        <p style={{ color: "#5b6677", fontSize: 15, marginBottom: 4, fontWeight: 700 }}>Configurar atividade</p>
        {subtitle && <p style={{ color: "#94a3b8", fontSize: 12.5, marginBottom: 16 }}>{subtitle}</p>}
        {!subtitle && <div style={{ height: 12 }} />}
        {extra}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn m="visual" ico="👁️" label="Visual" sub="Só na tela, sem som." />
          <Btn m="visual_audio" ico="👁️🔊" label="Visual + áudio" sub="Na tela e falado." />
          <Btn m="audio_only" ico="🎧" label="Somente áudio" sub="Falado; o texto aparece só no fim." />
        </div>
        <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 14, lineHeight: 1.4 }}>
          Nos modos com áudio, dá para repetir pelo botão de som durante a atividade.
        </p>
      </div>
    </div>
  );
}
