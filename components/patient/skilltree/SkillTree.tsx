"use client";

import { useEffect, useMemo, useState } from "react";
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

// Linhas da árvore (viewBox 760×560). `always` = sempre acesa; `target` = acende
// quando aquela habilidade está liberada.
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

// Losangos ornamentais nos encontros das linhas.
const DIAMONDS: { x: number; y: number; always?: boolean; target?: SkillId }[] = [
  { x: 130, y: 120, always: true }, { x: 380, y: 120, always: true }, { x: 630, y: 120, always: true },
  { x: 130, y: 255, target: "planejamento" }, { x: 380, y: 255, target: "disciplina" }, { x: 630, y: 255, target: "inovacao" },
  { x: 130, y: 405, target: "gestao" }, { x: 380, y: 405, target: "persistencia" }, { x: 630, y: 405, target: "resolucao" },
];

const today = () => new Date().toLocaleDateString("sv");

export function SkillTree({ patientId, playerName, totalXp, sessionsToday, xpToday, achievementsCount }: Props) {
  const [skills, setSkills] = useState<SkillLevels>({});
  const [selected, setSelected] = useState<SkillId>("foco");
  const [mentor, setMentor] = useState<{ id: SkillId; level: number } | null>(null);
  const [evolvedToday, setEvolvedToday] = useState(false);

  useEffect(() => {
    setSkills(loadSkills(patientId));
    saveXp(patientId, totalXp);
    try { setEvolvedToday(localStorage.getItem(`np_skills_evo_${patientId}`) === today()); } catch { /* ignore */ }
  }, [patientId, totalXp]);

  const lvl = useMemo(() => levelInfo(totalXp), [totalXp]);
  const earned = skillPointsEarned(lvl.level);
  const spent = spentPoints(skills);
  const energy = Math.max(0, earned - spent);

  const def = SKILL_BY_ID[selected];
  const selLvl = skillLevel(skills, selected);
  const selUnlocked = isUnlocked(skills, def);
  const selMaxed = selLvl >= MAX_SKILL_LEVEL;
  const nextBenefit = def.benefits[selLvl] ?? def.benefits[def.benefits.length - 1];
  const reqText = def.master
    ? "Requer Organização, Foco e Criatividade no nível 5"
    : def.parent ? `Requer ${SKILL_BY_ID[def.parent].name} nível ${def.reqParentLevel}` : "";
  const rewardDesc = def.master
    ? "Emblema de Mestre e o guia definitivo, reunindo tudo o que você desenvolveu na jornada."
    : `Guia completo com técnicas, exercícios e hábitos para desenvolver ${def.name.toLowerCase()} no seu dia a dia.`;

  function evolve() {
    if (!canEvolve(skills, def, energy)) return;
    const next = { ...skills, [def.id]: selLvl + 1 };
    setSkills(next); saveSkills(patientId, next);
    try { localStorage.setItem(`np_skills_evo_${patientId}`, today()); } catch { /* ignore */ }
    setEvolvedToday(true);
    setMentor({ id: def.id, level: selLvl + 1 });
  }

  const missions = [
    { txt: "Concluir um treino hoje", done: sessionsToday >= 1, tag: sessionsToday >= 1 ? "1/1 ✓" : "0/1" },
    { txt: "Evoluir uma habilidade", done: evolvedToday, tag: evolvedToday ? "1/1 ✓" : "0/1" },
    { txt: "Somar 100 XP no dia", done: xpToday >= 100, tag: `${Math.min(100, xpToday)}/100` },
  ];
  const missDone = missions.filter((m) => m.done).length;
  const missLeft = missions.length - missDone;

  const mc = mentor ? mentorFor(mentor.id) : null;
  const mDef = mentor ? SKILL_BY_ID[mentor.id] : null;

  const evolveLabel = selMaxed ? "DOMINADA" : !selUnlocked ? "BLOQUEADA" : energy < 1 ? "SEM ENERGIA" : "EVOLUIR";
  const canDoEvolve = canEvolve(skills, def, energy);

  return (
    <div className={`st-root${mentor ? " show-mentor" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="st-app">
        {/* HEADER */}
        <div className="head">
          <div className="usr">
            <div className="nm">{playerName.toUpperCase()}</div>
            <div className="lv">NÍVEL {lvl.level}</div>
            <div className="xpbar"><i style={{ width: `${lvl.pct}%` }} /></div>
          </div>
          <div className="title">
            <h1>ÁRVORE DE HABILIDADES</h1>
            <div className="flr"><span className="d">◆</span><span className="ln" /><span className="d">◆</span><span className="ln" /><span className="d">◆</span></div>
          </div>
          <div className="energy"><span className="bolt">⚡</span><span className="n">{energy}</span><span className="lb">ENERGIA DISPONÍVEL</span></div>
        </div>

        <div className="main">
          {/* TREE */}
          <section className="glass frame treewrap">
            <div className="legend">
              <span><i className="dot" style={{ background: "#fcd34d" }} />DOMINADA</span>
              <span><i className="dot" style={{ background: "#b69cff" }} />LIBERADA</span>
              <span><i className="dot" style={{ background: "#3a3466" }} />BLOQUEADA</span>
            </div>
            <div className="tree">
              <svg viewBox="0 0 760 560">
                <defs>
                  <linearGradient id="stgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#c98a1e" /></linearGradient>
                  <linearGradient id="stgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cb0ff" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
                  <linearGradient id="stgp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b69cff" /><stop offset="1" stopColor="#6d28d9" /></linearGradient>
                </defs>
                {SEGMENTS.map((seg, i) => {
                  const active = seg.always || (seg.target ? isUnlocked(skills, SKILL_BY_ID[seg.target]) : false);
                  return <path key={i} className={`ln ${active ? `l-${seg.color}` : "l-dim"}`} d={seg.d} />;
                })}
              </svg>
              {DIAMONDS.map((dm, i) => {
                const active = dm.always || (dm.target ? isUnlocked(skills, SKILL_BY_ID[dm.target]) : false);
                return <div key={i} className={`dia${active ? "" : " dim"}`} style={{ left: dm.x, top: dm.y }} />;
              })}

              {SKILLS.map((s) => {
                const l = skillLevel(skills, s.id);
                const open = isUnlocked(skills, s);
                const dominada = open && l >= MAX_SKILL_LEVEL;
                const sel = selected === s.id;
                const cls = ["node", s.master ? "master" : "", !open ? "locked" : `br-${s.branch}`, dominada ? "dominada" : "", sel ? "sel" : ""].filter(Boolean).join(" ");
                return (
                  <button key={s.id} className={cls} style={{ left: s.x - 52, top: s.y - 52 }} onClick={() => setSelected(s.id)} aria-label={s.name}>
                    <div className="glow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="crest" src={`/skilltree/${s.id}.png`} alt="" draggable={false} />
                    {!open && <div className="lockb">🔒</div>}
                    {!s.master && <div className="lvl">{l}/{MAX_SKILL_LEVEL}</div>}
                    <div className="name">{s.name}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* PANEL */}
          <aside className="glass frame panel">
            <div className="phead">
              <div className="pl">
                <div className="picon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/skilltree/${def.id}.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: selUnlocked ? "drop-shadow(0 3px 5px rgba(0,0,0,.5))" : "grayscale(0.85) brightness(0.55)" }} />
                </div>
                <h3>{def.name}</h3>
              </div>
              <div className="pr"><div className="k">NÍVEL</div><div className="v">{def.master ? (selUnlocked ? "MÁX" : "—") : `${selLvl} / ${MAX_SKILL_LEVEL}`}</div></div>
            </div>
            <p className="pdesc">{def.desc}</p>
            <div className="sep" />
            {!def.master && (
              <div className="block">
                <div className="rowk"><span className="klabel">Nível atual</span><span className="r">{selLvl} / {MAX_SKILL_LEVEL}</span></div>
                <div className="pips">{Array.from({ length: MAX_SKILL_LEVEL }).map((_, i) => <i key={i} className={i < selLvl ? "on" : ""} />)}</div>
              </div>
            )}
            <div className="block">
              <div className="rowk"><span className="klabel">{selMaxed ? "Dominada" : selUnlocked ? "Próximo nível" : "Como liberar"}</span><span className="r">{def.master ? "" : selMaxed ? "5 / 5" : selUnlocked ? `${selLvl + 1} / ${MAX_SKILL_LEVEL}` : ""}</span></div>
              <ul>{selUnlocked ? (selMaxed ? <li>Habilidade dominada! 🏆</li> : <li>{nextBenefit}</li>) : <li>{reqText}</li>}</ul>
            </div>
            <div className="reward">
              <div className="txt">
                <div className="rk">RECOMPENSA AO CONCLUIR (NÍVEL 5)</div>
                <h4>Orientação: {def.name}</h4>
                <p>{rewardDesc}</p>
              </div>
              <div className="tome">📖</div>
            </div>
            <button className="evolve" disabled={!canDoEvolve} onClick={evolve}>
              {evolveLabel}{canDoEvolve && <span className="c">⚡ 1 ENERGIA</span>}
            </button>
          </aside>
        </div>

        {/* FOOTER */}
        <div className="foot">
          <div className="glass cell">
            <div className="lbl">Pontos de Energia</div>
            <div className="enr"><span className="b">⚡</span><span className="n">{energy}</span><span className="t">Ganhe energia treinando<br />e evoluindo na jornada!</span></div>
          </div>
          <div className="glass cell">
            <div className="lbl">Conquistas</div>
            <div className="ach">{["⭐", "📖", "🏆", "🛡️", "🔒"].map((e, i) => (
              <div key={i} className={`m${i < achievementsCount ? "" : " lock"}`}>{i < achievementsCount ? e : "🔒"}</div>
            ))}</div>
          </div>
          <div className="glass cell">
            <div className="lbl">Missões do Terapeuta</div>
            <div className="miss">{missions.map((m, i) => (
              <div key={i} className={`q${m.done ? " done" : ""}`}><span className="bx">{m.done ? "✓" : ""}</span><span>{m.txt}</span><span className="pg">{m.tag}</span></div>
            ))}</div>
          </div>
          <div className="glass cell">
            <div className="lbl">Próxima Recompensa</div>
            <div className="nrew"><span className="chest">🎁</span><span className="t">{missLeft > 0
              ? <>Complete <b>{missLeft} {missLeft === 1 ? "missão" : "missões"}</b> e continue treinando para ganhar mais <b>energia</b>!</>
              : <>Missões de hoje concluídas! 🎉 Continue treinando para subir de nível.</>}</span></div>
          </div>
        </div>
      </div>

      {/* MENTOR / ORIENTAÇÃO */}
      {mentor && mc && mDef && (
        <div className="overlay" onClick={() => setMentor(null)}>
          <div className="glass frame mentor" onClick={(e) => e.stopPropagation()}>
            <span className="ai">✦ Mentor</span><span className="evo">Habilidade evoluída</span>
            <div className="mh">
              <div className="ic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/skilltree/${mDef.id}.png`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div><h2>{mDef.name}</h2><div className="nl">Nível {mentor.level} desbloqueado</div></div>
            </div>
            <p className="grats">Parabéns, {playerName.split(" ")[0]}! Você evoluiu <b>{mDef.name}</b>. Cada nível aqui também é um passo no seu dia real 👇</p>
            <div className="sec"><div className="stt">🧠 O que significa</div><p>{mc.significa}</p></div>
            <div className="sec"><div className="stt">⭐ Por que importa</div><p>{mc.importa}</p></div>
            <div className="sec tip"><div className="stt">💡 Dica prática</div><p>{mc.dica}</p></div>
            <div className="sec chal"><div className="stt">🏆 Mini desafio</div><p>{mc.desafio}</p></div>
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
  --blue-l:#7cb0ff;--purple:#8b5cf6;--purple-l:#b69cff;--gold-l:#fcd34d;--gold-d:#c98a1e;--sub:#9fb0d6;--dim:#5a6d95;
  background:radial-gradient(900px 620px at 50% -6%, rgba(139,92,246,.20), transparent 60%),radial-gradient(760px 560px at 8% 10%, rgba(59,130,246,.14), transparent 55%),radial-gradient(760px 560px at 96% 8%, rgba(245,196,80,.12), transparent 55%),linear-gradient(160deg,#141033 0%,#0d0a24 46%,#080615 100%)}
.st-root .st-app{position:relative;z-index:1;max-width:1300px;margin:0 auto;padding:18px 18px 26px}
.st-root .glass{background:rgba(24,20,54,.55);backdrop-filter:blur(13px);-webkit-backdrop-filter:blur(13px);border:1px solid rgba(180,160,255,.14);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)}
.st-root .frame{border:1px solid rgba(244,196,80,.32);box-shadow:0 0 0 1px rgba(244,196,80,.07) inset, 0 20px 50px rgba(0,0,0,.5)}
.st-root .head{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:14px;padding:4px}
.st-root .usr .nm{font-size:23px;font-weight:800;letter-spacing:2px;font-family:Georgia,serif}
.st-root .usr .lv{font-size:12px;letter-spacing:2px;color:var(--purple-l);font-weight:700;margin:3px 0 5px}
.st-root .usr .xpbar{width:220px;height:9px;border-radius:999px;background:rgba(10,8,26,.8);border:1px solid rgba(180,160,255,.2);overflow:hidden}
.st-root .usr .xpbar i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#b69cff);box-shadow:0 0 14px rgba(139,92,246,.8);transition:width .5s}
.st-root .title{text-align:center}
.st-root .title h1{font-family:Georgia,serif;font-size:24px;letter-spacing:4px;font-weight:700;background:linear-gradient(180deg,#fde9b0,#e0b352);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 10px rgba(224,179,82,.35))}
.st-root .title .flr{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:5px}
.st-root .title .flr .ln{width:110px;height:1px;background:linear-gradient(90deg,transparent,rgba(244,196,80,.6),transparent)}
.st-root .title .flr .d{color:#e0b352;font-size:10px}
.st-root .energy{justify-self:end;display:flex;align-items:center;gap:10px}
.st-root .energy .bolt{font-size:24px;filter:drop-shadow(0 0 10px rgba(139,92,246,.9))}
.st-root .energy .n{font-size:28px;font-weight:900;color:#c9b6ff}
.st-root .energy .lb{font-size:10px;letter-spacing:1.4px;color:var(--sub);font-weight:700;max-width:78px;line-height:1.2}
.st-root .main{display:grid;grid-template-columns:1fr 400px;gap:16px}
.st-root .treewrap{position:relative;padding:14px;overflow:auto;min-height:600px}
.st-root .legend{position:absolute;top:16px;right:20px;display:flex;gap:15px;font-size:11px;color:var(--sub);font-weight:600;z-index:2}
.st-root .legend span{display:flex;align-items:center;gap:6px}.st-root .dot{width:10px;height:10px;border-radius:50%}
.st-root .tree{position:relative;width:760px;height:560px;margin:24px auto 0}
.st-root .tree svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.st-root .ln{fill:none;stroke-width:2.5}
.st-root .l-gold{stroke:url(#stgg);filter:drop-shadow(0 0 5px rgba(244,196,80,.7))}
.st-root .l-blue{stroke:url(#stgb);filter:drop-shadow(0 0 5px rgba(59,130,246,.7))}
.st-root .l-purple{stroke:url(#stgp);filter:drop-shadow(0 0 5px rgba(139,92,246,.7))}
.st-root .l-dim{stroke:#2a2550;stroke-width:2;stroke-dasharray:4 7}
.st-root .dia{position:absolute;width:9px;height:9px;transform:translate(-50%,-50%) rotate(45deg);background:#e0b352;box-shadow:0 0 8px rgba(224,179,82,.8);z-index:1}
.st-root .dia.dim{background:#3a3466;box-shadow:none}
.st-root .node{position:absolute;width:104px;height:104px;cursor:pointer;background:none;border:none;padding:0}
.st-root .node .glow{position:absolute;inset:12px;border-radius:50%;filter:blur(7px);opacity:.7;z-index:0}
.st-root .br-blue .glow{background:radial-gradient(circle,rgba(59,130,246,.55),transparent 70%)}
.st-root .br-purple .glow{background:radial-gradient(circle,rgba(139,92,246,.62),transparent 70%)}
.st-root .br-gold .glow{background:radial-gradient(circle,rgba(244,196,80,.55),transparent 70%)}
.st-root .node.dominada .glow{background:radial-gradient(circle,rgba(252,211,77,.8),transparent 72%);opacity:.95}
.st-root .node.locked .glow{background:radial-gradient(circle,rgba(120,120,160,.22),transparent 70%);opacity:.5}
.st-root .node .crest{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.55))}
.st-root .node.locked .crest{filter:grayscale(.9) brightness(.5) drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.st-root .lockb{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);font-size:22px;z-index:2;opacity:.92;filter:drop-shadow(0 1px 2px #000)}
.st-root .node .oring{position:absolute;inset:-7px;border-radius:50%;border:1.5px solid rgba(244,196,80,.4)}
.st-root .node .top{position:absolute;top:-11px;left:50%;transform:translateX(-50%) rotate(45deg);width:8px;height:8px;background:#e0b352;box-shadow:0 0 6px rgba(224,179,82,.9)}
.st-root .node .ring{position:absolute;inset:0;border-radius:50%;-webkit-mask:radial-gradient(circle,transparent 44px,#000 45px);mask:radial-gradient(circle,transparent 44px,#000 45px)}
.st-root .node .core{position:absolute;inset:6px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;background:radial-gradient(circle at 40% 32%,#241d47,#120e28);border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 2px 12px rgba(0,0,0,.6)}
.st-root .node .lvl{position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-size:11px;font-weight:800;color:#fff;background:rgba(10,8,26,.82);border:1px solid rgba(244,196,80,.45);padding:0 7px;border-radius:999px;z-index:2}
.st-root .node .name{position:absolute;left:50%;top:108px;transform:translateX(-50%);width:172px;text-align:center;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;line-height:1.2}
.st-root .br-blue .ring{background:conic-gradient(var(--blue-l) var(--p,0),rgba(255,255,255,.06) 0)}
.st-root .br-purple .ring{background:conic-gradient(var(--purple-l) var(--p,0),rgba(255,255,255,.06) 0)}
.st-root .br-gold .ring{background:conic-gradient(var(--gold-l) var(--p,0),rgba(255,255,255,.06) 0)}
.st-root .br-blue .core{box-shadow:inset 0 2px 12px rgba(0,0,0,.6),0 0 22px rgba(59,130,246,.5)}
.st-root .br-blue .name{color:#8fb8ff}
.st-root .br-purple .core{box-shadow:inset 0 2px 12px rgba(0,0,0,.6),0 0 26px rgba(139,92,246,.65)}
.st-root .br-purple .name{color:#b8a4ff}
.st-root .br-gold .core{box-shadow:inset 0 2px 12px rgba(0,0,0,.6),0 0 24px rgba(244,196,80,.6)}
.st-root .br-gold .name{color:#f0cd7e}
.st-root .node.dominada .oring{border-color:rgba(252,211,77,.95);box-shadow:0 0 24px rgba(244,196,80,.75)}
.st-root .node.dominada .ring{background:conic-gradient(var(--gold-l) var(--p,0),rgba(255,255,255,.06) 0)}
.st-root .node.sel{transform:scale(1.12);z-index:5}
.st-root .node.sel .glow{opacity:1;filter:blur(11px)}
.st-root .node.sel .core{box-shadow:inset 0 2px 12px rgba(0,0,0,.6),0 0 34px rgba(139,92,246,.95),0 0 0 2px rgba(182,156,255,.6)}
.st-root .node.master .core{font-size:40px;background:radial-gradient(circle at 40% 32%,#4a3a12,#241a06);box-shadow:inset 0 2px 12px rgba(0,0,0,.6),0 0 30px rgba(244,196,80,.75)}
.st-root .node.master .oring{border-color:rgba(252,211,77,.8);box-shadow:0 0 26px rgba(244,196,80,.6)}
.st-root .node.master .name{color:#f0cd7e;letter-spacing:2px}
.st-root .node.locked .core{background:radial-gradient(circle at 40% 32%,#191634,#0f0c22);color:#4a4a6a;font-size:26px}
.st-root .node.master.locked .core{background:radial-gradient(circle at 40% 32%,#3a2f12,#1c1608);color:#caa24a;font-size:30px}
.st-root .node.locked .oring{border-color:rgba(120,120,160,.22)}
.st-root .node.locked .top{background:#3a3466;box-shadow:none}
.st-root .node.locked .name{color:var(--dim)}
.st-root .node.locked .lvl{color:#5a6d95}
.st-root .panel{padding:20px}
.st-root .phead{display:flex;align-items:flex-start;justify-content:space-between}
.st-root .pl{display:flex;gap:14px;align-items:center}
.st-root .picon{width:66px;height:66px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.st-root .pl h3{font-family:Georgia,serif;font-size:23px;letter-spacing:1px;color:#c9b6ff}
.st-root .pr{text-align:right}.st-root .pr .k{font-size:10px;letter-spacing:2px;color:var(--sub)}.st-root .pr .v{font-size:19px;font-weight:900;color:#fcd34d}
.st-root .pdesc{font-size:13px;line-height:1.6;color:#cdd6f2;margin:14px 0 4px}
.st-root .sep{height:1px;background:linear-gradient(90deg,transparent,rgba(244,196,80,.35),transparent);margin:14px 0}
.st-root .block{margin-bottom:6px}
.st-root .rowk{display:flex;justify-content:space-between;align-items:center}
.st-root .klabel{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--sub);font-weight:800}
.st-root .rowk .r{color:#fcd34d;font-weight:900;font-size:13px}
.st-root .pips{display:flex;gap:7px;margin:11px 0 14px}
.st-root .pips i{width:100%;flex:1;height:12px;transform:skewX(-18deg);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08)}
.st-root .pips i.on{background:linear-gradient(90deg,#7c3aed,#b69cff);box-shadow:0 0 10px rgba(139,92,246,.8);border-color:transparent}
.st-root .block ul{list-style:none;margin-top:8px}
.st-root .block li{font-size:13px;color:#d4ddf3;display:flex;gap:8px;line-height:1.5}
.st-root .block li::before{content:"◆";color:var(--purple-l);font-size:9px;margin-top:4px}
.st-root .reward{margin-top:14px;border-radius:14px;padding:13px 14px;background:linear-gradient(135deg,rgba(139,92,246,.14),rgba(244,196,80,.08));border:1px solid rgba(244,196,80,.28);display:flex;gap:14px;align-items:center}
.st-root .reward .rk{font-size:10px;letter-spacing:1.4px;color:var(--sub);font-weight:800}
.st-root .reward h4{font-family:Georgia,serif;font-size:16px;color:#fcd34d;margin:3px 0 5px}
.st-root .reward p{font-size:12px;color:#cdd6f2;line-height:1.45}
.st-root .reward .tome{font-size:40px;filter:drop-shadow(0 6px 14px rgba(139,92,246,.6))}
.st-root .evolve{width:100%;margin-top:16px;border:1px solid rgba(244,196,80,.4);cursor:pointer;border-radius:13px;padding:15px;font-family:Georgia,serif;font-size:16px;letter-spacing:2px;font-weight:700;color:#fff;background:linear-gradient(135deg,#5b21b6,#7c3aed 60%,#8b5cf6);box-shadow:0 12px 30px rgba(124,58,237,.55), inset 0 1px 0 rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;gap:10px}
.st-root .evolve:disabled{opacity:.55;cursor:not-allowed;background:rgba(255,255,255,.06);color:var(--sub);border-color:rgba(255,255,255,.12);box-shadow:none}
.st-root .evolve .c{font-size:12px;letter-spacing:1px;color:#e9d8ff}
.st-root .foot{display:grid;grid-template-columns:1fr 1.1fr 1.35fr 1.1fr;gap:14px;margin-top:16px}
.st-root .cell{padding:15px 16px}
.st-root .cell .lbl{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--sub);font-weight:800;margin-bottom:11px}
.st-root .enr{display:flex;align-items:center;gap:12px}
.st-root .enr .b{font-size:28px;filter:drop-shadow(0 0 10px rgba(139,92,246,.9))}
.st-root .enr .n{font-size:28px;font-weight:900;color:#c9b6ff}
.st-root .enr .t{font-size:11px;color:var(--sub);line-height:1.3}
.st-root .ach{display:flex;gap:9px}
.st-root .ach .m{width:40px;height:44px;display:flex;align-items:center;justify-content:center;font-size:19px;background:linear-gradient(160deg,rgba(139,92,246,.2),rgba(30,25,60,.6));border:1px solid rgba(244,196,80,.3);clip-path:polygon(50% 0,100% 22%,100% 74%,50% 100%,0 74%,0 22%)}
.st-root .ach .m.lock{color:#4a4a6a;border-color:rgba(120,120,160,.2);background:rgba(30,25,60,.5)}
.st-root .miss{display:flex;flex-direction:column;gap:9px}
.st-root .miss .q{display:flex;align-items:center;gap:9px;font-size:12.5px;color:#cdd8f0}
.st-root .miss .q .bx{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--dim);flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}
.st-root .miss .q.done .bx{background:linear-gradient(150deg,#34d399,#059669);border-color:transparent}
.st-root .miss .q .pg{margin-left:auto;font-size:11px;font-weight:800;color:var(--purple-l)}
.st-root .miss .q.done .pg{color:#34d399}
.st-root .nrew{display:flex;align-items:center;gap:12px}
.st-root .nrew .chest{font-size:32px;filter:drop-shadow(0 4px 10px rgba(244,196,80,.5))}
.st-root .nrew .t{font-size:12px;color:#cdd6f2;line-height:1.4}
.st-root .nrew .t b{color:#fcd34d}
.st-root .overlay{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,4,16,.66);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
.st-root .mentor{max-width:560px;width:100%;padding:24px 24px 20px;position:relative;animation:stpop .35s cubic-bezier(.2,1.1,.3,1);max-height:92vh;overflow:auto}
@keyframes stpop{from{transform:scale(.92) translateY(10px);opacity:0}to{transform:none;opacity:1}}
.st-root .mentor .ai{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#241a06;background:linear-gradient(150deg,var(--gold-l),var(--gold-d));padding:4px 11px;border-radius:999px}
.st-root .mentor .evo{font-size:11px;color:var(--purple-l);font-weight:800;letter-spacing:1.4px;text-transform:uppercase;float:right;margin-top:5px}
.st-root .mentor .mh{display:flex;align-items:center;gap:15px;margin:16px 0 6px}
.st-root .mentor .mh .ic{width:66px;height:66px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.st-root .mentor .mh h2{font-family:Georgia,serif;font-size:22px;color:#c9b6ff}
.st-root .mentor .mh .nl{font-size:13px;color:#fcd34d;font-weight:800;margin-top:2px}
.st-root .mentor .grats{font-size:14px;color:#d7e0f5;margin:12px 0 18px;line-height:1.5}
.st-root .sec{border-radius:14px;padding:12px 15px;margin-bottom:11px;border:1px solid rgba(180,160,255,.14);background:rgba(20,16,44,.55)}
.st-root .sec .stt{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--sub);margin-bottom:6px}
.st-root .sec p{font-size:13.5px;line-height:1.55;color:#dbe4f7}
.st-root .sec.tip{background:rgba(59,130,246,.10);border-color:rgba(59,130,246,.3)}
.st-root .sec.tip .stt{color:var(--blue-l)}
.st-root .sec.chal{background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(244,196,80,.12));border-color:rgba(244,196,80,.35)}
.st-root .sec.chal .stt{color:var(--gold-l)}
.st-root .mbtns{display:flex;gap:11px;margin-top:16px}
.st-root .mbtns button{flex:1;border:none;cursor:pointer;border-radius:13px;padding:13px;font-weight:800;font-size:14px}
.st-root .mbtns .ghost{flex:0 0 auto;padding:13px 18px;background:rgba(255,255,255,.06);color:var(--sub);border:1px solid rgba(255,255,255,.1)}
.st-root .mbtns .accept{color:#fff;background:linear-gradient(135deg,#6d28d9,#8b5cf6 60%,#a855f7);box-shadow:0 10px 26px rgba(139,92,246,.5)}
@media(max-width:900px){.st-root .main{grid-template-columns:1fr}.st-root .foot{grid-template-columns:1fr 1fr}}
`;
