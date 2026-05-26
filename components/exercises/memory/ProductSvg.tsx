"use client";

export function ProductSvg({ id, size = 36 }: { id: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {
    // ── Bag shape (arroz, farinha, acucar) ─────────────────────────
    case "arroz":
    case "farinha":
    case "acucar":
      return (
        <svg {...common}>
          {/* Bag body: trapezoid */}
          <path d="M10 14 L8 34 L32 34 L30 14 Z" />
          {/* Tied top arc */}
          <path d="M10 14 Q20 6 30 14" />
          {/* Grains/dots inside */}
          <circle cx="16" cy="22" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="20" cy="25" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="24" cy="22" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="20" cy="19" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );

    // ── Kidney bean shapes (feijao) ─────────────────────────────────
    case "feijao":
      return (
        <svg {...common}>
          {/* Two kidney bean shapes */}
          <path d="M12 15 Q8 18 9 23 Q10 28 15 27 Q20 26 19 21 Q18 16 12 15 Z" />
          <path d="M22 14 Q18 17 19 22 Q20 27 25 26 Q30 25 29 20 Q28 15 22 14 Z" />
        </svg>
      );

    // ── Noodles in bowl (macarrao) ─────────────────────────────────
    case "macarrao":
      return (
        <svg {...common}>
          {/* Bowl arc at bottom */}
          <path d="M8 26 Q20 36 32 26" />
          {/* Bowl sides */}
          <line x1="8" y1="26" x2="8" y2="22" />
          <line x1="32" y1="26" x2="32" y2="22" />
          {/* Wavy noodle lines */}
          <path d="M10 22 Q13 19 16 22 Q19 25 22 22 Q25 19 28 22 Q29 23 30 22" />
          <path d="M11 17 Q14 14 17 17 Q20 20 23 17 Q26 14 29 17" />
          <path d="M12 12 Q15 9 18 12 Q21 15 24 12 Q27 9 28 12" />
        </svg>
      );

    // ── Cylindrical shaker (sal) ─────────────────────────────────
    case "sal":
      return (
        <svg {...common}>
          {/* Shaker body (rounded rect) */}
          <rect x="13" y="12" width="14" height="22" rx="3" />
          {/* Round cap */}
          <ellipse cx="20" cy="12" rx="7" ry="3" />
          {/* Small holes */}
          <circle cx="17" cy="20" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="20" r="1" fill="currentColor" stroke="none" />
          <circle cx="23" cy="20" r="1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="25" r="1" fill="currentColor" stroke="none" />
        </svg>
      );

    // ── Tall bottle (oleo, vinagre) ─────────────────────────────────
    case "oleo":
    case "vinagre":
      return (
        <svg {...common}>
          {/* Narrow neck */}
          <rect x="17" y="6" width="6" height="8" rx="1" />
          {/* Wider body */}
          <rect x="12" y="14" width="16" height="20" rx="3" />
          {/* Cap */}
          <rect x="16" y="4" width="8" height="4" rx="1" />
        </svg>
      );

    // ── Coffee cup (cafe) ────────────────────────────────────────────
    case "cafe":
      return (
        <svg {...common}>
          {/* Steam curls */}
          <path d="M16 8 Q14 5 16 3" strokeWidth="1.5" />
          <path d="M20 8 Q18 5 20 3" strokeWidth="1.5" />
          <path d="M24 8 Q22 5 24 3" strokeWidth="1.5" />
          {/* Cup body (trapezoid) */}
          <path d="M10 12 L12 30 L28 30 L30 12 Z" />
          {/* Handle arc on right side */}
          <path d="M30 17 Q36 17 36 23 Q36 29 30 28" />
          {/* Liquid line */}
          <line x1="13" y1="20" x2="27" y2="20" />
        </svg>
      );

    // ── Milk carton (leite) ────────────────────────────────────────
    case "leite":
      return (
        <svg {...common}>
          {/* Rectangle body */}
          <rect x="11" y="16" width="18" height="18" />
          {/* Pentagon top (folded carton) */}
          <path d="M11 16 L20 6 L29 16" />
          {/* Blue-ish stripe rect in center (just a rect, color via class) */}
          <rect x="13" y="22" width="14" height="6" rx="1" strokeWidth="1" />
        </svg>
      );

    // ── Rectangular block with wrapper lines (manteiga) ───────────
    case "manteiga":
      return (
        <svg {...common}>
          {/* Block */}
          <rect x="8" y="14" width="24" height="14" rx="2" />
          {/* Wrapper lines */}
          <line x1="8" y1="18" x2="32" y2="18" strokeWidth="1.5" />
          <line x1="8" y1="24" x2="32" y2="24" strokeWidth="1.5" />
          {/* Side tabs */}
          <line x1="14" y1="14" x2="14" y2="28" />
          <line x1="26" y1="14" x2="26" y2="28" />
        </svg>
      );

    // ── Bread loaf (pao) ─────────────────────────────────────────────
    case "pao":
      return (
        <svg {...common}>
          {/* Rectangle base */}
          <rect x="8" y="22" width="24" height="12" rx="2" />
          {/* Semicircle top (dome) */}
          <path d="M8 22 Q8 10 20 10 Q32 10 32 22" />
          {/* Score lines */}
          <line x1="15" y1="13" x2="15" y2="22" strokeWidth="1.2" />
          <line x1="25" y1="13" x2="25" y2="22" strokeWidth="1.2" />
        </svg>
      );

    // ── Egg carton (ovos) ────────────────────────────────────────────
    case "ovos":
      return (
        <svg {...common}>
          {/* Carton base */}
          <rect x="6" y="24" width="28" height="8" rx="2" />
          {/* Three egg ovals on top */}
          <ellipse cx="13" cy="22" rx="4" ry="6" />
          <ellipse cx="20" cy="22" rx="4" ry="6" />
          <ellipse cx="27" cy="22" rx="4" ry="6" />
        </svg>
      );

    // ── Cheese wedge (queijo) ────────────────────────────────────────
    case "queijo":
      return (
        <svg {...common}>
          {/* Wedge triangle */}
          <path d="M4 32 L36 32 L36 14 Z" />
          {/* Holes */}
          <circle cx="22" cy="25" r="2.5" />
          <circle cx="30" cy="22" r="2" />
          <circle cx="16" cy="28" r="1.8" />
        </svg>
      );

    // ── Cup with lid (iogurte) ────────────────────────────────────────
    case "iogurte":
      return (
        <svg {...common}>
          {/* Cup body (narrow at bottom, wide at top) */}
          <path d="M13 34 L11 16 L29 16 L27 34 Z" />
          {/* Ellipse lid */}
          <ellipse cx="20" cy="16" rx="9" ry="3" />
          {/* Small tab on lid */}
          <path d="M20 13 Q24 10 26 13" strokeWidth="1.5" />
        </svg>
      );

    // ── Chicken drumstick (frango) ────────────────────────────────────
    case "frango":
      return (
        <svg {...common}>
          {/* Teardrop meat on top */}
          <ellipse cx="20" cy="16" rx="9" ry="11" />
          {/* Rectangle bone at bottom */}
          <rect x="18" y="26" width="4" height="10" rx="1" />
          {/* Bone end knob */}
          <ellipse cx="20" cy="37" rx="3" ry="2" />
        </svg>
      );

    // ── Meat tray (carne) ────────────────────────────────────────────
    case "carne":
      return (
        <svg {...common}>
          {/* Tray rectangle */}
          <rect x="6" y="22" width="28" height="10" rx="3" />
          {/* Oval meat shape inside */}
          <ellipse cx="20" cy="22" rx="10" ry="7" />
          {/* Meat texture lines */}
          <path d="M14 20 Q17 22 14 24" strokeWidth="1.2" />
          <path d="M20 19 Q23 21 20 24" strokeWidth="1.2" />
        </svg>
      );

    // ── Box with label lines (sabao) ─────────────────────────────────
    case "sabao":
      return (
        <svg {...common}>
          {/* Box */}
          <rect x="8" y="10" width="24" height="24" rx="2" />
          {/* Label lines */}
          <line x1="11" y1="19" x2="29" y2="19" />
          <line x1="11" y1="24" x2="29" y2="24" />
          {/* Wavy lines to show powder */}
          <path d="M12 29 Q15 27 18 29 Q21 31 24 29 Q27 27 28 29" strokeWidth="1.2" />
        </svg>
      );

    // ── Toilet roll (papel) ─────────────────────────────────────────
    case "papel":
      return (
        <svg {...common}>
          {/* Outer ellipses top and bottom */}
          <ellipse cx="20" cy="10" rx="10" ry="4" />
          <ellipse cx="20" cy="32" rx="10" ry="4" />
          {/* Vertical side lines */}
          <line x1="10" y1="10" x2="10" y2="32" />
          <line x1="30" y1="10" x2="30" y2="32" />
          {/* Inner hole ellipse */}
          <ellipse cx="20" cy="10" rx="4" ry="2" />
          <ellipse cx="20" cy="32" rx="4" ry="2" />
          {/* Center hole cylinder hint */}
          <line x1="16" y1="10" x2="16" y2="32" strokeWidth="0.8" />
          <line x1="24" y1="10" x2="24" y2="32" strokeWidth="0.8" />
        </svg>
      );

    // ── Squeeze bottle (shampoo, detergente, agua-san) ────────────
    case "shampoo":
    case "detergente":
    case "agua-san":
      return (
        <svg {...common}>
          {/* Cap (small rect at top) */}
          <rect x="17" y="4" width="6" height="5" rx="1" />
          {/* Narrow neck */}
          <rect x="16" y="9" width="8" height="5" rx="1" />
          {/* Wider body */}
          <path d="M12 14 Q11 34 20 35 Q29 34 28 14 Z" />
        </svg>
      );

    // ── Toothpaste tube (pasta) ──────────────────────────────────────
    case "pasta":
      return (
        <svg {...common}>
          {/* Horizontal tube body */}
          <rect x="6" y="16" width="22" height="10" rx="3" />
          {/* Cap on right end */}
          <rect x="28" y="14" width="6" height="14" rx="2" />
          {/* Crimp/fold lines on left end */}
          <line x1="6" y1="19" x2="10" y2="19" strokeWidth="1.5" />
          <line x1="6" y1="22" x2="10" y2="22" strokeWidth="1.5" />
          <line x1="6" y1="25" x2="10" y2="25" strokeWidth="1.5" />
        </svg>
      );

    // ── Bar of soap (sabonete) ────────────────────────────────────────
    case "sabonete":
      return (
        <svg {...common}>
          {/* Rectangle with rounded corners */}
          <rect x="8" y="14" width="24" height="14" rx="5" />
          {/* Oval emboss in center */}
          <ellipse cx="20" cy="21" rx="7" ry="4" />
        </svg>
      );

    // ── Rectangular block with holes (esponja) ───────────────────────
    case "esponja":
      return (
        <svg {...common}>
          {/* Block */}
          <rect x="6" y="12" width="28" height="18" rx="3" />
          {/* Many small circles (holes) */}
          <circle cx="12" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
          <circle cx="24" cy="18" r="1.5" />
          <circle cx="30" cy="18" r="1.5" />
          <circle cx="12" cy="24" r="1.5" />
          <circle cx="18" cy="24" r="1.5" />
          <circle cx="24" cy="24" r="1.5" />
          <circle cx="30" cy="24" r="1.5" />
          <circle cx="15" cy="21" r="1.5" />
          <circle cx="21" cy="21" r="1.5" />
          <circle cx="27" cy="21" r="1.5" />
        </svg>
      );

    // ── Tied trash bag (saco-lixo) ───────────────────────────────────
    case "saco-lixo":
      return (
        <svg {...common}>
          {/* Oval body */}
          <path d="M8 20 Q8 36 20 36 Q32 36 32 20 Q32 12 24 10 Q22 8 20 8 Q18 8 16 10 Q8 12 8 20 Z" />
          {/* Tied knot at top */}
          <path d="M16 10 Q20 6 24 10" />
          <path d="M18 7 Q20 4 22 7" />
        </svg>
      );

    // ── Water bottle (agua) ──────────────────────────────────────────
    case "agua":
      return (
        <svg {...common}>
          {/* Narrow cap */}
          <rect x="17" y="4" width="6" height="5" rx="1" />
          {/* Cylindrical body */}
          <rect x="12" y="9" width="16" height="26" rx="4" />
          {/* Horizontal wave line inside */}
          <path d="M14 24 Q17 21 20 24 Q23 27 26 24" strokeWidth="1.5" />
        </svg>
      );

    // ── Juice box (suco) ─────────────────────────────────────────────
    case "suco":
      return (
        <svg {...common}>
          {/* Box shape */}
          <rect x="10" y="12" width="20" height="22" rx="2" />
          {/* Straw */}
          <line x1="26" y1="12" x2="30" y2="4" strokeWidth="2" />
          {/* Label line */}
          <line x1="12" y1="22" x2="28" y2="22" />
          {/* Fruit circle on label */}
          <circle cx="20" cy="18" r="3" />
        </svg>
      );

    // ── Soda can (refrigerante) ──────────────────────────────────────
    case "refrigerante":
      return (
        <svg {...common}>
          {/* Can body */}
          <rect x="12" y="10" width="16" height="24" rx="3" />
          {/* Top ellipse */}
          <ellipse cx="20" cy="10" rx="8" ry="3" />
          {/* Bottom ellipse */}
          <ellipse cx="20" cy="34" rx="8" ry="3" />
          {/* Pull tab ring */}
          <path d="M18 8 Q20 4 22 8" strokeWidth="1.5" />
          <circle cx="20" cy="7" r="1.5" />
          {/* Horizontal label line */}
          <line x1="12" y1="20" x2="28" y2="20" strokeWidth="1" />
        </svg>
      );

    // ── Banana (curved shape) ─────────────────────────────────────────
    case "banana":
      return (
        <svg {...common}>
          {/* Main banana arc */}
          <path d="M8 30 Q10 10 28 8" strokeWidth="3" />
          {/* Tip curve */}
          <path d="M28 8 Q34 8 34 14" />
          {/* Bottom end */}
          <path d="M8 30 Q6 34 10 36" />
        </svg>
      );

    // ── Apple (maca) ───────────────────────────────────────────────────
    case "maca":
      return (
        <svg {...common}>
          {/* Circle body */}
          <circle cx="20" cy="22" r="13" />
          {/* Stem at top */}
          <line x1="20" y1="9" x2="20" y2="5" />
          {/* Small leaf */}
          <path d="M20 6 Q25 4 26 8" />
          {/* Center dent at top */}
          <path d="M16 11 Q20 9 24 11" strokeWidth="1" />
        </svg>
      );

    // ── Tomato (tomate) ─────────────────────────────────────────────
    case "tomate":
      return (
        <svg {...common}>
          {/* Round body */}
          <circle cx="20" cy="22" r="13" />
          {/* Stem top */}
          <line x1="20" y1="9" x2="20" y2="5" />
          {/* Leaf crown */}
          <path d="M14 11 Q17 7 20 9 Q23 7 26 11" />
          {/* Equator line */}
          <path d="M8 22 Q14 18 20 22 Q26 26 32 22" strokeWidth="1.2" />
        </svg>
      );

    // ── Head of lettuce (alface) ─────────────────────────────────────
    case "alface":
      return (
        <svg {...common}>
          {/* Round head with scalloped/wavy edges */}
          <path d="M20 8 Q26 6 30 10 Q36 14 34 20 Q36 26 30 30 Q26 34 20 34 Q14 34 10 30 Q4 26 6 20 Q4 14 10 10 Q14 6 20 8 Z" />
          {/* Inner wavy ring to show leaves */}
          <path d="M20 12 Q24 10 27 14 Q30 18 27 22 Q24 26 20 26 Q16 26 13 22 Q10 18 13 14 Q16 10 20 12 Z" strokeWidth="1.2" />
        </svg>
      );

    // ── Potato blob (batata) ──────────────────────────────────────────
    case "batata":
      return (
        <svg {...common}>
          {/* Irregular blob shape */}
          <path d="M10 18 Q8 10 14 8 Q20 6 26 10 Q32 12 32 20 Q34 28 28 32 Q22 36 16 32 Q8 28 10 18 Z" />
          {/* Eye dots */}
          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="24" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="26" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );

    // ── Carrot (cenoura) ─────────────────────────────────────────────
    case "cenoura":
      return (
        <svg {...common}>
          {/* Tapered body pointing down */}
          <path d="M14 10 L26 10 L22 34 L18 34 Z" />
          {/* Three leaf stems at top */}
          <path d="M17 10 Q14 4 12 6" />
          <path d="M20 10 Q20 3 20 3" />
          <path d="M23 10 Q26 4 28 6" />
          {/* Horizontal lines on body */}
          <line x1="15" y1="18" x2="25" y2="18" strokeWidth="1" />
          <line x1="16" y1="24" x2="24" y2="24" strokeWidth="1" />
        </svg>
      );

    // ── Default fallback ──────────────────────────────────────────────
    default: {
      const label = id.slice(0, 3).toUpperCase();
      return (
        <svg {...common}>
          <rect x="6" y="6" width="28" height="28" rx="4" />
          <text
            x="20"
            y="24"
            fontSize="9"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
            fontWeight="bold"
          >
            {label}
          </text>
        </svg>
      );
    }
  }
}
