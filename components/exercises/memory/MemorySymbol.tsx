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
  const base = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {
    case "sol":
      return (
        <svg {...base} fill="none" stroke="#F59E0B" strokeWidth={2}>
          <circle cx="20" cy="20" r="7" fill="#FDE68A" />
          <line x1="20" y1="6"  x2="20" y2="3"  strokeWidth="2.5" />
          <line x1="20" y1="34" x2="20" y2="37" strokeWidth="2.5" />
          <line x1="6"  y1="20" x2="3"  y2="20" strokeWidth="2.5" />
          <line x1="34" y1="20" x2="37" y2="20" strokeWidth="2.5" />
          <line x1="10" y1="10" x2="8"  y2="8"  strokeWidth="2.5" />
          <line x1="30" y1="30" x2="32" y2="32" strokeWidth="2.5" />
          <line x1="30" y1="10" x2="32" y2="8"  strokeWidth="2.5" />
          <line x1="10" y1="30" x2="8"  y2="32" strokeWidth="2.5" />
        </svg>
      );

    case "casa":
      return (
        <svg {...base} fill="none" stroke="#DC2626" strokeWidth={2}>
          <path d="M20 6 L34 20 L6 20 Z" fill="#FCA5A5" />
          <rect x="10" y="20" width="20" height="16" fill="#FEF2F2" />
          <rect x="17" y="28" width="6" height="8" fill="#FBBF24" />
          <rect x="11" y="23" width="6" height="5" fill="#BAE6FD" />
          <line x1="14" y1="23" x2="14" y2="28" strokeWidth="1" />
          <line x1="11" y1="25.5" x2="17" y2="25.5" strokeWidth="1" />
        </svg>
      );

    case "arvore":
      return (
        <svg {...base} fill="none" stroke="#16A34A" strokeWidth={2}>
          <path d="M20 5 Q28 8 30 18 Q32 26 20 28 Q8 26 10 18 Q12 8 20 5 Z" fill="#86EFAC" />
          <rect x="17" y="28" width="6" height="8" fill="#92400E" stroke="#92400E" />
        </svg>
      );

    case "estrela":
      return (
        <svg {...base} fill="none" stroke="#D97706" strokeWidth={2}>
          <path d="M20 4 L23.5 15 L35 15 L26 22 L29.5 33 L20 27 L10.5 33 L14 22 L5 15 L16.5 15 Z" fill="#FCD34D" />
        </svg>
      );

    case "peixe":
      return (
        <svg {...base} fill="none" stroke="#2563EB" strokeWidth={2}>
          <ellipse cx="18" cy="20" rx="11" ry="7" fill="#93C5FD" />
          <path d="M29 20 L36 14 L36 26 Z" fill="#BFDBFE" />
          <circle cx="12" cy="18" r="1.5" fill="#1E3A8A" stroke="none" />
          <path d="M8 21 Q10 24 12 21" strokeWidth="1.5" />
          <path d="M16 13 Q20 10 22 14" strokeWidth="1.5" />
        </svg>
      );

    case "flor":
      return (
        <svg {...base} fill="none" stroke="#DB2777" strokeWidth={2}>
          <ellipse cx="20" cy="10" rx="3" ry="6" fill="#FBCFE8" />
          <ellipse cx="20" cy="30" rx="3" ry="6" fill="#FBCFE8" />
          <ellipse cx="11" cy="15" rx="3" ry="6" transform="rotate(-60 11 15)" fill="#FBCFE8" />
          <ellipse cx="29" cy="15" rx="3" ry="6" transform="rotate(60 29 15)" fill="#FBCFE8" />
          <ellipse cx="11" cy="25" rx="3" ry="6" transform="rotate(60 11 25)" fill="#FBCFE8" />
          <ellipse cx="29" cy="25" rx="3" ry="6" transform="rotate(-60 29 25)" fill="#FBCFE8" />
          <circle cx="20" cy="20" r="4" fill="#FDE047" stroke="#CA8A04" />
        </svg>
      );

    case "gato":
      return (
        <svg {...base} fill="none" stroke="#78716C" strokeWidth={2}>
          <circle cx="20" cy="22" r="13" fill="#E7E5E4" />
          <path d="M10 14 L8 6 L16 11 Z" fill="#D6D3D1" />
          <path d="M30 14 L32 6 L24 11 Z" fill="#D6D3D1" />
          <circle cx="15" cy="20" r="2" fill="#059669" stroke="none" />
          <circle cx="25" cy="20" r="2" fill="#059669" stroke="none" />
          <path d="M19 25 L20 24 L21 25 L20 27 Z" fill="#F43F5E" stroke="none" />
          <path d="M16 27 Q20 30 24 27" strokeWidth="1.5" />
          <line x1="8"  y1="23" x2="15" y2="24" strokeWidth="1" />
          <line x1="8"  y1="26" x2="15" y2="26" strokeWidth="1" />
          <line x1="32" y1="23" x2="25" y2="24" strokeWidth="1" />
          <line x1="32" y1="26" x2="25" y2="26" strokeWidth="1" />
        </svg>
      );

    case "borboleta":
      return (
        <svg {...base} fill="none" stroke="#7C3AED" strokeWidth={2}>
          <path d="M20 14 Q8 6 6 16 Q6 22 20 20 Z"  fill="#C4B5FD" />
          <path d="M20 14 Q32 6 34 16 Q34 22 20 20 Z" fill="#A78BFA" />
          <path d="M20 22 Q8 20 6 28 Q8 34 20 28 Z"  fill="#DDD6FE" />
          <path d="M20 22 Q32 20 34 28 Q32 34 20 28 Z" fill="#C4B5FD" />
          <line x1="20" y1="8" x2="20" y2="32" strokeWidth="2.5" stroke="#4C1D95" />
          <path d="M20 8 Q16 4 14 3" strokeWidth="1.5" />
          <path d="M20 8 Q24 4 26 3" strokeWidth="1.5" />
          <circle cx="14" cy="3" r="1.5" fill="#7C3AED" stroke="none" />
          <circle cx="26" cy="3" r="1.5" fill="#7C3AED" stroke="none" />
        </svg>
      );

    case "bicicleta":
      return (
        <svg {...base} fill="none" stroke="#0369A1" strokeWidth={2}>
          <circle cx="10" cy="28" r="8" stroke="#0284C7" />
          <circle cx="30" cy="28" r="8" stroke="#0284C7" />
          <circle cx="10" cy="28" r="3" fill="#BAE6FD" stroke="#0284C7" />
          <circle cx="30" cy="28" r="3" fill="#BAE6FD" stroke="#0284C7" />
          <line x1="10" y1="28" x2="18" y2="14" stroke="#EA580C" />
          <line x1="30" y1="28" x2="18" y2="14" stroke="#EA580C" />
          <line x1="18" y1="14" x2="20" y2="28" stroke="#EA580C" />
          <line x1="16" y1="14" x2="20" y2="14" stroke="#374151" strokeWidth="2.5" />
          <line x1="30" y1="28" x2="28" y2="14" stroke="#EA580C" />
          <line x1="26" y1="12" x2="30" y2="12" stroke="#374151" strokeWidth="2.5" />
        </svg>
      );

    case "chave":
      return (
        <svg {...base} fill="none" stroke="#B45309" strokeWidth={2}>
          <circle cx="12" cy="16" r="8" fill="#FDE68A" />
          <circle cx="12" cy="16" r="3" fill="white" />
          <line x1="20" y1="16" x2="36" y2="16" strokeWidth="3" stroke="#D97706" />
          <line x1="26" y1="16" x2="26" y2="20" strokeWidth="2" />
          <line x1="30" y1="16" x2="30" y2="21" strokeWidth="2" />
          <line x1="33" y1="16" x2="33" y2="19" strokeWidth="2" />
        </svg>
      );

    case "guarda-chuva":
      return (
        <svg {...base} fill="none" stroke="#1D4ED8" strokeWidth={2}>
          <path d="M4 20 Q4 6 20 6 Q36 6 36 20 Z" fill="#93C5FD" />
          <path d="M4 20 Q7 24 10 20 Q13 24 16 20 Q19 24 22 20 Q25 24 28 20 Q31 24 34 20 Q36 20 36 20" strokeWidth="1.2" stroke="#2563EB" />
          <line x1="20" y1="20" x2="20" y2="34" stroke="#1E40AF" strokeWidth="2.5" />
          <path d="M20 34 Q20 38 16 38" stroke="#1E40AF" />
        </svg>
      );

    case "livro":
      return (
        <svg {...base} fill="none" stroke="#B91C1C" strokeWidth={2}>
          <path d="M4 10 L4 34 L20 32 L20 8 Z" fill="#FECACA" />
          <path d="M36 10 L36 34 L20 32 L20 8 Z" fill="#FEE2E2" />
          <line x1="20" y1="8"  x2="20" y2="32" stroke="#991B1B" strokeWidth="2" />
          <line x1="8"  y1="16" x2="18" y2="15" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="8"  y1="20" x2="18" y2="19" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="8"  y1="24" x2="18" y2="23" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="8"  y1="28" x2="16" y2="27" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="22" y1="15" x2="32" y2="16" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="22" y1="19" x2="32" y2="20" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="22" y1="23" x2="32" y2="24" strokeWidth="1" stroke="#9CA3AF" />
          <line x1="22" y1="27" x2="30" y2="28" strokeWidth="1" stroke="#9CA3AF" />
        </svg>
      );

    case "foguete":
      return (
        <svg {...base} fill="none" stroke="#6D28D9" strokeWidth={2}>
          <path d="M20 4 Q28 8 28 24 L20 28 L12 24 Q12 8 20 4 Z" fill="#C4B5FD" />
          <circle cx="20" cy="16" r="3" fill="#BAE6FD" stroke="#2563EB" />
          <path d="M12 24 L6 30 L12 28 Z"  fill="#F87171" stroke="#DC2626" />
          <path d="M28 24 L34 30 L28 28 Z" fill="#F87171" stroke="#DC2626" />
          <path d="M16 28 Q18 34 20 36 Q22 34 24 28" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );

    case "coracao":
      return (
        <svg {...base} fill="none" stroke="#E11D48" strokeWidth={2}>
          <path d="M20 34 Q6 26 6 16 Q6 8 13 8 Q17 8 20 12 Q23 8 27 8 Q34 8 34 16 Q34 26 20 34 Z" fill="#FDA4AF" />
        </svg>
      );

    case "passaro":
      return (
        <svg {...base} fill="none" stroke="#0369A1" strokeWidth={2}>
          <path d="M8 24 Q14 20 20 22 Q26 24 32 20 Q28 16 24 20 Q22 14 20 20 Q18 14 16 20 Q12 16 8 24 Z" fill="#7DD3FC" />
          <path d="M10 20 Q16 14 22 18" strokeWidth="1.5" />
          <path d="M8 24 L4 22" strokeWidth="2" stroke="#F59E0B" />
          <circle cx="10" cy="22" r="1.2" fill="#1E3A8A" stroke="none" />
          <path d="M32 20 L36 16 M32 20 L36 22" strokeWidth="1.5" />
        </svg>
      );

    case "carro":
      return (
        <svg {...base} fill="none" stroke="#1F2937" strokeWidth={2}>
          <rect x="4" y="20" width="32" height="12" rx="3" fill="#60A5FA" />
          <path d="M10 20 L14 12 L26 12 L30 20" fill="#93C5FD" />
          <rect x="14" y="13" width="5" height="7" rx="1" fill="#E0F2FE" stroke="#7DD3FC" />
          <rect x="21" y="13" width="5" height="7" rx="1" fill="#E0F2FE" stroke="#7DD3FC" />
          <circle cx="11" cy="32" r="5" fill="#374151" stroke="#111827" />
          <circle cx="29" cy="32" r="5" fill="#374151" stroke="#111827" />
          <circle cx="11" cy="32" r="2" fill="#9CA3AF" stroke="none" />
          <circle cx="29" cy="32" r="2" fill="#9CA3AF" stroke="none" />
        </svg>
      );

    case "relogio":
      return (
        <svg {...base} fill="none" stroke="#374151" strokeWidth={2}>
          <circle cx="20" cy="20" r="16" fill="#F3F4F6" stroke="#6B7280" />
          <line x1="20" y1="5"  x2="20" y2="8"  strokeWidth="2" />
          <line x1="35" y1="20" x2="32" y2="20" strokeWidth="2" />
          <line x1="20" y1="35" x2="20" y2="32" strokeWidth="2" />
          <line x1="5"  y1="20" x2="8"  y2="20" strokeWidth="2" />
          <line x1="20" y1="20" x2="13" y2="12" strokeWidth="2.5" stroke="#111827" />
          <line x1="20" y1="20" x2="27" y2="10" strokeWidth="1.5" stroke="#374151" />
          <circle cx="20" cy="20" r="2" fill="#EF4444" stroke="none" />
        </svg>
      );

    case "chapeu":
      return (
        <svg {...base} fill="none" stroke="#92400E" strokeWidth={2}>
          <ellipse cx="20" cy="28" rx="16" ry="5" fill="#D97706" />
          <path d="M10 28 Q10 10 20 10 Q30 10 30 28" fill="#FBBF24" />
          <path d="M6 28 Q12 32 20 32 Q28 32 34 28" strokeWidth="1" />
          <line x1="10" y1="24" x2="30" y2="24" strokeWidth="2" stroke="#92400E" />
        </svg>
      );

    default:
      return (
        <svg {...base} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="6" y="6" width="28" height="28" rx="4" />
          <text
            x="20" y="24" fontSize="9" textAnchor="middle"
            fill="currentColor" stroke="none" fontWeight="bold"
          >
            {id.slice(0, 3).toUpperCase()}
          </text>
        </svg>
      );
  }
}
