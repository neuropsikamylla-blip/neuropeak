"use client";

import { useRouter } from "next/navigation";
import { DOMAIN_SKILL } from "@/lib/skilltree";

export interface XpFlashData {
  gained: number;
  level: number;
  pct: number;
  leveledUp: boolean;
  domain: string;
}

// Celebração de XP no fim do treino (paleta navy da Jornada). Aparece para os
// pacientes que não veem a comemoração do bichinho (temas não-infantis).
export function XpFlash({ data, playerName }: { data: XpFlashData; playerName: string }) {
  const router = useRouter();
  const skill = DOMAIN_SKILL[data.domain];
  const first = playerName.split(" ")[0];

  return (
    <div style={S.bg}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="xf-card">
        <div className="xf-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="xf-p" style={{ left: `${(i * 8 + 5) % 100}%`, animationDelay: `${(i % 4) * 0.18}s` }}>✦</span>
          ))}
        </div>

        <p className="xf-top">Treino concluído</p>
        <div className="xf-gain">+{data.gained} <span>XP</span></div>

        {data.leveledUp && (
          <div className="xf-levelup">🎉 Subiu para o nível {data.level}!</div>
        )}

        <div className="xf-lvlrow">
          <span>Nível {data.level}</span><span>{data.pct}%</span>
        </div>
        <div className="xf-bar"><i style={{ width: `${data.pct}%` }} /></div>

        {skill && (
          <div className="xf-skill">
            <span className="xf-ic">{skill.icon}</span>
            <span>Este treino desenvolve <b>{skill.skill}</b></span>
          </div>
        )}

        <div className="xf-btns">
          <button className="xf-ghost" onClick={() => router.push("/inicio")}>Continuar</button>
          <button className="xf-go" onClick={() => router.push("/jornada")}>Ver Jornada ⚔️</button>
        </div>
        <p className="xf-hi">Bom treino, {first}!</p>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    background:
      "radial-gradient(700px 500px at 20% -10%, rgba(99,102,241,0.22), transparent 60%)," +
      "radial-gradient(700px 520px at 100% 0%, rgba(139,92,246,0.20), transparent 55%)," +
      "linear-gradient(160deg,#0e2a52 0%,#0a1c3a 45%,#081428 100%)",
  },
};

const CSS = `
.xf-card{position:relative;overflow:hidden;max-width:380px;width:100%;text-align:center;padding:30px 26px 22px;border-radius:24px;
  font-family:"Inter","Segoe UI",system-ui,sans-serif;color:#eaf1ff;
  background:rgba(13,37,71,0.6);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,0.1);box-shadow:0 24px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07)}
.xf-particles{position:absolute;inset:0;pointer-events:none}
.xf-p{position:absolute;top:-10px;color:#fcd34d;font-size:13px;opacity:0;animation:xffall 1.7s ease-in infinite}
@keyframes xffall{0%{transform:translateY(-10px);opacity:0}20%{opacity:1}100%{transform:translateY(320px);opacity:0}}
.xf-top{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#93a4c8}
.xf-gain{font-size:52px;font-weight:900;line-height:1.1;margin:6px 0 2px;
  background:linear-gradient(180deg,#fde68a,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 4px 18px rgba(245,158,11,.5))}
.xf-gain span{font-size:22px}
.xf-levelup{display:inline-block;margin:8px 0 4px;padding:5px 13px;border-radius:999px;font-size:12.5px;font-weight:800;
  color:#3a2503;background:linear-gradient(150deg,#fcd34d,#f59e0b);box-shadow:0 6px 18px rgba(245,158,11,.5)}
.xf-lvlrow{display:flex;justify-content:space-between;font-size:12px;color:#93a4c8;font-weight:700;margin:16px 4px 6px}
.xf-bar{height:12px;border-radius:999px;background:rgba(8,18,40,.7);border:1px solid rgba(255,255,255,.09);overflow:hidden}
.xf-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#6366f1,#8b5cf6 55%,#fbbf24 130%);
  box-shadow:0 0 16px rgba(139,92,246,.7), inset 0 1px 0 rgba(255,255,255,.4);transition:width .8s ease-out}
.xf-skill{display:flex;align-items:center;justify-content:center;gap:9px;margin:16px 0 20px;font-size:13px;color:#c7d3ee}
.xf-skill b{color:#a78bfa}
.xf-ic{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;
  background:rgba(139,92,246,.18);border:1px solid rgba(139,92,246,.35)}
.xf-btns{display:flex;gap:10px}
.xf-btns button{flex:1;border:none;cursor:pointer;border-radius:13px;padding:13px;font-weight:800;font-size:14px}
.xf-ghost{background:rgba(255,255,255,.07);color:#93a4c8;border:1px solid rgba(255,255,255,.1)!important}
.xf-go{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6 60%,#a855f7);box-shadow:0 10px 26px rgba(139,92,246,.5)}
.xf-hi{margin-top:14px;font-size:12px;color:#6b7ea3}
`;
