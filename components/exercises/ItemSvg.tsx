import { ProductSvg } from "@/components/exercises/memory/ProductSvg";

function AnimalSvg({ id, size }: { id: string; size: number }) {
  const s = size;
  switch (id) {
    // FAZENDA
    case "an-vaca":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="26" rx="13" ry="9" fill="#F5E6CC"/>
          <ellipse cx="20" cy="26" rx="13" ry="9" stroke="#8B6914" strokeWidth="1.2"/>
          <ellipse cx="20" cy="14" rx="8" ry="7" fill="#F5E6CC" stroke="#8B6914" strokeWidth="1.2"/>
          <circle cx="17" cy="12" r="1.5" fill="#2C1810"/>
          <circle cx="23" cy="12" r="1.5" fill="#2C1810"/>
          <ellipse cx="20" cy="17" rx="3" ry="2" fill="#FFB3BA"/>
          <path d="M14 7 Q13 4 11 4" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M26 7 Q27 4 29 4" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="10" cy="28" rx="2.5" ry="5" fill="#F5E6CC" stroke="#8B6914" strokeWidth="1"/>
          <ellipse cx="30" cy="28" rx="2.5" ry="5" fill="#F5E6CC" stroke="#8B6914" strokeWidth="1"/>
          <ellipse cx="16" cy="28" rx="2.5" ry="5" fill="#F5E6CC" stroke="#8B6914" strokeWidth="1"/>
          <ellipse cx="24" cy="28" rx="2.5" ry="5" fill="#F5E6CC" stroke="#8B6914" strokeWidth="1"/>
          <ellipse cx="13" cy="33" rx="3.5" ry="2" fill="#FFB3BA"/>
          <path d="M32 26 Q36 25 36 22" stroke="#8B6914" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case "an-porco":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="26" rx="13" ry="9" fill="#FFAAAA"/>
          <ellipse cx="20" cy="16" rx="9" ry="8" fill="#FFAAAA"/>
          <circle cx="16" cy="14" r="1.8" fill="#CC4444"/>
          <circle cx="24" cy="14" r="1.8" fill="#CC4444"/>
          <circle cx="17" cy="12" r="1" fill="#2C1810"/>
          <circle cx="23" cy="12" r="1" fill="#2C1810"/>
          <ellipse cx="20" cy="17" rx="4" ry="3" fill="#FF8888"/>
          <circle cx="18.5" cy="17" r="1" fill="#CC3333"/>
          <circle cx="21.5" cy="17" r="1" fill="#CC3333"/>
          <path d="M13 9 Q11 5 9 6" stroke="#FFAAAA" strokeWidth="3" strokeLinecap="round"/>
          <path d="M27 9 Q29 5 31 6" stroke="#FFAAAA" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="10" cy="28" rx="2.5" ry="5" fill="#FFAAAA"/>
          <ellipse cx="30" cy="28" rx="2.5" ry="5" fill="#FFAAAA"/>
          <ellipse cx="16" cy="28" rx="2.5" ry="5" fill="#FFAAAA"/>
          <ellipse cx="24" cy="28" rx="2.5" ry="5" fill="#FFAAAA"/>
          <path d="M32 26 Q36 28 35 32" stroke="#FFAAAA" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case "an-galinha":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="28" rx="12" ry="8" fill="#F5F5DC"/>
          <circle cx="20" cy="16" r="7" fill="#F5F5DC"/>
          <path d="M15 10 Q16 6 20 5 Q24 6 25 10" fill="#FF6B6B"/>
          <circle cx="17" cy="15" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="15" r="1.8" fill="#2C1810"/>
          <path d="M17 19 L20 21 L23 19" fill="#FF8C00"/>
          <ellipse cx="9" cy="28" rx="2" ry="4" fill="#F5F5DC"/>
          <ellipse cx="31" cy="28" rx="2" ry="4" fill="#F5F5DC"/>
          <ellipse cx="14" cy="29" rx="2" ry="4" fill="#F5F5DC"/>
          <ellipse cx="26" cy="29" rx="2" ry="4" fill="#F5F5DC"/>
          <path d="M10 33 Q9 36 8 37" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M30 33 Q31 36 32 37" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M31 16 Q34 13 33 10 Q30 11 31 16" fill="#FF6B6B"/>
        </svg>
      );
    case "an-cavalo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="13" ry="9" fill="#C8956C"/>
          <rect x="10" y="13" width="8" height="12" rx="3" fill="#C8956C"/>
          <ellipse cx="13" cy="11" rx="5" ry="4" fill="#C8956C"/>
          <path d="M11 8 Q10 4 12 3" stroke="#4A2C17" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 7 Q16 3 18 3" stroke="#4A2C17" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="10" r="1.2" fill="#2C1810"/>
          <path d="M10 14 L14 16" stroke="#4A2C17" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="9" cy="29" rx="2.5" ry="6" fill="#C8956C"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="6" fill="#C8956C"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="6" fill="#C8956C"/>
          <ellipse cx="31" cy="29" rx="2.5" ry="6" fill="#C8956C"/>
          <path d="M31 26 Q35 24 35 20" stroke="#4A2C17" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "an-ovelha":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <circle cx="15" cy="22" r="6" fill="#F0F0F0"/>
          <circle cx="22" cy="20" r="6" fill="#F0F0F0"/>
          <circle cx="20" cy="27" r="6" fill="#F0F0F0"/>
          <circle cx="13" cy="27" r="5" fill="#F0F0F0"/>
          <ellipse cx="18" cy="24" rx="9" ry="7" fill="#F0F0F0"/>
          <ellipse cx="18" cy="14" rx="6" ry="5" fill="#D4C5A9"/>
          <circle cx="16" cy="13" r="1.3" fill="#2C1810"/>
          <circle cx="20" cy="13" r="1.3" fill="#2C1810"/>
          <path d="M16 16 L18 17 L20 16" fill="#D4A0A0"/>
          <ellipse cx="10" cy="30" rx="2" ry="5" fill="#D4C5A9"/>
          <ellipse cx="16" cy="31" rx="2" ry="5" fill="#D4C5A9"/>
          <ellipse cx="22" cy="31" rx="2" ry="5" fill="#D4C5A9"/>
          <ellipse cx="28" cy="30" rx="2" ry="5" fill="#D4C5A9"/>
        </svg>
      );
    case "an-pato":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="28" rx="10" ry="7" fill="#F5F5DC"/>
          <circle cx="20" cy="17" r="7" fill="#F5F5DC"/>
          <path d="M24 18 Q28 17 29 20 Q26 22 24 20 Z" fill="#FF8C00"/>
          <circle cx="18" cy="15" r="1.8" fill="#2C1810"/>
          <path d="M10 28 Q5 26 5 22" stroke="#F5F5DC" strokeWidth="4" strokeLinecap="round"/>
          <ellipse cx="13" cy="33" rx="3" ry="2" fill="#FF8C00"/>
          <ellipse cx="23" cy="33" rx="3" ry="2" fill="#FF8C00"/>
        </svg>
      );
    // SELVA
    case "an-leao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="18" r="10" fill="#D2691E" opacity="0.6"/>
          <circle cx="20" cy="18" r="7" fill="#D2A054"/>
          <circle cx="17" cy="16" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="16" r="1.8" fill="#2C1810"/>
          <ellipse cx="20" cy="19" rx="3" ry="2" fill="#E8A070"/>
          <path d="M18 21 L20 22 L22 21" stroke="#C07050" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="15" cy="28" rx="3" ry="6" fill="#D2A054"/>
          <ellipse cx="25" cy="28" rx="3" ry="6" fill="#D2A054"/>
          <ellipse cx="10" cy="30" rx="2.5" ry="5" fill="#D2A054"/>
          <ellipse cx="30" cy="30" rx="2.5" ry="5" fill="#D2A054"/>
          <path d="M30 26 Q36 24 36 20" stroke="#D2A054" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    case "an-elefante":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="21" cy="26" rx="13" ry="10" fill="#A0A0A8"/>
          <ellipse cx="21" cy="15" rx="9" ry="8" fill="#A0A0A8"/>
          <path d="M15 20 Q10 22 8 26 Q9 30 12 30 Q14 28 14 24" fill="#A0A0A8"/>
          <circle cx="19" cy="13" r="1.8" fill="#2C1810"/>
          <path d="M14 10 Q12 6 10 7" stroke="#A0A0A8" strokeWidth="4" strokeLinecap="round"/>
          <path d="M25 10 Q27 7 29 8" stroke="#A0A0A8" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="24" cy="13" r="1.3" fill="#C0C0C8"/>
          <ellipse cx="10" cy="30" rx="2.5" ry="5" fill="#A0A0A8"/>
          <ellipse cx="18" cy="31" rx="2.5" ry="5" fill="#A0A0A8"/>
          <ellipse cx="26" cy="31" rx="2.5" ry="5" fill="#A0A0A8"/>
          <ellipse cx="33" cy="30" rx="2.5" ry="5" fill="#A0A0A8"/>
        </svg>
      );
    case "an-macaco":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="11" ry="8" fill="#8B5E3C"/>
          <circle cx="20" cy="16" r="8" fill="#8B5E3C"/>
          <ellipse cx="13" cy="16" rx="3.5" ry="3" fill="#C4956A"/>
          <ellipse cx="27" cy="16" rx="3.5" ry="3" fill="#C4956A"/>
          <ellipse cx="20" cy="19" rx="5" ry="4" fill="#C4956A"/>
          <circle cx="17" cy="14" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="14" r="1.8" fill="#2C1810"/>
          <path d="M17 20 Q20 22 23 20" stroke="#8B5E3C" strokeWidth="1.2" strokeLinecap="round"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#8B5E3C"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#8B5E3C"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#8B5E3C"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#8B5E3C"/>
          <path d="M30 26 Q36 24 35 30 Q33 35 30 34" stroke="#8B5E3C" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "an-girafa":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="17" y="4" width="6" height="18" rx="3" fill="#DAA520"/>
          <ellipse cx="20" cy="26" rx="11" ry="8" fill="#DAA520"/>
          <ellipse cx="20" cy="6" rx="5" ry="4" fill="#DAA520"/>
          <circle cx="18" cy="5" r="1.2" fill="#2C1810"/>
          <path d="M17 3 Q16 1 15 1" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M23 3 Q24 1 25 1" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="15" cy="14" r="2" fill="#8B4513" opacity="0.5"/>
          <circle cx="23" cy="10" r="2" fill="#8B4513" opacity="0.5"/>
          <circle cx="17" cy="21" r="2" fill="#8B4513" opacity="0.5"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#DAA520"/>
          <ellipse cx="17" cy="30" rx="2.5" ry="5" fill="#DAA520"/>
          <ellipse cx="23" cy="30" rx="2.5" ry="5" fill="#DAA520"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#DAA520"/>
        </svg>
      );
    case "an-zebra":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="13" ry="9" fill="#F5F5F5"/>
          <ellipse cx="20" cy="15" rx="8" ry="7" fill="#F5F5F5"/>
          <path d="M13 22 Q15 20 17 22 Q19 24 21 22 Q23 20 25 22 Q27 24 27 22" stroke="#2C1810" strokeWidth="1.5" fill="none"/>
          <path d="M15 27 Q17 25 19 27 Q21 29 23 27 Q25 25 27 27" stroke="#2C1810" strokeWidth="1.5" fill="none"/>
          <path d="M14 11 Q16 9 18 11 Q20 13 22 11" stroke="#2C1810" strokeWidth="1.5" fill="none"/>
          <circle cx="17" cy="13" r="1.5" fill="#2C1810"/>
          <circle cx="23" cy="13" r="1.5" fill="#2C1810"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
        </svg>
      );
    case "an-tigre":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="13" ry="9" fill="#E8841A"/>
          <circle cx="20" cy="16" r="8" fill="#E8841A"/>
          <path d="M16 12 L15 8" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 11 L20 7" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M24 12 L25 8" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13 22 L14 19" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M27 22 L26 19" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="17" cy="15" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="15" r="1.8" fill="#2C1810"/>
          <ellipse cx="20" cy="18" rx="3" ry="2" fill="#F5C08A"/>
          <path d="M17 20 Q20 22 23 20" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#E8841A"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#E8841A"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#E8841A"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#E8841A"/>
        </svg>
      );
    // AQUATICO
    case "an-peixe":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="19" cy="20" rx="12" ry="7" fill="#4FC3F7"/>
          <path d="M31 20 L38 14 L38 26 Z" fill="#0288D1"/>
          <circle cx="13" cy="18" r="2" fill="#0D47A1"/>
          <circle cx="13.5" cy="17.5" r="0.7" fill="white"/>
          <path d="M17 16 Q19 14 21 16" stroke="#0288D1" strokeWidth="1.2" fill="none"/>
          <path d="M17 20 Q19 22 21 20" stroke="#0288D1" strokeWidth="1" fill="none"/>
          <path d="M22 17 Q24 15 26 17" stroke="#0288D1" strokeWidth="1" fill="none"/>
          <path d="M10 17 Q7 20 10 23" stroke="#4FC3F7" strokeWidth="2" fill="none"/>
        </svg>
      );
    case "an-golfinho":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="18" cy="22" rx="13" ry="7" fill="#40C4FF" transform="rotate(-10 18 22)"/>
          <path d="M22 10 Q26 8 28 12 Q24 14 22 10 Z" fill="#40C4FF"/>
          <path d="M31 22 Q36 18 37 22 Q36 26 31 24 Z" fill="#0288D1"/>
          <ellipse cx="10" cy="22" rx="4" ry="3" fill="#80DEEA"/>
          <circle cx="11" cy="19" r="1.5" fill="#0D47A1"/>
          <circle cx="11.5" cy="18.5" r="0.5" fill="white"/>
          <path d="M8 26 Q6 30 8 32 Q12 30 10 26" fill="#40C4FF"/>
        </svg>
      );
    case "an-polvo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="16" rx="10" ry="9" fill="#CE93D8"/>
          <circle cx="16" cy="14" r="2" fill="#4A148C"/>
          <circle cx="24" cy="14" r="2" fill="#4A148C"/>
          <circle cx="16.5" cy="13.5" r="0.7" fill="white"/>
          <circle cx="24.5" cy="13.5" r="0.7" fill="white"/>
          <path d="M11 23 Q9 28 8 32 Q10 33 11 31 Q12 34 13 33 Q13 29 14 25" fill="#CE93D8" stroke="#AB47BC" strokeWidth="0.7"/>
          <path d="M16 25 Q15 30 15 34 Q17 35 17 33 Q18 36 19 35 Q19 31 18 26" fill="#CE93D8" stroke="#AB47BC" strokeWidth="0.7"/>
          <path d="M22 25 Q23 30 22 34 Q24 35 24 33 Q25 36 26 35 Q26 31 25 26" fill="#CE93D8" stroke="#AB47BC" strokeWidth="0.7"/>
          <path d="M27 23 Q29 28 30 32 Q32 33 32 31 Q33 34 34 33 Q34 29 33 25" fill="#CE93D8" stroke="#AB47BC" strokeWidth="0.7"/>
        </svg>
      );
    case "an-tartaruga":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="22" rx="13" ry="10" fill="#66BB6A"/>
          <path d="M14 16 Q20 12 26 16" stroke="#388E3C" strokeWidth="1.5" fill="none"/>
          <path d="M13 22 L27 22" stroke="#388E3C" strokeWidth="1" fill="none"/>
          <path d="M14 28 Q20 32 26 28" stroke="#388E3C" strokeWidth="1.5" fill="none"/>
          <path d="M17 16 L17 28" stroke="#388E3C" strokeWidth="1" fill="none"/>
          <path d="M20 14 L20 28" stroke="#388E3C" strokeWidth="1" fill="none"/>
          <path d="M23 16 L23 28" stroke="#388E3C" strokeWidth="1" fill="none"/>
          <ellipse cx="20" cy="14" rx="4" ry="3" fill="#A5D6A7"/>
          <circle cx="18.5" cy="13.5" r="1.2" fill="#2C1810"/>
          <ellipse cx="8" cy="22" rx="3" ry="2" fill="#A5D6A7"/>
          <ellipse cx="32" cy="22" rx="3" ry="2" fill="#A5D6A7"/>
          <ellipse cx="14" cy="30" rx="2.5" ry="2" fill="#A5D6A7"/>
          <ellipse cx="26" cy="30" rx="2.5" ry="2" fill="#A5D6A7"/>
          <path d="M26 30 Q28 34 27 36" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case "an-tubarao":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="19" cy="22" rx="14" ry="8" fill="#607D8B" transform="rotate(-5 19 22)"/>
          <ellipse cx="13" cy="21" rx="4" ry="3" fill="#B0BEC5"/>
          <path d="M20 14 L22 8 L24 14" fill="#607D8B"/>
          <path d="M30 20 L36 16 L36 26 Z" fill="#546E7A"/>
          <path d="M20 28 L18 33 L24 30 Z" fill="#546E7A"/>
          <circle cx="10" cy="20" r="1.5" fill="#1A237E"/>
          <path d="M15 23 L17 25 L19 23 L21 25 L23 23" stroke="#B0BEC5" strokeWidth="0.8" fill="none"/>
        </svg>
      );
    case "an-caranguejo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="23" rx="10" ry="8" fill="#E53935"/>
          <circle cx="15" cy="20" r="2.5" fill="#EF9A9A"/>
          <circle cx="25" cy="20" r="2.5" fill="#EF9A9A"/>
          <circle cx="14.5" cy="19.5" r="1" fill="#1A1A1A"/>
          <circle cx="24.5" cy="19.5" r="1" fill="#1A1A1A"/>
          <path d="M13 23 Q10 25 7 22 Q8 19 10 20" fill="#E53935" stroke="#C62828" strokeWidth="0.8"/>
          <path d="M27 23 Q30 25 33 22 Q32 19 30 20" fill="#E53935" stroke="#C62828" strokeWidth="0.8"/>
          <path d="M12 20 Q8 17 7 14 Q9 13 11 15" fill="#E53935" stroke="#C62828" strokeWidth="0.8"/>
          <path d="M28 20 Q32 17 33 14 Q31 13 29 15" fill="#E53935" stroke="#C62828" strokeWidth="0.8"/>
          <path d="M15 29 Q13 33 11 34" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M25 29 Q27 33 29 34" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M17 30 Q16 34 15 35" stroke="#E53935" strokeWidth="2" strokeLinecap="round"/>
          <path d="M23 30 Q24 34 25 35" stroke="#E53935" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    // DOMESTICO
    case "an-cachorro":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="12" ry="8" fill="#C8956C"/>
          <ellipse cx="20" cy="16" rx="8" ry="7" fill="#C8956C"/>
          <ellipse cx="13" cy="14" rx="4" ry="5" fill="#A0714A"/>
          <ellipse cx="27" cy="14" rx="4" ry="5" fill="#A0714A"/>
          <circle cx="17" cy="15" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="15" r="1.8" fill="#2C1810"/>
          <ellipse cx="20" cy="18" rx="3.5" ry="2.5" fill="#D4A0A0"/>
          <path d="M17 20 Q20 22 23 20" stroke="#A0714A" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#C8956C"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#C8956C"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#C8956C"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#C8956C"/>
          <path d="M30 25 Q36 22 35 18" stroke="#C8956C" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    case "an-gato":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="12" ry="8" fill="#9E9E9E"/>
          <ellipse cx="20" cy="16" rx="8" ry="7" fill="#9E9E9E"/>
          <path d="M13 12 L11 7 L16 11 Z" fill="#757575"/>
          <path d="M27 12 L29 7 L24 11 Z" fill="#757575"/>
          <circle cx="17" cy="15" r="1.8" fill="#2C1810"/>
          <circle cx="23" cy="15" r="1.8" fill="#2C1810"/>
          <ellipse cx="20" cy="18" rx="3" ry="2" fill="#FFCCCC"/>
          <path d="M16 20 L14 21" stroke="#757575" strokeWidth="1" strokeLinecap="round"/>
          <path d="M18 20 L17 22" stroke="#757575" strokeWidth="1" strokeLinecap="round"/>
          <path d="M22 20 L21 22" stroke="#757575" strokeWidth="1" strokeLinecap="round"/>
          <path d="M24 20 L26 21" stroke="#757575" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#9E9E9E"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#9E9E9E"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#9E9E9E"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#9E9E9E"/>
          <path d="M30 25 Q36 22 34 32 Q31 36 29 34" stroke="#9E9E9E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "an-coelho":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="11" ry="8" fill="#F5F5F5"/>
          <ellipse cx="20" cy="17" rx="7" ry="6" fill="#F5F5F5"/>
          <ellipse cx="15" cy="10" rx="3" ry="7" fill="#F5F5F5"/>
          <ellipse cx="25" cy="10" rx="3" ry="7" fill="#F5F5F5"/>
          <ellipse cx="15" cy="10" rx="1.5" ry="5" fill="#FFB3BA"/>
          <ellipse cx="25" cy="10" rx="1.5" ry="5" fill="#FFB3BA"/>
          <circle cx="17" cy="16" r="1.5" fill="#2C1810"/>
          <circle cx="23" cy="16" r="1.5" fill="#2C1810"/>
          <ellipse cx="20" cy="18.5" rx="2.5" ry="2" fill="#FFB3BA"/>
          <ellipse cx="10" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="16" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="24" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="30" cy="29" rx="2.5" ry="5" fill="#F5F5F5"/>
          <ellipse cx="17" cy="32" rx="5" ry="3" fill="#F5F5F5"/>
          <ellipse cx="22" cy="33" rx="3" ry="2" fill="#FFB3BA"/>
        </svg>
      );
    case "an-papagaio":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="27" rx="9" ry="8" fill="#43A047"/>
          <circle cx="20" cy="16" r="7" fill="#43A047"/>
          <ellipse cx="20" cy="16" rx="4" ry="3" fill="#FFF176"/>
          <circle cx="17" cy="14" r="1.8" fill="#2C1810"/>
          <circle cx="17.5" cy="13.5" r="0.6" fill="white"/>
          <path d="M19 17 L20 19 L21 17" fill="#FF8F00"/>
          <path d="M13 27 Q8 26 8 22 Q10 20 12 22" fill="#43A047"/>
          <path d="M27 27 Q32 26 32 22 Q30 20 28 22" fill="#43A047"/>
          <path d="M16 32 Q14 36 13 38" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 32 Q26 36 27 38" stroke="#FF8F00" strokeWidth="2" strokeLinecap="round"/>
          <rect x="16" y="19" width="8" height="10" rx="3" fill="#2E7D32"/>
          <path d="M20 21 L20 27" stroke="#1B5E20" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case "an-hamster":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="22" rx="13" ry="11" fill="#FFCCAA"/>
          <ellipse cx="14" cy="24" rx="5" ry="4" fill="#FFDDCC"/>
          <ellipse cx="26" cy="24" rx="5" ry="4" fill="#FFDDCC"/>
          <ellipse cx="13" cy="11" rx="4" ry="5" fill="#FFCCAA"/>
          <ellipse cx="27" cy="11" rx="4" ry="5" fill="#FFCCAA"/>
          <circle cx="17" cy="19" r="2" fill="#2C1810"/>
          <circle cx="23" cy="19" r="2" fill="#2C1810"/>
          <ellipse cx="20" cy="22" rx="3" ry="2.5" fill="#FFB3BA"/>
          <path d="M17 24 L16 26" stroke="#CC8866" strokeWidth="1" strokeLinecap="round"/>
          <path d="M19 24 L19 26" stroke="#CC8866" strokeWidth="1" strokeLinecap="round"/>
          <path d="M21 24 L21 26" stroke="#CC8866" strokeWidth="1" strokeLinecap="round"/>
          <path d="M23 24 L24 26" stroke="#CC8866" strokeWidth="1" strokeLinecap="round"/>
          <ellipse cx="12" cy="30" rx="3" ry="4" fill="#FFCCAA"/>
          <ellipse cx="28" cy="30" rx="3" ry="4" fill="#FFCCAA"/>
        </svg>
      );
    case "an-calopsita":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="26" rx="9" ry="10" fill="#FFEB3B"/>
          <circle cx="20" cy="14" r="7" fill="#FFEB3B"/>
          <circle cx="14" cy="17" r="4" fill="#FF8A65"/>
          <circle cx="26" cy="17" r="4" fill="#FF8A65"/>
          <ellipse cx="20" cy="16" rx="3" ry="2.5" fill="#FFF9C4"/>
          <circle cx="17.5" cy="13.5" r="1.8" fill="#2C1810"/>
          <circle cx="18" cy="13" r="0.6" fill="white"/>
          <path d="M19 16 L20 18 L21 16" fill="#FF8F00"/>
          <path d="M13 14 L10 9 L15 12 Z" fill="#F9A825"/>
          <path d="M27 14 L30 9 L25 12 Z" fill="#F9A825"/>
          <ellipse cx="14" cy="32" rx="3" ry="2" fill="#FF8F00"/>
          <ellipse cx="26" cy="32" rx="3" ry="2" fill="#FF8F00"/>
        </svg>
      );
    default:
      return null;
  }
}

function VestuarioSvg({ id, size }: { id: string; size: number }) {
  const s = size;
  switch (id) {
    // TOPS
    case "vs-camiseta":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M12 8 L8 14 L13 16 L13 34 L27 34 L27 16 L32 14 L28 8 L22 11 L18 11 Z" fill="#42A5F5"/>
          <path d="M18 11 Q20 14 22 11" stroke="#1565C0" strokeWidth="1" fill="none"/>
          <path d="M8 14 L13 16 L13 12 Z" fill="#1E88E5"/>
          <path d="M32 14 L27 16 L27 12 Z" fill="#1E88E5"/>
        </svg>
      );
    case "vs-vestido":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M14 4 Q20 8 26 4 L28 14 L24 16 L26 36 L14 36 L16 16 L12 14 Z" fill="#EC407A"/>
          <path d="M16 36 L14 36 L11 36 Q14 30 14 36" fill="#E91E63"/>
          <path d="M24 36 L26 36 L29 36 Q26 30 26 36" fill="#E91E63"/>
          <path d="M14 4 Q20 2 26 4" stroke="#C2185B" strokeWidth="1.5" fill="none"/>
          <path d="M16 16 L24 16" stroke="#C2185B" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-casaco":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M10 8 L6 16 L12 18 L12 36 L20 36 L20 18 L20 18 L20 36 L28 36 L28 18 L34 16 L30 8 L22 11 L20 13 L18 11 Z" fill="#5C6BC0"/>
          <path d="M18 11 L20 13 L22 11" stroke="#3949AB" strokeWidth="1.2" fill="none"/>
          <rect x="19" y="18" width="2" height="18" fill="#3949AB"/>
          <circle cx="20" cy="22" r="1.2" fill="#9FA8DA"/>
          <circle cx="20" cy="27" r="1.2" fill="#9FA8DA"/>
          <circle cx="20" cy="32" r="1.2" fill="#9FA8DA"/>
          <path d="M6 16 L12 18 L12 14 Z" fill="#3949AB"/>
          <path d="M34 16 L28 18 L28 14 Z" fill="#3949AB"/>
        </svg>
      );
    case "vs-moletom":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M11 8 L7 15 L13 17 L13 34 L27 34 L27 17 L33 15 L29 8 L22 11 L20 13 L18 11 Z" fill="#78909C"/>
          <path d="M18 11 L20 13 L22 11" stroke="#546E7A" strokeWidth="1.2" fill="none"/>
          <path d="M13 34 L11 36 L13 36 L13 34" fill="#546E7A"/>
          <path d="M27 34 L29 36 L27 36 L27 34" fill="#546E7A"/>
          <path d="M13 34 Q20 36 27 34" stroke="#546E7A" strokeWidth="2" fill="none"/>
          <path d="M7 15 L13 17 L13 13 Z" fill="#546E7A"/>
          <path d="M33 15 L27 17 L27 13 Z" fill="#546E7A"/>
        </svg>
      );
    case "vs-camisa":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M12 7 L8 14 L13 16 L13 34 L27 34 L27 16 L32 14 L28 7 L22 10 L20 12 L18 10 Z" fill="#FFFFFF" stroke="#BDBDBD" strokeWidth="0.8"/>
          <path d="M18 10 L20 12 L22 10" stroke="#9E9E9E" strokeWidth="1.2" fill="none"/>
          <rect x="19.5" y="14" width="1" height="20" fill="#BDBDBD"/>
          <circle cx="20" cy="17" r="1" fill="#9E9E9E"/>
          <circle cx="20" cy="21" r="1" fill="#9E9E9E"/>
          <circle cx="20" cy="25" r="1" fill="#9E9E9E"/>
          <path d="M8 14 L13 16 L13 12 Z" fill="#EEEEEE"/>
          <path d="M32 14 L27 16 L27 12 Z" fill="#EEEEEE"/>
          <path d="M12 7 Q20 5 28 7" stroke="#BDBDBD" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-blusa":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M13 10 L9 16 L14 18 L14 34 L26 34 L26 18 L31 16 L27 10 L22 12 Q20 15 18 12 Z" fill="#AB47BC"/>
          <path d="M18 12 Q20 15 22 12" stroke="#7B1FA2" strokeWidth="1.2" fill="none"/>
          <path d="M9 16 L14 18 L14 14 Z" fill="#7B1FA2"/>
          <path d="M31 16 L26 18 L26 14 Z" fill="#7B1FA2"/>
          <path d="M14 22 Q20 24 26 22" stroke="#7B1FA2" strokeWidth="1" fill="none"/>
        </svg>
      );
    // CALCADOS
    case "vs-sapato":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M5 28 Q8 22 14 21 L22 21 Q28 21 34 24 L35 28 L32 30 L8 30 Z" fill="#5D4037"/>
          <path d="M5 28 L8 30 L8 33 L32 33 L32 30 L35 28" fill="#4E342E"/>
          <path d="M14 21 L14 17 Q14 14 17 14 L20 14 Q22 14 22 17 L22 21" fill="#6D4C41"/>
          <path d="M22 21 Q28 20 34 24" stroke="#8D6E63" strokeWidth="1" fill="none"/>
          <path d="M10 26 Q12 25 14 25" stroke="#8D6E63" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case "vs-tenis":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M4 28 Q7 22 14 21 L24 21 Q30 21 36 25 L36 29 L4 29 Z" fill="#EEEEEE"/>
          <path d="M4 29 L4 32 L36 32 L36 29" fill="#E0E0E0"/>
          <path d="M4 32 L4 34 L36 34 L36 32" fill="#BDBDBD"/>
          <path d="M14 21 L14 17 Q14 14 18 14 L22 14 Q24 14 24 17 L24 21" fill="#42A5F5"/>
          <path d="M16 26 Q20 24 24 26" stroke="#42A5F5" strokeWidth="1.5" fill="none"/>
          <path d="M12 27 Q14 26 16 27" stroke="#42A5F5" strokeWidth="1" fill="none"/>
          <path d="M24 23 L30 27" stroke="#BDBDBD" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-sandalia":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M5 28 Q10 24 20 24 Q30 24 35 28 L35 31 L5 31 Z" fill="#FFA726"/>
          <path d="M5 31 L5 33 L35 33 L35 31" fill="#FB8C00"/>
          <path d="M12 24 L12 18 Q12 16 14 16 L15 16 Q17 16 17 18 L17 24" stroke="#F57C00" strokeWidth="2" fill="none"/>
          <path d="M23 24 L23 18 Q23 16 25 16 L26 16 Q28 16 28 18 L28 24" stroke="#F57C00" strokeWidth="2" fill="none"/>
          <path d="M12 20 L28 20" stroke="#F57C00" strokeWidth="2" fill="none"/>
        </svg>
      );
    case "vs-bota":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M12 7 L12 27 Q12 30 16 30 L28 30 Q34 30 34 26 L34 24 Q30 22 26 23 L26 7 Z" fill="#4A2C17"/>
          <path d="M12 27 Q6 28 6 32 L34 32 L34 30 Q28 30 16 30" fill="#3E2010"/>
          <path d="M6 32 L6 35 L34 35 L34 32" fill="#2C1810"/>
          <path d="M13 10 L25 10" stroke="#6D4C41" strokeWidth="1" fill="none"/>
          <path d="M13 14 L25 14" stroke="#6D4C41" strokeWidth="1" fill="none"/>
          <path d="M13 18 L25 18" stroke="#6D4C41" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-chinelo":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="30" rx="15" ry="5" fill="#4CAF50"/>
          <ellipse cx="20" cy="29" rx="15" ry="5" fill="#66BB6A"/>
          <path d="M16 29 Q18 22 20 19 Q22 22 24 29" fill="#43A047"/>
          <ellipse cx="20" cy="30" rx="15" ry="5" fill="none" stroke="#388E3C" strokeWidth="1"/>
        </svg>
      );
    case "vs-salto":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M5 28 Q10 22 18 22 L28 22 Q34 23 35 27 L32 29 L8 29 Z" fill="#E91E63"/>
          <path d="M8 29 L8 31 L32 31 L32 29" fill="#C2185B"/>
          <path d="M8 31 L10 36 L14 36 L14 31" fill="#AD1457"/>
          <path d="M18 22 L18 18 Q18 15 21 15 L23 15 Q25 15 25 18 L25 22" fill="#F06292"/>
          <path d="M12 27 Q16 26 20 27" stroke="#FCE4EC" strokeWidth="1" fill="none"/>
        </svg>
      );
    // ACESSORIOS
    case "vs-chapeu":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M10 22 Q20 8 30 22" fill="#8D6E63"/>
          <ellipse cx="20" cy="22" rx="15" ry="4" fill="#795548"/>
          <path d="M10 22 Q20 8 30 22" stroke="#6D4C41" strokeWidth="1" fill="none"/>
          <path d="M13 16 Q20 12 27 16" stroke="#A1887F" strokeWidth="1.5" fill="none"/>
        </svg>
      );
    case "vs-oculos":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <circle cx="13" cy="20" r="7" fill="#1E88E5" fillOpacity="0.6"/>
          <circle cx="13" cy="20" r="7" stroke="#1565C0" strokeWidth="1.5" fill="none"/>
          <circle cx="27" cy="20" r="7" fill="#1E88E5" fillOpacity="0.6"/>
          <circle cx="27" cy="20" r="7" stroke="#1565C0" strokeWidth="1.5" fill="none"/>
          <path d="M20 20 L20 20" stroke="#1565C0" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 18 Q4 16 3 18" stroke="#1565C0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M34 18 Q36 16 37 18" stroke="#1565C0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "vs-bolsa":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="8" y="16" width="24" height="20" rx="3" fill="#FF7043"/>
          <path d="M14 16 Q14 10 20 10 Q26 10 26 16" stroke="#E64A19" strokeWidth="2" fill="none"/>
          <rect x="16" y="24" width="8" height="5" rx="1.5" fill="#E64A19"/>
          <circle cx="20" cy="26" r="1" fill="#FF7043"/>
          <path d="M8 22 L32 22" stroke="#E64A19" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-relogio":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="15" y="8" width="10" height="6" rx="1" fill="#9E9E9E"/>
          <rect x="15" y="26" width="10" height="6" rx="1" fill="#9E9E9E"/>
          <circle cx="20" cy="20" r="10" fill="#212121"/>
          <circle cx="20" cy="20" r="8" fill="#EEEEEE"/>
          <circle cx="20" cy="20" r="1.5" fill="#212121"/>
          <path d="M20 20 L20 15" stroke="#212121" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 20 L23 20" stroke="#F44336" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="20" cy="13" r="0.8" fill="#9E9E9E"/>
          <circle cx="27" cy="20" r="0.8" fill="#9E9E9E"/>
          <circle cx="20" cy="27" r="0.8" fill="#9E9E9E"/>
          <circle cx="13" cy="20" r="0.8" fill="#9E9E9E"/>
        </svg>
      );
    case "vs-cinto":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="17" width="32" height="6" rx="3" fill="#5D4037"/>
          <rect x="17" y="16" width="7" height="8" rx="1" fill="#9E9E9E"/>
          <rect x="18.5" y="17.5" width="4" height="5" rx="0.5" fill="#5D4037"/>
          <path d="M22 20 L26 20" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "vs-meia":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M14 6 L14 24 Q14 32 20 34 Q28 36 30 30 Q32 26 28 24 L24 24 L24 6 Z" fill="#EF5350"/>
          <path d="M14 6 L24 6 L24 8 L14 8 Z" fill="#FFFFFF"/>
          <path d="M14 22 Q16 20 18 22 Q20 24 22 22 Q24 20 24 22" stroke="#C62828" strokeWidth="1" fill="none"/>
        </svg>
      );
    // BAIXO
    case "vs-calca":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M9 6 L11 24 L17 24 L20 18 L23 24 L29 24 L31 6 Z" fill="#1565C0"/>
          <path d="M11 24 L9 38 L17 38 L20 28 L23 38 L31 38 L29 24" fill="#1E88E5"/>
          <path d="M9 6 L31 6 L31 10 L9 10 Z" fill="#0D47A1"/>
          <path d="M20 8 L20 38" stroke="#1565C0" strokeWidth="1" fill="none"/>
          <path d="M10 8 L12 7" stroke="#1565C0" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case "vs-saia":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M12 10 L28 10 L32 36 L8 36 Z" fill="#F48FB1"/>
          <rect x="11" y="6" width="18" height="6" rx="2" fill="#E91E63"/>
          <path d="M13 18 Q20 20 27 18" stroke="#E91E63" strokeWidth="1" fill="none"/>
          <path d="M11 26 Q20 28 29 26" stroke="#E91E63" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-bermuda":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M9 8 L11 22 L17 22 L20 16 L23 22 L29 22 L31 8 Z" fill="#388E3C"/>
          <path d="M9 8 L31 8 L31 12 L9 12 Z" fill="#2E7D32"/>
          <path d="M11 22 L9 30 L17 30 L20 24 L23 30 L31 30 L29 22" fill="#43A047"/>
          <path d="M20 8 L20 30" stroke="#388E3C" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-legging":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M11 6 L13 24 L18 24 L20 18 L22 24 L27 24 L29 6 Z" fill="#4A148C"/>
          <path d="M13 24 L11 38 L18 38 L20 28 L22 38 L29 38 L27 24" fill="#6A1B9A"/>
          <rect x="10" y="6" width="20" height="4" rx="2" fill="#38006B"/>
          <path d="M11 14 Q20 16 29 14" stroke="#6A1B9A" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-short":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M9 8 L11 20 L17 20 L20 14 L23 20 L29 20 L31 8 Z" fill="#FF8F00"/>
          <path d="M9 8 L31 8 L31 12 L9 12 Z" fill="#E65100"/>
          <path d="M11 20 L9 28 L17 28 L20 22 L23 28 L31 28 L29 20" fill="#FFA000"/>
          <path d="M20 8 L20 28" stroke="#FF8F00" strokeWidth="1" fill="none"/>
        </svg>
      );
    case "vs-jeans":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <path d="M9 6 L11 24 L17 24 L20 18 L23 24 L29 24 L31 6 Z" fill="#1A237E"/>
          <path d="M11 24 L9 38 L17 38 L20 28 L23 38 L31 38 L29 24" fill="#283593"/>
          <path d="M9 6 L31 6 L31 10 L9 10 Z" fill="#0D1642"/>
          <path d="M20 6 L20 38" stroke="#1A237E" strokeWidth="1" fill="none"/>
          <path d="M13 8 Q16 9 19 8" stroke="#3949AB" strokeWidth="0.8" fill="none"/>
          <path d="M11 14 Q14 13 16 14" stroke="#3949AB" strokeWidth="0.8" fill="none"/>
          <path d="M24 14 Q26 13 29 14" stroke="#3949AB" strokeWidth="0.8" fill="none"/>
          <path d="M10 8 Q11 7 12 8 L11 11 Z" fill="#3949AB"/>
        </svg>
      );
    default:
      return null;
  }
}

export function ItemSvg({ id, size = 36 }: { id: string; size?: number }) {
  if (id.startsWith("an-")) return <AnimalSvg id={id} size={size} />;
  if (id.startsWith("vs-")) return <VestuarioSvg id={id} size={size} />;
  return <ProductSvg id={id} size={size} />;
}
