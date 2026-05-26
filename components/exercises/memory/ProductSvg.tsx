"use client";

export function ProductSvg({ id, size = 36 }: { id: string; size?: number }) {
  const s = size;
  switch (id) {

    // ─── PÃO ─────────────────────────────────────────────────────────────────
    case "pao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Base */}
          <path d="M6 25 Q6 34 20 34 Q34 34 34 25Z" fill="#A0522D"/>
          {/* Dome */}
          <path d="M6 25 Q6 11 20 11 Q34 11 34 25Z" fill="#D2895A"/>
          {/* Crust top highlight */}
          <path d="M7 21 Q8 13 20 12 Q32 13 33 21" fill="none" stroke="#E8A870" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Score marks */}
          <line x1="14" y1="13" x2="13.5" y2="22" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="20" y1="11" x2="19.5" y2="21" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="26" y1="13" x2="25.5" y2="22" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── LEITE ───────────────────────────────────────────────────────────────
    case "leite":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Carton body */}
          <rect x="10" y="16" width="20" height="20" rx="1" fill="#EEF2FF"/>
          <rect x="10" y="16" width="20" height="20" rx="1" fill="none" stroke="#C0C8E8" strokeWidth="1"/>
          {/* Blue label band */}
          <rect x="10" y="20" width="20" height="9" fill="#1565C0"/>
          {/* White "LEITE" area */}
          <rect x="12" y="22" width="16" height="5" rx="1" fill="rgba(255,255,255,0.3)"/>
          {/* Gable (peaked) top */}
          <path d="M10 16 L15 7 L25 7 L30 16Z" fill="#D8DFF8"/>
          <line x1="15" y1="7" x2="25" y2="7" stroke="#B0BAE0" strokeWidth="1"/>
          <line x1="20" y1="7" x2="20" y2="16" stroke="#B0BAE0" strokeWidth="1"/>
          {/* Cow graphic hint on label */}
          <circle cx="20" cy="24.5" r="2" fill="rgba(255,255,255,0.4)"/>
        </svg>
      );

    // ─── FRANGO ──────────────────────────────────────────────────────────────
    case "frango":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bone */}
          <rect x="17.5" y="25" width="5" height="12" rx="2.5" fill="#F5E8C8"/>
          <ellipse cx="20" cy="37.5" rx="4.5" ry="2.5" fill="#EDD5A0"/>
          <ellipse cx="20" cy="26" rx="4" ry="2.5" fill="#EDD5A0"/>
          {/* Meat body — golden brown cooked drumstick */}
          <path d="M10 17 Q10 6 20 5 Q30 6 30 17 Q30 27 20 28 Q10 27 10 17Z" fill="#B8621A"/>
          {/* Golden crust highlight */}
          <path d="M13 14 Q13 7 20 6 Q27 7 27 14 Q27 21 20 22 Q13 21 13 14Z" fill="#D4894A"/>
          {/* Shine */}
          <path d="M14 10 Q15 7 18 8" fill="none" stroke="rgba(255,220,150,0.6)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );

    // ─── REFRIGERANTE ────────────────────────────────────────────────────────
    case "refrigerante":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Can body */}
          <rect x="12" y="10" width="16" height="25" rx="2" fill="#E53935"/>
          {/* Top lid */}
          <ellipse cx="20" cy="10" rx="8" ry="3" fill="#BDBDBD"/>
          {/* Bottom lid */}
          <ellipse cx="20" cy="35" rx="8" ry="3" fill="#9E9E9E"/>
          {/* White stripe label */}
          <rect x="12" y="17" width="16" height="11" fill="#C62828"/>
          <rect x="13" y="18" width="14" height="9" rx="1" fill="rgba(255,255,255,0.15)"/>
          {/* Ring pull */}
          <ellipse cx="20" cy="8.5" rx="3" ry="1.5" fill="none" stroke="#9E9E9E" strokeWidth="1.5"/>
          <path d="M22 7 L24 5 L21 6.5" fill="#9E9E9E" stroke="none"/>
          {/* Shine on can */}
          <path d="M13 11 Q14 10 15 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── ALFACE ──────────────────────────────────────────────────────────────
    case "alface":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Outer wavy leaves */}
          <path d="M20 5 Q28 4 33 10 Q38 16 36 22 Q38 29 32 33 Q27 37 20 37 Q13 37 8 33 Q2 29 4 22 Q2 16 7 10 Q12 4 20 5Z" fill="#43A047"/>
          {/* Mid layer */}
          <path d="M20 9 Q26 8 30 13 Q34 18 32 23 Q30 28 24 30 Q20 32 16 30 Q10 28 8 23 Q6 18 10 13 Q14 8 20 9Z" fill="#66BB6A"/>
          {/* Inner head */}
          <path d="M20 13 Q25 12 27 16 Q29 20 27 24 Q25 27 20 28 Q15 27 13 24 Q11 20 13 16 Q15 12 20 13Z" fill="#A5D6A7"/>
          {/* Veins */}
          <line x1="20" y1="9" x2="20" y2="35" stroke="#2E7D32" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="9" y1="17" x2="31" y2="17" stroke="#2E7D32" strokeWidth="0.6" strokeLinecap="round"/>
          <line x1="7" y1="24" x2="33" y2="24" stroke="#2E7D32" strokeWidth="0.6" strokeLinecap="round"/>
        </svg>
      );

    // ─── ARROZ ───────────────────────────────────────────────────────────────
    case "arroz":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bag */}
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="#F5F0E0"/>
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="none" stroke="#C8B87A" strokeWidth="1"/>
          {/* Tied top */}
          <path d="M9 15 Q20 7 31 15" fill="#E8E0C0" stroke="#C8B87A" strokeWidth="1"/>
          {/* Rice grains */}
          <ellipse cx="16" cy="22" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(-20 16 22)"/>
          <ellipse cx="21" cy="20" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(10 21 20)"/>
          <ellipse cx="25" cy="23" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(-30 25 23)"/>
          <ellipse cx="17" cy="27" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(15 17 27)"/>
          <ellipse cx="24" cy="28" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(-10 24 28)"/>
          <ellipse cx="20" cy="25" rx="2.2" ry="1" fill="#DDD0A0" transform="rotate(5 20 25)"/>
        </svg>
      );

    // ─── FEIJÃO ──────────────────────────────────────────────────────────────
    case "feijao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bowl */}
          <path d="M8 24 L10 33 L30 33 L32 24Z" fill="#8B4513"/>
          <path d="M8 24 Q8 19 20 19 Q32 19 32 24" fill="#6B3010"/>
          {/* Beans */}
          <path d="M10 17 Q7.5 20.5 10 23.5 Q12 25 15.5 23 Q18 21 16.5 17.5 Q14.5 15 10 17Z" fill="#7B2D2D"/>
          <path d="M18.5 13.5 Q16 17 18.5 20 Q20.5 21.5 24 19.5 Q26.5 17.5 25 14 Q23 11.5 18.5 13.5Z" fill="#6B1E1E"/>
          <path d="M14.5 22 Q12 25 14.5 28 Q16.5 29.5 20 27.5 Q22.5 25.5 21 22 Q19 20 14.5 22Z" fill="#5A1A1A"/>
          <path d="M22 21 Q19.5 24.5 22 27.5 Q24 29 27.5 27 Q30 25 28.5 21.5 Q26.5 19.5 22 21Z" fill="#7B2D2D"/>
        </svg>
      );

    // ─── MACARRÃO ────────────────────────────────────────────────────────────
    case "macarrao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bowl */}
          <path d="M7 26 Q7 36 20 37 Q33 36 33 26Z" fill="#E8DDD0"/>
          <ellipse cx="20" cy="26" rx="13" ry="3" fill="#D8CAB8"/>
          {/* Wavy noodles */}
          <path d="M9 24 Q12 19 15 24 Q18 29 21 24 Q24 19 27 24 Q29 26 31 24" fill="none" stroke="#F4C430" strokeWidth="3" strokeLinecap="round"/>
          <path d="M10 18.5 Q13 14 16 18.5 Q19 23 22 18.5 Q25 14 28 18.5" fill="none" stroke="#F4C430" strokeWidth="3" strokeLinecap="round"/>
          <path d="M12 13.5 Q15 9 18 13.5 Q21 18 24 13.5 Q26 10.5 28.5 13" fill="none" stroke="#F4D070" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Sauce dot */}
          <circle cx="20" cy="22" r="2" fill="#E05020"/>
        </svg>
      );

    // ─── SAL ─────────────────────────────────────────────────────────────────
    case "sal":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Shaker body */}
          <rect x="14" y="12" width="12" height="22" rx="3" fill="#F2F2F2"/>
          <rect x="14" y="12" width="12" height="22" rx="3" fill="none" stroke="#CCCCCC" strokeWidth="1"/>
          {/* Blue label band */}
          <rect x="14" y="18" width="12" height="9" fill="#1565C0"/>
          {/* "S" on label */}
          <text x="20" y="25.5" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">S</text>
          {/* Cap */}
          <rect x="15" y="7" width="10" height="6" rx="2.5" fill="#E0E0E0"/>
          <rect x="15" y="7" width="10" height="6" rx="2.5" fill="none" stroke="#BBBBBB" strokeWidth="1"/>
          {/* Holes on cap */}
          <circle cx="18" cy="10" r="0.9" fill="#AAAAAA"/>
          <circle cx="20" cy="10" r="0.9" fill="#AAAAAA"/>
          <circle cx="22" cy="10" r="0.9" fill="#AAAAAA"/>
        </svg>
      );

    // ─── ÓLEO ────────────────────────────────────────────────────────────────
    case "oleo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body */}
          <rect x="12" y="14" width="16" height="21" rx="3" fill="#F0B429"/>
          <rect x="12" y="14" width="16" height="21" rx="3" fill="none" stroke="#C89020" strokeWidth="1"/>
          {/* Neck */}
          <rect x="16" y="8" width="8" height="7" rx="2" fill="#F0B429"/>
          <rect x="16" y="8" width="8" height="7" rx="2" fill="none" stroke="#C89020" strokeWidth="1"/>
          {/* Cap */}
          <rect x="15" y="5" width="10" height="4" rx="2" fill="#C89020"/>
          {/* Label */}
          <rect x="13" y="17" width="14" height="11" rx="2" fill="rgba(255,255,255,0.45)"/>
          <text x="20" y="25" fontSize="8" textAnchor="middle" fill="#7A5810" fontWeight="bold">ÓLEO</text>
          {/* Shine */}
          <path d="M13 15 Q14.5 13 16.5 14.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── CAFÉ ────────────────────────────────────────────────────────────────
    case "cafe":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Can body */}
          <rect x="9" y="11" width="22" height="24" rx="3" fill="#3E2314"/>
          <rect x="9" y="11" width="22" height="24" rx="3" fill="none" stroke="#2A1508" strokeWidth="1"/>
          {/* Top lid */}
          <ellipse cx="20" cy="11" rx="11" ry="3.5" fill="#6B4020"/>
          {/* Bottom lid */}
          <ellipse cx="20" cy="35" rx="11" ry="3" fill="#2A1508"/>
          {/* Brown label */}
          <rect x="10" y="16" width="20" height="14" rx="2" fill="#7B5030"/>
          {/* Cup icon on label */}
          <path d="M15 19 L16 26 L24 26 L25 19Z" fill="#3E2314"/>
          <path d="M25 21 Q29 21 29 23.5 Q29 26 25 26" fill="none" stroke="#3E2314" strokeWidth="1.5"/>
          {/* Steam */}
          <path d="M17 19 Q16 16.5 17 14.5" fill="none" stroke="#C8A882" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M20 18.5 Q19 16 20 14" fill="none" stroke="#C8A882" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M23 19 Q22 16.5 23 14.5" fill="none" stroke="#C8A882" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );

    // ─── MANTEIGA ────────────────────────────────────────────────────────────
    case "manteiga":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Block */}
          <rect x="6" y="14" width="28" height="14" rx="2" fill="#F9D673"/>
          <rect x="6" y="14" width="28" height="14" rx="2" fill="none" stroke="#C8A830" strokeWidth="1"/>
          {/* Wrapper lines */}
          <line x1="6" y1="18.5" x2="34" y2="18.5" stroke="#D4A020" strokeWidth="1"/>
          <line x1="6" y1="23.5" x2="34" y2="23.5" stroke="#D4A020" strokeWidth="1"/>
          <line x1="12" y1="14" x2="12" y2="28" stroke="#D4A020" strokeWidth="1"/>
          <line x1="28" y1="14" x2="28" y2="28" stroke="#D4A020" strokeWidth="1"/>
          {/* Label center */}
          <rect x="13" y="15.5" width="14" height="11" rx="1" fill="rgba(255,255,255,0.55)"/>
          <text x="20" y="23" fontSize="7" textAnchor="middle" fill="#8B6010" fontWeight="bold">MANTEIGA</text>
        </svg>
      );

    // ─── OVOS ────────────────────────────────────────────────────────────────
    case "ovos":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Carton base */}
          <rect x="4" y="24" width="32" height="9" rx="2" fill="#C8A060"/>
          <rect x="4" y="24" width="32" height="9" rx="2" fill="none" stroke="#A07840" strokeWidth="1"/>
          {/* Egg cups */}
          <path d="M5 24 Q10 17 15 24" fill="#B89050" stroke="#A07840" strokeWidth="0.8"/>
          <path d="M14 24 Q19 17 24 24" fill="#B89050" stroke="#A07840" strokeWidth="0.8"/>
          <path d="M23 24 Q28 17 33 24" fill="#B89050" stroke="#A07840" strokeWidth="0.8"/>
          {/* Eggs — cream/white ovals */}
          <ellipse cx="10" cy="21" rx="4" ry="5" fill="#FFFDE7"/>
          <ellipse cx="10" cy="21" rx="4" ry="5" fill="none" stroke="#E8D880" strokeWidth="0.8"/>
          <ellipse cx="19" cy="21" rx="4" ry="5" fill="#FFFDE7"/>
          <ellipse cx="19" cy="21" rx="4" ry="5" fill="none" stroke="#E8D880" strokeWidth="0.8"/>
          <ellipse cx="28" cy="21" rx="4" ry="5" fill="#FFFDE7"/>
          <ellipse cx="28" cy="21" rx="4" ry="5" fill="none" stroke="#E8D880" strokeWidth="0.8"/>
        </svg>
      );

    // ─── QUEIJO ──────────────────────────────────────────────────────────────
    case "queijo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Side face */}
          <path d="M4 33 L36 33 L36 13 Z" fill="#F0C030"/>
          <path d="M4 33 L36 33 L36 13 Z" fill="none" stroke="#C89820" strokeWidth="1"/>
          {/* Top face */}
          <path d="M4 33 L36 13 L27 9 L4 27Z" fill="#F8D840"/>
          <path d="M4 33 L36 13 L27 9 L4 27Z" fill="none" stroke="#C89820" strokeWidth="1"/>
          {/* Holes */}
          <ellipse cx="22" cy="26" rx="3" ry="2.2" fill="#C89820"/>
          <ellipse cx="30" cy="22" rx="2.4" ry="2" fill="#C89820"/>
          <ellipse cx="16" cy="29" rx="2.2" ry="1.8" fill="#C89820"/>
        </svg>
      );

    // ─── IOGURTE ─────────────────────────────────────────────────────────────
    case "iogurte":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Cup body */}
          <path d="M13 35 L11 15 L29 15 L27 35Z" fill="#F5F5F5"/>
          <path d="M13 35 L11 15 L29 15 L27 35Z" fill="none" stroke="#DDDDDD" strokeWidth="1"/>
          {/* Pink foil lid */}
          <ellipse cx="20" cy="15" rx="9" ry="3" fill="#E91E63"/>
          {/* Pull tab */}
          <path d="M25 12.5 Q29 10 28 14" fill="none" stroke="#C2185B" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Label */}
          <rect x="13" y="20" width="14" height="9" rx="1" fill="#FCE4EC"/>
          {/* Fruit dots */}
          <circle cx="17" cy="24.5" r="2" fill="#E91E63"/>
          <circle cx="20.5" cy="24.5" r="2" fill="#E91E63"/>
          <circle cx="24" cy="24.5" r="2" fill="#E91E63"/>
        </svg>
      );

    // ─── CARNE ───────────────────────────────────────────────────────────────
    case "carne":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Foam tray */}
          <rect x="4" y="22" width="32" height="12" rx="3" fill="#FFE8E8"/>
          <rect x="4" y="22" width="32" height="12" rx="3" fill="none" stroke="#FFCCCC" strokeWidth="1"/>
          {/* Meat steak shape */}
          <path d="M7 23 Q9 10 20 10 Q31 10 33 23Z" fill="#C0392B"/>
          {/* Marbling / fat */}
          <path d="M10 20 Q12 16 15 18" fill="none" stroke="#FFCCCC" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 18 Q23 14 26 17" fill="none" stroke="#FFCCCC" strokeWidth="2" strokeLinecap="round"/>
          {/* Top sheen */}
          <path d="M9 22 Q12 19 15 21" fill="none" stroke="#E74C3C" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Plastic wrap reflection */}
          <path d="M5 23 Q7 22 9 23" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── SABÃO EM PÓ ─────────────────────────────────────────────────────────
    case "sabao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Box */}
          <rect x="6" y="8" width="28" height="28" rx="2" fill="#1565C0"/>
          <rect x="6" y="8" width="28" height="28" rx="2" fill="none" stroke="#0D47A1" strokeWidth="1"/>
          {/* White label */}
          <rect x="8" y="15" width="24" height="14" rx="1" fill="#FFFFFF"/>
          {/* Bubbles on label */}
          <circle cx="14" cy="22" r="2.8" fill="none" stroke="#1565C0" strokeWidth="1.5"/>
          <circle cx="20.5" cy="20" r="2.2" fill="none" stroke="#1565C0" strokeWidth="1.5"/>
          <circle cx="26" cy="23" r="2.2" fill="none" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Top dark band */}
          <rect x="6" y="8" width="28" height="7" rx="2" fill="#0D47A1"/>
          <text x="20" y="13.5" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">SABÃO</text>
        </svg>
      );

    // ─── PAPEL HIGIÊNICO ─────────────────────────────────────────────────────
    case "papel":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Back visible roll */}
          <ellipse cx="22" cy="8" rx="10" ry="4" fill="#EEEEEE"/>
          <line x1="12" y1="8" x2="12" y2="32" stroke="#DDDDDD" strokeWidth="1"/>
          <line x1="32" y1="8" x2="32" y2="32" stroke="#DDDDDD" strokeWidth="1"/>
          <rect x="12" y="8" width="20" height="24" fill="#F5F5F5"/>
          <ellipse cx="22" cy="32" rx="10" ry="3.5" fill="#EEEEEE"/>
          {/* Inner cardboard tube */}
          <ellipse cx="22" cy="8" rx="5" ry="2" fill="#D4B483"/>
          <ellipse cx="22" cy="32" rx="5" ry="2" fill="#C8A070"/>
          <line x1="17" y1="8" x2="17" y2="32" stroke="#C8A070" strokeWidth="1"/>
          <line x1="27" y1="8" x2="27" y2="32" stroke="#C8A070" strokeWidth="1"/>
          {/* Sheet perforation lines */}
          <line x1="12" y1="16" x2="32" y2="16" stroke="#E0E0E0" strokeWidth="0.8" strokeDasharray="2,2"/>
          <line x1="12" y1="24" x2="32" y2="24" stroke="#E0E0E0" strokeWidth="0.8" strokeDasharray="2,2"/>
          {/* Hanging sheet tail */}
          <rect x="19" y="32" width="6" height="6" rx="1" fill="#F5F5F5"/>
        </svg>
      );

    // ─── SHAMPOO ─────────────────────────────────────────────────────────────
    case "shampoo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body */}
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="#9C27B0"/>
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="none" stroke="#7B1FA2" strokeWidth="1"/>
          {/* Neck */}
          <rect x="15" y="7" width="10" height="8" rx="2" fill="#9C27B0"/>
          <rect x="15" y="7" width="10" height="8" rx="2" fill="none" stroke="#7B1FA2" strokeWidth="1"/>
          {/* Flip cap */}
          <rect x="14" y="3" width="12" height="5" rx="2.5" fill="#6A1B9A"/>
          <path d="M21 3 L24 1 L24 3" fill="#6A1B9A" stroke="none"/>
          {/* White label */}
          <rect x="12" y="17" width="16" height="11" rx="2" fill="rgba(255,255,255,0.28)"/>
          <text x="20" y="25" fontSize="7.5" textAnchor="middle" fill="white" fontWeight="bold">SH</text>
          {/* Shine */}
          <path d="M12 15 Q13 13 15.5 14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── DETERGENTE ──────────────────────────────────────────────────────────
    case "detergente":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body */}
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="#2E7D32"/>
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="none" stroke="#1B5E20" strokeWidth="1"/>
          {/* Neck */}
          <rect x="15" y="7" width="10" height="8" rx="2" fill="#2E7D32"/>
          <rect x="15" y="7" width="10" height="8" rx="2" fill="none" stroke="#1B5E20" strokeWidth="1"/>
          {/* Cap */}
          <rect x="14" y="3" width="12" height="5" rx="2.5" fill="#1B5E20"/>
          <path d="M21 3 L24 1 L24 3" fill="#1B5E20" stroke="none"/>
          {/* Label */}
          <rect x="12" y="17" width="16" height="11" rx="2" fill="rgba(255,255,255,0.28)"/>
          <text x="20" y="24.5" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">DET</text>
          {/* Bubble */}
          <circle cx="26" cy="16" r="2.2" fill="rgba(255,255,255,0.35)"/>
          <circle cx="27" cy="13.5" r="1.5" fill="rgba(255,255,255,0.25)"/>
        </svg>
      );

    // ─── ÁGUA SANITÁRIA ──────────────────────────────────────────────────────
    case "agua-san":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body */}
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="#29B6F6"/>
          <path d="M11 14 Q10 35 20 36 Q30 35 29 14Z" fill="none" stroke="#0288D1" strokeWidth="1"/>
          {/* Neck */}
          <rect x="15" y="7" width="10" height="8" rx="2" fill="#29B6F6"/>
          <rect x="15" y="7" width="10" height="8" rx="2" fill="none" stroke="#0288D1" strokeWidth="1"/>
          {/* Cap */}
          <rect x="14" y="3" width="12" height="5" rx="2.5" fill="#0288D1"/>
          <path d="M21 3 L24 1 L24 3" fill="#0288D1" stroke="none"/>
          {/* Label */}
          <rect x="12" y="17" width="16" height="11" rx="2" fill="rgba(255,255,255,0.35)"/>
          <text x="20" y="24" fontSize="5.5" textAnchor="middle" fill="#01579B" fontWeight="bold">ÁGUA SAN.</text>
        </svg>
      );

    // ─── PASTA DE DENTE ───────────────────────────────────────────────────────
    case "pasta":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Tube body (horizontal) */}
          <rect x="4" y="16" width="24" height="10" rx="4" fill="#1565C0"/>
          <rect x="4" y="16" width="24" height="10" rx="4" fill="none" stroke="#0D47A1" strokeWidth="1"/>
          {/* White stripe */}
          <path d="M5 19 Q9 17.5 13 19.5 Q17 21.5 21 19.5 Q23.5 18.5 27 19.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Cap (right side) */}
          <rect x="28" y="14" width="8" height="14" rx="2" fill="#0D47A1"/>
          <rect x="28" y="14" width="8" height="14" rx="2" fill="none" stroke="#0A3680" strokeWidth="1"/>
          {/* Crimp left end */}
          <rect x="3" y="17" width="3" height="8" rx="1" fill="#0A3680"/>
          <line x1="3" y1="19" x2="6" y2="19" stroke="#0D47A1" strokeWidth="1.5"/>
          <line x1="3" y1="21" x2="6" y2="21" stroke="#0D47A1" strokeWidth="1.5"/>
          <line x1="3" y1="23" x2="6" y2="23" stroke="#0D47A1" strokeWidth="1.5"/>
          {/* Toothpaste squirt */}
          <path d="M36 19 Q39 21 36 23" fill="#FFFFFF" opacity="0.9" stroke="none"/>
        </svg>
      );

    // ─── SABONETE ────────────────────────────────────────────────────────────
    case "sabonete":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bar */}
          <rect x="6" y="13" width="28" height="16" rx="7" fill="#F8BBD0"/>
          <rect x="6" y="13" width="28" height="16" rx="7" fill="none" stroke="#F48FB1" strokeWidth="1"/>
          {/* Oval emboss */}
          <ellipse cx="20" cy="21" rx="9" ry="5.5" fill="rgba(255,255,255,0.45)"/>
          {/* Flower center */}
          <circle cx="20" cy="21" r="2.5" fill="#E91E63"/>
          {/* Petals */}
          <circle cx="20" cy="16.5" r="1.8" fill="#F48FB1"/>
          <circle cx="20" cy="25.5" r="1.8" fill="#F48FB1"/>
          <circle cx="15.5" cy="21" r="1.8" fill="#F48FB1"/>
          <circle cx="24.5" cy="21" r="1.8" fill="#F48FB1"/>
          {/* Shine */}
          <path d="M8 15 Q10 13 13 15" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── ESPONJA ─────────────────────────────────────────────────────────────
    case "esponja":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Yellow sponge body */}
          <rect x="4" y="10" width="32" height="13" rx="3" fill="#FDD835"/>
          <rect x="4" y="10" width="32" height="13" rx="3" fill="none" stroke="#F9A825" strokeWidth="1"/>
          {/* Green scrub pad */}
          <rect x="4" y="22" width="32" height="10" rx="3" fill="#43A047"/>
          <rect x="4" y="22" width="32" height="10" rx="3" fill="none" stroke="#2E7D32" strokeWidth="1"/>
          {/* Pores on yellow */}
          <circle cx="10" cy="15.5" r="1.8" fill="#F9A825"/>
          <circle cx="16" cy="14" r="1.8" fill="#F9A825"/>
          <circle cx="22" cy="15.5" r="1.8" fill="#F9A825"/>
          <circle cx="28" cy="14" r="1.8" fill="#F9A825"/>
          <circle cx="34" cy="15.5" r="1.8" fill="#F9A825"/>
          <circle cx="13" cy="19" r="1.5" fill="#F9A825"/>
          <circle cx="20" cy="18" r="1.5" fill="#F9A825"/>
          <circle cx="27" cy="19" r="1.5" fill="#F9A825"/>
          {/* Scrub texture */}
          <path d="M7 26 Q13 24 19 26 Q25 28 33 26" fill="none" stroke="#2E7D32" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );

    // ─── SACO DE LIXO ────────────────────────────────────────────────────────
    case "saco-lixo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bag body */}
          <path d="M8 18 Q7 35 20 37 Q33 35 32 18 Q32 11 26 10 Q22 8 20 8 Q18 8 14 10 Q8 11 8 18Z" fill="#455A64"/>
          <path d="M8 18 Q7 35 20 37 Q33 35 32 18 Q32 11 26 10 Q22 8 20 8 Q18 8 14 10 Q8 11 8 18Z" fill="none" stroke="#37474F" strokeWidth="1"/>
          {/* Tie at top */}
          <path d="M15 10 Q20 6 25 10" fill="none" stroke="#78909C" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M17 7.5 Q20 4.5 23 7.5" fill="none" stroke="#78909C" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Shine */}
          <path d="M10 18 Q11 14 13.5 16" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Recycling symbol */}
          <text x="20" y="27" fontSize="11" textAnchor="middle" fill="rgba(255,255,255,0.25)">♻</text>
        </svg>
      );

    // ─── ÁGUA MINERAL ────────────────────────────────────────────────────────
    case "agua":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body */}
          <rect x="12" y="9" width="16" height="27" rx="5" fill="#E3F2FD"/>
          <rect x="12" y="9" width="16" height="27" rx="5" fill="none" stroke="#90CAF9" strokeWidth="1"/>
          {/* Neck */}
          <rect x="15" y="5" width="10" height="5" rx="2" fill="#BBDEFB"/>
          <rect x="15" y="5" width="10" height="5" rx="2" fill="none" stroke="#90CAF9" strokeWidth="1"/>
          {/* Cap */}
          <rect x="14" y="2" width="12" height="4" rx="2" fill="#1565C0"/>
          {/* Blue label */}
          <rect x="12" y="17" width="16" height="11" fill="#1565C0"/>
          {/* Wave on label */}
          <path d="M13 22 Q16 20 20 22 Q24 24 27 22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Shine */}
          <path d="M13 11 Q14 9 16.5 10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── SUCO ────────────────────────────────────────────────────────────────
    case "suco":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Box body */}
          <rect x="8" y="11" width="22" height="25" rx="2" fill="#F57C00"/>
          <rect x="8" y="11" width="22" height="25" rx="2" fill="none" stroke="#E65100" strokeWidth="1"/>
          {/* White label panel */}
          <rect x="9" y="15" width="20" height="14" rx="1" fill="rgba(255,255,255,0.3)"/>
          {/* Orange fruit circle */}
          <circle cx="19" cy="22" r="5.5" fill="#FF6D00"/>
          <circle cx="19" cy="22" r="4" fill="#FF9800"/>
          {/* Fruit segments */}
          <line x1="19" y1="16.5" x2="19" y2="27.5" stroke="#FF6D00" strokeWidth="0.8"/>
          <line x1="13.5" y1="22" x2="24.5" y2="22" stroke="#FF6D00" strokeWidth="0.8"/>
          {/* Straw */}
          <rect x="26" y="4" width="3" height="13" rx="1.5" fill="#FFFFFF"/>
          {/* Foil top */}
          <path d="M8 11 L30 11 L30 15 L8 15Z" fill="#E65100"/>
          <path d="M24 11 L27 4 L29 4 L26 11Z" fill="#E65100"/>
        </svg>
      );

    // ─── BANANA ──────────────────────────────────────────────────────────────
    case "banana":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Stem/bunch top */}
          <path d="M20 7 Q22 5 24 6 Q22 8 20 7Z" fill="#5D4037"/>
          {/* Main banana */}
          <path d="M8 30 Q8 13 22 8 Q31 8 33 14 Q34 19 29 23 Q24 27 20 27 Q12 27 8 30Z" fill="#FDD835"/>
          {/* Inner lighter curve */}
          <path d="M10 28 Q10 15 22 10 Q30 10 31 15 Q32 19 27.5 22.5 Q23 26 20 26 Q13 26 10 28Z" fill="#FFEE58"/>
          {/* Bottom tip */}
          <path d="M8 30 Q6 32 8 34" fill="none" stroke="#F9A825" strokeWidth="2" strokeLinecap="round"/>
          {/* Top tip */}
          <path d="M33 14 Q35 13 33 11" fill="none" stroke="#F9A825" strokeWidth="2" strokeLinecap="round"/>
          {/* Length stripe */}
          <path d="M12 25 Q17 21 23 18.5 Q28 16.5 31 15" fill="none" stroke="#F9A825" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );

    // ─── MAÇÃ ────────────────────────────────────────────────────────────────
    case "maca":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Apple body */}
          <path d="M7 21 Q7 10 14 8 Q17 7 20 8 Q23 7 26 8 Q33 10 33 21 Q33 31 26 34 Q23 36 20 36 Q17 36 14 34 Q7 31 7 21Z" fill="#E53935"/>
          {/* Highlight */}
          <path d="M10 16 Q11 10 16 9 Q19 8.5 20 10 Q16 12.5 11 17Z" fill="rgba(255,255,255,0.3)"/>
          {/* Stem */}
          <rect x="19" y="4" width="3" height="5" rx="1.5" fill="#5D4037"/>
          {/* Leaf */}
          <path d="M22 6 Q28 3 27 8 Q24 8 22 6Z" fill="#43A047"/>
          {/* Top dent */}
          <path d="M16 8.5 Q20 7 24 8.5" fill="none" stroke="#C62828" strokeWidth="1"/>
        </svg>
      );

    // ─── TOMATE ──────────────────────────────────────────────────────────────
    case "tomate":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Body */}
          <circle cx="20" cy="23" r="14" fill="#E53935"/>
          {/* Highlight */}
          <path d="M11 16 Q13 11 17.5 12.5 Q14 16.5 12 21Z" fill="rgba(255,255,255,0.25)"/>
          {/* Stem */}
          <rect x="19" y="7" width="2.5" height="5" rx="1.2" fill="#5D4037"/>
          {/* Leaf crown */}
          <path d="M13 10 Q17 8 20 9" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M20 9 Q23 8 27 10" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M11 12 Q15.5 9.5 20 9 Q24.5 9.5 29 12" fill="none" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Equator */}
          <path d="M7 24 Q13 20 20 24 Q27 28 33 24" fill="none" stroke="#C62828" strokeWidth="1"/>
        </svg>
      );

    // ─── BATATA ──────────────────────────────────────────────────────────────
    case "batata":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Potato body (irregular blob) */}
          <path d="M10 20 Q8 11 14 8 Q20 6 26 9.5 Q32 13 33 20 Q34 28 28 32.5 Q22 37 16 33 Q8 28 10 20Z" fill="#D7CBA8"/>
          {/* Highlight */}
          <path d="M12 15.5 Q14 10 19 9.5 Q24 9 28 13" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Eyes (buds) */}
          <circle cx="16" cy="16" r="2" fill="#B8A47A"/>
          <circle cx="16" cy="16" r="0.9" fill="#6A4A20"/>
          <circle cx="25" cy="22" r="2" fill="#B8A47A"/>
          <circle cx="25" cy="22" r="0.9" fill="#6A4A20"/>
          <circle cx="18" cy="28" r="2" fill="#B8A47A"/>
          <circle cx="18" cy="28" r="0.9" fill="#6A4A20"/>
          {/* Small sprout */}
          <path d="M27 11 Q29 8 28 7" fill="none" stroke="#6B8E23" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── CENOURA ─────────────────────────────────────────────────────────────
    case "cenoura":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Carrot body */}
          <path d="M13 10 L27 10 L22 36 L18 36Z" fill="#FF6D00"/>
          <path d="M13 10 L27 10 L22 36 L18 36Z" fill="none" stroke="#E65100" strokeWidth="1"/>
          {/* Highlight */}
          <path d="M14 11 L17.5 11 L14.5 22" fill="rgba(255,255,255,0.3)"/>
          {/* Rings */}
          <line x1="14.5" y1="17" x2="25.5" y2="17" stroke="#E65100" strokeWidth="1"/>
          <line x1="15.5" y1="23" x2="24.5" y2="23" stroke="#E65100" strokeWidth="1"/>
          <line x1="17" y1="29" x2="23" y2="29" stroke="#E65100" strokeWidth="1"/>
          {/* Leaves */}
          <path d="M17 10 Q13 3.5 11 6" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M20 10 Q20 3 20 2" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M23 10 Q27 3.5 29 6" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      );

    // ─── FARINHA ─────────────────────────────────────────────────────────────
    case "farinha":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bag */}
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="#FAF7F0"/>
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="none" stroke="#C8BFA0" strokeWidth="1"/>
          {/* Tied top */}
          <path d="M9 15 Q20 7 31 15" fill="#F0EAD5" stroke="#C8BFA0" strokeWidth="1"/>
          {/* Label */}
          <rect x="11" y="18" width="18" height="12" rx="2" fill="#F0E8D0"/>
          <text x="20" y="27" fontSize="9" textAnchor="middle" fill="#8B7355" fontWeight="bold">F</text>
          {/* Flour cloud */}
          <circle cx="16" cy="12.5" r="2.2" fill="rgba(250,247,240,0.8)"/>
          <circle cx="20" cy="10.5" r="2.8" fill="rgba(250,247,240,0.8)"/>
          <circle cx="24" cy="12.5" r="2.2" fill="rgba(250,247,240,0.8)"/>
        </svg>
      );

    // ─── VINAGRE ─────────────────────────────────────────────────────────────
    case "vinagre":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bottle body (dark amber) */}
          <rect x="12" y="14" width="16" height="22" rx="3" fill="#8B4513"/>
          <rect x="12" y="14" width="16" height="22" rx="3" fill="none" stroke="#6B3010" strokeWidth="1"/>
          {/* Neck */}
          <rect x="16" y="8" width="8" height="7" rx="2" fill="#8B4513"/>
          <rect x="16" y="8" width="8" height="7" rx="2" fill="none" stroke="#6B3010" strokeWidth="1"/>
          {/* Cap */}
          <rect x="15" y="5" width="10" height="4" rx="2" fill="#6B3010"/>
          {/* Label */}
          <rect x="13" y="17" width="14" height="13" rx="2" fill="rgba(255,255,255,0.3)"/>
          <text x="20" y="26" fontSize="7" textAnchor="middle" fill="#FFF8E0" fontWeight="bold">VIN.</text>
          {/* Shine */}
          <path d="M13 15 Q14.5 13 16.5 14.5" fill="none" stroke="rgba(255,200,100,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ─── AÇÚCAR ──────────────────────────────────────────────────────────────
    case "acucar":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          {/* Bag (white) */}
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="#FFFFFF"/>
          <path d="M9 15 L7 34 L33 34 L31 15Z" fill="none" stroke="#CCCCCC" strokeWidth="1"/>
          {/* Blue tied top */}
          <path d="M9 15 Q20 7 31 15" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1"/>
          {/* Blue label */}
          <rect x="11" y="18" width="18" height="12" rx="2" fill="#BBDEFB"/>
          <text x="20" y="27" fontSize="8" textAnchor="middle" fill="#1565C0" fontWeight="bold">A</text>
          {/* Sugar crystals */}
          <rect x="13" y="30" width="2.5" height="2.5" rx="0.5" fill="#EEEEEE" transform="rotate(15 13 30)"/>
          <rect x="18" y="31" width="2.5" height="2.5" rx="0.5" fill="#F5F5F5" transform="rotate(-10 18 31)"/>
          <rect x="23" y="30" width="2.5" height="2.5" rx="0.5" fill="#EEEEEE" transform="rotate(25 23 30)"/>
          <rect x="27" y="31" width="2" height="2" rx="0.5" fill="#F5F5F5" transform="rotate(5 27 31)"/>
        </svg>
      );

    // ─── Fallback ─────────────────────────────────────────────────────────────
    default: {
      const label = id.slice(0, 4).toUpperCase();
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <rect x="5" y="5" width="30" height="30" rx="5" fill="#E0E0E0"/>
          <text x="20" y="23" fontSize="8" textAnchor="middle" fill="#666" fontWeight="bold">
            {label}
          </text>
        </svg>
      );
    }
  }
}
