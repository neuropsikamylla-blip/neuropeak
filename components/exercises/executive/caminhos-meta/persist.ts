// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — AUTOSAVE em localStorage (spec §22).
// Chave: np_caminhos_<atividadeId>. Salvo a cada mudança; oferecido na retomada;
// limpo ao concluir a atividade.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlanSnapshot } from "./usePlanState";

const PREFIX = "np_caminhos_";

export interface SavedProgress {
  atividadeId: string;
  snap: PlanSnapshot;
  /** fase 2 (imprevisto) já apresentada? */
  faseImprevisto: boolean;
  dicaNivel: 0 | 1 | 2 | 3;
  tentativas: number;
  ts: number;
}

const key = (id: string) => `${PREFIX}${id}`;

export function salvarProgresso(p: SavedProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(p.atividadeId), JSON.stringify(p));
  } catch {
    /* quota/erro de salvamento — segue sem persistir */
  }
}

export function carregarProgresso(atividadeId: string): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(atividadeId));
    if (!raw) return null;
    const p = JSON.parse(raw) as SavedProgress;
    // sanidade mínima
    if (p && p.atividadeId === atividadeId && p.snap && Array.isArray(p.snap.plano)) return p;
    return null;
  } catch {
    return null;
  }
}

export function limparProgresso(atividadeId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(atividadeId));
  } catch {
    /* ignore */
  }
}
