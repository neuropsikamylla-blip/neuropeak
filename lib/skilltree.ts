// ── Árvore de Habilidades (Jornada) ─────────────────────────────────────────
// Gamificação estilo RPG para adolescentes/jovens adultos. O XP vem das sessões
// reais do paciente; ao subir de nível ele ganha Skill Points para investir na
// árvore. Cada habilidade tem 5 níveis. Estado da árvore no localStorage.

export type Branch = "blue" | "purple" | "gold";
export type SkillId =
  | "organizacao" | "foco" | "criatividade"
  | "planejamento" | "disciplina" | "inovacao"
  | "gestao" | "persistencia" | "resolucao"
  | "mestre";

export interface SkillDef {
  id: SkillId;
  name: string;
  icon: string;
  branch: Branch;
  tag: string;
  desc: string;
  benefits: string[];        // benefícios ganhos ao subir para cada nível (1..5)
  parent?: SkillId;          // habilidade que precisa estar evoluída para liberar
  reqParentLevel?: number;   // nível necessário no pai
  x: number; y: number;      // centro do nó no layout (árvore 760×560)
  master?: boolean;          // ápice da árvore
}

export const MAX_SKILL_LEVEL = 5;

export const SKILLS: SkillDef[] = [
  { id: "mestre", name: "Mestre", icon: "👑", branch: "gold", master: true, x: 380, y: 46,
    tag: "Objetivo final",
    desc: "O ápice da jornada. Leve Organização, Foco e Criatividade ao nível máximo para desbloquear o título de Mestre.",
    benefits: ["Título de Mestre e emblema exclusivo"] },

  { id: "organizacao", name: "Organização", icon: "🗂️", branch: "blue", x: 130, y: 180,
    tag: "Habilidade · Executiva",
    desc: "Estruture tarefas e materiais para reduzir a sobrecarga mental e encontrar o que precisa com rapidez.",
    benefits: ["Menos esquecimentos no dia a dia", "+10% de eficiência ao iniciar tarefas", "Rotina mais previsível", "Libera o ramo Planejamento", "Organização automática vira hábito"] },
  { id: "foco", name: "Foco", icon: "🎯", branch: "purple", x: 380, y: 180,
    tag: "Habilidade · Atenção",
    desc: "Mantenha a atenção nas tarefas e reduza distrações. Quanto maior o nível, mais tempo você sustenta a concentração.",
    benefits: ["Menos distrações nas tarefas curtas", "+15% de constância nas sessões", "Sustenta o foco por mais tempo", "Libera desafios de foco prolongado", "Concentração profunda sob demanda"] },
  { id: "criatividade", name: "Criatividade", icon: "💡", branch: "gold", x: 630, y: 180,
    tag: "Habilidade · Cognição",
    desc: "Encontre novas soluções e conexões originais para os problemas do dia a dia.",
    benefits: ["Mais ideias por sessão", "+10% de fluência criativa", "Conecta ideias distantes", "Libera o ramo Inovação", "Soluções originais viram natural"] },

  { id: "planejamento", name: "Planejamento", icon: "🗓️", branch: "blue", x: 130, y: 330,
    parent: "organizacao", reqParentLevel: 3,
    tag: "Habilidade · Executiva",
    desc: "Antecipe passos e prazos para chegar aos seus objetivos sem correria.",
    benefits: ["Visão dos próximos passos", "+12% de cumprimento de metas", "Prioriza o que importa", "Libera Gestão do Tempo", "Planos que se cumprem sozinhos"] },
  { id: "disciplina", name: "Disciplina", icon: "⏳", branch: "purple", x: 380, y: 330,
    parent: "foco", reqParentLevel: 3,
    tag: "Habilidade · Autocontrole",
    desc: "Mantenha a rotina mesmo quando a motivação cai. Constância vence intensidade.",
    benefits: ["Começa mesmo sem vontade", "+8% de adesão à rotina", "Hábitos mais estáveis", "Libera Persistência", "Autocontrole de mestre"] },
  { id: "inovacao", name: "Inovação", icon: "🚀", branch: "gold", x: 630, y: 330,
    parent: "criatividade", reqParentLevel: 3,
    tag: "Habilidade · Cognição",
    desc: "Transforme ideias em soluções que você aplica de verdade.",
    benefits: ["Testa ideias na prática", "+10% de iniciativa", "Melhora o que já existe", "Libera Resolução de Problemas", "Inova como rotina"] },

  { id: "gestao", name: "Gestão do Tempo", icon: "⏱️", branch: "blue", x: 130, y: 480,
    parent: "planejamento", reqParentLevel: 3,
    tag: "Habilidade · Executiva",
    desc: "Distribua seu tempo entre o que é urgente e o que é importante, sem se perder.",
    benefits: ["Menos correria de última hora", "+12% de aproveitamento do dia", "Blocos de tempo protegidos", "Equilíbrio entre tarefas", "Domínio total da agenda"] },
  { id: "persistencia", name: "Persistência", icon: "🔥", branch: "purple", x: 380, y: 480,
    parent: "disciplina", reqParentLevel: 3,
    tag: "Habilidade · Autocontrole",
    desc: "Continue mesmo diante de obstáculos e frustrações. Recomeçar faz parte.",
    benefits: ["Recupera-se de recaídas", "+10% de resiliência", "Sustenta metas longas", "Encara desafios difíceis", "Nunca desiste fácil"] },
  { id: "resolucao", name: "Resolução de Problemas", icon: "🧩", branch: "gold", x: 630, y: 480,
    parent: "inovacao", reqParentLevel: 3,
    tag: "Habilidade · Cognição",
    desc: "Quebre problemas complexos em passos possíveis e chegue à solução.",
    benefits: ["Enxerga o problema por partes", "+12% de assertividade", "Escolhe melhores estratégias", "Resolve sob pressão", "Soluciona quase tudo"] },
];

export const SKILL_BY_ID: Record<SkillId, SkillDef> =
  SKILLS.reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<SkillId, SkillDef>);

// ── XP e nível ──────────────────────────────────────────────────────────────
/** XP necessário para ir do nível `level` ao `level+1`. */
export function xpForLevel(level: number): number { return 120 + (level - 1) * 20; }

export interface LevelInfo { level: number; into: number; forNext: number; pct: number; }
export function levelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let rem = Math.max(0, Math.floor(totalXp));
  while (level < 99 && rem >= xpForLevel(level)) { rem -= xpForLevel(level); level++; }
  const forNext = xpForLevel(level);
  return { level, into: rem, forNext, pct: Math.min(100, Math.round((rem / forNext) * 100)) };
}

/** Skill Points ganhos no total (1 por nível alcançado). */
export function skillPointsEarned(level: number): number { return level; }

// ── Estado da árvore (localStorage por paciente) ────────────────────────────
export type SkillLevels = Partial<Record<SkillId, number>>;
const storageKey = (patientId: string) => `np_skills_${patientId}`;

export function loadSkills(patientId: string): SkillLevels {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(storageKey(patientId)); if (raw) return JSON.parse(raw) as SkillLevels; }
  catch { /* ignore */ }
  return {};
}
export function saveSkills(patientId: string, s: SkillLevels): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(storageKey(patientId), JSON.stringify(s)); } catch { /* ignore */ }
}

// XP em cache no cliente (otimista). A página /jornada reconcilia com o valor
// real do servidor ao carregar (chama saveXp com a soma das sessões). Serve para
// o "flash de XP" no fim do treino saber o total sem buscar no servidor.
const xpKey = (patientId: string) => `np_xp_${patientId}`;
export function loadXp(patientId: string): number {
  if (typeof window === "undefined") return 0;
  try { const r = localStorage.getItem(xpKey(patientId)); if (r) return parseInt(r, 10) || 0; } catch { /* ignore */ }
  return 0;
}
export function saveXp(patientId: string, xp: number): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(xpKey(patientId), String(Math.max(0, Math.round(xp)))); } catch { /* ignore */ }
}

// Cada domínio cognitivo desenvolve uma competência da Jornada (usado no flash de XP).
export const DOMAIN_SKILL: Record<string, { skill: string; icon: string; branch: Branch }> = {
  attention:  { skill: "Foco", icon: "🎯", branch: "purple" },
  processing: { skill: "Foco", icon: "🎯", branch: "purple" },
  memory:     { skill: "Organização", icon: "🗂️", branch: "blue" },
  executive:  { skill: "Organização", icon: "🗂️", branch: "blue" },
  functional: { skill: "Criatividade", icon: "💡", branch: "gold" },
};

export function skillLevel(s: SkillLevels, id: SkillId): number { return s[id] ?? 0; }
export function spentPoints(s: SkillLevels): number {
  return SKILLS.reduce((sum, def) => sum + skillLevel(s, def.id), 0);
}

/** Uma habilidade está liberada (pode evoluir)? Raízes sempre; filhas exigem o pai; Mestre exige os 3 ramos no máximo. */
export function isUnlocked(s: SkillLevels, def: SkillDef): boolean {
  if (def.master) {
    return ["organizacao", "foco", "criatividade"].every(
      (r) => skillLevel(s, r as SkillId) >= MAX_SKILL_LEVEL
    );
  }
  if (!def.parent) return true;
  return skillLevel(s, def.parent) >= (def.reqParentLevel ?? 3);
}

export function canEvolve(s: SkillLevels, def: SkillDef, available: number): boolean {
  return isUnlocked(s, def) && skillLevel(s, def.id) < MAX_SKILL_LEVEL && available >= 1;
}
