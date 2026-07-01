"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  SKILLS, SKILL_BY_ID, MAX_SKILL_LEVEL, levelInfo, skillPointsEarned, spentPoints,
  skillLevel, isUnlocked, canEvolve, loadSkills, saveSkills, saveXp,
  type SkillLevels, type SkillId,
} from "@/lib/skilltree";
import { mentorFor } from "@/lib/skilltree-mentor";

interface Props {
  patientId: string;
  playerName: string;
  totalXp: number;
  sessionsToday: number;
  xpToday: number;
  achievementsCount: number;
}

// Segmentos da árvore (coords no viewBox 760×560). `always` = sempre aceso;
// `target` = acende quando aquela habilidade está liberada.
const SEGMENTS: { d: string; color: "gold" | "blue" | "purple"; always?: boolean; target?: SkillId }[] = [
  { d: "M380,46 V120", color: "gold", always: true },
  { d: "M130,120 H630", color: "gold", always: true },
  { d: "M130,120 V180", color: "blue", target: "organizacao" },
  { d: "M380,120 V180", color: "purple", target: "foco" },
  { d: "M630,120 V180", color: "gold", target: "criatividade" },
  { d: "M130,180 V330", color: "blue", target: "planejamento" },
  { d: "M130,330 V480", color: "blue", target: "gestao" },
  { d: "M380,180 V330", color: "purple", target: "disciplina" },
  { d: "M380,330 V480", color: "purple", target: "persistencia" },
  { d: "M630,180 V330", color: "gold", target: "inovacao" },
  { d: "M630,330 V480", color: "gold", target: "resolucao" },
];

const today = () => new Date().toLocaleDateString("sv");

export function SkillTree({ patientId, playerName, totalXp, sessionsToday, xpToday, achievementsCount }: Props) {
  const [skills, setSkills] = useState<SkillLevels>({});
  const [selected, setSelected] = useState<SkillId>("foco");
  const [mentor, setMentor] = useState<{ id: SkillId; level: number } | null>(null);
  const [evolvedToday, setEvolvedToday] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; s: number; c: string; d: number; dur: number }[]>([]);

  useEffect(() => {
    setSkills(loadSkills(patientId));
    saveXp(patientId, totalXp); // reconcilia o XP em cache com o valor real do servidor
    try { setEvolvedToday(localStorage.getItem(`np_skills_evo_${patientId}`) === today()); } catch { /* ignore */ }
    const cols = ["rgba(96,165,250,.7)", "rgba(167,139,250,.7)", "rgba(252,211,77,.65)"];
    setParticles(Array.from({ length: 26 }, (_, i) => ({
      x: Math.random() * 100, y: Math.random() * 100, s: 2 + Math.random() * 5,
      c: cols[i % 3], d: Math.random() * 9, dur: 7 + Math.random() * 7,
    })));
  }, [patientId, totalXp]);

  const lvl = useMemo(() => levelInfo(totalXp), [totalXp]);
  const earned = skillPointsEarned(lvl.level);
  const spent = spentPoints(skills);
  const available = Math.max(0, earned - spent);

  const initials = playerName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  const def = SKILL_BY_ID[selected];
  const selLvl = skillLevel(skills, selected);
  const selUnlocked = isUnlocked(skills, def);
  const selMaxed = selLvl >= MAX_SKILL_LEVEL;
  const nextBenefit = def.benefits[selLvl] ?? def.benefits[def.benefits.length - 1];
  const reqText = def.master
    ? "Requer Organização, Foco e Criatividade no nível 5"
    : def.parent ? `Requer ${SKILL_BY_ID[def.parent].name} nível ${def.reqParentLevel}` : "";

  function evolve() {
    if (!canEvolve(skills, def, available)) return;
    const next = { ...skills, [def.id]: selLvl + 1 };
    setSkills(next); saveSkills(patientId, next);
    try { localStorage.setItem(`np_skills_evo_${patientId}`, today()); } catch { /* ignore */ }
    setEvolvedToday(true);
    setMentor({ id: def.id, level: selLvl + 1 });
  }

  const missions = [
    { txt: "Concluir um treino hoje", done: sessionsToday >= 1 },
    { txt: "Evoluir uma habilidade", done: evolvedToday },
    { txt: "Somar 100 XP hoje", done: xpToday >= 100 },
  ];

  const mc = mentor ? mentorFor(mentor.id) : null;
  const mDef = mentor ? SKILL_BY_ID[mentor.id] : null;

  return (
    <div className={`st-root${mentor ? " show-mentor" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="st-particles">
        {particles.map((p, i) => (
          <span key={i} className="st-p" style={{
            width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%`,
            background: p.c, animationDelay: `${p.d}s`, animationDuration: `${p.dur}s`,
          }} />
        ))}
      </div>

      <div className="st-app">
        {/* HEADER */}
        <header className="glass head">
          <div className="avatar">
            <div className="ring" />
            <div className="pic">{initials}</div>
            <div className="lvbadge">LVL {lvl.level}</div>
          </div>
          <div className="who">
            <h1>{playerName}</h1>
            <div className="role"><span className="chip">Jornada Cognitiva</span></div>
          </div>
          <div className="xp">
            <div className="top">
              <div className="lvl">Nível {lvl.level} <small>→ {lvl.level + 1}</small></div>
              <div className="pct">{lvl.pct}%</div>
            </div>
            <div className="bar"><i style={{ width: `${lvl.pct}%` }} /></div>
            <div className="rest">{lvl.into} / {lvl.forNext} XP · faltam <b>{lvl.forNext - lvl.into} XP</b> para o próximo nível</div>
          </div>
        </header>

        {/* MAIN */}
        <div className="main">
          <section className="glass treewrap">
            <h2>Árvore de Habilidades</h2>
            <div className="legend">
              <span><i className="dot" style={{ background: "var(--gold-l)" }} />Mestre</span>
              <span><i className="dot" style={{ background: "var(--purple-l)" }} />Liberada</span>
              <span><i className="dot" style={{ background: "#26375b" }} />Bloqueada</span>
            </div>
            <div className="tree">
              <svg viewBox="0 0 760 560">
                <defs>
                  <linearGradient id="stgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#d97706" /></linearGradient>
                  <linearGradient id="stgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#74a8ff" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
                  <linearGradient id="stgp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b69cff" /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
                </defs>
                {SEGMENTS.map((seg, i) => {
                  const active = seg.always || (seg.target ? isUnlocked(skills, SKILL_BY_ID[seg.target]) : false);
                  return <path key={i} className={`ln ${active ? `l-${seg.color}` : "l-dim"}`} d={seg.d} />;
                })}
              </svg>

              {SKILLS.map((s) => {
                const l = skillLevel(skills, s.id);
                const open = isUnlocked(skills, s);
                const pct = Math.round((l / MAX_SKILL_LEVEL) * 100);
                const sel = selected === s.id;
                return (
                  <button
                    key={s.id}
                    className={`node${open ? "" : " locked"}${sel ? " sel" : ""}${sel && open ? " glowpulse" : ""}`}
                    style={{ left: s.x - 42, top: s.y - 42 }}
                    onClick={() => setSelected(s.id)}
                    aria-label={s.name}
                  >
                    {open ? (
                      <>
                        <div className={`ring ${s.branch}`} style={{ "--p": `${pct}%` } as React.CSSProperties} />
                        <div className={`core ${s.branch}`}>{s.icon}</div>
                        <div className="lvl">{l}/{MAX_SKILL_LEVEL}</div>
                      </>
                    ) : (
                      <>
                        <div className="ring" />
                        <div className={`core${s.master ? " masterlock" : ""}`}>🔒</div>
                      </>
                    )}
                    <div className="name">{s.name}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* PAINEL */}
          <aside className="glass panel">
            <div className="ph">
              <div className={`picon ${def.branch}`}>{def.icon}</div>
              <div><div className="tag">{def.tag}</div><h3>{def.name}</h3></div>
            </div>
            <p className="desc">{def.desc}</p>
            <div className="lvlrow">
              <div className="k">Nível atual</div>
              <div className="v">{def.master ? (selUnlocked ? "Disponível" : "Bloqueado") : `${selLvl} / ${MAX_SKILL_LEVEL}`}</div>
            </div>
            {!def.master && (
              <div className="pips">
                {Array.from({ length: MAX_SKILL_LEVEL }).map((_, i) => <i key={i} className={i < selLvl ? "on" : ""} />)}
              </div>
            )}
            <div className="nextbox">
              <div className="t">{selMaxed ? "Nível máximo" : selUnlocked ? `Próximo nível (${selLvl + 1}/${MAX_SKILL_LEVEL})` : "Como liberar"}</div>
              <ul>
                {selUnlocked
                  ? (selMaxed ? <li>Habilidade dominada! 🏆</li> : <li>{nextBenefit}</li>)
                  : <li>{reqText}</li>}
              </ul>
            </div>
            <button
              className="evolve"
              disabled={!canEvolve(skills, def, available)}
              onClick={evolve}
            >
              {selMaxed ? "Dominada 🏆" : !selUnlocked ? "Bloqueada 🔒" : available < 1 ? "Sem Skill Points" : "Evoluir"}
              {selUnlocked && !selMaxed && available >= 1 && <span className="cost">✦ <b>1</b> Skill Point</span>}
            </button>
          </aside>
        </div>

        {/* FOOTER */}
        <div className="foot">
          <div className="glass cell">
            <div className="lbl">Skill Points</div>
            <div className="sp"><div className="gem">✦</div><div className="num">{available}<small>disponíveis</small></div></div>
          </div>
          <div className="glass cell">
            <div className="lbl">Conquistas</div>
            <div className="ach">
              {["🏅", "🎯", "🌅", "🔒", "🔒"].map((e, i) => (
                <div key={i} className={`m ${i < achievementsCount ? "on" : i >= 3 ? "lock" : ""}`}>{i < achievementsCount ? e : "🔒"}</div>
              ))}
            </div>
          </div>
          <div className="glass cell">
            <div className="lbl">Missões do dia</div>
            <div className="miss">
              {missions.map((m, i) => (
                <div key={i} className={`q${m.done ? " done" : ""}`}>
                  <span className="b">{m.done ? "✓" : ""}</span><span>{m.txt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass cell profile">
            <Link href="/progresso">Ver Perfil →</Link>
          </div>
        </div>
      </div>

      {/* MENTOR */}
      {mentor && mc && mDef && (
        <div className="overlay" onClick={() => setMentor(null)}>
          <div className="glass mentor" onClick={(e) => e.stopPropagation()}>
            <span className="ai">✦ Mentor IA</span><span className="evo">Habilidade evoluída</span>
            <div className="mh">
              <div className={`ic ${mDef.branch}`}>{mDef.icon}</div>
              <div><h2>{mDef.name}</h2><div className="nl">Nível {mentor.level} desbloqueado</div></div>
            </div>
            <p className="grats">Parabéns, {playerName.split(" ")[0]}! Você evoluiu <b>{mDef.name}</b>. Cada nível aqui também é um passo no seu dia real 👇</p>
            <div className="sec"><div className="st">🧠 O que significa</div><p>{mc.significa}</p></div>
            <div className="sec"><div className="st">⭐ Por que importa</div><p>{mc.importa}</p></div>
            <div className="sec tip"><div className="st">💡 Dica prática</div><p>{mc.dica}</p></div>
            <div className="sec chal"><div className="st">🏆 Mini desafio</div><p>{mc.desafio}</p></div>
            <div className="mbtns">
              <button className="ghost" onClick={() => setMentor(null)}>Agora não</button>
              <button className="accept" onClick={() => setMentor(null)}>Aceitar desafio ✦</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.st-root{position:relative;min-height:calc(100vh - 116px);overflow-x:hidden;
  font-family:"Inter","Segoe UI",system-ui,-apple-system,sans-serif;color:#eaf1ff;
  --blue:#3b82f6;--blue-l:#60a5fa;--purple:#8b5cf6;--purple-l:#a78bfa;--gold:#fbbf24;--gold-l:#fcd34d;--gold-d:#f59e0b;
  --ink:#eaf1ff;--sub:#93a4c8;--dim:#54688f;--glass:rgba(13,37,71,0.55);--stroke:rgba(255,255,255,0.09);
  background:
    radial-gradient(900px 600px at 18% -8%, rgba(99,102,241,0.20), transparent 60%),
    radial-gradient(820px 620px at 100% 0%, rgba(139,92,246,0.18), transparent 55%),
    radial-gradient(900px 700px at 50% 120%, rgba(59,130,246,0.16), transparent 60%),
    linear-gradient(160deg,#0e2a52 0%,#0a1c3a 45%,#081428 100%);}
.st-particles{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.st-p{position:absolute;border-radius:50%;filter:blur(.5px);opacity:.5;animation:stfloat 9s ease-in-out infinite}
@keyframes stfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
.st-root .st-app{position:relative;z-index:1;max-width:1240px;margin:0 auto;padding:20px 18px 28px}
.st-root .glass{background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--stroke);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)}
.st-root .head{display:flex;align-items:center;gap:20px;padding:16px 20px;flex-wrap:wrap}
.st-root .avatar{position:relative;width:70px;height:70px;flex:0 0 auto}
.st-root .avatar .ring{position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(var(--gold-l) 0 75%, rgba(255,255,255,.12) 75% 100%);-webkit-mask:radial-gradient(circle, transparent 28px, #000 29px);mask:radial-gradient(circle, transparent 28px, #000 29px)}
.st-root .avatar .pic{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;color:#fff;background:linear-gradient(150deg,#5b8cff,#8b5cf6 70%);box-shadow:inset 0 2px 8px rgba(255,255,255,.25)}
.st-root .avatar .lvbadge{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:linear-gradient(150deg,var(--gold-l),var(--gold-d));color:#3a2503;font-weight:900;font-size:10.5px;padding:2px 9px;border-radius:999px;box-shadow:0 4px 12px rgba(245,158,11,.5);border:1px solid rgba(255,255,255,.4);white-space:nowrap}
.st-root .who{flex:0 0 auto;min-width:150px}
.st-root .who h1{font-size:19px;font-weight:800}
.st-root .who .role{margin-top:4px}
.st-root .chip{background:rgba(139,92,246,.18);color:var(--purple-l);border:1px solid rgba(139,92,246,.35);padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}
.st-root .xp{flex:1;min-width:240px}
.st-root .xp .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px}
.st-root .xp .lvl{font-weight:900;font-size:14px;color:var(--gold-l)}
.st-root .xp .lvl small{color:var(--sub);font-weight:600;margin-left:6px}
.st-root .xp .pct{font-size:12px;color:var(--sub)}
.st-root .bar{height:13px;border-radius:999px;background:rgba(8,18,40,.7);border:1px solid var(--stroke);overflow:hidden}
.st-root .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#6366f1,#8b5cf6 55%,var(--gold) 130%);box-shadow:0 0 16px rgba(139,92,246,.7), inset 0 1px 0 rgba(255,255,255,.4)}
.st-root .xp .rest{margin-top:7px;font-size:12px;color:var(--sub)}
.st-root .xp .rest b{color:var(--gold-l)}
.st-root .main{display:grid;grid-template-columns:1fr 332px;gap:16px;margin-top:16px}
.st-root .treewrap{padding:16px 8px 6px;position:relative;overflow:auto}
.st-root .treewrap h2{position:absolute;top:15px;left:20px;font-size:12.5px;letter-spacing:2px;color:var(--sub);font-weight:700;text-transform:uppercase}
.st-root .legend{position:absolute;top:13px;right:18px;display:flex;gap:13px;font-size:11px;color:var(--sub)}
.st-root .legend span{display:flex;align-items:center;gap:5px}
.st-root .dot{width:9px;height:9px;border-radius:50%}
.st-root .tree{position:relative;width:760px;height:560px;margin:32px auto 6px}
.st-root .tree svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.st-root .ln{fill:none;stroke-width:3;stroke-linecap:round}
.st-root .l-gold{stroke:url(#stgg);filter:drop-shadow(0 0 6px rgba(251,191,36,.7))}
.st-root .l-blue{stroke:url(#stgb);filter:drop-shadow(0 0 6px rgba(59,130,246,.7))}
.st-root .l-purple{stroke:url(#stgp);filter:drop-shadow(0 0 6px rgba(139,92,246,.7))}
.st-root .l-dim{stroke:#26375b;stroke-width:2.5;stroke-dasharray:5 7}
.st-root .node{position:absolute;width:84px;height:84px;cursor:pointer;background:none;border:none;padding:0;transition:transform .15s}
.st-root .node:hover{transform:translateY(-3px)}
.st-root .node .ring{position:absolute;inset:-6px;border-radius:50%;-webkit-mask:radial-gradient(circle, transparent 41px, #000 42px);mask:radial-gradient(circle, transparent 41px, #000 42px)}
.st-root .node .core{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:31px;border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 2px 10px rgba(255,255,255,.12), 0 10px 26px rgba(0,0,0,.4)}
.st-root .node .lvl{position:absolute;right:-4px;bottom:8px;background:#0a1730;border:1px solid var(--stroke);color:var(--ink);font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:999px}
.st-root .node .name{position:absolute;left:50%;top:92px;transform:translateX(-50%);width:150px;text-align:center;font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.15}
.st-root .node.locked .core{background:linear-gradient(160deg,#16233f,#0f1a30);color:#4a5b7d}
.st-root .node.locked .core.masterlock{background:linear-gradient(160deg,#3a3320,#241d10);color:#caa24a}
.st-root .node.locked .name{color:var(--dim);font-weight:600}
.st-root .node.locked .ring{background:rgba(255,255,255,.04)}
.st-root .ring.blue{background:conic-gradient(var(--blue-l) var(--p,0%), rgba(255,255,255,.08) 0)}
.st-root .ring.purple{background:conic-gradient(var(--purple-l) var(--p,0%), rgba(255,255,255,.08) 0)}
.st-root .ring.gold{background:conic-gradient(var(--gold-l) var(--p,0%), rgba(255,255,255,.08) 0)}
.st-root .core.blue{background:radial-gradient(circle at 38% 30%, #74a8ff, #2563eb 75%)}
.st-root .core.purple{background:radial-gradient(circle at 38% 30%, #b69cff, #6d28d9 75%)}
.st-root .core.gold{background:radial-gradient(circle at 38% 30%, #ffe08a, #d97706 78%)}
.st-root .node.sel{transform:scale(1.08)}
.st-root .node.sel .core{box-shadow:0 0 0 3px rgba(167,139,250,.5), 0 0 30px rgba(139,92,246,.8), inset 0 2px 10px rgba(255,255,255,.2)}
.st-root .glowpulse .core{animation:stgp 2.4s ease-in-out infinite}
@keyframes stgp{0%,100%{box-shadow:0 0 0 3px rgba(167,139,250,.35), 0 0 12px rgba(139,92,246,.5)}50%{box-shadow:0 0 0 3px rgba(167,139,250,.6), 0 0 30px rgba(139,92,246,.95)}}
.st-root .panel{padding:20px}
.st-root .ph{display:flex;align-items:center;gap:13px}
.st-root .picon{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 8px 22px rgba(109,40,217,.5)}
.st-root .picon.blue{background:radial-gradient(circle at 38% 30%, #74a8ff, #2563eb 78%)}
.st-root .picon.purple{background:radial-gradient(circle at 38% 30%, #b69cff, #6d28d9 78%)}
.st-root .picon.gold{background:radial-gradient(circle at 38% 30%, #ffe08a, #d97706 78%)}
.st-root .ph h3{font-size:18px;font-weight:800}
.st-root .ph .tag{font-size:11px;color:var(--purple-l);font-weight:700;text-transform:uppercase;letter-spacing:1px}
.st-root .desc{margin:14px 0 16px;font-size:13.5px;line-height:1.55;color:#c7d3ee}
.st-root .lvlrow{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.st-root .lvlrow .k{font-size:12px;color:var(--sub);font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.st-root .lvlrow .v{font-size:13px;font-weight:800;color:var(--gold-l)}
.st-root .pips{display:flex;gap:6px;margin-bottom:18px}
.st-root .pips i{flex:1;height:8px;border-radius:999px;background:rgba(255,255,255,.09)}
.st-root .pips i.on{background:linear-gradient(90deg,var(--purple),var(--purple-l));box-shadow:0 0 10px rgba(139,92,246,.7)}
.st-root .nextbox{background:rgba(99,102,241,.10);border:1px solid rgba(139,92,246,.28);border-radius:14px;padding:12px 14px;margin-bottom:16px}
.st-root .nextbox .t{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--purple-l);font-weight:800;margin-bottom:7px}
.st-root .nextbox ul{list-style:none;display:flex;flex-direction:column;gap:6px;margin:0;padding:0}
.st-root .nextbox li{font-size:13px;color:#d4ddf3;display:flex;gap:8px;align-items:flex-start}
.st-root .nextbox li::before{content:"✦";color:var(--gold-l);font-size:12px;margin-top:1px}
.st-root .evolve{width:100%;border:none;cursor:pointer;border-radius:14px;padding:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6 60%,#a855f7);box-shadow:0 12px 30px rgba(139,92,246,.5), inset 0 1px 0 rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;gap:9px}
.st-root .evolve:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;background:rgba(255,255,255,.08);color:var(--sub)}
.st-root .evolve .cost{font-size:12px;font-weight:700;background:rgba(0,0,0,.22);padding:3px 9px;border-radius:999px;display:flex;align-items:center;gap:5px}
.st-root .evolve .cost b{color:var(--gold-l)}
.st-root .foot{display:grid;grid-template-columns:.9fr 1.25fr 1.25fr .9fr;gap:14px;margin-top:16px}
.st-root .cell{padding:14px 16px}
.st-root .cell .lbl{font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--sub);font-weight:700;margin-bottom:10px}
.st-root .sp{display:flex;align-items:center;gap:11px}
.st-root .sp .gem{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:linear-gradient(150deg,var(--gold-l),var(--gold-d));box-shadow:0 6px 16px rgba(245,158,11,.45)}
.st-root .sp .num{font-size:25px;font-weight:900;color:var(--gold-l);line-height:1}
.st-root .sp .num small{display:block;font-size:11px;color:var(--sub);font-weight:600}
.st-root .ach{display:flex;gap:9px}
.st-root .ach .m{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;background:rgba(255,255,255,.06);border:1px solid var(--stroke)}
.st-root .ach .m.on{background:radial-gradient(circle at 40% 30%,#ffe08a,#d97706);box-shadow:0 0 14px rgba(245,158,11,.5);border-color:rgba(255,255,255,.3)}
.st-root .ach .m.lock{color:#43557a}
.st-root .miss{display:flex;flex-direction:column;gap:8px}
.st-root .miss .q{display:flex;align-items:center;gap:9px;font-size:12.5px;color:#cdd8f0}
.st-root .miss .q .b{width:17px;height:17px;border-radius:6px;border:1.5px solid var(--dim);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}
.st-root .miss .q.done .b{background:linear-gradient(150deg,#34d399,#059669);border-color:transparent}
.st-root .miss .q.done span{color:var(--sub);text-decoration:line-through}
.st-root .profile{display:flex;align-items:center;justify-content:center}
.st-root .profile a{width:100%;text-align:center;padding:16px 0;border:1px solid rgba(139,92,246,.4);border-radius:14px;background:rgba(139,92,246,.14);color:var(--ink);font-weight:800;font-size:13.5px;text-decoration:none}
.st-root .overlay{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,12,28,.62);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
.st-root .mentor{max-width:560px;width:100%;padding:24px 24px 20px;position:relative;animation:stpop .35s cubic-bezier(.2,1.1,.3,1);max-height:92vh;overflow:auto}
@keyframes stpop{from{transform:scale(.92) translateY(10px);opacity:0}to{transform:none;opacity:1}}
.st-root .mentor .ai{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#0a1730;background:linear-gradient(150deg,var(--gold-l),var(--gold-d));padding:4px 11px;border-radius:999px;box-shadow:0 6px 16px rgba(245,158,11,.45)}
.st-root .mentor .evo{font-size:11px;color:var(--purple-l);font-weight:800;letter-spacing:1.4px;text-transform:uppercase;float:right;margin-top:5px}
.st-root .mentor .mh{display:flex;align-items:center;gap:15px;margin:16px 0 6px}
.st-root .mentor .mh .ic{width:60px;height:60px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:30px}
.st-root .mentor .mh .ic.blue{background:radial-gradient(circle at 38% 30%, #74a8ff, #2563eb 78%);box-shadow:0 0 26px rgba(59,130,246,.6)}
.st-root .mentor .mh .ic.purple{background:radial-gradient(circle at 38% 30%, #b69cff, #6d28d9 78%);box-shadow:0 0 26px rgba(139,92,246,.7)}
.st-root .mentor .mh .ic.gold{background:radial-gradient(circle at 38% 30%, #ffe08a, #d97706 78%);box-shadow:0 0 26px rgba(245,158,11,.6)}
.st-root .mentor .mh h2{font-size:22px;font-weight:900}
.st-root .mentor .mh .nl{font-size:13px;color:var(--gold-l);font-weight:800;margin-top:2px}
.st-root .mentor .grats{font-size:14px;color:#d7e0f5;margin:12px 0 18px;line-height:1.5}
.st-root .sec{border-radius:14px;padding:12px 15px;margin-bottom:11px;border:1px solid var(--stroke);background:rgba(10,23,48,.5)}
.st-root .sec .st{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--sub);margin-bottom:6px}
.st-root .sec p{font-size:13.5px;line-height:1.55;color:#dbe4f7}
.st-root .sec.tip{background:rgba(59,130,246,.10);border-color:rgba(59,130,246,.3)}
.st-root .sec.tip .st{color:var(--blue-l)}
.st-root .sec.chal{background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(245,158,11,.12));border-color:rgba(245,158,11,.35)}
.st-root .sec.chal .st{color:var(--gold-l)}
.st-root .mbtns{display:flex;gap:11px;margin-top:16px}
.st-root .mbtns button{flex:1;border:none;cursor:pointer;border-radius:13px;padding:13px;font-weight:800;font-size:14px}
.st-root .mbtns .ghost{flex:0 0 auto;padding:13px 18px;background:rgba(255,255,255,.06);color:var(--sub);border:1px solid var(--stroke)}
.st-root .mbtns .accept{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6 60%,#a855f7);box-shadow:0 10px 26px rgba(139,92,246,.5)}
@media(max-width:820px){.st-root .main{grid-template-columns:1fr}}
`;
