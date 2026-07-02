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
      {/* sombreado sutil no topo do olho — dá profundidade */}
      <path d="M37 55 A12 12 0 0 1 59 55 Z" fill="#0f172a" opacity={0.06} />
      <path d="M61 55 A12 12 0 0 1 83 55 Z" fill="#0f172a" opacity={0.06} />
      <circle cx={50} cy={63} r={6.4} fill="#1f2937" />
      <circle cx={74} cy={63} r={6.4} fill="#1f2937" />
      {/* brilho principal + catchlight (olhos molhados) */}
      <circle cx={47.5} cy={59.5} r={2.9} fill="#fff" />
      <circle cx={71.5} cy={59.5} r={2.9} fill="#fff" />
      <circle cx={52.5} cy={65} r={1.4} fill="#fff" opacity={0.85} />
      <circle cx={76.5} cy={65} r={1.4} fill="#fff" opacity={0.85} />
    </g>
  );
}

// Realce (brilho) e sombra para dar volume "3D" ao corpo/barriga.
function Sheen({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={0.28} />;
}
function Shade({ cx, cy, rx, ry, color }: { cx: number; cy: number; rx: number; ry: number; color: string }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={0.16} />;
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
      {/* cauda com leque na ponta */}
      <path d="M82 90 Q112 94 112 68 Q112 56 102 60 Q109 69 94 80 Q87 85 82 90 Z" fill={p.body} />
      <path d="M104 60 L119 54 L109 66 Z" fill={p.dark} />
      <path d="M102 57 L112 45 L108 60 Z" fill={p.dark} />
      {/* asas de morcego (membrana recortada) + nervuras */}
      <path d="M40 54 Q6 36 3 58 Q13 55 17 62 Q10 60 15 71 Q22 64 28 68 Q28 58 40 60 Z" fill={p.dark} />
      <path d="M80 54 Q114 36 117 58 Q107 55 103 62 Q110 60 105 71 Q98 64 92 68 Q92 58 80 60 Z" fill={p.dark} />
      <g stroke="#000" strokeOpacity={0.18} strokeWidth={1.3} fill="none">
        <path d="M36 58 L8 55" /><path d="M36 61 L15 66" /><path d="M84 58 L112 55" /><path d="M84 61 L105 66" />
      </g>
      {/* chifres varridos pra trás */}
      <path d="M45 40 Q36 26 43 17 Q48 24 51 40 Z" fill={p.horn} />
      <path d="M75 40 Q84 26 77 17 Q72 24 69 40 Z" fill={p.horn} />
      {/* crista de espinhos */}
      <path d="M53 35 L55 27 L58 35 Z" fill={p.dark} />
      <path d="M58 34 L61 24 L64 34 Z" fill={p.dark} />
      <path d="M64 35 L67 27 L69 35 Z" fill={p.dark} />
      {/* corpo */}
      <ellipse cx={60} cy={66} rx={36} ry={34} fill={p.body} />
      <Shade cx={60} cy={92} rx={30} ry={13} color={p.dark} />
      <Sheen cx={49} cy={49} rx={19} ry={12} />
      {/* peito/barriga clara com placas */}
      <ellipse cx={60} cy={80} rx={19} ry={17} fill={p.belly} />
      <g stroke={p.dark} strokeWidth={1.4} fill="none" opacity={0.28}>
        <path d="M49 84 Q60 88 71 84" /><path d="M51 91 Q60 94 69 91" /><path d="M54 96 Q60 98 66 96" />
      </g>
      {/* focinho + narinas */}
      <ellipse cx={60} cy={72} rx={14} ry={9.5} fill={p.body} />
      <Sheen cx={55} cy={69} rx={6} ry={3} />
      <ellipse cx={55} cy={71} rx={1.6} ry={2.2} fill={p.dark} />
      <ellipse cx={65} cy={71} rx={1.6} ry={2.2} fill={p.dark} />
      {/* boca + dentinhos */}
      <path d="M53 78 Q60 85 67 78" fill="none" stroke="#1f2937" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M56 79 L57.5 82.5 L54.5 80 Z" fill="#fff" stroke="#1f2937" strokeWidth={0.5} />
      <path d="M64 79 L65.5 82.5 L62.5 80 Z" fill="#fff" stroke="#1f2937" strokeWidth={0.5} />
      <Cheeks color={p.cheek} />
      <Eyes mood={mood} />
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
      <Shade cx={60} cy={94} rx={30} ry={13} color={p.dark} />
      <Sheen cx={49} cy={51} rx={19} ry={12} />
      {/* bracinhos */}
      <ellipse cx={26} cy={78} rx={8} ry={12} fill={p.body} />
      <ellipse cx={94} cy={78} rx={8} ry={12} fill={p.body} />
      {/* barriga */}
      <ellipse cx={60} cy={78} rx={22} ry={20} fill={p.belly} />
      <Sheen cx={54} cy={68} rx={11} ry={6} />
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
  const common = { width: size, height: size, viewBox: "0 0 120 120", style: { display: "block", filter: "drop-shadow(0 5px 6px rgba(0,0,0,0.16))" } as const };

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
