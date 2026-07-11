"use client";

import { useId } from "react";
import type { AgentColor, AgentAccessory, AgentExpression, AgentId } from "@/data/agents";

interface AgentCharacterProps {
  agent?: AgentId;
  color: AgentColor;
  accessory: AgentAccessory;
  selected?: boolean;
  size?: number;
  expression?: AgentExpression;
  className?: string;
  style?: React.CSSProperties;
  /** Caminho direto para imagem PNG (substitui o SVG quando fornecido) */
  imageSrc?: string;
}

const PALETTE: Record<AgentColor, string> = {
  blue: "#1E88E5", green: "#43A047", purple: "#8E24AA",
  orange: "#FB8C00", red: "#E53935", yellow: "#FDD835",
};
const DARK: Record<AgentColor, string> = {
  blue: "#1565C0", green: "#2E7D32", purple: "#6A1B9A",
  orange: "#E65100", red: "#B71C1C", yellow: "#F57F17",
};

const SKIN = "#FDDCB0";
const SK = "#C8845A";   // skin shadow
const OUT = "#1a1a1a";  // outline
const CR = "#D32F2F";   // cap red
const CRD = "#8B0000";  // cap red dark

export function AgentCharacter({
  color, accessory, size = 100, expression = "happy", className, style, imageSrc,
}: AgentCharacterProps) {
  // useId tem que ser chamado incondicionalmente (regras dos hooks), antes de
  // qualquer early return. Só é usado no caminho SVG, mas a chamada é sempre feita.
  const uid = useId().replace(/:/g, "_");

  // PNG disponível → usa imagem real, ignora SVG
  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{
          objectFit: "contain",
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))",
          ...style,
        }}
      />
    );
  }
  const c  = PALETTE[color];
  const cd = DARK[color];
  const light = color === "yellow";
  const robot  = accessory === "robot-helmet";
  const hood   = accessory === "hood";
  const cap    = accessory === "red-cap";
  const beanie = accessory === "beanie";
  const glass  = accessory === "glasses" || beanie;
  const phones = accessory === "headphones";
  const h = Math.round(size * 116 / 60);

  const GB  = `${uid}b`;
  const GF  = `${uid}f`;
  const GBt = `${uid}bt`;
  const GR  = `${uid}r`;

  return (
    <svg
      width={size} height={h} viewBox="0 0 60 116"
      style={{ overflow: "visible", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))", ...style }}
      className={className}
    >
      <defs>
        <radialGradient id={GB} cx="28%" cy="18%" r="82%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.6)"/>
          <stop offset="42%"  stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)"/>
        </radialGradient>
        <radialGradient id={GF} cx="38%" cy="28%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.42)"/>
          <stop offset="60%"  stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.13)"/>
        </radialGradient>
        <radialGradient id={GBt} cx="22%" cy="18%" r="78%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.54)"/>
          <stop offset="50%"  stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.52)"/>
        </radialGradient>
        <radialGradient id={GR} cx="28%" cy="22%" r="78%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.78)"/>
          <stop offset="48%"  stopColor="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.32)"/>
        </radialGradient>
      </defs>

      {/* ══ CAPUZ BACK ══════════════════════════════════════════════════════ */}
      {hood && (
        <>
          <ellipse cx="30" cy="20" rx="27" ry="25" fill={c} stroke={OUT} strokeWidth="2"/>
          <ellipse cx="30" cy="20" rx="27" ry="25" fill={`url(#${GB})`}/>
        </>
      )}

      {/* ══ CABELO fluffy ════════════════════════════════════════════════════ */}
      {!robot && !hood && !cap && !beanie && (
        <g>
          {/* puffs laterais */}
          <circle cx="7"  cy="23" r="12" fill={c}/>
          <circle cx="53" cy="23" r="12" fill={c}/>
          {/* puffs do topo */}
          <circle cx="14" cy="7"  r="11" fill={c}/>
          <circle cx="30" cy="2"  r="13" fill={c}/>
          <circle cx="46" cy="7"  r="11" fill={c}/>
          {/* preenchimento */}
          <ellipse cx="30" cy="14" rx="22" ry="12" fill={c}/>
          {/* sombra base */}
          <ellipse cx="30" cy="22" rx="20" ry="7" fill={cd} opacity="0.5"/>
          {/* brilho 3D */}
          <ellipse cx="21" cy="5" rx="9" ry="6" fill="rgba(255,255,255,0.38)" transform="rotate(-15 21 5)"/>
        </g>
      )}

      {/* ══ ROBÔ BACK ════════════════════════════════════════════════════════ */}
      {robot && (
        <>
          <ellipse cx="30" cy="25" rx="24" ry="28" fill="#B0BEC5" stroke="#546E7A" strokeWidth="2"/>
          <ellipse cx="30" cy="25" rx="24" ry="28" fill={`url(#${GR})`}/>
        </>
      )}

      {/* ══ CABEÇA ════════════════════════════════════════════════════════════ */}
      {!robot && (
        <>
          <ellipse cx="30" cy="27" rx="21" ry="22" fill={SKIN} stroke={OUT} strokeWidth="2.2"/>
          <ellipse cx="30" cy="27" rx="21" ry="22" fill={`url(#${GF})`}/>
        </>
      )}

      {/* ══ BOCHECHAS ════════════════════════════════════════════════════════ */}
      {!robot && (
        <>
          <ellipse cx="11" cy="35" rx="6"   ry="4.5" fill="#F48FB1" opacity="0.55"/>
          <ellipse cx="49" cy="35" rx="6"   ry="4.5" fill="#F48FB1" opacity="0.55"/>
        </>
      )}

      {/* ══ SOBRANCELHAS ══════════════════════════════════════════════════════ */}
      {!robot && (
        expression === "focused" ? <>
          <path d="M12 19 Q18 15.5 24 19" fill="none" stroke={OUT} strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M36 19 Q42 15.5 48 19" fill="none" stroke={OUT} strokeWidth="2.8" strokeLinecap="round"/>
        </> : <>
          <path d="M12 18.5 Q18 15 24 18.5" fill="none" stroke={OUT} strokeWidth="2.6" strokeLinecap="round"/>
          <path d="M36 18.5 Q42 15 48 18.5" fill="none" stroke={OUT} strokeWidth="2.6" strokeLinecap="round"/>
        </>
      )}

      {/* ══ OLHOS ══════════════════════════════════════════════════════════════ */}
      {!robot && <>
        {/* esquerdo */}
        <ellipse cx="19" cy="29" rx="8"   ry="9"   fill="white" stroke={OUT} strokeWidth="1.6"/>
        <ellipse cx="19.5" cy="29.5" rx="6.5" ry="7.5" fill="#09041A"/>
        <circle  cx="23"   cy="24"   r="3.2"  fill="white" opacity="0.95"/>
        <circle  cx="16"   cy="34"   r="1.5"  fill="white" opacity="0.45"/>
        {/* direito */}
        <ellipse cx="41" cy="29" rx="8"   ry="9"   fill="white" stroke={OUT} strokeWidth="1.6"/>
        <ellipse cx="41.5" cy="29.5" rx="6.5" ry="7.5" fill="#09041A"/>
        <circle  cx="45"   cy="24"   r="3.2"  fill="white" opacity="0.95"/>
        <circle  cx="38"   cy="34"   r="1.5"  fill="white" opacity="0.45"/>
      </>}

      {/* ══ ÓCULOS ══════════════════════════════════════════════════════════════
          Armação retangular + ponte + hastes — claramente óculos               */}
      {glass && !robot && (
        <g>
          {/* haste esquerda (atrás da orelha) */}
          <line x1="10" y1="27" x2="2"  y2="24" stroke={OUT} strokeWidth="2.4" strokeLinecap="round"/>
          {/* haste direita */}
          <line x1="50" y1="27" x2="58" y2="24" stroke={OUT} strokeWidth="2.4" strokeLinecap="round"/>
          {/* lente esquerda — frame retangular arredondado */}
          <rect x="10" y="22" width="17" height="13" rx="5"
            fill={`${c}48`} stroke={c} strokeWidth="2.5"/>
          {/* lente direita */}
          <rect x="33" y="22" width="17" height="13" rx="5"
            fill={`${c}48`} stroke={c} strokeWidth="2.5"/>
          {/* ponte nasal */}
          <path d="M27 28.5 Q30 26.5 33 28.5"
            fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round"/>
          {/* brilho nas lentes */}
          <line x1="13" y1="25" x2="15" y2="28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
          <line x1="36" y1="25" x2="38" y2="28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
        </g>
      )}

      {/* ══ NARIZ / BOCA ════════════════════════════════════════════════════ */}
      {!robot && (
        <path d="M27.5 40 Q30 42.5 32.5 40" fill="none" stroke={SK} strokeWidth="1.9" strokeLinecap="round"/>
      )}
      {!robot && (
        expression === "happy"
          ? <path d="M22 45.5 Q30 54 38 45.5" fill="none" stroke="#8B4040" strokeWidth="2.6" strokeLinecap="round"/>
          : expression === "focused"
            ? <path d="M24 46 Q30 49 36 46" fill="none" stroke="#8B4040" strokeWidth="2.3" strokeLinecap="round"/>
            : <path d="M24 47.5 Q30 49 36 47.5" fill="none" stroke="#8B4040" strokeWidth="2" strokeLinecap="round"/>
      )}

      {/* ══ BONÉ VERMELHO — NEXO ════════════════════════════════════════════
          Cúpula vermelha + aba plana/escura claramente projetada para frente */}
      {cap && (
        <g>
          {/* cabelo lateral peeking atrás */}
          <circle cx="7"  cy="26" r="9" fill={c}/>
          <circle cx="53" cy="26" r="9" fill={c}/>

          {/* CÚPULA — dome vermelho */}
          <path d="M9 23 Q9 0 30 -1 Q51 0 51 23"
            fill={CR} stroke={OUT} strokeWidth="2"/>
          <path d="M9 23 Q9 0 30 -1 Q51 0 51 23" fill={`url(#${GB})`}/>

          {/* costuras de painel */}
          <path d="M30 -0.5 L30 23" stroke={CRD} strokeWidth="0.9" opacity="0.6"/>
          <path d="M9 23 Q19 5 30 -0.5"  stroke={CRD} strokeWidth="0.9" fill="none" opacity="0.6"/>
          <path d="M51 23 Q41 5 30 -0.5" stroke={CRD} strokeWidth="0.9" fill="none" opacity="0.6"/>

          {/* sweatband — faixa interna mais escura */}
          <path d="M9 21 Q30 25 51 21 L51 25 Q30 29 9 25Z" fill={CRD}/>

          {/* ABA — forma de crescente horizontal bem marcada */}
          <path d="M2 24 Q30 30 58 24 Q58 30 30 34 Q2 30 2 24Z"
            fill="#111111" stroke={OUT} strokeWidth="1.8"/>
          {/* reflexo da aba (fresta de luz) */}
          <path d="M4 24.5 Q30 29.5 56 24.5"
            fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.4"/>

          {/* botão no topo */}
          <circle cx="30" cy="0" r="2.8" fill={CRD} stroke={OUT} strokeWidth="1.2"/>
        </g>
      )}

      {/* ══ TOUCA / BEANIE — LUMEN ══════════════════════════════════════════
          Corpo colorido + dobra mais escura + pompom branco bem visível      */}
      {beanie && (
        <g>
          {/* cabelo lateral abaixo da touca */}
          <circle cx="7"  cy="30" r="8" fill={c}/>
          <circle cx="53" cy="30" r="8" fill={c}/>

          {/* CORPO DA TOUCA */}
          <path d="M8 24 Q8 -3 30 -6 Q52 -3 52 24 Q47 13 30 13 Q13 13 8 24Z"
            fill={c} stroke={OUT} strokeWidth="2"/>
          <path d="M8 24 Q8 -3 30 -6 Q52 -3 52 24 Q47 13 30 13 Q13 13 8 24Z"
            fill={`url(#${GB})`}/>

          {/* DOBRA / CUFF — visualmente mais escura, claramente uma faixa dobrada */}
          <path d="M8 22 Q30 27 52 22 L52 33 Q30 38 8 33Z"
            fill={cd} stroke={OUT} strokeWidth="2"/>
          <path d="M9 24 Q30 29 51 24 L51 32 Q30 37 9 32Z"
            fill={`url(#${GB})`} opacity="0.4"/>

          {/* linhas de tricô na dobra */}
          <path d="M10 27 Q30 31.5 50 27" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeDasharray="3,2.5"/>
          <path d="M10 31 Q30 35.5 50 31" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeDasharray="3,2.5"/>

          {/* POMPOM — círculo branco grande no topo */}
          <circle cx="30" cy="-9"  r="11"  fill="white" stroke={OUT} strokeWidth="1.8"/>
          <circle cx="30" cy="-9"  r="8.5" fill="#efefef"/>
          <circle cx="26" cy="-14" r="4.5" fill="rgba(255,255,255,0.72)"/>
        </g>
      )}

      {/* ══ CAPUZ FRONT ══════════════════════════════════════════════════════ */}
      {hood && (
        <>
          <path d="M6 37 Q5 10 30 8 Q55 10 54 37 Q48 23 30 23 Q12 23 6 37Z"
            fill={c} stroke={OUT} strokeWidth="1.8"/>
          <path d="M6 37 Q5 10 30 8 Q55 10 54 37 Q48 23 30 23 Q12 23 6 37Z"
            fill={`url(#${GB})`} opacity="0.55"/>
        </>
      )}

      {/* ══ HEADPHONES ═══════════════════════════════════════════════════════ */}
      {phones && (
        <g>
          {/* arco */}
          <path d="M7 28 Q7 4 30 4 Q53 4 53 28"
            fill="none" stroke="#111" strokeWidth="5.5" strokeLinecap="round"/>
          {/* ear cup esquerdo — carcaça */}
          <rect x="0"  y="17" width="14" height="22" rx="7" fill="#1a1a1a" stroke={OUT} strokeWidth="1.5"/>
          {/* ear cup esquerdo — face colorida */}
          <rect x="1.5" y="19" width="11" height="18" rx="5.5" fill={c}/>
          <rect x="1.5" y="19" width="11" height="18" rx="5.5" fill={`url(#${GB})`}/>
          <circle cx="7" cy="28" r="2.5" fill="rgba(0,0,0,0.25)"/>
          {/* ear cup direito — carcaça */}
          <rect x="46" y="17" width="14" height="22" rx="7" fill="#1a1a1a" stroke={OUT} strokeWidth="1.5"/>
          {/* ear cup direito — face colorida */}
          <rect x="48.5" y="19" width="11" height="18" rx="5.5" fill={c}/>
          <rect x="48.5" y="19" width="11" height="18" rx="5.5" fill={`url(#${GB})`}/>
          <circle cx="53" cy="28" r="2.5" fill="rgba(0,0,0,0.25)"/>
          {/* boom mic */}
          <path d="M1.5 37 Q-4 43 -5 50" fill="none" stroke="#111" strokeWidth="2.8" strokeLinecap="round"/>
          <circle cx="-5.5" cy="52" r="5"   fill="#111" stroke={OUT} strokeWidth="1"/>
          <circle cx="-5.5" cy="52" r="3"   fill={c}/>
        </g>
      )}

      {/* ══ CAPACETE ROBÔ FRONT — AXON ═══════════════════════════════════════ */}
      {robot && (
        <g>
          <ellipse cx="30" cy="27" rx="22" ry="27" fill="#ECEFF1" stroke="#546E7A" strokeWidth="2.2"/>
          <ellipse cx="30" cy="27" rx="22" ry="27" fill={`url(#${GR})`}/>
          {/* visor */}
          <rect x="13" y="21" width="34" height="18" rx="7" fill="#1A2535" stroke="#455A64" strokeWidth="1.8"/>
          <rect x="14" y="22" width="32" height="16" rx="6" fill="#0D1B2A" opacity="0.7"/>
          {/* olhos ciano */}
          <ellipse cx="21" cy="29" rx="7"   ry="6"   fill="#00E5FF" opacity="0.92"/>
          <ellipse cx="39" cy="29" rx="7"   ry="6"   fill="#00E5FF" opacity="0.92"/>
          <ellipse cx="19.5" cy="27.5" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.72)"/>
          <ellipse cx="37.5" cy="27.5" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.72)"/>
          {/* antena */}
          <line x1="30" y1="3" x2="30" y2="11" stroke="#546E7A" strokeWidth="1.8"/>
          <circle cx="30" cy="2" r="3" fill="#00E5FF" opacity="0.85"/>
          {/* vents laterais */}
          <rect x="9"  y="32" width="5" height="9" rx="2" fill="#90A4AE" stroke="#546E7A" strokeWidth="1"/>
          <line x1="9"  y1="35" x2="14" y2="35" stroke="#455A64" strokeWidth="0.9"/>
          <line x1="9"  y1="38" x2="14" y2="38" stroke="#455A64" strokeWidth="0.9"/>
          <rect x="46" y="32" width="5" height="9" rx="2" fill="#90A4AE" stroke="#546E7A" strokeWidth="1"/>
          <line x1="46" y1="35" x2="51" y2="35" stroke="#455A64" strokeWidth="0.9"/>
          <line x1="46" y1="38" x2="51" y2="38" stroke="#455A64" strokeWidth="0.9"/>
        </g>
      )}

      {/* ══ PESCOÇO ══════════════════════════════════════════════════════════ */}
      {!robot && (
        <rect x="25" y="47" width="10" height="7" rx="5" fill={SKIN} stroke={OUT} strokeWidth="1.6"/>
      )}

      {/* ══ CORPO ════════════════════════════════════════════════════════════ */}
      <rect x="14" y="51" width="32" height="21" rx="11" fill={c} stroke={OUT} strokeWidth="2"/>
      <rect x="14" y="51" width="32" height="21" rx="11" fill={`url(#${GB})`}/>
      {/* zíper */}
      <line x1="30" y1="53" x2="30" y2="71"
        stroke={light ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.28)"} strokeWidth="1.8"/>
      {/* logo no peito */}
      <circle cx="30" cy="60" r="5" fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.32)" strokeWidth="1"/>
      <path d="M28 60.5 Q29.5 58 31 59.5 Q32.5 58 34 60.5 Q32.5 63 31 62 Q29.5 63 28 60.5Z"
        fill="rgba(255,255,255,0.62)"/>

      {/* ══ BRAÇOS ═══════════════════════════════════════════════════════════ */}
      <path d="M14 56 Q2 61 2 73 L9 74 Q9 64 17 60Z"
        fill={c} stroke={OUT} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M46 56 Q58 61 58 73 L51 74 Q51 64 43 60Z"
        fill={c} stroke={OUT} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 56 Q2 61 2 73 L9 74 Q9 64 17 60Z" fill={`url(#${GB})`} strokeLinejoin="round"/>
      <path d="M46 56 Q58 61 58 73 L51 74 Q51 64 43 60Z" fill={`url(#${GB})`} strokeLinejoin="round"/>

      {/* ══ MÃOS ═════════════════════════════════════════════════════════════ */}
      <ellipse cx="5.5" cy="75" rx="5.5" ry="5"
        fill={robot ? "#90A4AE" : SKIN} stroke={OUT} strokeWidth="1.7"/>
      <ellipse cx="54.5" cy="75" rx="5.5" ry="5"
        fill={robot ? "#90A4AE" : SKIN} stroke={OUT} strokeWidth="1.7"/>
      <ellipse cx="4"  cy="73" rx="2.5" ry="2" fill="rgba(255,255,255,0.3)"/>
      <ellipse cx="53" cy="73" rx="2.5" ry="2" fill="rgba(255,255,255,0.3)"/>

      {/* ══ CINTO ════════════════════════════════════════════════════════════ */}
      <rect x="14" y="70.5" width="32" height="5.5" rx="2.8"
        fill={light ? "#5D4037" : "#0d0d0d"} stroke={OUT} strokeWidth="1.3"/>
      <rect x="27" y="70.5" width="6" height="5.5" rx="2"
        fill={light ? "#795548" : "rgba(255,255,255,0.4)"}/>
      <circle cx="30" cy="73.3" r="1.5"
        fill={light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.65)"}/>

      {/* ══ PERNAS ═══════════════════════════════════════════════════════════ */}
      <rect x="17" y="75" width="12" height="14" rx="6" fill={c} stroke={OUT} strokeWidth="1.8"/>
      <rect x="31" y="75" width="12" height="14" rx="6" fill={c} stroke={OUT} strokeWidth="1.8"/>
      <rect x="17" y="75" width="12" height="14" rx="6" fill={`url(#${GB})`} stroke="none"/>
      <rect x="31" y="75" width="12" height="14" rx="6" fill={`url(#${GB})`} stroke="none"/>

      {/* ══ BOTAS ════════════════════════════════════════════════════════════ */}
      {/* cano */}
      <rect x="13" y="85" width="17" height="13" rx="5" fill="#1a1a1a" stroke={OUT} strokeWidth="1.8"/>
      <rect x="30" y="85" width="17" height="13" rx="5" fill="#1a1a1a" stroke={OUT} strokeWidth="1.8"/>
      {/* sola */}
      <rect x="11" y="95" width="21" height="6"  rx="3" fill="#0d0d0d" stroke={OUT} strokeWidth="1.4"/>
      <rect x="28" y="95" width="21" height="6"  rx="3" fill="#0d0d0d" stroke={OUT} strokeWidth="1.4"/>
      {/* brilho */}
      <rect x="13" y="85" width="17" height="13" rx="5" fill={`url(#${GBt})`} stroke="none"/>
      <rect x="30" y="85" width="17" height="13" rx="5" fill={`url(#${GBt})`} stroke="none"/>
    </svg>
  );
}
