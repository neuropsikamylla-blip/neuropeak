"use client";

import { paletteById, DEFAULT_COLOR, type PetKind, type AccessoryId, type PetColorId, type PetPalette } from "@/lib/pet";

// Arte vetorial do bichinho (SVG, viewBox 120×120). Fase 0 = ovo; 1..3 =
// filhote/jovem/adulto. A cor vem da escolha da criança. Fofos e com personalidade:
// olhos grandes, bochechas rosadas, patinhas e manchinhas na barriga.

type Mood = "idle" | "sleep";

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "sleep") {
    return (
      <g fill="none" stroke="#1f2937" strokeWidth={2.6} strokeLinecap="round">
        <path d="M41 61 Q48 67 55 61" />
        <path d="M65 61 Q72 67 79 61" />
      </g>
    );
  }
  return (
    <g>
      <circle cx={48} cy={61} r={12} fill="#fff" />
      <circle cx={72} cy={61} r={12} fill="#fff" />
      <circle cx={50} cy={63} r={6.2} fill="#1f2937" />
      <circle cx={74} cy={63} r={6.2} fill="#1f2937" />
      <circle cx={47} cy={59} r={2.6} fill="#fff" />
      <circle cx={71} cy={59} r={2.6} fill="#fff" />
    </g>
  );
}

function Cheeks({ color }: { color: string }) {
  return (
    <g opacity={0.6}>
      <circle cx={36} cy={72} r={6} fill={color} />
      <circle cx={84} cy={72} r={6} fill={color} />
    </g>
  );
}

function BellySpots({ color }: { color: string }) {
  return (
    <g fill={color} opacity={0.16}>
      <circle cx={52} cy={80} r={3} />
      <circle cx={66} cy={86} r={2.4} />
      <circle cx={60} cy={74} r={2} />
    </g>
  );
}

function Feet({ color }: { color: string }) {
  return (
    <g fill={color}>
      <ellipse cx={47} cy={101} rx={10} ry={6.5} />
      <ellipse cx={73} cy={101} rx={10} ry={6.5} />
    </g>
  );
}

function Accessory({ id }: { id: AccessoryId }) {
  switch (id) {
    case "chapeu":
      return (
        <g>
          <path d="M60 4 L48 30 L72 30 Z" fill="#f472b6" stroke="#db2777" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M50 26 L70 26" stroke="#fbcfe8" strokeWidth={3} strokeLinecap="round" />
          <path d="M52 20 L68 20" stroke="#fbcfe8" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={60} cy={5} r={4} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        </g>
      );
    case "laco":
      return (
        <g>
          <path d="M60 24 L44 15 L44 33 Z" fill="#fb7185" stroke="#e11d48" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M60 24 L76 15 L76 33 Z" fill="#fb7185" stroke="#e11d48" strokeWidth={1.2} strokeLinejoin="round" />
          <circle cx={60} cy={24} r={4.5} fill="#f43f5e" stroke="#e11d48" strokeWidth={1} />
        </g>
      );
    case "oculos":
      return (
        <g fill="none" stroke="#1f2937" strokeWidth={2.6}>
          <circle cx={48} cy={61} r={14} />
          <circle cx={72} cy={61} r={14} />
          <path d="M62 61 L58 61" strokeLinecap="round" />
          <path d="M34 59 L28 56" strokeLinecap="round" />
          <path d="M86 59 L92 56" strokeLinecap="round" />
        </g>
      );
    case "coroa":
    default:
      return (
        <g>
          <path d="M47 30 L52 20 L60 27 L68 20 L73 30 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth={1.5} strokeLinejoin="round" />
          <circle cx={52} cy={20} r={2.4} fill="#fde68a" />
          <circle cx={68} cy={20} r={2.4} fill="#fde68a" />
          <circle cx={60} cy={26.5} r={2.4} fill="#fde68a" />
        </g>
      );
  }
}

function Sparkles({ color }: { color: string }) {
  const star = (x: number, y: number, s: number) =>
    `M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`;
  return (
    <g fill={color}>
      <path d={star(18, 38, 5)} opacity={0.9} />
      <path d={star(102, 44, 4)} opacity={0.9} />
      <path d={star(98, 88, 3.5)} opacity={0.8} />
    </g>
  );
}

function Egg({ p }: { p: PetPalette }) {
  return (
    <g>
      <path d="M60 22 C40 22 31 52 31 73 C31 96 44 106 60 106 C76 106 89 96 89 73 C89 52 80 22 60 22 Z" fill={p.body} />
      <path d="M60 60 C48 60 42 74 42 84 C42 96 50 102 60 102 C70 102 78 96 78 84 C78 74 72 60 60 60 Z" fill={p.belly} opacity={0.85} />
      <g fill={p.dark} opacity={0.45}>
        <circle cx={48} cy={44} r={3.2} /><circle cx={74} cy={52} r={2.6} /><circle cx={52} cy={62} r={2.2} /><circle cx={70} cy={38} r={2} />
      </g>
      <path d="M44 48 L52 54 L46 60 L56 66" fill="none" stroke={p.belly} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </g>
  );
}

function Dragon({ p, mood }: { p: PetPalette; mood: Mood }) {
  return (
    <g>
      <Feet color={p.dark} />
      {/* asas atrás */}
      <path d="M34 60 Q6 48 10 78 Q24 68 38 74 Z" fill={p.dark} opacity={0.9} />
      <path d="M86 60 Q114 48 110 78 Q96 68 82 74 Z" fill={p.dark} opacity={0.9} />
      {/* rabo */}
      <path d="M84 92 Q100 96 95 78 Q90 86 80 84 Z" fill={p.body} />
      {/* chifres */}
      <path d="M45 38 L49 22 L55 39 Z" fill={p.horn} />
      <path d="M65 39 L71 22 L75 38 Z" fill={p.horn} />
      {/* corpo */}
      <ellipse cx={60} cy={66} rx={36} ry={34} fill={p.body} />
      <path d="M60 32 L65 40 L55 40 Z" fill={p.dark} opacity={0.6} />
      {/* barriga */}
      <ellipse cx={60} cy={76} rx={23} ry={21} fill={p.belly} />
      <BellySpots color={p.dark} />
      <Cheeks color={p.cheek} />
      <Eyes mood={mood} />
      <path d="M52 76 Q60 84 68 76" fill="none" stroke="#1f2937" strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
}

function Monster({ p, mood }: { p: PetPalette; mood: Mood }) {
  return (
    <g>
      <Feet color={p.dark} />
      {/* antenas */}
      <line x1={47} y1={40} x2={43} y2={22} stroke={p.dark} strokeWidth={3.2} strokeLinecap="round" />
      <line x1={73} y1={40} x2={77} y2={22} stroke={p.dark} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={42} cy={20} r={5} fill={p.horn} />
      <circle cx={78} cy={20} r={5} fill={p.horn} />
      {/* tufo de pelo no topo */}
      <path d="M30 50 q7 -17 14 -2 q7 -17 14 0 q7 -17 14 2 q5 7 -2 11 L32 62 Z" fill={p.body} />
      {/* corpo */}
      <ellipse cx={60} cy={68} rx={36} ry={34} fill={p.body} />
      {/* bracinhos */}
      <ellipse cx={26} cy={78} rx={8} ry={12} fill={p.body} />
      <ellipse cx={94} cy={78} rx={8} ry={12} fill={p.body} />
      {/* barriga */}
      <ellipse cx={60} cy={78} rx={22} ry={20} fill={p.belly} />
      <BellySpots color={p.dark} />
      <Cheeks color={p.cheek} />
      <Eyes mood={mood} />
      {/* sorrisão com um dentinho */}
      <path d="M50 78 Q60 88 70 78" fill="none" stroke="#1f2937" strokeWidth={2.8} strokeLinecap="round" />
      <rect x={55} y={79} width={5} height={5} rx={1} fill="#fff" stroke="#1f2937" strokeWidth={1} />
    </g>
  );
}

export function PetCreature({ kind, stage, size = 140, accessory, color, mood = "idle" }: {
  kind: PetKind; stage: number; size?: number; accessory?: AccessoryId; color?: PetColorId; mood?: Mood;
}) {
  const p = paletteById(color ?? DEFAULT_COLOR[kind]);
  const common = { width: size, height: size, viewBox: "0 0 120 120", style: { display: "block" } as const };

  if (stage <= 0) {
    return <svg {...common} aria-hidden>{<Egg p={p} />}</svg>;
  }

  const scale = stage === 1 ? 0.84 : stage === 2 ? 1.0 : 1.12;
  const adult = stage >= 3;
  return (
    <svg {...common} aria-hidden>
      {adult && <Sparkles color={p.horn} />}
      <g transform={`translate(60 68) scale(${scale}) translate(-60 -68)`}>
        {kind === "dragao" ? <Dragon p={p} mood={mood} /> : <Monster p={p} mood={mood} />}
        {adult && <Accessory id={accessory ?? "coroa"} />}
      </g>
    </svg>
  );
}
