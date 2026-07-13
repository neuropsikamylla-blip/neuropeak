// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — estado do PLANO com desfazer/refazer (spec §5, §13).
//
// Um snapshot do plano do paciente é { plano, descartadas, selecionadas }:
//   • plano       — vetor de espaços numerados; cada posição guarda um id de ação ou null.
//   • descartadas — ações mandadas para "Não faz parte do plano" (modo intruso).
//   • selecionadas— ações marcadas como prioritárias (modo prioridade).
//
// Toda mutação empilha o snapshot anterior (undo/redo por pilha de estados).
// A interação primária é TOCAR-PARA-ORDENAR; drag & drop e setas ↑/↓ operam
// sobre o mesmo estado (formas equivalentes, spec §5).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from "react";

export interface PlanSnapshot {
  /** Espaços numerados (1-based na UI); null = espaço livre. */
  plano: (string | null)[];
  /** Ações descartadas (não faz parte do plano). */
  descartadas: string[];
  /** Ações selecionadas como prioritárias (modo prioridade). */
  selecionadas: string[];
}

export interface PlanStateApi {
  snap: PlanSnapshot;
  /** Ações que ainda não foram posicionadas/descartadas/selecionadas. */
  disponiveis: (todos: string[]) => string[];
  /** ids atualmente no plano (sem os null). */
  noPlano: string[];
  canUndo: boolean;
  canRedo: boolean;
  /** Nº total de mutações aplicadas (proxy de "trocas/alterações" para o registro). */
  mutacoes: number;
  // ── operações (cada uma empilha undo) ──
  colocarNoProximoLivre: (id: string) => void;
  colocarNaPosicao: (id: string, pos: number) => void;
  removerDoPlano: (id: string) => void;
  moverParaCima: (pos: number) => void;
  moverParaBaixo: (pos: number) => void;
  descartar: (id: string) => void;
  restaurarDescartada: (id: string) => void;
  toggleSelecionada: (id: string, limite: number) => void;
  limpar: () => void;
  undo: () => void;
  redo: () => void;
  /** Reinicia o estado (nova atividade) — NÃO preserva histórico. */
  reset: (inicial: PlanSnapshot) => void;
  /** Substitui o snapshot preservando o histórico (ex.: retomada de autosave). */
  hidratar: (s: PlanSnapshot) => void;
}

function clone(s: PlanSnapshot): PlanSnapshot {
  return { plano: [...s.plano], descartadas: [...s.descartadas], selecionadas: [...s.selecionadas] };
}

/** Estado inicial: `tamanho` espaços vazios (0 = sem espaços de ordem, ex. prioridade pura). */
export function snapshotInicial(tamanho: number): PlanSnapshot {
  return { plano: Array<string | null>(Math.max(0, tamanho)).fill(null), descartadas: [], selecionadas: [] };
}

export function usePlanState(inicial: PlanSnapshot): PlanStateApi {
  const [snap, setSnap] = useState<PlanSnapshot>(() => clone(inicial));
  const undoStack = useRef<PlanSnapshot[]>([]);
  const redoStack = useRef<PlanSnapshot[]>([]);
  const mutRef = useRef(0);
  const [, force] = useState(0);

  // aplica uma transformação empilhando o estado anterior para desfazer.
  const commit = useCallback((fn: (s: PlanSnapshot) => PlanSnapshot) => {
    setSnap((prev) => {
      const next = fn(clone(prev));
      undoStack.current.push(clone(prev));
      redoStack.current = [];
      mutRef.current += 1;
      return next;
    });
    force((n) => n + 1);
  }, []);

  const noPlano = snap.plano.filter((x): x is string => x != null);

  const disponiveis = useCallback(
    (todos: string[]) => {
      const usados = new Set<string>([...noPlano, ...snap.descartadas]);
      return todos.filter((id) => !usados.has(id));
    },
    [noPlano, snap.descartadas]
  );

  const colocarNoProximoLivre = useCallback(
    (id: string) =>
      commit((s) => {
        if (s.plano.includes(id)) return s;
        const livre = s.plano.indexOf(null);
        if (livre === -1) return s; // plano cheio — ignora
        s.plano[livre] = id;
        s.descartadas = s.descartadas.filter((d) => d !== id);
        return s;
      }),
    [commit]
  );

  const colocarNaPosicao = useCallback(
    (id: string, pos: number) =>
      commit((s) => {
        if (pos < 0 || pos >= s.plano.length) return s;
        // remove o id de onde estiver
        const antes = s.plano.indexOf(id);
        if (antes >= 0) s.plano[antes] = null;
        s.descartadas = s.descartadas.filter((d) => d !== id);
        const ocupante = s.plano[pos];
        if (ocupante != null && antes >= 0) {
          // troca posições (arrastar um sobre o outro)
          s.plano[antes] = ocupante;
        } else if (ocupante != null) {
          // empurra o ocupante para o primeiro espaço livre
          const livre = s.plano.indexOf(null);
          if (livre >= 0) s.plano[livre] = ocupante;
        }
        s.plano[pos] = id;
        return s;
      }),
    [commit]
  );

  const removerDoPlano = useCallback(
    (id: string) =>
      commit((s) => {
        const i = s.plano.indexOf(id);
        if (i >= 0) s.plano[i] = null;
        return s;
      }),
    [commit]
  );

  const moverParaCima = useCallback(
    (pos: number) =>
      commit((s) => {
        if (pos <= 0 || pos >= s.plano.length) return s;
        [s.plano[pos - 1], s.plano[pos]] = [s.plano[pos], s.plano[pos - 1]];
        return s;
      }),
    [commit]
  );

  const moverParaBaixo = useCallback(
    (pos: number) =>
      commit((s) => {
        if (pos < 0 || pos >= s.plano.length - 1) return s;
        [s.plano[pos + 1], s.plano[pos]] = [s.plano[pos], s.plano[pos + 1]];
        return s;
      }),
    [commit]
  );

  const descartar = useCallback(
    (id: string) =>
      commit((s) => {
        const i = s.plano.indexOf(id);
        if (i >= 0) s.plano[i] = null;
        if (!s.descartadas.includes(id)) s.descartadas.push(id);
        return s;
      }),
    [commit]
  );

  const restaurarDescartada = useCallback(
    (id: string) =>
      commit((s) => {
        s.descartadas = s.descartadas.filter((d) => d !== id);
        return s;
      }),
    [commit]
  );

  const toggleSelecionada = useCallback(
    (id: string, limite: number) =>
      commit((s) => {
        if (s.selecionadas.includes(id)) {
          s.selecionadas = s.selecionadas.filter((x) => x !== id);
        } else if (s.selecionadas.length < limite) {
          s.selecionadas.push(id);
        }
        return s;
      }),
    [commit]
  );

  const limpar = useCallback(
    () =>
      commit((s) => {
        s.plano = s.plano.map(() => null);
        s.descartadas = [];
        s.selecionadas = [];
        return s;
      }),
    [commit]
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setSnap((cur) => {
      redoStack.current.push(clone(cur));
      return prev;
    });
    force((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    setSnap((cur) => {
      undoStack.current.push(clone(cur));
      return next;
    });
    force((n) => n + 1);
  }, []);

  const reset = useCallback((novo: PlanSnapshot) => {
    undoStack.current = [];
    redoStack.current = [];
    mutRef.current = 0;
    setSnap(clone(novo));
    force((n) => n + 1);
  }, []);

  const hidratar = useCallback((s: PlanSnapshot) => {
    setSnap(clone(s));
    force((n) => n + 1);
  }, []);

  return {
    snap,
    disponiveis,
    noPlano,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    mutacoes: mutRef.current,
    colocarNoProximoLivre,
    colocarNaPosicao,
    removerDoPlano,
    moverParaCima,
    moverParaBaixo,
    descartar,
    restaurarDescartada,
    toggleSelecionada,
    limpar,
    undo,
    redo,
    reset,
    hidratar,
  };
}
