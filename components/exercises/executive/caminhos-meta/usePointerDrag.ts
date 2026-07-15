// ─────────────────────────────────────────────────────────────────────────────
// Caminhos para a Meta — DRAG & DROP por POINTER EVENTS (spec §5, responsivo/mobile).
//
// NÃO usa HTML5 drag-and-drop (não funciona bem em touch). Em vez disso:
//   • pointerdown num cartão inicia o arraste (após um pequeno limiar de movimento,
//     para não conflitar com o TOQUE-para-ordenar — toque simples continua ordenando);
//   • um "fantasma" segue o dedo/mouse (position: fixed);
//   • no pointerup, o elemento sob o ponto é inspecionado por data-atributos
//     (`data-cm-drop="slot"|"discard"`, `data-cm-pos`) para decidir o destino.
//
// O alvo de soltura é resolvido por elementFromPoint — funciona igual em mouse e touch.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from "react";

export interface DragState {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Alvo sob o dedo DURANTE o arraste (feedback de espaço de destino). */
  hover: { pos: number; after: boolean } | null;
}

export type DropTarget =
  | { kind: "slot"; pos: number; after?: boolean }
  | { kind: "discard" }
  | { kind: "pool" }
  | null;

const THRESHOLD = 6; // px de movimento para caracterizar arraste (senão é toque)

export function usePointerDrag(onDrop: (id: string, target: DropTarget) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const startRef = useRef<{ x: number; y: number; id: string; label: string } | null>(null);
  const movedRef = useRef(false);
  const activeRef = useRef(false);

  const resolveTarget = useCallback((x: number, y: number): DropTarget => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const host = el?.closest<HTMLElement>("[data-cm-drop]");
    if (!host) return null;
    const kind = host.getAttribute("data-cm-drop");
    if (kind === "slot") {
      const pos = Number(host.getAttribute("data-cm-pos"));
      if (!Number.isFinite(pos)) return null;
      // metade de baixo do cartão = soltar DEPOIS dele (inserção em lista única)
      const r = host.getBoundingClientRect();
      return { kind: "slot", pos, after: y > r.top + r.height / 2 };
    }
    if (kind === "discard") return { kind: "discard" };
    if (kind === "pool") return { kind: "pool" };
    return null;
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!movedRef.current && Math.hypot(dx, dy) < THRESHOLD) return;
      movedRef.current = true;
      activeRef.current = true;
      const t = resolveTarget(e.clientX, e.clientY);
      const hover = t?.kind === "slot" ? { pos: t.pos, after: !!t.after } : null;
      setDrag({ id: start.id, x: e.clientX, y: e.clientY, label: start.label, hover });
    },
    [resolveTarget]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      const start = startRef.current;
      startRef.current = null;
      const wasDrag = movedRef.current;
      movedRef.current = false;
      activeRef.current = false;
      setDrag(null);
      if (start && wasDrag) {
        const target = resolveTarget(e.clientX, e.clientY);
        onDrop(start.id, target);
      }
    },
    [onPointerMove, onDrop, resolveTarget]
  );

  /** Ligue ao onPointerDown de um cartão arrastável. Retorna se virou arraste. */
  const startDrag = useCallback(
    (id: string, label: string, e: React.PointerEvent) => {
      startRef.current = { x: e.clientX, y: e.clientY, id, label };
      movedRef.current = false;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  /** true enquanto um arraste real (com movimento) está em curso. */
  const isDragging = drag != null;

  return { drag, isDragging, startDrag };
}
