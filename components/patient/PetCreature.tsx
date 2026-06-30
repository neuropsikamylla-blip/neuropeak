"use client";

import type { PetKind, AccessoryId } from "@/lib/pet";

// Arte vetorial do bichinho. Desenhada em SVG (viewBox 120×120) para ficar nítida
// em qualquer tamanho e combinar com os temas. Fase 0 = ovo; 1..3 = filhote/jovem/adulto.

const PAL: Record<PetKind, { body: string; dark: string; belly: string; horn: string; cheek: string }> = {
  dragao:     { body: "#34d399", dark: "#059669", belly: "#d1fae5", horn: "#fbbf24", cheek: "#fca5a5" },
  monstrinho: { body: "#a78bfa", dark: "#7c3aed", belly: "#ede9fe", horn: "#f472b6", cheek: "#fda4af" },
};

function Eyes() {
  return (
    <g>
      <circle cx={49} cy={60} r={10.5} fill="#fff" />
      <circle cx={71} cy={60} r={10.5} fill="#fff" />
      <circle cx={51} cy={62} r={5.5} fill="#1f2937" />
      <circle cx={73} cy={62} r={5.5} fill="#1f2937" />
      <circle cx={48.5} cy={59} r={2.2} fill="#fff" />
      <circle cx={70.5} cy={59} r={2.2} fill="#fff" />
    </g>
  );
}

function Cheeks({ color }: { color: string }) {
  return (
    <g opacity={0.55}>
      <circle cx={38} cy={70} r={5} fill={color} />
      <circle cx={82} cy={70} r={5} fill={color} />
    </g>
  );
}

function Accessory({ id }: { id: AccessoryId }) {
  switch (id) {
    case "chapeu": // chapéu de festa
      return (
        <g>
          <path d="M60 4 L48 30 L72 30 Z" fill="#f472b6" stroke="#db2777" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M50 26 L70 26" stroke="#fbcfe8" strokeWidth={3} strokeLinecap="round" />
          <path d="M52 20 L68 20" stroke="#fbcfe8" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={60} cy={5} r={4} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        </g>
      );
    case "laco": // laço no topo
      return (
        <g>
          <path d="M60 24 L44 15 L44 33 Z" fill="#fb7185" stroke="#e11d48" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M60 24 L76 15 L76 33 Z" fill="#fb7185" stroke="#e11d48" strokeWidth={1.2} strokeLinejoin="round" />
          <circle cx={60} cy={24} r={4.5} fill="#f43f5e" stroke="#e11d48" strokeWidth={1} />
        </g>
      );
    case "oculos": // óculos redondos sobre os olhos
      return (
        <g fill="none" stroke="#1f2937" strokeWidth={2.6}>
          <circle cx={49} cy={60} r={13} />
          <circle cx={71} cy={60} r={13} />
          <path d="M62 60 L58 60" strokeLinecap="round" />
          <path d="M36 58 L30 55" strokeLinecap="round" />
          <path d="M84 58 L90 55" strokeLinecap="round" />
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
      <path d={star(20, 40, 5)} opacity={0.9} />
      <path d={star(100, 46, 4)} opacity={0.9} />
      <path d={star(96, 86, 3.5)} opacity={0.8} />
    </g>
  );
}

function Egg({ p }: { p: typeof PAL[PetKind] }) {
  return (
    <g>
      <path
        d="M60 22 C40 22 31 52 31 73 C31 96 44 106 60 106 C76 106 89 96 89 73 C89 52 80 22 60 22 Z"
        fill={p.body}
      />
      <path
        d="M60 60 C48 60 42 74 42 84 C42 96 50 102 60 102 C70 102 78 96 78 84 C78 74 72 60 60 60 Z"
        fill={p.belly}
        opacity={0.85}
      />
      <g fill={p.dark} opacity={0.45}>
        <circle cx={48} cy={44} r={3.2} />
        <circle cx={74} cy={52} r={2.6} />
        <circle cx={52} cy={62} r={2.2} />
        <circle cx={70} cy={38} r={2} />
      </g>
      {/* rachadura zigue-zague — sugere que está quase chocando */}
      <path d="M44 48 L52 54 L46 60 L56 66" fill="none" stroke={p.belly} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
    </g>
  );
}

function Dragon({ p }: { p: typeof PAL[PetKind] }) {
  return (
    <g>
      {/* asas atrás */}
      <path d="M34 60 Q8 50 12 76 Q24 68 38 74 Z" fill={p.dark} opacity={0.85} />
      <path d="M86 60 Q112 50 108 76 Q96 68 82 74 Z" fill={p.dark} opacity={0.85} />
      {/* rabo */}
      <path d="M84 92 Q100 96 95 78 Q90 86 80 84 Z" fill={p.body} />
      {/* chifres */}
      <path d="M46 38 L50 24 L55 39 Z" fill={p.horn} />
      <path d="M65 39 L70 24 L74 38 Z" fill={p.horn} />
      {/* corpo */}
      <ellipse cx={60} cy={66} rx={34} ry={32} fill={p.body} />
      {/* espinhos nas costas */}
      <path d="M60 34 L64 40 L56 40 Z" fill={p.dark} opacity={0.6} />
      {/* barriga */}
      <ellipse cx={60} cy={74} rx={21} ry={20} fill={p.belly} />
      <Cheeks color={p.cheek} />
      <Eyes />
      <path d="M53 74 Q60 81 67 74" fill="none" stroke="#1f2937" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

function Monster({ p }: { p: typeof PAL[PetKind] }) {
  return (
    <g>
      {/* antenas */}
      <line x1={47} y1={40} x2={43} y2={24} stroke={p.dark} strokeWidth={3} strokeLinecap="round" />
      <line x1={73} y1={40} x2={77} y2={24} stroke={p.dark} strokeWidth={3} strokeLinecap="round" />
      <circle cx={42} cy={22} r={4.5} fill={p.horn} />
      <circle cx={78} cy={22} r={4.5} fill={p.horn} />
      {/* tufo de pelo no topo */}
      <path d="M32 50 q7 -16 14 -2 q7 -16 14 0 q7 -16 14 2 q4 6 -2 10 L34 60 Z" fill={p.body} />
      {/* corpo */}
      <ellipse cx={60} cy={67} rx={33} ry={32} fill={p.body} />
      {/* bracinhos */}
      <ellipse cx={29} cy={74} rx={7} ry={10} fill={p.body} />
      <ellipse cx={91} cy={74} rx={7} ry={10} fill={p.body} />
      {/* barriga */}
      <ellipse cx={60} cy={75} rx={20} ry={19} fill={p.belly} />
      <Cheeks color={p.cheek} />
      <Eyes />
      {/* sorrisão com um dentinho */}
      <path d="M50 74 Q60 84 70 74" fill="none" stroke="#1f2937" strokeWidth={2.6} strokeLinecap="round" />
      <rect x={55} y={75} width={5} height={5} rx={1} fill="#fff" stroke="#1f2937" strokeWidth={1} />
    </g>
  );
}

export function PetCreature({ kind, stage, size = 140, accessory }: {
  kind: PetKind; stage: number; size?: number; accessory?: AccessoryId;
}) {
  const p = PAL[kind];
  const common = { width: size, height: size, viewBox: "0 0 120 120", style: { display: "block" } as const };

  if (stage <= 0) {
    return <svg {...common} aria-hidden>{<Egg p={p} />}</svg>;
  }

  const scale = stage === 1 ? 0.8 : stage === 2 ? 0.95 : 1.08;
  const adult = stage >= 3;
  return (
    <svg {...common} aria-hidden>
      {adult && <Sparkles color={p.horn} />}
      <g transform={`translate(60 66) scale(${scale}) translate(-60 -66)`}>
        {kind === "dragao" ? <Dragon p={p} /> : <Monster p={p} />}
        {adult && <Accessory id={accessory ?? "coroa"} />}
      </g>
    </svg>
  );
}
