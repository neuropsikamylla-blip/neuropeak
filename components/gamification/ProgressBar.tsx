"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "blue" | "purple" | "green" | "orange" | "cyan";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const colorMap = {
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
  green: "from-green-400 to-green-600",
  orange: "from-orange-400 to-orange-600",
  cyan: "from-cyan-400 to-cyan-600",
};

const sizeMap = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = "blue",
  size = "md",
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-sm font-bold text-gray-900">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeMap[size])}>
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", colorMap[color])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
