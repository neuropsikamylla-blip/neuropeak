"use client";

import { forwardRef } from "react";
import { BALL_RADIUS, type Ball } from "@/lib/mot/scene";

export type MOTBallPhase = "memorize" | "track" | "identify";

interface MOTBallProps {
  ball: Ball;
  phase: MOTBallPhase;
  selected: boolean;
  revealTarget: boolean;
  gamified: boolean;
  arenaWidth: number;
  arenaHeight: number;
  onClick: () => void;
}

export const MOTBall = forwardRef<HTMLDivElement, MOTBallProps>(function MOTBall({
  ball,
  phase,
  selected,
  revealTarget,
  gamified,
  arenaWidth,
  arenaHeight,
  onClick,
}, ref) {
  const showTarget = phase === "memorize" && ball.isTarget;

  return (
    <div
      ref={ref}
      data-mot-ball={ball.id}
      style={{
        position: "absolute",
        left: Math.min(Math.max(0, ball.x - BALL_RADIUS), arenaWidth - BALL_RADIUS * 2),
        top: Math.min(Math.max(0, ball.y - BALL_RADIUS), arenaHeight - BALL_RADIUS * 2),
        width: BALL_RADIUS * 2,
        height: BALL_RADIUS * 2,
        ...(phase === "track" ? {} : { transform: "translate(0px, 0px)" }),
        transition: phase === "identify" ? "none" : undefined,
      }}
      className={`flex cursor-pointer select-none items-center justify-center rounded-full border-2 text-xs font-bold ${
        revealTarget ? "border-green-600 bg-green-400" :
        showTarget ? "animate-pulse border-yellow-300 bg-yellow-400" :
        selected ? "border-blue-600 bg-blue-400" :
        gamified ? "border-gray-500 bg-gray-400" : "border-gray-400 bg-gray-300"
      }`}
      onClick={onClick}
    >
      {selected && phase === "identify" ? "✓" : ""}
    </div>
  );
});
