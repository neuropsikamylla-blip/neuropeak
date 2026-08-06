"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface DemoPointerProps {
  /** Container que embrulha o alvo; o cursor é posicionado em relação a ele. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Seletor CSS do alvo atual, ou null para esconder o cursor. */
  targetSelector: string | null;
  /** Estado do gesto: aproximando ou pressionando. */
  phase: "moving" | "pressing";
}

interface PointerPosition {
  x: number;
  y: number;
}

const POINTER_SIZE = 28;

export function DemoPointer({ containerRef, targetSelector, phase }: DemoPointerProps) {
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
      className="pointer-events-none absolute left-0 top-0 z-20 text-[#315F88] drop-shadow-md"
      style={{ width: POINTER_SIZE, height: POINTER_SIZE, pointerEvents: "none" }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
      animate={{
        x: position.x - POINTER_SIZE / 2,
        y: position.y - POINTER_SIZE / 2,
        scale: phase === "pressing" ? 0.86 : 1,
        opacity: 1,
      }}
      transition={{
        x: { duration: 0.45, ease: "easeInOut" },
        y: { duration: 0.45, ease: "easeInOut" },
        scale: { duration: phase === "pressing" ? 0.18 : 0.14, ease: "easeInOut" },
        opacity: { duration: 0.14 },
      }}
    >
      <MousePointer2 size={POINTER_SIZE} strokeWidth={1.8} fill="rgba(255,255,255,0.92)" />
    </motion.div>
  );
}
