"use client";

export const MEMORY_ITEMS: Array<{ id: string; label: string }> = [
  { id: "sol",         label: "Sol" },
  { id: "casa",        label: "Casa" },
  { id: "arvore",      label: "Árvore" },
  { id: "estrela",     label: "Estrela" },
  { id: "peixe",       label: "Peixe" },
  { id: "flor",        label: "Flor" },
  { id: "gato",        label: "Gato" },
  { id: "borboleta",   label: "Borboleta" },
  { id: "bicicleta",   label: "Bicicleta" },
  { id: "chave",       label: "Chave" },
  { id: "guarda-chuva", label: "Guarda-chuva" },
  { id: "livro",       label: "Livro" },
  { id: "foguete",     label: "Foguete" },
  { id: "coracao",     label: "Coração" },
  { id: "passaro",     label: "Pássaro" },
  { id: "carro",       label: "Carro" },
  { id: "relogio",     label: "Relógio" },
  { id: "chapeu",      label: "Chapéu" },
];

export function MemorySymbol({ id, size = 36 }: { id: string; size?: number }): JSX.Element {
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
    // 1. Sol — circle center + 8 rays
    case "sol":
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="7" />
          {/* 8 radiating lines */}
          <line x1="20" y1="6" x2="20" y2="3" strokeWidth="2.5" />
          <line x1="20" y1="34" x2="20" y2="37" strokeWidth="2.5" />
          <line x1="6" y1="20" x2="3" y2="20" strokeWidth="2.5" />
          <line x1="34" y1="20" x2="37" y2="20" strokeWidth="2.5" />
          <line x1="10" y1="10" x2="8" y2="8" strokeWidth="2.5" />
          <line x1="30" y1="30" x2="32" y2="32" strokeWidth="2.5" />
          <line x1="30" y1="10" x2="32" y2="8" strokeWidth="2.5" />
          <line x1="10" y1="30" x2="8" y2="32" strokeWidth="2.5" />
        </svg>
      );

    // 2. Casa — triangle roof + rectangle body + door + window
    case "casa":
      return (
        <svg {...common}>
          {/* Roof triangle */}
          <path d="M20 6 L34 20 L6 20 Z" />
          {/* Body */}
          <rect x="10" y="20" width="20" height="16" />
          {/* Door */}
          <rect x="17" y="28" width="6" height="8" />
          {/* Window */}
          <rect x="11" y="23" width="6" height="5" />
          <line x1="14" y1="23" x2="14" y2="28" strokeWidth="1" />
          <line x1="11" y1="25.5" x2="17" y2="25.5" strokeWidth="1" />
        </svg>
      );

    // 3. Árvore — rounded triangle on trunk
    case "arvore":
      return (
        <svg {...common}>
          {/* Tree crown (rounded triangle) */}
          <path d="M20 5 Q28 8 30 18 Q32 26 20 28 Q8 26 10 18 Q12 8 20 5 Z" />
          {/* Trunk */}
          <rect x="17" y="28" width="6" height="8" />
        </svg>
      );

    // 4. Estrela — 5-pointed star
    case "estrela":
      return (
        <svg {...common}>
          <path d="M20 4 L23.5 15 L35 15 L26 22 L29.5 33 L20 27 L10.5 33 L14 22 L5 15 L16.5 15 Z" />
        </svg>
      );

    // 5. Peixe — oval body + tail triangle + eye + mouth
    case "peixe":
      return (
        <svg {...common}>
          {/* Body */}
          <ellipse cx="18" cy="20" rx="11" ry="7" />
          {/* Tail */}
          <path d="M29 20 L36 14 L36 26 Z" />
          {/* Eye */}
          <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
          {/* Mouth */}
          <path d="M8 21 Q10 24 12 21" strokeWidth="1.5" />
          {/* Fin */}
          <path d="M16 13 Q20 10 22 14" strokeWidth="1.5" />
        </svg>
      );

    // 6. Flor — 6 petal ovals around center circle
    case "flor":
      return (
        <svg {...common}>
          {/* Center */}
          <circle cx="20" cy="20" r="4" />
          {/* 6 petals (ellipses rotated around center) */}
          <ellipse cx="20" cy="10" rx="3" ry="6" />
          <ellipse cx="20" cy="30" rx="3" ry="6" />
          <ellipse cx="11" cy="15" rx="3" ry="6" transform="rotate(-60 11 15)" />
          <ellipse cx="29" cy="15" rx="3" ry="6" transform="rotate(60 29 15)" />
          <ellipse cx="11" cy="25" rx="3" ry="6" transform="rotate(60 11 25)" />
          <ellipse cx="29" cy="25" rx="3" ry="6" transform="rotate(-60 29 25)" />
        </svg>
      );

    // 7. Gato — circle head + pointed ears + whiskers + nose/mouth
    case "gato":
      return (
        <svg {...common}>
          {/* Head */}
          <circle cx="20" cy="22" r="13" />
          {/* Left ear */}
          <path d="M10 14 L8 6 L16 11 Z" />
          {/* Right ear */}
          <path d="M30 14 L32 6 L24 11 Z" />
          {/* Eyes */}
          <circle cx="15" cy="20" r="2" fill="currentColor" stroke="none" />
          <circle cx="25" cy="20" r="2" fill="currentColor" stroke="none" />
          {/* Nose */}
          <path d="M19 25 L20 24 L21 25 L20 27 Z" fill="currentColor" stroke="none" />
          {/* Mouth */}
          <path d="M16 27 Q20 30 24 27" strokeWidth="1.5" />
          {/* Whiskers left */}
          <line x1="8" y1="23" x2="15" y2="24" strokeWidth="1" />
          <line x1="8" y1="26" x2="15" y2="26" strokeWidth="1" />
          {/* Whiskers right */}
          <line x1="32" y1="23" x2="25" y2="24" strokeWidth="1" />
          <line x1="32" y1="26" x2="25" y2="26" strokeWidth="1" />
        </svg>
      );

    // 8. Borboleta — 4 rounded wing lobes + body line
    case "borboleta":
      return (
        <svg {...common}>
          {/* Body line */}
          <line x1="20" y1="8" x2="20" y2="32" strokeWidth="2.5" />
          {/* Upper left wing */}
          <path d="M20 14 Q8 6 6 16 Q6 22 20 20 Z" />
          {/* Upper right wing */}
          <path d="M20 14 Q32 6 34 16 Q34 22 20 20 Z" />
          {/* Lower left wing */}
          <path d="M20 22 Q8 20 6 28 Q8 34 20 28 Z" />
          {/* Lower right wing */}
          <path d="M20 22 Q32 20 34 28 Q32 34 20 28 Z" />
          {/* Antennae */}
          <path d="M20 8 Q16 4 14 3" strokeWidth="1.5" />
          <path d="M20 8 Q24 4 26 3" strokeWidth="1.5" />
          <circle cx="14" cy="3" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="26" cy="3" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );

    // 9. Bicicleta — two wheel circles + frame triangle + handlebars
    case "bicicleta":
      return (
        <svg {...common}>
          {/* Left wheel */}
          <circle cx="10" cy="28" r="8" />
          {/* Right wheel */}
          <circle cx="30" cy="28" r="8" />
          {/* Frame triangle */}
          <line x1="10" y1="28" x2="18" y2="14" />
          <line x1="30" y1="28" x2="18" y2="14" />
          <line x1="18" y1="14" x2="20" y2="28" />
          {/* Seat */}
          <line x1="16" y1="14" x2="20" y2="14" />
          {/* Handlebars */}
          <line x1="30" y1="28" x2="28" y2="14" />
          <line x1="26" y1="12" x2="30" y2="12" />
        </svg>
      );

    // 10. Chave — oval head with hole + rectangular shaft + notches
    case "chave":
      return (
        <svg {...common}>
          {/* Key head (oval) */}
          <circle cx="12" cy="16" r="8" />
          {/* Hole in head */}
          <circle cx="12" cy="16" r="3" />
          {/* Shaft */}
          <line x1="20" y1="16" x2="36" y2="16" strokeWidth="3" />
          {/* Notches */}
          <line x1="26" y1="16" x2="26" y2="20" strokeWidth="2" />
          <line x1="30" y1="16" x2="30" y2="21" strokeWidth="2" />
          <line x1="33" y1="16" x2="33" y2="19" strokeWidth="2" />
        </svg>
      );

    // 11. Guarda-chuva — semicircle canopy + vertical handle with hook
    case "guarda-chuva":
      return (
        <svg {...common}>
          {/* Semicircle canopy */}
          <path d="M4 20 Q4 6 20 6 Q36 6 36 20 Z" />
          {/* Canopy scalloped bottom */}
          <path d="M4 20 Q7 24 10 20 Q13 24 16 20 Q19 24 22 20 Q25 24 28 20 Q31 24 34 20 Q36 20 36 20" strokeWidth="1.2" />
          {/* Vertical handle */}
          <line x1="20" y1="20" x2="20" y2="34" />
          {/* Hook at bottom */}
          <path d="M20 34 Q20 38 16 38" />
        </svg>
      );

    // 12. Livro — open book with spine + text lines
    case "livro":
      return (
        <svg {...common}>
          {/* Left page */}
          <path d="M4 10 L4 34 L20 32 L20 8 Z" />
          {/* Right page */}
          <path d="M36 10 L36 34 L20 32 L20 8 Z" />
          {/* Spine line */}
          <line x1="20" y1="8" x2="20" y2="32" />
          {/* Text lines left page */}
          <line x1="8" y1="16" x2="18" y2="15" strokeWidth="1" />
          <line x1="8" y1="20" x2="18" y2="19" strokeWidth="1" />
          <line x1="8" y1="24" x2="18" y2="23" strokeWidth="1" />
          <line x1="8" y1="28" x2="16" y2="27" strokeWidth="1" />
          {/* Text lines right page */}
          <line x1="22" y1="15" x2="32" y2="16" strokeWidth="1" />
          <line x1="22" y1="19" x2="32" y2="20" strokeWidth="1" />
          <line x1="22" y1="23" x2="32" y2="24" strokeWidth="1" />
          <line x1="22" y1="27" x2="30" y2="28" strokeWidth="1" />
        </svg>
      );

    // 13. Foguete — teardrop body + fins + flame + window circle
    case "foguete":
      return (
        <svg {...common}>
          {/* Rocket body */}
          <path d="M20 4 Q28 8 28 24 L20 28 L12 24 Q12 8 20 4 Z" />
          {/* Window circle */}
          <circle cx="20" cy="16" r="3" />
          {/* Left fin */}
          <path d="M12 24 L6 30 L12 28 Z" />
          {/* Right fin */}
          <path d="M28 24 L34 30 L28 28 Z" />
          {/* Flame */}
          <path d="M16 28 Q18 34 20 36 Q22 34 24 28" strokeWidth="1.5" />
        </svg>
      );

    // 14. Coração — heart shape
    case "coracao":
      return (
        <svg {...common}>
          <path d="M20 34 Q6 26 6 16 Q6 8 13 8 Q17 8 20 12 Q23 8 27 8 Q34 8 34 16 Q34 26 20 34 Z" />
        </svg>
      );

    // 15. Pássaro — simple bird silhouette
    case "passaro":
      return (
        <svg {...common}>
          {/* Body curve */}
          <path d="M8 24 Q14 20 20 22 Q26 24 32 20 Q28 16 24 20 Q22 14 20 20 Q18 14 16 20 Q12 16 8 24 Z" />
          {/* Wing arc */}
          <path d="M10 20 Q16 14 22 18" strokeWidth="1.5" />
          {/* Beak */}
          <path d="M8 24 L4 22" strokeWidth="2" />
          {/* Eye */}
          <circle cx="10" cy="22" r="1.2" fill="currentColor" stroke="none" />
          {/* Tail */}
          <path d="M32 20 L36 16 M32 20 L36 22" strokeWidth="1.5" />
        </svg>
      );

    // 16. Carro — car profile with 2 windows + 2 wheels
    case "carro":
      return (
        <svg {...common}>
          {/* Car body */}
          <rect x="4" y="20" width="32" height="12" rx="3" />
          {/* Car roof */}
          <path d="M10 20 L14 12 L26 12 L30 20" />
          {/* Windows */}
          <rect x="14" y="13" width="5" height="7" rx="1" />
          <rect x="21" y="13" width="5" height="7" rx="1" />
          {/* Left wheel */}
          <circle cx="11" cy="32" r="5" />
          {/* Right wheel */}
          <circle cx="29" cy="32" r="5" />
          {/* Wheel hubs */}
          <circle cx="11" cy="32" r="2" />
          <circle cx="29" cy="32" r="2" />
        </svg>
      );

    // 17. Relógio — circle face + clock hands + tick marks
    case "relogio":
      return (
        <svg {...common}>
          {/* Clock face */}
          <circle cx="20" cy="20" r="16" />
          {/* Hour hand (pointing to ~10) */}
          <line x1="20" y1="20" x2="13" y2="12" strokeWidth="2.5" />
          {/* Minute hand (pointing to ~2) */}
          <line x1="20" y1="20" x2="27" y2="10" strokeWidth="1.5" />
          {/* Center dot */}
          <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
          {/* Tick marks 12/3/6/9 */}
          <line x1="20" y1="5" x2="20" y2="8" strokeWidth="2" />
          <line x1="35" y1="20" x2="32" y2="20" strokeWidth="2" />
          <line x1="20" y1="35" x2="20" y2="32" strokeWidth="2" />
          <line x1="5" y1="20" x2="8" y2="20" strokeWidth="2" />
        </svg>
      );

    // 18. Chapéu — wide brim ellipse + rounded top
    case "chapeu":
      return (
        <svg {...common}>
          {/* Wide brim */}
          <ellipse cx="20" cy="28" rx="16" ry="5" />
          {/* Hat top (rounded shape) */}
          <path d="M10 28 Q10 10 20 10 Q30 10 30 28" />
          {/* Brim line detail */}
          <path d="M6 28 Q12 32 20 32 Q28 32 34 28" strokeWidth="1" />
          {/* Hat band */}
          <line x1="10" y1="24" x2="30" y2="24" strokeWidth="1.5" />
        </svg>
      );

    // Default fallback
    default:
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
            {id.slice(0, 3).toUpperCase()}
          </text>
        </svg>
      );
  }
}
