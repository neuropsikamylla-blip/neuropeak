"use client";

export const MEMORY_ITEMS: Array<{ id: string; label: string }> = [
  { id: "sol",          label: "Sol" },
  { id: "casa",         label: "Casa" },
  { id: "arvore",       label: "Árvore" },
  { id: "estrela",      label: "Estrela" },
  { id: "peixe",        label: "Peixe" },
  { id: "flor",         label: "Flor" },
  { id: "gato",         label: "Gato" },
  { id: "borboleta",    label: "Borboleta" },
  { id: "bicicleta",    label: "Bicicleta" },
  { id: "chave",        label: "Chave" },
  { id: "guarda-chuva", label: "Guarda-chuva" },
  { id: "livro",        label: "Livro" },
  { id: "foguete",      label: "Foguete" },
  { id: "coracao",      label: "Coração" },
  { id: "passaro",      label: "Pássaro" },
  { id: "carro",        label: "Carro" },
  { id: "relogio",      label: "Relógio" },
  { id: "chapeu",       label: "Chapéu" },
];

export function MemorySymbol({ id, size = 36 }: { id: string; size?: number }): JSX.Element {
  const b = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {

    case "sol":
      return (
        <svg {...b} fill="none">
          <defs>
            <radialGradient id="sol-rg" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF9C4"/>
              <stop offset="60%" stopColor="#FFD600"/>
              <stop offset="100%" stopColor="#FF8F00"/>
            </radialGradient>
          </defs>
          {[0,45,90,135,180,225,270,315].map(deg => {
            const rad = deg * Math.PI / 180;
            const x1 = 20 + 10 * Math.sin(rad), y1 = 20 - 10 * Math.cos(rad);
            const x2 = 20 + 17 * Math.sin(rad), y2 = 20 - 17 * Math.cos(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFA000" strokeWidth="2.5" strokeLinecap="round"/>;
          })}
          <circle cx="20" cy="20" r="9" fill="url(#sol-rg)" stroke="#F59E0B" strokeWidth="1.5"/>
          <ellipse cx="17" cy="17" rx="3.5" ry="2" fill="rgba(255,255,255,0.35)" transform="rotate(-30 17 17)"/>
        </svg>
      );

    case "casa":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="casa-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF8E1"/>
              <stop offset="100%" stopColor="#FFE082"/>
            </linearGradient>
          </defs>
          {/* Chaminé */}
          <rect x="26" y="10" width="5" height="9" rx="1" fill="#B0BEC5" stroke="#78909C" strokeWidth="1"/>
          <rect x="25" y="9" width="7" height="2" rx="0.5" fill="#90A4AE"/>
          {/* Telhado */}
          <path d="M6 22 L20 6 L34 22 Z" fill="#EF5350" stroke="#C62828" strokeWidth="1.5"/>
          <path d="M6 22 L20 6 L34 22" fill="none" stroke="#FFCDD2" strokeWidth="0.8" opacity="0.6"/>
          {/* Parede */}
          <rect x="9" y="22" width="22" height="14" rx="1" fill="url(#casa-wall)" stroke="#FFA000" strokeWidth="1.5"/>
          {/* Janelas */}
          <rect x="11" y="25" width="6" height="5" rx="1" fill="#81D4FA" stroke="#0288D1" strokeWidth="1"/>
          <line x1="14" y1="25" x2="14" y2="30" stroke="#0288D1" strokeWidth="0.7"/>
          <line x1="11" y1="27.5" x2="17" y2="27.5" stroke="#0288D1" strokeWidth="0.7"/>
          <rect x="23" y="25" width="6" height="5" rx="1" fill="#81D4FA" stroke="#0288D1" strokeWidth="1"/>
          <line x1="26" y1="25" x2="26" y2="30" stroke="#0288D1" strokeWidth="0.7"/>
          <line x1="23" y1="27.5" x2="29" y2="27.5" stroke="#0288D1" strokeWidth="0.7"/>
          {/* Porta */}
          <rect x="17" y="29" width="6" height="7" rx="1.5" fill="#A1887F" stroke="#6D4C41" strokeWidth="1"/>
          <circle cx="22" cy="32.5" r="0.8" fill="#FFD54F"/>
          {/* Gramado */}
          <rect x="6" y="36" width="28" height="2" rx="1" fill="#66BB6A" opacity="0.7"/>
        </svg>
      );

    case "arvore":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="arv-g" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#A5D6A7"/>
              <stop offset="100%" stopColor="#2E7D32"/>
            </linearGradient>
          </defs>
          {/* Sombra tronco */}
          <rect x="18.5" y="28" width="5" height="9" rx="2" fill="#5D4037"/>
          {/* Camadas da copa */}
          <ellipse cx="20" cy="24" rx="12" ry="8" fill="url(#arv-g)" stroke="#1B5E20" strokeWidth="1.5"/>
          <ellipse cx="20" cy="17" rx="10" ry="7" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1.5"/>
          <ellipse cx="20" cy="10" rx="7" ry="6" fill="#81C784" stroke="#388E3C" strokeWidth="1.5"/>
          {/* Detalhe copa */}
          <ellipse cx="15" cy="14" rx="3" ry="2.5" fill="#A5D6A7" opacity="0.5"/>
          <ellipse cx="25" cy="19" rx="3" ry="2" fill="#A5D6A7" opacity="0.4"/>
          {/* Tronco */}
          <rect x="17.5" y="27" width="5" height="10" rx="2" fill="#795548" stroke="#5D4037" strokeWidth="1"/>
          <line x1="20" y1="28" x2="18" y2="33" stroke="#6D4C41" strokeWidth="0.8"/>
          {/* Chão */}
          <ellipse cx="20" cy="37" rx="7" ry="1.5" fill="#8D6E63" opacity="0.4"/>
        </svg>
      );

    case "estrela":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="est-g" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#FFF9C4"/>
              <stop offset="100%" stopColor="#F9A825"/>
            </linearGradient>
          </defs>
          {/* Sombra */}
          <path d="M20 7 L23.5 15.5 L33.5 15.5 L25.5 22 L28.5 31 L20 26 L11.5 31 L14.5 22 L6.5 15.5 L16.5 15.5 Z"
            fill="#F57F17" opacity="0.3" transform="translate(1,1)"/>
          <path d="M20 7 L23.5 15.5 L33.5 15.5 L25.5 22 L28.5 31 L20 26 L11.5 31 L14.5 22 L6.5 15.5 L16.5 15.5 Z"
            fill="url(#est-g)" stroke="#F59E0B" strokeWidth="1.5"/>
          {/* Brilho */}
          <ellipse cx="18" cy="13" rx="4" ry="2.5" fill="rgba(255,255,255,0.4)" transform="rotate(-25 18 13)"/>
        </svg>
      );

    case "peixe":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="px-g" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#4FC3F7"/>
              <stop offset="100%" stopColor="#1565C0"/>
            </linearGradient>
          </defs>
          {/* Cauda */}
          <path d="M28 20 L38 13 L38 27 Z" fill="#42A5F5" stroke="#1565C0" strokeWidth="1"/>
          {/* Corpo */}
          <ellipse cx="18" cy="20" rx="13" ry="9" fill="url(#px-g)" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Escamas */}
          <path d="M14 15 Q17 13 20 15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          <path d="M10 18 Q13 16 16 18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <path d="M14 22 Q17 20 20 22" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          {/* Nadadeira dorsal */}
          <path d="M16 11 Q19 8 23 11" fill="#1E88E5" stroke="#1565C0" strokeWidth="1"/>
          {/* Olho */}
          <circle cx="10" cy="18" r="2.5" fill="white" stroke="#1565C0" strokeWidth="1"/>
          <circle cx="10.5" cy="18" r="1.2" fill="#1A237E"/>
          <circle cx="10.9" cy="17.5" r="0.4" fill="white"/>
          {/* Boca */}
          <path d="M5 20 Q6 21.5 5 23" fill="none" stroke="#1565C0" strokeWidth="1"/>
          {/* Bolhas */}
          <circle cx="4" cy="16" r="1" fill="none" stroke="#90CAF9" strokeWidth="0.8"/>
          <circle cx="2" cy="13" r="0.7" fill="none" stroke="#90CAF9" strokeWidth="0.7"/>
        </svg>
      );

    case "flor":
      return (
        <svg {...b} fill="none">
          {/* Caule */}
          <path d="M20 34 Q18 30 20 27" stroke="#388E3C" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 31 Q14 29 13 26" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 30 Q26 28 27 25" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Folhinhas */}
          <ellipse cx="14.5" cy="26" rx="3" ry="1.5" fill="#66BB6A" transform="rotate(-40 14.5 26)"/>
          <ellipse cx="25.5" cy="25" rx="3" ry="1.5" fill="#66BB6A" transform="rotate(40 25.5 25)"/>
          {/* Pétalas */}
          {[0,60,120,180,240,300].map(deg => {
            const rad = deg * Math.PI / 180;
            const cx = 20 + 8 * Math.sin(rad), cy = 20 - 8 * Math.cos(rad);
            return <ellipse key={deg} cx={cx} cy={cy} rx="4.5" ry="3"
              fill="#F48FB1" stroke="#C2185B" strokeWidth="1"
              transform={`rotate(${deg} ${cx} ${cy})`}/>;
          })}
          {/* Centro */}
          <circle cx="20" cy="20" r="5" fill="#FDD835" stroke="#F9A825" strokeWidth="1.5"/>
          <circle cx="18.5" cy="18.5" r="1.2" fill="#F57F17" opacity="0.7"/>
          <circle cx="21" cy="18" r="0.8" fill="#F57F17" opacity="0.5"/>
          <circle cx="19" cy="21" r="0.7" fill="#F57F17" opacity="0.5"/>
        </svg>
      );

    case "gato":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="gato-g" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#ECEFF1"/>
              <stop offset="100%" stopColor="#B0BEC5"/>
            </linearGradient>
          </defs>
          {/* Rabo */}
          <path d="M32 30 Q40 25 38 17 Q37 14 34 16" fill="none" stroke="#90A4AE" strokeWidth="3" strokeLinecap="round"/>
          {/* Corpo */}
          <ellipse cx="20" cy="28" rx="12" ry="10" fill="url(#gato-g)" stroke="#78909C" strokeWidth="1.5"/>
          {/* Cabeça */}
          <circle cx="20" cy="16" r="10" fill="url(#gato-g)" stroke="#78909C" strokeWidth="1.5"/>
          {/* Orelhas */}
          <path d="M10 10 L7 2 L16 9 Z" fill="#CFD8DC" stroke="#78909C" strokeWidth="1"/>
          <path d="M30 10 L33 2 L24 9 Z" fill="#CFD8DC" stroke="#78909C" strokeWidth="1"/>
          <path d="M11 9.5 L9 4 L15 9 Z" fill="#F48FB1" opacity="0.8"/>
          <path d="M29 9.5 L31 4 L25 9 Z" fill="#F48FB1" opacity="0.8"/>
          {/* Olhos */}
          <ellipse cx="15" cy="15" rx="3" ry="3.5" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1"/>
          <ellipse cx="25" cy="15" rx="3" ry="3.5" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1"/>
          <ellipse cx="15" cy="15" rx="1.2" ry="2.5" fill="#1A237E"/>
          <ellipse cx="25" cy="15" rx="1.2" ry="2.5" fill="#1A237E"/>
          <circle cx="14.5" cy="13.5" r="0.7" fill="white"/>
          <circle cx="24.5" cy="13.5" r="0.7" fill="white"/>
          {/* Nariz */}
          <path d="M18.5 19.5 L20 21 L21.5 19.5 L20 18.5 Z" fill="#F06292"/>
          {/* Boca */}
          <path d="M17 22 Q20 24.5 23 22" fill="none" stroke="#78909C" strokeWidth="1.2"/>
          {/* Bigodes */}
          <line x1="5" y1="19" x2="16" y2="20" stroke="#B0BEC5" strokeWidth="0.9"/>
          <line x1="5" y1="21.5" x2="16" y2="21.5" stroke="#B0BEC5" strokeWidth="0.9"/>
          <line x1="24" y1="20" x2="35" y2="19" stroke="#B0BEC5" strokeWidth="0.9"/>
          <line x1="24" y1="21.5" x2="35" y2="21.5" stroke="#B0BEC5" strokeWidth="0.9"/>
          {/* Padrão pelagem */}
          <path d="M16 25 Q20 23 24 25" fill="none" stroke="#90A4AE" strokeWidth="0.8" opacity="0.6"/>
        </svg>
      );

    case "borboleta":
      return (
        <svg {...b} fill="none">
          <defs>
            <radialGradient id="bfly-uw" cx="50%" cy="60%" r="70%">
              <stop offset="0%" stopColor="#CE93D8"/>
              <stop offset="100%" stopColor="#6A1B9A"/>
            </radialGradient>
            <radialGradient id="bfly-lw" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#E1BEE7"/>
              <stop offset="100%" stopColor="#8E24AA"/>
            </radialGradient>
          </defs>
          {/* Asas superiores */}
          <path d="M20 16 Q6 4 4 16 Q4 24 20 22 Z" fill="url(#bfly-uw)" stroke="#6A1B9A" strokeWidth="1.2"/>
          <path d="M20 16 Q34 4 36 16 Q36 24 20 22 Z" fill="url(#bfly-uw)" stroke="#6A1B9A" strokeWidth="1.2"/>
          {/* Padrão asas superiores */}
          <circle cx="11" cy="14" r="2.5" fill="#FFF176" opacity="0.7"/>
          <circle cx="29" cy="14" r="2.5" fill="#FFF176" opacity="0.7"/>
          {/* Asas inferiores */}
          <path d="M20 24 Q6 22 5 30 Q6 36 20 30 Z" fill="url(#bfly-lw)" stroke="#6A1B9A" strokeWidth="1.2"/>
          <path d="M20 24 Q34 22 35 30 Q34 36 20 30 Z" fill="url(#bfly-lw)" stroke="#6A1B9A" strokeWidth="1.2"/>
          {/* Corpo */}
          <ellipse cx="20" cy="22" rx="2" ry="10" fill="#4A148C" stroke="#311B92" strokeWidth="1"/>
          <circle cx="20" cy="12" r="2.5" fill="#4A148C" stroke="#311B92" strokeWidth="1"/>
          {/* Antenas */}
          <path d="M20 11 Q15 5 12 3" fill="none" stroke="#6A1B9A" strokeWidth="1.2"/>
          <path d="M20 11 Q25 5 28 3" fill="none" stroke="#6A1B9A" strokeWidth="1.2"/>
          <circle cx="12" cy="3" r="1.5" fill="#CE93D8"/>
          <circle cx="28" cy="3" r="1.5" fill="#CE93D8"/>
        </svg>
      );

    case "bicicleta":
      return (
        <svg {...b} fill="none">
          {/* Rodas */}
          <circle cx="10" cy="28" r="8" fill="none" stroke="#1565C0" strokeWidth="2"/>
          <circle cx="30" cy="28" r="8" fill="none" stroke="#1565C0" strokeWidth="2"/>
          {/* Raios dianteiros */}
          {[0,60,120].map(deg => {
            const r = deg * Math.PI / 180;
            return <line key={deg} x1={30 + 8*Math.sin(r)} y1={28 - 8*Math.cos(r)}
              x2={30 - 8*Math.sin(r)} y2={28 + 8*Math.cos(r)} stroke="#90CAF9" strokeWidth="0.8"/>;
          })}
          {/* Raios traseiros */}
          {[30,90,150].map(deg => {
            const r = deg * Math.PI / 180;
            return <line key={deg} x1={10 + 8*Math.sin(r)} y1={28 - 8*Math.cos(r)}
              x2={10 - 8*Math.sin(r)} y2={28 + 8*Math.cos(r)} stroke="#90CAF9" strokeWidth="0.8"/>;
          })}
          {/* Cubos */}
          <circle cx="10" cy="28" r="2" fill="#1565C0"/>
          <circle cx="30" cy="28" r="2" fill="#1565C0"/>
          {/* Quadro */}
          <line x1="10" y1="28" x2="20" y2="16" stroke="#EF6C00" strokeWidth="2.5"/>
          <line x1="30" y1="28" x2="20" y2="16" stroke="#EF6C00" strokeWidth="2.5"/>
          <line x1="20" y1="16" x2="30" y2="28" stroke="#EF6C00" strokeWidth="2.5"/>
          <line x1="20" y1="16" x2="22" y2="28" stroke="#EF6C00" strokeWidth="2.2"/>
          {/* Guidão */}
          <line x1="20" y1="16" x2="28" y2="14" stroke="#455A64" strokeWidth="2.5"/>
          <line x1="26" y1="12" x2="30" y2="12" stroke="#455A64" strokeWidth="2.5"/>
          {/* Selim */}
          <line x1="20" y1="16" x2="19" y2="12" stroke="#455A64" strokeWidth="2"/>
          <line x1="16" y1="11" x2="22" y2="11" stroke="#455A64" strokeWidth="3" strokeLinecap="round"/>
          {/* Pedal */}
          <circle cx="22" cy="28" r="2" fill="#455A64"/>
          <line x1="20" y1="28" x2="24" y2="30" stroke="#455A64" strokeWidth="1.5"/>
        </svg>
      );

    case "chave":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="chave-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF9C4"/>
              <stop offset="100%" stopColor="#F9A825"/>
            </linearGradient>
          </defs>
          {/* Anel da chave */}
          <circle cx="12" cy="15" r="9" fill="url(#chave-g)" stroke="#E65100" strokeWidth="2"/>
          <circle cx="12" cy="15" r="5" fill="white" stroke="#E65100" strokeWidth="1.5"/>
          <circle cx="12" cy="15" r="2.5" fill="#FFA000"/>
          {/* Corpo */}
          <rect x="20" y="13" width="17" height="4" rx="2" fill="url(#chave-g)" stroke="#E65100" strokeWidth="1.5"/>
          {/* Dentes */}
          <rect x="25" y="17" width="3" height="4" rx="1" fill="#F9A825" stroke="#E65100" strokeWidth="1"/>
          <rect x="30" y="17" width="3" height="5" rx="1" fill="#F9A825" stroke="#E65100" strokeWidth="1"/>
          <rect x="35" y="17" width="2" height="3" rx="0.5" fill="#F9A825" stroke="#E65100" strokeWidth="1"/>
          {/* Brilho */}
          <ellipse cx="10" cy="12" rx="3" ry="2" fill="rgba(255,255,255,0.4)" transform="rotate(-20 10 12)"/>
        </svg>
      );

    case "guarda-chuva":
      return (
        <svg {...b} fill="none">
          <defs>
            <radialGradient id="gc-g" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#90CAF9"/>
              <stop offset="100%" stopColor="#1565C0"/>
            </radialGradient>
          </defs>
          {/* Cúpula */}
          <path d="M3 21 Q3 5 20 5 Q37 5 37 21 Z" fill="url(#gc-g)" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Divisórias */}
          <line x1="20" y1="5" x2="20" y2="21" stroke="#1976D2" strokeWidth="1" opacity="0.5"/>
          <line x1="11" y1="6.5" x2="8" y2="21" stroke="#1976D2" strokeWidth="1" opacity="0.5"/>
          <line x1="29" y1="6.5" x2="32" y2="21" stroke="#1976D2" strokeWidth="1" opacity="0.5"/>
          {/* Borda ondulada */}
          <path d="M3 21 Q6 25 9 21 Q12 25 15 21 Q18 25 21 21 Q24 25 27 21 Q30 25 33 21 Q35 25 37 21"
            fill="none" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Cabo */}
          <line x1="20" y1="21" x2="20" y2="35" stroke="#455A64" strokeWidth="3" strokeLinecap="round"/>
          <path d="M20 35 Q20 40 15 38" fill="none" stroke="#455A64" strokeWidth="3" strokeLinecap="round"/>
          {/* Brilho */}
          <path d="M8 10 Q14 7 18 10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
        </svg>
      );

    case "livro":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="livro-l" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF9A9A"/>
              <stop offset="100%" stopColor="#E53935"/>
            </linearGradient>
          </defs>
          {/* Sombra */}
          <ellipse cx="20" cy="37" rx="14" ry="2" fill="#00000015"/>
          {/* Páginas esquerda */}
          <path d="M3 8 L3 34 L19 32 L19 6 Z" fill="#FFF9C4" stroke="#F9A825" strokeWidth="1.5"/>
          {/* Páginas direita */}
          <path d="M37 8 L37 34 L21 32 L21 6 Z" fill="#FFF8E1" stroke="#FFA000" strokeWidth="1.5"/>
          {/* Lombada */}
          <rect x="17.5" y="5.5" width="5" height="29" rx="1" fill="url(#livro-l)" stroke="#C62828" strokeWidth="1"/>
          {/* Linhas de texto esquerda */}
          {[13,17,21,25,29].map(y => (
            <line key={y} x1="6" y1={y} x2="17" y2={y - 0.5} stroke="#BDBDBD" strokeWidth="0.9" opacity="0.8"/>
          ))}
          {/* Linhas de texto direita */}
          {[13,17,21,25,29].map(y => (
            <line key={y} x1="23" y1={y - 0.5} x2="34" y2={y} stroke="#BDBDBD" strokeWidth="0.9" opacity="0.8"/>
          ))}
          {/* Marcador */}
          <rect x="22" y="5.5" width="2.5" height="10" rx="0.5" fill="#FF7043"/>
        </svg>
      );

    case "foguete":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="fog-g" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#E3F2FD"/>
              <stop offset="60%" stopColor="#9575CD"/>
              <stop offset="100%" stopColor="#4527A0"/>
            </linearGradient>
          </defs>
          {/* Chama */}
          <path d="M16 30 Q18 38 20 40 Q22 38 24 30" fill="#FF6D00" opacity="0.9"/>
          <path d="M17 30 Q19 36 20 38 Q21 36 23 30" fill="#FFD600" opacity="0.9"/>
          <path d="M18.5 30 Q19.5 34 20 35 Q20.5 34 21.5 30" fill="white" opacity="0.7"/>
          {/* Aletas */}
          <path d="M13 25 L7 33 L14 30 Z" fill="#EF5350" stroke="#C62828" strokeWidth="1"/>
          <path d="M27 25 L33 33 L26 30 Z" fill="#EF5350" stroke="#C62828" strokeWidth="1"/>
          {/* Corpo */}
          <path d="M20 2 Q28 7 28 28 L20 31 L12 28 Q12 7 20 2 Z" fill="url(#fog-g)" stroke="#4527A0" strokeWidth="1.5"/>
          {/* Janela */}
          <circle cx="20" cy="16" r="4.5" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1.5"/>
          <circle cx="20" cy="16" r="3" fill="#81D4FA"/>
          <circle cx="18.5" cy="14.5" r="1.2" fill="rgba(255,255,255,0.6)"/>
          {/* Detalhe corpo */}
          <line x1="16" y1="22" x2="24" y2="22" stroke="#7E57C2" strokeWidth="1" opacity="0.6"/>
          <line x1="15" y1="25" x2="25" y2="25" stroke="#7E57C2" strokeWidth="1" opacity="0.6"/>
        </svg>
      );

    case "coracao":
      return (
        <svg {...b} fill="none">
          <defs>
            <radialGradient id="cor-g" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFCDD2"/>
              <stop offset="60%" stopColor="#E91E63"/>
              <stop offset="100%" stopColor="#880E4F"/>
            </radialGradient>
          </defs>
          {/* Sombra */}
          <path d="M20 36 Q5 27 5 16 Q5 7 13 7 Q17.5 7 20 12 Q22.5 7 27 7 Q35 7 35 16 Q35 27 20 36 Z"
            fill="#880E4F" opacity="0.25" transform="translate(1.5,2)"/>
          {/* Coração */}
          <path d="M20 35 Q5 26 5 15.5 Q5 7 13 7 Q17.5 7 20 11.5 Q22.5 7 27 7 Q35 7 35 15.5 Q35 26 20 35 Z"
            fill="url(#cor-g)" stroke="#C2185B" strokeWidth="1.5"/>
          {/* Brilho */}
          <ellipse cx="14" cy="12" rx="4.5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-30 14 12)"/>
        </svg>
      );

    case "passaro":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="pass-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#90CAF9"/>
              <stop offset="100%" stopColor="#1565C0"/>
            </linearGradient>
          </defs>
          {/* Asa inferior */}
          <path d="M15 22 Q10 26 5 24 Q8 20 15 22 Z" fill="#64B5F6" stroke="#1565C0" strokeWidth="1"/>
          {/* Corpo */}
          <ellipse cx="20" cy="22" rx="10" ry="7" fill="url(#pass-g)" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Asa superior */}
          <path d="M16 18 Q10 10 4 12 Q6 18 16 20 Z" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.2"/>
          <path d="M22 17 Q28 9 34 11 Q32 17 22 19 Z" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.2"/>
          {/* Cabeça */}
          <circle cx="28" cy="18" r="6.5" fill="#64B5F6" stroke="#1565C0" strokeWidth="1.5"/>
          {/* Olho */}
          <circle cx="30" cy="17" r="2" fill="white" stroke="#1565C0" strokeWidth="0.8"/>
          <circle cx="30.5" cy="17" r="1" fill="#1A237E"/>
          <circle cx="30.8" cy="16.5" r="0.4" fill="white"/>
          {/* Bico */}
          <path d="M34 18 L39 19 L34 20 Z" fill="#FFA000" stroke="#E65100" strokeWidth="0.8"/>
          {/* Cauda */}
          <path d="M11 24 L4 28 M11 24 L5 24 M11 24 L4 20" fill="none" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round"/>
          {/* Pernas */}
          <line x1="20" y1="29" x2="18" y2="35" stroke="#FFA000" strokeWidth="1.5"/>
          <line x1="24" y1="29" x2="26" y2="35" stroke="#FFA000" strokeWidth="1.5"/>
          <path d="M15 35 L18 35 M22 35 L26 35 M28 35 L30 35" stroke="#FFA000" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );

    case "carro":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="car-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#90CAF9"/>
              <stop offset="100%" stopColor="#1565C0"/>
            </linearGradient>
          </defs>
          {/* Sombra */}
          <ellipse cx="20" cy="37" rx="16" ry="2.5" fill="#00000020"/>
          {/* Carroceria */}
          <rect x="3" y="20" width="34" height="12" rx="3" fill="url(#car-g)" stroke="#0D47A1" strokeWidth="1.5"/>
          {/* Cabine */}
          <path d="M9 20 L13 10 L27 10 L31 20" fill="#64B5F6" stroke="#0D47A1" strokeWidth="1.5"/>
          {/* Janela esquerda */}
          <rect x="13" y="11" width="6" height="8" rx="1.5" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1"/>
          {/* Janela direita */}
          <rect x="21" y="11" width="6" height="8" rx="1.5" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1"/>
          {/* Rodas */}
          <circle cx="11" cy="32" r="5.5" fill="#263238" stroke="#1A237E" strokeWidth="1.5"/>
          <circle cx="29" cy="32" r="5.5" fill="#263238" stroke="#1A237E" strokeWidth="1.5"/>
          <circle cx="11" cy="32" r="2.5" fill="#78909C"/>
          <circle cx="29" cy="32" r="2.5" fill="#78909C"/>
          <circle cx="11" cy="32" r="1" fill="#B0BEC5"/>
          <circle cx="29" cy="32" r="1" fill="#B0BEC5"/>
          {/* Farol */}
          <ellipse cx="35" cy="24" rx="2" ry="1.5" fill="#FFF9C4" stroke="#F9A825" strokeWidth="0.8"/>
          {/* Maçaneta */}
          <rect x="19" y="24" width="5" height="1.5" rx="0.75" fill="#90CAF9" stroke="#64B5F6" strokeWidth="0.5"/>
          {/* Brilho capô */}
          <path d="M8 21 Q14 19 18 20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
        </svg>
      );

    case "relogio":
      return (
        <svg {...b} fill="none">
          <defs>
            <radialGradient id="rel-g" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FAFAFA"/>
              <stop offset="100%" stopColor="#E0E0E0"/>
            </radialGradient>
          </defs>
          {/* Pulseira */}
          <rect x="15" y="1" width="10" height="5" rx="2" fill="#78909C" stroke="#546E7A" strokeWidth="1"/>
          <rect x="15" y="34" width="10" height="5" rx="2" fill="#78909C" stroke="#546E7A" strokeWidth="1"/>
          {/* Caixa */}
          <rect x="5" y="7" width="30" height="26" rx="7" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
          <rect x="7" y="9" width="26" height="22" rx="5" fill="url(#rel-g)" stroke="#90A4AE" strokeWidth="1"/>
          {/* Marcas horas */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
            const r = deg * Math.PI / 180;
            const r1 = deg % 90 === 0 ? 9.5 : 10;
            const r2 = deg % 90 === 0 ? 7.5 : 9;
            return <line key={deg}
              x1={20 + r1*Math.sin(r)} y1={20 - r1*Math.cos(r)}
              x2={20 + r2*Math.sin(r)} y2={20 - r2*Math.cos(r)}
              stroke={deg % 90 === 0 ? "#37474F" : "#90A4AE"}
              strokeWidth={deg % 90 === 0 ? 1.8 : 0.9}/>;
          })}
          {/* Ponteiros */}
          <line x1="20" y1="20" x2="16" y2="13" stroke="#263238" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="20" x2="25" y2="16" stroke="#455A64" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Segundo */}
          <line x1="20" y1="20" x2="22" y2="27" stroke="#EF5350" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="1.8" fill="#EF5350"/>
          <circle cx="20" cy="20" r="0.8" fill="white"/>
          {/* Coroa */}
          <rect x="33" y="17" width="3" height="6" rx="1.5" fill="#78909C" stroke="#546E7A" strokeWidth="0.8"/>
        </svg>
      );

    case "chapeu":
      return (
        <svg {...b} fill="none">
          <defs>
            <linearGradient id="chap-g" x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#FFCA28"/>
              <stop offset="100%" stopColor="#E65100"/>
            </linearGradient>
          </defs>
          {/* Aba */}
          <ellipse cx="20" cy="30" rx="18" ry="5" fill="url(#chap-g)" stroke="#BF360C" strokeWidth="1.5"/>
          <ellipse cx="20" cy="30" rx="18" ry="5" fill="none" stroke="#FF8F00" strokeWidth="0.6" opacity="0.5"/>
          {/* Copa */}
          <path d="M9 30 Q9 10 20 10 Q31 10 31 30" fill="#FFA000" stroke="#E65100" strokeWidth="1.5"/>
          {/* Faixa */}
          <path d="M9.5 25 Q9.5 22 20 22 Q30.5 22 30.5 25" fill="none" stroke="#BF360C" strokeWidth="3"/>
          {/* Detalhe copa */}
          <path d="M12 24 Q16 20 20 20 Q24 20 28 24" fill="none" stroke="#FF8F00" strokeWidth="0.8" opacity="0.5"/>
          {/* Brilho */}
          <ellipse cx="16" cy="16" rx="4" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-20 16 16)"/>
        </svg>
      );

    default:
      return (
        <svg {...b} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="6" y="6" width="28" height="28" rx="4" />
          <text x="20" y="24" fontSize="9" textAnchor="middle"
            fill="currentColor" stroke="none" fontWeight="bold">
            {id.slice(0, 3).toUpperCase()}
          </text>
        </svg>
      );
  }
}
