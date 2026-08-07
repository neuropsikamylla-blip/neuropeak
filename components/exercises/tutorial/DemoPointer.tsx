"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface DemoPointerProps {
  /** Container que embrulha o alvo; o cursor é posicionado em relação a ele. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Seletor CSS do alvo atual, ou null para esconder o cursor. */
  targetSelector: string | null;
  /** Estado do gesto: localizando, aproximando ou pressionando. */
  phase: "locating" | "moving" | "pressing";
  /** Duração do deslocamento até o alvo, definida pela demonstração. */
  moveDurationMs: number;
  /** Duração do pulso inicial de localização, definida pela demonstração. */
  entryPulseDurationMs: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

const POINTER_SIZE = 44;
const HALO_SIZE = POINTER_SIZE * 2;
const RIPPLE_DURATION_MS = 400;
const POINTER_SCALE_TRANSITION_MS = 180;

export function DemoPointer({
  containerRef,
  targetSelector,
  phase,
  moveDurationMs,
  entryPulseDurationMs,
}: DemoPointerProps) {
  const [position, setPosition] = useState<PointerPosition | null>(null);

  useEffect(() => {
    function measureTarget() {
      const container = containerRef.current;
      if (!container || !targetSelector) {
        setPosition(null);
        return;
      }

      const target = container.querySelector<HTMLElement>(targetSelector);
      if (!target) {
        setPosition(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setPosition({
        x: targetRect.left - containerRect.left + targetRect.width / 2,
        y: targetRect.top - containerRect.top + targetRect.height / 2,
      });
    }

    measureTarget();
    window.addEventListener("resize", measureTarget);
    return () => window.removeEventListener("resize", measureTarget);
  }, [containerRef, targetSelector]);

  if (!targetSelector || !position) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-20 text-[#1F3D5C] drop-shadow-[0_4px_4px_rgba(15,23,42,0.45)]"
      style={{
        width: POINTER_SIZE,
        height: POINTER_SIZE,
        pointerEvents: "none",
        transformOrigin: "0 0",
      }}
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
        scale: phase === "pressing" ? 0.86 : 1,
        opacity: 1,
      }}
      transition={{
        x: { duration: moveDurationMs / 1000, ease: "easeInOut" },
        y: { duration: moveDurationMs / 1000, ease: "easeInOut" },
        scale: { duration: POINTER_SCALE_TRANSITION_MS / 1000, ease: "easeInOut" },
      }}
    >
      <motion.span
        className="absolute left-0 top-0 -z-10 rounded-full border border-[#4F8FEA]/35 bg-[#4F8FEA]/15"
        style={{ width: HALO_SIZE, height: HALO_SIZE, x: "-50%", y: "-50%" }}
        animate={phase === "locating"
          ? { scale: [0.72, 1.12, 1], opacity: [0.12, 0.3, 0.18] }
          : { scale: phase === "pressing" ? 0.72 : 1, opacity: 0.18 }}
        transition={{
          duration: (phase === "locating" ? entryPulseDurationMs : POINTER_SCALE_TRANSITION_MS)
            / 1000,
          ease: "easeInOut",
        }}
      />
      {phase === "pressing" && (
        <motion.span
          className="absolute left-0 top-0 -z-10 rounded-full border-2 border-[#4F8FEA]"
          style={{ width: 28, height: 28, x: "-50%", y: "-50%" }}
          initial={{ scale: 0.2, opacity: 0.55 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: RIPPLE_DURATION_MS / 1000, ease: "easeOut" }}
        />
      )}
      <MousePointer2 size={POINTER_SIZE} strokeWidth={2.2} fill="#FFFFFF" />
    </motion.div>
  );
}
