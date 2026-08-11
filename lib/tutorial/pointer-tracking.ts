export interface PointerRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PointerPosition {
  x: number;
  y: number;
}

const TRACKING_MOVE_DURATION_MS = 120;

export function centerRelativeToContainer(
  container: PointerRect,
  target: PointerRect,
): PointerPosition {
  return {
    x: target.left - container.left + target.width / 2,
    y: target.top - container.top + target.height / 2,
  };
}

export function pointerMoveDuration(moveDurationMs: number, hasMeasuredTarget: boolean): number {
  if (!hasMeasuredTarget) return moveDurationMs;
  return Math.min(TRACKING_MOVE_DURATION_MS, moveDurationMs / 2);
}

export function shouldUpdatePointerPosition(
  current: PointerPosition | null,
  next: PointerPosition,
): boolean {
  return current === null || current.x !== next.x || current.y !== next.y;
}
