"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  theme?: "clinical" | "colorful" | "gamified";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreDisplay({
  score,
  maxScore = 100,
  label,
  theme = "clinical",
  size = "md",
  className,
}: ScoreDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const color = percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red";

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const colorClasses = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  if (theme === "gamified") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className="relative">
          <motion.div
            className="text-5xl font-black text-cyan-400 tabular-nums"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {score.toFixed(0)}
            <span className="text-2xl text-cyan-600">/{maxScore}</span>
          </motion.div>
          {percentage >= 80 && (
            <motion.div
              className="absolute -inset-2 bg-cyan-400/20 rounded-lg blur-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        {label && <p className="text-gray-400 text-sm mt-1 tracking-wide uppercase">{label}</p>}
      </div>
    );
  }

  if (theme === "colorful") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <motion.div
          className="relative w-24 h-24"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={percentage >= 80 ? "#a855f7" : percentage >= 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-purple-700">{percentage}%</span>
          </div>
        </motion.div>
        {label && <p className="text-purple-600 font-medium text-sm mt-2">{label}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <motion.div
        className={cn("font-bold tabular-nums", sizeClasses[size], colorClasses[color])}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {score.toFixed(0)}
      </motion.div>
      {label && <p className="text-gray-500 text-sm mt-1">{label}</p>}
    </div>
  );
}

interface XPBarProps {
  xp: number;
  maxXp: number;
  level: number;
}

export function XPBar({ xp, maxXp, level }: XPBarProps) {
  const percentage = (xp / maxXp) * 100;

  return (
    <div className="bg-gray-800 rounded-xl p-3 border border-cyan-500/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-cyan-400 font-bold text-sm">NÍVEL {level}</span>
        <span className="text-gray-400 text-xs">
          {xp}/{maxXp} XP
        </span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
